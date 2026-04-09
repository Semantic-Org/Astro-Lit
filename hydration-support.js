// @ts-check
//
// This module is only loaded when Lit doesn't handle deferred hydration
// natively (checked at build time in src/index.ts). The structural patches
// (shadow root reuse, defer-hydration attribute observation) are set up by
// the inline hydration-support-global.js. This module adds the render-time
// patches that need lit-html imports.

import { LitElement } from 'lit';
import { render } from 'lit-html';
import { hydrate } from '@lit-labs/ssr-client';

// Patch update() to use hydrate() on first render when a DSD shadow root
// exists, and to do a clean replace when the SSR output can't match the
// client render. Workaround for lit/lit#4822.

const origUpdate = Object.getPrototypeOf(LitElement.prototype).update;

function replaceSSRContent(element, templateResult) {
	const root = element.shadowRoot;
	root.replaceChildren();

	const ctor = /** @type {typeof LitElement} */ (element.constructor);
	if (ctor.elementStyles) {
		const sheets = [];
		for (const s of ctor.elementStyles) {
			if (s instanceof CSSStyleSheet) {
				sheets.push(s);
			} else if (s.styleSheet) {
				sheets.push(s.styleSheet);
			}
		}
		if (sheets.length) {
			root.adoptedStyleSheets = sheets;
		}
	}

	// Reset renderBefore since we cleared the shadow root
	element.renderOptions.renderBefore = root.firstChild;
	element.__childPart = render(templateResult, root, element.renderOptions);
}

// The SSR renderer only has access to reflected attributes. If any non-
// reflected property holds a value that would change the render output
// compared to the default, hydrate() will hit a mismatch. Similarly, if
// the shadow root contains child elements with defer-hydration, the SSR'd
// DOM structure won't match the client's template expectations.
function canHydrate(element) {
	// Shadow root contains deferred children whose DOM won't match
	if (element.shadowRoot?.querySelector('[defer-hydration]')) return false;

	// Check non-reflected properties for non-default values. These couldn't
	// be serialized to HTML, so the SSR output used defaults only.
	const ctor = /** @type {typeof LitElement} */ (element.constructor);
	if (ctor.elementProperties) {
		for (const [name, options] of ctor.elementProperties) {
			if (options.reflect) continue;
			const value = element[name];
			if (value === undefined || value === null || value === '' || value === false) continue;
			if (Array.isArray(value) && value.length === 0) continue;
			if (typeof value === 'function') return false;
			if (Array.isArray(value) && value.length > 0) return false;
			if (typeof value === 'object' && Object.keys(value).length > 0) return false;
		}
	}

	return true;
}

LitElement.prototype.update = function update(changedProperties) {
	const templateResult = this.render();
	origUpdate.call(this, changedProperties);

	if (this._$AG) {
		this._$AG = false;

		if (canHydrate(this)) {
			for (let i = this.attributes.length - 1; i >= 0; i--) {
				const attr = this.attributes[i];
				if (attr.name.startsWith('hydrate-internals-')) {
					this.removeAttribute(attr.name.slice(18));
					this.removeAttribute(attr.name);
				}
			}
			this.__childPart = hydrate(templateResult, this.renderRoot, this.renderOptions);
		} else {
			replaceSSRContent(this, templateResult);
		}
	} else {
		this.__childPart = render(templateResult, this.renderRoot, this.renderOptions);
	}
};

// Remove defer-hydration from SSR'd elements so they can initialize.
// queueMicrotask so inline scripts that set properties run first.
// Guard against server-side execution where document doesn't exist.
if (typeof document !== 'undefined') {
	queueMicrotask(() => {
		const deferred = document.querySelectorAll('[defer-hydration]');
		if (deferred.length === 0) return;
		deferred.forEach((el) => {
			el.removeAttribute('defer-hydration');
		});
	});
}
