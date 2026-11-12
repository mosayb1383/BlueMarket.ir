/* ============================================================
   BLUE MARKET — ProductsRepository
   دسترسی به محصولات فقط از این لایه
   ============================================================ */

"use strict";

(function () {
  class ProductsRepository {
    constructor(adapter) {
      this.adapter = adapter;
    }

    /* --- همه‌ی محصولات (ترکیب کاتالوگ پایه + تغییرات ادمین) --- */
    async getAll() {
      /* کاتالوگ پایه از products-data.js */
      const base = Array.isArray(window.ALL_PRODUCTS)
        ? window.ALL_PRODUCTS
        : [];

      /* تغییرات ادمین */
      let custom = [];
      try {
        const raw = await this.adapter.get(
          window.BM_CONFIG.storageKeys.adminProducts,
        );
        const parsed = window.BMStorageUtils.safeParse(raw, []);
        if (Array.isArray(parsed)) custom = parsed;
      } catch (e) {}

      /* ادغام: محصولات پایه، سپس override با تغییرات ادمین */
      const byId = new Map(custom.map((p) => [String(p.id), p]));
      const merged = base.map((p) => byId.get(String(p.id)) || p);
      const known = new Set(merged.map((p) => String(p.id)));
      custom.forEach((p) => {
        if (!known.has(String(p.id))) merged.push(p);
      });
      return merged;
    }

    async getById(id) {
      const all = await this.getAll();
      return all.find((p) => String(p.id) === String(id)) || null;
    }

    async getByCategory(category) {
      const all = await this.getAll();
      return all.filter((p) => p.category === category);
    }

    async getByBrand(brand) {
      const all = await this.getAll();
      return all.filter((p) => p.brand === brand);
    }

    async getRelated(productId, limit = 4) {
      const all = await this.getAll();
      const current = all.find((p) => String(p.id) === String(productId));
      if (!current) return [];
      return all
        .filter(
          (p) =>
            String(p.id) !== String(productId) &&
            (p.category === current.category || p.brand === current.brand),
        )
        .slice(0, limit);
    }

    async search(query, limit = 20) {
      const all = await this.getAll();
      const term = this._normalize(query);
      if (!term) return all.slice(0, limit);
      const tokens = term.split(" ").filter(Boolean);
      return all
        .filter((p) => {
          const hay = this._haystack(p);
          return tokens.every((t) => hay.includes(t));
        })
        .slice(0, limit);
    }

    async create(product) {
      const all = await this.getAll();
      const id = product.id || this._nextId(all);
      const newProduct = { ...product, id };
      all.push(newProduct);
      await this._saveAdmin(all);
      return newProduct;
    }

    async update(id, patch) {
      const all = await this.getAll();
      const idx = all.findIndex((p) => String(p.id) === String(id));
      if (idx < 0) return null;
      all[idx] = { ...all[idx], ...patch };
      await this._saveAdmin(all);
      return all[idx];
    }

    async remove(id) {
      const all = await this.getAll();
      const filtered = all.filter((p) => String(p.id) !== String(id));
      await this._saveAdmin(filtered);
      return true;
    }

    /* --- ابزار داخلی --- */
    async _saveAdmin(all) {
      /* فقط تغییرات را ذخیره می‌کنیم؛ کاتالوگ پایه دست‌نخورده می‌ماند */
      const baseIds = new Set(
        (window.ALL_PRODUCTS || []).map((p) => String(p.id)),
      );
      const admin = all.filter((p) => !baseIds.has(String(p.id)));
      /* برای سادگی، کل تغییرات را ذخیره می‌کنیم (مثل نسخه‌ی فعلی) */
      await this.adapter.set(
        window.BM_CONFIG.storageKeys.adminProducts,
        JSON.stringify(all),
      );
    }

    _nextId(all) {
      return all.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0) + 1;
    }

    _normalize(str) {
      return String(str || "")
        .toLowerCase()
        .replace(/[يى]/g, "ی")
        .replace(/ك/g, "ک")
        .replace(/[‌\s\-_]+/g, " ")
        .trim();
    }

    _haystack(p) {
      const parts = [
        p.name,
        p.shortName,
        p.brand,
        p.category,
        p.subcategory,
        p.desc,
        ...(p.highlights || []),
        ...Object.values(p.specs || {}),
      ];
      return this._normalize(parts.join(" "));
    }
  }

  window.ProductsRepository = ProductsRepository;
})();
