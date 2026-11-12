/* ============================================
   CATEGORY PAGE — بلو مارکت
   ============================================ */

"use strict";

const CategoryPage = {
  state: {
    category: "",
    categoryTitle: "",
    products: [],
    filtered: [],
    currentPage: 1,
    perPage: 12,
    view: "grid",
    brands: new Set(),
    subcategories: new Set(),
    maxPrice: 0,
    currentMaxPrice: 0,
    onlyAvailable: false,
    onlyDiscounted: false,
    sort: "newest",
  },

  brandNames: {
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
    garmin: "گارمین",
    amazfit: "امیزفیت",
    jbl: "JBL",
    marshall: "مارشال",
    generic: "متفرقه",
  },

  subcategoryNames: {
    "mobile-samsung": "گوشی سامسونگ",
    "mobile-apple": "گوشی اپل (آیفون)",
    "mobile-xiaomi": "گوشی شیائومی",
    "mobile-huawei": "گوشی هوآوی",
    "laptop-asus": "لپ‌تاپ ایسوس",
    "laptop-hp": "لپ‌تاپ اچ‌پی",
    "laptop-lenovo": "لپ‌تاپ لنوو",
    "laptop-apple": "مک‌بوک اپل",
    "laptop-dell": "لپ‌تاپ دل",
    "tablet-apple": "آیپد اپل",
    "tablet-samsung": "تبلت سامسونگ",
    "tablet-huawei": "تبلت هوآوی",
    "watch-apple": "اپل واچ",
    "watch-samsung": "گلکسی واچ",
    "watch-garmin": "گارمین",
    "watch-amazfit": "امیزفیت",
    headphones: "هدفون و هندزفری",
    powerbank: "پاوربانک",
    charger: "شارژر",
    cable: "کابل و تبدیل",
    case: "قاب و گلس",
    battery: "باتری",
    mouse: "ماوس",
    keyboard: "کیبورد",
    monitor: "مانیتور",
    storage: "هارد و حافظه",
    gaming: "گیمینگ",
    "computer-accessory": "لوازم کامپیوتر",
    "computer-parts": "قطعات کامپیوتر",
  },

  init() {
    const body = document.body;
    const cat = body.dataset.category;
    if (!cat) {
      console.error("[Category] data-category روی body نیست!");
      return;
    }

    this.state.category = cat;
    this.state.categoryTitle = body.dataset.categoryTitle || "محصولات";
    const icon = body.dataset.categoryIcon || "bi-phone";
    const desc = body.dataset.categoryDesc || "";

    if (!window.ALL_PRODUCTS || !Array.isArray(window.ALL_PRODUCTS)) {
      console.error("[Category] ALL_PRODUCTS لود نشده!");
      this.showError("محصولات بارگذاری نشد");
      return;
    }

    this.state.products = window.ALL_PRODUCTS.filter((p) => p.category === cat);

    if (this.state.products.length === 0) {
      this.showError(
        `هیچ محصولی در دسته "${this.state.categoryTitle}" وجود ندارد`,
      );
      return;
    }

    const prices = this.state.products.map((p) => p.price).filter((v) => v > 0);
    const maxP = prices.length > 0 ? Math.max(...prices) : 10000000;
    this.state.maxPrice = Math.ceil(maxP / 1000000) * 1000000;
    this.state.currentMaxPrice = this.state.maxPrice;

    try {
      this.readURLParams();
      this.renderHero(icon, desc);
      this.renderBrands();
      this.renderSubcategories();
      this.setupPriceRange();
      this.applyFilters();
      this.updateBreadcrumb();
    } catch (e) {
      console.error("[Category] خطا:", e);
    }
  },

  readURLParams() {
    const params = new URLSearchParams(window.location.search);
    const brand = params.get("brand");
    if (brand) brand.split(",").forEach((b) => this.state.brands.add(b.trim()));
    const sub = params.get("sub");
    if (sub)
      sub.split(",").forEach((s) => this.state.subcategories.add(s.trim()));
    const sort = params.get("sort");
    if (
      sort &&
      ["newest", "bestselling", "price-low", "price-high", "rating"].includes(
        sort,
      )
    ) {
      this.state.sort = sort;
    }
    const view = params.get("view");
    if (view === "list" || view === "grid") this.state.view = view;
    if (params.get("available") === "1") this.state.onlyAvailable = true;
    if (params.get("discount") === "1") this.state.onlyDiscounted = true;
  },

  updateBreadcrumb() {
    const bc = document.getElementById("breadcrumbCurrent");
    if (bc) bc.textContent = this.state.categoryTitle;
    document.title = this.state.categoryTitle + " | بلو مارکت";
  },

  showError(msg) {
    const el = document.getElementById("productsContainer");
    if (el)
      el.innerHTML = `<div style="text-align:center;padding:40px;color:#6b7280;background:#fff;border-radius:16px;border:1px solid #e5e7eb;grid-column:1/-1;">
            <i class="bi bi-exclamation-triangle" style="font-size:3rem;color:#f59e0b;"></i>
            <p style="margin-top:16px;font-weight:700;">${this.esc(msg)}</p>
        </div>`;
  },

  renderHero(icon, desc) {
    const heroEl = document.getElementById("categoryHero");
    if (!heroEl) return;
    const count = this.state.products.length;
    const prices = this.state.products.map((p) => p.price).filter((v) => v > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

    heroEl.style.cssText =
      "background:linear-gradient(135deg,#f97316,#ea580c,#fb923c);color:#fff;margin:0 0 24px;padding:40px 0;";
    heroEl.innerHTML = `
            <div class="container" style="max-width:1280px;margin:0 auto;padding:0 16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap;">
                    <div style="flex:1;min-width:0;">
                        <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.2);backdrop-filter:blur(10px);padding:6px 14px;border-radius:30px;font-size:0.78rem;font-weight:800;margin-bottom:12px;border:1px solid rgba(255,255,255,0.25);">
                            <i class="bi ${icon}"></i> دسته‌بندی محصولات
                        </div>
                        <h1 style="font-size:2rem;font-weight:900;margin:0 0 8px;">${this.esc(this.state.categoryTitle)}</h1>
                        <p style="font-size:0.95rem;margin:0;opacity:0.92;line-height:1.7;">${this.esc(desc)}</p>
                    </div>
                    <div style="display:flex;gap:12px;flex-wrap:wrap;">
                        <div style="background:rgba(255,255,255,0.18);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.25);border-radius:16px;padding:14px 20px;text-align:center;min-width:100px;">
                            <div style="font-size:1.4rem;font-weight:900;line-height:1;margin-bottom:4px;">${count.toLocaleString("fa-IR")}</div>
                            <div style="font-size:0.72rem;opacity:0.9;">محصول</div>
                        </div>
                        <div style="background:rgba(255,255,255,0.18);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.25);border-radius:16px;padding:14px 20px;text-align:center;min-width:100px;">
                            <div style="font-size:1.4rem;font-weight:900;line-height:1;margin-bottom:4px;">${this.formatPriceShort(minPrice)}</div>
                            <div style="font-size:0.72rem;opacity:0.9;">از قیمت</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
  },

  renderBrands() {
    const container = document.getElementById("brandFilters");
    if (!container) return;
    const counts = {};
    this.state.products.forEach((p) => {
      if (p.brand) counts[p.brand] = (counts[p.brand] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    container.innerHTML = sorted
      .map(
        ([key, count]) => `
            <label style="display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:10px;cursor:pointer;user-select:none;margin-bottom:4px;background:#f9fafb;">
                <input type="checkbox" value="${key}"
                       ${this.state.brands.has(key) ? "checked" : ""}
                       onchange="CategoryPage.toggleBrand('${key}', this.checked)"
                       style="width:18px;height:18px;accent-color:#f97316;cursor:pointer;flex-shrink:0;">
                <span style="flex:1;font-size:0.85rem;color:#4b5563;font-weight:700;">${this.brandNames[key] || key}</span>
                <span style="font-size:0.72rem;color:#6b7280;background:#e5e7eb;padding:1px 8px;border-radius:8px;font-weight:800;">${count.toLocaleString("fa-IR")}</span>
            </label>
        `,
      )
      .join("");
  },

  renderSubcategories() {
    const group = document.getElementById("subcategoryGroup");
    const container = document.getElementById("subcategoryFilters");
    if (!group || !container) return;

    const counts = {};
    this.state.products.forEach((p) => {
      if (p.subcategory)
        counts[p.subcategory] = (counts[p.subcategory] || 0) + 1;
    });

    const entries = Object.entries(this.subcategoryNames).filter(
      ([k]) => counts[k] > 0 || this.state.subcategories.has(k),
    );

    if (entries.length === 0) {
      group.style.display = "none";
      return;
    }
    group.style.display = "block";

    container.innerHTML = entries
      .map(([key, label]) => {
        const count = counts[key] || 0;
        return `
                <label style="display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:10px;cursor:pointer;user-select:none;margin-bottom:4px;background:#f9fafb;">
                    <input type="checkbox" value="${key}"
                           ${this.state.subcategories.has(key) ? "checked" : ""}
                           onchange="CategoryPage.toggleSubcategory('${key}', this.checked)"
                           style="width:18px;height:18px;accent-color:#f97316;cursor:pointer;flex-shrink:0;">
                    <span style="flex:1;font-size:0.85rem;color:#4b5563;font-weight:700;">${label}</span>
                    <span style="font-size:0.72rem;color:#6b7280;background:#e5e7eb;padding:1px 8px;border-radius:8px;font-weight:800;">${count.toLocaleString("fa-IR")}</span>
                </label>
            `;
      })
      .join("");
  },

  setupPriceRange() {
    const input = document.getElementById("priceRange");
    const label = document.getElementById("priceValue");
    if (!input) return;
    input.min = 0;
    input.max = this.state.maxPrice;
    input.step = 1000000;
    input.value = this.state.currentMaxPrice;
    if (label)
      label.textContent = this.formatPriceShort(this.state.currentMaxPrice);

    const percent = (this.state.currentMaxPrice / this.state.maxPrice) * 100;
    input.style.background = `linear-gradient(to left, #f97316 0%, #f97316 ${percent}%, #e5e7eb ${percent}%, #e5e7eb 100%)`;
  },

  toggleBrand(brand, checked) {
    if (checked) this.state.brands.add(brand);
    else this.state.brands.delete(brand);
    this.applyFilters();
  },

  toggleSubcategory(sub, checked) {
    if (checked) this.state.subcategories.add(sub);
    else this.state.subcategories.delete(sub);
    this.applyFilters();
  },

  updatePrice(value) {
    this.state.currentMaxPrice = parseInt(value, 10);
    const label = document.getElementById("priceValue");
    if (label)
      label.textContent = this.formatPriceShort(this.state.currentMaxPrice);

    const input = document.getElementById("priceRange");
    if (input) {
      const percent = (value / this.state.maxPrice) * 100;
      input.style.background = `linear-gradient(to left, #f97316 0%, #f97316 ${percent}%, #e5e7eb ${percent}%, #e5e7eb 100%)`;
    }
    this.applyFilters();
  },

  toggleAvailable(checked) {
    this.state.onlyAvailable = checked;
    this.applyFilters();
  },
  toggleDiscounted(checked) {
    this.state.onlyDiscounted = checked;
    this.applyFilters();
  },

  sort(value, btn) {
    this.state.sort = value;
    document
      .querySelectorAll(".bm-sort-pill")
      .forEach((b) => b.classList.remove("active"));
    if (btn) btn.classList.add("active");
    this.applyFilters();
  },

  setView(view, btn) {
    this.state.view = view;
    document
      .querySelectorAll(".bm-view-btn")
      .forEach((b) => b.classList.remove("active"));
    if (btn) btn.classList.add("active");
    this.renderProducts();
  },

  resetAllFilters() {
    this.state.brands.clear();
    this.state.subcategories.clear();
    this.state.currentMaxPrice = this.state.maxPrice;
    this.state.onlyAvailable = false;
    this.state.onlyDiscounted = false;
    this.state.sort = "newest";

    document
      .querySelectorAll('input[type="checkbox"]')
      .forEach((el) => (el.checked = false));
    this.setupPriceRange();
    this.applyFilters();
  },

  applyFilters() {
    let list = [...this.state.products];

    if (this.state.brands.size > 0)
      list = list.filter((p) => this.state.brands.has(p.brand));

    if (this.state.subcategories.size > 0)
      list = list.filter(
        (p) => p.subcategory && this.state.subcategories.has(p.subcategory),
      );

    list = list.filter((p) => p.price <= this.state.currentMaxPrice);

    if (this.state.onlyAvailable) list = list.filter((p) => (p.stock || 0) > 0);

    if (this.state.onlyDiscounted)
      list = list.filter((p) => p.oldPrice && p.oldPrice > p.price);

    switch (this.state.sort) {
      case "price-low":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "bestselling":
        list.sort(
          (a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0),
        );
        break;
      default:
        list.sort(
          (a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || b.id - a.id,
        );
    }

    this.state.filtered = list;
    this.state.currentPage = 1;
    this.updateResultsCount();
    this.renderProducts();
  },

  updateResultsCount() {
    const el = document.getElementById("resultsCount");
    if (!el) return;
    el.innerHTML = `<strong style="color:#f97316;">${this.state.filtered.length.toLocaleString("fa-IR")}</strong> محصول در ${this.state.categoryTitle}`;
  },

  renderProducts() {
    const container = document.getElementById("productsContainer");
    if (!container) return;

    if (this.state.filtered.length === 0) {
      container.innerHTML = `<div style="text-align:center;padding:60px 20px;background:#fff;border-radius:20px;border:1px solid #e5e7eb;grid-column:1/-1;">
                <div style="font-size:3rem;color:#f97316;margin-bottom:16px;">🔍</div>
                <h3 style="font-weight:900;color:#1f2937;margin:0 0 8px;">محصولی یافت نشد</h3>
                <p style="color:#6b7280;margin:0;">فیلترها را تغییر دهید</p>
            </div>`;
      return;
    }

    if (this.state.view === "grid") {
      container.style.cssText =
        "display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px;";
      container.innerHTML = this.state.filtered
        .map((p) => this.cardHTML(p))
        .join("");
    } else {
      container.style.cssText = "display:flex;flex-direction:column;gap:14px;";
      container.innerHTML = this.state.filtered
        .map((p) => this.listCardHTML(p))
        .join("");
    }
  },

  cardHTML(p) {
    const discount =
      p.oldPrice && p.oldPrice > p.price
        ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)
        : 0;
    const outOfStock = p.stock === 0;
    const isDemo = p.isDemo === true;

    return `
            <div onclick="location.href='product.html?id=${p.id}'"
                 style="background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;cursor:pointer;transition:all 0.3s;display:flex;flex-direction:column;position:relative;"
                 onmouseover="if(!${outOfStock}) {this.style.transform='translateY(-4px)';this.style.boxShadow='0 12px 28px rgba(249,115,22,.15)';this.style.borderColor='#fed7aa';}"
                 onmouseout="this.style.transform='';this.style.boxShadow='';this.style.borderColor='#e5e7eb';">
                
                <div style="position:relative;aspect-ratio:1/1;background:linear-gradient(135deg,#f9fafb,#f3f4f6);overflow:hidden;">
                    <img src="${this.esc(p.image || "images/products/placeholder-product.svg")}" alt="${this.esc(p.name)}" loading="lazy"
                         style="width:100%;height:100%;object-fit:contain;padding:12px;box-sizing:border-box;"
                         onerror="this.onerror=null;this.src='images/products/placeholder-product.svg'">
                    
                    ${p.isNew ? '<span style="position:absolute;top:10px;right:10px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;padding:4px 10px;border-radius:10px;font-size:0.7rem;font-weight:800;z-index:2;">جدید</span>' : ""}
                    ${discount > 0 ? `<span style="position:absolute;bottom:10px;left:10px;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;padding:4px 10px;border-radius:10px;font-size:0.72rem;font-weight:900;z-index:2;">${discount}٪</span>` : ""}
                    ${isDemo ? '<span style="position:absolute;top:10px;left:10px;background:#6b7280;color:#fff;padding:2px 8px;border-radius:8px;font-size:0.65rem;font-weight:800;z-index:2;">Demo</span>' : ""}
                    
                    ${
                      outOfStock
                        ? `
                        <div style="position:absolute;inset:0;background:rgba(255,255,255,0.7);backdrop-filter:blur(2px);display:flex;align-items:center;justify-content:center;z-index:3;border-radius:16px 16px 0 0;">
                            <span style="background:#ef4444;color:#fff;padding:8px 18px;border-radius:30px;font-size:0.9rem;font-weight:900;box-shadow:0 4px 14px rgba(239,68,68,0.4);">ناموجود</span>
                        </div>
                    `
                        : ""
                    }
                </div>
                
                <div style="padding:12px 14px 14px;display:flex;flex-direction:column;gap:8px;flex:1;">
                    <h3 style="font-size:0.85rem;font-weight:700;color:#1f2937;margin:0;line-height:1.55;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.6em;">
                        ${this.esc(p.shortName || p.name)}
                    </h3>
                    
                    ${p.seller && p.seller !== "موبایلی بلوچستان" && p.seller !== "بلو مارکت" ? `<div style="font-size:0.7rem;color:#9ca3af;"><i class="bi bi-shop"></i> ${this.esc(p.seller)}</div>` : ""}

                    <div style="display:flex;flex-direction:column;gap:2px;margin-top:auto;">
                        ${p.oldPrice ? `<span style="color:#9ca3af;text-decoration:line-through;font-size:0.72rem;font-weight:600;">${this.formatPrice(p.oldPrice)}</span>` : ""}
                        <span style="color:${outOfStock ? "#9ca3af" : "#1f2937"};font-weight:900;font-size:0.95rem;">${this.formatPrice(p.price)}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:4px;font-size:0.72rem;color:#6b7280;font-weight:600;">
                        ${this.renderStars(p.rating)} <span>(${p.rating.toFixed(1)})</span>
                    </div>
                </div>
            </div>
        `;
  },

  listCardHTML(p) {
    const discount =
      p.oldPrice && p.oldPrice > p.price
        ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)
        : 0;

    return `
            <div onclick="location.href='product.html?id=${p.id}'" style="background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;cursor:pointer;padding:14px;display:flex;gap:14px;transition:all 0.3s;"
                 onmouseover="this.style.boxShadow='0 8px 24px rgba(249,115,22,.12)'"
                 onmouseout="this.style.boxShadow=''">
                <div style="position:relative;width:120px;height:120px;flex-shrink:0;background:#f9fafb;border-radius:12px;overflow:hidden;">
                    <img src="${this.esc(p.image || "images/products/placeholder-product.svg")}" alt="${this.esc(p.name)}"
                         style="width:100%;height:100%;object-fit:contain;padding:8px;"
                         onerror="this.onerror=null;this.src='images/products/placeholder-product.svg'">
                </div>
                <div style="flex:1;min-width:0;">
                    <h3 style="font-size:0.95rem;font-weight:800;color:#1f2937;margin:0 0 6px;">${this.esc(p.name)}</h3>
                    <p style="font-size:0.82rem;color:#6b7280;margin:0 0 8px;line-height:1.7;">${this.esc((p.desc || "").substring(0, 100))}</p>
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div>
                            ${p.oldPrice ? `<span style="color:#9ca3af;text-decoration:line-through;font-size:0.78rem;">${this.formatPrice(p.oldPrice)}</span>` : ""}
                            <span style="color:#f97316;font-weight:900;font-size:1rem;margin-right:8px;">${this.formatPrice(p.price)}</span>
                        </div>
                        <div style="font-size:0.75rem;color:#6b7280;">${this.renderStars(p.rating)}</div>
                    </div>
                </div>
            </div>
        `;
  },

  formatPrice(n) {
    if (n >= 1000000) {
      const m = (n / 1000000).toFixed(1).replace(".0", "");
      return m.toLocaleString("fa-IR") + " میلیون";
    }
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

  renderStars(rating) {
    let s = "";
    for (let i = 0; i < Math.floor(rating); i++)
      s += '<i class="bi bi-star-fill" style="color:#fbbf24;"></i>';
    for (let i = 0; i < 5 - Math.floor(rating); i++)
      s += '<i class="bi bi-star" style="color:#d1d5db;"></i>';
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

  toggleFiltersSidebar(open) {
    const sidebar = document.getElementById("filtersSidebar");
    const overlay = document.getElementById("filtersOverlay");
    if (!sidebar || !overlay) return;

    if (open) {
      sidebar.classList.add("open");
      overlay.classList.add("show");
      document.body.style.overflow = "hidden";
    } else {
      sidebar.classList.remove("open");
      overlay.classList.remove("show");
      document.body.style.overflow = "";
    }
  },
};

window.CategoryPage = CategoryPage;
console.log("[Category] ✅ آماده — منتظر CategoryPage.init()");
