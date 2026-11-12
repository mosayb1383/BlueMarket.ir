/* ============================================================
   BLUE MARKET — Core Storage Interface
   قرارداد مشترک بین همه‌ی adapterها
   ============================================================ */

"use strict";

(function () {
  class StorageInterface {
    /* --- CRUD پایه --- */
    async get(key) {
      throw new Error("get() باید پیاده‌سازی شود");
    }
    async set(key, value) {
      throw new Error("set() باید پیاده‌سازی شود");
    }
    async remove(key) {
      throw new Error("remove() باید پیاده‌سازی شود");
    }

    /* --- مجموعه --- */
    async list(key) {
      throw new Error("list() باید پیاده‌سازی شود");
    }
    async find(key, predicate) {
      throw new Error("find() باید پیاده‌سازی شود");
    }
    async push(key, item, limit = null) {
      throw new Error("push() باید پیاده‌سازی شود");
    }

    /* --- شیء --- */
    async getObject(key, fallback = null) {
      throw new Error("getObject() باید پیاده‌سازی شود");
    }
    async setObject(key, value) {
      throw new Error("setObject() باید پیاده‌سازی شود");
    }

    /* --- رخداد --- */
    on(event, cb) {
      /* اختیاری */
    }
    off(event, cb) {
      /* اختیاری */
    }

    /* --- اطلاعات --- */
    get info() {
      return { type: "unknown", ready: false };
    }
  }

  /* --- ابزارهای امن سریال/دیسریال --- */
  window.BMStorageUtils = {
    safeParse(raw, fallback) {
      if (raw == null) return fallback;
      if (typeof raw !== "string") return raw;
      try {
        const parsed = JSON.parse(raw);
        return parsed == null ? fallback : parsed;
      } catch (e) {
        return fallback;
      }
    },

    safeStringify(value) {
      try {
        return JSON.stringify(value);
      } catch (e) {
        return null;
      }
    },

    /* تبدیل امن به عدد */
    toNumber(v, fallback = 0) {
      if (typeof v === "number" && Number.isFinite(v)) return v;
      const s = String(v ?? "")
        .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
        .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
        .replace(/[^0-9.\-]/g, "");
      const n = Number(s);
      return Number.isFinite(n) ? n : fallback;
    },

    /* clone ساده */
    clone(v) {
      if (v == null) return v;
      try {
        return structuredClone(v);
      } catch (e) {
        try {
          return JSON.parse(JSON.stringify(v));
        } catch (_) {
          return v;
        }
      }
    },
  };

  window.StorageInterface = StorageInterface;
})();
