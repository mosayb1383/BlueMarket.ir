/* ============================================
   پنل ادمین — موبایلی بلوچستان
   نسخه ۳.۰ — با اعلان‌ها و تیکت‌ها
   ============================================ */

"use strict";

const AdminPanel = {
  // ========== تنظیمات ==========
  config: {
    adminEmail: "admin@baluchistan.com",
    adminPassword: "Admin@2024#Bl",
    sessionKey: "bl_admin_session",
    sessionDuration: 24 * 60 * 60 * 1000,
    maxLoginAttempts: 5,
    lockoutDuration: 5 * 60 * 1000,
  },

  state: {
    user: null,
    sidebarOpen: false,
    notifications: [],
    unreadCount: 0,
    notifPanelOpen: false,
  },

  // ========================================
  // احراز هویت
  // ========================================
  isAdminLoggedIn() {
    try {
      const session = JSON.parse(
        localStorage.getItem(this.config.sessionKey) || "null",
      );
      if (!session) return false;
      if (session.expiresAt < Date.now()) {
        localStorage.removeItem(this.config.sessionKey);
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  },

  getAdmin() {
    try {
      const session = JSON.parse(
        localStorage.getItem(this.config.sessionKey) || "null",
      );
      if (!session || session.expiresAt < Date.now()) return null;
      return session;
    } catch (e) {
      return null;
    }
  },

  getAttempts() {
    try {
      const data = JSON.parse(
        localStorage.getItem("bl_admin_attempts") || "{}",
      );
      if (data.lockedUntil && data.lockedUntil > Date.now()) {
        return data;
      }
      if (data.lockedUntil && data.lockedUntil <= Date.now()) {
        localStorage.removeItem("bl_admin_attempts");
        return { count: 0 };
      }
      return data;
    } catch (e) {
      return { count: 0 };
    }
  },

  recordFailedAttempt() {
    const data = this.getAttempts();
    data.count = (data.count || 0) + 1;
    if (data.count >= this.config.maxLoginAttempts) {
      data.lockedUntil = Date.now() + this.config.lockoutDuration;
    }
    localStorage.setItem("bl_admin_attempts", JSON.stringify(data));
    return data;
  },

  clearAttempts() {
    localStorage.removeItem("bl_admin_attempts");
  },

  async login(email, password) {
    const attempts = this.getAttempts();
    if (attempts.lockedUntil && attempts.lockedUntil > Date.now()) {
      const remaining = Math.ceil((attempts.lockedUntil - Date.now()) / 1000);
      return {
        success: false,
        message: `حساب موقتاً قفل شده. ${remaining} ثانیه صبر کنید.`,
      };
    }

    await new Promise((r) => setTimeout(r, 800));

    const cleanEmail = String(email || "")
      .trim()
      .toLowerCase();
    const cleanPassword = String(password || "");

    const validEmail = this.config.adminEmail.toLowerCase();
    const validPassword = this.config.adminPassword;

    if (cleanEmail !== validEmail || cleanPassword !== validPassword) {
      const after = this.recordFailedAttempt();
      const remaining = this.config.maxLoginAttempts - (after.count || 0);

      if (remaining <= 0) {
        return {
          success: false,
          message: `تعداد تلاش‌ها بیش از حد مجاز! ${this.config.lockoutDuration / 60000} دقیقه صبر کنید.`,
        };
      }

      return {
        success: false,
        message: `ایمیل یا رمز اشتباه است. ${remaining} تلاش باقی مانده.`,
      };
    }

    this.clearAttempts();

    const session = {
      email: cleanEmail,
      name: "مدیر سیستم",
      loginAt: Date.now(),
      expiresAt: Date.now() + this.config.sessionDuration,
      token: this.generateId("token"),
    };

    localStorage.setItem(this.config.sessionKey, JSON.stringify(session));
    return { success: true, session };
  },

  logout() {
    localStorage.removeItem(this.config.sessionKey);
    window.location.href = "admin.html";
  },

  requireLogin() {
    if (!this.isAdminLoggedIn()) {
      window.location.href = "admin.html";
      return false;
    }
    return true;
  },

  // ========================================
  // Toast
  // ========================================
  toast(message, type = "info") {
    const existing = document.querySelector(".admin-toast");
    if (existing) existing.remove();

    const icons = {
      success: "bi-check-circle-fill",
      error: "bi-x-circle-fill",
      warning: "bi-exclamation-triangle-fill",
      info: "bi-info-circle-fill",
    };

    const toast = document.createElement("div");
    toast.className = `admin-toast ${type}`;
    toast.innerHTML = `<i class="bi ${icons[type] || icons.info}"></i><span>${message}</span>`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("show"));
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  },

  // ========================================
  // Sidebar
  // ========================================
  toggleSidebar(force) {
    const sidebar = document.getElementById("adminSidebar");
    const overlay = document.getElementById("adminOverlay");
    if (!sidebar || !overlay) return;

    const shouldOpen =
      typeof force === "boolean" ? force : !sidebar.classList.contains("open");
    sidebar.classList.toggle("open", shouldOpen);
    overlay.classList.toggle("show", shouldOpen);
    this.state.sidebarOpen = shouldOpen;
  },

  // ========================================
  // داده‌های پایه
  // ========================================
  getProducts() {
    const custom = localStorage.getItem("bl_admin_products");
    if (custom) {
      try {
        return JSON.parse(custom);
      } catch (e) {}
    }
    return window.ALL_PRODUCTS || [];
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

  saveOrders(orders) {
    localStorage.setItem("bl_orders", JSON.stringify(orders));
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
        orders: 0,
        totalSpent: 0,
        registeredAt: u.createdAt || new Date().toISOString(),
        status: "active",
      }));
    } catch (e) {
      return [];
    }
  },

  // ========================================
  // تیکت‌ها
  // ========================================
  getTickets() {
    try {
      return JSON.parse(localStorage.getItem("bl_tickets") || "[]");
    } catch (e) {
      return [];
    }
  },

  saveTickets(tickets) {
    localStorage.setItem("bl_tickets", JSON.stringify(tickets));
    this.checkNotifications();
  },

  // ========================================
  // اعلان‌ها
  // ========================================
  getNotifications() {
    try {
      return JSON.parse(localStorage.getItem("bl_admin_notifications") || "[]");
    } catch (e) {
      return [];
    }
  },

  saveNotifications(notifs) {
    localStorage.setItem("bl_admin_notifications", JSON.stringify(notifs));
  },

  addNotification(notif) {
    const notifs = this.getNotifications();
    notifs.unshift({
      id: this.generateId("notif"),
      createdAt: new Date().toISOString(),
      read: false,
      ...notif,
    });
    // فقط ۱۰۰ اعلان آخر
    if (notifs.length > 100) notifs.length = 100;
    this.saveNotifications(notifs);
    this.updateNotificationsBadge();
  },

  markNotificationRead(id) {
    const notifs = this.getNotifications();
    const idx = notifs.findIndex((n) => n.id === id);
    if (idx >= 0) {
      notifs[idx].read = true;
      this.saveNotifications(notifs);
      this.updateNotificationsBadge();
    }
  },

  markAllNotificationsRead() {
    const notifs = this.getNotifications();
    notifs.forEach((n) => (n.read = true));
    this.saveNotifications(notifs);
    this.updateNotificationsBadge();
    this.renderNotificationsPanel();
  },

  getUnreadCount() {
    return this.getNotifications().filter((n) => !n.read).length;
  },

  updateNotificationsBadge() {
    const count = this.getUnreadCount();
    this.state.unreadCount = count;
    document.querySelectorAll(".admin-notif-badge").forEach((el) => {
      el.textContent = count > 99 ? "99+" : count.toLocaleString("fa-IR");
      el.style.display = count > 0 ? "flex" : "none";
    });
  },

  // ========================================
  // تشخیص اعلان جدید
  // ========================================
  checkNotifications() {
    // تیکت‌های جدید
    const tickets = this.getTickets();
    const unreadTickets = tickets.filter((t) => !t.adminRead);

    // سفارشات جدید
    const orders = this.getOrders();
    const newOrders = orders.filter((o) => !o.adminRead);

    // تعداد کل
    const totalNew = unreadTickets.length + newOrders.length;

    // به‌روزرسانی badge
    this.updateNotificationsBadge();
    return totalNew;
  },

  // ========================================
  // Toast: نمایش اعلان جدید
  // ========================================
  notifyNewTicket(ticket) {
    this.addNotification({
      type: "ticket",
      title: "تیکت جدید",
      message: `${ticket.subject} — ${ticket.userName || "کاربر"}`,
      link: "tickets.html",
      refId: ticket.id,
    });

    // اگر در پنل هستیم، toast هم نشون بده
    if (document.querySelector(".admin-layout")) {
      this.showNotificationToast(
        "تیکت جدید",
        `${ticket.subject}`,
        "bi-chat-dots-fill",
        "tickets.html",
      );
    }
  },

  notifyNewOrder(order) {
    this.addNotification({
      type: "order",
      title: "سفارش جدید",
      message: `سفارش ${order.id} به مبلغ ${this.formatPrice(order.total)}`,
      link: "orders.html",
      refId: order.id,
    });

    if (document.querySelector(".admin-layout")) {
      this.showNotificationToast(
        "سفارش جدید",
        `سفارش ${order.id}`,
        "bi-bag-check-fill",
        "orders.html",
      );
    }
  },

  showNotificationToast(title, message, icon, link) {
    const toast = document.createElement("div");
    toast.className = "admin-notif-toast";
    toast.innerHTML = `
            <div class="notif-toast-icon">
                <i class="bi ${icon}"></i>
            </div>
            <div class="notif-toast-content">
                <div class="notif-toast-title">${this.escape(title)}</div>
                <div class="notif-toast-message">${this.escape(message)}</div>
            </div>
            <button type="button" class="notif-toast-close" aria-label="بستن">
                <i class="bi bi-x-lg"></i>
            </button>
        `;

    toast.addEventListener("click", (e) => {
      if (e.target.closest(".notif-toast-close")) {
        toast.remove();
        return;
      }
      window.location.href = link;
    });

    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("show"));

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 6000);
  },

  // ========================================
  // پنل اعلان‌ها (Dropdown)
  // ========================================
  toggleNotificationsPanel() {
    const panel = document.getElementById("adminNotifPanel");
    if (!panel) return;

    const isOpen = panel.classList.contains("show");
    panel.classList.toggle("show", !isOpen);
    this.state.notifPanelOpen = !isOpen;

    if (!isOpen) {
      this.renderNotificationsPanel();
    }
  },

  renderNotificationsPanel() {
    const listEl = document.getElementById("adminNotifList");
    if (!listEl) return;

    const notifs = this.getNotifications();

    if (notifs.length === 0) {
      listEl.innerHTML = `
                <div class="admin-notif-empty">
                    <i class="bi bi-bell-slash"></i>
                    <p>اعلان جدیدی ندارید</p>
                </div>
            `;
      return;
    }

    const iconMap = {
      ticket: "bi-chat-dots-fill",
      order: "bi-bag-check-fill",
      user: "bi-person-plus-fill",
      system: "bi-info-circle-fill",
    };

    const colorMap = {
      ticket: "purple",
      order: "green",
      user: "blue",
      system: "orange",
    };

    listEl.innerHTML = notifs
      .slice(0, 20)
      .map(
        (n) => `
            <div class="admin-notif-item ${n.read ? "" : "unread"}" data-id="${n.id}">
                <div class="admin-notif-item-icon ${colorMap[n.type] || "orange"}">
                    <i class="bi ${iconMap[n.type] || iconMap.system}"></i>
                </div>
                <div class="admin-notif-item-content">
                    <div class="admin-notif-item-title">${this.escape(n.title)}</div>
                    <div class="admin-notif-item-msg">${this.escape(n.message)}</div>
                    <div class="admin-notif-item-time">${this.timeAgo(n.createdAt)}</div>
                </div>
            </div>
        `,
      )
      .join("");

    // کلیک روی آیتم
    listEl.querySelectorAll(".admin-notif-item").forEach((el) => {
      el.addEventListener("click", () => {
        const id = el.dataset.id;
        const notif = notifs.find((n) => n.id === id);
        if (notif) {
          this.markNotificationRead(id);
          if (notif.link) {
            window.location.href = notif.link;
          }
        }
      });
    });
  },

  // ========================================
  // ابزارها
  // ========================================
  formatPrice(n) {
    return (n || 0).toLocaleString("fa-IR") + " تومان";
  },

  formatDate(dateStr) {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("fa-IR");
    } catch (e) {
      return "—";
    }
  },

  formatDateTime(dateStr) {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return (
        d.toLocaleDateString("fa-IR") +
        " - " +
        d.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })
      );
    } catch (e) {
      return "—";
    }
  },

  timeAgo(dateStr) {
    if (!dateStr) return "";
    try {
      const seconds = Math.floor(
        (Date.now() - new Date(dateStr).getTime()) / 1000,
      );
      if (seconds < 60) return "همین حالا";
      if (seconds < 3600) return `${Math.floor(seconds / 60)} دقیقه پیش`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)} ساعت پیش`;
      if (seconds < 604800) return `${Math.floor(seconds / 86400)} روز پیش`;
      return this.formatDate(dateStr);
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

  generateId(prefix = "id") {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  },

  // ========================================
  // Topbar
  // ========================================
  renderTopbar(pageTitle) {
    const admin = this.getAdmin();
    if (!admin) return "";

    return `
            <div class="admin-topbar-right">
                <button type="button" class="admin-menu-toggle" onclick="AdminPanel.toggleSidebar()" aria-label="منو">
                    <i class="bi bi-list"></i>
                </button>
                <h1 class="admin-page-title">${pageTitle}</h1>
            </div>
            <div class="admin-topbar-left">

                <div class="admin-notif-wrap">
                    <button type="button" class="admin-icon-btn admin-notif-btn"
                            onclick="AdminPanel.toggleNotificationsPanel()"
                            aria-label="اعلان‌ها">
                        <i class="bi bi-bell"></i>
                        <span class="admin-notif-badge">0</span>
                    </button>

                    <div class="admin-notif-panel" id="adminNotifPanel">
                        <div class="admin-notif-header">
                            <h4><i class="bi bi-bell-fill"></i> اعلان‌ها</h4>
                            <button type="button" class="admin-notif-mark-all"
                                    onclick="AdminPanel.markAllNotificationsRead()">
                                خواندن همه
                            </button>
                        </div>
                        <div class="admin-notif-list" id="adminNotifList">
                            <!-- JS پر می‌کنه -->
                        </div>
                    </div>
                </div>

                <button type="button" class="admin-profile-btn" onclick="AdminPanel.confirmLogout()">
                    <div class="avatar">${(admin.name || "م").charAt(0)}</div>
                    <span class="name">${admin.name || "مدیر"}</span>
                </button>
            </div>
        `;
  },

  confirmLogout() {
    if (confirm("آیا از پنل ادمین خارج می‌شوید؟")) this.logout();
  },

  // ========================================
  // Sidebar
  // ========================================
  renderSidebar(activePage) {
    const tickets = this.getTickets();
    const unreadTickets = tickets.filter((t) => !t.adminRead).length;
    const orders = this.getOrders();
    const newOrders = orders.filter((o) => !o.adminRead).length;

    const items = [
      {
        section: "اصلی",
        items: [
          {
            href: "dashboard.html",
            icon: "bi-speedometer2",
            label: "داشبورد",
            key: "dashboard",
          },
        ],
      },
      {
        section: "فروشگاه",
        items: [
          {
            href: "products.html",
            icon: "bi-box-seam",
            label: "محصولات",
            key: "products",
          },
          {
            href: "orders.html",
            icon: "bi-bag-check",
            label: "سفارشات",
            key: "orders",
            badge: newOrders,
          },
          {
            href: "users.html",
            icon: "bi-people",
            label: "کاربران",
            key: "users",
          },
        ],
      },
      {
        section: "پشتیبانی",
        items: [
          {
            href: "tickets.html",
            icon: "bi-chat-dots",
            label: "تیکت‌ها",
            key: "tickets",
            badge: unreadTickets,
          },
        ],
      },
      {
        section: "سیستم",
        items: [
          {
            href: "reports.html",
            icon: "bi-graph-up",
            label: "گزارش‌گیری",
            key: "reports",
          },
          {
            href: "../index.html",
            icon: "bi-globe",
            label: "مشاهده سایت",
            key: "site",
          },
        ],
      },
    ];

    return `
            <div class="admin-sidebar-header">
                <div class="logo"><i class="bi bi-shield-lock"></i></div>
                <div class="title">
                    <h5>پنل مدیریت</h5>
                    <span>موبایلی بلوچستان</span>
                </div>
            </div>
            <nav class="admin-sidebar-nav">
                ${items
                  .map(
                    (section) => `
                    <div class="admin-nav-section">
                        <h6>${section.section}</h6>
                        ${section.items
                          .map(
                            (item) => `
                            <a href="${item.href}" class="admin-nav-item ${activePage === item.key ? "active" : ""}">
                                <i class="bi ${item.icon}"></i>
                                <span>${item.label}</span>
                                ${item.badge > 0 ? `<span class="admin-nav-badge">${item.badge.toLocaleString("fa-IR")}</span>` : ""}
                            </a>
                        `,
                          )
                          .join("")}
                    </div>
                `,
                  )
                  .join("")}
                <div class="admin-nav-section">
                    <button type="button" class="admin-nav-item admin-nav-item-logout" onclick="AdminPanel.logout()">
                        <i class="bi bi-box-arrow-right"></i>
                        <span>خروج</span>
                    </button>
                </div>
            </nav>
        `;
  },

  // ========================================
  // راه‌اندازی
  // ========================================
  initPage(pageKey, pageTitle) {
    if (!this.requireLogin()) return false;

    const sidebar = document.getElementById("adminSidebar");
    const topbar = document.getElementById("adminTopbar");
    if (sidebar) sidebar.innerHTML = this.renderSidebar(pageKey);
    if (topbar) topbar.innerHTML = this.renderTopbar(pageTitle);

    const overlay = document.getElementById("adminOverlay");
    if (overlay)
      overlay.addEventListener("click", () => this.toggleSidebar(false));

    // شروع پایش اعلان‌ها
    this.startNotificationWatcher();

    // به‌روزرسانی اولیه
    this.updateNotificationsBadge();

    // بستن پنل اعلان با کلیک بیرون
    document.addEventListener("click", (e) => {
      const panel = document.getElementById("adminNotifPanel");
      const btn = e.target.closest(".admin-notif-btn");
      if (
        !btn &&
        panel &&
        panel.classList.contains("show") &&
        !panel.contains(e.target)
      ) {
        panel.classList.remove("show");
        this.state.notifPanelOpen = false;
      }
    });

    return true;
  },

  // ========================================
  // پایش اعلان‌ها
  // ========================================
  notificationWatcher: null,
  lastTicketCount: 0,
  lastOrderCount: 0,

  startNotificationWatcher() {
    // ذخیره شمارش اولیه
    this.lastTicketCount = this.getTickets().length;
    this.lastOrderCount = this.getOrders().length;

    // هر ۵ ثانیه چک کن
    this.notificationWatcher = setInterval(() => {
      this.checkForNewItems();
    }, 5000);
  },

  checkForNewItems() {
    const currentTickets = this.getTickets();
    const currentOrders = this.getOrders();

    // تیکت جدید
    if (currentTickets.length > this.lastTicketCount) {
      const newTicket = currentTickets[0];
      this.notifyNewTicket(newTicket);
    }

    // سفارش جدید
    if (currentOrders.length > this.lastOrderCount) {
      const newOrder = currentOrders[0];
      this.notifyNewOrder(newOrder);
    }

    this.lastTicketCount = currentTickets.length;
    this.lastOrderCount = currentOrders.length;
    this.updateNotificationsBadge();
  },

  // ========================================
  // Modal Helper
  // ========================================
  openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add("show");
    document.body.style.overflow = "hidden";
  },

  closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove("show");
    document.body.style.overflow = "";
  },
};

window.AdminPanel = AdminPanel;

document.addEventListener("DOMContentLoaded", () => {
  const isLoginPage = document.body.classList.contains("admin-login");
  if (!isLoginPage && !AdminPanel.isAdminLoggedIn()) {
    window.location.href = "admin.html";
  }
});

