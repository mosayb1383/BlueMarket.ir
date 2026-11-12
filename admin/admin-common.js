/* ============================================
   ADMIN COMMON — بلو مارکت
   ============================================ */

"use strict";

const AdminApp = {
  /* ============================================================
     احراز هویت
     ============================================================ */
  isLoggedIn() {
    try {
      const s = JSON.parse(localStorage.getItem("bl_admin_session") || "null");
      if (!s || s.expiresAt < Date.now()) return false;
      return true;
    } catch (e) {
      return false;
    }
  },

  getSession() {
    try {
      return JSON.parse(localStorage.getItem("bl_admin_session") || "null");
    } catch (e) {
      return null;
    }
  },

  requireLogin() {
    if (!this.isLoggedIn()) {
      window.location.href = "admin.html";
      return false;
    }
    return true;
  },

  logout() {
    this.customConfirm("از پنل مدیریت خارج می‌شوید؟", () => {
      localStorage.removeItem("bl_admin_session");
      window.location.href = "admin.html";
    });
  },

  /* ============================================================
     Confirm سفارشی
     ============================================================ */
  customConfirm(message, onConfirm) {
    const old = document.getElementById("adminCustomConfirm");
    if (old) old.remove();

    const modalHTML = `
      <div class="admin-modal-backdrop show" id="adminCustomConfirm" style="z-index: 99999;">
        <div class="admin-modal" style="max-width: 400px; text-align: center; padding: 32px 24px;">
          <div style="width: 70px; height: 70px; background: #fff7ed; color: #f97316; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 20px;">
            <i class="bi bi-exclamation-triangle-fill"></i>
          </div>
          <h3 style="font-size: 1.2rem; font-weight: 800; color: #1e293b; margin-bottom: 12px;">آیا مطمئن هستید؟</h3>
          <p style="color: #64748b; font-size: 0.95rem; margin-bottom: 28px;">${this.escape(message)}</p>
          <div style="display: flex; gap: 12px; justify-content: center;">
            <button class="btn-outline-admin" id="btnCancelConfirm" style="flex: 1; justify-content: center; padding: 12px;">انصراف</button>
            <button class="btn-primary-admin" id="btnOkConfirm" style="flex: 1; justify-content: center; padding: 12px; background: linear-gradient(135deg, #ef4444, #dc2626);">تایید</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    document.getElementById("btnCancelConfirm").onclick = () => {
      document.getElementById("adminCustomConfirm").remove();
    };
    document.getElementById("btnOkConfirm").onclick = () => {
      document.getElementById("adminCustomConfirm").remove();
      if (typeof onConfirm === "function") onConfirm();
    };
  },

  /* ============================================================
     Sidebar
     ============================================================ */
  toggleSidebar(force) {
    const sb = document.getElementById("adminSidebar");
    const ov = document.getElementById("adminOverlay");
    if (!sb || !ov) return;
    const shouldOpen =
      typeof force === "boolean" ? force : !sb.classList.contains("open");
    sb.classList.toggle("open", shouldOpen);
    ov.classList.toggle("show", shouldOpen);
  },

  /* ============================================================
     داده‌ها — ادغام هوشمند بین کاتالوگ اصلی و پنل ادمین
     ============================================================ */
  getProducts() {
    // 1. محصولات پایه (از فایل products-data.js)
    let baseProducts = [];
    if (window.ProductsDB && typeof window.ProductsDB.all === "function") {
      baseProducts = window.ProductsDB.all();
    } else if (Array.isArray(window.ALL_PRODUCTS)) {
      baseProducts = window.ALL_PRODUCTS;
    }

    // 2. محصولاتی که در پنل ادمین ذخیره شدن (تغییرات ادمین)
    let adminProducts = [];
    try {
      adminProducts = JSON.parse(
        localStorage.getItem("bl_admin_products") || "[]",
      );
      if (!Array.isArray(adminProducts)) adminProducts = [];
    } catch (e) {
      adminProducts = [];
    }

    // 3. ادغام: تغییرات ادمین روی محصولات پایه اعمال میشن
    const mergedMap = new Map();

    // اول محصولات پایه رو میذاریم
    baseProducts.forEach((p) => mergedMap.set(String(p.id), p));

    // بعد محصولات ادمین (اگر آیدی یکسان بود، تغییرات ادمین جایگزین میشه)
    adminProducts.forEach((p) => mergedMap.set(String(p.id), p));

    return Array.from(mergedMap.values());
  },

  saveProducts(products) {
    localStorage.setItem("bl_admin_products", JSON.stringify(products));
  },

  getOrders() {
    try {
      return JSON.parse(localStorage.getItem("bl_orders") || "[]");
    } catch (e) {
      return [];
    }
  },

  saveOrders(o) {
    localStorage.setItem("bl_orders", JSON.stringify(o));
  },

  getTickets() {
    try {
      return JSON.parse(localStorage.getItem("bl_tickets") || "[]");
    } catch (e) {
      return [];
    }
  },

  saveTickets(t) {
    localStorage.setItem("bl_tickets", JSON.stringify(t));
  },

  getUsers() {
    try {
      const raw = localStorage.getItem("registeredUsers") || "[]";
      const parsed = JSON.parse(raw);
      const users = Array.isArray(parsed) ? parsed : Object.values(parsed);
      return users.map((u, i) => ({
        id: u.id || `user_${i}`,
        firstName: u.firstName || "",
        lastName: u.lastName || "",
        name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || "کاربر",
        email: u.email || "",
        phone: u.phone || "",
        registeredAt: u.createdAt || new Date().toISOString(),
        status: "active",
      }));
    } catch (e) {
      return [];
    }
  },

  /* ============================================================
     ابزار فرمت
     ============================================================ */
  formatPrice(n) {
    return (n || 0).toLocaleString("fa-IR") + " تومان";
  },

  formatDate(d) {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString("fa-IR");
    } catch (e) {
      return "—";
    }
  },

  formatDateTime(d) {
    if (!d) return "—";
    try {
      const dt = new Date(d);
      return (
        dt.toLocaleDateString("fa-IR") +
        " - " +
        dt.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })
      );
    } catch (e) {
      return "—";
    }
  },

  timeAgo(d) {
    if (!d) return "";
    try {
      const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
      if (s < 60) return "همین حالا";
      if (s < 3600) return Math.floor(s / 60) + " دقیقه پیش";
      if (s < 86400) return Math.floor(s / 3600) + " ساعت پیش";
      if (s < 604800) return Math.floor(s / 86400) + " روز پیش";
      return this.formatDate(d);
    } catch (e) {
      return "";
    }
  },

  escape(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  },

  /* ============================================================
     Toast
     ============================================================ */
  toast(msg, type = "info") {
    const old = document.querySelector(".admin-toast");
    if (old) old.remove();
    const icons = {
      success: "bi-check-circle-fill",
      error: "bi-x-circle-fill",
      info: "bi-info-circle-fill",
    };
    const t = document.createElement("div");
    t.className = "admin-toast " + type;
    t.innerHTML = `<i class="bi ${icons[type] || icons.info}"></i><span>${this.escape(msg)}</span>`;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add("show"));
    setTimeout(() => {
      t.classList.remove("show");
      setTimeout(() => t.remove(), 400);
    }, 3000);
  },

  /* ============================================================
     Sidebar Menu
     ============================================================ */
  renderSidebarMenu(activePage) {
    const unreadTickets = this.getTickets().filter((t) => !t.adminRead).length;
    const newOrders = this.getOrders().filter((o) => !o.adminRead).length;
    const totalProducts = this.getProducts().length;

    const menu = [
      {
        section: "اصلی",
        items: [
          {
            key: "dashboard",
            href: "dashboard.html",
            icon: "bi-speedometer2",
            label: "داشبورد",
          },
        ],
      },
      {
        section: "فروشگاه",
        items: [
          {
            key: "products",
            href: "products.html",
            icon: "bi-box-seam",
            label: "محصولات",
            badge: totalProducts,
          },
          {
            key: "orders",
            href: "orders.html",
            icon: "bi-bag-check",
            label: "سفارشات",
            badge: newOrders,
          },
          {
            key: "users",
            href: "users.html",
            icon: "bi-people",
            label: "کاربران",
          },
          {
            key: "coupons",
            href: "coupons.html",
            icon: "bi-ticket-perforated",
            label: "کدهای تخفیف",
          },
        ],
      },
      {
        section: "پشتیبانی",
        items: [
          {
            key: "tickets",
            href: "tickets.html",
            icon: "bi-chat-dots",
            label: "تیکت‌ها",
            badge: unreadTickets,
          },
        ],
      },
      {
        section: "سیستم",
        items: [
          {
            key: "notifications",
            href: "notifications.html",
            icon: "bi-bell",
            label: "اعلان‌ها",
            badge: window.NotificationCenter
              ? NotificationCenter.unreadCount("admin")
              : 0,
          },
          {
            key: "reports",
            href: "reports.html",
            icon: "bi-graph-up",
            label: "گزارش‌گیری",
          },
          {
            key: "site",
            href: "../index.html",
            icon: "bi-globe",
            label: "مشاهده سایت",
          },
        ],
      },
    ];

    return `
      <div class="sidebar-header">
          <div class="sidebar-logo"><img src="../images/logo.svg" alt="بلو مارکت" style="width:44px;height:44px;border-radius:12px;"></div>
          <div class="sidebar-title"><h5>بلو مارکت</h5><span>پنل مدیریت</span></div>
      </div>
      <nav class="sidebar-nav">
          ${menu
            .map(
              (sec) => `
              <div class="nav-section">
                  <h6>${sec.section}</h6>
                  ${sec.items
                    .map(
                      (it) => `
                      <a href="${it.href}" class="nav-item ${activePage === it.key ? "active" : ""}">
                          <i class="bi ${it.icon}"></i>
                          <span>${it.label}</span>
                          ${it.badge > 0 ? `<span class="nav-badge" ${it.key === "notifications" ? "data-notif" : ""}>${it.badge.toLocaleString("fa-IR")}</span>` : ""}
                      </a>
                  `,
                    )
                    .join("")}
              </div>
          `,
            )
            .join("")}
          <div class="nav-section">
              <button class="nav-item logout" onclick="AdminApp.logout()">
                  <i class="bi bi-box-arrow-right"></i><span>خروج</span>
              </button>
          </div>
      </nav>
    `;
  },

  /* ============================================================
     Topbar
     ============================================================ */
  renderTopbar(pageTitle) {
    const session = this.getSession();
    const name = session?.name || "مدیر";

    return `
      <div class="topbar-right">
          <button class="menu-toggle" onclick="AdminApp.toggleSidebar()" aria-label="منو"><i class="bi bi-list"></i></button>
          <h1 class="page-title">${pageTitle}</h1>
      </div>
      <div class="topbar-left">
          <div class="admin-notif-wrap">
              <button type="button" class="icon-btn admin-notif-btn" onclick="AdminApp.toggleNotifPanel()" aria-label="اعلان‌ها">
                  <i class="bi bi-bell"></i>
                  <span class="admin-notif-badge" id="notifBadge">0</span>
              </button>
              <div class="admin-notif-panel" id="notifPanel">
                  <div class="admin-notif-header">
                      <h4><i class="bi bi-bell-fill"></i> اعلان‌ها</h4>
                      <button type="button" class="admin-notif-mark-all" onclick="AdminApp.markAllNotifRead()">همه را خواندم</button>
                  </div>
                  <div class="admin-notif-list" id="notifList"></div>
                  <a href="notifications.html" class="admin-notif-viewall">مشاهده همه اعلان‌ها</a>
              </div>
          </div>
          <button type="button" class="profile-btn" onclick="AdminApp.logout()">
              <div class="avatar">${name.charAt(0)}</div>
              <span class="profile-name">${name}</span>
          </button>
      </div>
    `;
  },

  /* ============================================================
     اعلان‌ها
     ============================================================ */
  getNotifications() {
    return window.NotificationCenter ? NotificationCenter.forAdmin() : [];
  },

  updateNotifBadge() {
    const total = window.NotificationCenter
      ? NotificationCenter.unreadCount("admin")
      : 0;
    const badge = document.getElementById("notifBadge");
    if (badge) {
      badge.textContent = total > 99 ? "99+" : total.toLocaleString("fa-IR");
      badge.style.display = total > 0 ? "flex" : "none";
    }
    document
      .querySelectorAll(".nav-item .nav-badge[data-notif]")
      .forEach((el) => {
        el.textContent = total.toLocaleString("fa-IR");
        el.style.display = total > 0 ? "" : "none";
      });
  },

  toggleNotifPanel() {
    const panel = document.getElementById("notifPanel");
    if (!panel) return;
    const isOpen = panel.classList.contains("show");
    panel.classList.toggle("show", !isOpen);
    if (!isOpen) this.renderNotifPanel();
  },

  renderNotifPanel() {
    const list = document.getElementById("notifList");
    if (!list) return;
    const notifs = this.getNotifications().slice(0, 5);
    if (notifs.length === 0) {
      list.innerHTML = `<div class="admin-notif-empty"><i class="bi bi-bell-slash"></i><p>اعلانی ندارید</p></div>`;
      return;
    }
    list.innerHTML = notifs
      .map((n) => {
        const meta = NotificationCenter.typeMeta(n.type);
        return `
          <div class="admin-notif-item ${n.isRead ? "" : "unread"}" data-id="${this.escape(n.id)}">
              <div class="admin-notif-item-icon ${meta.color}"><i class="bi ${meta.icon}"></i></div>
              <div class="admin-notif-item-content">
                  <div class="admin-notif-item-title">${this.escape(n.title)}</div>
                  <div class="admin-notif-item-msg">${this.escape(n.message)}</div>
                  <div class="admin-notif-item-time">${this.timeAgo(n.createdAt)}</div>
              </div>
          </div>`;
      })
      .join("");
    list.querySelectorAll(".admin-notif-item").forEach((el) => {
      el.addEventListener("click", () => {
        const n = notifs.find((x) => x.id === el.dataset.id);
        if (n) {
          NotificationCenter.markRead(n.id);
          window.location.href = NotificationCenter.linkFor(n);
        }
      });
    });
  },

  markAllNotifRead() {
    if (window.NotificationCenter) NotificationCenter.markAllRead("admin");
    this.updateNotifBadge();
    this.renderNotifPanel();
    this.toast("همه اعلان‌ها خوانده شدند", "success");
  },

  /* ============================================================
     Init Page
     ============================================================ */
  initPage(pageKey, pageTitle) {
    if (!this.requireLogin()) return false;

    const sidebar = document.getElementById("adminSidebar");
    if (sidebar) sidebar.innerHTML = this.renderSidebarMenu(pageKey);

    const topbar = document.getElementById("adminTopbar");
    if (topbar) topbar.innerHTML = this.renderTopbar(pageTitle);

    const overlay = document.getElementById("adminOverlay");
    if (overlay)
      overlay.addEventListener("click", () => this.toggleSidebar(false));

    document.addEventListener("click", (e) => {
      const panel = document.getElementById("notifPanel");
      const btn = e.target.closest(".admin-notif-btn");
      if (
        panel &&
        panel.classList.contains("show") &&
        !panel.contains(e.target) &&
        !btn
      ) {
        panel.classList.remove("show");
      }
    });

    this.updateNotifBadge();
    this.startNotificationWatcher();
    return true;
  },

  /* ============================================================
     صدا
     ============================================================ */
  playSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const now = ctx.currentTime;
      const playTone = (freq, startTime, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      playTone(1318.51, now, 0.25);
      playTone(1760, now + 0.12, 0.3);
    } catch (e) {}
  },

  /* ============================================================
     Watcher اعلان‌ها
     ============================================================ */
  notificationInterval: null,
  seenNotifIds: null,

  startNotificationWatcher() {
    this.seenNotifIds = new Set(this.getNotifications().map((n) => n.id));
    if (this.notificationInterval) clearInterval(this.notificationInterval);

    const check = () => {
      const all = this.getNotifications();
      const fresh = all.filter(
        (n) => !n.isRead && !this.seenNotifIds.has(n.id),
      );
      all.forEach((n) => this.seenNotifIds.add(n.id));
      this.updateNotifBadge();

      const panel = document.getElementById("notifPanel");
      if (panel && panel.classList.contains("show")) this.renderNotifPanel();

      if (fresh.length) {
        this.playSound();
        this.toast("اعلان جدید دارید!", "info");
      }
    };
    this.notificationInterval = setInterval(check, 4000);
    window.addEventListener("bl:notifications-changed", check);
  },

  /* ============================================================
     Modal Helpers
     ============================================================ */
  openModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add("show");
    document.body.style.overflow = "hidden";
  },

  closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove("show");
    document.body.style.overflow = "";
  },
};

window.AdminApp = AdminApp;
