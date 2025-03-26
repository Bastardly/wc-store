export class StoreElement extends HTMLElement {
  controller = new AbortController();

  get signal() {
    return this.controller.signal;
  }

  disconnectedCallback() {
    this.controller.abort();
  }
}
