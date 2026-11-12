/* ============================================
   COMPONENTS — بلو مارکت
   ============================================ */

"use strict";

/* حذف فوترهای تکراری (اگر چند نسخه inject شده) */
function removeDuplicateFooters() {
  const allFooters = document.querySelectorAll(".glass-footer-wrapper");
  if (allFooters.length > 1) {
    for (let i = 1; i < allFooters.length; i++) {
      allFooters[i].remove();
    }
  }
}

/* حذف هدرهای تکراری */
function removeDuplicateHeaders() {
  const allHeaders = document.querySelectorAll(".glass-header-wrapper");
  if (allHeaders.length > 1) {
    for (let i = 1; i < allHeaders.length; i++) {
      allHeaders[i].remove();
    }
  }
}

/* راه‌اندازی */
document.addEventListener("DOMContentLoaded", function () {
  removeDuplicateFooters();
  removeDuplicateHeaders();
});
