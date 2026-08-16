// Craftbench — local storage helper. Everything here is BROWSER-LOCAL ONLY.
// Nothing in this module ever sends data anywhere.

const NS = 'craftbench:';

export const store = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(NS + key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(NS + key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove(key) {
    localStorage.removeItem(NS + key);
  },
  exportAll() {
    const out = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith(NS)) out[k.slice(NS.length)] = store.get(k.slice(NS.length));
    }
    return out;
  },
  importAll(obj) {
    Object.entries(obj).forEach(([k, v]) => store.set(k, v));
  },
  clearAll() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(NS))
      .forEach(k => localStorage.removeItem(k));
  }
};
