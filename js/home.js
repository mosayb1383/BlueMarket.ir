/* ============================================
   HOME PAGE — بلو مارکت (نسخه نهایی)
   ============================================ */

"use strict";

const HomePage = {
  init() {
    if (!window.ALL_PRODUCTS || !Array.isArray(window.ALL_PRODUCTS)) {
      console.warn("[Home] ALL_PRODUCTS آماده نیست، تلاش مجدد...");
      setTimeout(() => this.init(), 200);
      return;
    }

    this.renderDiscount();
    this.renderMobiles();
    this.renderAccessories();
    this.renderTabs();
    this.renderNew();
    this.renderDealOfDay();
    this.renderBestsellers();
    this.renderRecent();
    this.startDiscountTimer();
    this.setupHeaderScroll();
    this.updateCartBadge();
    this.setupTabsListeners();
    this.renderCompareBar();
    this.setupBackToTop();
    this.trackRecentView();
  },

  productCardHTML(p, options = {}) {
    const discountPercent =
      p.oldPrice && p.oldPrice > p.price
        ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)
        : 0;
    const showBadgeRank = options.rank || false;
    const showCompare = options.showCompare !== false;
    const isDemo = p.isDemo === true;

    return `
            <div class="bm-product-card" onclick="location.href='product.html?id=${p.id}'" role="link" tabindex="0">
                ${showBadgeRank ? `<div class="bm-product-rank">${options.rank}</div>` : ""}
                ${showCompare ? `<button type="button" class="bm-product-compare-btn" data-id="${p.id}" onclick="event.stopPropagation();toggleCompare(${p.id})" title="افزودن به مقایسه"><i class="bi bi-columns-gap"></i></button>` : ""}
                <div class="bm-product-img">
                    <img src="${this.esc(p.image || "images/products/placeholder-product.svg")}" alt="${this.esc(p.name)}" loading="lazy" onerror="this.onerror=null;this.src='images/products/placeholder-product.svg'">
                    ${p.isNew ? '<span class="bm-badge bm-badge-new">جدید</span>' : ""}
                    ${p.isBestseller && !showBadgeRank ? '<span class="bm-badge bm-badge-best"><i class="bi bi-fire"></i> پرفروش</span>' : ""}
                    ${discountPercent > 0 ? `<span class="bm-badge bm-badge-discount">${discountPercent}٪</span>` : ""}
                    ${isDemo ? '<span class="bm-badge" style="position:absolute;top:8px;left:8px;background:#6b7280;font-size:0.65rem;padding:2px 8px;border-radius:8px;z-index:2;">Demo</span>' : ""}
                </div>
                <div class="bm-product-info">
                    <h3 class="bm-product-title">${this.esc(p.shortName || p.name)}</h3>
                    <div class="bm-product-price">
                        ${p.oldPrice ? `<span class="bm-old-price">${this.formatPrice(p.oldPrice)}</span>` : ""}
                        <span class="bm-current-price">${this.formatPrice(p.price)}</span>
                    </div>
                    <div class="bm-product-rating">
                        ${this.renderStars(p.rating)}
                        <span>(${p.rating.toFixed(1)})</span>
                    </div>
                </div>
            </div>
        `;
  },

  renderDiscount() {
    const container = document.getElementById("discountProductsContainer");
    if (!container) return;

    const products = ALL_PRODUCTS.filter(
      (p) => p.oldPrice && p.oldPrice > p.price,
    )
      .map((p) => ({
        ...p,
        discount: Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100),
      }))
      .sort((a, b) => b.discount - a.discount)
      .slice(0, 12);

    if (products.length === 0) {
      container.innerHTML =
        '<p style="color:#6b7280;text-align:center;padding:20px;">تخفیفی فعال نیست</p>';
      return;
    }

    container.innerHTML = products.map((p) => this.productCardHTML(p)).join("");
    this.syncCompareButtons();
  },

  renderMobiles() {
    const container = document.getElementById("mobileProductsContainer");
    if (!container) return;
    const products = ALL_PRODUCTS.filter((p) => p.category === "mobile")
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8);
    container.innerHTML = products.map((p) => this.productCardHTML(p)).join("");
    this.syncCompareButtons();
  },

  renderAccessories() {
    const container = document.getElementById("accessoryProductsContainer");
    if (!container) return;
    const products = ALL_PRODUCTS.filter((p) => p.category === "accessory")
      .sort(
        (a, b) =>
          (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0) ||
          b.rating - a.rating,
      )
      .slice(0, 8);
    container.innerHTML = products.map((p) => this.productCardHTML(p)).join("");
    this.syncCompareButtons();
  },

  renderTabs(cat = "mobile") {
    const container = document.getElementById("tabsContent");
    if (!container) return;

    const products = ALL_PRODUCTS.filter((p) => p.category === cat)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8);

    if (products.length === 0) {
      container.innerHTML = `<p style="text-align:center;color:#6b7280;padding:40px;width:100%">محصولی در این دسته نیست</p>`;
      return;
    }

    container.classList.remove("bm-tab-changing");
    void container.offsetWidth;
    container.classList.add("bm-tab-changing");

    container.innerHTML = `
      <div class="bm-tabs-slider">
        ${products.map((p) => this.productCardHTML(p)).join("")}
      </div>
    `;
    this.syncCompareButtons();
  },

  setupTabsListeners() {
    document.querySelectorAll(".bm-tab").forEach((tab) => {
      tab.addEventListener("click", (e) => {
        document
          .querySelectorAll(".bm-tab")
          .forEach((t) => t.classList.remove("active"));
        e.currentTarget.classList.add("active");
        e.currentTarget.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
        this.renderTabs(e.currentTarget.dataset.cat);
      });
    });
  },

  renderNew() {
    const container = document.getElementById("newProductsContainer");
    if (!container) return;

    let products = ALL_PRODUCTS.filter((p) => p.isNew);
    if (products.length < 4) {
      const rest = ALL_PRODUCTS.filter((p) => !p.isNew)
        .sort((a, b) => (b.id || 0) - (a.id || 0))
        .slice(0, 10 - products.length);
      products = [...products, ...rest];
    }
    products = products.sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 10);

    if (products.length === 0) {
      container.innerHTML =
        '<p style="color:#6b7280;text-align:center;padding:20px;width:100%">محصول جدیدی موجود نیست</p>';
      return;
    }

    container.innerHTML = products.map((p) => this.productCardHTML(p)).join("");
    this.syncCompareButtons();
  },

  renderDealOfDay() {
    const container = document.getElementById("dealCard");
    if (!container) return;

    const withDiscount = ALL_PRODUCTS.filter(
      (p) => p.oldPrice && p.oldPrice > p.price,
    );
    if (withDiscount.length === 0) {
      container.style.display = "none";
      return;
    }

    const product = withDiscount.sort((a, b) => {
      const dA = (a.oldPrice - a.price) / a.oldPrice;
      const dB = (b.oldPrice - b.price) / b.oldPrice;
      return dB - dA;
    })[0];

    const discountPercent = Math.round(
      ((product.oldPrice - product.price) / product.oldPrice) * 100,
    );
    const key = "bl_deal_end_at";
    let endAt = Number(localStorage.getItem(key) || 0);
    if (!endAt || endAt <= Date.now()) {
      endAt = Date.now() + 6 * 60 * 60 * 1000;
      localStorage.setItem(key, String(endAt));
    }

    const fa = (n) =>
      String(n)
        .padStart(2, "0")
        .replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

    container.innerHTML = `
      <div class="bm-deal-particle"></div><div class="bm-deal-particle"></div><div class="bm-deal-particle"></div><div class="bm-deal-particle"></div>
      <div class="bm-deal-content">
        <div class="bm-deal-badge"><i class="bi bi-fire"></i> پیشنهاد شگفت‌انگیز</div>
        <h3 class="bm-deal-title">تا ${discountPercent}٪ تخفیف ویژه!</h3>
        <p class="bm-deal-desc">${this.esc(product.shortName || product.name)} — فقط برای چند ساعت آینده با این قیمت!</p>
        <div class="bm-deal-timer" id="dealTimer">
          <div class="bm-deal-time-box"><span class="num" id="dHours">۰۰</span><span class="lbl">ساعت</span></div>
          <span class="bm-deal-time-sep">:</span>
          <div class="bm-deal-time-box"><span class="num" id="dMins">۰۰</span><span class="lbl">دقیقه</span></div>
          <span class="bm-deal-time-sep">:</span>
          <div class="bm-deal-time-box"><span class="num" id="dSecs">۰۰</span><span class="lbl">ثانیه</span></div>
        </div>
        <a href="product.html?id=${product.id}" class="bm-deal-btn"><i class="bi bi-cart-plus"></i> همین حالا بخر — ${this.formatPrice(product.price)}</a>
      </div>
      <div class="bm-deal-visual"><div class="bm-deal-product-img"><img src="${this.esc(product.image)}" alt="${this.esc(product.name)}" loading="lazy" onerror="this.onerror=null;this.src='images/products/placeholder-product.svg'"></div></div>
    `;

    const tick = () => {
      const left = Math.max(0, endAt - Date.now());
      const hours = Math.floor(left / 3600000);
      const mins = Math.floor((left % 3600000) / 60000);
      const secs = Math.floor((left % 60000) / 1000);
      const h = document.getElementById("dHours");
      const m = document.getElementById("dMins");
      const s = document.getElementById("dSecs");
      if (h) h.textContent = fa(hours);
      if (m) m.textContent = fa(mins);
      if (s) s.textContent = fa(secs);
      if (!left) clearInterval(window.__blDealTimer);
    };
    tick();
    if (window.__blDealTimer) clearInterval(window.__blDealTimer);
    window.__blDealTimer = setInterval(tick, 1000);
  },

  renderBestsellers() {
    const container = document.getElementById("bestsellersContainer");
    if (!container) return;
    const products = ALL_PRODUCTS.filter((p) => p.isBestseller)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);
    container.innerHTML = products
      .map((p, i) =>
        this.productCardHTML(p, { rank: i + 1, showCompare: false }),
      )
      .join("");
  },

  renderRecent() {
    const container = document.getElementById("recentContainer");
    const section = document.getElementById("recentSection");
    if (!container || !section) return;

    let ids = [];
    try {
      ids = JSON.parse(localStorage.getItem("bl_recent") || "[]");
    } catch (e) {
      ids = [];
    }

    let products = ids
      .map((id) => ALL_PRODUCTS.find((p) => String(p.id) === String(id)))
      .filter(Boolean);

    if (products.length < 10) {
      const fallbackProducts = ALL_PRODUCTS.filter(
        (p) => !products.some((seen) => String(seen.id) === String(p.id)),
      )
        .sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
        .slice(0, 10 - products.length);
      products = [...products, ...fallbackProducts];
    }

    if (products.length === 0) {
      section.style.display = "none";
      return;
    }
    products = products.slice(0, 10);
    section.style.display = "block";
    container.innerHTML = products.map((p) => this.productCardHTML(p)).join("");
    this.syncCompareButtons();
  },

  trackRecentView() {
    window.addEventListener("focus", () => this.renderRecent());
  },

  startDiscountTimer() {
    const timer = document.getElementById("discountTimer");
    if (!timer) return;
    const key = "bl_discount_end_at";
    let endAt = Number(localStorage.getItem(key) || 0);
    if (!endAt || endAt <= Date.now()) {
      endAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
      localStorage.setItem(key, String(endAt));
    }
    if (window.__blDiscountTimer) clearInterval(window.__blDiscountTimer);
    const tick = () => {
      const left = Math.max(0, endAt - Date.now());
      if (!left) {
        timer.innerHTML =
          '<i class="bi bi-lightning-charge-fill"></i> پیشنهادها پایان یافت';
        clearInterval(window.__blDiscountTimer);
        return;
      }
      const days = Math.floor(left / 86400000);
      const hours = Math.floor((left % 86400000) / 3600000);
      const mins = Math.floor((left % 3600000) / 60000);
      const secs = Math.floor((left % 60000) / 1000);
      const fa = (n) =>
        String(n)
          .padStart(2, "0")
          .replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
      timer.innerHTML = `<i class="bi bi-clock"></i> <span>پایان تا ${fa(days)} روز ${fa(hours)}:${fa(mins)}:${fa(secs)}</span>`;
    };
    tick();
    window.__blDiscountTimer = setInterval(tick, 1000);
    window.addEventListener(
      "pagehide",
      () => clearInterval(window.__blDiscountTimer),
      { once: true },
    );
  },

  setupHeaderScroll() {
    const wrapper = document.getElementById("glassHeaderWrapper");
    if (!wrapper) return;
    window.addEventListener(
      "scroll",
      () => {
        wrapper.classList.toggle("scrolled", window.scrollY > 40);
      },
      { passive: true },
    );
  },

  updateCartBadge() {
    const cart = window.CartStore
      ? window.CartStore.read()
      : (() => {
          try {
            return JSON.parse(localStorage.getItem("shoppingCart") || "[]");
          } catch (e) {
            return [];
          }
        })();
    const total = cart.reduce((s, i) => s + (Number(i.quantity) || 0), 0);
    document.querySelectorAll(".cart-badge").forEach((b) => {
      b.textContent = total.toLocaleString("fa-IR");
      b.style.display = total > 0 ? "flex" : "none";
    });
  },

  renderCompareBar() {
    const bar = document.getElementById("compareBar");
    if (!bar) return;
    const list = JSON.parse(localStorage.getItem("bl_compare") || "[]");
    const items = document.getElementById("compareItems");
    if (!items) return;
    if (list.length === 0) {
      bar.classList.remove("show");
      items.innerHTML = "";
      return;
    }
    items.innerHTML = list
      .map((id) => {
        const p = ALL_PRODUCTS.find((x) => String(x.id) === String(id));
        if (!p) return "";
        return `<div class="bm-compare-item"><img src="${this.esc(p.image)}" alt="" onerror="this.src='images/products/placeholder-product.svg'"><span class="name">${this.esc(p.shortName || p.name)}</span><button type="button" class="rm" onclick="toggleCompare(${p.id})" title="حذف">×</button></div>`;
      })
      .join("");
    bar.classList.add("show");
  },

  syncCompareButtons() {
    const list = JSON.parse(localStorage.getItem("bl_compare") || "[]");
    document.querySelectorAll(".bm-product-compare-btn").forEach((btn) => {
      const id = Number(btn.dataset.id);
      btn.classList.toggle("selected", list.includes(id));
    });
  },

  setupBackToTop() {
    const btn = document.getElementById("backToTop");
    const circle = document.getElementById("progressCircle");
    if (!btn || !circle) return;
    const circumference = 2 * Math.PI * 24;
    const onScroll = () => {
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = height > 0 ? scrolled / height : 0;
      circle.style.strokeDashoffset = circumference * (1 - progress);
      btn.classList.toggle("show", scrolled > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  },

  formatPrice(n) {
    return (n || 0).toLocaleString("fa-IR") + " تومان";
  },

  renderStars(rating) {
    let s = "";
    const full = Math.floor(rating);
    const half = rating % 1 !== 0;
    for (let i = 0; i < full; i++) s += '<i class="bi bi-star-fill"></i>';
    if (half) s += '<i class="bi bi-star-half"></i>';
    for (let i = 0; i < 5 - Math.ceil(rating); i++)
      s += '<i class="bi bi-star"></i>';
    return s;
  },

  esc(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  },
};

window.slideDiscount = function (dir) {
  const s = document.getElementById("discountProductsContainer");
  if (s) s.scrollBy({ left: dir * 260, behavior: "smooth" });
};
window.slideMobile = function (dir) {
  const s = document.getElementById("mobileProductsContainer");
  if (s) s.scrollBy({ left: dir * 260, behavior: "smooth" });
};
window.slideAccessory = function (dir) {
  const s = document.getElementById("accessoryProductsContainer");
  if (s) s.scrollBy({ left: dir * 260, behavior: "smooth" });
};
window.slideNew = function (dir) {
  const s = document.getElementById("newProductsContainer");
  if (s) s.scrollBy({ left: dir * 260, behavior: "smooth" });
};
window.slideRecent = function (dir) {
  const s = document.getElementById("recentContainer");
  if (s) s.scrollBy({ left: dir * 260, behavior: "smooth" });
};
window.slideTabs = function (dir) {
  const s = document.querySelector(".bm-tabs-slider");
  if (s) s.scrollBy({ left: dir * 260, behavior: "smooth" });
};

window.toggleCompare = function (id) {
  let list = JSON.parse(localStorage.getItem("bl_compare") || "[]");
  if (list.includes(id)) {
    list = list.filter((x) => x !== id);
  } else {
    if (list.length >= 4) {
      alert("حداکثر ۴ محصول می‌تونی مقایسه کنی");
      return;
    }
    list.push(id);
  }
  localStorage.setItem("bl_compare", JSON.stringify(list));
  HomePage.renderCompareBar();
  HomePage.syncCompareButtons();
};
window.clearCompare = function () {
  localStorage.removeItem("bl_compare");
  HomePage.renderCompareBar();
  HomePage.syncCompareButtons();
};
window.goToCompare = function () {
  const list = JSON.parse(localStorage.getItem("bl_compare") || "[]");
  if (list.length < 2) {
    alert("حداقل ۲ محصول برای مقایسه انتخاب کن");
    return;
  }
  location.href = `compare.html?ids=${list.join(",")}`;
};

window.clearRecent = function () {
  localStorage.removeItem("bl_recent");
  HomePage.renderRecent();
};

window.subscribeNewsletter = function (form) {
  const input = form.querySelector("input");
  const value = input.value.trim();
  if (!value) return;
  localStorage.setItem("bl_newsletter", value);
  const btn = form.querySelector("button");
  const original = btn.innerHTML;
  btn.innerHTML = '<i class="bi bi-check-circle"></i> ثبت شد!';
  btn.style.background = "linear-gradient(135deg, #10b981, #059669)";
  input.value = "";
  setTimeout(() => {
    btn.innerHTML = original;
    btn.style.background = "";
  }, 3000);
};

window.scrollToTop = function () {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

function initTopbar() {
  const bar = document.getElementById("bmTopbar");
  if (!bar) return;
  if (localStorage.getItem("bl_topbar_closed") === "1")
    bar.classList.add("hidden");
}
window.closeTopbar = function () {
  const bar = document.getElementById("bmTopbar");
  if (!bar) return;
  bar.classList.add("hidden");
  localStorage.setItem("bl_topbar_closed", "1");
};

function initScrollProgress() {
  const bar = document.getElementById("scrollProgress");
  if (!bar) return;
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const p = h > 0 ? (window.scrollY / h) * 100 : 0;
    bar.style.width = p + "%";
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

window.openSupportChat = function () {
  if (typeof window.toggleSupportChat === "function") {
    window.toggleSupportChat();
    return;
  }
  const chat = document.querySelector(
    ".support-chat-panel, #supportChatPanel, .support-chat",
  );
  if (chat) {
    chat.classList.toggle("open");
    return;
  }
  const contact = document.querySelector('a[href*="contact"]');
  if (contact) contact.click();
};

window.HomePage = HomePage;

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => HomePage.init(), 150);
});
