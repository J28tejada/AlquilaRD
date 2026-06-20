// Polyfill for window.storage — maps to localStorage when the native API is absent
if (!window.storage) {
  (window as any).storage = {
    get: (key: string) =>
      Promise.resolve(
        localStorage.getItem(key) !== null
          ? { value: localStorage.getItem(key) }
          : null
      ),
    set: (key: string, value: string) => {
      localStorage.setItem(key, value);
      return Promise.resolve();
    },
  };
}
