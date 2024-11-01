type IUpdateMethod<T> = (newState: T, oldState: T) => void | Promise<void>;

export class Store<T> {
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

  setState(newState: Partial<T>) {
    const oldStateCopy = this.getPreviousState();

    this.#state = {
      ...this.#state,
      ...newState,
    };

    const stateCopy = this.getState();

    for (const updateMethod of this.#subscribers) {
      updateMethod(stateCopy, oldStateCopy);
    }

    this.#oldState = stateCopy;
  }

  setPartialState(partialState: Partial<T>) {
    this.setState({
      ...this.getState(),
      ...partialState,
    });
  }

  async setAsyncPartialState(asyncFunc: () => Promise<Partial<T>>) {
    const partialState = await asyncFunc();
    this.setPartialState(partialState);
  }

  subscribe(signal: AbortSignal, updateMethod: IUpdateMethod<T>) {
    this.#subscribers.add(updateMethod);
    signal.addEventListener("abort", () => {
      this.#subscribers.delete(updateMethod);
    });
  }
}
