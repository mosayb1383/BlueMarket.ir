/* ============================================
   MAIN — بلو مارکت (نسخه امن و نهایی)
   ============================================ */

"use strict";

const Utils = {
  formatPrice(n) {
    if (n === 0) return "رایگان";
    return (n || 0).toLocaleString("fa-IR") + " تومان";
  },
  formatPriceShort(n) {
    if (n >= 1000000000)
      return (n / 1000000000).toFixed(1).replace(".0", "") + " میلیارد";
    if (n >= 1000000)
      return (n / 1000000).toFixed(1).replace(".0", "") + " میلیون";
    if (n >= 1000) return (n / 1000).toFixed(0) + " هزار";
    return (n || 0).toLocaleString("fa-IR");
  },
  formatDate(dateString) {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("fa-IR");
    } catch (e) {
      return "—";
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
  readLS(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  },
  writeLS(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  },
  removeLS(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  },
  toEnglishDigits(str) {
    return String(str || "").replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
  },
  validatePhone(phone) {
    return /^09[0-9]{9}$/.test(
      this.toEnglishDigits(phone).replace(/[\s-]/g, ""),
    );
  },
  validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");
  },
  debounce(fn, delay = 250) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },
  throttle(fn, limit = 100) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },
};

function renderStars(rating) {
  let s = "";
  const full = Math.floor(rating);
  const half = rating % 1 !== 0;
  for (let i = 0; i < full; i++) s += '<i class="bi bi-star-fill"></i>';
  if (half) s += '<i class="bi bi-star-half"></i>';
  for (let i = 0; i < 5 - Math.ceil(rating); i++)
    s += '<i class="bi bi-star"></i>';
  return s;
}

function updateCartBadge() {
  const cart = window.CartStore
    ? window.CartStore.read()
    : Utils.readLS("shoppingCart", []);
  const total = cart.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0,
  );
  document.querySelectorAll(".cart-badge").forEach((badge) => {
    badge.textContent = total.toLocaleString("fa-IR");
    badge.style.display = total > 0 ? "flex" : "none";
  });
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function initLazyLoading() {
  const images = document.querySelectorAll("img[data-src]");
  if (!images.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
        observer.unobserve(img);
      }
    });
  });
  images.forEach((img) => observer.observe(img));
}

/* ========================================
   پاپ‌آپ لاگین سراسری
   ======================================== */
function createLoginPopup() {
  if (document.getElementById("globalLoginPopup")) return;
  const popup = document.createElement("div");
  popup.id = "globalLoginPopup";
  popup.className = "global-login-popup";
  popup.setAttribute("role", "dialog");
  popup.setAttribute("aria-modal", "true");
  popup.innerHTML = `
    <div class="global-login-content">
      <div class="global-login-icon"><i class="bi bi-person-lock"></i></div>
      <h4>ورود به حساب کاربری</h4>
      <p>برای انجام این عملیات، لطفاً ابتدا وارد حساب کاربری خود شوید.</p>
      <div class="global-login-buttons">
        <button type="button" class="btn-cancel" onclick="closeLoginPopup()">انصراف</button>
        <button type="button" class="btn-login" onclick="goToLoginPage()"><i class="bi bi-box-arrow-in-right"></i> ورود / ثبت‌نام</button>
      </div>
    </div>
  `;
  document.body.appendChild(popup);
  popup.addEventListener("click", (e) => {
    if (e.target === popup) closeLoginPopup();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLoginPopup();
  });
}

function showLoginPopup(actionName = null, returnUrl = null) {
  // 👈 اگه لاگین هست، اصلاً پاپ‌آپ نساز
  if (typeof isLoggedIn === "function" && isLoggedIn()) return;

  createLoginPopup();
  const currentPath =
    returnUrl ||
    (window.location.pathname.split("/").pop() || "index.html") +
      window.location.search;
  if (currentPath && !currentPath.includes("auth.html")) {
    try {
      localStorage.setItem("redirectAfterLogin", currentPath);
    } catch (e) {}
  }
  const popup = document.getElementById("globalLoginPopup");
  if (popup) {
    const messageEl = popup.querySelector(".global-login-content p");
    if (messageEl) {
      messageEl.textContent = actionName
        ? `برای ${actionName}، لطفاً ابتدا وارد حساب کاربری خود شوید.`
        : "کاربر عزیز، برای انجام این عملیات، لطفاً ابتدا وارد حساب کاربری خود شوید.";
    }
    const iconEl = popup.querySelector(".global-login-icon i");
    if (iconEl) {
      if (actionName && actionName.includes("سبد"))
        iconEl.className = "bi bi-cart-lock";
      else if (actionName && actionName.includes("علاقه"))
        iconEl.className = "bi bi-heart";
      else iconEl.className = "bi bi-person-lock";
    }
    popup.classList.add("show");
    document.body.style.overflow = "hidden";
  }
}

function closeLoginPopup() {
  const popup = document.getElementById("globalLoginPopup");
  if (popup) {
    popup.classList.remove("show");
    document.body.style.overflow = "";
    // 👈 پاک کردن کامل پاپ‌آپ از DOM
    setTimeout(() => popup.remove(), 300);
  }
}

function goToLoginPage() {
  closeLoginPopup();
  window.location.href = "auth.html";
}

/* ========================================
   دکمه سبد خرید (با چک کردن لاگین)
   ======================================== */
function goToCart(event) {
  if (event) event.preventDefault();
  if (typeof requireLogin === "function") {
    if (!requireLogin("مشاهده سبد خرید")) return;
  } else {
    const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
    if (!user || !user.isLoggedIn) {
      showLoginPopup("مشاهده سبد خرید");
      return;
    }
  }
  window.location.href = "cart.html";
}

window.Utils = Utils;
window.renderStars = renderStars;
window.updateCartBadge = updateCartBadge;
window.scrollToTop = scrollToTop;
window.initLazyLoading = initLazyLoading;
window.showLoginPopup = showLoginPopup;
window.closeLoginPopup = closeLoginPopup;
window.goToLoginPage = goToLoginPage;
window.goToCart = goToCart;

/* ========================================
   راه‌اندازی
   ======================================== */
document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  initLazyLoading();

  // 👈 پاک کردن هر پاپ‌آپ لاگین باقی‌مونده از قبل
  document.querySelectorAll(".global-login-popup").forEach((el) => el.remove());
  document.body.style.overflow = "";
});

window.homeSearch = function (event) {
  if (event) event.preventDefault();
  const desktop = document.getElementById("desktopSearchInput");
  const mobile = document.getElementById("mobileSearchInput");
  const term = String(
    (desktop && desktop.value) || (mobile && mobile.value) || "",
  ).trim();
  if (!term) {
    if (typeof showToast === "function")
      showToast("عبارت موردنظر را وارد کنید", "warning");
    return false;
  }
  try {
    localStorage.setItem("searchTerm", term);
  } catch (e) {}
  window.location.href = "products.html?q=" + encodeURIComponent(term);
  return false;
};

window.updateMobileAuthMenu = function () {
  const item = document.getElementById("mobileAuthMenuItem");
  if (!item) return;
  const logged =
    typeof isLoggedIn === "function"
      ? isLoggedIn()
      : !!(
          typeof getCurrentUser === "function" && getCurrentUser()?.isLoggedIn
        );
  item.innerHTML = logged
    ? '<a href="#" onclick="handleLogoutClick(event);return false;" class="text-danger"><i class="bi bi-box-arrow-right"></i> خروج از حساب</a>'
    : '<a href="auth.html" class="text-primary"><i class="bi bi-box-arrow-in-right"></i> ورود / ثبت‌نام</a>';
};

window.updateBottomNavActive = function () {
  const path =
    window.location.pathname.split("/").pop().replace(".html", "") || "index";
  const map = {
    index: "home",
    products: "shop",
    mobiles: "shop",
    laptops: "shop",
    tablets: "shop",
    watches: "shop",
    accessories: "shop",
    product: "shop",
    cart: "cart",
    checkout: "cart",
    account: "account",
    auth: "account",
  };
  document.querySelectorAll(".bottom-nav-item").forEach((el) => {
    const active = el.dataset.nav === (map[path] || "home");
    el.classList.toggle("active", active);
    if (active) el.setAttribute("aria-current", "page");
    else el.removeAttribute("aria-current");
  });
};

window.updateBottomNavCartBadge = function () {
  let cart = [];
  try {
    cart = window.CartStore
      ? window.CartStore.read()
      : JSON.parse(localStorage.getItem("shoppingCart") || "[]");
  } catch (e) {}
  const count = cart.reduce((n, x) => n + (Number(x.quantity) || 0), 0);
  document
    .querySelectorAll(
      ".bottom-nav-item .cart-badge,.glass-cart-btn .cart-badge",
    )
    .forEach((el) => {
      el.textContent = count > 99 ? "99+" : count.toLocaleString("fa-IR");
      el.style.display = count ? "flex" : "none";
    });
};

window.updateUserNotifVisibility = function () {
  const logged = typeof isLoggedIn === "function" ? isLoggedIn() : false;
  ["userNotifWrap", "userNotifWrapMobile"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = logged ? "block" : "none";
  });
  if (logged && window.UserNotifications?.updateBadge)
    window.UserNotifications.updateBadge();
};

window.addEventListener("bl:header-ready", () => {
  if (typeof updateAuthUI === "function") updateAuthUI();
  window.updateMobileAuthMenu();
  window.updateBottomNavActive();
  window.updateBottomNavCartBadge();
  window.updateUserNotifVisibility();
  document.querySelectorAll(".mobile-menu-group-toggle").forEach((btn) => {
    if (btn.dataset.bound === "1") return;
    btn.dataset.bound = "1";
    btn.addEventListener("click", () => {
      const group = btn.closest(".mobile-menu-group");
      group?.classList.toggle("expanded");
      btn.setAttribute(
        "aria-expanded",
        group?.classList.contains("expanded") ? "true" : "false",
      );
    });
  });
});

window.addEventListener("bl:auth-updated", () => {
  window.updateMobileAuthMenu();
  window.updateUserNotifVisibility();
  document.querySelectorAll(".global-login-popup").forEach((el) => el.remove());
  document.body.style.overflow = "";
});

window.addEventListener("storage", (e) => {
  if (["blUser", "shoppingCart", "bl_tickets", "bl_orders"].includes(e.key)) {
    window.updateMobileAuthMenu();
    window.updateBottomNavCartBadge();
    window.updateUserNotifVisibility();
  }
});

window.addEventListener("bl:cart-updated", () =>
  window.updateBottomNavCartBadge(),
);
window.addEventListener("bl:cart-updated", () => {
  if (typeof updateCartBadge === "function") updateCartBadge();
});

window.ensureMobileBottomNav = function () {
  if (window.matchMedia && !window.matchMedia("(max-width: 991px)").matches)
    return;
  if (document.querySelector(".mobile-bottom-nav")) return;
  const nav = document.createElement("nav");
  nav.className = "mobile-bottom-nav d-lg-none";
  nav.setAttribute("aria-label", "ناوبری موبایل");
  nav.innerHTML =
    '<a href="index.html" class="bottom-nav-item" data-nav="home"><i class="bi bi-house-door"></i><small>خانه</small></a><a href="products.html" class="bottom-nav-item" data-nav="shop"><i class="bi bi-shop"></i><small>فروشگاه</small></a><a href="cart.html" class="bottom-nav-item" data-nav="cart"><i class="bi bi-cart3"></i><small>سبد خرید</small><span class="cart-badge" aria-label="تعداد محصولات سبد خرید">0</span></a><a href="account.html" class="bottom-nav-item" data-nav="account"><i class="bi bi-person"></i><small>پروفایل</small></a>';
  document.body.appendChild(nav);
  window.updateBottomNavActive?.();
  window.updateBottomNavCartBadge?.();
};
window.addEventListener("bl:header-ready", () => {
  window.ensureMobileBottomNav?.();
  window.updateBottomNavActive?.();
  window.updateBottomNavCartBadge?.();
});
window.addEventListener("DOMContentLoaded", () => {
  window.ensureMobileBottomNav?.();
});
window.addEventListener("resize", () => {
  if (window.matchMedia("(max-width: 991px)").matches)
    window.ensureMobileBottomNav?.();
});

/* ========== جستجوی هوشمند ========== */
(function () {
  const initSearch = () => {
    const searchInput = document.querySelector(
      '.search-input, input[type="search"]',
    );
    if (!searchInput || searchInput.dataset.autocompleteReady) return;
    searchInput.dataset.autocompleteReady = "1";
    if (!searchInput.closest(".bm-search-wrapper")) {
      const wrapper = document.createElement("div");
      wrapper.className = "bm-search-wrapper";
      searchInput.parentNode.insertBefore(wrapper, searchInput);
      wrapper.appendChild(searchInput);
    }
    const wrapper = searchInput.closest(".bm-search-wrapper");
    const dropdown = document.createElement("div");
    dropdown.className = "bm-search-dropdown";
    wrapper.appendChild(dropdown);
    const renderResults = (query) => {
      if (!window.ALL_PRODUCTS) return;
      query = query.trim().toLowerCase();
      if (query.length < 2) {
        dropdown.classList.remove("show");
        return;
      }
      const results = ALL_PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.shortName && p.shortName.toLowerCase().includes(query)),
      ).slice(0, 6);
      if (results.length === 0) {
        dropdown.innerHTML = `<div class="bm-search-empty"><i class="bi bi-search"></i> نتیجه‌ای پیدا نشد</div>`;
        dropdown.classList.add("show");
        return;
      }
      dropdown.innerHTML = results
        .map(
          (p) =>
            `<a href="product.html?id=${p.id}" class="bm-search-item"><img src="${p.image}" alt="" onerror="this.src='images/products/placeholder-product.svg'"><div class="bm-search-item-info"><div class="bm-search-item-name">${p.shortName || p.name}</div><div class="bm-search-item-price">${(p.price || 0).toLocaleString("fa-IR")} تومان</div></div></a>`,
        )
        .join("");
      dropdown.classList.add("show");
    };
    searchInput.addEventListener("input", (e) => renderResults(e.target.value));
    searchInput.addEventListener("focus", (e) => {
      if (e.target.value.trim().length >= 2) renderResults(e.target.value);
    });
    document.addEventListener("click", (e) => {
      if (!wrapper.contains(e.target)) dropdown.classList.remove("show");
    });
  };
  window.addEventListener("bl:header-ready", () => setTimeout(initSearch, 300));
  document.addEventListener("DOMContentLoaded", () =>
    setTimeout(initSearch, 1000),
  );
})();

/* ========== جستجوی زنده ========== */
(function initLiveSearch() {
  const setup = () => {
    const inputs = document.querySelectorAll(
      ".bm-search-input, #desktopSearchInput, #mobileSearchInput, .search-input",
    );
    if (!inputs.length) return;
    inputs.forEach((input) => {
      if (input.dataset.liveSearchReady) return;
      input.dataset.liveSearchReady = "1";
      const wrapper = document.createElement("div");
      wrapper.className = "bm-search-wrapper";
      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);
      const dropdown = document.createElement("div");
      dropdown.className = "bm-search-dropdown";
      wrapper.appendChild(dropdown);
      const renderResults = (query) => {
        if (!window.ALL_PRODUCTS) return;
        query = query.trim().toLowerCase();
        if (query.length < 2) {
          dropdown.classList.remove("show");
          return;
        }
        const results = ALL_PRODUCTS.filter(
          (p) =>
            (p.name && p.name.toLowerCase().includes(query)) ||
            (p.shortName && p.shortName.toLowerCase().includes(query)),
        ).slice(0, 6);
        if (results.length === 0) {
          dropdown.innerHTML = `<div class="bm-search-empty"><i class="bi bi-search"></i> نتیجه‌ای پیدا نشد</div>`;
          dropdown.classList.add("show");
          return;
        }
        dropdown.innerHTML = results
          .map(
            (p) =>
              `<a href="product.html?id=${p.id}" class="bm-search-item"><img src="${p.image}" alt="" onerror="this.src='images/products/placeholder-product.svg'"><div class="bm-search-item-info"><div class="bm-search-item-name">${p.shortName || p.name}</div><div class="bm-search-item-price">${(p.price || 0).toLocaleString("fa-IR")} تومان</div></div></a>`,
          )
          .join("");
        dropdown.classList.add("show");
      };
      input.addEventListener("input", (e) => renderResults(e.target.value));
      input.addEventListener("focus", (e) => {
        if (e.target.value.trim().length >= 2) renderResults(e.target.value);
      });
      document.addEventListener("click", (e) => {
        if (!wrapper.contains(e.target)) dropdown.classList.remove("show");
      });
    });
  };
  window.addEventListener("bl:header-ready", () => setTimeout(setup, 300));
  document.addEventListener("DOMContentLoaded", () => setTimeout(setup, 1000));
})();

/* ========== صدای اعلان ========== */
window.playNotificationSound = function (type = "info") {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    if (type === "error") {
      playTone(ctx, now, 880, 0.3);
      playTone(ctx, now + 0.15, 660, 0.3);
      return;
    }
    playTone(ctx, now, 1318.51, 0.25);
    playTone(ctx, now + 0.12, 1760, 0.25);
    setTimeout(() => {
      try {
        const ctx2 = new AudioContext();
        playTone(ctx2, ctx2.currentTime, 1760, 0.3);
      } catch (e) {}
    }, 200);
  } catch (e) {
    console.log("[Sound] Audio failed", e);
  }
};

function playTone(ctx, startTime, freq, duration) {
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
}

/* ============================================
   راه‌اندازی مگامنو
   ============================================ */
function initMegaMenu() {
  const catToggle = document.getElementById("bmCatToggle");
  const overlay = document.getElementById("bmMegamenuOverlay");
  if (!catToggle || !overlay) return;
  if (catToggle.dataset.bound === "1") return;
  catToggle.dataset.bound = "1";

  catToggle.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (overlay.classList.contains("open")) {
      overlay.classList.remove("open");
      catToggle.classList.remove("open");
      document.body.style.overflow = "";
    } else {
      overlay.classList.add("open");
      catToggle.classList.add("open");
      document.body.style.overflow = "hidden";
    }
  });

  catToggle.addEventListener("mouseenter", () => {
    if (window.innerWidth > 991) {
      overlay.classList.add("open");
      catToggle.classList.add("open");
      document.body.style.overflow = "hidden";
    }
  });

  let hoverTimer;
  const closeMenu = () => {
    if (window.innerWidth > 991) {
      overlay.classList.remove("open");
      catToggle.classList.remove("open");
      document.body.style.overflow = "";
    }
  };

  catToggle.addEventListener("mouseleave", () => {
    hoverTimer = setTimeout(() => {
      const isHoveringOverlay = overlay.matches(":hover");
      const isHoveringButton = catToggle.matches(":hover");
      if (!isHoveringOverlay && !isHoveringButton) closeMenu();
    }, 200);
  });
  overlay.addEventListener("mouseleave", () => {
    hoverTimer = setTimeout(() => {
      const isHoveringOverlay = overlay.matches(":hover");
      const isHoveringButton = catToggle.matches(":hover");
      if (!isHoveringOverlay && !isHoveringButton) closeMenu();
    }, 200);
  });
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.classList.remove("open");
      catToggle.classList.remove("open");
      document.body.style.overflow = "";
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("open")) {
      overlay.classList.remove("open");
      catToggle.classList.remove("open");
      document.body.style.overflow = "";
    }
  });
}

window.addEventListener("bl:header-ready", () => {
  setTimeout(initMegaMenu, 100);
});
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(initMegaMenu, 500);
});
