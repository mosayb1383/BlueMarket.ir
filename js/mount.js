/* ============================================
   MOUNT COMPONENTS — بلو مارکت
   یکپارچه‌سازی لود هدر و فوتر
   ============================================ */

"use strict";

let mounted = false;

window.mountLayout = function () {
  if (mounted) return Promise.resolve();
  mounted = true;

  const headerEl = document.getElementById("header-placeholder");
  const footerEl = document.getElementById("footer-placeholder");

  if (!headerEl && !footerEl) return Promise.resolve();

  return Promise.all([
    headerEl
      ? fetch("components/header.html")
          .then((r) => r.text())
          .catch(() => "")
      : Promise.resolve(""),
    footerEl
      ? fetch("components/footer.html")
          .then((r) => r.text())
          .catch(() => "")
      : Promise.resolve(""),
  ]).then(([headerHTML, footerHTML]) => {
    if (headerEl && headerHTML) headerEl.innerHTML = headerHTML;
    if (footerEl && footerHTML) footerEl.innerHTML = footerHTML;

    window.dispatchEvent(new CustomEvent("bl:header-ready"));

    if (typeof updateAuthUI === "function") updateAuthUI();
    if (typeof updateCartBadge === "function") updateCartBadge();
    if (typeof updateMobileAuthMenu === "function") updateMobileAuthMenu();
    if (typeof updateBottomNavActive === "function") updateBottomNavActive();
    if (typeof updateBottomNavCartBadge === "function")
      updateBottomNavCartBadge();
    if (typeof updateUserNotifVisibility === "function")
      updateUserNotifVisibility();
    if (typeof setupHeaderScroll === "function") setupHeaderScroll();
  });
};

document.addEventListener("DOMContentLoaded", () => {
  // فقط اگه اسکریپت inline صفحه اجرا نشده بود
  setTimeout(() => {
    const headerEl = document.getElementById("header-placeholder");
    if (headerEl && !headerEl.innerHTML.trim()) {
      window.mountLayout();
    }
  }, 100);
});
