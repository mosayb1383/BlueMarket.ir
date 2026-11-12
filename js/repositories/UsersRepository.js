/* ============================================================
   BLUE MARKET — UsersRepository
   ============================================================ */

"use strict";

(function () {
  class UsersRepository {
    constructor(adapter) {
      this.adapter = adapter;
      this._KEY = () => window.BM_CONFIG.storageKeys.users;
      this._CURRENT = () => window.BM_CONFIG.storageKeys.currentUser;
    }

    /* --- کاربران ثبت‌نام‌شده --- */
    async getAll() {
      const raw = await this.adapter.get(this._KEY());
      const parsed = window.BMStorageUtils.safeParse(raw, []);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === "object") return Object.values(parsed);
      return [];
    }

    async findByEmail(email) {
      const all = await this.getAll();
      const clean = String(email || "")
        .trim()
        .toLowerCase();
      return (
        all.find(
          (u) =>
            String(u.email || "")
              .trim()
              .toLowerCase() === clean,
        ) || null
      );
    }

    async create(user) {
      const all = await this.getAll();
      if (await this.findByEmail(user.email)) {
        throw new Error("این ایمیل قبلاً ثبت‌نام کرده است");
      }
      const newUser = {
        id: user.id || Date.now(),
        firstName: String(user.firstName || "").trim(),
        lastName: String(user.lastName || "").trim(),
        email: String(user.email || "")
          .trim()
          .toLowerCase(),
        phone: String(user.phone || "").trim(),
        passwordHash: user.passwordHash || null,
        createdAt: new Date().toISOString(),
      };
      all.push(newUser);
      await this.adapter.set(this._KEY(), JSON.stringify(all));
      return newUser;
    }

    async update(email, patch) {
      const all = await this.getAll();
      const idx = all.findIndex(
        (u) =>
          String(u.email || "")
            .trim()
            .toLowerCase() ===
          String(email || "")
            .trim()
            .toLowerCase(),
      );
      if (idx < 0) return null;
      all[idx] = { ...all[idx], ...patch };
      await this.adapter.set(this._KEY(), JSON.stringify(all));
      return all[idx];
    }

    async remove(email) {
      const all = await this.getAll();
      const filtered = all.filter(
        (u) =>
          String(u.email || "")
            .trim()
            .toLowerCase() !==
          String(email || "")
            .trim()
            .toLowerCase(),
      );
      await this.adapter.set(this._KEY(), JSON.stringify(filtered));
      return true;
    }

    /* --- session --- */
    async getCurrent() {
      const raw = await this.adapter.get(this._CURRENT());
      const parsed = window.BMStorageUtils.safeParse(raw, null);
      if (!parsed || parsed.isLoggedIn !== true) return null;
      return parsed;
    }

    async setCurrent(user) {
      const payload = {
        isLoggedIn: true,
        id: user.id || Date.now(),
        name:
          user.name ||
          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          user.email?.split("@")[0] ||
          "کاربر",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        avatar: user.avatar || "",
      };
      await this.adapter.set(this._CURRENT(), JSON.stringify(payload));
      return payload;
    }

    async clearCurrent() {
      await this.adapter.remove(this._CURRENT());
    }
  }

  window.UsersRepository = UsersRepository;
})();
