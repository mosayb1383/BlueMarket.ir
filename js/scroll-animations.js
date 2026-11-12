/* ============================================
   Scroll Animations — موبایلی بلوچستان
   IntersectionObserver-based animations
   ============================================ */

"use strict";

const ScrollAnimations = {
  // ========== تنظیمات ==========
  config: {
    threshold: 0.1, // ۱۰٪ از عنصر دیده شد
    rootMargin: "0px 0px -80px 0px", // ۸۰px قبل از رسیدن به پایین
    once: false, // ✅ برگشت انیمیشن فعال
    staggerDelay: 80, // ms
  },

  // ========== ذخیره‌ی observer ==========
  observer: null,
  animatedElements: new WeakMap(),

  // ========================================
  // 1. راه‌اندازی
  // ========================================
  init() {
    // جلوگیری از راه‌اندازی دوباره (init هم از این فایل و هم از ux.js صدا زده می‌شود)
    if (this.observer) {
      this.observeAll();
      return;
    }
    if (!("IntersectionObserver" in window)) {
      console.warn("[Scroll] IntersectionObserver پشتیبانی نمی‌شود");
      this.fallbackShowAll();
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        threshold: this.config.threshold,
        rootMargin: this.config.rootMargin,
      },
    );

    this.observeAll();
    this.watchDynamicContent();
  },

  // ========================================
  // 2. مدیریت Intersection
  // ========================================
  handleIntersection(entries) {
    entries.forEach((entry) => {
      const el = entry.target;

      if (entry.isIntersecting) {
        // ✅ ورود به viewport
        this.animateIn(el);
      } else {
        // ✅ خروج از viewport
        if (!this.config.once) {
          this.animateOut(el);
        }
      }
    });
  },

  // ========================================
  // 3. انیمیشن ورود
  // ========================================
  animateIn(el) {
    // اگه قبلاً animated شده، دوباره نکن
    if (el.classList.contains("animated")) return;

    // اگر در حال انیمیشن خروج بود، حذفش کن
    el.classList.remove("exit-top", "exit-bottom");

    // اضافه کردن کلاس
    el.classList.add("animated");

    // بررسی data-animate-delay
    const delay = el.getAttribute("data-animate-delay");
    if (delay) {
      el.style.transitionDelay = `${parseInt(delay) * this.config.staggerDelay}ms`;
    }

    // رویداد سفارشی
    el.dispatchEvent(new CustomEvent("animatein", { bubbles: true }));
  },

  // ========================================
  // 4. انیمیشن خروج (برگشت)
  // ========================================
  animateOut(el) {
    if (!el.classList.contains("animated")) return;

    // حذف کلاس animated
    el.classList.remove("animated");

    // بررسی جهت خروج
    const rect = el.getBoundingClientRect();
    if (rect.top < 0) {
      // از بالا خارج شد
      el.classList.add("exit-top");
      el.classList.remove("exit-bottom");
    } else {
      // از پایین خارج شد
      el.classList.add("exit-bottom");
      el.classList.remove("exit-top");
    }

    // پاک کردن transitionDelay
    el.style.transitionDelay = "";
  },

  // ========================================
  // 5. مشاهده همه عناصر
  // ========================================
  observeAll(root = document) {
    const elements = root.querySelectorAll(
      "[data-animate], [data-animate-children]",
    );
    elements.forEach((el) => {
      // اگه قبلاً مشاهده شده، دوباره نکن
      if (this.animatedElements.has(el)) return;

      this.observer.observe(el);
      this.animatedElements.set(el, true);
    });
  },

  // ========================================
  // 6. مشاهده محتوای داینامیک
  // ========================================
  watchDynamicContent() {
    // اگه DOM تغییر کرد، عناصر جدید رو رصد کن
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            // عنصر HTML
            // خود عنصر
            if (
              node.matches &&
              node.matches("[data-animate], [data-animate-children]")
            ) {
              this.observer.observe(node);
              this.animatedElements.set(node, true);
            }
            // فرزندان
            if (node.querySelectorAll) {
              const children = node.querySelectorAll(
                "[data-animate], [data-animate-children]",
              );
              children.forEach((child) => {
                if (!this.animatedElements.has(child)) {
                  this.observer.observe(child);
                  this.animatedElements.set(child, true);
                }
              });
            }
          }
        });
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  },

  // ========================================
  // 7. نمایش همه (fallback)
  // ========================================
  fallbackShowAll() {
    document.querySelectorAll("[data-animate]").forEach((el) => {
      el.classList.add("animated");
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    document.querySelectorAll("[data-animate-children]").forEach((el) => {
      el.classList.add("animated");
    });
  },

  // ========================================
  // 8. اعمال خودکار به عناصر خاص
  // ========================================
  autoApply() {
    // ✅ کارت محصول (فقط اگه data-animate ندارن)
    document
      .querySelectorAll(".glass-product-card:not([data-animate])")
      .forEach((card, i) => {
        card.setAttribute("data-animate", "fade-up");
        card.setAttribute("data-animate-delay", String((i % 4) + 1));
      });

    // ✅ کارت دسته‌بندی
    document
      .querySelectorAll(".category-card:not([data-animate])")
      .forEach((card, i) => {
        card.setAttribute("data-animate", "zoom-rotate");
        card.setAttribute("data-animate-delay", String((i % 6) + 1));
      });

    // ✅ بنر
    document
      .querySelectorAll(".banner:not([data-animate])")
      .forEach((banner, i) => {
        banner.setAttribute("data-animate", "banner");
        banner.setAttribute("data-animate-delay", String(i + 1));
      });

    // ✅ feature-card
    document
      .querySelectorAll(".feature-card:not([data-animate])")
      .forEach((card, i) => {
        card.setAttribute("data-animate", "bounce-in");
        card.setAttribute("data-animate-delay", String((i % 4) + 1));
      });

    // ✅ section-heading
    document
      .querySelectorAll(
        ".section-heading:not([data-animate]), .section-title:not([data-animate])",
      )
      .forEach((h) => {
        h.setAttribute("data-animate", "fade-right");
      });

    // ✅ Hero content
    document
      .querySelectorAll(".hero-content:not([data-animate])")
      .forEach((h) => {
        h.setAttribute("data-animate", "fade-right");
      });

    // ✅ محتوای Hero (تصویر)
    document
      .querySelectorAll(".hero-section img:not([data-animate])")
      .forEach((img) => {
        img.setAttribute("data-animate", "fade-left");
        img.setAttribute("data-animate-delay", "2");
      });

    // ✅ فوتر columns
    document
      .querySelectorAll(".footer-column:not([data-animate])")
      .forEach((col, i) => {
        col.setAttribute("data-animate", "fade-up");
        col.setAttribute("data-animate-delay", String(i + 1));
      });

    // ✅ دسته‌بندی‌های صفحه اصلی - همه با هم
    const categoriesSlider = document.querySelector(".categories-slider");
    if (categoriesSlider) {
      categoriesSlider.setAttribute("data-animate-children", "");
    }

    // ✅ محصولات پیشنهادی و جدید
    [
      "newProductsContainer",
      "bestsellingContainer",
      "recommendedProducts",
      "relatedProducts",
      "discountProductsContainer",
      "productsContainer",
      "featuredBrands",
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el && !el.hasAttribute("data-animate-children")) {
        el.setAttribute("data-animate-children", "");
      }
    });

    // ✅ بعد از اعمال، دوباره observe کن
    this.observeAll();
  },

  // ========================================
  // 9. رفرش دستی (بعد از رندر داینامیک)
  // ========================================
  refresh() {
    this.autoApply();
    this.observeAll();
  },

  // ========================================
  // 10. انیمیشن فوری (بدون اسکرول)
  // ========================================
  animateNow(selector) {
    const elements =
      typeof selector === "string"
        ? document.querySelectorAll(selector)
        : [selector];

    elements.forEach((el, i) => {
      setTimeout(() => {
        el.classList.add("animated");
      }, i * this.config.staggerDelay);
    });
  },
};

// ========================================
// اکسپورت
// ========================================
window.ScrollAnimations = ScrollAnimations;

// ========================================
// راه‌اندازی خودکار
// ========================================
document.addEventListener("DOMContentLoaded", () => {
  // کمی تأخیر تا DOM کامل بشه
  setTimeout(() => {
    ScrollAnimations.autoApply();
    ScrollAnimations.init();
  }, 100);
});

// ========================================
// بعد از لود کامل صفحه (برای عناصر داینامیک)
// ========================================
window.addEventListener("load", () => {
  setTimeout(() => {
    ScrollAnimations.refresh();
  }, 500);
});

// ========================================
// بعد از رندر محصولات (event سفارشی)
// ========================================
document.addEventListener("productsRendered", () => {
  ScrollAnimations.refresh();
});
