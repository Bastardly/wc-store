import { IOptions } from "./types";

function getEnhancedKey(childKey: string, parentKey?: string) {
  if (!parentKey) return undefined;

  return `${parentKey}/${childKey}`;
}

export function saveToStorage<T>(value: T, options?: IOptions) {
  if (!options?.prefix) return;

  try {
    const jsonStr = JSON.stringify(value);

    if (options.saveToLocalStorageKey) {
      const fullKey = getEnhancedKey(
        options.saveToLocalStorageKey,
        options.prefix
      );
      window.localStorage.setItem(fullKey, jsonStr);
    } else if (options.saveToSessionStorageKey) {
      const fullKey = getEnhancedKey(
        options.saveToSessionStorageKey,
        options.prefix
      );
      window.sessionStorage.setItem(fullKey, jsonStr);
    }
  } catch {
    console.error("error saving to storage");
  }
}

export function deleteFromStorage(options?: IOptions) {
  if (!options?.prefix) return;

  if (options.saveToLocalStorageKey) {
    const fullKey = getEnhancedKey(
      options.saveToLocalStorageKey,
      options.prefix
    );
    window.localStorage.removeItem(fullKey);
  } else if (options.saveToSessionStorageKey) {
    const fullKey = getEnhancedKey(
      options.saveToSessionStorageKey,
      options.prefix
    );
    window.sessionStorage.removeItem(fullKey);
  }
}

function getStoredValueString(options?: IOptions) {
  if (options?.prefix) {
    const getKey = (str: string) => getEnhancedKey(str, options.prefix);

    if (options.saveToLocalStorageKey) {
      return window.localStorage.getItem(getKey(options.saveToLocalStorageKey));
    }

    if (options.saveToSessionStorageKey) {
      return window.sessionStorage.getItem(
        getKey(options.saveToSessionStorageKey)
      );
    }
  }

  return undefined;
}

export function getInitialStoredData<T>(
  defaultValue: T,
  options?: IOptions
): T {
  if (options) {
    const stored = getStoredValueString(options);

    try {
      return (JSON.parse(stored) as T) || defaultValue;
    } catch {}
  }

  return defaultValue;
}

export function getAllStoreKeys<T>(
  defaultValue: T,
  options?: IOptions
): string[] {
  const defaultKeys = Object.keys(defaultValue);

  if (options?.prefix) {
    const addKeys = (str: string, storage: Storage) => {
      const fullKey = getEnhancedKey(str, options.prefix);
      Object.keys(window.localStorage).forEach((k) => {
        if (k.indexOf(fullKey) === 0 && k !== fullKey) {
          defaultKeys.push(k);
        }
      });
    };

    if (options.saveToLocalStorageKey) {
      addKeys(options.saveToLocalStorageKey, window.localStorage);
    } else if (options.saveToSessionStorageKey) {
      addKeys(options.saveToSessionStorageKey, window.sessionStorage);
    }
  }

  return Array.from(new Set(defaultKeys));
}

export function getChildStorageOptions(childKey: string, options?: IOptions) {
  if (!options?.prefix) return undefined;

  return {
    prefix: options.prefix,
    saveToLocalStorageKey: getEnhancedKey(
      childKey,
      options.saveToLocalStorageKey
    ),
    saveToSessionStorageKey: getEnhancedKey(
      childKey,
      options.saveToSessionStorageKey
    ),
  };
}
