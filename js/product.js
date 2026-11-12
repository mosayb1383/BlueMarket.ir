/* ============================================
   صفحه محصول — بلو مارکت
   نسخه ۳.۳ — امن‌شده (چک لاگین)
   ============================================ */

"use strict";

const ProductPage = {
  product: null,
  quantity: 1,
  selectedColor: null,
  lightboxIndex: 0,
  baseReviewCount: 0,

  init() {
    const id = this.getIdFromURL();
    if (!id) {
      this.showNotFound();
      return;
    }
    this.product = ProductsDB.getById(id);
    if (!this.product) {
      this.showNotFound();
      return;
    }

    this.selectedColor = this.product.colors?.[0] || null;
    this.baseReviewCount = this.product.reviewCount || 0;

    this.renderBreadcrumb();
    this.renderProduct();
    this.renderRelated();
    this.updateSEO();
    this.injectSchema();
    this.installGalleryLightbox();
    this.trackRecent();
  },

  getIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    return id ? String(id) : null;
  },

  trackRecent() {
    if (!this.product) return;
    try {
      const list = JSON.parse(localStorage.getItem("bl_recent") || "[]");
      const filtered = list.filter(
        (x) => String(x) !== String(this.product.id),
      );
      filtered.unshift(this.product.id);
      localStorage.setItem("bl_recent", JSON.stringify(filtered.slice(0, 10)));
    } catch (e) {}
  },

  showNotFound() {
    const container = document.getElementById("productDetailContainer");
    if (!container) return;
    container.innerHTML = `
            <div class="col-12 text-center" style="padding:80px 20px;">
                <i class="bi bi-box-seam" style="font-size:5rem;color:#f97316;"></i>
                <h2 class="mt-3 fw-bold">محصول مورد نظر یافت نشد</h2>
                <p class="text-muted mb-4">ممکن است محصول حذف شده یا آدرس اشتباه باشد.</p>
                <a href="products.html" class="bm-btn-primary"><i class="bi bi-shop"></i> بازگشت به فروشگاه</a>
            </div>
        `;
  },

  renderBreadcrumb() {
    const el = document.getElementById("breadcrumbProduct");
    if (el) el.textContent = this.product.shortName || this.product.name;
    const catEl = document.getElementById("breadcrumbCategory");
    if (catEl) {
      const catMap = {
        mobile: "موبایل",
        laptop: "لپ‌تاپ",
        tablet: "تبلت",
        watch: "ساعت هوشمند",
        accessory: "لوازم جانبی",
      };
      catEl.textContent = catMap[this.product.category] || "محصولات";
      const routes = {
        mobile: "mobiles.html",
        laptop: "laptops.html",
        tablet: "tablets.html",
        watch: "watches.html",
        accessory: "accessories.html",
      };
      catEl.href = routes[this.product.category] || "products.html";
    }
  },

  renderProduct() {
    const container = document.getElementById("productDetailContainer");
    if (!container) return;

    const p = this.product;
    p.images =
      Array.isArray(p.images) && p.images.length
        ? p.images
        : [p.image || "images/products/placeholder-product.svg"];
    if (!p.image) p.image = p.images[0];

    const discountPercent = this.discountPercent();
    const isDemo = p.isDemo === true;

    let isInWishlist = false;
    try {
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      isInWishlist = wishlist.some((i) => String(i.id) === String(p.id));
    } catch (e) {}

    container.innerHTML = `
            <div class="col-lg-6">
                <div class="bm-gallery">
                    <div class="bm-gallery-main" id="mainImageWrapper" onclick="ProductPage.openLightbox()">
                        <div class="bm-gallery-badges">
                            ${p.isNew ? '<span class="bm-gallery-badge new"><i class="bi bi-stars"></i> جدید</span>' : ""}
                            ${p.isBestseller ? '<span class="bm-gallery-badge best"><i class="bi bi-fire"></i> پرفروش</span>' : ""}
                            ${discountPercent > 0 ? `<span class="bm-gallery-badge discount">${discountPercent}٪ تخفیف</span>` : ""}
                            ${isDemo ? '<span class="bm-gallery-badge" style="background:#6b7280;"><i class="bi bi-info-circle"></i> Demo</span>' : ""}
                            ${p.stock === 0 ? '<span class="bm-gallery-badge out-stock">ناموجود</span>' : ""}
                        </div>
                        <div class="bm-gallery-zoom-hint"><i class="bi bi-zoom-in"></i> بزرگ‌نمایی</div>
                        <img src="${p.images[0]}" alt="${this.esc(p.name)}" id="mainImage" onerror="this.onerror=null;this.src='images/products/placeholder-product.svg'">
                    </div>
                    ${
                      p.images.length > 1
                        ? `
                        <div class="bm-gallery-thumbs" id="thumbnailList">
                            ${p.images
                              .map(
                                (img, i) => `
                                <div class="bm-thumb ${i === 0 ? "active" : ""}" onclick="ProductPage.changeImage('${img}', this)">
                                    <img src="${img}" alt="تصویر ${i + 1}" loading="lazy">
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                    `
                        : ""
                    }
                </div>
            </div>

            <div class="col-lg-6">
                <div class="bm-info-panel">
                    <div class="bm-info-head">
                        <div class="bm-info-breadcrumb"><i class="bi bi-shop"></i> بلو مارکت</div>
                        <h1 class="bm-info-title">${this.esc(p.name)}</h1>
                        ${p.shortName && p.shortName !== p.name ? `<div class="bm-info-subtitle">${this.esc(p.shortName)}</div>` : ""}
                    </div>

                    <div class="bm-info-rating-row">
                        <div class="bm-info-rating">
                            ${this.renderStars(p.rating)}
                            <span class="bm-rating-value">${p.rating.toFixed(1)}</span>
                            <span class="bm-rating-count">(${p.reviewCount} نظر)</span>
                        </div>
                        <span class="bm-info-divider"></span>
                        <div class="bm-info-stock ${this.getStockClass()}">
                            <i class="bi bi-${this.getStockIcon()}"></i>
                            ${this.getStockText()}
                        </div>
                    </div>

                    ${
                      p.highlights && p.highlights.length
                        ? `
                        <ul class="bm-info-highlights">
                            ${p.highlights
                              .slice(0, 4)
                              .map(
                                (h) =>
                                  `<li><i class="bi bi-check-circle-fill"></i> ${this.esc(h)}</li>`,
                              )
                              .join("")}
                        </ul>
                    `
                        : ""
                    }

                    ${
                      p.colors && p.colors.length
                        ? `
                        <div class="bm-color-selector">
                            <label class="bm-color-label">رنگ: <strong id="selectedColorLabel">${this.esc(this.selectedColor)}</strong></label>
                            <div class="bm-color-options" id="colorOptions">
                                ${p.colors
                                  .map(
                                    (c) => `
                                    <button type="button" class="bm-color-btn ${c === this.selectedColor ? "active" : ""}" data-color="${this.esc(c)}" onclick="ProductPage.selectColor('${this.esc(c)}')">${this.esc(c)}</button>
                                `,
                                  )
                                  .join("")}
                            </div>
                        </div>
                    `
                        : ""
                    }

                    <div class="bm-price-box">
                        ${
                          discountPercent > 0
                            ? `
                            <div class="bm-price-badge-row">
                                <span class="bm-price-badge">${discountPercent}٪ تخفیف</span>
                                <span class="bm-price-old">${this.formatPrice(p.oldPrice)}</span>
                            </div>
                        `
                            : ""
                        }
                        <div class="bm-price-current">
                            ${this.formatPrice(p.price)}
                            ${p.priceReviewRequired ? '<small class="bm-price-note">قیمت نیازمند تأیید</small>' : ""}
                        </div>
                    </div>

                    <div class="bm-buy-actions">
                        <div class="bm-qty-picker">
                            <button type="button" onclick="ProductPage.changeQty(-1)" aria-label="کاهش"><i class="bi bi-dash-lg"></i></button>
                            <input type="text" id="quantityInput" value="1" readonly aria-label="تعداد">
                            <button type="button" onclick="ProductPage.changeQty(1)" aria-label="افزایش"><i class="bi bi-plus-lg"></i></button>
                        </div>
                        <button type="button" class="bm-add-cart-btn" id="addToCartBtn" onclick="ProductPage.addToCart()" ${p.stock === 0 ? "disabled" : ""}>
                            <i class="bi bi-cart-plus"></i>
                            ${p.stock === 0 ? "ناموجود" : "افزودن به سبد خرید"}
                        </button>
                        <button type="button" class="bm-wishlist-btn ${isInWishlist ? "active" : ""}" id="wishlistBtn" onclick="ProductPage.toggleWishlist()" aria-label="علاقه‌مندی">
                            <i class="bi ${isInWishlist ? "bi-heart-fill" : "bi-heart"}"></i>
                        </button>
                    </div>

                    <div class="bm-seller-info">
                        <div class="bm-seller-badge"><i class="bi bi-shop"></i><span>فروشنده: <strong>${this.esc(p.seller || "بلو مارکت")}</strong></span></div>
                        <div class="bm-seller-badge"><i class="bi bi-shield-check"></i><span>${this.esc(p.warranty || "۱۸ ماه گارانتی")}</span></div>
                        <div class="bm-seller-badge"><i class="bi bi-truck"></i><span>ارسال سریع</span></div>
                    </div>

                    <div class="bm-trust-badges">
                        <div class="bm-trust-item"><i class="bi bi-shield-check"></i><span>ضمانت اصالت</span></div>
                        <div class="bm-trust-item"><i class="bi bi-truck"></i><span>ارسال سریع</span></div>
                        <div class="bm-trust-item"><i class="bi bi-arrow-repeat"></i><span>بازگشت ۷ روزه</span></div>
                        <div class="bm-trust-item"><i class="bi bi-patch-check"></i><span>${this.esc(p.warranty || "گارانتی معتبر")}</span></div>
                    </div>
                </div>
            </div>
        `;

    this.renderTabs();
    this.renderReviews();
  },

  renderTabs() {
    const tabsSection = document.getElementById("productTabsSection");
    if (!tabsSection) return;
    tabsSection.innerHTML = `
            <div class="container">
                <div class="bm-tabs">
                    <div class="bm-tabs-nav" role="tablist">
                        <button class="bm-tab-btn active" data-tab="desc" onclick="ProductPage.switchTab('desc', this)"><i class="bi bi-file-text"></i><span>توضیحات</span></button>
                        <button class="bm-tab-btn" data-tab="specs" onclick="ProductPage.switchTab('specs', this)"><i class="bi bi-list-check"></i><span>مشخصات فنی</span></button>
                        <button class="bm-tab-btn" data-tab="analysis" onclick="ProductPage.switchTab('analysis', this)"><i class="bi bi-journal-richtext"></i><span>نقد و بررسی</span></button>
                        <button class="bm-tab-btn" data-tab="reviews" onclick="ProductPage.switchTab('reviews', this)"><i class="bi bi-chat-quote"></i><span>نظرات (<span id="reviewCountTab">${this.product.reviewCount || 0}</span>)</span></button>
                    </div>
                    <div class="bm-tabs-content">
                        <div class="bm-tab-pane active" id="tab-desc">
                            <div class="bm-desc-content">
                                <p>${this.esc(this.product.desc || "")}</p>
                                ${
                                  this.product.highlights &&
                                  this.product.highlights.length
                                    ? `
                                    <h5 class="bm-desc-heading">ویژگی‌های برجسته:</h5>
                                    <ul class="bm-desc-list">
                                        ${this.product.highlights.map((h) => `<li><i class="bi bi-check2"></i>${this.esc(h)}</li>`).join("")}
                                    </ul>
                                `
                                    : ""
                                }
                            </div>
                        </div>
                        <div class="bm-tab-pane" id="tab-specs">
                            <table class="bm-specs-table">
                                <tbody>
                                    ${Object.entries(this.product.specs || {})
                                      .map(
                                        ([k, v]) =>
                                          `<tr><td>${this.esc(k)}</td><td>${this.esc(v)}</td></tr>`,
                                      )
                                      .join("")}
                                </tbody>
                            </table>
                        </div>
                        <div class="bm-tab-pane" id="tab-analysis">
                            <div class="bm-analysis-layout">
                                <div class="bm-analysis-intro">
                                    <span class="bm-analysis-kicker">بررسی محصول</span>
                                    <h3>${this.esc(this.product.shortName || this.product.name)}</h3>
                                    <p>${this.esc(this.product.desc || "بررسی ویژگی‌ها و مشخصات محصول")}</p>
                                </div>
                                <div class="bm-analysis-points">
                                    <section>
                                        <h5><i class="bi bi-check2-circle"></i> نکات مثبت</h5>
                                        <ul>${(this.product.highlights || []).map((x) => `<li>${this.esc(x)}</li>`).join("") || "<li>مشخصات محصول در جدول فنی درج شده است.</li>"}</ul>
                                    </section>
                                    <section>
                                        <h5><i class="bi bi-info-circle"></i> پیش از خرید</h5>
                                        <ul>
                                            <li>ظرفیت، رنگ و نسخه دقیق محصول را انتخاب کنید.</li>
                                            <li>شرایط گارانتی و اصالت کالا را در زمان ثبت سفارش بررسی کنید.</li>
                                            <li>قیمت و موجودی ممکن است با تغییر بازار به‌روزرسانی شود.</li>
                                        </ul>
                                    </section>
                                </div>
                            </div>
                        </div>
                        <div class="bm-tab-pane" id="tab-reviews">
                            <div class="bm-review-form">
                                <h5>تجربه‌ات از این محصول چطور بود؟</h5>
                                <p>نظرت به خریداران بعدی برای انتخاب بهتر کمک می‌کند.</p>
                                <div class="bm-review-grid">
                                    <label>امتیاز
                                        <select id="reviewRating">
                                            <option value="5">۵ ستاره - عالی</option>
                                            <option value="4">۴ ستاره - خوب</option>
                                            <option value="3">۳ ستاره - متوسط</option>
                                            <option value="2">۲ ستاره - ضعیف</option>
                                            <option value="1">۱ ستاره - خیلی ضعیف</option>
                                        </select>
                                    </label>
                                    <label>عنوان نظر<input id="reviewTitle" maxlength="70" placeholder="مثلاً کیفیت ساخت عالی"></label>
                                    <label class="bm-review-full">متن نظر<textarea id="reviewText" rows="3" maxlength="900" placeholder="از تجربه استفاده‌ات بنویس..."></textarea></label>
                                </div>
                                <button class="bm-add-cart-btn" type="button" onclick="ProductPage.submitReview()" style="max-width:200px;"><i class="bi bi-send"></i> ثبت نظر</button>
                                <small style="display:block;margin-top:8px;color:#9ca3af;font-size:0.75rem;">نظرها در همین مرورگر ذخیره می‌شوند.</small>
                            </div>
                            <div class="bm-reviews-list" id="productReviewsList"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
  },

  renderRelated() {
    const container = document.getElementById("relatedProducts");
    if (!container) return;
    const related = ProductsDB.related(this.product.id, 6);
    if (!related.length) {
      document.getElementById("relatedSection")?.remove();
      return;
    }
    container.innerHTML = related
      .map(
        (p) => `
            <div class="bm-product-card" onclick="location.href='product.html?id=${p.id}'" role="link" tabindex="0">
                <div class="bm-product-img">
                    <img src="${this.esc(p.image)}" alt="${this.esc(p.name)}" loading="lazy" onerror="this.onerror=null;this.src='images/products/placeholder-product.svg'">
                    ${p.isNew ? '<span class="bm-badge bm-badge-new">جدید</span>' : ""}
                    ${p.oldPrice && p.oldPrice > p.price ? `<span class="bm-badge bm-badge-discount">${Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)}٪</span>` : ""}
                </div>
                <div class="bm-product-info">
                    <h3 class="bm-product-title">${this.esc(p.shortName || p.name)}</h3>
                    <div class="bm-product-price">
                        ${p.oldPrice ? `<span class="bm-old-price">${this.formatPrice(p.oldPrice)}</span>` : ""}
                        <span class="bm-current-price">${this.formatPrice(p.price)}</span>
                    </div>
                    <div class="bm-product-rating">${this.renderStars(p.rating)}<span>(${p.rating.toFixed(1)})</span></div>
                </div>
            </div>
        `,
      )
      .join("");
  },

  discountPercent() {
    const p = this.product;
    if (!p.oldPrice || p.oldPrice <= p.price) return 0;
    return Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
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

  getStockClass() {
    const s = this.product.stock || 0;
    if (s === 0) return "out";
    if (s <= 5) return "low";
    return "in";
  },
  getStockIcon() {
    const s = this.product.stock || 0;
    if (s === 0) return "x-circle";
    if (s <= 5) return "exclamation-circle";
    return "check-circle";
  },
  getStockText() {
    const s = this.product.stock || 0;
    if (s === 0) return "ناموجود";
    if (s <= 5) return `فقط ${s} عدد باقی‌مانده`;
    return "موجود در انبار";
  },

  installGalleryLightbox() {
    if (document.getElementById("productLightbox")) return;
    const box = document.createElement("div");
    box.id = "productLightbox";
    box.className = "bm-lightbox";
    box.setAttribute("aria-modal", "true");
    box.setAttribute("role", "dialog");
    box.innerHTML = `
            <button class="bm-lightbox-close" type="button" aria-label="بستن" onclick="ProductPage.closeLightbox()"><i class="bi bi-x-lg"></i></button>
            <button class="bm-lightbox-arrow prev" type="button" aria-label="قبلی" onclick="ProductPage.stepLightbox(-1)"><i class="bi bi-chevron-right"></i></button>
            <img id="lightboxImage" alt="نمایش بزرگ محصول">
            <button class="bm-lightbox-arrow next" type="button" aria-label="بعدی" onclick="ProductPage.stepLightbox(1)"><i class="bi bi-chevron-left"></i></button>
            <div class="bm-lightbox-counter" id="lightboxCounter"></div>
            <div class="bm-lightbox-thumbs" id="lightboxThumbs"></div>
        `;
    document.body.appendChild(box);

    let touchX = null;
    box.addEventListener(
      "touchstart",
      (e) => {
        touchX = e.changedTouches?.[0]?.clientX ?? null;
      },
      { passive: true },
    );
    box.addEventListener(
      "touchend",
      (e) => {
        if (touchX === null) return;
        const dx = (e.changedTouches?.[0]?.clientX ?? touchX) - touchX;
        if (Math.abs(dx) > 45) this.stepLightbox(dx < 0 ? 1 : -1);
        touchX = null;
      },
      { passive: true },
    );
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.closeLightbox();
      if (e.key === "ArrowRight") this.stepLightbox(-1);
      if (e.key === "ArrowLeft") this.stepLightbox(1);
    });
  },

  openLightbox(index) {
    this.installGalleryLightbox();
    this.lightboxIndex = Number.isInteger(index) ? index : 0;
    this.renderLightbox();
    document.getElementById("productLightbox")?.classList.add("open");
    document.body.classList.add("lightbox-open");
  },

  renderLightbox() {
    const imgs = this.product?.images || [this.product?.image];
    if (!imgs.length) return;
    this.lightboxIndex = (this.lightboxIndex + imgs.length) % imgs.length;
    const img = document.getElementById("lightboxImage");
    if (img) img.src = imgs[this.lightboxIndex];
    const count = document.getElementById("lightboxCounter");
    if (count)
      count.textContent = `${this.lightboxIndex + 1} از ${imgs.length}`;
    document.querySelectorAll(".bm-lightbox-arrow").forEach((btn) => {
      btn.style.display = imgs.length > 1 ? "grid" : "none";
    });
    const thumbs = document.getElementById("lightboxThumbs");
    if (thumbs)
      thumbs.innerHTML = imgs
        .map(
          (src, i) => `
            <button type="button" class="bm-lightbox-thumb ${i === this.lightboxIndex ? "active" : ""}" onclick="ProductPage.openLightbox(${i})">
                <img src="${src}" alt="تصویر ${i + 1}">
            </button>
        `,
        )
        .join("");
  },

  stepLightbox(dir) {
    this.lightboxIndex = (this.lightboxIndex || 0) + dir;
    this.renderLightbox();
  },
  closeLightbox() {
    document.getElementById("productLightbox")?.classList.remove("open");
    document.body.classList.remove("lightbox-open");
  },

  reviewKey() {
    return `bl_product_reviews_${this.product?.id}`;
  },
  getReviews() {
    try {
      return JSON.parse(localStorage.getItem(this.reviewKey()) || "[]");
    } catch (e) {
      return [];
    }
  },

  renderReviews() {
    const box = document.getElementById("productReviewsList");
    if (!box) return;
    const reviews = this.getReviews();
    const totalReviews =
      (this.baseReviewCount ?? (this.product.reviewCount || 0)) +
      reviews.length;
    const tabCount = document.getElementById("reviewCountTab");
    if (tabCount) tabCount.textContent = totalReviews;
    const ratingCount = document.querySelector(".bm-rating-count");
    if (ratingCount) ratingCount.textContent = `(${totalReviews} نظر)`;

    box.innerHTML = reviews.length
      ? reviews
          .slice()
          .reverse()
          .map(
            (r) => `
                <article class="bm-review-card">
                    <div class="bm-review-card-head">
                        <strong>${this.esc(r.name || "خریدار")}</strong>
                        <span class="bm-review-stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</span>
                    </div>
                    <h6>${this.esc(r.title || "نظر خریدار")}</h6>
                    <p>${this.esc(r.text)}</p>
                    <small>${this.esc(new Date(r.createdAt).toLocaleDateString("fa-IR"))}</small>
                </article>
            `,
          )
          .join("")
      : `
            <div class="bm-reviews-empty">
                <i class="bi bi-chat-square-heart"></i>
                <h5>هنوز نظری ثبت نشده</h5>
                <p>اولین نفری باش که تجربه‌اش رو با بقیه به اشتراک می‌گذاره.</p>
            </div>
        `;
  },

  submitReview() {
    const text = document.getElementById("reviewText")?.value.trim();
    if (!text) return this.showToast("متن نظر را بنویسید", "warning");
    const user = typeof getCurrentUser === "function" ? getCurrentUser() : {};
    if (!user?.isLoggedIn)
      return this.showToast("برای ثبت نظر ابتدا وارد حساب شوید", "warning");
    const reviews = this.getReviews();
    reviews.push({
      id: "rv_" + Date.now(),
      name: user.name || "خریدار",
      rating: Number(document.getElementById("reviewRating")?.value || 5),
      title:
        document.getElementById("reviewTitle")?.value.trim() || "نظر خریدار",
      text,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(this.reviewKey(), JSON.stringify(reviews));
    document.getElementById("reviewText").value = "";
    document.getElementById("reviewTitle").value = "";
    this.renderReviews();
    this.showToast("نظر شما ثبت شد", "success");
  },

  changeImage(src, thumbEl) {
    const main = document.getElementById("mainImage");
    if (main) main.src = src;
    if (Array.isArray(this.product?.images)) {
      const imageIndex = this.product.images.indexOf(src);
      if (imageIndex >= 0) this.lightboxIndex = imageIndex;
    }
    document
      .querySelectorAll(".bm-thumb")
      .forEach((el) => el.classList.remove("active"));
    if (thumbEl) thumbEl.classList.add("active");
  },

  selectColor(color) {
    this.selectedColor = color;
    document.querySelectorAll(".bm-color-btn").forEach((el) => {
      el.classList.toggle("active", el.dataset.color === color);
    });
    const label = document.getElementById("selectedColorLabel");
    if (label) label.textContent = color;
  },

  changeQty(delta) {
    const input = document.getElementById("quantityInput");
    if (!input) return;
    const stock = this.product.stock || 99;
    let next = this.quantity + delta;
    if (next < 1) next = 1;
    if (next > 99) return this.showToast("حداکثر ۹۹ عدد", "warning");
    if (next > stock)
      return this.showToast(`فقط ${stock} عدد موجود است`, "warning");
    this.quantity = next;
    input.value = next;
  },

  switchTab(tab, btn) {
    document
      .querySelectorAll(".bm-tab-btn")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelectorAll(".bm-tab-pane")
      .forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("tab-" + tab)?.classList.add("active");
  },

  /* ========== سبد خرید (با چک لاگین) ========== */
  addToCart() {
    if (typeof requireLogin === "function") {
      if (!requireLogin("افزودن محصول به سبد خرید")) return;
    }

    if (this.product.stock === 0) {
      return this.showToast("این محصول ناموجود است", "error");
    }

    let saved = false;
    if (window.CartStore) {
      saved = window.CartStore.add(
        this.product,
        this.quantity,
        this.selectedColor,
      );
    } else if (typeof window.addProductToCart === "function") {
      saved = window.addProductToCart(
        this.product,
        this.quantity,
        this.selectedColor,
      );
    }

    if (saved === false) {
      return this.showToast("ذخیره سبد انجام نشد؛ دوباره تلاش کنید", "error");
    }

    if (typeof updateCartBadge === "function") updateCartBadge();
    this.showToast(
      `${this.product.shortName || this.product.name} به سبد خرید اضافه شد`,
      "success",
    );
  },

  /* ========== علاقه‌مندی (با چک لاگین) ========== */
  toggleWishlist() {
    if (
      typeof requireLogin === "function" &&
      !requireLogin("افزودن به علاقه‌مندی‌ها")
    )
      return;

    let wishlist = [];
    try {
      wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    } catch (e) {
      wishlist = [];
    }

    const idx = wishlist.findIndex(
      (i) => String(i.id) === String(this.product.id),
    );

    if (idx >= 0) {
      wishlist.splice(idx, 1);
      this.showToast("از علاقه‌مندی‌ها حذف شد", "info");
    } else {
      wishlist.push({
        id: this.product.id,
        name: this.product.name,
        price: this.product.price,
        image: this.product.image,
        rating: this.product.rating,
        addedAt: new Date().toISOString(),
      });
      this.showToast("به علاقه‌مندی‌ها اضافه شد", "success");
    }

    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    const btn = document.getElementById("wishlistBtn");
    if (btn) {
      const isNowIn = idx < 0;
      btn.classList.toggle("active", isNowIn);
      const icon = btn.querySelector("i");
      if (icon) icon.className = isNowIn ? "bi bi-heart-fill" : "bi bi-heart";
    }
  },

  /* ========== SEO ========== */
  updateSEO() {
    const p = this.product;
    const fullTitle = `${p.name} | خرید با بهترین قیمت | بلو مارکت`;
    const desc = (p.desc || p.shortName || "").substring(0, 155) + "...";
    document.title = fullTitle;

    const setMeta = (name, content, attr = "name") => {
      if (!content) return;
      let tag = document.querySelector(`meta[${attr}="${name}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attr, name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    const imgUrl =
      p.image && p.image.startsWith("http")
        ? p.image
        : "https://YOUR-DOMAIN.ir/" + (p.image || "images/logo.svg");

    setMeta("description", desc);
    setMeta(
      "keywords",
      `${p.name}, ${p.shortName || ""}, خرید ${p.shortName || p.name}, قیمت ${p.shortName || p.name}, ${p.brand || ""}`,
    );
    setMeta("og:title", fullTitle, "property");
    setMeta("og:description", desc, "property");
    setMeta("og:image", imgUrl, "property");
    setMeta("og:image:alt", p.name, "property");
    setMeta("og:type", "product", "property");
    setMeta("og:url", window.location.href, "property");
    setMeta("product:price:amount", String(p.price), "property");
    setMeta("product:price:currency", "IRR", "property");
    setMeta(
      "product:availability",
      p.stock > 0 ? "in stock" : "out of stock",
      "property",
    );
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", desc);
    setMeta("twitter:image", imgUrl);

    let canon = document.querySelector('link[rel="canonical"]');
    if (!canon) {
      canon = document.createElement("link");
      canon.rel = "canonical";
      document.head.appendChild(canon);
    }
    canon.href = "https://YOUR-DOMAIN.ir/product.html?id=" + p.id;
  },

  injectSchema() {
    const p = this.product;
    const imgUrl = (img) =>
      img && img.startsWith("http")
        ? img
        : "https://YOUR-DOMAIN.ir/" + (img || "images/logo.svg");

    const productSchema = {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: p.name,
      image: (p.images || [p.image]).map(imgUrl),
      description: p.desc || p.shortName || "",
      sku: `BM-${p.id}`,
      brand: { "@type": "Brand", name: p.brand || "بلو مارکت" },
      category: p.category,
      offers: {
        "@type": "Offer",
        url: window.location.href,
        priceCurrency: "IRR",
        price: p.price,
        availability:
          p.stock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        seller: { "@type": "Organization", name: p.seller || "بلو مارکت" },
        priceValidUntil: new Date(Date.now() + 30 * 86400000)
          .toISOString()
          .split("T")[0],
      },
      aggregateRating:
        p.rating > 0
          ? {
              "@type": "AggregateRating",
              ratingValue: p.rating,
              reviewCount: p.reviewCount || 1,
              bestRating: 5,
              worstRating: 1,
            }
          : undefined,
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(productSchema);
    document.head.appendChild(script);

    const catLabels = {
      mobile: "موبایل",
      laptop: "لپ‌تاپ",
      tablet: "تبلت",
      watch: "ساعت هوشمند",
      accessory: "لوازم جانبی",
    };
    const catUrls = {
      mobile: "mobiles.html",
      laptop: "laptops.html",
      tablet: "tablets.html",
      watch: "watches.html",
      accessory: "accessories.html",
    };

    const breadcrumb = {
      "@context": "https://schema.org/",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "خانه",
          item: "https://YOUR-DOMAIN.ir/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "محصولات",
          item: "https://YOUR-DOMAIN.ir/products.html",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: catLabels[p.category] || "محصولات",
          item:
            "https://YOUR-DOMAIN.ir/" +
            (catUrls[p.category] || "products.html"),
        },
        { "@type": "ListItem", position: 4, name: p.shortName || p.name },
      ],
    };

    const bcScript = document.createElement("script");
    bcScript.type = "application/ld+json";
    bcScript.textContent = JSON.stringify(breadcrumb);
    document.head.appendChild(bcScript);
  },

  showToast(message, type = "info") {
    const existing = document.querySelector(".product-toast");
    if (existing) existing.remove();
    const icons = {
      success: "bi-check-circle-fill",
      error: "bi-x-circle-fill",
      info: "bi-info-circle-fill",
      warning: "bi-exclamation-triangle-fill",
    };
    const toast = document.createElement("div");
    toast.className = `product-toast ${type}`;
    toast.innerHTML = `<i class="bi ${icons[type] || icons.info}"></i><span>${this.esc(message)}</span>`;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("show"));
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 2800);
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

window.ProductPage = ProductPage;
