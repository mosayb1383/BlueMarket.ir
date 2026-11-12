/* ============================================
   صفحه تماس با ما — موبایلی بلوچستان
   ============================================ */

"use strict";

const ContactPage = {
  // ========== تنظیمات ==========
  config: {
    phonePrimary: "09229480252",
    phoneSupport: "09303154662",
    email: "mshanbhzhi@gmail.com",
    whatsapp: "+989229480252",
    telegram: "https://t.me/",
    instagram: "https://instagram.com/",
    address: "گلشن، جنب پاساژ محمد رسول الله، فروشگاه بلوچستان",
    workingHours: [
      {
        day: "شنبه تا چهارشنبه",
        time: "۹:۰۰ - ۲۰:۰۰",
        icon: "bi-calendar-week",
        closed: false,
      },
      {
        day: "پنجشنبه",
        time: "۹:۰۰ - ۱۸:۰۰",
        icon: "bi-calendar-day",
        closed: false,
      },
      { day: "جمعه", time: "تعطیل", icon: "bi-calendar-x", closed: true },
    ],
    maxMessageLength: 1000,
  },

  state: {
    submitting: false,
  },

  // ========== راه‌اندازی ==========
  init() {
    this.attachEvents();
    this.prefillFromUser();
  },

  attachEvents() {
    // فرم
    const form = document.getElementById("contactForm");
    if (form) {
      form.addEventListener("submit", (e) => this.handleSubmit(e));
    }

    // پاک کردن خطا هنگام تایپ
    [
      "contactName",
      "contactEmail",
      "contactPhone",
      "contactSubject",
      "contactMessage",
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("input", () => this.clearError(id));
      }
    });

    // شمارنده کاراکتر برای پیام
    const messageEl = document.getElementById("contactMessage");
    const counterEl = document.getElementById("messageCounter");
    if (messageEl && counterEl) {
      messageEl.addEventListener("input", () => {
        const remaining = this.config.maxMessageLength - messageEl.value.length;
        counterEl.textContent = `${messageEl.value.length.toLocaleString("fa-IR")} / ${this.config.maxMessageLength.toLocaleString("fa-IR")}`;
        counterEl.style.color = remaining < 50 ? "#ef4444" : "#9ca3af";
      });
    }

    // فرمت شماره موبایل
    const phoneEl = document.getElementById("contactPhone");
    if (phoneEl) {
      phoneEl.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/[^\d۰-۹+\s-]/g, "");
      });
    }
  },

  prefillFromUser() {
    const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
    if (!user || !user.isLoggedIn) return;

    const nameEl = document.getElementById("contactName");
    const emailEl = document.getElementById("contactEmail");
    const phoneEl = document.getElementById("contactPhone");

    if (nameEl && !nameEl.value) nameEl.value = user.name || "";
    if (emailEl && !emailEl.value) emailEl.value = user.email || "";
    if (phoneEl && !phoneEl.value) phoneEl.value = user.phone || "";
  },

  // ========== اعتبارسنجی ==========
  showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById("err-" + fieldId);
    if (field) field.classList.add("error");
    if (error) {
      error.querySelector("span").textContent = message;
      error.classList.add("show");
    }
  },

  clearError(fieldId) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById("err-" + fieldId);
    if (field) field.classList.remove("error");
    if (error) {
      error.classList.remove("show");
      error.querySelector("span").textContent = "";
    }
  },

  clearAllErrors() {
    [
      "contactName",
      "contactEmail",
      "contactPhone",
      "contactSubject",
      "contactMessage",
    ].forEach((id) => {
      this.clearError(id);
    });
  },

  validate(data) {
    const errors = {};

    if (!data.name) {
      errors.contactName = "نام و نام خانوادگی الزامی است";
    } else if (data.name.length < 3) {
      errors.contactName = "نام باید حداقل ۳ کاراکتر باشد";
    }

    if (!data.email) {
      errors.contactEmail = "ایمیل الزامی است";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.contactEmail = "فرمت ایمیل صحیح نیست";
    }

    if (data.phone) {
      const normalized = data.phone.replace(/[۰-۹]/g, (d) =>
        "۰۱۲۳۴۵۶۷۸۹".indexOf(d),
      );
      const cleaned = normalized.replace(/[\s-]/g, "");
      if (
        cleaned &&
        !/^09[0-9]{9}$/.test(cleaned) &&
        !/^\+?98[0-9]{10}$/.test(cleaned)
      ) {
        errors.contactPhone = "شماره موبایل معتبر نیست";
      }
    }

    if (!data.message) {
      errors.contactMessage = "متن پیام الزامی است";
    } else if (data.message.length < 10) {
      errors.contactMessage = "پیام باید حداقل ۱۰ کاراکتر باشد";
    } else if (data.message.length > this.config.maxMessageLength) {
      errors.contactMessage = "پیام خیلی طولانی است";
    }

    return errors;
  },

  // ========== ارسال ==========
  async handleSubmit(e) {
    e.preventDefault();

    if (this.state.submitting) return;

    this.clearAllErrors();

    const data = {
      name: document.getElementById("contactName").value.trim(),
      email: document.getElementById("contactEmail").value.trim().toLowerCase(),
      phone: document.getElementById("contactPhone").value.trim(),
      subject: document.getElementById("contactSubject").value.trim(),
      message: document.getElementById("contactMessage").value.trim(),
    };

    // اعتبارسنجی
    const errors = this.validate(data);
    if (Object.keys(errors).length > 0) {
      Object.entries(errors).forEach(([id, msg]) => this.showError(id, msg));
      const firstError = document.querySelector(".error-text.show");
      if (firstError)
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // ارسال
    const btn = document.getElementById("contactSubmitBtn");
    this.state.submitting = true;
    if (btn) {
      btn.classList.add("loading");
      btn.disabled = true;
    }

    try {
      await this.simulateSend(data);
      this.saveMessage(data);
      this.showToast(
        "پیام شما با موفقیت ارسال شد. به‌زودی با شما تماس می‌گیریم.",
        "success",
      );
      document.getElementById("contactForm").reset();
      this.resetCounter();
    } catch (err) {
      console.error(err);
      this.showToast("خطا در ارسال پیام. لطفاً دوباره تلاش کنید.", "error");
    } finally {
      this.state.submitting = false;
      if (btn) {
        btn.classList.remove("loading");
        btn.disabled = false;
      }
    }
  },

  simulateSend(data) {
    return new Promise((resolve) => {
      setTimeout(resolve, 1500);
    });
  },

  saveMessage(data) {
    try {
      const messages = JSON.parse(
        localStorage.getItem("bl_contact_messages") || "[]",
      );
      messages.unshift({
        id: "msg_" + Date.now(),
        ...data,
        sentAt: new Date().toISOString(),
      });
      // فقط ۵۰ پیام آخر رو نگه دار
      if (messages.length > 50) messages.length = 50;
      localStorage.setItem("bl_contact_messages", JSON.stringify(messages));
      if (window.NotificationCenter) NotificationCenter.events.contactSubmitted(messages[0]);
    } catch (e) {
      console.warn("خطا در ذخیره پیام:", e);
    }
  },

  resetCounter() {
    const counterEl = document.getElementById("messageCounter");
    if (counterEl) {
      counterEl.textContent = `۰ / ${this.config.maxMessageLength.toLocaleString("fa-IR")}`;
      counterEl.style.color = "#9ca3af";
    }
  },

  // ========== Toast ==========
  showToast(message, type = "info") {
    const existing = document.querySelector(".contact-toast");
    if (existing) existing.remove();

    const icons = {
      success: "bi-check-circle-fill",
      error: "bi-x-circle-fill",
      info: "bi-info-circle-fill",
    };

    const toast = document.createElement("div");
    toast.className = `contact-toast ${type}`;
    toast.innerHTML = `<i class="bi ${icons[type] || icons.info}"></i><span>${message}</span>`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("show"));
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  },
};

window.ContactPage = ContactPage;

// راه‌اندازی
document.addEventListener("DOMContentLoaded", () => {
  ContactPage.init();
});
