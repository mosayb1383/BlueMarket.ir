/* ============================================================
   BLUE MARKET — LocalStorageAdapter (حالت Demo)
   ============================================================ */

"use strict";

(function () {
  class LocalStorageAdapter extends window.StorageInterface {
    constructor(prefix = "") {
      super();
      this._prefix = prefix || "";
      this._listeners = new Map();
    }

    /* --- ابزار داخلی --- */
    _k(key) {
      return this._prefix ? `${this._prefix}:${key}` : key;
    }

    _emit(event, detail) {
      try {
        window.dispatchEvent(
          new CustomEvent(`bm:storage:${event}`, { detail }),
        );
      } catch (e) {}
      if (this._listeners.has(event)) {
        this._listeners.get(event).forEach((cb) => {
          try {
            cb(detail);
          } catch (e) {}
        });
      }
    }

    _available() {
      try {
        const k = "__bm_test__";
        localStorage.setItem(k, "1");
        localStorage.removeItem(k);
        return true;
      } catch (e) {
        return false;
      }
    }

    /* --- CRUD پایه --- */
    async get(key) {
      try {
        return localStorage.getItem(this._k(key));
      } catch (e) {
        return null;
      }
    }

    async set(key, value) {
      try {
        localStorage.setItem(this._k(key), value);
        this._emit("set", { key, value });
        return true;
      } catch (e) {
        console.error("[LocalStorageAdapter] set failed:", e);
        return false;
      }
    }

    async remove(key) {
      try {
        localStorage.removeItem(this._k(key));
        this._emit("remove", { key });
        return true;
      } catch (e) {
        return false;
      }
    }

    /* --- مجموعه (array) --- */
    async list(key) {
      const raw = await this.get(key);
      const parsed = window.BMStorageUtils.safeParse(raw, []);
      return Array.isArray(parsed) ? parsed : [];
    }

    async find(key, predicate) {
      const items = await this.list(key);
      if (typeof predicate !== "function") return null;
      return items.find(predicate) || null;
    }

    async push(key, item, limit = null) {
      const items = await this.list(key);
      items.unshift(item);
      const finalItems = limit ? items.slice(0, limit) : items;
      await this.set(key, JSON.stringify(finalItems));
      this._emit("push", { key, item });
      return finalItems;
    }

    /* --- شیء --- */
    async getObject(key, fallback = null) {
      const raw = await this.get(key);
      const parsed = window.BMStorageUtils.safeParse(raw, fallback);
      return parsed == null ? fallback : parsed;
    }

    async setObject(key, value) {
      const serialized = window.BMStorageUtils.safeStringify(value);
      if (serialized == null) return false;
      return this.set(key, serialized);
    }

    /* --- رخداد --- */
    on(event, cb) {
      if (!this._listeners.has(event)) this._listeners.set(event, new Set());
      this._listeners.get(event).add(cb);
      return () => this.off(event, cb);
    }

    off(event, cb) {
      if (!this._listeners.has(event)) return;
      this._listeners.get(event).delete(cb);
    }

    /* --- اطلاعات --- */
    get info() {
      return {
        type: "localStorage",
        ready: this._available(),
        prefix: this._prefix,
      };
    }
  }

  window.LocalStorageAdapter = LocalStorageAdapter;
})();
