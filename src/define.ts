/**
 * define helps defining custom components:
 * define('custom-name', class extends ShadowElement { ... })
 * @returns {string} name used to define custom component
 * @example 
 * import { define, ShadowElement } from "@ognaf/core";

 * define("hello-world", class extends ShadowElement {
    constructor() {
        super();
        this.shadow.innerHTML = "<div>Hello world!</div>";
    }
})
 * 
 * The define helper only define the custom element if it does not already exist. 
 * Otherwise, it will be ignored. Once the component is defined, we can access it anywhere 
 * in the DOM by its given name.
 * 
 * @example
 * <my-component></my-component>
 */
export function define(
  name: string,
  webcomponentClass: CustomElementConstructor,
  options?: ElementDefinitionOptions
) {
  if (!window.customElements?.get(name)) {
    window.customElements.define(name, webcomponentClass, options);
  }

  return name;
}
