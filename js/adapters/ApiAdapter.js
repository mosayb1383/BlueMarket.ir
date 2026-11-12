/* ============================================================
   BLUE MARKET — ApiAdapter (قرارداد آماده، پیاده‌سازی در آینده)
   ============================================================ */

"use strict";

(function () {
  class ApiAdapter extends window.StorageInterface {
    constructor(baseUrl = "", options = {}) {
      super();
      this.baseUrl = baseUrl || window.BM_CONFIG.get("env.apiBaseUrl", "");
      this.options = {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(options.headers || {}),
        },
        ...options,
      };
    }

    _url(path) {
      if (!this.baseUrl) {
        throw new Error(
          "[ApiAdapter] baseUrl تنظیم نشده. BM_CONFIG.env.apiBaseUrl را پر کن.",
        );
      }
      return (
        this.baseUrl.replace(/\/$/, "") +
        "/" +
        String(path || "").replace(/^\//, "")
      );
    }

    async _request(method, path, body) {
      const opts = {
        method,
        credentials: this.options.credentials,
        headers: { ...this.options.headers },
      };
      if (body !== undefined) {
        opts.body = JSON.stringify(body);
      }
      const res = await fetch(this._url(path), opts);
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `[ApiAdapter] ${method} ${path} → ${res.status} ${text}`,
        );
      }
      if (res.status === 204) return null;
      return res.json().catch(() => null);
    }

    /* --- پیاده‌سازی interface، متصل به API --- */
    async get(key) {
      return this._request("GET", `storage/${encodeURIComponent(key)}`);
    }
    async set(key, value) {
      return this._request("PUT", `storage/${encodeURIComponent(key)}`, {
        value,
      });
    }
    async remove(key) {
      return this._request("DELETE", `storage/${encodeURIComponent(key)}`);
    }

    async list(key) {
      return (await this.get(key)) || [];
    }
    async find(key, predicate) {
      const items = await this.list(key);
      return typeof predicate === "function"
        ? items.find(predicate) || null
        : null;
    }
    async push(key, item) {
      const items = await this.list(key);
      items.unshift(item);
      await this.set(key, items);
      return items;
    }

    async getObject(key, fallback = null) {
      const v = await this.get(key);
      return v == null ? fallback : v;
    }
    async setObject(key, value) {
      return this.set(key, value);
    }

    on() {}
    off() {}

    get info() {
      return { type: "api", ready: !!this.baseUrl, baseUrl: this.baseUrl };
    }
  }

  window.ApiAdapter = ApiAdapter;
})();
