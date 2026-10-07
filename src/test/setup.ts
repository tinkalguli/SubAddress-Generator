import { beforeEach, vi } from 'vitest';

const store: Record<string, unknown> = {};

beforeEach(() => {
  for (const key of Object.keys(store)) delete store[key];
});

vi.stubGlobal('chrome', {
  storage: {
    local: {
      get: (keys: string | string[] | Record<string, unknown> | null) => {
        if (keys === null) return Promise.resolve({ ...store });
        const keyList =
          typeof keys === 'string'
            ? [keys]
            : Array.isArray(keys)
              ? keys
              : Object.keys(keys);
        const result: Record<string, unknown> = {};
        for (const k of keyList) {
          if (k in store) result[k] = store[k];
        }
        return Promise.resolve(result);
      },
      set: (items: Record<string, unknown>) => {
        Object.assign(store, items);
        return Promise.resolve();
      },
      remove: (keys: string | string[]) => {
        const keyList = typeof keys === 'string' ? [keys] : keys;
        for (const k of keyList) delete store[k];
        return Promise.resolve();
      },
    },
  },
});
