/* ============================================
   صفحه لیست محصولات — بلو مارکت
   ============================================ */

"use strict";

/* ============================================================
   ابزار نرمال‌سازی متن (تحمل غلط املایی)
   ============================================================ */
function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[‌\s\-_]+/g, " ")
    .trim();
}

function productSearchHaystack(p) {
  return normalizeSearchText(
    [
      p.name,
      p.shortName,
      p.brand,
      p.category,
      p.subcategory,
      p.desc,
      ...(p.highlights || []),
      ...Object.values(p.specs || {}),
    ].join(" "),
  );
}

/* ============================================================
   ProductsPage — منطق صفحه فروشگاه
   ============================================================ */
const ProductsPage = {
  state: {
    products: [],
    filtered: [],
    currentPage: 1,
    perPage: 12,
    view: "grid",
    search: "",
    categories: new Set(),
    subcategories: new Set(),
    brands: new Set(),
    minPrice: 0,
    maxPrice: 500000000,
    currentMaxPrice: 500000000,
    onlyAvailable: false,
    onlyDiscounted: false,
    sort: "newest",
  },

  /* ---------- نام‌های نمایشی ---------- */
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

  categoryNames: {
    mobile: "گوشی موبایل",
    laptop: "لپ‌تاپ",
    tablet: "تبلت",
    watch: "ساعت هوشمند",
    accessory: "لوازم جانبی",
  },

  subcategoryNames: {
    // موبایل
    "mobile-samsung": "گوشی سامسونگ",
    "mobile-apple": "گوشی اپل (آیفون)",
    "mobile-xiaomi": "گوشی شیائومی",
    "mobile-huawei": "گوشی هوآوی",
    // لپ‌تاپ
    "laptop-asus": "لپ‌تاپ ایسوس",
    "laptop-hp": "لپ‌تاپ اچ‌پی",
    "laptop-lenovo": "لپ‌تاپ لنوو",
    "laptop-apple": "مک‌بوک اپل",
    "laptop-dell": "لپ‌تاپ دل",
    // تبلت
    "tablet-apple": "آیپد اپل",
    "tablet-samsung": "تبلت سامسونگ",
    "tablet-huawei": "تبلت هوآوی",
    // ساعت
    "watch-apple": "اپل واچ",
    "watch-samsung": "گلکسی واچ",
    "watch-garmin": "گارمین",
    "watch-amazfit": "امیزفیت",
    // لوازم جانبی
    headphones: "هدفون و هندزفری",
    powerbank: "پاوربانک",
    charger: "شارژر و کابل",
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

  /* ---------- راه‌اندازی ---------- */
  init() {
    if (!window.ALL_PRODUCTS || !Array.isArray(window.ALL_PRODUCTS)) {
      console.warn("[Products] ALL_PRODUCTS آماده نیست، تلاش مجدد...");
      setTimeout(() => this.init(), 200);
      return;
    }

    this.state.products = [...window.ALL_PRODUCTS];

    // محاسبه‌ی محدوده قیمت
    const prices = this.state.products.map((p) => p.price).filter((v) => v > 0);
    const maxP = prices.length > 0 ? Math.max(...prices) : 10000000;
    this.state.maxPrice = Math.ceil(maxP / 1000000) * 1000000;
    this.state.currentMaxPrice = this.state.maxPrice;

    this.readURLParams();
    this.renderCategoryFilters();
    this.renderSubcategoryFilters();
    this.renderBrandFilters();
    this.setupPriceRange();
    this.setupView();
    this.applyFilters();

    setTimeout(() => this.renderProducts(), 50);
  },

  /* ---------- پارامترهای URL ---------- */
  readURLParams() {
    const params = new URLSearchParams(window.location.search);

    const q = params.get("q") || localStorage.getItem("searchTerm");
    if (q) {
      this.state.search = q;
      localStorage.removeItem("searchTerm");
    }

    const cat = params.get("cat");
    if (cat) cat.split(",").forEach((c) => this.state.categories.add(c.trim()));

    const sub = params.get("sub");
    if (sub)
      sub.split(",").forEach((s) => this.state.subcategories.add(s.trim()));

    const brand = params.get("brand");
    if (brand) brand.split(",").forEach((b) => this.state.brands.add(b.trim()));

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

  /* ---------- رندر دسته‌بندی ---------- */
  renderCategoryFilters() {
    const container = document.getElementById("categoryFilters");
    if (!container) return;

    const counts = {};
    this.state.products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });

    const allCount = document.getElementById("allProductsCount");
    if (allCount)
      allCount.textContent = this.state.products.length.toLocaleString("fa-IR");

    container.innerHTML = Object.entries(this.categoryNames)
      .filter(([key]) => counts[key] > 0)
      .map(
        ([key, label]) => `
            <label class="bm-filter-check">
                <input type="checkbox" value="${key}" ${this.state.categories.has(key) ? "checked" : ""} onchange="ProductsPage.toggleCategory('${key}', this.checked)">
                <span class="bm-check-box"></span>
                <span class="bm-filter-label">${label}</span>
                <span class="bm-filter-count">${(counts[key] || 0).toLocaleString("fa-IR")}</span>
            </label>
        `,
      )
      .join("");
  },

  /* ---------- رندر زیردسته ---------- */
  renderSubcategoryFilters() {
    const container = document.getElementById("subcategoryFilters");
    const group = document.getElementById("subcategoryGroup");
    if (!container || !group) return;

    const counts = {};
    this.state.products.forEach((p) => {
      if (p.subcategory)
        counts[p.subcategory] = (counts[p.subcategory] || 0) + 1;
    });

    // فقط زیردسته‌هایی که محصول دارن یا انتخاب شدن
    const entries = Object.entries(this.subcategoryNames).filter(
      ([k]) => counts[k] > 0 || this.state.subcategories.has(k),
    );

    if (entries.length > 0) {
      group.style.display = "block";
      container.innerHTML = entries
        .map(
          ([key, label]) => `
                <label class="bm-filter-check">
                    <input type="checkbox" value="${key}" ${this.state.subcategories.has(key) ? "checked" : ""} onchange="ProductsPage.toggleSubcategory('${key}', this.checked)">
                    <span class="bm-check-box"></span>
                    <span class="bm-filter-label">${label}</span>
                    <span class="bm-filter-count">${(counts[key] || 0).toLocaleString("fa-IR")}</span>
                </label>
            `,
        )
        .join("");
    } else {
      group.style.display = "none";
    }
  },

  /* ---------- رندر برند ---------- */
  renderBrandFilters() {
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
            <label class="bm-filter-check">
                <input type="checkbox" value="${key}" ${this.state.brands.has(key) ? "checked" : ""} onchange="ProductsPage.toggleBrand('${key}', this.checked)">
                <span class="bm-check-box"></span>
                <span class="bm-filter-label">${this.brandNames[key] || key}</span>
                <span class="bm-filter-count">${count.toLocaleString("fa-IR")}</span>
            </label>
        `,
      )
      .join("");
  },

  /* ---------- Range قیمت ---------- */
  setupPriceRange() {
    const input = document.getElementById("priceRange");
    const label = document.getElementById("priceValue");
    if (!input) return;

    input.min = 0;
    input.max = this.state.maxPrice;
    input.step = 1000000;
    input.value = this.state.currentMaxPrice;

    if (label) label.textContent = this.formatPrice(this.state.currentMaxPrice);

    const percent = (this.state.currentMaxPrice / this.state.maxPrice) * 100;
    input.style.background = `linear-gradient(to left, #f97316 0%, #f97316 ${percent}%, #e5e7eb ${percent}%, #e5e7eb 100%)`;
  },

  setupView() {
    document.querySelectorAll(".bm-sort-pill").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.sort === this.state.sort);
    });
    document.querySelectorAll(".bm-view-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.view === this.state.view);
    });
  },

  /* ---------- Toggle handlers ---------- */
  toggleCategory(cat, checked) {
    if (checked) this.state.categories.add(cat);
    else this.state.categories.delete(cat);
    this.applyFilters();
  },

  toggleSubcategory(sub, checked) {
    if (checked) this.state.subcategories.add(sub);
    else this.state.subcategories.delete(sub);
    this.applyFilters();
  },

  toggleBrand(brand, checked) {
    if (checked) this.state.brands.add(brand);
    else this.state.brands.delete(brand);
    this.applyFilters();
  },

  updatePrice(value) {
    this.state.currentMaxPrice = parseInt(value, 10);
    const label = document.getElementById("priceValue");
    if (label) label.textContent = this.formatPrice(this.state.currentMaxPrice);

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

  sort(val) {
    this.state.sort = val;
    document
      .querySelectorAll(".bm-sort-pill")
      .forEach((b) => b.classList.remove("active"));
    const activeBtn = document.querySelector(
      `.bm-sort-pill[data-sort="${val}"]`,
    );
    if (activeBtn) activeBtn.classList.add("active");
    this.applyFilters();
  },

  setView(view) {
    this.state.view = view;
    document
      .querySelectorAll(".bm-view-btn")
      .forEach((b) => b.classList.remove("active"));
    const activeBtn = document.querySelector(
      `.bm-view-btn[data-view="${view}"]`,
    );
    if (activeBtn) activeBtn.classList.add("active");
    this.renderProducts();
  },

  /* ---------- پاک‌سازی ---------- */
  clearSearch() {
    this.state.search = "";
    const d = document.getElementById("desktopSearchInput");
    const m = document.getElementById("mobileSearchInput");
    if (d) d.value = "";
    if (m) m.value = "";
    this.applyFilters();
  },

  clearPrice() {
    this.state.currentMaxPrice = this.state.maxPrice;
    this.setupPriceRange();
    this.applyFilters();
  },

  selectAllCategories() {
    this.state.categories.clear();
    document
      .querySelectorAll("#categoryFilters input")
      .forEach((cb) => (cb.checked = false));
    this.applyFilters();
  },

  resetAllFilters() {
    this.state.search = "";
    this.state.categories.clear();
    this.state.subcategories.clear();
    this.state.brands.clear();
    this.state.currentMaxPrice = this.state.maxPrice;
    this.state.onlyAvailable = false;
    this.state.onlyDiscounted = false;
    this.state.sort = "newest";

    document
      .querySelectorAll('input[type="checkbox"]')
      .forEach((el) => (el.checked = false));
    this.setupPriceRange();
    this.setupView();
    this.applyFilters();
  },

  /* ---------- اعمال فیلتر ---------- */
  applyFilters() {
    let list = [...this.state.products];

    // جستجو
    if (this.state.search) {
      const t = normalizeSearchText(this.state.search);
      list = list.filter((p) => productSearchHaystack(p).includes(t));
    }

    // دسته
    if (this.state.categories.size > 0) {
      list = list.filter((p) => this.state.categories.has(p.category));
    }

    // زیردسته
    if (this.state.subcategories.size > 0) {
      list = list.filter((p) => this.state.subcategories.has(p.subcategory));
    }

    // برند
    if (this.state.brands.size > 0) {
      list = list.filter((p) => this.state.brands.has(p.brand));
    }

    // قیمت
    list = list.filter((p) => p.price <= this.state.currentMaxPrice);

    // موجودی
    if (this.state.onlyAvailable) list = list.filter((p) => (p.stock || 0) > 0);

    // تخفیف‌دار
    if (this.state.onlyDiscounted)
      list = list.filter((p) => p.oldPrice && p.oldPrice > p.price);

    // مرتب‌سازی
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
      default: // newest
        list.sort(
          (a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || b.id - a.id,
        );
    }

    this.state.filtered = list;
    this.state.currentPage = 1;

    this.updateResultsCount();
    this.renderActiveFiltersChips();
    this.renderProducts();
  },

  /* ---------- نمایش نتایج ---------- */
  renderProducts() {
    const container = document.getElementById("productsContainer");
    if (!container) return;

    if (this.state.filtered.length === 0) {
      container.className = "bm-empty-wrap";
      container.innerHTML = `
                <div class="bm-empty-state">
                    <div class="bm-empty-icon"><i class="bi bi-search"></i></div>
                    <h3>محصولی یافت نشد</h3>
                    <p>هیچ محصولی با فیلترهای انتخاب‌شده مطابقت ندارد.</p>
                    <div class="bm-empty-actions">
                        <button type="button" class="bm-btn-primary" onclick="ProductsPage.resetAllFilters()">
                            <i class="bi bi-arrow-clockwise"></i> حذف همه فیلترها
                        </button>
                    </div>
                </div>
            `;
      return;
    }

    if (this.state.view === "grid") {
      container.className = "bm-products-grid";
      container.innerHTML = this.state.filtered
        .map((p) => this.productCardHTML(p))
        .join("");
    } else {
      container.className = "bm-products-list";
      container.innerHTML = this.state.filtered
        .map((p) => this.listCardHTML(p))
        .join("");
    }
  },

  /* ---------- کارت گرید ---------- */
  productCardHTML(p) {
    const discount =
      p.oldPrice && p.oldPrice > p.price
        ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)
        : 0;
    const outOfStock = p.stock === 0;
    const isDemo = p.isDemo === true;

    return `
            <div class="bm-product-card ${outOfStock ? "is-out-of-stock" : ""}" onclick="location.href='product.html?id=${p.id}'" role="link" tabindex="0">
                <div class="bm-product-img">
                    <img src="${p.image || "images/products/placeholder-product.svg"}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='images/products/placeholder-product.svg'">
                    ${p.isNew ? '<span class="bm-badge bm-badge-new">جدید</span>' : ""}
                    ${p.isBestseller ? '<span class="bm-badge bm-badge-best"><i class="bi bi-fire"></i> پرفروش</span>' : ""}
                    ${discount > 0 ? `<span class="bm-badge bm-badge-discount">${discount}٪</span>` : ""}
                    ${isDemo ? '<span class="bm-badge" style="position:absolute;top:8px;left:8px;background:#6b7280;font-size:0.65rem;padding:2px 8px;border-radius:8px;z-index:2;">Demo</span>' : ""}
                    ${outOfStock ? '<div class="bm-out-of-stock-overlay"><span>ناموجود</span></div>' : ""}
                </div>
                <div class="bm-product-info">
                    <h3 class="bm-product-title">${p.shortName || p.name}</h3>
                    ${p.seller && p.seller !== "بلو مارکت" ? `<div class="bm-product-seller"><i class="bi bi-shop"></i> ${this.esc(p.seller)}</div>` : ""}
                    <div class="bm-product-price">
                        ${p.oldPrice ? `<span class="bm-old-price">${this.formatPrice(p.oldPrice)}</span>` : ""}
                        <span class="bm-current-price">${this.formatPrice(p.price)}</span>
                    </div>
                    <div class="bm-product-rating">
                        ${this.renderStars(p.rating)} <span>(${p.rating.toFixed(1)})</span>
                    </div>
                </div>
            </div>
        `;
  },

  /* ---------- کارت لیست ---------- */
  listCardHTML(p) {
    const discount =
      p.oldPrice && p.oldPrice > p.price
        ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)
        : 0;
    const outOfStock = p.stock === 0;

    return `
            <div class="bm-list-item ${outOfStock ? "is-out-of-stock" : ""}" onclick="location.href='product.html?id=${p.id}'" role="link" tabindex="0">
                <div class="bm-list-img">
                    <img src="${p.image || "images/products/placeholder-product.svg"}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='images/products/placeholder-product.svg'">
                    ${discount > 0 ? `<span class="bm-badge bm-badge-discount">${discount}٪</span>` : ""}
                    ${outOfStock ? '<div class="bm-out-of-stock-overlay"><span>ناموجود</span></div>' : ""}
                </div>
                <div class="bm-list-info">
                    <h3 class="bm-list-title">${p.name}</h3>
                    <p class="bm-list-desc">${(p.desc || "").substring(0, 150)}</p>
                </div>
                <div class="bm-list-actions">
                    <div class="bm-list-price">
                        ${p.oldPrice ? `<span class="bm-old-price">${this.formatPrice(p.oldPrice)}</span>` : ""}
                        <span class="bm-current-price">${this.formatPrice(p.price)}</span>
                    </div>
                </div>
            </div>
        `;
  },

  /* ---------- چیپ‌های فیلتر فعال ---------- */
  updateResultsCount() {
    const el = document.getElementById("resultsCount");
    if (el) {
      el.innerHTML = `<strong>${this.state.filtered.length.toLocaleString("fa-IR")}</strong> محصول یافت شد`;
    }
  },

  renderActiveFiltersChips() {
    const bar = document.getElementById("activeFiltersBar");
    if (!bar) return;

    const chips = [];

    if (this.state.search)
      chips.push({
        label: `جستجو: «${this.state.search}»`,
        action: `ProductsPage.clearSearch()`,
      });

    this.state.categories.forEach((c) =>
      chips.push({
        label: this.categoryNames[c] || c,
        action: `ProductsPage.removeCategoryChip('${c}')`,
      }),
    );

    this.state.subcategories.forEach((s) =>
      chips.push({
        label: this.subcategoryNames[s] || s,
        action: `ProductsPage.removeSubcategoryChip('${s}')`,
      }),
    );

    this.state.brands.forEach((b) =>
      chips.push({
        label: this.brandNames[b] || b,
        action: `ProductsPage.removeBrandChip('${b}')`,
      }),
    );

    if (this.state.currentMaxPrice < this.state.maxPrice)
      chips.push({
        label: `تا ${this.formatPrice(this.state.currentMaxPrice)}`,
        action: `ProductsPage.clearPrice()`,
      });

    if (this.state.onlyAvailable)
      chips.push({
        label: "فقط موجود",
        action: `ProductsPage.clearAvailable()`,
      });

    if (this.state.onlyDiscounted)
      chips.push({
        label: "فقط تخفیف‌دار",
        action: `ProductsPage.clearDiscounted()`,
      });

    if (chips.length === 0) {
      bar.innerHTML = "";
      return;
    }

    bar.innerHTML =
      chips
        .map(
          (c) => `
            <span class="bm-active-chip">
                ${c.label}
                <button type="button" onclick="${c.action}" aria-label="حذف"><i class="bi bi-x-lg"></i></button>
            </span>
        `,
        )
        .join("") +
      `<button type="button" class="bm-active-chip bm-chip-clear" onclick="ProductsPage.resetAllFilters()"><i class="bi bi-trash"></i> پاک کردن همه</button>`;
  },

  removeCategoryChip(cat) {
    this.state.categories.delete(cat);
    document.querySelectorAll("#categoryFilters input").forEach((cb) => {
      if (cb.value === cat) cb.checked = false;
    });
    this.applyFilters();
  },

  removeSubcategoryChip(sub) {
    this.state.subcategories.delete(sub);
    document.querySelectorAll("#subcategoryFilters input").forEach((cb) => {
      if (cb.value === sub) cb.checked = false;
    });
    this.applyFilters();
  },

  removeBrandChip(brand) {
    this.state.brands.delete(brand);
    document.querySelectorAll("#brandFilters input").forEach((cb) => {
      if (cb.value === brand) cb.checked = false;
    });
    this.applyFilters();
  },

  clearAvailable() {
    this.state.onlyAvailable = false;
    const el = document.getElementById("filterAvailable");
    if (el) el.checked = false;
    this.applyFilters();
  },

  clearDiscounted() {
    this.state.onlyDiscounted = false;
    const el = document.getElementById("filterDiscounted");
    if (el) el.checked = false;
    this.applyFilters();
  },

  /* ---------- پارامترهای URL ---------- */
  readURLParams() {
    const params = new URLSearchParams(window.location.search);

    const q = params.get("q") || localStorage.getItem("searchTerm");
    if (q) {
      this.state.search = q;
      localStorage.removeItem("searchTerm");
    }

    // 👈 اصلاح: هم cat و هم category رو بررسی می‌کنه
    const cat = params.get("cat") || params.get("category");
    if (cat) {
      cat.split(",").forEach((c) => {
        const clean = c.trim();
        if (clean) this.state.categories.add(clean);
      });
    }

    const sub = params.get("sub");
    if (sub) {
      sub.split(",").forEach((s) => {
        const clean = s.trim();
        if (clean) this.state.subcategories.add(clean);
      });
    }

    const brand = params.get("brand");
    if (brand) {
      brand.split(",").forEach((b) => {
        const clean = b.trim();
        if (clean) this.state.brands.add(clean);
      });
    }

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

  /* ---------- Sidebar موبایل ---------- */
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

  /* ---------- فرمت ---------- */
  formatPrice(n) {
    if (n >= 1000000) {
      const m = (n / 1000000).toFixed(1).replace(".0", "");
      return m.toLocaleString("fa-IR") + " میلیون";
    }
    return (n || 0).toLocaleString("fa-IR") + " تومان";
  },

  renderStars(rating) {
    let s = "";
    const full = Math.floor(rating);
    for (let i = 0; i < full; i++) s += '<i class="bi bi-star-fill"></i>';
    for (let i = 0; i < 5 - full; i++) s += '<i class="bi bi-star"></i>';
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

window.ProductsPage = ProductsPage;
console.log("[Products] ✅ آماده — منتظر ProductsPage.init()");
