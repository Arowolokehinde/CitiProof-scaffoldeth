// IndexedDB polyfill for server-side rendering
if (typeof window === 'undefined') {
  // Mock IndexedDB for server-side
  global.indexedDB = {
    open: () => ({
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
      result: null,
    }),
    deleteDatabase: () => ({
      onsuccess: null,
      onerror: null,
    }),
  } as any;

  global.IDBKeyRange = {
    bound: () => ({}),
    lowerBound: () => ({}),
    upperBound: () => ({}),
    only: () => ({}),
  } as any;

  // Mock other IDB globals
  global.IDBTransaction = {} as any;
  global.IDBDatabase = {} as any;
  global.IDBObjectStore = {} as any;
  global.IDBRequest = {} as any;
}