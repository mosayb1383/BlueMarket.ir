/* ============================================
   CART — بلو مارکت
   ============================================ */

(() => {
  "use strict";

  const state = {
    items: [],
    coupon: null,
    couponDiscount: 0,
    subtotal: 0,
    total: 0,
  };

  const coupons = {
    SAVE10: {
      type: "percent",
      value: 10,
      minPurchase: 500000,
      label: "۱۰٪ تخفیف",
    },
    WELCOME: {
      type: "fixed",
      value: 100000,
      minPurchase: 300000,
      label: "۱۰۰ هزار تومان تخفیف",
    },
    BLUEMARKET20: {
      type: "percent",
      value: 20,
      minPurchase: 2000000,
      label: "۲۰٪ تخفیف",
    },
    BLUE20: {
      type: "percent",
      value: 20,
      minPurchase: 500000,
      label: "۲۰٪ تخفیف",
    },
  };

  function esc(s) {
    return String(s ?? "").replace(
      /[&<>"']/g,
      (ch) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[ch],
    );
  }

  function num(n) {
    return (Number(n) || 0).toLocaleString("fa-IR");
  }
  function price(n) {
    return `${num(n)} تومان`;
  }

  function toast(msg, type = "info") {
    document.querySelector(".cart-toast")?.remove();
    const el = document.createElement("div");
    el.className = `cart-toast ${type}`;
    const icon =
      type === "success"
        ? "check-circle-fill"
        : type === "error"
          ? "x-circle-fill"
          : type === "warning"
            ? "exclamation-triangle-fill"
            : "info-circle-fill";
    el.innerHTML = `<i class="bi bi-${icon}"></i><span>${esc(msg)}</span>`;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add("show"));
    setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => el.remove(), 350);
    }, 2800);
  }

  function read() {
    try {
      if (window.CartStore?.read) return window.CartStore.read();
    } catch (e) {}
    try {
      return JSON.parse(localStorage.getItem("shoppingCart") || "[]");
    } catch (e) {
      return [];
    }
  }

  function write(items) {
    if (window.CartStore?.write) return window.CartStore.write(items);
    try {
      localStorage.setItem("shoppingCart", JSON.stringify(items));
      window.dispatchEvent(
        new CustomEvent("bl:cart-updated", { detail: { items } }),
      );
    } catch (e) {
      console.error("Cart write error:", e);
    }
    return items;
  }

  function recalc() {
    state.subtotal = state.items.reduce((s, i) => s + i.price * i.quantity, 0);
    state.couponDiscount = 0;
    if (state.coupon && state.subtotal >= state.coupon.minPurchase) {
      if (state.coupon.type === "percent") {
        state.couponDiscount = Math.floor(
          (state.subtotal * state.coupon.value) / 100,
        );
      } else if (state.coupon.type === "fixed") {
        state.couponDiscount = Math.min(state.coupon.value, state.subtotal);
      }
    }
    state.total = Math.max(0, state.subtotal - state.couponDiscount);
  }

  function updateBadge() {
    const count = state.items.reduce((s, i) => s + i.quantity, 0);
    document.querySelectorAll(".cart-badge").forEach((el) => {
      el.textContent = count > 99 ? "۹۹+" : num(count);
      el.style.display = count ? "flex" : "none";
    });
    const txt = document.getElementById("cartCountText");
    if (txt) {
      txt.textContent = count ? `${num(count)} محصول در سبد` : "سبد خالی است";
    }
  }

  function renderEmpty(container) {
    container.innerHTML = `
            <div class="bm-empty-cart">
                <div class="bm-empty-cart-icon"><i class="bi bi-cart-x"></i></div>
                <h3>سبد خریدت هنوز خالیه!</h3>
                <p>محصولات موردعلاقه‌ات رو انتخاب کن تا اینجا ببینیشون.</p>
                <div class="bm-empty-cart-actions">
                    <a href="products.html" class="primary"><i class="bi bi-shop"></i> مشاهده محصولات</a>
                    <a href="index.html" class="outline"><i class="bi bi-house"></i> صفحه اصلی</a>
                </div>
            </div>
        `;
    const bottomActions = document.getElementById("cartBottomActions");
    if (bottomActions) bottomActions.style.display = "none";
  }

  function renderItem(item) {
    return `
            <article class="bm-cart-item" data-id="${esc(item.id)}" data-color="${esc(item.color || "")}">
                <a href="product.html?id=${encodeURIComponent(item.id)}" class="bm-cart-item-img">
                    <img src="${esc(item.image)}" alt="${esc(item.name)}" loading="lazy" onerror="this.onerror=null;this.src='images/products/placeholder-product.svg'">
                </a>
                <div class="bm-cart-item-info">
                    <a href="product.html?id=${encodeURIComponent(item.id)}" class="bm-cart-item-name">${esc(item.name)}</a>
                    <div class="bm-cart-item-meta">
                        <span><i class="bi bi-palette"></i> رنگ: ${esc(item.color || "پیش‌فرض")}</span>
                        <span class="bm-cart-availability"><i class="bi bi-check-circle-fill"></i> آماده ارسال</span>
                    </div>
                    <div class="bm-cart-qty">
                        <button type="button" onclick="changeQuantity('${esc(item.id)}','${esc(item.color || "")}',1)" aria-label="افزایش"><i class="bi bi-plus-lg"></i></button>
                        <output>${num(item.quantity)}</output>
                        <button type="button" onclick="changeQuantity('${esc(item.id)}','${esc(item.color || "")}',-1)" aria-label="کاهش"><i class="bi bi-dash-lg"></i></button>
                    </div>
                </div>
                <div class="bm-cart-item-price">
                    <span class="current">${price(item.price * item.quantity)}</span>
                    ${item.oldPrice ? `<span class="old">${price(item.oldPrice * item.quantity)}</span>` : ""}
                    <small>هر عدد: ${price(item.price)}</small>
                </div>
                <div class="bm-cart-item-actions">
                    <button type="button" class="bm-cart-action-btn bm-wish" onclick="addToWishlist('${esc(item.id)}')" aria-label="علاقه‌مندی"><i class="bi bi-heart"></i></button>
                    <button type="button" class="bm-cart-action-btn bm-del" onclick="removeItem('${esc(item.id)}','${esc(item.color || "")}')" aria-label="حذف"><i class="bi bi-trash3"></i></button>
                </div>
            </article>
        `;
  }

  function render() {
    const container = document.getElementById("cartItemsContainer");
    if (!container) return;

    if (!state.items.length) {
      renderEmpty(container);
    } else {
      container.innerHTML = state.items.map(renderItem).join("");
      const bottomActions = document.getElementById("cartBottomActions");
      if (bottomActions) bottomActions.style.display = "flex";
    }
    updateBadge();
    renderRecommended();
    updateCouponUI();
  }

  function persist() {
    state.items = write(state.items);
    recalc();
    render();
  }

  function findItem(id, color) {
    return state.items.find(
      (i) =>
        String(i.id) === String(id) &&
        String(i.color || "") === String(color || ""),
    );
  }

  window.changeQuantity = function (id, color, delta) {
    const item = findItem(id, color);
    if (!item) return;
    item.quantity = Math.max(
      1,
      Math.min(99, item.quantity + Number(delta || 0)),
    );
    persist();
  };

  window.removeItem = function (id, color) {
    state.items = state.items.filter(
      (i) =>
        !(
          String(i.id) === String(id) &&
          String(i.color || "") === String(color || "")
        ),
    );
    if (
      state.coupon &&
      state.items.reduce((s, i) => s + i.price * i.quantity, 0) <
        state.coupon.minPurchase
    ) {
      state.coupon = null;
      resetCouponUI();
    }
    persist();
    toast("محصول از سبد حذف شد", "success");
  };

  window.clearCart = function () {
    if (!state.items.length) return toast("سبد خالی است");
    if (!confirm("کل سبد خرید حذف شود؟")) return;
    state.items = [];
    state.coupon = null;
    resetCouponUI();
    persist();
    toast("سبد خرید پاک شد", "success");
  };

  window.addToWishlist = function (id) {
    if (
      typeof requireLogin === "function" &&
      !requireLogin("افزودن به علاقه‌مندی‌ها")
    )
      return;
    const item = state.items.find((i) => String(i.id) === String(id));
    if (!item) return;
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem("wishlist") || "[]");
    } catch (e) {}
    if (list.some((x) => String(x.id) === String(id))) {
      return toast("این محصول در علاقه‌مندی‌ها وجود دارد", "info");
    }
    list.push({ ...item, addedAt: new Date().toISOString() });
    localStorage.setItem("wishlist", JSON.stringify(list));
    toast("به علاقه‌مندی‌ها اضافه شد", "success");
  };

  function updateCouponUI(msg, type = "info") {
    const el = document.getElementById("couponMessage");
    if (!el) return;
    if (!msg) {
      el.textContent = "";
      el.className = "bm-coupon-message";
      return;
    }
    el.textContent = msg;
    el.className = `bm-coupon-message ${type}`;
  }

  function resetCouponUI() {
    const input = document.getElementById("couponCode");
    if (input) input.value = "";
    updateCouponUI("");
  }

     window.applyCoupon = function () {
       const input = document.getElementById("couponCode");
       if (!input) return;
       const code = input.value.trim().toUpperCase();
       if (!code) return updateCouponUI("کد تخفیف را وارد کنید", "error");

       // 1. کدهای پیش‌فرض (اگر توی localStorage نبودن، از اینجا خونده میشن)
       const defaultCoupons = {
         SAVE10: {
           type: "percent",
           value: 10,
           minPurchase: 500000,
           label: "۱۰٪ تخفیف",
         },
         WELCOME: {
           type: "fixed",
           value: 100000,
           minPurchase: 300000,
           label: "۱۰۰ هزار تومان تخفیف",
         },
         BLUEMARKET20: {
           type: "percent",
           value: 20,
           minPurchase: 2000000,
           label: "۲۰٪ تخفیف",
         },
         BLUE20: {
           type: "percent",
           value: 20,
           minPurchase: 500000,
           label: "۲۰٪ تخفیف",
         },
       };

       let c = null;
       let isFromAdmin = false;

       // چک کردن کدهای ادمین
       let couponsList = [];
       try {
         couponsList = JSON.parse(localStorage.getItem("bl_coupons") || "[]");
       } catch (e) {}
       const adminCoupon = couponsList.find(
         (x) => x.code.toUpperCase() === code,
       );

       if (adminCoupon) {
         c = adminCoupon;
         isFromAdmin = true;
       } else if (defaultCoupons[code]) {
         c = defaultCoupons[code];
       }

       if (!c) {
         return updateCouponUI("کد تخفیف معتبر نیست", "error");
       }

       // چک کردن تاریخ انقضا (فقط برای کدهای ادمین)
       if (isFromAdmin && c.expireDate) {
         // تاریخ امروز رو به صورت شمسی (YYYY/MM/DD) می‌گیریم
         const today = new Intl.DateTimeFormat("fa-IR", {
           year: "numeric",
           month: "2-digit",
           day: "2-digit",
         }).format(new Date());

         // تبدیل اعداد فارسی به انگلیسی برای مقایسه دقیق
         const toEn = (s) =>
           s.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
         const todayEn = toEn(today);
         const expireEn = toEn(c.expireDate);

         if (expireEn < todayEn) {
           return updateCouponUI("این کد تخفیف منقضی شده است", "error");
         }
       }

       recalc();
       const minP = c.minPurchase || 0;
       if (state.subtotal < minP) {
         return updateCouponUI(`حداقل خرید ${price(minP)} است`, "error");
       }

       state.coupon = {
         code: code,
         type: c.type,
         value: c.value,
         minPurchase: minP,
         label:
           c.label ||
           (c.type === "percent"
             ? `${c.value}٪ تخفیف`
             : `${c.value.toLocaleString("fa-IR")} تومان تخفیف`),
       };
       recalc();
       updateCouponUI(`کد ${code} اعمال شد · ${state.coupon.label}`, "success");
       input.value = "";
     };

      
  window.proceedToCheckout = function () {
    if (!state.items.length) return toast("سبد خرید خالی است", "error");

    const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
    if (!user?.isLoggedIn) {
      if (typeof requireLogin === "function") return requireLogin("تکمیل خرید");
      toast("برای تکمیل خرید وارد شوید", "warning");
      return;
    }

    recalc();
    const payload = {
      items: state.items,
      coupon: state.coupon,
      couponDiscount: state.couponDiscount,
      subtotal: state.subtotal,
      total: state.total,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("checkoutData", JSON.stringify(payload));
    window.location.href = "checkout.html";
  };

  function renderRecommended() {
    const container = document.getElementById("recommendedProducts");
    if (!container) return;
    const products = (window.ALL_PRODUCTS || [])
      .filter((p) => !state.items.some((i) => String(i.id) === String(p.id)))
      .filter((p) => p.isBestseller || p.isNew)
      .slice(0, 4);

    if (!products.length) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = products
      .map(
        (p) => `
            <div class="bm-product-card" onclick="location.href='product.html?id=${p.id}'" role="link" tabindex="0">
                <div class="bm-product-img">
                    <img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" onerror="this.onerror=null;this.src='images/products/placeholder-product.svg'">
                </div>
                <div class="bm-product-info">
                    <h3 class="bm-product-title">${esc(p.shortName || p.name)}</h3>
                    <div class="bm-product-price"><span class="bm-current-price">${price(p.price)}</span></div>
                </div>
            </div>
        `,
      )
      .join("");
  }

  function init() {
    state.items = read();
    recalc();
    render();

    document.getElementById("couponCode")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        window.applyCoupon();
      }
    });

    window.addEventListener("storage", (e) => {
      if (e.key === "shoppingCart") {
        state.items = read();
        recalc();
        render();
      }
    });
    window.addEventListener("bl:cart-updated", () => {
      state.items = read();
      recalc();
      render();
    });

    window.addEventListener("beforeunload", () => {
      try {
        if (window.CartStore?.write) window.CartStore.write(state.items);
      } catch (e) {}
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
