/* ============================================================
   BLUE MARKET — Config
   تنظیمات مرکزی پروژه — همه‌ی ماژول‌ها از این می‌خوانند
   ============================================================ */

"use strict";

window.BM_CONFIG = {
  /* ---------- برند ---------- */
  brand: {
    nameFa: "بلو مارکت",
    nameEn: "BLUE MARKET",
    domain: "https://YOUR-DOMAIN.ir",
    phone: "09229480252",
    phoneSupport: "09303154662",
    email: "mshanbhzhi@gmail.com",
    address: "گلشن، جنب پاساژ محمد رسول الله",
    colors: {
      primary: "#f97316",
      primaryDark: "#ea580c",
      primaryLight: "#fb923c",
      dark: "#1f2937",
      white: "#ffffff",
    },
  },

  /* ---------- محیط ---------- */
  env: {
    // "demo" = localStorage | "production" = API واقعی
    mode: "demo",
    isDemo: true,
    apiBaseUrl: "", // بعداً پر می‌شود (از .env یا سرور)
  },

  /* ---------- کلیدهای localStorage (هماهنگ با کد فعلی) ---------- */
  storageKeys: {
    products: "bl_admin_products",
    catalog: "ALL_PRODUCTS", // read-only از products-data.js
    orders: "bl_orders",
    users: "registeredUsers",
    currentUser: "blUser",
    addresses: "bl_addresses",
    wishlist: "wishlist",
    cart: "shoppingCart",
    cartLegacy: ["cartItems", "cart", "bl_cart"],
    tickets: "bl_tickets",
    notifications: "notifications",
    walletBalance: "bl_wallet_balance",
    walletTx: "bl_wallet_tx",
    adminSession: "bl_admin_session",
    adminProducts: "bl_admin_products",
    bugReports: "bl_bug_reports",
  },

  /* ---------- محدودیت‌ها ---------- */
  limits: {
    maxCartItems: 99,
    maxCompareItems: 4,
    maxProductImages: 50,
    maxNotifications: 500,
    maxWalletTx: 100,
    maxBugReports: 200,
    maxTicketMessages: 200,
  },

  /* ---------- دسته‌بندی‌ها (مرجع واحد) ---------- */
  categories: {
    mobile: "گوشی موبایل",
    laptop: "لپ‌تاپ",
    tablet: "تبلت",
    watch: "ساعت هوشمند",
    accessory: "لوازم جانبی",
  },

  /* ---------- برندهای شناخته‌شده ---------- */
  brands: {
    samsung: "سامسونگ",
    apple: "اپل",
    xiaomi: "شیائومی",
    huawei: "هوآوی",
    asus: "ایسوس",
    hp: "اچ‌پی",
    dell: "دل",
    lenovo: "لنوو",
    sony: "سونی",
    xo: "ایکس او",
    tesco: "تسکو",
    hiska: "هیسکا",
    baseus: "باسئوس",
    anker: "انکر",
    garmin: "گارمن",
    amazfit: "امیزفیت",
    jbl: "JBL",
    marshall: "مارشال",
    generic: "متفرقه",
  },

  /* ---------- وضعیت‌ها ---------- */
  orderStatus: {
    pending: { label: "در انتظار پرداخت", class: "warning" },
    processing: { label: "در حال پردازش", class: "info" },
    shipped: { label: "ارسال شده", class: "info" },
    delivered: { label: "تحویل شده", class: "success" },
    cancelled: { label: "لغو شده", class: "danger" },
  },

  ticketStatus: {
    open: { label: "باز", class: "warning" },
    answered: { label: "پاسخ داده", class: "info" },
    closed: { label: "بسته", class: "neutral" },
  },

  /* ---------- هشدار امنیتی (برای نمایش در UI) ---------- */
  security: {
    demoWarning:
      "این نسخه Demo است و داده‌ها فقط در همین مرورگر ذخیره می‌شوند. " +
      "برای استفاده واقعی باید به بک‌اند امن متصل شود.",
    authWarning:
      "احراز هویت در حالت Demo امنیت واقعی ندارد و صرفاً برای آزمایش است.",
  },
};

/* --- helper برای خواندن تنظیمات --- */
window.BM_CONFIG.get = function (path, fallback = null) {
  try {
    const keys = String(path || "").split(".");
    let cur = window.BM_CONFIG;
    for (const k of keys) {
      if (cur == null) return fallback;
      cur = cur[k];
    }
    return cur == null ? fallback : cur;
  } catch (e) {
    return fallback;
  }
};
