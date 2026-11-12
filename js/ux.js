/* ============================================
   UX Foundations — موبایلی بلوچستان
   Loading, Toast, Share, Back to Top, Search
   ============================================ */

"use strict";

const UX = {
  // ========================================
  // 1. Toast سراسری
  // ========================================
  toastContainer: null,

  initToastContainer() {
    if (this.toastContainer) return;
    this.toastContainer = document.createElement("div");
    this.toastContainer.className = "toast-container";
    this.toastContainer.id = "toastContainer";
    document.body.appendChild(this.toastContainer);
  },

  showToast(message, type = "info", title = null, duration = 3000) {
    this.initToastContainer();

    const icons = {
      success: "bi-check-circle-fill",
      error: "bi-x-circle-fill",
      warning: "bi-exclamation-triangle-fill",
      info: "bi-info-circle-fill",
    };

    const titles = {
      success: "موفق",
      error: "خطا",
      warning: "هشدار",
      info: "اطلاع",
    };

    const toast = document.createElement("div");
    toast.className = `toast-modern ${type}`;
    toast.innerHTML = `
            <div class="toast-icon">
                <i class="bi ${icons[type] || icons.info}"></i>
            </div>
            <div class="toast-content">
                <p class="toast-title">${title || titles[type] || "اطلاع"}</p>
                <p class="toast-message">${this.escapeHtml(message)}</p>
            </div>
            <button type="button" class="toast-close" aria-label="بستن">
                <i class="bi bi-x-lg"></i>
            </button>
        `;

    this.toastContainer.appendChild(toast);

    // دکمه بستن
    toast.querySelector(".toast-close").addEventListener("click", () => {
      this.removeToast(toast);
    });

    // حذف خودکار
    setTimeout(() => this.removeToast(toast), duration);

    return toast;
  },

  removeToast(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.add("removing");
    setTimeout(() => toast.remove(), 300);
  },

  // ========================================
  // 2. Back to Top
  // ========================================
  initBackToTop() {
    // اگر قبلاً ساخته شده، پاک کن
    const existing = document.getElementById("backToTopBtn");
    if (existing) existing.remove();

    const btn = document.createElement("button");
    btn.id = "backToTopBtn";
    btn.className = "back-to-top";
    btn.setAttribute("aria-label", "بازگشت به بالا");
    btn.innerHTML = '<i class="bi bi-arrow-up"></i>';
    document.body.appendChild(btn);

    // رویداد اسکرول
    window.addEventListener(
      "scroll",
      () => {
        if (window.scrollY > 300) {
          btn.classList.add("show");
        } else {
          btn.classList.remove("show");
        }
      },
      { passive: true },
    );

    // کلیک
    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  },

  // ========================================
  // 3. Share Buttons
  // ========================================
  createShareButtons(containerId, url = null, title = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const shareUrl = url || window.location.href;
    const shareTitle = title || document.title;

    container.innerHTML = `
            <div class="share-container">
                <button type="button" class="share-toggle-btn" aria-label="اشتراک‌گذاری">
                    <i class="bi bi-share-fill"></i>
                </button>
                <div class="share-menu" id="shareMenu">
                    <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + " " + shareUrl)}"
                       target="_blank" rel="noopener"
                       class="share-item whatsapp" aria-label="واتساپ">
                        <i class="bi bi-whatsapp"></i>
                    </a>
                    <a href="https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}"
                       target="_blank" rel="noopener"
                       class="share-item telegram" aria-label="تلگرام">
                        <i class="bi bi-telegram"></i>
                    </a>
                    <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}"
                       target="_blank" rel="noopener"
                       class="share-item twitter" aria-label="توییتر">
                        <i class="bi bi-twitter-x"></i>
                    </a>
                    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}"
                       target="_blank" rel="noopener"
                       class="share-item facebook" aria-label="فیسبوک">
                        <i class="bi bi-facebook"></i>
                    </a>
                    <button type="button"
                            class="share-item copy"
                            data-url="${this.escapeHtml(shareUrl)}"
                            aria-label="کپی لینک">
                        <i class="bi bi-link-45deg"></i>
                    </button>
                </div>
            </div>
        `;

    // تاگل منو
    const toggleBtn = container.querySelector(".share-toggle-btn");
    const menu = container.querySelector("#shareMenu");

    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.toggle("show");
    });

    // بستن با کلیک بیرون
    document.addEventListener("click", (e) => {
      if (!container.contains(e.target)) {
        menu.classList.remove("show");
      }
    });

    // کپی لینک
    container.querySelector(".copy").addEventListener("click", async (e) => {
      const btn = e.currentTarget;
      const url = btn.dataset.url;
      try {
        await navigator.clipboard.writeText(url);
        btn.classList.add("copied");
        btn.innerHTML = '<i class="bi bi-check-lg"></i>';
        UX.showToast("لینک کپی شد", "success", "موفق");
        setTimeout(() => {
          btn.classList.remove("copied");
          btn.innerHTML = '<i class="bi bi-link-45deg"></i>';
        }, 2000);
      } catch (err) {
        UX.showToast("کپی لینک ناموفق بود", "error");
      }
    });
  },

  // ========================================
  // 4. Instant Search
  // ========================================
  searchTimeout: null,

  initInstantSearch(inputId, suggestionsContainerId) {
    const input = document.getElementById(inputId);
    const container = document.getElementById(suggestionsContainerId);
    if (!input || !container || !window.ALL_PRODUCTS) return;

    // ایجاد dropdown اگه نیست
    let dropdown = container.querySelector(".search-suggestions");
    if (!dropdown) {
      dropdown = document.createElement("div");
      dropdown.className = "search-suggestions";
      container.style.position = "relative";
      container.appendChild(dropdown);
    }

    let selectedIndex = -1;
    let currentResults = [];

    input.addEventListener("input", (e) => {
      clearTimeout(this.searchTimeout);
      const query = e.target.value.trim();

      if (query.length < 2) {
        dropdown.classList.remove("show");
        return;
      }

      this.searchTimeout = setTimeout(() => {
        currentResults = this.performSearch(query, 6);
        this.renderSuggestions(dropdown, currentResults, query);
        selectedIndex = -1;
      }, 200);
    });

    // کیبورد
    input.addEventListener("keydown", (e) => {
      const items = dropdown.querySelectorAll(".suggestion-item");

      if (e.key === "ArrowDown") {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
        this.highlightSuggestion(items, selectedIndex);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        this.highlightSuggestion(items, selectedIndex);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedIndex >= 0 && items[selectedIndex]) {
          items[selectedIndex].click();
        } else if (currentResults.length > 0) {
          this.goToSearchResults(input.value.trim());
        }
      } else if (e.key === "Escape") {
        dropdown.classList.remove("show");
      }
    });

    // کلیک بیرون
    document.addEventListener("click", (e) => {
      if (!container.contains(e.target)) {
        dropdown.classList.remove("show");
      }
    });

    // فوکوس
    input.addEventListener("focus", () => {
      if (input.value.trim().length >= 2 && currentResults.length > 0) {
        dropdown.classList.add("show");
      }
    });
  },

  performSearch(query, limit = 6) {
    const normalize = value => String(value||'').toLowerCase().replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[‌\s\-_]+/g,' ').trim();
    const aliases={apple:'اپل آیفون',samsung:'سامسونگ گلکسی',dell:'دل',hp:'اچ پی',asus:'ایسوس',headphones:'هدفون هندزفری',case:'قاب کاور گلس',charger:'شارژر کابل',powerbank:'پاوربانک','computer-accessory':'لوازم کامپیوتر', 'computer-parts':'قطعات کامپیوتر پردازنده کارت گرافیک رم SSD مادربرد',gaming:'گیمینگ بازی دسته کنسول'};
    const term=normalize(query), tokens=term.split(' ').filter(Boolean);
    const exact=ALL_PRODUCTS.filter(p=>{const hay=normalize([p.name,p.shortName,p.brand,aliases[p.brand]||'',p.subcategory,aliases[p.subcategory]||'',p.desc,...(p.highlights||[]),...Object.values(p.specs||{})].join(' '));return tokens.every(t=>hay.includes(t));});
    this.lastSearchFallback=!exact.length;
    if(exact.length)return exact.slice(0,limit);
    // اگر تطبیق دقیق نبود، به‌جای صفحه خالی محصولات محبوب و تازه را پیشنهاد بده.
    return [...ALL_PRODUCTS].sort((a,b)=>(Number(b.isBestseller)+Number(b.isNew)+Number(b.isFeatured))-(Number(a.isBestseller)+Number(a.isNew)+Number(a.isFeatured))).slice(0,limit);
  },

  renderSuggestions(dropdown, results, query) {
    if (results.length === 0) {
      dropdown.innerHTML = `
                <div class="suggestion-empty">
                    <i class="bi bi-search"></i>
                    <p>محصولی با «${this.escapeHtml(query)}» پیدا نشد</p>
                </div>
            `;
      dropdown.classList.add("show");
      return;
    }

    dropdown.innerHTML =
      results
        .map(
          (p) => `
            <a href="product.html?id=${p.id}" class="suggestion-item">
                <img src="${this.escapeHtml(p.image)}" alt="${this.escapeHtml(p.name)}"
                     class="suggestion-image"
                     onerror="this.onerror=null;if(!this.dataset.fbStage)this.src='images/products/placeholder-product.svg'">
                <div class="suggestion-info">
                    <h6>${this.escapeHtml(p.shortName || p.name)}</h6>
                    <div class="price">${p.price.toLocaleString("fa-IR")} تومان</div>
                </div>
            </a>
        `,
        )
        .join("") +
      `
            <div class="suggestion-footer">
                <span>${this.lastSearchFallback ? 'پیشنهادهای محبوب برای جستجوی شما' : `${results.length} پیشنهاد مرتبط`}</span>
                <span><kbd>Enter</kbd> همه نتایج</span>
            </div>
        `;
    dropdown.classList.add("show");
  },

  highlightSuggestion(items, index) {
    items.forEach((item, i) => {
      item.classList.toggle("active", i === index);
      if (i === index) item.scrollIntoView({ block: "nearest" });
    });
  },

  goToSearchResults(query) {
    localStorage.setItem("searchTerm", query);
    window.location.href = "products.html";
  },

  // ========================================
  // 5. Skeleton Loading
  // ========================================
  createProductSkeleton() {
    return `
            <div class="skeleton-product-card">
                <div class="skeleton-image"></div>
                <div class="skeleton-info">
                    <div class="skeleton-line title"></div>
                    <div class="skeleton-line title-2"></div>
                    <div class="skeleton-line price"></div>
                    <div class="skeleton-line rating"></div>
                </div>
            </div>
        `;
  },

  renderProductSkeletons(containerId, count = 8) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = Array(count)
      .fill(0)
      .map(
        () => `
            <div class="skeleton-product-card">
                <div class="skeleton-image"></div>
                <div class="skeleton-info">
                    <div class="skeleton-line title"></div>
                    <div class="skeleton-line title-2"></div>
                    <div class="skeleton-line price"></div>
                    <div class="skeleton-line rating"></div>
                </div>
            </div>
        `,
      )
      .join("");
  },

  // ========================================
  // 6. ابزارها
  // ========================================
  escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  },
};

// ========================================
// اکسپورت
// ========================================
window.UX = UX;

// جایگزینی showToast قدیمی
window.showToast = (message, type = "info") => UX.showToast(message, type);

// ========================================
// راه‌اندازی خودکار
// ========================================
document.addEventListener("DOMContentLoaded", () => {
  UX.initBackToTop();
});

document.addEventListener("DOMContentLoaded", () => {
  UX.initBackToTop();

  // ✅ انیمیشن‌های اسکرول
  if (window.ScrollAnimations) {
    setTimeout(() => {
      ScrollAnimations.autoApply();
      ScrollAnimations.init();
    }, 200);
  }
});
window.addEventListener('bl:header-ready',()=>{
  if(!window.ALL_PRODUCTS)return;
  if(document.getElementById('desktopSearchInput')&&!document.getElementById('desktopSearchInput').dataset.suggestReady){UX.initInstantSearch('desktopSearchInput','desktopSearchForm');document.getElementById('desktopSearchInput').dataset.suggestReady='1';}
  if(document.getElementById('mobileSearchInput')&&!document.getElementById('mobileSearchInput').dataset.suggestReady){UX.initInstantSearch('mobileSearchInput','mobileSearchForm') ;document.getElementById('mobileSearchInput').dataset.suggestReady='1';}
});
