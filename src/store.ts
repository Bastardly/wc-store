type IUpdateMethod<T extends object> = (
  newState: T,
  previousState: T
) => void | Promise<void>;
/**
 * WeakMap store is an extended WeakMap that takes an object as an initial state.
 * The values of the weakmap is the currentState, previousState and a change timeStamp
 * The data can only be accessed through this class' methods.
 */
export class Store<T extends object> extends WeakMap<
  T,
  {
    currentState: T;
    previousState: T;
    timeStamp: number;
  }
> {
  #initialState: T;
  #subscribers = new Set<IUpdateMethod<T>>();

  constructor(initialState: T) {
    super();
    this.#validateStateObject(initialState);

    this.#initialState = initialState;

    const timeStamp = new Date().getTime();

    this.set(this.#initialState, {
      currentState: this.#initialState,
      previousState: this.#initialState,
      timeStamp,
    });
  }

  get initialState() {
    return Object.freeze(this.#initialState);
  }

  #getIsObject(obj: unknown) {
    return typeof obj === "object" && obj !== null;
  }

  #validateStateObject(state: unknown) {
    if (!this.#getIsObject(state)) {
      throw new Error(
        "State provided in Store constructor is not of type Record<string, object>."
      );
    }
  }
  getCurrentState() {
    return this.cloneDeep(this.get(this.#initialState).currentState);
  }

  getPreviousState() {
    return this.cloneDeep(this.get(this.#initialState).previousState);
  }

  getTimeStamp() {
    return this.get(this.#initialState).timeStamp;
  }

  cloneDeep<V>(obj: V): V {
    if (obj instanceof URL) {
      return new URL(obj.href) as V;
    }

    if (this.#getIsObject(obj)) {
      if (Array.isArray(obj)) {
        return obj.map((el) => this.cloneDeep(el)) as V;
      }

      const result = {} as V;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          result[key] = this.cloneDeep<(typeof obj)[typeof key]>(obj[key]);
        }
      }
      return result;
    }

    return obj; // For primitives and functions, return as is.
  }

  setState(updatedState: T) {
    const currentState = this.getCurrentState();
    this.set(this.#initialState, {
      timeStamp: new Date().getTime(),
      previousState: currentState,
      currentState: updatedState,
    });
    this.#subscribers.forEach((updateMethod) =>
      updateMethod(this.getCurrentState(), this.getPreviousState())
    );
  }

  subscribe(signal: AbortSignal, updateMethod: IUpdateMethod<T>) {
    this.#subscribers.add(updateMethod);
    signal.addEventListener("abort", () => {
      this.#subscribers.delete(updateMethod);
    });
  }
}

// test
// const store = new Store({ count: 0 });

// store.subscribe(new AbortController().signal, (current, prev) => {
//   console.log("prev:", prev);
//   console.log("current:", current);
// });

// store.setState({ count: 1 });
// console.log("Current:", store.getCurrentState()); // { count: 1 }
// console.log("Previous:", store.getPreviousState()); // { count: 0 }

// store.setState({ count: 2 });
// console.log("Current:", store.getCurrentState()); // { count: 2 }
// console.log("Previous:", store.getPreviousState()); // { count: 1 }
