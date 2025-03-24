import {
  getChildStorageOptions,
} from "./localStorageUtils";
import { Store } from "./store";
import { IOptions } from "./types";

type IUpdateToState<T, K extends keyof T> = Record<K, T[K]>;

export type IUpdateToMethod<T, K extends keyof T> = (
  updatedStoreKey: K,
  newState: IUpdateToState<T, K>,
  previousState: IUpdateToState<T, K>
) => void | Promise<void>;

interface IComposerStore {
  childStorageKeys: string[];
}

export class StoreComposer<T extends Record<string, object>> {
  #stores = {} as Record<keyof T, Store<T[keyof T]>>;
  #options?: IOptions;
  #composerStore?: Store<IComposerStore>;

  constructor(initialState: T, options?: IOptions) {
    this.#validateStateObject(initialState);
    this.#options = options;
    let childKeys = Object.keys(initialState);

    // If we store things in local- or session storage
    if (options?.prefix) {
      // Store handles the stored values based on options
      this.#composerStore = new Store(
        {
          childStorageKeys: childKeys,
        },
        this.#options
      );

      childKeys = this.#composerStore.getCurrentState().childStorageKeys;
    }

    childKeys.forEach((selectorKey: keyof T) => {

      const childState =
        initialState[selectorKey] ||
        ({} as (typeof initialState)[typeof selectorKey]);

      const childOptions = getChildStorageOptions(
        selectorKey as string,
        this.#options
      );

      this.#stores[selectorKey] = new Store(childState, childOptions);
    });
  }

  /**
   *
   * @param key Name of the store
   * @returns T
   */
  getStore<K extends keyof T>(key: K): Store<T[K]> {
    if (!this.#stores[key]) {
      throw new Error(`The store with key: ${key as string} does not exist`);
    }

    // @ts-expect-error - The type is generic. Here we want the type for a specific key
    return this.#stores[key];
  }

  /**
   * Create store adds a new store to the object. This should only be used in clase the store can't be predefined.
   * @param key string
   * @param payload T
   */
  createStore<K extends string>(key: K, payload: T[K]) {
    this.#stores[key] = new Store(
      payload,
      getChildStorageOptions(key as string, this.#options)
    );

    if (this.#composerStore) {
      const composerState = this.#composerStore.getCurrentState();
      if (!composerState.childStorageKeys.includes(key)) {
        composerState.childStorageKeys.push(key);
        this.#composerStore.setState(composerState);
      } else {
        console.warn(`Store with key: "${key}" already exist`);
      }
    }

    return this.#stores[key];
  }

  deleteStore(key: string) {
    delete this.#stores[key];
  }

  /**
   * Get an array of store keys
   * @returns string[]
   */
  keys() {
    return Object.keys(this.#stores) as (keyof T)[];
  }

  #getIsObject(obj: T) {
    return typeof obj === "object" && obj !== null && !Array.isArray(obj);
  }

  #validateStateObject(state: T) {
    if (!this.#getIsObject(state)) {
      throw new Error(
        "State provided in Store constructor is not of type Record<string, object>."
      );
    }
  }

  subscribeTo<K extends keyof T>(
    signal: AbortSignal,
    updateToMethod: IUpdateToMethod<T, K>,
    storeKeys?: K[]
  ) {
    (storeKeys || this.keys()).forEach((storeKey: K) => {
      if (this.#stores[storeKey]) {
        this.#stores[storeKey].subscribe(signal, (newState, previousState) =>
          // todo ... add remaining state
          updateToMethod(
            storeKey,
            newState as Record<K, T[K]>,
            previousState as Record<K, T[K]>
          )
        );
      }
    });
  }
}
