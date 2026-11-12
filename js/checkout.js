/* ============================================
   CHECKOUT — بلو مارکت (متصل به درگاه پرداخت)
   ============================================ */

"use strict";

const CheckoutPage = {
  state: {
    user: null,
    items: [],
    addresses: [],
    selectedAddressId: null,
    deliveryMethod: "standard",
    paymentMethod: "online",
    subtotal: 0,
    couponDiscount: 0,
    shippingCost: 0,
    total: 0,
    coupon: null,
    submitting: false,
  },

  deliveryMethods: {
    standard: {
      title: "ارسال عادی",
      desc: "۳ تا ۵ روز کاری",
      cost: 0,
      icon: "bi-truck",
    },
    express: {
      title: "ارسال سریع",
      desc: "۱ تا ۲ روز کاری",
      cost: 50000,
      icon: "bi-lightning-charge",
    },
    sameDay: {
      title: "ارسال فوری",
      desc: "تحویل امروز",
      cost: 100000,
      icon: "bi-rocket-takeoff",
    },
  },

  init() {
    this.state.user =
      typeof getCurrentUser === "function" ? getCurrentUser() : null;
    if (!this.state.user?.isLoggedIn) {
      const redirect = encodeURIComponent("checkout.html");
      window.location.href = `auth.html?redirect=${redirect}`;
      return;
    }

    if (!this.loadCart()) return;
    this.loadAddresses();
    this.render();
  },

  loadCart() {
    let items = [];
    try {
      items =
        window.CartStore?.read?.() ||
        JSON.parse(localStorage.getItem("shoppingCart") || "[]");
    } catch (e) {
      items = [];
    }

    this.state.items = Array.isArray(items)
      ? items.filter((i) => i && i.id)
      : [];

    if (this.state.items.length === 0) {
      this.renderEmpty();
      return false;
    }

    try {
      const checkoutData = JSON.parse(
        localStorage.getItem("checkoutData") || "{}",
      );
      if (checkoutData.coupon) {
        this.state.coupon = checkoutData.coupon;
        this.state.couponDiscount = checkoutData.couponDiscount || 0;
      }
    } catch (e) {}

    this.calculateTotals();
    return true;
  },

  loadAddresses() {
    try {
      this.state.addresses = JSON.parse(
        localStorage.getItem("bl_addresses") || "[]",
      );
    } catch (e) {
      this.state.addresses = [];
    }
    const defaultAddr = this.state.addresses.find((a) => a.isDefault);
    this.state.selectedAddressId =
      defaultAddr?.id || this.state.addresses[0]?.id || null;
  },

  calculateTotals() {
    this.state.subtotal = this.state.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    this.state.shippingCost =
      this.deliveryMethods[this.state.deliveryMethod].cost;

    if (
      this.state.subtotal >= 500000 &&
      this.state.deliveryMethod === "standard"
    ) {
      this.state.shippingCost = 0;
    }

    this.state.total = Math.max(
      0,
      this.state.subtotal - this.state.couponDiscount + this.state.shippingCost,
    );
  },

  render() {
    this.renderSteps();
    this.renderAddresses();
    this.renderDeliveryOptions();
    this.renderPaymentOptions();
    this.renderSummary();
    this.attachEvents();
  },

  renderEmpty() {
    const container = document.getElementById("checkoutMain");
    if (!container) return;
    container.innerHTML = `
            <div class="bm-checkout-empty">
                <div class="bm-checkout-empty-icon"><i class="bi bi-cart-x"></i></div>
                <h3 style="font-weight:900;margin:0 0 8px;">سبد خرید شما خالی است</h3>
                <p style="color:#6b7280;margin:0 0 20px;">برای تکمیل خرید ابتدا محصولی به سبد اضافه کنید</p>
                <a href="products.html" class="bm-btn-primary" style="padding:12px 24px;">
                    <i class="bi bi-shop"></i> مشاهده محصولات
                </a>
            </div>
        `;
  },

  renderSteps() {
    const steps = [
      { key: "cart", label: "سبد خرید", done: true },
      { key: "address", label: "اطلاعات ارسال", active: true },
      { key: "payment", label: "پرداخت" },
      { key: "done", label: "تکمیل" },
    ];
    const container = document.getElementById("checkoutSteps");
    if (!container) return;
    container.innerHTML = steps
      .map(
        (s, i) => `
            <div class="bm-step ${s.active ? "active" : ""} ${s.done ? "done" : ""}">
                <div class="bm-step-num">${s.done ? '<i class="bi bi-check"></i>' : i + 1}</div>
                <span>${s.label}</span>
            </div>
        `,
      )
      .join("");
  },

  renderAddresses() {
    const container = document.getElementById("addressesSection");
    if (!container) return;

    if (this.state.addresses.length === 0) {
      container.innerHTML = `
                <div class="checkout-card-header">
                    <h3><i class="bi bi-geo-alt"></i> آدرس ارسال</h3>
                </div>
                <div class="checkout-card-body">
                    <div style="text-align:center;padding:20px;">
                        <i class="bi bi-geo-alt" style="font-size:2.5rem;color:#f97316;"></i>
                        <p style="margin-top:10px;color:#6b7280;">هنوز آدرسی ثبت نکرده‌اید</p>
                    </div>
                    <button type="button" class="bm-add-address-btn" onclick="CheckoutPage.openAddressModal()">
                        <i class="bi bi-plus-circle"></i> افزودن آدرس
                    </button>
                </div>
            `;
      return;
    }

    container.innerHTML = `
            <div class="checkout-card-header">
                <h3><i class="bi bi-geo-alt"></i> آدرس ارسال</h3>
            </div>
            <div class="checkout-card-body">
                <div class="bm-address-list">
                    ${this.state.addresses.map((a) => this.renderAddressOption(a)).join("")}
                </div>
                <button type="button" class="bm-add-address-btn" onclick="CheckoutPage.openAddressModal()">
                    <i class="bi bi-plus-circle"></i> افزودن آدرس جدید
                </button>
            </div>
        `;
  },

  renderAddressOption(addr) {
    const selected = String(addr.id) === String(this.state.selectedAddressId);
    return `
            <label class="bm-address-option ${selected ? "selected" : ""}">
                <input type="radio" name="address" value="${addr.id}"
                       ${selected ? "checked" : ""}
                       onchange="CheckoutPage.selectAddress('${addr.id}')">
                <div class="bm-address-option-content">
                    <div class="bm-address-title-row">
                        <h5>${this.esc(addr.title)}</h5>
                        ${addr.isDefault ? '<span class="bm-default-badge"><i class="bi bi-check-circle-fill"></i>پیش‌فرض</span>' : ""}
                    </div>
                    <div class="bm-address-full">
                        ${this.esc(addr.province || "")}، ${this.esc(addr.city || "")}، ${this.esc(addr.fullAddress || "")}
                    </div>
                    <div class="bm-address-meta">
                        ${addr.postalCode ? `<span><i class="bi bi-mailbox"></i>${this.esc(addr.postalCode)}</span>` : ""}
                        ${addr.phone ? `<span><i class="bi bi-phone"></i>${this.esc(addr.phone)}</span>` : ""}
                    </div>
                </div>
            </label>
        `;
  },

  renderDeliveryOptions() {
    const container = document.getElementById("deliverySection");
    if (!container) return;

    const selectedAddress = this.state.addresses.find(
      (a) => String(a.id) === String(this.state.selectedAddressId),
    );
    const isGolshan =
      selectedAddress && /گلشن/.test(String(selectedAddress.city || ""));

    if (this.state.deliveryMethod === "sameDay" && !isGolshan) {
      this.state.deliveryMethod = "standard";
      this.calculateTotals();
    }

    const methods = Object.entries(this.deliveryMethods);

    container.innerHTML = `
            <div class="checkout-card-header">
                <h3><i class="bi bi-truck"></i> روش ارسال</h3>
            </div>
            <div class="checkout-card-body">
                <div class="bm-delivery-list">
                    ${methods
                      .map(([key, m]) => {
                        const selected = key === this.state.deliveryMethod;
                        const cost = this.getDeliveryCost(key);
                        const isSameDay = key === "sameDay";
                        const isDisabled = isSameDay && !isGolshan;

                        return `
                            <label class="bm-delivery-option ${selected ? "selected" : ""} ${isDisabled ? "disabled" : ""}">
                                <input type="radio" name="delivery" value="${key}"
                                       ${selected ? "checked" : ""}
                                       ${isDisabled ? "disabled" : ""}
                                       onchange="CheckoutPage.selectDelivery('${key}')">
                                <div class="bm-delivery-content">
                                    <div class="bm-delivery-info">
                                        <h5><i class="bi ${m.icon}"></i> ${m.title}</h5>
                                        <p>${isDisabled ? "فقط برای آدرس‌های شهر گلشن" : m.desc}</p>
                                    </div>
                                    <div class="bm-delivery-price ${cost === 0 ? "free" : ""}">
                                        ${cost === 0 ? "رایگان" : cost.toLocaleString("fa-IR") + " تومان"}
                                    </div>
                                </div>
                            </label>
                        `;
                      })
                      .join("")}
                </div>
            </div>
        `;
  },

  getDeliveryCost(key) {
    if (key === "standard" && this.state.subtotal >= 500000) return 0;
    return this.deliveryMethods[key].cost;
  },

  renderPaymentOptions() {
    const container = document.getElementById("paymentSection");
    if (!container) return;

    const walletBalance = this.getWalletBalance();
    const isWalletEnough = walletBalance >= this.state.total;

    const methods = [
      {
        key: "online",
        icon: "bi-credit-card-2-front",
        title: "پرداخت آنلاین",
        desc: "انتقال به درگاه پرداخت امن",
        enabled: true,
      },
      {
        key: "wallet",
        icon: "bi-wallet2",
        title: "کیف پول",
        desc: `موجودی: ${walletBalance.toLocaleString("fa-IR")} تومان${!isWalletEnough ? " · موجودی ناکافی" : ""}`,
        enabled: isWalletEnough,
      },
    ];

    if (this.state.paymentMethod === "wallet" && !isWalletEnough)
      this.state.paymentMethod = "online";

    container.innerHTML = `
            <div class="checkout-card-header">
                <h3><i class="bi bi-credit-card"></i> روش پرداخت</h3>
            </div>
            <div class="checkout-card-body">
                <div class="bm-payment-list">
                    ${methods
                      .map((m) => {
                        const selected =
                          m.key === this.state.paymentMethod && m.enabled;
                        return `
                            <label class="bm-payment-option ${selected ? "selected" : ""} ${!m.enabled ? "disabled" : ""}">
                                <input type="radio" name="payment" value="${m.key}"
                                       ${selected ? "checked" : ""}
                                       ${!m.enabled ? "disabled" : ""}
                                       onchange="CheckoutPage.selectPayment('${m.key}')">
                                <div class="bm-payment-icon"><i class="bi ${m.icon}"></i></div>
                                <div class="bm-payment-content">
                                    <h5>${m.title}</h5>
                                    <p>${m.desc}</p>
                                </div>
                            </label>
                        `;
                      })
                      .join("")}
                </div>
            </div>
        `;
  },

  renderSummary() {
    const container = document.getElementById("summarySection");
    if (!container) return;

    container.innerHTML = `
            <div class="checkout-card">
                <div class="checkout-card-header">
                    <h3><i class="bi bi-receipt-cutoff"></i> خلاصه سفارش</h3>
                    <span style="color:#6b7280;font-size:0.78rem;">${this.state.items.length} قلم</span>
                </div>
                <div class="checkout-card-body">
                    <div class="bm-summary-items">
                        ${this.state.items
                          .map(
                            (item) => `
                            <div class="bm-summary-item">
                                <img src="${this.esc(item.image)}" alt=""
                                     onerror="this.onerror=null;this.src='images/products/placeholder-product.svg'">
                                <div class="bm-summary-item-info">
                                    <h6>${this.esc(item.name)}</h6>
                                    <div class="qty">${item.quantity} عدد ${item.color ? "• " + this.esc(item.color) : ""}</div>
                                </div>
                                <div class="bm-summary-item-price">${(item.price * item.quantity).toLocaleString("fa-IR")}</div>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>

                    <div class="bm-summary-divider"></div>

                    <div class="bm-summary-row">
                        <span>جمع کالاها:</span>
                        <span class="value">${this.state.subtotal.toLocaleString("fa-IR")} تومان</span>
                    </div>

                    ${
                      this.state.couponDiscount > 0
                        ? `
                        <div class="bm-summary-row discount">
                            <span>تخفیف ${this.state.coupon ? `(${this.esc(this.state.coupon.code)})` : ""}:</span>
                            <span class="value">− ${this.state.couponDiscount.toLocaleString("fa-IR")} تومان</span>
                        </div>
                    `
                        : ""
                    }

                    <div class="bm-summary-row">
                        <span>هزینه ارسال:</span>
                        <span class="value">
                            ${
                              this.state.shippingCost === 0
                                ? '<span style="color:#10b981;">رایگان</span>'
                                : this.state.shippingCost.toLocaleString(
                                    "fa-IR",
                                  ) + " تومان"
                            }
                        </span>
                    </div>

                    <div class="bm-summary-divider"></div>

                    <div class="bm-summary-total">
                        <span class="label">مبلغ قابل پرداخت:</span>
                        <span class="value">${this.state.total.toLocaleString("fa-IR")} تومان</span>
                    </div>

                    <button type="button" class="bm-pay-btn" id="payBtn" onclick="CheckoutPage.submitOrder()">
                        <span class="spinner"></span>
                        <i class="bi bi-shield-lock"></i>
                        <span>پرداخت و ثبت سفارش</span>
                    </button>

                    <div class="bm-security-note">
                        <i class="bi bi-shield-fill-check"></i>
                        پرداخت امن از طریق درگاه بانکی
                    </div>
                </div>
            </div>
        `;
  },

  selectAddress(id) {
    this.state.selectedAddressId = id;
    document.querySelectorAll(".bm-address-option").forEach((el) => {
      const radio = el.querySelector("input");
      el.classList.toggle("selected", radio && radio.value === id);
    });
    this.renderDeliveryOptions();
    this.renderPaymentOptions();
    this.renderSummary();
  },

  selectDelivery(key) {
    if (key === "sameDay") {
      const address = this.state.addresses.find(
        (a) => String(a.id) === String(this.state.selectedAddressId),
      );
      if (!/گلشن/.test(String(address?.city || ""))) {
        this.showToast("ارسال فوری فقط برای شهر گلشن فعال است", "warning");
        return;
      }
    }
    this.state.deliveryMethod = key;
    this.calculateTotals();
    this.renderDeliveryOptions();
    this.renderPaymentOptions();
    this.renderSummary();
  },

  selectPayment(key) {
    if (key === "wallet" && this.getWalletBalance() < this.state.total) {
      this.showToast("موجودی کیف پول کافی نیست", "warning");
      return;
    }
    this.state.paymentMethod = key;
    this.renderPaymentOptions();
    this.renderSummary();
  },

  getWalletBalance() {
    try {
      const user = this.state.user || {};
      const raw = localStorage.getItem("bl_wallet_balance");
      const stored =
        raw !== null ? Number(raw) : Number(user.walletBalance || 0);
      return Math.max(0, Number.isFinite(stored) ? stored : 0);
    } catch (e) {
      return 0;
    }
  },

  async submitOrder() {
    if (this.state.submitting) return;

    if (!this.state.selectedAddressId) {
      return this.showToast("لطفاً آدرس را انتخاب کنید", "error");
    }

    if (this.state.items.length === 0) {
      return this.showToast("سبد خرید خالی است", "error");
    }

    this.state.submitting = true;
    const btn = document.getElementById("payBtn");
    if (btn) {
      btn.classList.add("loading");
      btn.disabled = true;
    }

    try {
      if (this.state.paymentMethod === "wallet") {
        // پرداخت با کیف پول (مستقیم)
        const balance = this.getWalletBalance();
        if (balance < this.state.total) {
          throw new Error("موجودی کیف پول کافی نیست");
        }
        localStorage.setItem(
          "bl_wallet_balance",
          String(balance - this.state.total),
        );
        this.logWalletTransaction("debit", this.state.total, "پرداخت سفارش");
        this.finalizeOrder();
      } else {
        // پرداخت آنلاین: انتقال به درگاه شبیه‌سازی شده
        const orderData = this.createOrder();
        localStorage.setItem("bl_pending_order", JSON.stringify(orderData));
        window.location.href = `payment-gateway.html?amount=${this.state.total}`;
      }
    } catch (err) {
      console.error(err);
      this.showToast(err.message || "خطا در ثبت سفارش", "error");
      if (btn) {
        btn.classList.remove("loading");
        btn.disabled = false;
      }
      this.state.submitting = false;
    }
  },

  finalizeOrder() {
    const order = this.createOrder();
    order.paymentTrackingCode =
      localStorage.getItem("bl_last_payment_tracking") || "";

    let orders = [];
    try {
      orders = JSON.parse(localStorage.getItem("bl_orders") || "[]");
    } catch (e) {
      orders = [];
    }
    order.adminRead = false;
    order.userRead = true;
    orders.unshift(order);
    localStorage.setItem("bl_orders", JSON.stringify(orders));

    if (window.NotificationCenter?.events?.orderCreated) {
      NotificationCenter.events.orderCreated(order);
    }

    if (window.CartStore?.write) window.CartStore.write([]);
    else localStorage.setItem("shoppingCart", "[]");
    ["shoppingCart", "cartItems", "cart", "bl_cart", "checkoutData"].forEach(
      (key) => localStorage.removeItem(key),
    );
    window.dispatchEvent(
      new CustomEvent("bl:cart-updated", { detail: { items: [] } }),
    );
    window.updateCartBadge?.();

    setTimeout(() => {
      window.location.href = `thankyou.html?order=${order.id}`;
    }, 1200);
  },

  logWalletTransaction(type, amount, description) {
    try {
      let tx = JSON.parse(localStorage.getItem("bl_wallet_tx") || "[]");
      tx.unshift({
        id: "tx_" + Date.now(),
        type,
        amount,
        description,
        userEmail: this.state.user.email,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem("bl_wallet_tx", JSON.stringify(tx.slice(0, 100)));
    } catch (e) {}
  },

  createOrder() {
    const address = this.state.addresses.find(
      (a) => a.id === this.state.selectedAddressId,
    );
    return {
      id: "BM-" + Date.now().toString().slice(-8),
      userId: this.state.user.id,
      userEmail: this.state.user.email,
      items: this.state.items.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
        color: i.color || "پیش‌فرض",
      })),
      address: address ? { ...address } : null,
      delivery: {
        method: this.state.deliveryMethod,
        ...this.deliveryMethods[this.state.deliveryMethod],
        cost: this.state.shippingCost,
      },
      payment: this.state.paymentMethod,
      coupon: this.state.coupon,
      subtotal: this.state.subtotal,
      couponDiscount: this.state.couponDiscount,
      shippingCost: this.state.shippingCost,
      total: this.state.total,
      status: "processing",
      statusLabel: "در انتظار آماده‌سازی و ارسال",
      trackingCode: "BMT-" + Date.now().toString().slice(-10),
      createdAt: new Date().toISOString(),
    };
  },

  openAddressModal() {
    const modal = document.getElementById("checkoutAddressModal");
    if (!modal) return;
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("address-modal-open");
    setTimeout(() => document.getElementById("newAddrTitle")?.focus(), 100);
  },

  closeAddressModal() {
    const modal = document.getElementById("checkoutAddressModal");
    if (modal) {
      modal.classList.remove("show");
      modal.setAttribute("aria-hidden", "true");
    }
    document.body.classList.remove("address-modal-open");
  },

  saveNewAddress() {
    const title = document.getElementById("newAddrTitle").value.trim();
    const province = document.getElementById("newAddrProvince").value;
    const city = document.getElementById("newAddrCity").value.trim();
    const fullAddress = document.getElementById("newAddrFull").value.trim();
    const postalCode = document.getElementById("newAddrPostal").value.trim();
    const phone = document.getElementById("newAddrPhone").value.trim();
    const isDefault = document.getElementById("newAddrDefault").checked;

    if (!title || !province || !city || !fullAddress) {
      return this.showToast("لطفاً فیلدهای ضروری را پر کنید", "error");
    }

    const newAddress = {
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
    this.state.addresses.push(newAddress);
    if (this.state.addresses.length === 1) newAddress.isDefault = true;

    try {
      localStorage.setItem(
        "bl_addresses",
        JSON.stringify(this.state.addresses),
      );
      this.state.selectedAddressId = newAddress.id;
      this.renderAddresses();
      this.renderDeliveryOptions();
      this.renderPaymentOptions();
      this.closeAddressModal();
      this.showToast("آدرس ذخیره شد و به‌صورت خودکار انتخاب شد", "success");
    } catch (e) {
      this.showToast("ذخیره آدرس ناموفق بود", "error");
    }
  },

  attachEvents() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.closeAddressModal();
    });
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

  showToast(msg, type = "info") {
    document.querySelector(".checkout-toast")?.remove();
    const icons = {
      success: "bi-check-circle-fill",
      error: "bi-x-circle-fill",
      info: "bi-info-circle-fill",
      warning: "bi-exclamation-triangle-fill",
    };
    const el = document.createElement("div");
    el.className = `checkout-toast ${type}`;
    el.innerHTML = `<i class="bi ${icons[type] || icons.info}"></i><span>${this.esc(msg)}</span>`;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add("show"));
    setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => el.remove(), 400);
    }, 3000);
  },
};

window.CheckoutPage = CheckoutPage;
