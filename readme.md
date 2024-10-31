# WC Store
Work in progress - it will be awesome

## Example
Note npm package not released yet

```TypeScript
import { Store, define, StoreElement } from "@flemminghansen/wc-store";

const store = new Store({ loadStatus: "unloaded" });

define(
  "my-app",
  class extends StoreElement {
    constructor() {
      super();

      store.subscribe(this.controller.signal, (newState, oldState) => {
        if (newState.loadStatus !== oldState?.["loadStatus"]) {
            const p = document.createElement("p");
            p.innerText = "Our page is fully loaded";

            this.appendChild(p);
        }
      });
    }

    defer(timeMs: number) {
        return new Promise((resolve) => setTimeout(resolve, timeMs));

    }

    async render() {
        this.defer(500);
        this.innerHTML = `<h3>Welcome!</h3>`;
        this.defer(500);
        store.setState({ loadStatus: "Loaded" }); // Adds the paragraph
    }

    connectedCallback() {
        this.innerHTML = `<h3>LOADING</h3>`;
        this.render();
    }
  }
);

```