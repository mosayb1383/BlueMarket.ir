/* ============================================
   ACCOUNT — بلو مارکت (کیف پول + تراکنش‌ها + امنیت)
   ============================================ */

"use strict";

const AccountPage = {
  state: {
    user: null,
    activeTab: "orders",
    orders: [],
    addresses: [],
    wishlist: [],
    tickets: [],
    walletBalance: 0,
    walletTx: [],
  },

  init() {
    this.state.user = getCurrentUser();
    if (!this.state.user || !this.state.user.isLoggedIn) {
      const redirect = encodeURIComponent("account.html");
      window.location.href = `auth.html?redirect=${redirect}`;
      return;
    }

    this.loadData();
    this.renderProfileHero();
    this.renderSidebarBadges();
    this.renderOrders();
    this.renderWallet();
    this.renderProfile();
    this.renderAddresses();
    this.renderTickets();
    this.renderWishlist();
    this.attachEvents();
    this.handleURLHash();
  },

  loadData() {
    try {
      this.state.orders = JSON.parse(localStorage.getItem("bl_orders") || "[]");
    } catch (e) {
      this.state.orders = [];
    }
    try {
      this.state.addresses = JSON.parse(
        localStorage.getItem("bl_addresses") || "[]",
      );
    } catch (e) {
      this.state.addresses = [];
    }
    try {
      this.state.wishlist = JSON.parse(
        localStorage.getItem("wishlist") || "[]",
      );
    } catch (e) {
      this.state.wishlist = [];
    }
    this.state.tickets = this.getTickets();

    const raw = localStorage.getItem("bl_wallet_balance");
    this.state.walletBalance = raw !== null ? Math.max(0, Number(raw) || 0) : 0;
    try {
      this.state.walletTx = JSON.parse(
        localStorage.getItem("bl_wallet_tx") || "[]",
      );
    } catch (e) {
      this.state.walletTx = [];
    }
  },

  saveOrders() {
    localStorage.setItem("bl_orders", JSON.stringify(this.state.orders));
  },
  saveAddresses() {
    localStorage.setItem("bl_addresses", JSON.stringify(this.state.addresses));
  },
  saveWishlist() {
    localStorage.setItem("wishlist", JSON.stringify(this.state.wishlist));
  },

  renderProfileHero() {
    const container = document.getElementById("profileHero");
    if (!container) return;
    const u = this.state.user;
    const firstName = u.firstName || (u.name || "").split(" ")[0] || "کاربر";
    const initial = (firstName[0] || "؟").toUpperCase();
    const totalOrders = this.state.orders.length;
    const totalSpent = this.state.orders.reduce(
      (s, o) => s + (o.total || 0),
      0,
    );

    container.innerHTML = `
            <div class="profile-hero-left">
                <div class="profile-avatar">${initial}</div>
                <div class="profile-info">
                    <h1>${this.esc(u.name || "کاربر")}</h1>
                    <div class="email"><i class="bi bi-envelope"></i> ${this.esc(u.email || "")}</div>
                    <div class="profile-badges">
                        ${u.phone ? `<span class="profile-badge"><i class="bi bi-phone"></i>${this.esc(u.phone)}</span>` : ""}
                        <span class="profile-badge"><i class="bi bi-patch-check-fill"></i>کاربر تأییدشده</span>
                    </div>
                </div>
            </div>
            <div class="profile-stats">
                <div class="profile-stat"><div class="num">${totalOrders.toLocaleString("fa-IR")}</div><div class="label">سفارش</div></div>
                <div class="profile-stat"><div class="num">${this.formatShortPrice(totalSpent)}</div><div class="label">خرید کل</div></div>
                <div class="profile-stat"><div class="num">${this.state.walletBalance.toLocaleString("fa-IR")}</div><div class="label">کیف پول</div></div>
            </div>
        `;
  },

  renderSidebarBadges() {
    const set = (id, n) => {
      const el = document.getElementById(id);
      if (el) el.textContent = n.toLocaleString("fa-IR");
    };
    set("badgeOrders", this.state.orders.length);
    set("badgeWishlist", this.state.wishlist.length);
    set("badgeAddresses", this.state.addresses.length);
    set("badgeTickets", this.getTickets().length);
    set("badgeWallet", this.state.walletBalance > 0 ? 1 : 0);
  },

  switchTab(tab) {
    this.state.activeTab = tab;
    document
      .querySelectorAll(".sidebar-menu-item[data-tab]")
      .forEach((item) => {
        item.classList.toggle("active", item.dataset.tab === tab);
      });
    document
      .querySelectorAll(".account-panel")
      .forEach((p) => p.classList.remove("active"));
    document.getElementById("panel-" + tab)?.classList.add("active");
    window.history.replaceState({}, "", `#${tab}`);
    window.scrollTo({ top: 200, behavior: "smooth" });
  },

  handleURLHash() {
    const hash = window.location.hash.replace("#", "");
    if (hash && document.getElementById("panel-" + hash)) this.switchTab(hash);
  },

  /* ========== سفارشات ========== */
  renderOrders() {
    const container = document.getElementById("panel-orders");
    if (!container) return;
    const userOrders = this.state.orders.filter(
      (o) => !o.userEmail || o.userEmail === this.state.user.email,
    );

    if (userOrders.length === 0) {
      container.innerHTML = `
                <div class="panel-header"><h2><i class="bi bi-bag"></i> سفارش‌ها</h2></div>
                <div class="empty-panel">
                    <div class="empty-panel-icon"><i class="bi bi-bag-x"></i></div>
                    <h4>هنوز سفارشی ثبت نکرده‌اید</h4>
                    <p>اولین سفارش خود را از فروشگاه ثبت کنید</p>
                    <a href="products.html" class="bm-btn-primary"><i class="bi bi-shop"></i> مشاهده محصولات</a>
                </div>
            `;
      return;
    }

    container.innerHTML = `
            <div class="panel-header">
                <h2><i class="bi bi-bag"></i> سفارش‌ها</h2>
                <span style="color:#6b7280;font-size:0.85rem;">${userOrders.length.toLocaleString("fa-IR")} سفارش</span>
            </div>
            <div class="orders-list">${userOrders.map((order) => this.renderOrderCard(order)).join("")}</div>
        `;
  },

  renderOrderCard(order) {
    const statusMap = {
      pending: {
        label: "در انتظار پرداخت",
        icon: "bi-clock",
        class: "pending",
      },
      processing: {
        label: "در حال پردازش",
        icon: "bi-gear",
        class: "processing",
      },
      shipped: { label: "ارسال شده", icon: "bi-truck", class: "shipped" },
      delivered: {
        label: "تحویل شده",
        icon: "bi-check-circle",
        class: "delivered",
      },
      cancelled: { label: "لغو شده", icon: "bi-x-circle", class: "cancelled" },
    };
    const status = statusMap[order.status] || statusMap.pending;
    const date = this.formatDate(order.createdAt);
    const items = order.items || [];

    return `
            <div class="order-card">
                <div class="order-head">
                    <div class="order-meta">
                        <div class="item"><span class="label">شماره سفارش</span><span class="value">${this.esc(order.id)}</span></div>
                        <div class="item"><span class="label">تاریخ</span><span class="value">${date}</span></div>
                        <div class="item"><span class="label">تعداد اقلام</span><span class="value">${items.length.toLocaleString("fa-IR")}</span></div>
                    </div>
                    <div class="order-status-badge ${status.class}"><i class="bi ${status.icon}"></i> ${status.label}</div>
                </div>
                <div class="order-body">
                    ${items
                      .map(
                        (item) => `
                        <div class="order-item-row">
                            <img src="${this.esc(item.image || "")}" alt="" onerror="this.onerror=null;this.src='images/products/placeholder-product.svg'">
                            <div class="info">
                                <h6>${this.esc(item.name)}</h6>
                                <div class="meta">تعداد: ${(item.quantity || 1).toLocaleString("fa-IR")}${item.color ? " | " + this.esc(item.color) : ""}</div>
                            </div>
                            <div class="price">${((item.price || 0) * (item.quantity || 1)).toLocaleString("fa-IR")} تومان</div>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
                <div class="order-foot">
                    <div class="order-total-block">مبلغ کل: <strong>${(order.total || 0).toLocaleString("fa-IR")} تومان</strong></div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                        <button type="button" class="bm-btn-outline" onclick="AccountPage.viewOrderDetails('${this.esc(order.id)}')"><i class="bi bi-eye"></i> جزئیات</button>
                    </div>
                </div>
            </div>
        `;
  },

  viewOrderDetails(orderId) {
    const order = this.state.orders.find(
      (o) => String(o.id) === String(orderId),
    );
    if (!order) return;
    const items = order.items || [];
    const addr = order.address || {};

    const modal = document.createElement("div");
    modal.className = "order-detail-backdrop";
    modal.innerHTML = `
            <section class="order-detail-modal">
                <header class="order-detail-head">
                    <div>
                        <span class="order-detail-kicker">BLUE MARKET</span>
                        <h2><i class="bi bi-receipt"></i> جزئیات سفارش</h2>
                        <small>شماره: ${this.esc(order.id)}</small>
                    </div>
                    <button type="button" class="order-detail-close" onclick="this.closest('.order-detail-backdrop').remove()"><i class="bi bi-x-lg"></i></button>
                </header>
                <div class="order-detail-section">
                    <h3><i class="bi bi-bag-check"></i> اقلام</h3>
                    ${items
                      .map(
                        (i) => `
                        <div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid #f1f5f9;">
                            <img src="${this.esc(i.image || "")}" style="width:50px;height:50px;object-fit:contain;border-radius:10px;background:#f9fafb;padding:4px;" onerror="this.src='images/products/placeholder-product.svg'">
                            <div style="flex:1;">
                                <strong style="font-size:0.88rem;">${this.esc(i.name)}</strong>
                                <div style="font-size:0.75rem;color:#64748b;">تعداد: ${i.quantity} × ${i.price.toLocaleString("fa-IR")}</div>
                            </div>
                            <b style="color:#f97316;font-size:0.85rem;">${(i.price * i.quantity).toLocaleString("fa-IR")}</b>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
                <div class="order-detail-section">
                    <h3><i class="bi bi-geo-alt"></i> آدرس</h3>
                    <p>${this.esc([addr.province, addr.city, addr.fullAddress].filter(Boolean).join("، ")) || "آدرسی ثبت نشده"}</p>
                </div>
                <div class="order-detail-total"><span>مبلغ نهایی</span><strong>${(order.total || 0).toLocaleString("fa-IR")} تومان</strong></div>
            </section>
        `;
    modal.style.cssText =
      "position:fixed;inset:0;z-index:3000;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(15,23,42,.6);backdrop-filter:blur(10px);";
    modal.querySelector(".order-detail-modal").style.cssText =
      "background:#fff;border-radius:24px;max-width:640px;width:100%;max-height:88vh;overflow:auto;padding:22px;";
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.remove();
    });
    document.body.appendChild(modal);
  },

  /* ========== کیف پول ========== */
  renderWallet() {
    const container = document.getElementById("panel-wallet");
    if (!container) return;

    container.innerHTML = `
            <div class="panel-header"><h2><i class="bi bi-wallet2"></i> کیف پول</h2></div>
            <div class="wallet-hero">
                <div class="wallet-hero-content">
                    <div class="wallet-hero-label">موجودی کیف پول</div>
                    <div class="wallet-hero-amount">${this.state.walletBalance.toLocaleString("fa-IR")} <small>تومان</small></div>
                    <div class="wallet-hero-actions">
                        <button type="button" class="wallet-btn-primary" onclick="AccountPage.openChargeModal()"><i class="bi bi-plus-circle"></i> شارژ کیف پول</button>
                    </div>
                </div>
                <div class="wallet-hero-icon"><i class="bi bi-wallet-fill"></i></div>
            </div>
            <div class="panel-header" style="margin-top:24px;">
                <h3 style="font-size:1.05rem;font-weight:900;color:#1f2937;margin:0;"><i class="bi bi-clock-history"></i> تاریخچه تراکنش‌ها</h3>
            </div>
            ${
              this.state.walletTx.length === 0
                ? `
                <div class="empty-panel">
                    <div class="empty-panel-icon"><i class="bi bi-receipt"></i></div>
                    <h4>هنوز تراکنشی ندارید</h4>
                    <p>با شارژ کیف پول، تراکنش‌های شما اینجا نمایش داده می‌شود</p>
                </div>
            `
                : `
                <div class="wallet-tx-list">
                    ${this.state.walletTx
                      .map(
                        (tx) => `
                        <div class="wallet-tx-item ${tx.type}">
                            <div class="wallet-tx-icon"><i class="bi bi-${tx.type === "credit" ? "arrow-down-circle-fill" : "arrow-up-circle-fill"}"></i></div>
                            <div class="wallet-tx-info">
                                <div class="wallet-tx-desc">${this.esc(tx.description || (tx.type === "credit" ? "شارژ" : "پرداخت"))}</div>
                                <div class="wallet-tx-date">${this.formatDate(tx.createdAt)}</div>
                            </div>
                            <div class="wallet-tx-amount ${tx.type}">${tx.type === "credit" ? "+" : "−"} ${(tx.amount || 0).toLocaleString("fa-IR")}</div>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            `
            }
        `;
  },

  openChargeModal() {
    const modal = document.createElement("div");
    modal.className = "address-modal-backdrop show";
    modal.innerHTML = `
            <div class="address-modal-box" style="max-width:420px;">
                <div class="address-modal-header">
                    <h4><i class="bi bi-wallet2"></i> شارژ کیف پول</h4>
                    <button type="button" class="modal-close-btn" onclick="this.closest('.address-modal-backdrop').remove()"><i class="bi bi-x-lg"></i></button>
                </div>
                <div class="address-modal-body">
                    <p style="color:#6b7280;font-size:0.85rem;margin-bottom:16px;">مبلغ شارژ را انتخاب کنید (پرداخت آزمایشی)</p>
                    <div class="charge-options">
                        <button type="button" class="charge-opt" onclick="AccountPage.chargeWallet(500000)">۵۰۰,۰۰۰ <small>تومان</small></button>
                        <button type="button" class="charge-opt" onclick="AccountPage.chargeWallet(1000000)">۱,۰۰۰,۰۰۰ <small>تومان</small></button>
                        <button type="button" class="charge-opt" onclick="AccountPage.chargeWallet(2000000)">۲,۰۰۰,۰۰۰ <small>تومان</small></button>
                        <button type="button" class="charge-opt" onclick="AccountPage.chargeWallet(5000000)">۵,۰۰۰,۰۰۰ <small>تومان</small></button>
                    </div>
                    <div style="margin-top:16px;">
                        <label style="font-size:0.82rem;font-weight:800;color:#374151;margin-bottom:6px;display:block;">مبلغ دلخواه</label>
                        <input type="number" id="customChargeAmount" placeholder="مثلاً 750000" min="10000" style="width:100%;padding:10px 14px;border:2px solid #e5e7eb;border-radius:10px;font-family:inherit;">
                        <button type="button" class="bm-btn-primary" style="width:100%;margin-top:10px;justify-content:center;" onclick="AccountPage.chargeWallet(Number(document.getElementById('customChargeAmount').value))"><i class="bi bi-check-circle"></i> شارژ</button>
                    </div>
                </div>
            </div>
        `;
    document.body.appendChild(modal);
  },

  chargeWallet(amount) {
    if (!amount || amount < 10000)
      return alert("حداقل مبلغ شارژ ۱۰,۰۰۰ تومان است");
    this.state.walletBalance += Number(amount);
    localStorage.setItem("bl_wallet_balance", String(this.state.walletBalance));
    this.logTx("credit", amount, "شارژ کیف پول");
    document.querySelector(".address-modal-backdrop.show")?.remove();
    this.renderWallet();
    this.renderProfileHero();
    this.renderSidebarBadges();
    this.showToast("کیف پول شارژ شد", "success");
  },

  logTx(type, amount, description) {
    let tx = [];
    try {
      tx = JSON.parse(localStorage.getItem("bl_wallet_tx") || "[]");
    } catch (e) {}
    tx.unshift({
      id: "tx_" + Date.now(),
      type,
      amount,
      description,
      userEmail: this.state.user.email,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("bl_wallet_tx", JSON.stringify(tx.slice(0, 100)));
    this.state.walletTx = tx.slice(0, 100);
  },

  /* ========== پروفایل ========== */
  renderProfile() {
    const container = document.getElementById("panel-profile");
    if (!container) return;
    const u = this.state.user;
    const firstName = u.firstName || (u.name || "").split(" ")[0] || "";
    const lastName =
      u.lastName || (u.name || "").split(" ").slice(1).join(" ") || "";

    container.innerHTML = `
            <div class="panel-header"><h2><i class="bi bi-person-circle"></i> اطلاعات حساب</h2></div>
            <div class="form-card">
                <h3><i class="bi bi-person-vcard"></i> اطلاعات شخصی</h3>
                <p class="form-hint">اطلاعات خود را ویرایش کنید</p>
                <form id="profileForm">
                    <div class="row g-3">
                        <div class="col-md-6"><div class="form-group-account"><label>نام *</label><input type="text" id="profileFirstName" class="form-control" value="${this.esc(firstName)}" required></div></div>
                        <div class="col-md-6"><div class="form-group-account"><label>نام خانوادگی *</label><input type="text" id="profileLastName" class="form-control" value="${this.esc(lastName)}" required></div></div>
                        <div class="col-md-6"><div class="form-group-account"><label>ایمیل</label><input type="email" class="form-control" value="${this.esc(u.email || "")}" disabled></div></div>
                        <div class="col-md-6"><div class="form-group-account"><label>شماره موبایل *</label><input type="tel" id="profilePhone" class="form-control" value="${this.esc(u.phone || "")}" maxlength="11" required></div></div>
                    </div>
                    <button type="submit" class="bm-btn-primary" style="margin-top:16px;"><i class="bi bi-check-circle"></i> ذخیره تغییرات</button>
                </form>
            </div>
        `;

    document.getElementById("profileForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const firstName = document
        .getElementById("profileFirstName")
        .value.trim();
      const lastName = document.getElementById("profileLastName").value.trim();
      const phone = document.getElementById("profilePhone").value.trim();
      if (!firstName || !lastName)
        return this.showToast("نام و نام خانوادگی الزامی است", "error");
      const result = updateUserInfo({ firstName, lastName, phone });
      if (result.success) {
        this.state.user = getCurrentUser();
        this.renderProfileHero();
        this.showToast("اطلاعات ذخیره شد", "success");
      } else {
        this.showToast("خطا در ذخیره", "error");
      }
    });
  },

  /* ========== آدرس‌ها ========== */
  renderAddresses() {
    const container = document.getElementById("panel-addresses");
    if (!container) return;

    container.innerHTML = `
            <div class="panel-header">
                <h2><i class="bi bi-geo-alt"></i> آدرس‌های من</h2>
                <button type="button" class="bm-btn-primary" onclick="AccountPage.openAddressModal()"><i class="bi bi-plus-circle"></i> افزودن آدرس</button>
            </div>
            ${
              this.state.addresses.length === 0
                ? `
                <div class="empty-panel">
                    <div class="empty-panel-icon"><i class="bi bi-geo-alt"></i></div>
                    <h4>هنوز آدرسی ندارید</h4>
                    <p>برای تسریع در ثبت سفارش، آدرس خود را اضافه کنید</p>
                    <button type="button" class="bm-btn-primary" onclick="AccountPage.openAddressModal()"><i class="bi bi-plus-circle"></i> افزودن اولین آدرس</button>
                </div>
            `
                : `
                <div class="addresses-grid">${this.state.addresses.map((a) => this.renderAddressCard(a)).join("")}</div>
            `
            }
        `;
  },

  renderAddressCard(addr) {
    return `
            <div class="address-card-item ${addr.isDefault ? "is-default" : ""}">
                <div class="address-head">
                    <h5><i class="bi bi-geo-alt-fill"></i> ${this.esc(addr.title)}</h5>
                    <div class="address-actions">
                        <button type="button" class="icon-action-btn delete" onclick="AccountPage.deleteAddress('${addr.id}')" title="حذف"><i class="bi bi-trash"></i></button>
                    </div>
                </div>
                <div class="address-body-account">
                    <div>${this.esc(addr.province)}، ${this.esc(addr.city)}</div>
                    <div>${this.esc(addr.fullAddress)}</div>
                    ${addr.postalCode ? `<div class="row-info"><i class="bi bi-mailbox"></i>${this.esc(addr.postalCode)}</div>` : ""}
                    ${addr.phone ? `<div class="row-info"><i class="bi bi-phone"></i>${this.esc(addr.phone)}</div>` : ""}
                </div>
            </div>
        `;
  },

  openAddressModal() {
    const modal = document.createElement("div");
    modal.className = "address-modal-backdrop show";
    modal.innerHTML = `
            <div class="address-modal-box">
                <div class="address-modal-header">
                    <h4><i class="bi bi-geo-alt"></i> افزودن آدرس</h4>
                    <button type="button" class="modal-close-btn" onclick="this.closest('.address-modal-backdrop').remove()"><i class="bi bi-x-lg"></i></button>
                </div>
                <div class="address-modal-body">
                    <div class="form-group-account"><label>عنوان آدرس *</label><input type="text" id="accAddrTitle" maxlength="40" class="form-control"></div>
                    <div class="row g-3">
                        <div class="col-md-6">
                            <div class="form-group-account">
                                <label>استان *</label>
                                <select id="accAddrProvince" class="form-control">
                                    <option value="">انتخاب کنید</option>
                                    <option>سیستان و بلوچستان</option>
                                    <option>تهران</option>
                                    <option>خراسان رضوی</option>
                                    <option>اصفهان</option>
                                    <option>فارس</option>
                                    <option>البرز</option>
                                    <option>گیلان</option>
                                    <option>مازندران</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-6"><div class="form-group-account"><label>شهر *</label><input type="text" id="accAddrCity" maxlength="40" class="form-control"></div></div>
                    </div>
                    <div class="form-group-account"><label>آدرس کامل *</label><textarea id="accAddrFull" rows="3" maxlength="300" class="form-control"></textarea></div>
                    <div class="row g-3">
                        <div class="col-md-6"><div class="form-group-account"><label>کد پستی</label><input type="text" id="accAddrPostal" maxlength="10" class="form-control" inputmode="numeric"></div></div>
                        <div class="col-md-6"><div class="form-group-account"><label>تلفن</label><input type="tel" id="accAddrPhone" maxlength="11" class="form-control" inputmode="numeric"></div></div>
                    </div>
                    <label style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-top:10px;font-size:0.85rem;color:#4b5563;">
                        <input type="checkbox" id="accAddrDefault" style="width:18px;height:18px;accent-color:#f97316;"> آدرس پیش‌فرض
                    </label>
                </div>
                <div class="address-modal-footer">
                    <button type="button" class="bm-btn-outline" onclick="this.closest('.address-modal-backdrop').remove()">انصراف</button>
                    <button type="button" class="bm-btn-primary" onclick="AccountPage.saveAddressFromModal()"><i class="bi bi-check-circle"></i> ذخیره</button>
                </div>
            </div>
        `;
    document.body.appendChild(modal);
  },

  saveAddressFromModal() {
    const title = document.getElementById("accAddrTitle").value.trim();
    const province = document.getElementById("accAddrProvince").value;
    const city = document.getElementById("accAddrCity").value.trim();
    const fullAddress = document.getElementById("accAddrFull").value.trim();
    const postalCode = document.getElementById("accAddrPostal").value.trim();
    const phone = document.getElementById("accAddrPhone").value.trim();
    const isDefault = document.getElementById("accAddrDefault").checked;

    if (!title || !province || !city || !fullAddress)
      return this.showToast("فیلدهای ضروری را پر کنید", "error");

    const newAddr = {
      id: "addr_" + Date.now(),
      title,
      province,
      city,
      fullAddress,
      postalCode,
      phone,
      isDefault,
      createdAt: new Date().toISOString(),
    };
    if (isDefault) this.state.addresses.forEach((a) => (a.isDefault = false));
    this.state.addresses.push(newAddr);
    if (this.state.addresses.length === 1) newAddr.isDefault = true;

    this.saveAddresses();
    document.querySelector(".address-modal-backdrop.show")?.remove();
    this.renderAddresses();
    this.renderSidebarBadges();
    this.showToast("آدرس ذخیره شد", "success");
  },

  deleteAddress(id) {
    if (!confirm("این آدرس حذف شود؟")) return;
    this.state.addresses = this.state.addresses.filter((a) => a.id !== id);
    this.saveAddresses();
    this.renderAddresses();
    this.renderSidebarBadges();
    this.showToast("آدرس حذف شد", "success");
  },

  /* ========== تیکت‌ها ========== */
  getTickets() {
    try {
      const all = JSON.parse(localStorage.getItem("bl_tickets") || "[]");
      const email = this.state.user?.email;
      if (!email) return [];
      return all
        .filter((t) => t.userEmail === email)
        .sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt) -
            new Date(a.updatedAt || a.createdAt),
        );
    } catch (e) {
      return [];
    }
  },

  saveTickets(userTickets) {
    try {
      const all = JSON.parse(localStorage.getItem("bl_tickets") || "[]");
      const email = this.state.user?.email;
      if (!email) return;
      const others = all.filter((t) => t.userEmail !== email);
      localStorage.setItem(
        "bl_tickets",
        JSON.stringify([...userTickets, ...others]),
      );
    } catch (e) {}
  },

  renderTickets() {
    const container = document.getElementById("panel-tickets");
    if (!container) return;
    const tickets = this.getTickets();

    container.innerHTML = `
            <div class="panel-header">
                <h2><i class="bi bi-chat-dots"></i> تیکت‌های پشتیبانی</h2>
                <button type="button" class="bm-btn-primary" onclick="AccountPage.openNewTicketModal()"><i class="bi bi-plus-circle"></i> تیکت جدید</button>
            </div>
            ${
              tickets.length === 0
                ? `
                <div class="empty-panel">
                    <div class="empty-panel-icon"><i class="bi bi-chat-square-text"></i></div>
                    <h4>هنوز تیکتی ندارید</h4>
                    <p>اگر سوال یا مشکلی دارید، تیکت جدید ایجاد کنید</p>
                    <button type="button" class="bm-btn-primary" onclick="AccountPage.openNewTicketModal()"><i class="bi bi-plus-circle"></i> ثبت تیکت</button>
                </div>
            `
                : `
                <div class="tickets-list">${tickets.map((t) => this.renderTicketCard(t)).join("")}</div>
            `
            }
        `;
  },

  renderTicketCard(t) {
    const statusMap = {
      open: { label: "باز", class: "warning" },
      answered: { label: "پاسخ داده", class: "info" },
      closed: { label: "بسته", class: "neutral" },
    };
    const st = statusMap[t.status] || statusMap.open;
    const lastMsg = t.messages?.[t.messages.length - 1];
    const preview = lastMsg ? lastMsg.text.substring(0, 120) : "";

    return `
            <div class="ticket-card" onclick="AccountPage.openTicketDetail('${t.id}')">
                <div class="ticket-card-head">
                    <div class="ticket-card-title-row">
                        <h5>${this.esc(t.subject)}</h5>
                        <span class="status-badge ${st.class}">${st.label}</span>
                    </div>
                    <div class="ticket-card-meta">
                        <span><i class="bi bi-hash"></i>${this.esc(t.id)}</span>
                        <span><i class="bi bi-clock"></i>${this.timeAgo(t.updatedAt || t.createdAt)}</span>
                    </div>
                </div>
                ${preview ? `<div class="ticket-card-preview">${this.esc(preview)}${preview.length >= 120 ? "..." : ""}</div>` : ""}
            </div>
        `;
  },

  openNewTicketModal() {
    const modal = document.createElement("div");
    modal.className = "address-modal-backdrop show";
    modal.innerHTML = `
            <div class="address-modal-box">
                <div class="address-modal-header">
                    <h4><i class="bi bi-chat-dots"></i> تیکت جدید</h4>
                    <button type="button" class="modal-close-btn" onclick="this.closest('.address-modal-backdrop').remove()"><i class="bi bi-x-lg"></i></button>
                </div>
                <div class="address-modal-body">
                    <div class="form-group-account"><label>موضوع *</label><input type="text" id="ticketSubject" maxlength="100" class="form-control"></div>
                    <div class="form-group-account">
                        <label>دسته‌بندی *</label>
                        <select id="ticketCategory" class="form-control">
                            <option value="">انتخاب کنید</option>
                            <option value="order">پیگیری سفارش</option>
                            <option value="product">سوال محصول</option>
                            <option value="warranty">گارانتی</option>
                            <option value="payment">پرداخت</option>
                            <option value="complaint">شکایت</option>
                            <option value="other">سایر</option>
                        </select>
                    </div>
                    <div class="form-group-account">
                        <label>اولویت</label>
                        <select id="ticketPriority" class="form-control">
                            <option value="low">کم</option>
                            <option value="medium" selected>متوسط</option>
                            <option value="high">بالا</option>
                        </select>
                    </div>
                    <div class="form-group-account"><label>متن پیام *</label><textarea id="ticketMessage" rows="5" maxlength="2000" class="form-control"></textarea></div>
                </div>
                <div class="address-modal-footer">
                    <button type="button" class="bm-btn-outline" onclick="this.closest('.address-modal-backdrop').remove()">انصراف</button>
                    <button type="button" class="bm-btn-primary" onclick="AccountPage.submitNewTicket()"><i class="bi bi-send"></i> ارسال</button>
                </div>
            </div>
        `;
    document.body.appendChild(modal);
  },

  submitNewTicket() {
    const subject = document.getElementById("ticketSubject")?.value.trim();
    const category = document.getElementById("ticketCategory")?.value;
    const priority = document.getElementById("ticketPriority")?.value;
    const message = document.getElementById("ticketMessage")?.value.trim();

    if (!subject || subject.length < 3)
      return this.showToast("موضوع حداقل ۳ کاراکتر", "error");
    if (!category) return this.showToast("دسته‌بندی الزامی", "error");
    if (!message || message.length < 10)
      return this.showToast("پیام حداقل ۱۰ کاراکتر", "error");

    const tickets = this.getTickets();
    const u = this.state.user;

    const newTicket = {
      id: "TK-" + Date.now().toString().slice(-8),
      userEmail: u.email,
      userName: u.name,
      userPhone: u.phone || "",
      subject,
      category,
      priority,
      status: "open",
      adminRead: false,
      userRead: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: "msg_" + Date.now(),
          from: "user",
          authorName: u.name,
          text: message,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    tickets.unshift(newTicket);
    this.saveTickets(tickets);
    if (window.NotificationCenter)
      NotificationCenter.events.ticketCreated(newTicket);

    document.querySelector(".address-modal-backdrop.show")?.remove();
    this.renderTickets();
    this.renderSidebarBadges();
    this.showToast("تیکت ارسال شد", "success");
  },

  openTicketDetail(ticketId) {
    const tickets = this.getTickets();
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;
    ticket.userRead = true;
    this.saveTickets(tickets);

    const isClosed = ticket.status === "closed";
    const modal = document.createElement("div");
    modal.className = "address-modal-backdrop show";
    modal.innerHTML = `
            <div class="address-modal-box" style="max-width:680px;">
                <div class="address-modal-header">
                    <h4><i class="bi bi-chat-dots"></i> ${this.esc(ticket.subject)}</h4>
                    <button type="button" class="modal-close-btn" onclick="this.closest('.address-modal-backdrop').remove()"><i class="bi bi-x-lg"></i></button>
                </div>
                <div class="address-modal-body" style="background:#f8fafc;">
                    <div class="ticket-messages">
                        ${ticket.messages
                          .map(
                            (m) => `
                            <div class="ticket-message ${m.from}">
                                <div class="ticket-message-header">
                                    <strong>${m.from === "user" ? "شما" : "پشتیبانی"}</strong>
                                    <small>${this.formatDate(m.createdAt)}</small>
                                </div>
                                <div class="ticket-message-text">${this.esc(m.text)}</div>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                    ${
                      !isClosed
                        ? `
                        <textarea id="userReplyText" class="form-control" rows="3" placeholder="پاسخ خود را بنویسید..." style="margin-top:12px;"></textarea>
                        <button type="button" class="bm-btn-primary" style="width:100%;margin-top:8px;justify-content:center;" onclick="AccountPage.replyToTicket('${ticket.id}')"><i class="bi bi-send"></i> ارسال پاسخ</button>
                    `
                        : `<div style="text-align:center;padding:14px;color:#64748b;"><i class="bi bi-lock-fill"></i> تیکت بسته شده</div>`
                    }
                </div>
            </div>
        `;
    document.body.appendChild(modal);
  },

  replyToTicket(ticketId) {
    const textarea = document.getElementById("userReplyText");
    const text = textarea?.value.trim();
    if (!text) return this.showToast("متن پاسخ الزامی", "error");

    const tickets = this.getTickets();
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    ticket.messages.push({
      id: "msg_" + Date.now(),
      from: "user",
      authorName: this.state.user.name,
      text,
      createdAt: new Date().toISOString(),
    });
    ticket.status = "open";
    ticket.updatedAt = new Date().toISOString();
    ticket.adminRead = false;
    ticket.userRead = true;

    this.saveTickets(tickets);
    if (window.NotificationCenter)
      NotificationCenter.events.ticketUserReply(ticket);
    document.querySelector(".address-modal-backdrop.show")?.remove();
    this.renderTickets();
    this.showToast("پاسخ ارسال شد", "success");
  },

  /* ========== علاقه‌مندی‌ها ========== */
  renderWishlist() {
    const container = document.getElementById("panel-wishlist");
    if (!container) return;

    if (this.state.wishlist.length === 0) {
      container.innerHTML = `
                <div class="panel-header"><h2><i class="bi bi-heart"></i> علاقه‌مندی‌ها</h2></div>
                <div class="empty-panel">
                    <div class="empty-panel-icon"><i class="bi bi-heart"></i></div>
                    <h4>لیست خالی است</h4>
                    <p>محصولات مورد علاقه خود را ذخیره کنید</p>
                    <a href="products.html" class="bm-btn-primary"><i class="bi bi-shop"></i> مشاهده محصولات</a>
                </div>
            `;
      return;
    }

    container.innerHTML = `
            <div class="panel-header">
                <h2><i class="bi bi-heart"></i> علاقه‌مندی‌ها</h2>
                <button type="button" class="bm-btn-outline" style="color:#ef4444;border-color:#fecaca;" onclick="AccountPage.clearWishlist()"><i class="bi bi-trash"></i> حذف همه</button>
            </div>
            <div class="wishlist-grid">${this.state.wishlist.map((item) => this.renderWishlistCard(item)).join("")}</div>
        `;
  },

  renderWishlistCard(item) {
    return `
            <div class="bm-product-card" style="position:relative;">
                <button type="button" onclick="event.stopPropagation(); AccountPage.removeFromWishlist(${item.id})" style="position:absolute;top:10px;left:10px;z-index:2;width:32px;height:32px;border-radius:50%;border:none;background:white;color:#ef4444;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.1);"><i class="bi bi-x-lg"></i></button>
                <div class="bm-product-img" onclick="location.href='product.html?id=${item.id}'" style="cursor:pointer;">
                    <img src="${this.esc(item.image)}" alt="${this.esc(item.name)}" onerror="this.src='images/products/placeholder-product.svg'">
                </div>
                <div class="bm-product-info">
                    <h3 class="bm-product-title">${this.esc(item.name)}</h3>
                    <div class="bm-product-price"><span class="bm-current-price">${(item.price || 0).toLocaleString("fa-IR")} تومان</span></div>
                    <button type="button" class="bm-btn-primary" style="width:100%;justify-content:center;margin-top:8px;" onclick="AccountPage.addWishlistToCart(${item.id})"><i class="bi bi-cart-plus"></i> افزودن به سبد</button>
                </div>
            </div>
        `;
  },

  removeFromWishlist(id) {
    this.state.wishlist = this.state.wishlist.filter((i) => i.id !== id);
    this.saveWishlist();
    this.renderWishlist();
    this.renderSidebarBadges();
    this.renderProfileHero();
    this.showToast("حذف شد", "success");
  },

  clearWishlist() {
    if (!confirm("همه علاقه‌مندی‌ها حذف شوند؟")) return;
    this.state.wishlist = [];
    this.saveWishlist();
    this.renderWishlist();
    this.renderSidebarBadges();
    this.renderProfileHero();
    this.showToast("لیست پاک شد", "success");
  },

  addWishlistToCart(id) {
    if (
      typeof requireLogin === "function" &&
      !requireLogin("افزودن به سبد خرید")
    )
      return;

    const item = this.state.wishlist.find((i) => i.id === id);
    if (!item) return;
    if (window.CartStore) {
      window.CartStore.add(item, 1, item.color || "پیش‌فرض");
    } else {
      let cart = [];
      try {
        cart = JSON.parse(localStorage.getItem("shoppingCart") || "[]");
      } catch (e) {}
      const existing = cart.find((i) => String(i.id) === String(item.id));
      if (existing) existing.quantity = (Number(existing.quantity) || 1) + 1;
      else cart.push({ ...item, color: "پیش‌فرض", quantity: 1 });
      localStorage.setItem("shoppingCart", JSON.stringify(cart));
    }
    if (typeof updateCartBadge === "function") updateCartBadge();
    this.showToast("به سبد اضافه شد", "success");
  },

  attachEvents() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape")
        document
          .querySelectorAll(".address-modal-backdrop.show")
          .forEach((m) => m.remove());
    });
    window.addEventListener("hashchange", () => this.handleURLHash());
  },

  esc(s) {
    if (!s) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  },

  formatDate(d) {
    if (!d) return "—";
    try {
      const dt = new Date(d);
      return `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, "0")}/${String(dt.getDate()).padStart(2, "0")}`;
    } catch (e) {
      return "—";
    }
  },

  formatShortPrice(n) {
    if (!n) return "۰";
    if (n >= 1000000000)
      return (n / 1000000000).toFixed(1).replace(".0", "") + "B";
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(".0", "") + "M";
    if (n >= 1000) return (n / 1000).toFixed(0) + "K";
    return n.toLocaleString("fa-IR");
  },

  timeAgo(d) {
    if (!d) return "";
    try {
      const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
      if (s < 60) return "همین حالا";
      if (s < 3600) return `${Math.floor(s / 60)} دقیقه پیش`;
      if (s < 86400) return `${Math.floor(s / 3600)} ساعت پیش`;
      if (s < 604800) return `${Math.floor(s / 86400)} روز پیش`;
      return this.formatDate(d);
    } catch (e) {
      return "";
    }
  },

  showToast(msg, type = "info") {
    document.querySelector(".account-toast")?.remove();
    const icons = {
      success: "bi-check-circle-fill",
      error: "bi-x-circle-fill",
      info: "bi-info-circle-fill",
    };
    const el = document.createElement("div");
    el.className = `account-toast ${type}`;
    el.style.cssText = `position:fixed;bottom:30px;left:50%;transform:translateX(-50%) translateY(100px);background:#fff;padding:14px 24px;border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.15);display:flex;align-items:center;gap:10px;z-index:10001;font-weight:700;border-right:4px solid #f97316;font-size:.9rem;opacity:0;transition:all .4s cubic-bezier(0.68,-0.55,0.265,1.55);`;
    el.innerHTML = `<i class="bi ${icons[type] || icons.info}" style="color:#f97316;"></i><span>${this.esc(msg)}</span>`;
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.opacity = "1";
      el.style.transform = "translateX(-50%) translateY(0)";
    });
    setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = "translateX(-50%) translateY(100px)";
      setTimeout(() => el.remove(), 400);
    }, 3000);
  },
};

window.AccountPage = AccountPage;
