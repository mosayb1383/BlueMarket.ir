# BLUE MARKET — API Documentation

مستندات endpointهای موردنیاز برای اتصال بک‌اند

---

## Base URL

```
https://api.YOUR-DOMAIN.ir/v1
```

---

## Authentication

همه‌ی endpointهای نیازمند احراز هویت، از **JWT** در هدر `Authorization` استفاده می‌کنند:

```
Authorization: Bearer <token>
```

### POST /auth/register

ثبت‌نام کاربر جدید

**Request:**
```json
{
  "firstName": "علی",
  "lastName": "محمدی",
  "email": "ali@example.com",
  "phone": "09123456789",
  "password": "SecurePass123!"
}
```

**Response 201:**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": 123,
    "firstName": "علی",
    "lastName": "محمدی",
    "email": "ali@example.com",
    "phone": "09123456789"
  }
}
```

**Errors:**
- `400` — invalid input
- `409` — email already exists

---

### POST /auth/login

ورود

**Request:**
```json
{
  "email": "ali@example.com",
  "password": "SecurePass123!"
}
```

**Response 200:**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": { ... }
}
```

**Errors:**
- `401` — invalid credentials
- `429` — too many attempts

---

### POST /auth/logout

خروج (باطل کردن token)

**Headers:** `Authorization: Bearer <token>`

**Response 200:** `{ "success": true }`

---

### GET /auth/me

دریافت اطلاعات کاربر فعلی

**Response 200:**
```json
{
  "id": 123,
  "firstName": "علی",
  "lastName": "محمدی",
  "email": "ali@example.com",
  "phone": "09123456789",
  "walletBalance": 250000,
  "createdAt": "2026-01-15T10:30:00Z"
}
```

---

## Products

### GET /products

لیست محصولات با فیلتر

**Query params:**
- `category` — mobile | laptop | tablet | watch | accessory
- `subcategory` — mobile-samsung | headphones | ...
- `brand` — apple | samsung | ...
- `minPrice` — عدد (تومان)
- `maxPrice` — عدد
- `search` — عبارت جستجو
- `available` — true | false
- `discount` — true | false
- `sort` — newest | bestselling | price-low | price-high | rating
- `page` — شماره صفحه (پیش‌فرض 1)
- `perPage` — تعداد در صفحه (پیش‌فرض 12)

**Response 200:**
```json
{
  "products": [
    {
      "id": 1,
      "name": "گوشی موبایل سامسونگ Galaxy S25 Ultra",
      "shortName": "گلکسی S25 اولترا",
      "category": "mobile",
      "subcategory": "mobile-samsung",
      "brand": "samsung",
      "price": 159999000,
      "oldPrice": null,
      "rating": 4.8,
      "reviewCount": 124,
      "stock": 8,
      "isNew": true,
      "isBestseller": true,
      "isDemo": false,
      "image": "https://...",
      "images": ["https://..."],
      "colors": ["مشکی", "آبی"],
      "specs": { ... }
    }
  ],
  "pagination": {
    "page": 1,
    "perPage": 12,
    "total": 205,
    "totalPages": 18
  }
}
```

---

### GET /products/:id

یک محصول

**Response 200:** (همان ساختار بالا)

**Errors:**
- `404` — product not found

---

### GET /products/:id/related

محصولات مشابه

**Query:** `limit` (پیش‌فرض 6)

**Response 200:** آرایه‌ی محصولات

---

## Categories

### GET /categories

لیست دسته‌بندی‌ها

**Response 200:**
```json
[
  { "id": "mobile", "name": "گوشی موبایل", "icon": "bi-phone", "count": 35 },
  { "id": "laptop", "name": "لپ‌تاپ", "icon": "bi-laptop", "count": 20 }
]
```

---

## Cart

### GET /cart

سبد خرید فعلی کاربر

**Response 200:**
```json
{
  "items": [
    {
      "id": "1",
      "name": "گلکسی S25 اولترا",
      "price": 159999000,
      "quantity": 1,
      "color": "مشکی",
      "image": "https://..."
    }
  ],
  "subtotal": 159999000,
  "couponDiscount": 0,
  "total": 159999000
}
```

---

### POST /cart/items

افزودن محصول

**Request:**
```json
{
  "productId": 1,
  "quantity": 1,
  "color": "مشکی"
}
```

**Response 200:** سبد به‌روزشده

---

### PATCH /cart/items/:id

تغییر تعداد

**Request:** `{ "quantity": 3 }`

**Response 200:** سبد به‌روزشده

---

### DELETE /cart/items/:id

حذف محصول

**Response 200:** سبد به‌روزشده

---

### DELETE /cart

خالی کردن سبد

**Response 200:** `{ "items": [], "subtotal": 0, "total": 0 }`

---

### POST /cart/coupon

اعمال کد تخفیف

**Request:** `{ "code": "SAVE10" }`

**Response 200:**
```json
{
  "success": true,
  "coupon": {
    "code": "SAVE10",
    "type": "percent",
    "value": 10,
    "label": "۱۰٪ تخفیف"
  },
  "discount": 15999900
}
```

**Errors:**
- `400` — invalid code
- `422` — minimum purchase not met

---

## Orders

### GET /orders

سفارشات کاربر

**Query:** `status`, `page`, `perPage`

**Response 200:**
```json
{
  "orders": [
    {
      "id": "BM-12345678",
      "status": "processing",
      "total": 159999000,
      "items": [ ... ],
      "address": { ... },
      "trackingCode": "BMT-1234567890",
      "createdAt": "2026-11-11T14:30:00Z"
    }
  ]
}
```

---

### POST /orders

ثبت سفارش جدید

**Request:**
```json
{
  "items": [ { "id": 1, "quantity": 1, "color": "مشکی" } ],
  "addressId": 5,
  "deliveryMethod": "standard",
  "paymentMethod": "online",
  "couponCode": "SAVE10"
}
```

**Response 201:**
```json
{
  "success": true,
  "order": {
    "id": "BM-12345678",
    "trackingCode": "BMT-1234567890",
    "status": "processing",
    "total": 159999000
  }
}
```

**Errors:**
- `400` — empty cart / invalid address
- `402` — insufficient wallet balance

---

### GET /orders/:id

جزئیات سفارش

---

## Users

### GET /users/me

پروفایل کاربر

### PATCH /users/me

ویرایش پروفایل

**Request:**
```json
{
  "firstName": "علی",
  "lastName": "محمدی",
  "phone": "09123456789"
}
```

---

### GET /users/me/addresses

لیست آدرس‌ها

### POST /users/me/addresses

افزودن آدرس

### PATCH /users/me/addresses/:id

ویرایش آدرس

### DELETE /users/me/addresses/:id

حذف آدرس

---

### GET /users/me/wishlist

لیست علاقه‌مندی‌ها

### POST /users/me/wishlist/:productId

افزودن به علاقه‌مندی

### DELETE /users/me/wishlist/:productId

حذف از علاقه‌مندی

---

## Wallet

### GET /wallet/balance

موجودی کیف پول

**Response 200:** `{ "balance": 250000, "currency": "IRR" }`

---

### POST /wallet/charge

شارژ کیف پول

**Request:**
```json
{
  "amount": 500000,
  "gateway": "zarinpal"
}
```

**Response 200:** `{ "redirectUrl": "https://gateway..." }`

---

### GET /wallet/transactions

تاریخچه تراکنش‌ها

---

## Tickets

### GET /tickets

لیست تیکت‌های کاربر

### GET /tickets/:id

جزئیات + پیام‌ها

### POST /tickets

ایجاد تیکت

**Request:**
```json
{
  "subject": "مشکل در سفارش",
  "category": "order",
  "priority": "high",
  "message": "سفارش من هنوز نرسیده..."
}
```

### POST /tickets/:id/messages

پاسخ به تیکت

**Request:** `{ "message": "پاسخ شما..." }`

---

## Notifications

### GET /notifications

اعلان‌های کاربر

**Query:** `unread` (boolean)

### PATCH /notifications/:id/read

علامت‌گذاری خوانده‌شده

### POST /notifications/read-all

خواندن همه

---

## Admin

همه‌ی endpointهای ادمین نیازمند نقش `admin` هستند.

### GET /admin/dashboard

آمار داشبورد

**Response 200:**
```json
{
  "stats": {
    "products": 205,
    "orders": 42,
    "users": 12,
    "revenue": 1250000000,
    "tickets": 8,
    "pending": 3
  }
}
```

### GET /admin/products

(همه‌ی محصولات + امکان CRUD)

### POST /admin/products

ایجاد محصول

### PATCH /admin/products/:id

ویرایش

### DELETE /admin/products/:id

حذف

### GET /admin/orders

(همه‌ی سفارشات)

### PATCH /admin/orders/:id/status

تغییر وضعیت

**Request:** `{ "status": "shipped" }`

### GET /admin/users

لیست کاربران

### GET /admin/tickets

همه‌ی تیکت‌ها

### POST /admin/tickets/:id/reply

پاسخ ادمین

---

## Webhooks (اختیاری)

اگر درگاه پرداخت داری:

### POST /webhooks/payment

**Request:**
```json
{
  "orderId": "BM-12345678",
  "status": "success",
  "transactionId": "..."
}
```

---

## Error Codes

| Code | معنی |
|---|---|
| `200` | موفق |
| `201` | ایجاد شد |
| `400` | درخواست نامعتبر |
| `401` | نیازمند ورود |
| `403` | دسترسی ممنوع |
| `404` | یافت نشد |
| `409` | تداخل (مثل ایمیل تکراری) |
| `422` | خطای اعتبارسنجی |
| `429` | تعداد درخواست زیاد |
| `500` | خطای سرور |

---

## Rate Limiting

- **عمومی:** 60 درخواست در دقیقه
- **login/register:** 10 درخواست در دقیقه
- **payment:** 5 درخواست در دقیقه

---

## Pagination

همه‌ی لیست‌ها از این ساختار استفاده می‌کنند:

```json
{
  "pagination": {
    "page": 1,
    "perPage": 12,
    "total": 205,
    "totalPages": 18,
    "hasNext": true,
    "hasPrev": false
  }
}
```