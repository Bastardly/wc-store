type IUpdateMethod<T> = (newState: T, oldState: T) => void | Promise<void>;

type IAction<P, T> = (payload: P, state: T, oldState: T) => Partial<T>;

export class Store<T, AM extends Record<string, IAction<unknown, T>>> {
  #subscribers = new Set<IUpdateMethod<T>>();
  #state: T;
  #oldState: T;
  #actionMap: AM;

  constructor(initialState: T, actionMap: AM) {
    if (this.#isValidStateObject(initialState)) {
      throw new Error(
        "State provided in Store constructor is not a state-holding object."
      );
    }

    this.#actionMap = actionMap;
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

  update<K extends keyof AM>(action: K, payload: Parameters<AM[typeof action]>[0]) {
    const previousStateCopy = this.getPreviousState();
    const stateBeforeUpdateCopy = this.getState();
    const updatedState = this.#actionMap[action](
      payload,
      stateBeforeUpdateCopy,
      previousStateCopy
    );

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
