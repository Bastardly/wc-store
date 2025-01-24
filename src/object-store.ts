type IUpdateMethod<T> = (newState: T, oldState: T) => void | Promise<void>;

export class ObjectStore<T extends Record<string, unknown>> {
  #subscribers = new Set<IUpdateMethod<T>>();
  #state: T;
  #oldState: T;

  constructor(initialState: T) {
    if (this.#isValidStateObject(initialState)) {
      throw new Error(
        "State provided in Store constructor is not a state-holding object."
      );
    }

    this.#state = initialState;
    this.#oldState = initialState;
  }

  #isValidStateObject(state: Partial<T>) {
    return typeof state !== "object" && Array.isArray(state);
  }

  getState() {
    return Object.freeze(this.#state);
  }

  getPreviousState() {
    return Object.freeze(this.#oldState);
  }

  getSelectedState<K extends keyof T>(selector: K) {
    const state = this.getState();

    return state[selector] as T[K];
  }

  getSelectedPreviousState<K extends keyof T>(selector: K) {
    const state = this.getPreviousState();

    return state[selector] as T[K];
  }

  update(updatedState: Partial<T>) {
    const stateBeforeUpdateCopy = this.getState();
    this.#state = {
      ...this.#state,
      ...updatedState,
    };

    const updatedStateCopy = this.getState();

    for (const updateMethod of this.#subscribers) {
      updateMethod(updatedStateCopy, stateBeforeUpdateCopy);
    }

    this.#oldState = stateBeforeUpdateCopy;
  }

  subscribe(signal: AbortSignal, updateMethod: IUpdateMethod<T>) {
    this.#subscribers.add(updateMethod);
    signal.addEventListener("abort", () => {
      this.#subscribers.delete(updateMethod);
    });
  }
}
