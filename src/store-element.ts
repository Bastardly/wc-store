import { ExtendedHTMLElement } from "./extended-html-element";

export class StoreElement extends ExtendedHTMLElement {
  controller = new AbortController();

  get signal() {
    return this.controller.signal;
  }

  disconnectedCallback() {
    this.controller.abort();
  }
}
