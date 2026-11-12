/* ============================================
   صفحه درباره ما — موبایلی بلوچستان
   ============================================ */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  // انیمیشن شمارنده اعداد
  animateCounters();
});

function animateCounters() {
  const counters = document.querySelectorAll("[data-count]");
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || "";
        const duration = 1800;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        let step = 0;

        const timer = setInterval(() => {
          step++;
          current += increment;

          if (step >= steps) {
            el.textContent = target.toLocaleString("fa-IR") + suffix;
            clearInterval(timer);
          } else {
            el.textContent =
              Math.floor(current).toLocaleString("fa-IR") + suffix;
          }
        }, duration / steps);

        observer.unobserve(el);
      });
    },
    { threshold: 0.3 },
  );

  counters.forEach((c) => observer.observe(c));
}
