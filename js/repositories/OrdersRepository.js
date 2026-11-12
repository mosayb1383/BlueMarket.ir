/* ============================================================
   BLUE MARKET — OrdersRepository
   ============================================================ */

"use strict";

(function () {
  class OrdersRepository {
    constructor(adapter) {
      this.adapter = adapter;
      this._KEY = () => window.BM_CONFIG.storageKeys.orders;
    }

    async getAll() {
      const raw = await this.adapter.get(this._KEY());
      const parsed = window.BMStorageUtils.safeParse(raw, []);
      return Array.isArray(parsed) ? parsed : [];
    }

    async getById(id) {
      const all = await this.getAll();
      return all.find((o) => String(o.id) === String(id)) || null;
    }

    async getByUser(email) {
      const all = await this.getAll();
      if (!email) return [];
      return all.filter(
        (o) =>
          String(o.userEmail || "").toLowerCase() ===
          String(email).toLowerCase(),
      );
    }

    async create(order) {
      const all = await this.getAll();
      all.unshift(order);
      await this.adapter.set(this._KEY(), JSON.stringify(all));
      this._emitChange("created", order);
      return order;
    }

    async updateStatus(id, status) {
      const all = await this.getAll();
      const idx = all.findIndex((o) => String(o.id) === String(id));
      if (idx < 0) return null;
      all[idx] = {
        ...all[idx],
        status,
        updatedAt: new Date().toISOString(),
      };
      await this.adapter.set(this._KEY(), JSON.stringify(all));
      this._emitChange("status", all[idx]);
      return all[idx];
    }

    async markAdminRead(id) {
      const all = await this.getAll();
      const idx = all.findIndex((o) => String(o.id) === String(id));
      if (idx < 0) return null;
      all[idx].adminRead = true;
      await this.adapter.set(this._KEY(), JSON.stringify(all));
      return all[idx];
    }

    _emitChange(event, detail) {
      try {
        window.dispatchEvent(new CustomEvent(`bm:orders:${event}`, { detail }));
      } catch (e) {}
    }
  }

  window.OrdersRepository = OrdersRepository;
})();
