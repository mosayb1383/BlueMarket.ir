# بلو مارکت — BLUE MARKET

فروشگاه آنلاین محصولات دیجیتال — موبایل، لپ‌تاپ، تبلت، ساعت هوشمند و لوازم جانبی

---

## 📖 معرفی

این پروژه یک فروشگاه اینترنتی کامل است که **کاملاً Front-End** (HTML، CSS، JavaScript) پیاده‌سازی شده. داده‌ها در `localStorage` مرورگر ذخیره می‌شوند و نیازی به سرور یا بک‌اند ندارد.

**نسخه:** ۲.۰
**وضعیت:** Demo / Portfolio

> ⚠️ **هشدار:** این نسخه‌ی دموست. پرداخت آنلاین واقعی نیست، اطلاعات بین دستگاه‌ها همگام نمی‌شوند و احراز هویت امنیت واقعی ندارد. برای استفاده‌ی عمومی باید به بک‌اند متصل شود.

---

## 🚀 راه‌اندازی

### پیش‌نیازها

- یک مرورگر مدرن (Chrome، Firefox، Edge، Safari)
- یکی از این‌ها:
  - Python 3 (برای `http.server`)
  - Node.js 16+ (برای `npx live-server` یا `http-server`)
  - VSCode + افزونه‌ی **Live Server**

### اجرا

#### روش ۱: Python
```bash
python -m http.server 5500
```
سپس در مرورگر باز کن: `http://localhost:5500`

#### روش ۲: Node.js (بدون نصب)
```bash
npx http-server -p 5500
```
یا:
```bash
npx live-server --port=5500 --open=index.html
```

#### روش ۳: VSCode Live Server
- روی `index.html` راست-کلیک کن
- گزینه‌ی **Open with Live Server** را انتخاب کن

> ⚠️ **نکته‌ی مهم:** پورت باید همیشه `5500` باشد، چون `localStorage` به origin (پورت) وابسته است. اگر پورت را عوض کنی، سبد خرید و کاربران از دست می‌روند.

---

## 🔑 ورود ادمین (دمو)

- **ایمیل:** `admin@bluemarket.com`
- **رمز:** `Admin@2024#Bl`
- **پنل:** `http://localhost:5500/admin/admin.html`

> ⚠️ این رمز در کد سورس قابل مشاهده است. برای پروداکشن باید از بک‌اند و JWT استفاده شود.

---

## 📁 ساختار پروژه

```
bluemarket/
├── index.html                  صفحه اصلی
├── products.html               لیست محصولات
├── product.html                صفحه محصول (پویا)
├── mobiles.html                دسته‌ی موبایل
├── laptops.html                دسته‌ی لپ‌تاپ
├── tablets.html                دسته‌ی تبلت
├── watches.html                دسته‌ی ساعت
├── accessories.html            دسته‌ی لوازم جانبی
├── cart.html                   سبد خرید
├── checkout.html               تکمیل خرید
├── thankyou.html               صفحه تشکر
├── auth.html                   ورود / ثبت‌نام
├── account.html                پنل کاربر
├── notifications.html          اعلان‌های کاربر
├── blog.html                   لیست مقالات
├── blog-post.html              مقاله‌ی تک
├── abuot.html                  درباره ما
├── contact.html                تماس با ما
├── faq.html                    سوالات متداول
├── refund.html                 رویه بازگشت کالا
├── privacy.html                حریم خصوصی
├── terms.html                  شرایط استفاده
├── report.html                 گزارش باگ
├── user-panel.html             (ریدایرکت به account.html)
│
├── js/
│   ├── config.js               تنظیمات مرکزی
│   ├── core/
│   │   └── storage.js          قرارداد لایه‌ی داده
│   ├── adapters/
│   │   ├── LocalStorageAdapter.js
│   │   └── ApiAdapter.js       (آماده برای بک‌اند)
│   ├── repositories/
│   │   ├── ProductsRepository.js
│   │   ├── OrdersRepository.js
│   │   ├── UsersRepository.js
│   │   ├── TicketsRepository.js
│   │   └── NotificationsRepository.js
│   ├── bootstrap.js            راه‌اندازی BM Core
│   ├── products-data.js        بانک محصولات (۲۰۵+ محصول)
│   ├── product-images.js       نقشه‌ی تصاویر
│   ├── seo.js                  تزریق Schema.org پویا
│   ├── auth.js                 ورود/ثبت‌نام
│   ├── main.js                 توابع عمومی
│   ├── home.js                 صفحه اصلی
│   ├── products.js             لیست محصولات
│   ├── product.js              صفحه محصول
│   ├── category-page.js        صفحات دسته‌بندی
│   ├── cart.js                 سبد خرید
│   ├── checkout.js             تکمیل خرید
│   ├── account.js              پنل کاربر
│   ├── notifications.js        اعلان‌های کاربر
│   ├── notification-center.js  هسته‌ی اعلان‌ها
│   ├── support-chat.js         چت پشتیبانی
│   ├── ux.js                   Toast، Search، Back-to-Top
│   ├── modal.js                Modal ورود/خروج
│   ├── components.js           حذف تکراری‌ها
│   ├── contact.js              فرم تماس
│   ├── faq.js                  سوالات متداول
│   ├── about.js                شمارنده‌های صفحه درباره
│   ├── report.js               فرم گزارش باگ
│   ├── blog.js                 بلاگ
│   ├── blog-data.js            داده‌های بلاگ
│   └── demo-events.js          سازگاری قدیمی
│
├── css/
│   ├── style.css               پایه
│   ├── ux.css                  UX
│   ├── glass.css               شیشه‌ای
│   ├── header.css              هدر
│   ├── home.css                صفحه اصلی
│   ├── products.css            لیست محصولات
│   ├── product.css             صفحه محصول
│   ├── category-page.css       دسته‌بندی
│   ├── cart.css                سبد
│   ├── checkout.css            تکمیل خرید
│   ├── account.css             پنل کاربر
│   ├── auth.css                ورود/ثبت‌نام
│   ├── contact.css             تماس
│   ├── faq.css                 سوالات
│   ├── abuot.css               درباره
│   ├── report.css              گزارش باگ
│   ├── scroll-animations.css   انیمیشن‌ها
│   └── support-chat.css        چت
│
├── components/
│   ├── header.html             هدر
│   └── footer.html             فوتر
│
├── images/
│   ├── logo.svg                لوگو
│   ├── icon-192.png            PWA icon
│   ├── icon-512.png            PWA icon
│   └── products/               تصاویر محصولات
│
├── admin/
│   ├── admin.html              ورود ادمین
│   ├── dashboard.html          داشبورد
│   ├── products.html           مدیریت محصولات
│   ├── orders.html             مدیریت سفارشات
│   ├── users.html              مدیریت کاربران
│   ├── tickets.html            مدیریت تیکت‌ها
│   ├── reports.html            گزارش‌ها
│   ├── notifications.html      اعلان‌ها
│   ├── admin-common.js         اسکریپت مشترک
│   ├── admin-common.css        استایل مشترک
│   └── admin-header.css        هدر
│
├── docs/
│   ├── API.md                  مستندات endpoint
│   └── MIGRATION.md            راهنمای مهاجرت
│
├── tools/
│   └── link-product-images.js  ساخت نقشه‌ی تصاویر
│
├── robots.txt
├── sitemap.xml
├── manifest.json
├── service-worker.js
├── .env.example
└── README-FA.md
```

---

## 🛒 خرید و پرداخت

### افزودن به سبد
از هر صفحه‌ای، روی «افزودن به سبد» کلیک کن.

### کد تخفیف
- `SAVE10` → ۱۰٪ تخفیف (حداقل ۵۰۰,۰۰۰ تومان)
- `WELCOME` → ۱۰۰,۰۰۰ تومان تخفیف (حداقل ۳۰۰,۰۰۰ تومان)
- `BLUEMARKET20` → ۲۰٪ تخفیف (حداقل ۲,۰۰۰,۰۰۰ تومان)
- `BLUE20` → ۲۰٪ تخفیف (حداقل ۵۰۰,۰۰۰ تومان)

### روش‌های پرداخت (دمو)
1. **پرداخت آنلاین** — شبیه‌سازی ۲ ثانیه‌ای
2. **کیف پول** — از موجودی کاربر کسر می‌شود
3. **پرداخت در محل** — فقط برای آدرس‌های گلشن

---

## 💰 کیف پول

- **شارژ:** پنل کاربر → تب کیف پول
- **ذخیره‌سازی:** `localStorage` → `bl_wallet_balance`
- **تراکنش‌ها:** `localStorage` → `bl_wallet_tx`

---

## 🎨 طراحی

- **رنگ اصلی:** نارنجی (`#f97316`)
- **هدر شیشه‌ای شناور**
- **مگامنوی ۵ ستونه**
- **کارت محصول مدرن**
- **اسلایدر تخفیف با تایمر**
- **پنل کاربر با کیف پول**
- **ریسپانسیو کامل (موبایل، تبلت، دسکتاپ)**

---

## 🔧 معماری

پروژه از معماری لایه‌ای استفاده می‌کند:

```
UI → Services → Repositories → Adapters → Storage
```

- **Storage:** `LocalStorageAdapter` (فعلی) یا `ApiAdapter` (آینده)
- **Repository:** دسترسی به داده‌ها
- **Service:** منطق کسب‌وکار
- **UI:** فقط با `window.BM` کار می‌کند

### دسترسی به داده‌ها

```javascript
// محصولات
const all = await window.BM.repos.products.getAll();
const product = await window.BM.repos.products.getById(1);

// سفارشات
const orders = await window.BM.repos.orders.getAll();

// کاربران
const user = await window.BM.repos.users.getCurrent();
```

### API قدیمی (سازگار)

```javascript
// محصولات
window.ALL_PRODUCTS              // آرایه‌ی همه‌ی محصولات
window.ProductsDB.all()          // همان
window.ProductsDB.getById(1)     // یک محصول
window.ProductsDB.search("ایفون") // جستجو
window.ProductsDB.related(1, 6)  // محصولات مشابه

// سبد خرید
window.CartStore.read()          // خواندن سبد
window.CartStore.add(product, 1, "مشکی")
window.CartStore.remove(id, color)
window.CartStore.clear()
window.CartStore.count()         // تعداد کل
window.CartStore.subtotal()      // جمع کل
```

---

## 📊 آمار پروژه

| مورد | تعداد |
|---|---|
| محصولات | ~۲۰۵ |
| دسته‌بندی | ۵ |
| زیردسته | ۲۵+ |
| صفحات | ۲۵+ |
| فایل‌های JS | ۲۵+ |
| فایل‌های CSS | ۱۸ |

---

## ⚠️ محدودیت‌های شناخته‌شده

- ❌ درگاه پرداخت واقعی نیست (شبیه‌سازی)
- ❌ SMS/Email واقعی نیست
- ❌ همگام‌سازی بین دستگاه‌ها نیست
- ❌ رمز ادمین در سورس قابل مشاهده است
- ❌ اطلاعات در `localStorage` (نه سرور)

---

## 🐛 گزارش باگ

از صفحه‌ی `report.html` یا با کلیک روی «گزارش باگ» در فوتر.

---

## 📧 تماس

- **تلفن:** 09229480252
- **ایمیل:** mshanbhzhi@gmail.com
- **آدرس:** گلشن، جنب پاساژ محمد رسول الله

---

## 📄 مجوز

این پروژه برای اهداف نمایشی/پورتفولیو ساخته شده است.