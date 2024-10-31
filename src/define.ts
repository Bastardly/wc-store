/**
 * define helps defining custom components:
 * define('custom-name', class extends HTMLElement { ... })
 * @returns {string} name used to define custom component
 * @example 
 * import { define } from "@flemminghansen/wc-store";

 * define("hello-world", class extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = "<div>Hello world!</div>";
    }
})
 * 
 * The define helper only define the custom element if it does not already exist. 
 * Otherwise, it will be ignored. Once the component is defined, we can access it anywhere 
 * in the DOM by its given name.
 * 
 * @example
 * <hello-world></hello-world>
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
