// Inline script that sets up globalThis.litElementHydrateSupport synchronously.
// This MUST run before any module script that imports 'lit', because LitElement
// checks for this global during class definition and it's a one-shot opportunity.
//
// This sets up the STRUCTURAL patches (shadow root reuse, defer-hydration).
// The RENDER patches (hydrate vs render on update) must be loaded from the same
// <script> as the component library to share the same Lit instance — see
// hydration-support.js.
"use strict";
globalThis.litElementHydrateSupport = function(ref) {
  var LitElement = ref.LitElement;

  // Make LitElement observe the defer-hydration attribute
  var origObserved = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(LitElement), 'observedAttributes'
  ).get;
  Object.defineProperty(LitElement, 'observedAttributes', {
    get: function() { return [].concat(origObserved.call(this), ['defer-hydration']); }
  });

  // Defer connectedCallback when defer-hydration is present
  var origConnected = LitElement.prototype.connectedCallback;
  LitElement.prototype.connectedCallback = function() {
    if (!this.hasAttribute('defer-hydration')) origConnected.call(this);
  };

  // Resume hydration when defer-hydration attribute is removed
  var origAttrChanged = LitElement.prototype.attributeChangedCallback;
  LitElement.prototype.attributeChangedCallback = function(name, oldVal, newVal) {
    if (name === 'defer-hydration' && newVal === null) origConnected.call(this);
    origAttrChanged.call(this, name, oldVal, newVal);
  };

  // Reuse existing DSD shadow root instead of calling attachShadow
  var origCreateRenderRoot = LitElement.prototype.createRenderRoot;
  LitElement.prototype.createRenderRoot = function() {
    if (this.shadowRoot) {
      this._$AG = true;
      return this.shadowRoot;
    }
    return origCreateRenderRoot.call(this);
  };
};
