/* ============================================================
   BLUE MARKET — Bootstrap
   همه‌ی repository/service ها اینجا ساخته می‌شوند.
   در همه‌ی صفحات، قبل از سایر اسکریپت‌ها بارگذاری شود.
   ============================================================ */

"use strict";

(function () {
  function createAdapter() {
    const mode = window.BM_CONFIG?.env?.mode || "demo";
    if (mode === "production" && window.ApiAdapter) {
      return new window.ApiAdapter(window.BM_CONFIG.get("env.apiBaseUrl", ""));
    }
    return new window.LocalStorageAdapter("bm");
  }

  function init() {
    if (!window.BM_CONFIG) {
      console.warn("[BM] config.js لود نشده. ترتیب اسکریپت‌ها را بررسی کن.");
      return;
    }
    if (!window.StorageInterface) {
      console.warn("[BM] core/storage.js لود نشده.");
      return;
    }

    const adapter = createAdapter();

    const repos = {
      products: new window.ProductsRepository(adapter),
      orders: new window.OrdersRepository(adapter),
      users: new window.UsersRepository(adapter),
      tickets: new window.TicketsRepository(adapter),
      notifications: new window.NotificationsRepository(adapter),
    };

    window.BM = {
      config: window.BM_CONFIG,
      adapter,
      repos,
      ready: true,
      version: "phase-1",
    };

    /* رخداد آماده‌شدن */
    try {
      window.dispatchEvent(new CustomEvent("bm:ready", { detail: window.BM }));
    } catch (e) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
