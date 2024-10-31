type IUpdateMethod<T> = (newState: T, oldState: T) => void | Promise<void>;

export class Store<T> {
  #subscribers = new Set<IUpdateMethod<T>>();
  #state: T;
  #oldState: T;

  constructor(state: T) {
    if (this.#isValidStateObject(state)) {
      throw new Error(
        "State provided in Store constructor is not a state-holding object."
      );
    }

    this.#state = state;
    this.#oldState = state;
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

  subscribe(signal: AbortSignal, updateMethod: IUpdateMethod<T>) {
    this.#subscribers.add(updateMethod);
    signal.addEventListener("abort", () => {
      this.#subscribers.delete(updateMethod);
    });
  }
}
