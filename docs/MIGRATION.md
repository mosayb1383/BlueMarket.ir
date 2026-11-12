# BLUE MARKET — راهنمای مهاجرت از LocalStorage به API

این سند توضیح می‌دهد چطور پروژه را از حالت **Demo** (localStorage) به **Production** (API واقعی) منتقل کنیم.

---

## پیش‌نیازها

1. بک‌اند آماده با endpointهای `docs/API.md`
2. Node.js و npm نصب
3. کپی `.env.example` به `.env`
4. پر کردن `API_BASE_URL`

---

## مرحله ۱: تنظیم `.env`

```env
APP_MODE=production
API_BASE_URL=https://api.YOUR-DOMAIN.ir/v1
```

**نکته:** چون این یک پروژه‌ی **static** است، باید از یک فایل `config.js` برای load کردن `.env` استفاده کنی، یا از یک build tool (Vite، Webpack، Parcel) استفاده کنی.

**روش ساده بدون build:**

فایل `js/config.js` را ویرایش کن:

```javascript
window.BM_CONFIG = {
  env: {
    mode: "production",  // ← تغییر بده
    apiBaseUrl: "https://api.YOUR-DOMAIN.ir/v1",
  },
  // ...
};
```

---

## مرحله ۲: بررسی `ApiAdapter`

فایل `js/adapters/ApiAdapter.js` را باز کن و مطمئن شو که endpointها با `docs/API.md` هماهنگ هستند.

```javascript
class ApiAdapter extends StorageInterface {
  constructor(baseUrl = "", options = {}) {
    super();
    this.baseUrl = baseUrl || window.BM_CONFIG.get("env.apiBaseUrl", "");
    this.options = {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        // Authorization: Bearer ... (بعد از login اضافه کن)
      },
    };
  }

  async _request(method, path, body) {
    const res = await fetch(this._url(path), {
      method,
      credentials: this.options.credentials,
      headers: this.options.headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.status === 204 ? null : res.json();
  }

  // ...
}
```

اگر بک‌اندت با این قرارداد فرق داره، `ApiAdapter` را تغییر بده.

---

## مرحله ۳: تغییر `bootstrap.js`

`js/bootstrap.js` به‌طور خودکار `LocalStorageAdapter` را استفاده می‌کند. برای تغییر به `ApiAdapter`:

```javascript
function createAdapter() {
  const mode = window.BM_CONFIG?.env?.mode || "demo";
  if (mode === "production" && window.ApiAdapter) {
    return new window.ApiAdapter(
      window.BM_CONFIG.get("env.apiBaseUrl", ""),
    );
  }
  return new window.LocalStorageAdapter("bm");
}
```

این کد از قبل در `bootstrap.js` هست. فقط `mode` را در `config.js` تغییر بده.

---

## مرحله ۴: انتقال Auth

در حالت فعلی، `auth.js` از `localStorage` می‌خواند. برای بک‌اند:

### قبل:
```javascript
async function loginUser(email, password) {
  const users = getRegisteredUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    saveUser({ ... });
    return true;
  }
  return false;
}
```

### بعد:
```javascript
async function loginUser(email, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    
    // ذخیره توکن
    localStorage.setItem("bl_token", data.token);
    // ست کردن هدر Authorization برای درخواست‌های بعدی
    window.ApiAdapter && (window.ApiAdapter.setAuthToken(data.token));
    
    saveUser(data.user);
    return true;
  } catch (e) {
    return false;
  }
}
```

---

## مرحله ۵: انتقال محصولات

### قبل:
```javascript
const products = window.ALL_PRODUCTS;
```

### بعد:
```javascript
const products = await window.BM.repos.products.getAll();
```

`ProductsRepository` در حالت production از `ApiAdapter` می‌خواند. فقط کافیه `ApiAdapter._request("GET", "products")` رو پیاده‌سازی کنی.

---

## مرحله ۶: انتقال سفارشات

### قبل:
```javascript
const orders = JSON.parse(localStorage.getItem("bl_orders") || "[]");
```

### بعد:
```javascript
const orders = await window.BM.repos.orders.getAll();
```

`OrdersRepository.create()` را با `POST /orders` هماهنگ کن.

---

## مرحله ۷: انتقال سبد خرید

**مهم:** سبد خرید در حالت production باید **سمت سرور** باشد تا بین دستگاه‌ها همگام شود.

### قبل:
```javascript
window.CartStore = {
  read: () => JSON.parse(localStorage.getItem("shoppingCart") || "[]"),
  add: (p) => { /* localStorage */ },
  // ...
};
```

### بعد:
```javascript
window.CartStore = {
  async read() {
    const res = await fetch(`${API_BASE}/cart`, { headers: authHeader() });
    return res.json();
  },
  async add(product, qty, color) {
    await fetch(`${API_BASE}/cart/items`, {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify({ productId: product.id, quantity: qty, color }),
    });
    return this.read();
  },
  // ...
};
```

---

## مرحله ۸: انتقال اعلان‌ها (اختیاری)

اعلان‌ها می‌توانند LocalStorage بمانند (چون برای کاربر فعلی است). ولی برای همگام‌سازی بین دستگاه‌ها:

- `GET /notifications` — خواندن
- `PATCH /notifications/:id/read` — علامت‌گذاری
- **WebSocket یا Polling** برای دریافت زنده

---

## مرحله ۹: انتقال پنل ادمین

`AdminApp.getProducts()` و `AdminApp.getOrders()` باید از `ApiAdapter` بخوانند:

```javascript
async getProducts() {
  const res = await fetch(`${API_BASE}/admin/products`, {
    headers: authHeader("admin"),
  });
  return res.json();
}
```

**نکته:** ادمین باید نقش `admin` داشته باشد در JWT. سمت سرور باید `role` را چک کند.

---

## مرحله ۱۰: انتقال کیف پول

### قبل:
```javascript
localStorage.getItem("bl_wallet_balance")
```

### بعد:
```javascript
const { balance } = await fetch(`${API_BASE}/wallet/balance`).then(r => r.json());
```

---

## مرحله ۱۱: انتقال پرداخت

### قبل (دمو):
```javascript
simulatePayment() {
  return new Promise(r => setTimeout(r, 2000));
}
```

### بعد:
```javascript
async processPayment(orderData) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(orderData),
  });
  const { redirectUrl } = await res.json();
  window.location.href = redirectUrl; // به درگاه
}
```

سپس صفحه‌ی `thankyou.html` باید `GET /orders/:id` بزند و وضعیت پرداخت را چک کند.

---

## مرحله ۱۲: تست

بعد از انتقال، این‌ها را چک کن:

- [ ] ثبت‌نام → `POST /auth/register`
- [ ] ورود → `POST /auth/login` + ذخیره توکن
- [ ] لیست محصولات → `GET /products`
- [ ] جزئیات محصول → `GET /products/:id`
- [ ] افزودن به سبد → `POST /cart/items`
- [ ] تغییر تعداد → `PATCH /cart/items/:id`
- [ ] حذف → `DELETE /cart/items/:id`
- [ ] اعمال کوپن → `POST /cart/coupon`
- [ ] ثبت سفارش → `POST /orders` + redirect به درگاه
- [ ] بازگشت از درگاه → `GET /orders/:id`
- [ ] پروفایل → `GET /auth/me`
- [ ] آدرس‌ها → `GET/POST/PATCH/DELETE /users/me/addresses`
- [ ] علاقه‌مندی → `GET/POST/DELETE /users/me/wishlist`
- [ ] کیف پول → `GET /wallet/balance`, `POST /wallet/charge`
- [ ] تیکت → `GET/POST /tickets`
- [ ] اعلان → `GET /notifications`
- [ ] ادمین → `GET /admin/*`

---

## مرحله ۱۳: امنیت

### الزامی:
- ✅ **HTTPS** برای همه‌ی درخواست‌ها
- ✅ **JWT** با expiry کوتاه + refresh token
- ✅ **bcrypt** برای رمز عبور (نه SHA-256 سمت مرورگر)
- ✅ **Rate limiting** سمت سرور
- ✅ **CORS** محدود به دامنه‌ی خودت
- ✅ **CSRF** protection (اگر از cookie استفاده می‌کنی)
- ✅ **Input validation** سمت سرور
- ✅ **SQL injection prevention** (parameterized queries)
- ✅ **XSS prevention** (sanitize HTML)

### پیشنهادی:
- 2FA برای ادمین
- Audit log
- Backup منظم
- Monitoring (Sentry)

---

## مشکلات رایج

### `CORS error`
سمت سرور باید هدر `Access-Control-Allow-Origin` را برای دامنه‌ی خودت بده.

### `401 Unauthorized` بعد از refresh
توکن منقضی شده. باید refresh token پیاده‌سازی کنی.

### `image not loading`
مسیر تصاویر در API باید کامل باشد (`https://...` نه `images/...`).

### سبد خرید خالی بعد از login
سبد LocalStorage را merge کن با سبد سرور در اولین login.

---

## پشتیبانی

اگر در انتقال مشکل داشتی:
- فایل `README-FA.md` را بخوان
- در Console مرورگر، `window.BM` را چک کن
- لاگ‌های `[ApiAdapter]` را نگاه کن