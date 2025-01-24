import { Store } from "./store";

type IUpdateToState<T, K extends keyof T> = Record<K, T[K]>;

export type IUpdateToMethod<T, K extends keyof T> = (
  updatedStoreKey: K,
  newState: IUpdateToState<T, K>,
  previousState: IUpdateToState<T, K>
) => void | Promise<void>;

export class StoreComposer<T extends Record<string, object>> {
  #stores = {} as Record<keyof T, Store<T[keyof T]>>

  constructor(initialState: T) {
    this.#validateStateObject(initialState);

    Object.keys(initialState).forEach((selectorKey: keyof T) => {
      this.#stores[selectorKey] = new Store(initialState[selectorKey]);
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
    this.#stores[key] = new Store(payload);

    return this.#stores[key];
  }

  /**
   * Get an array of store keys
   * @returns string[]
   */
  keys() {
    return Object.keys(this.#stores);
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
    storeKeys: K[],
    updateToMethod: IUpdateToMethod<T, K>
  ) {
    storeKeys.forEach((storeKey: K) => {
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
