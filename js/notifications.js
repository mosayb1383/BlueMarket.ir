/* ============================================
   زنگوله‌ی اعلان کاربر — بلو مارکت
  با صدای اعلان شیک (آیفون
   ============================================ */

"use strict";

const UserNotifications = {
  DROPDOWN_LIMIT: 5,
  seen: null,
  interval: null,

  /* ---------- ابزارها ---------- */
  escape(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  },

  timeAgo(d) {
    if (!d) return "";
    try {
      const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
      if (s < 60) return "همین حالا";
      if (s < 3600)
        return Math.floor(s / 60).toLocaleString("fa-IR") + " دقیقه پیش";
      if (s < 86400)
        return Math.floor(s / 3600).toLocaleString("fa-IR") + " ساعت پیش";
      if (s < 604800)
        return Math.floor(s / 86400).toLocaleString("fa-IR") + " روز پیش";
      return new Date(d).toLocaleDateString("fa-IR");
    } catch (e) {
      return "";
    }
  },

  get nc() {
    return window.NotificationCenter;
  },

  isUserLoggedIn() {
    return !!(this.nc && this.nc.currentUser());
  },

  /* همه‌ی اعلان‌های کاربر (جدیدترین اول) */
  getNotifications() {
    return this.nc ? this.nc.forUser() : [];
  },

  getUnreadCount() {
    return this.getNotifications().filter((n) => !n.isRead).length;
  },

  /* ---------- Badge ---------- */
  updateBadge() {
    const total = this.getUnreadCount();
    document.querySelectorAll(".user-notif-badge").forEach((badge) => {
      badge.textContent = total > 99 ? "99+" : total.toLocaleString("fa-IR");
      badge.style.display = total > 0 ? "flex" : "none";
    });
  },

  /* ---------- Dropdown ---------- */
  togglePanel() {
    if (window.innerWidth < 992) {
      window.location.href = "notifications.html";
      return;
    }
    const panel = document.getElementById("userNotifPanel");
    if (!panel) return;
    const isOpen = panel.classList.contains("show");
    panel.classList.toggle("show", !isOpen);
    if (!isOpen) this.renderPanel();
  },

  renderPanel() {
    const list = document.getElementById("userNotifList");
    if (!list || !this.nc) return;

    const notifs = this.getNotifications().slice(0, this.DROPDOWN_LIMIT);

    if (notifs.length === 0) {
      list.innerHTML = `
        <div class="notif-empty">
          <i class="bi bi-bell-slash"></i>
          <p>اعلانی ندارید</p>
        </div>`;
      return;
    }

    list.innerHTML = notifs
      .map((n) => {
        const meta = this.nc.typeMeta(n.type);
        return `
        <div class="notif-item ${n.isRead ? "" : "unread"}" data-id="${this.escape(n.id)}">
          <div class="notif-item-icon ${meta.color}">
            <i class="bi ${meta.icon}"></i>
          </div>
          <div class="notif-item-content">
            <div class="notif-item-title">${this.escape(n.title)}</div>
            <div class="notif-item-msg">${this.escape(n.message)}</div>
            <div class="notif-item-time">${this.timeAgo(n.createdAt)}</div>
          </div>
        </div>`;
      })
      .join("");

    list.querySelectorAll(".notif-item").forEach((el) => {
      el.addEventListener("click", () => {
        const n = notifs.find((x) => x.id === el.dataset.id);
        if (n) this.open(n);
      });
    });
  },

  /* کلیک روی اعلان: خوانده‌شده + رفتن به صفحه‌ی مرتبط */
  open(n) {
    this.nc.markRead(n.id);
    window.location.href = this.nc.linkFor(n);
  },

  markAllRead() {
    if (!this.nc) return;
    this.nc.markAllRead("user");
    this.updateBadge();
    this.renderPanel();
    this.toast("همه اعلان‌ها خوانده شدند", "success");
  },

  /* ---------- Toast ---------- */
  toast(msg, type = "info") {
    const old = document.querySelector(".user-notif-toast");
    if (old) old.remove();

    const icons = {
      success: "bi-check-circle-fill",
      error: "bi-x-circle-fill",
      info: "bi-info-circle-fill",
    };

    const t = document.createElement("div");
    t.className = `user-notif-toast ${type}`;
    t.innerHTML = `<i class="bi ${icons[type] || icons.info}"></i><span>${this.escape(msg)}</span>`;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add("show"));
    setTimeout(() => {
      t.classList.remove("show");
      setTimeout(() => t.remove(), 400);
    }, 3000);
  },

  /* Toast زنده وقتی اعلان جدید می‌رسد */
  showLiveToast(n) {
    const old = document.querySelector(".user-notif-toast-live");
    if (old) old.remove();
    const meta = this.nc.typeMeta(n.type);

    const toast = document.createElement("div");
    toast.className = "user-notif-toast-live";
    toast.innerHTML = `
      <div class="notif-toast-icon"><i class="bi ${meta.icon}"></i></div>
      <div class="notif-toast-content">
        <div class="notif-toast-title">${this.escape(n.title)}</div>
        <div class="notif-toast-message">${this.escape(n.message)}</div>
      </div>
      <button type="button" class="notif-toast-close" aria-label="بستن">
        <i class="bi bi-x-lg"></i>
      </button>`;

    toast.addEventListener("click", (e) => {
      if (e.target.closest(".notif-toast-close")) {
        toast.remove();
        return;
      }
      this.open(n);
    });

    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("show"));
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 6000);
  },

  /* ---------- 🔊 صدای اعلان شیک (شبیه آیفون) ---------- */
  playSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      const now = ctx.currentTime;

      // دو نُت ملایم شبیه آیفون
      // نُت اول: E6 (1318.51 Hz)
      // نُت دوم: A6 (1760 Hz)

      const playTone = (freq, startTime, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);

        // فِید این و فِید اوت نرم
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      playTone(1318.51, now, 0.25); // E6
      playTone(1760, now + 0.12, 0.3); // A6
    } catch (e) {
      console.log("[Sound] Audio failed", e);
    }
  },

  /* ---------- پایش زنده ---------- */
  refresh() {
    const all = this.getNotifications();
    if (!this.seen) this.seen = new Set(all.map((n) => n.id));

    const fresh = all.filter((n) => !n.isRead && !this.seen.has(n.id));
    all.forEach((n) => this.seen.add(n.id));

    this.updateBadge();
    const panel = document.getElementById("userNotifPanel");
    if (panel && panel.classList.contains("show")) this.renderPanel();

    if (fresh.length) {
      this.showLiveToast(fresh[0]);
      this.playSound();
    }
  },

  startWatcher() {
    this.seen = new Set(this.getNotifications().map((n) => n.id));
    if (this.interval) clearInterval(this.interval);
    this.interval = setInterval(() => this.refresh(), 4000);
  },

  /* ---------- Init ---------- */
  init() {
    if (!this.isUserLoggedIn()) {
      document
        .querySelectorAll(".user-notif-badge")
        .forEach((b) => (b.style.display = "none"));
      return;
    }
    this.updateBadge();
    this.startWatcher();

    if (this._bound) return;
    this._bound = true;

    document.addEventListener("click", (e) => {
      const panel = document.getElementById("userNotifPanel");
      const btn = e.target.closest(".user-notif-btn");
      if (
        panel &&
        panel.classList.contains("show") &&
        !panel.contains(e.target) &&
        !btn
      ) {
        panel.classList.remove("show");
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const panel = document.getElementById("userNotifPanel");
        if (panel) panel.classList.remove("show");
      }
    });

    window.addEventListener("storage", (e) => {
      if (e.key === "notifications") this.refresh();
    });
    window.addEventListener("bl:notifications-changed", () => this.refresh());
  },
};

window.UserNotifications = UserNotifications;

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => UserNotifications.init(), 300);
});

window.addEventListener("storage", (e) => {
  if (e.key === "blUser") setTimeout(() => UserNotifications.init(), 100);
});
