/* ============================================================
   BLUE MARKET — NotificationsRepository
   ============================================================ */

"use strict";

(function () {
  class NotificationsRepository {
    constructor(adapter) {
      this.adapter = adapter;
      this._KEY = () => window.BM_CONFIG.storageKeys.notifications;
    }

    async getAll() {
      const raw = await this.adapter.get(this._KEY());
      const parsed = window.BMStorageUtils.safeParse(raw, []);
      return Array.isArray(parsed) ? parsed : [];
    }

    async getForAdmin() {
      const all = await this.getAll();
      return all
        .filter((n) => n.recipientId === "admin")
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    async getForUser(user) {
      if (!user) return [];
      const all = await this.getAll();
      const uid = String(user.id || "").toLowerCase();
      const email = String(user.email || "").toLowerCase();
      return all
        .filter((n) => {
          const rid = String(n.recipientId || "").toLowerCase();
          return rid === uid || rid === email;
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    async create(notification) {
      const all = await this.getAll();
      all.unshift(notification);
      const trimmed = all.slice(0, window.BM_CONFIG.limits.maxNotifications);
      await this.adapter.set(this._KEY(), JSON.stringify(trimmed));
      this._emitChange("created", notification);
      return notification;
    }

    async markRead(id) {
      const all = await this.getAll();
      const idx = all.findIndex((n) => String(n.id) === String(id));
      if (idx < 0) return null;
      all[idx].isRead = true;
      await this.adapter.set(this._KEY(), JSON.stringify(all));
      this._emitChange("read", all[idx]);
      return all[idx];
    }

    async markAllRead(audience) {
      const all = await this.getAll();
      const uid = audience === "admin" ? "admin" : null;
      all.forEach((n) => {
        if (uid && n.recipientId === uid) n.isRead = true;
      });
      await this.adapter.set(this._KEY(), JSON.stringify(all));
      this._emitChange("read-all", { audience });
      return true;
    }

    _emitChange(event, detail) {
      try {
        window.dispatchEvent(
          new CustomEvent(`bm:notifications:${event}`, { detail }),
        );
      } catch (e) {}
    }
  }

  window.NotificationsRepository = NotificationsRepository;
})();
