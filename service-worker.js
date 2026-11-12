/* ============================================
   SERVICE WORKER — بلو مارکت
   کش استاتیک برای کارکرد آفلاین
   ============================================ */

const CACHE_NAME = "blue-market-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/products.html",
  "/product.html",
  "/cart.html",
  "/checkout.html",
  "/account.html",
  "/auth.html",
  "/mobiles.html",
  "/laptops.html",
  "/tablets.html",
  "/watches.html",
  "/accessories.html",
  "/abuot.html",
  "/contact.html",
  "/faq.html",
  "/refund.html",
  "/privacy.html",
  "/terms.html",
  "/components/header.html",
  "/components/footer.html",
  "/css/style.css",
  "/css/glass.css",
  "/css/header.css",
  "/css/home.css",
  "/css/ux.css",
  "/css/products.css",
  "/css/product.css",
  "/css/cart.css",
  "/css/checkout.css",
  "/css/account.css",
  "/js/products-data.js",
  "/js/product-images.js",
  "/js/main.js",
  "/js/auth.js",
  "/js/notifications.js",
  "/js/notification-center.js",
  "/js/cart.js",
  "/js/checkout.js",
  "/js/account.js",
  "/js/home.js",
  "/js/products.js",
  "/js/product.js",
  "/js/category-page.js",
  "/js/faq.js",
  "/js/contact.js",
  "/js/ux.js",
  "/images/logo.svg",
  "/images/favicon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching static assets");
        return cache.addAll(STATIC_ASSETS).catch((err) => {
          console.warn("[SW] Some assets failed to cache:", err);
        });
      })
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        fetch(event.request)
          .then((response) => {
            if (response.ok) {
              caches
                .open(CACHE_NAME)
                .then((cache) => cache.put(event.request, response));
            }
          })
          .catch(() => {});
        return cached;
      }
      return fetch(event.request)
        .then((response) => {
          if (response.ok && response.type === "basic") {
            const clone = response.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          if (event.request.destination === "document") {
            return caches.match("/index.html");
          }
        });
    }),
  );
});
