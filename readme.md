# WC Store

[![npm version](https://badge.fury.io/js/@flemminghansen%2Fwc-store.svg)](https://badge.fury.io/js/@flemminghansen%2Fwc-store)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

`WC Store` is a lightweight, reactive state management solution designed for seamless integration with web components. It leverages JavaScript's `WeakMap` to encapsulate state, track changes, and provide the option to persist through `localStorage` or `sessionStorage`. The library is published as an npm package under the name `@flemminghansen/wc-store`.

---

## Table of Contents

- [WC Store](#wc-store)
  - [Overview](#overview)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Installation](#installation)
  - [Quick Start](#quick-start)
    - [Creating a Store](#creating-a-store)
  - [API Reference](#api-reference)
    - [define](#define)
    - [Store](#store)
    - [StoreElement](#storeelement)
    - [StoreComposer](#storecomposer)
  - [Examples](#examples)
    - [Combining Multiple Stores with StoreComposer](#combining-multiple-stores-with-storecomposer)
    - [Keeping track of stores added or deleted](#keeping-track-of-stores-added-or-deleted)
  - [License](#license)
  - [Contributing](#contributing)

---

## Features

- **Reactive State Management:** Easily subscribe to state changes and update your UI accordingly.
- **Dynamic Store Creation**: Supports adding new stores at runtime.
- **Immutable Access:** Get deep-cloned copies of the current, previous and initial states to prevent accidental mutations - ensuring data integrity.
- **Local Storage Persistence:** (Optional) Persist state changes using `localStorage` or `sessionStorage`.
- **Composable Stores:** Use the `StoreComposer` to manage and compose multiple state stores.
- **Web Component Integration:** Built-in support for creating custom elements with automatic resource cleanup.

---

## Installation

You can install WC-Store via npm:

```bash
npm install @flemminghansen/wc-store
```

Or with yarn:

```bash
yarn add @flemminghansen/wc-store
```

---

## Quick Start

Below is a simple example that demonstrates how to create a reactive store and use it.

### Creating a Store

```typescript
import { Store } from "@flemminghansen/wc-store";

// Define an initial state
interface AppState {
  counter: number;
}

const initialState: AppState = { counter: 0 };

// Create a new store instance
const appStore = new Store<AppState>(initialState);

// Subscribe to state changes
const abortController = new AbortController();
appStore.subscribe(abortController.signal, (newState, previousState) => {
  console.log("State changed from", previousState, "to", newState);
});

// Update the state
appStore.setState({ counter: appStore.getCurrentState().counter + 1 });
```

---

## API Reference

### define

The `define` helper registers a custom element if it isn’t already defined.

**Signature:**

```typescript
define(
  name: string,
  webcomponentClass: CustomElementConstructor,
  options?: ElementDefinitionOptions
): string;
```

**Usage:**

```typescript
import { define } from "@flemminghansen/wc-store";

// Use the `define` helper to register your custom element
define("custom-element", class extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = "<div>My Custom Element</div>";
  }
});
```

Now you can use the `<custom-element></custom-element>` element in your HTML.

---

### Store

The `Store` class creates an observable state container. It maintains the current state, the previous state, and a timestamp for when the state was last updated.

**Constructor:**

- **initialState**  
  Must be of type `object`

- **options (optional):**

  - **prefix: string**  
  Prefix for storage_key for identifying store.
  - **saveToSessionStorageKey?: string**  
  Name for `sessionStorage` key. Will be prefixed with prefix.
  - **saveToLocalStorageKey?: string**  
  Name for `localStorage` key. Will be prefixed with prefix. Will override saveToSessionStorageKey if both are set.

```typescript
new Store<T extends object>(initialState: T, options?: IOptions)
```

**Key Methods:**

- **getCurrentState(): T**  
  Returns a deep-cloned copy of the current state.

- **getPreviousState(): T**  
  Returns a deep-cloned copy of the previous state.

- **getTimeStamp(): number**  
  Returns the timestamp of the last state update.

- **setState(updatedState: T): void**  
  Updates the state, persists it if storage options are provided, and notifies subscribers.

- **subscribe(signal: AbortSignal, updateMethod: (newState: T, previousState: T) => void | Promise<void>): void**  
  Subscribes to state changes. When the provided signal is aborted (e.g., when a component is disconnected), the subscription is automatically removed.


---

### StoreElement

The `StoreElement` class is a simple extension of `HTMLElement` that automatically creates an `AbortController` to cancel any ongoing subscriptions when the element is disconnected from the DOM. The `StoreElement` also have a `disconnectedCallback` method, which is automatically called, once the `HTMLElement` is unmounted.

**Key values:**

- **signal: AbortSignal** 
  We use this to unsubscribe from the Store when then `HTMLElement` is unmounted.

- **controller: AbortController**  
  If you need to run `disconnectedCallback` on your component, remember to call `this.controller.abort()` to unsubscribe from Store to avoid memory leak.

**Usage:**

```typescript
import { define, StoreElement, Store } from "@flemminghansen/wc-store";

const initialState: AppState = { counter: 0 };

// Create a new store instance
const appStore = new Store<AppState>(initialState);

class MyElement extends StoreElement {
  // Your component logic here
  connectedCallback() {
    // The abort signal is part of the StoreElement. The subscription will be cancelled automatically once MyElement is unmounted.
    appStore.subscribe(this.signal, (newState, previousState) => {
      console.log("State changed from", previousState, "to", newState);
    });
  }
}

define('my-element', MyElement)
```

---

### StoreComposer

`StoreComposer` is used for composing multiple stores into one. It is useful when your application state is split into several independent parts.

**Constructor:**

- **initialState**  
  Must be of type `Record<string, object>`

- **options (optional):**

  - **prefix: string**  
  Prefix for storage_key for identifying store.
  - **saveToSessionStorageKey?: string**  
  Name for `sessionStorage` key. Will be prefixed with prefix.
  - **saveToLocalStorageKey?: string**  
  Name for `localStorage` key. Will be prefixed with prefix. Will override saveToSessionStorageKey if both are set.

```typescript
new StoreComposer<T extends Record<string, object>>(initialState: T, options?: IOptions)
```


**Key Methods:**

- **getStore<K extends keyof T>(key: K): Store<T[K]>**  
  Returns the store associated with the given key.

- **createStore(key: string, payload: T[K]): Store<T[K]>**  
  Creates and adds a new store to the composer.

- **deleteStore(key: string): void**  
  Deletes a store from the composer.

- **keys(): (keyof T)[]**  
  Returns an array of all store keys.

**Utility store:**
- **timeStampStore: Store<{createdTimeStamp?: number,  deletedTimeStamp?: number}>**  
 Tracks timestamps for store creation and deletion.


---

## Examples

### Combining Multiple Stores with StoreComposer

```typescript
import { StoreComposer } from "@flemminghansen/wc-store";

interface AppStores {
  user: { name: string; age: number };
  settings: { theme: string };
}

const initialAppState: AppStores = {
  user: { name: "Alice", age: 25 },
  settings: { theme: "light" }
};

const composer = new StoreComposer<AppStores>(initialAppState);

// Access a store
const userStore = composer.getStore("user");

// Update a store
userStore.setState({ name: "Alice", age: 26 });

// Create a new store dynamically
composer.createStore("notifications", { unread: 5 });

// List all store keys
console.log("Available stores:", composer.keys());
```

### Keeping track of stores added or deleted
```typescript
import { define, StoreComposer, StoreElement } from "@flemminghansen/wc-store";

interface AppStores {
  user: { name: string; age: number };
  settings: { theme: string };
}

const initialAppState: AppStores = {
  user: { name: "Alice", age: 25 },
  settings: { theme: "light" }
};

const composer = new StoreComposer<AppStores>
define("my-app", class extends StoreElement {

    constructor() {
        super();
        composer.timeStampStore.subscribe(() => {
            // runs when a store is added or deleted in composer
            window.requestAnimationFrame(() => {
                this.#render();
            })
        })
    }

    #render() {
        composer.keys().forEach((key) => {
            const keyState = composer.getStore(key).getCurrentState()
        // render app based on key and state
        })
    }

    connectedCallback() {
        this.#render()
    }
});
```

---

## License

WC-Store is released under the [MIT License](./LICENSE).

---

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.


