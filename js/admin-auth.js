/* ============================================
   سیستم احراز هویت امن ادمین — موبایلی بلوچستان
   با هش SHA-256 (Web Crypto API)
   ============================================ */

"use strict";

const AdminAuth = {
  // ========== تنظیمات ==========
  config: {
    sessionKey: "bl_admin_session",
    sessionDuration: 24 * 60 * 60 * 1000, // 24 ساعت
    maxLoginAttempts: 5,
    lockoutDuration: 5 * 60 * 1000, // ۵ دقیقه
    credentialsKey: "bl_admin_credentials",
  },

  // ========== یوزر/پسورد پیش‌فرض ==========
  // اینا بار اول ذخیره می‌شن؛ بعداً از پنل قابل تغییرن
  defaultCredentials: {
    email: "admin@baluchistan.com",
    password: "Admin@2024#Bl",
    name: "مدیر سیستم",
    role: "super_admin",
    createdAt: null,
  },

  // ========================================
  // هش کردن رمز با SHA-256
  // ========================================
  async hashPassword(password) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password + "::bl_salt_2024");
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch (e) {
      console.error("[AdminAuth] خطا در هش:", e);
      // Fallback ساده
      return this.simpleHash(password);
    }
  },

  // Hash ساده پشتیبان (اگه crypto.subtle نبود)
  simpleHash(str) {
    let hash = 0;
    const salted = str + "::bl_salt_2024";
    for (let i = 0; i < salted.length; i++) {
      const char = salted.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return "simple_" + Math.abs(hash).toString(16);
  },

  // ========================================
  // راه‌اندازی اولیه (بار اول)
  // ========================================
  async init() {
    const existing = localStorage.getItem(this.config.credentialsKey);
    if (existing) return;

    // بار اول — ذخیره اعتبارنامه پیش‌فرض
    const passwordHash = await this.hashPassword(
      this.defaultCredentials.password,
    );

    const creds = {
      email: this.defaultCredentials.email.toLowerCase(),
      passwordHash,
      name: this.defaultCredentials.name,
      role: this.defaultCredentials.role,
      createdAt: new Date().toISOString(),
      lastChanged: new Date().toISOString(),
    };

    localStorage.setItem(this.config.credentialsKey, JSON.stringify(creds));

    console.log(
      "🔐 [AdminAuth] اعتبارنامه پیش‌فرض ساخته شد:\n" +
        "   ایمیل: " +
        this.defaultCredentials.email +
        "\n" +
        "   رمز: " +
        this.defaultCredentials.password,
    );
  },

  // ========================================
  // گرفتن اعتبارنامه فعلی
  // ========================================
  getCredentials() {
    try {
      const raw = localStorage.getItem(this.config.credentialsKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  },

  // ========================================
  // تغییر رمز ادمین
  // ========================================
  async changePassword(currentPassword, newPassword) {
    const creds = this.getCredentials();
    if (!creds) {
      return { success: false, message: "اعتبارنامه یافت نشد" };
    }

    const currentHash = await this.hashPassword(currentPassword);
    if (currentHash !== creds.passwordHash) {
      return { success: false, message: "رمز فعلی اشتباه است" };
    }

    if (newPassword.length < 8) {
      return {
        success: false,
        message: "رمز جدید باید حداقل ۸ کاراکتر باشد",
      };
    }

    const newHash = await this.hashPassword(newPassword);
    creds.passwordHash = newHash;
    creds.lastChanged = new Date().toISOString();

    localStorage.setItem(this.config.credentialsKey, JSON.stringify(creds));

    return { success: true, message: "رمز با موفقیت تغییر کرد" };
  },

  // ========================================
  // تغییر ایمیل ادمین
  // ========================================
  changeEmail(newEmail, password) {
    const creds = this.getCredentials();
    if (!creds) return { success: false, message: "اعتبارنامه یافت نشد" };

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      return { success: false, message: "ایمیل نامعتبر است" };
    }

    return this.hashPassword(password).then((hash) => {
      if (hash !== creds.passwordHash) {
        return { success: false, message: "رمز اشتباه است" };
      }
      creds.email = newEmail.toLowerCase();
      localStorage.setItem(this.config.credentialsKey, JSON.stringify(creds));
      return { success: true };
    });
  },

  // ========================================
  // لاگین
  // ========================================
  getAttempts() {
    try {
      const data = JSON.parse(
        localStorage.getItem("bl_admin_attempts") || "{}",
      );
      if (data.lockedUntil && data.lockedUntil > Date.now()) {
        return data;
      }
      if (data.lockedUntil && data.lockedUntil <= Date.now()) {
        localStorage.removeItem("bl_admin_attempts");
        return { count: 0 };
      }
      return data;
    } catch (e) {
      return { count: 0 };
    }
  },

  recordFailedAttempt() {
    const data = this.getAttempts();
    data.count = (data.count || 0) + 1;
    if (data.count >= this.config.maxLoginAttempts) {
      data.lockedUntil = Date.now() + this.config.lockoutDuration;
    }
    localStorage.setItem("bl_admin_attempts", JSON.stringify(data));
    return data;
  },

  clearAttempts() {
    localStorage.removeItem("bl_admin_attempts");
  },

  async login(email, password) {
    // چک قفل بودن
    const attempts = this.getAttempts();
    if (attempts.lockedUntil && attempts.lockedUntil > Date.now()) {
      const remaining = Math.ceil((attempts.lockedUntil - Date.now()) / 1000);
      return {
        success: false,
        message: `حساب موقتاً قفل شده. ${remaining} ثانیه صبر کنید.`,
      };
    }

    // تأخیر مصنوعی برای جلوگیری از brute force
    await new Promise((r) => setTimeout(r, 600));

    const creds = this.getCredentials();
    if (!creds) {
      return { success: false, message: "خطا در سیستم احراز هویت" };
    }

    const cleanEmail = String(email || "")
      .trim()
      .toLowerCase();
    const passwordHash = await this.hashPassword(String(password || ""));

    if (cleanEmail !== creds.email || passwordHash !== creds.passwordHash) {
      const after = this.recordFailedAttempt();
      const remaining = this.config.maxLoginAttempts - (after.count || 0);

      if (remaining <= 0) {
        return {
          success: false,
          message: `تعداد تلاش‌ها بیش از حد مجاز! ${this.config.lockoutDuration / 60000} دقیقه صبر کنید.`,
        };
      }

      return {
        success: false,
        message: `ایمیل یا رمز اشتباه است. ${remaining} تلاش باقی مانده.`,
      };
    }

    // موفق
    this.clearAttempts();

    const session = {
      email: creds.email,
      name: creds.name,
      role: creds.role,
      loginAt: Date.now(),
      expiresAt: Date.now() + this.config.sessionDuration,
      token: this.generateToken(),
    };

    localStorage.setItem(this.config.sessionKey, JSON.stringify(session));
    return { success: true, session };
  },

  generateToken() {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    return Array.from(arr)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  },

  // ========================================
  // Session
  // ========================================
  isLoggedIn() {
    try {
      const session = JSON.parse(
        localStorage.getItem(this.config.sessionKey) || "null",
      );
      if (!session) return false;
      if (session.expiresAt < Date.now()) {
        localStorage.removeItem(this.config.sessionKey);
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  },

  getSession() {
    try {
      const session = JSON.parse(
        localStorage.getItem(this.config.sessionKey) || "null",
      );
      if (!session || session.expiresAt < Date.now()) return null;
      return session;
    } catch (e) {
      return null;
    }
  },

  logout() {
    localStorage.removeItem(this.config.sessionKey);
  },
};

// راه‌اندازی اولیه
AdminAuth.init();

window.AdminAuth = AdminAuth;
