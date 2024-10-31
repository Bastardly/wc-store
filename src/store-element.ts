export class StoreElement extends HTMLElement {
  controller = new AbortController();

  disconnectedCallback() {
    this.controller.abort();
  }
}
