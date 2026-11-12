/* ============================================================
   BLUE MARKET — TicketsRepository
   ============================================================ */

"use strict";

(function () {
  class TicketsRepository {
    constructor(adapter) {
      this.adapter = adapter;
      this._KEY = () => window.BM_CONFIG.storageKeys.tickets;
    }

    async getAll() {
      const raw = await this.adapter.get(this._KEY());
      const parsed = window.BMStorageUtils.safeParse(raw, []);
      return Array.isArray(parsed) ? parsed : [];
    }

    async getById(id) {
      const all = await this.getAll();
      return all.find((t) => String(t.id) === String(id)) || null;
    }

    async getByUser(email) {
      const all = await this.getAll();
      if (!email) return [];
      return all
        .filter(
          (t) =>
            String(t.userEmail || "").toLowerCase() ===
            String(email).toLowerCase(),
        )
        .sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt) -
            new Date(a.updatedAt || a.createdAt),
        );
    }

    async create(ticket) {
      const all = await this.getAll();
      all.unshift(ticket);
      await this.adapter.set(this._KEY(), JSON.stringify(all));
      this._emitChange("created", ticket);
      return ticket;
    }

    async addMessage(ticketId, message) {
      const all = await this.getAll();
      const idx = all.findIndex((t) => String(t.id) === String(ticketId));
      if (idx < 0) return null;
      all[idx].messages = all[idx].messages || [];
      all[idx].messages.push(message);
      all[idx].updatedAt = new Date().toISOString();
      await this.adapter.set(this._KEY(), JSON.stringify(all));
      this._emitChange("message", all[idx]);
      return all[idx];
    }

    async updateStatus(ticketId, status) {
      const all = await this.getAll();
      const idx = all.findIndex((t) => String(t.id) === String(ticketId));
      if (idx < 0) return null;
      all[idx].status = status;
      all[idx].updatedAt = new Date().toISOString();
      await this.adapter.set(this._KEY(), JSON.stringify(all));
      this._emitChange("status", all[idx]);
      return all[idx];
    }

    _emitChange(event, detail) {
      try {
        window.dispatchEvent(
          new CustomEvent(`bm:tickets:${event}`, { detail }),
        );
      } catch (e) {}
    }
  }

  window.TicketsRepository = TicketsRepository;
})();
