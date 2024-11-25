# WC Store
Work in progress - it will be awesome

## Example
```TypeScript
import { Store, define, StoreElement } from "@flemminghansen/wc-store";

interface IState {
  loadStatus: "loaded" | "unloaded";
  style: Partial<CSSStyleDeclaration>;
}

const initialState: IState = {
  loadStatus: "unloaded",
  style: {
    color: "#000",
    border: "none",
  },
};

const actionMap = {
  changeLoadStatus: (payload: IState["loadStatus"]) => {
    return { loadStatus: payload };
  },
  changeStyle: (payload: IState) => {
    return { style: payload };
  },
  changeColor: (payload: IState['style']["color"], state: IState) => {
    return {
      style: {
        ...state.style,
        color: payload,
      },
    };
  },
};

const store = new Store<IState, typeof actionMap>(initialState, actionMap);

// ShadowElement is an extended HTMLElement which uses shadowDom and was a few methods like shadowSelector and getTemplate
define(
  "my-app",
  class extends StoreElement {
    p = document.createElement("p");

    constructor() {
      super();

      // Here we subscribe to store changes. Then we can compare the changes we want, and fully control how we update our component
      // The StoreElement class automatically unsubscribe if unmounted.
      store.subscribe(this.controller.signal, (newState, oldState) => {
        // If condition is met, we add an update to our dom.
        if (
          newState.loadStatus === "loaded" &&
          oldState.loadStatus !== "loaded"
        ) {
          this.p.innerText = "Our page is fully loaded";

          this.appendChild(this.p);
        }

        this.p.style.color = newState.style.color;
      });
    }

    defer(timeMs: number) {
      return new Promise((resolve) => setTimeout(resolve, timeMs));
    }

    async asyncRender() {
      this.innerHTML = `<h3>LOADING</h3>`;
      await this.defer(1500);
      this.innerHTML = `<h3>Welcome!</h3>`;
      await this.defer(1000);
      store.update("changeLoadStatus", "loaded");
      await this.defer(1000);
      store.update("changeStyle", {
        border: "1px solid #eee",
        color: "transparent",
      });
      await this.defer(200);
      store.update("changeColor", "green");
    }

    connectedCallback() {
      this.asyncRender();
    }
  }
);

```