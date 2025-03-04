const addSlotAttrsToHtmlString = (slotName, html) => {
  const templ = document.createElement("template");
  templ.innerHTML = html;
  Array.from(templ.content.children).forEach((node) => {
    node.setAttribute("slot", slotName);
  });
  return templ.innerHTML;
};
var client_default = (element) => async (Component, props, { default: defaultChildren, ...slotted }) => {
  let component = element.children[0];
  const isClientOnly = element.getAttribute("client") === "only";
  if (isClientOnly) {
    component = new Component();
    const otherSlottedChildren = Object.entries(slotted).map(([slotName, htmlStr]) => addSlotAttrsToHtmlString(slotName, htmlStr)).join("");
    component.innerHTML = `${defaultChildren ?? ""}${otherSlottedChildren}`;
    element.appendChild(component);
    for (let [name, value] of Object.entries(props)) {
      if (!(name in Component.prototype)) {
        component.setAttribute(name, value);
      }
    }
  }
  if (!component || !(component.hasAttribute("defer-hydration") || isClientOnly)) {
    return;
  }
  for (let [name, value] of Object.entries(props)) {
    if (name in Component.prototype) {
      component[name] = value;
    }
  }
  component.removeAttribute("defer-hydration");
};
export {
  client_default as default
};
