/* ============================================
   سیستم احراز هویت یکپارچه — بلو مارکت
   نسخه نهایی — با رفرش کامل بعد از لاگین
   ============================================ */

"use strict";

const STORAGE_KEY = "blUser";
const USERS_KEY = "registeredUsers";

const defaultUser = {
  isLoggedIn: false,
  id: null,
  name: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  avatar: "",
};

/* ========================================
   ابزار رمزنگاری (Web Crypto API)
   ======================================== */
async function hashPassword(password) {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + "::bl_salt_2024");
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch (e) {
    console.error("[Auth] خطا در هش کردن رمز:", e);
    return "plain_" + password;
  }
}

/* ========================================
   کاربر فعلی (Session)
   ======================================== */
function getCurrentUser() {
  try {
    const user = localStorage.getItem(STORAGE_KEY);
    if (!user) return { ...defaultUser, isLoggedIn: false };
    const parsed = JSON.parse(user);
    return { ...defaultUser, ...parsed };
  } catch (e) {
    console.error("[Auth] خطا در خواندن کاربر:", e);
    return { ...defaultUser, isLoggedIn: false };
  }
}

function saveUser(userData) {
  const user = {
    isLoggedIn: true,
    id: userData.id || Date.now(),
    name:
      userData.name ||
      `${userData.firstName || ""} ${userData.lastName || ""}`.trim() ||
      userData.email?.split("@")[0] ||
      "کاربر",
    firstName: userData.firstName || "",
    lastName: userData.lastName || "",
    email: userData.email || "",
    phone: userData.phone || "",
    avatar: userData.avatar || "",
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new CustomEvent("bl:auth-updated", { detail: user }));
  return user;
}

function logoutUser() {
  localStorage.removeItem(STORAGE_KEY);
  updateAuthUI();
  window.dispatchEvent(
    new CustomEvent("bl:auth-updated", { detail: { isLoggedIn: false } }),
  );
  if (typeof showToast === "function") {
    showToast("با موفقیت خارج شدید", "success");
  }
  setTimeout(() => {
    window.location.href = "index.html";
  }, 1000);
}

function isLoggedIn() {
  return getCurrentUser().isLoggedIn === true;
}

/* ========================================
   به‌روزرسانی UI
   ======================================== */
function updateAuthUI() {
  const authSection = document.getElementById("authSection");
  if (!authSection) return;

  const user = getCurrentUser();

  if (user.isLoggedIn) {
    authSection.innerHTML = `
      <div class="dropdown">
        <button class="btn btn-outline-primary dropdown-toggle d-flex align-items-center gap-2" 
                type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
          <i class="bi bi-person-circle"></i>
          <span>${escapeHtml(user.name)}</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
          <li><a class="dropdown-item" href="account.html"><i class="bi bi-person me-2"></i>پروفایل من</a></li>
          <li><a class="dropdown-item" href="account.html#orders"><i class="bi bi-bag me-2"></i>سفارشات من</a></li>
          <li><a class="dropdown-item" href="account.html#wishlist"><i class="bi bi-heart me-2"></i>علاقه‌مندی‌ها</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item text-danger" href="#" onclick="handleLogoutClick(event)"><i class="bi bi-box-arrow-right me-2"></i>خروج از حساب</a></li>
        </ul>
      </div>
    `;
  } else {
    authSection.innerHTML = `<a href="auth.html" class="btn btn-outline-primary"><i class="bi bi-box-arrow-in-right me-1"></i>ورود / ثبت نام</a>`;
  }
}

function handleLogoutClick(event) {
  if (event) event.preventDefault();
  if (typeof confirmLogout === "function") {
    confirmLogout();
  } else {
    logoutUser();
  }
}

/* ========================================
   مدیریت کاربران ثبت‌شده
   ======================================== */
function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (typeof parsed === "object" && parsed !== null)
      return Object.values(parsed);
    return [];
  } catch (e) {
    console.error("[Auth] خطا در خواندن کاربران:", e);
    return [];
  }
}

function saveRegisteredUsers(usersArray) {
  localStorage.setItem(USERS_KEY, JSON.stringify(usersArray));
}

/* ========================================
   ورود (با رمزنگاری و رفرش کامل)
   ======================================== */
async function loginUser(email, password) {
  if (!email || !password) {
    if (typeof showToast === "function") {
      showToast("لطفاً ایمیل و رمز عبور را وارد کنید", "error");
    }
    return false;
  }

  const users = getRegisteredUsers();
  const cleanEmail = String(email).trim().toLowerCase();

  const user = users.find(
    (u) =>
      String(u.email || "")
        .trim()
        .toLowerCase() === cleanEmail,
  );

  if (user) {
    let isValid = false;

    if (user.password && user.password.startsWith("plain_")) {
      isValid = user.password === "plain_" + password;
    } else if (user.passwordHash) {
      const hashedInput = await hashPassword(password);
      isValid = user.passwordHash === hashedInput;
    } else if (user.password === password) {
      isValid = true;
      user.passwordHash = await hashPassword(password);
      delete user.password;
      saveRegisteredUsers(users);
    }

    if (isValid) {
      saveUser({
        id: user.id,
        name:
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.name || user.email,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email,
        phone: user.phone,
      });

      if (typeof showToast === "function") {
        showToast("ورود موفقیت‌آمیز بود!", "success");
      }

      // 👈 مهم: رفرش کامل صفحه بعد از لاگین
      setTimeout(() => {
        const redirect =
          localStorage.getItem("redirectAfterLogin") || "index.html";
        localStorage.removeItem("redirectAfterLogin");
        window.location.href = redirect;
      }, 800);

      return true;
    }
  }

  if (typeof showToast === "function") {
    showToast("ایمیل یا رمز عبور اشتباه است", "error");
  }
  return false;
}

/* ========================================
   ثبت‌نام (با رمزنگاری و رفرش کامل)
   ======================================== */
async function registerUser(firstName, lastName, email, phone, password) {
  if (!firstName || !lastName || !email || !phone || !password) {
    if (typeof showToast === "function") {
      showToast("لطفاً تمام فیلدها را پر کنید", "error");
    }
    return false;
  }

  if (password.length < 6) {
    if (typeof showToast === "function") {
      showToast("رمز عبور باید حداقل ۶ کاراکتر باشد", "error");
    }
    return false;
  }

  const users = getRegisteredUsers();
  const cleanEmail = String(email).trim().toLowerCase();

  if (
    users.some(
      (u) =>
        String(u.email || "")
          .trim()
          .toLowerCase() === cleanEmail,
    )
  ) {
    if (typeof showToast === "function") {
      showToast("این ایمیل قبلاً ثبت نام کرده است", "error");
    }
    return false;
  }

  const passwordHash = await hashPassword(password);

  const newUser = {
    id: Date.now(),
    firstName: String(firstName).trim(),
    lastName: String(lastName).trim(),
    email: cleanEmail,
    phone: String(phone).trim(),
    passwordHash: passwordHash,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveRegisteredUsers(users);

  if (window.NotificationCenter)
    NotificationCenter.events.userRegistered(newUser);

  saveUser({
    id: newUser.id,
    name: `${newUser.firstName} ${newUser.lastName}`,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    email: newUser.email,
    phone: newUser.phone,
  });

  if (typeof showToast === "function") {
    showToast("ثبت‌نام با موفقیت انجام شد!", "success");
  }

  // 👈 مهم: رفرش کامل صفحه بعد از ثبت‌نام
  setTimeout(() => {
    const redirect = localStorage.getItem("redirectAfterLogin") || "index.html";
    localStorage.removeItem("redirectAfterLogin");
    window.location.href = redirect;
  }, 800);

  return true;
}

/* ========================================
   به‌روزرسانی اطلاعات کاربر
   ======================================== */
function updateUserInfo(updates = {}) {
  const current = getCurrentUser();
  if (!current.isLoggedIn) return { success: false };

  const users = getRegisteredUsers();
  const idx = users.findIndex(
    (u) =>
      String(u.email || "").toLowerCase() ===
      String(current.email || "").toLowerCase(),
  );

  if (idx >= 0) {
    users[idx] = {
      ...users[idx],
      firstName: updates.firstName ?? users[idx].firstName,
      lastName: updates.lastName ?? users[idx].lastName,
      phone: updates.phone ?? users[idx].phone,
    };
    saveRegisteredUsers(users);
  }

  const newUser = {
    ...current,
    firstName: updates.firstName ?? current.firstName,
    lastName: updates.lastName ?? current.lastName,
    name:
      updates.firstName && updates.lastName
        ? `${updates.firstName} ${updates.lastName}`
        : current.name,
    phone: updates.phone ?? current.phone,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
  return { success: true, user: newUser };
}

/* ========================================
   تغییر رمز عبور
   ======================================== */
async function changePassword(currentPassword, newPassword) {
  const current = getCurrentUser();
  if (!current.isLoggedIn) {
    return { success: false, message: "ابتدا وارد شوید" };
  }

  const users = getRegisteredUsers();
  const idx = users.findIndex(
    (u) =>
      String(u.email || "").toLowerCase() ===
      String(current.email || "").toLowerCase(),
  );

  if (idx < 0) return { success: false, message: "کاربر یافت نشد" };

  let isValid = false;
  if (users[idx].password && users[idx].password === currentPassword) {
    isValid = true;
  } else if (users[idx].passwordHash) {
    const hashedCurrent = await hashPassword(currentPassword);
    isValid = users[idx].passwordHash === hashedCurrent;
  }

  if (!isValid) {
    return { success: false, message: "رمز فعلی اشتباه است" };
  }

  users[idx].passwordHash = await hashPassword(newPassword);
  delete users[idx].password;
  saveRegisteredUsers(users);

  return { success: true };
}

/* ========================================
   قدرت رمز عبور
   ======================================== */
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "", color: "#e5e7eb" };

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const map = {
    0: { label: "خیلی ضعیف", color: "#ef4444" },
    1: { label: "ضعیف", color: "#ef4444" },
    2: { label: "متوسط", color: "#f59e0b" },
    3: { label: "خوب", color: "#3b82f6" },
    4: { label: "قوی", color: "#10b981" },
    5: { label: "بسیار قوی", color: "#10b981" },
  };

  const level = map[Math.min(score, 5)];
  return { score: Math.min(score, 5), ...level };
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function showToast(message, type = "info") {
  if (window.UX && typeof UX.showToast === "function") {
    UX.showToast(message, type);
    return;
  }

  const oldToast = document.querySelector(".custom-toast");
  if (oldToast) oldToast.remove();

  const icons = {
    success: "check-circle-fill",
    error: "exclamation-triangle-fill",
    info: "info-circle-fill",
    warning: "exclamation-triangle-fill",
  };

  const toast = document.createElement("div");
  toast.className = `custom-toast toast-${type}`;
  toast.innerHTML = `<div class="toast-content"><i class="bi bi-${icons[type] || icons.info}"></i><span>${escapeHtml(message)}</span></div>`;

  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#3b82f6"};
    color: white;
    padding: 12px 24px;
    border-radius: 12px;
    z-index: 10000;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    direction: rtl;
    animation: slideUp 0.3s ease;
    font-family: inherit;
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideDown 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function requireLogin(actionName = null, returnUrl = null) {
  const user = getCurrentUser();

  if (user && user.isLoggedIn) {
    return true;
  }

  const currentPath =
    returnUrl ||
    (window.location.pathname.split("/").pop() || "index.html") +
      window.location.search;

  if (currentPath && !currentPath.includes("auth.html")) {
    try {
      localStorage.setItem("redirectAfterLogin", currentPath);
    } catch (e) {}
  }

  if (typeof window.showLoginPopup === "function") {
    window.showLoginPopup(actionName);
  } else if (typeof showLoginPopup === "function") {
    showLoginPopup(actionName);
  } else {
    const msg = actionName
      ? `برای ${actionName} باید وارد حساب کاربری شوید.`
      : "برای این عملیات باید وارد شوید.";
    if (confirm(msg + "\n\nآیا به صفحه ورود بروید؟")) {
      window.location.href = "auth.html";
    }
  }

  return false;
}

const AuthSystem = {
  isLoggedIn,
  getCurrentUser,
  saveUser,
  updateUser: updateUserInfo,
  changePassword,
  getPasswordStrength,
  login: async (email, password) => {
    const success = await loginUser(email, password);
    return { success };
  },
  register: async (data) => {
    const success = await registerUser(
      data.firstName,
      data.lastName,
      data.email,
      data.phone,
      data.password,
    );
    return { success };
  },
  getRememberedEmail: () => localStorage.getItem("rememberedEmail") || "",
  setRememberedEmail: (email) =>
    email
      ? localStorage.setItem("rememberedEmail", email)
      : localStorage.removeItem("rememberedEmail"),
  showToast,
};

window.AuthSystem = AuthSystem;
window.getCurrentUser = getCurrentUser;
window.saveUser = saveUser;
window.logoutUser = logoutUser;
window.isLoggedIn = isLoggedIn;
window.updateAuthUI = updateAuthUI;
window.handleLogoutClick = handleLogoutClick;
window.loginUser = loginUser;
window.registerUser = registerUser;
window.updateUserInfo = updateUserInfo;
window.changePassword = changePassword;
window.getPasswordStrength = getPasswordStrength;
window.escapeHtml = escapeHtml;
window.showToast = showToast;
window.requireLogin = requireLogin;
window.hashPassword = hashPassword;

if (!document.querySelector("#toast-styles")) {
  const style = document.createElement("style");
  style.id = "toast-styles";
  style.textContent = `
    @keyframes slideUp {
      from { opacity: 0; transform: translateX(-50%) translateY(20px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    @keyframes slideDown {
      from { opacity: 1; transform: translateX(-50%) translateY(0); }
      to { opacity: 0; transform: translateX(-50%) translateY(20px); }
    }
  `;
  document.head.appendChild(style);
}

document.addEventListener("DOMContentLoaded", function () {
  updateAuthUI();
});

// پاک کردن پاپ‌آپ به محض لاگین شدن کاربر
window.addEventListener("bl:auth-updated", (e) => {
  if (e.detail && e.detail.isLoggedIn) {
    document
      .querySelectorAll(".global-login-popup")
      .forEach((el) => el.remove());
    document.body.style.overflow = "";
  }
});

window.addEventListener("bl:header-ready", () => {
  updateAuthUI();
  if (typeof updateMobileAuthMenu === "function") updateMobileAuthMenu();
});
window.addEventListener("bl:auth-updated", () => {
  updateAuthUI();
  if (typeof updateMobileAuthMenu === "function") updateMobileAuthMenu();
});
window.addEventListener("storage", (e) => {
  if (e.key === STORAGE_KEY) {
    updateAuthUI();
    if (typeof updateMobileAuthMenu === "function") updateMobileAuthMenu();
  }
});
