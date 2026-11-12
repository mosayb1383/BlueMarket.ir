/* ============================================
   بانک محصولات — بلو مارکت
   ============================================ */

"use strict";

const PLACEHOLDER = "images/products/placeholder-product.svg";

/* ============================================================
   اصلاح ۱: ابزارهای کمکی برای استانداردسازی داده‌ها
   ============================================================ */

/* استانداردسازی برند */
function normBrand(b) {
  if (!b) return "generic";
  return String(b).trim().toLowerCase();
}

/* استانداردسازی دسته */
function normCategory(c) {
  if (!c) return "accessory";
  const v = String(c).trim().toLowerCase();
  const map = {
    mobile: "mobile", mobiles: "mobile", phone: "mobile",
    laptop: "laptop", laptops: "laptop",
    tablet: "tablet", tablets: "tablet",
    watch: "watch", watches: "watch",
    accessory: "accessory", accessories: "accessory"
  };
  return map[v] || v;
}

/* تشخیص زیردسته‌ی دقیق برای لوازم جانبی */
function detectSubcategory(p) {
  const text = [p.name, p.shortName, p.desc].filter(Boolean).join(" ");
  if (/باتری(?!.*پاور)/.test(text)) return "battery";
  if (/پاوربانک|پاور بانک|پاور‌بانک/.test(text)) return "powerbank";
  if (/کابل|تبدیل|HDMI|Lightning/i.test(text)) return "cable";
  if (/شارژر/.test(text)) return "charger";
  if (/هدفون|هندزفری|ایرپاد|ایرباد|هدست|AirPods|Buds/i.test(text)) return "headphones";
  if (/قاب|کاور|گلس|محافظ|بند/.test(text)) return "case";
  if (/ماوس|موس/.test(text)) return "mouse";
  if (/کیبورد/.test(text)) return "keyboard";
  if (/مانیتور/.test(text)) return "monitor";
  if (/هارد|فلش|SSD|حافظه/.test(text)) return "storage";
  if (/دسته.?بازی|کنسول|گیمینگ|تریگر|پد.?گیمینگ/.test(text)) return "gaming";
  if (/رم|مادربرد|پردازنده|کارت.?گرافیک|CPU|GPU|RAM|DDR/i.test(text)) return "computer-parts";
  return "computer-accessory";
}

/* ساخت زیردسته برای موبایل/تبلت/ساعت/لپ‌تاپ */
function buildSubcategory(p) {
  const cat = p.category;
  const brand = p.brand;
  if (cat === "mobile") return "mobile-" + brand;
  if (cat === "tablet") return "tablet-" + brand;
  if (cat === "watch") return "watch-" + brand;
  if (cat === "laptop") return "laptop-" + brand;
  return p.subcategory;
}

/* بررسی قیمت رسمی */
function isOfficialPrice(p) {
  if (!p.price || p.price <= 0) return false;
  if (p.priceReviewRequired === true) return false;
  return true;
}

/* imageKey یکتا و معتبر */
function ensureImageKey(p) {
  if (p.imageKey && typeof p.imageKey === "string" && p.imageKey.trim()) {
    return p.imageKey.trim();
  }
  const base = (p.shortName || p.name || "product")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]/g, "")
    .slice(0, 40);
  return base || "product-" + (p.id || Date.now());
}

/* ============================================================
   اصلاح ۶: نرمال‌سازی یک محصول قبل از افزودن به آرایه
   ============================================================ */
function normalizeProduct(p) {
  const copy = Object.assign({}, p);
  copy.id = Number(copy.id) || Date.now();
  copy.category = normCategory(copy.category);
  copy.brand = normBrand(copy.brand);
  copy.imageKey = ensureImageKey(copy);
  copy.isDemo = copy.isDemo === true; // پیش‌فرض false
  copy.price = Number(copy.price) || 0;
  copy.oldPrice = copy.oldPrice == null ? null : Number(copy.oldPrice) || null;
  copy.rating = Number(copy.rating) || 0;
  copy.reviewCount = Number(copy.reviewCount) || 0;
  copy.stock = Number(copy.stock) || 0;
  copy.isNew = copy.isNew === true;
  copy.isBestseller = copy.isBestseller === true;
  copy.isFeatured = copy.isFeatured === true;
  copy.isSpecialSale = copy.isSpecialSale === true;

  if (copy.category === "accessory") {
    copy.subcategory = detectSubcategory(copy);
  } else {
    copy.subcategory = buildSubcategory(copy);
  }

  // اصلاح ۴: priceReviewRequired
  copy.priceReviewRequired = !isOfficialPrice(copy);

  // اطمینان از فیلدها
  copy.colors = Array.isArray(copy.colors) ? copy.colors : [];
  copy.highlights = Array.isArray(copy.highlights) ? copy.highlights : [];
  copy.specs = copy.specs && typeof copy.specs === "object" ? copy.specs : {};
  copy.seller = copy.seller || "بلو مارکت";
  copy.warranty = copy.warranty || "۱۸ ماه گارانتی";
  copy.desc = copy.desc || "";
  copy.image = copy.image || PLACEHOLDER;
  copy.images = Array.isArray(copy.images) && copy.images.length
    ? copy.images
    : [copy.image];

  return copy;
}

/* ============================================================
   ALL_PRODUCTS — نسخه ۲.۰
   ============================================================ */

const ALL_PRODUCTS_RAW = [

  // ═══════════════════════════════════════════════════
  //  🎯 موبایل پرچمدار — بخش اول (۲۲ محصول فعلی + ۳ جدید)
  // ═══════════════════════════════════════════════════

  {
    id: 1,
    imageKey: "samsung-s25-ultra",
    name: "گوشی موبایل سامسونگ Galaxy S25 Ultra",
    shortName: "گلکسی S25 اولترا",
    category: "mobile",
    brand: "samsung",
    price: 159999000,
    oldPrice: null,
    rating: 4.8,
    reviewCount: 124,
    stock: 8,
    isNew: true,
    isBestseller: true,
    isSpecialSale: true,
    isFeatured: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی", "خاکستری", "آبی"],
    warranty: "۱۸ ماه گارانتی",
    seller: "بلو مارکت",
    desc: "پرچمدار سامسونگ با دوربین ۲۰۰ مگاپیکسلی و قلم S Pen.",
    highlights: ["دوربین ۲۰۰MP", "صفحه ۶.۹ اینچی 120Hz", "شارژ ۴۵ وات"],
    specs: { حافظه: "۵۱۲GB", رم: "۱۲GB", باتری: "۵۰۰۰", نمایش: "۶.۹ اینچ" },
  },
  {
    id: 2,
    imageKey: "samsung-s25-plus",
    name: "گوشی موبایل سامسونگ Galaxy S25+",
    shortName: "گلکسی S25 پلاس",
    category: "mobile",
    brand: "samsung",
    price: 129999000,
    oldPrice: null,
    rating: 4.6,
    reviewCount: 87,
    stock: 10,
    isNew: true,
    isBestseller: false,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی", "نقره‌ای"],
    warranty: "۱۸ ماه گارانتی",
    seller: "بلو مارکت",
    desc: "گلکسی S25 پلاس با صفحه ۶.۷ اینچی و دوربین سه‌گانه.",
    highlights: ["دوربین ۵۰MP", "صفحه AMOLED", "ضدآب IP68"],
    specs: { حافظه: "۲۵۶GB", رم: "۱۲GB", باتری: "۴۹۰۰", نمایش: "۶.۷ اینچ" },
  },
  {
    id: 3,
    imageKey: "samsung-s24-fe",
    name: "گوشی موبایل سامسونگ Galaxy S24 FE",
    shortName: "گلکسی S24 FE",
    category: "mobile",
    brand: "samsung",
    price: 51175300,
    oldPrice: 55990000,
    rating: 4.5,
    reviewCount: 67,
    stock: 12,
    isNew: true,
    isSpecialSale: true,
    isFeatured: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["خاکستری", "آبی", "سبز"],
    warranty: "۱۸ ماه گارانتی",
    seller: "دیجی‌کالا",
    desc: "نسخه Fan Edition با تراشه Exynos 2400e.",
    highlights: ["دوربین ۵۰MP", "صفحه ۶.۷ اینچی", "IP68"],
    specs: { حافظه: "۲۵۶GB", رم: "۸GB", باتری: "۴۷۰۰", نمایش: "۶.۷ اینچ" },
  },
  {
    id: 4,
    imageKey: "samsung-a55",
    name: "گوشی موبایل سامسونگ Galaxy A55",
    shortName: "گلکسی A55",
    category: "mobile",
    brand: "samsung",
    price: 32990000,
    oldPrice: null,
    rating: 4.4,
    reviewCount: 156,
    stock: 18,
    isBestseller: true,
    isFeatured: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی", "آبی", "بنفش"],
    warranty: "۱۸ ماه گارانتی",
    seller: "ترب",
    desc: "گوشی میان‌رده سامسونگ با صفحه Super AMOLED.",
    highlights: ["صفحه AMOLED", "دوربین ۵۰MP", "باتری ۵۰۰۰"],
    specs: { حافظه: "۲۵۶GB", رم: "۸GB", باتری: "۵۰۰۰", نمایش: "۶.۶ اینچ" },
  },
  {
    id: 5,
    imageKey: "samsung-a36",
    name: "گوشی موبایل سامسونگ Galaxy A36",
    shortName: "گلکسی A36",
    category: "mobile",
    brand: "samsung",
    price: 24990000,
    oldPrice: null,
    rating: 4.3,
    reviewCount: 189,
    stock: 25,
    isBestseller: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی", "آبی روشن"],
    warranty: "۱۸ ماه گارانتی",
    seller: "بلو مارکت",
    desc: "گلکسی A36 با صفحه AMOLED و دوربین ۵۰ مگاپیکسلی.",
    highlights: ["صفحه AMOLED", "دوربین ۵۰MP", "ضدآب IP67"],
    specs: { حافظه: "۱۲۸GB", رم: "۶GB", باتری: "۵۰۰۰", نمایش: "۶.۶ اینچ" },
  },
  {
    id: 6,
    imageKey: "samsung-a25",
    name: "گوشی موبایل سامسونگ Galaxy A25",
    shortName: "گلکسی A25",
    category: "mobile",
    brand: "samsung",
    price: 26399000,
    oldPrice: 28299000,
    rating: 4.2,
    reviewCount: 132,
    stock: 20,
    isBestseller: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی", "آبی روشن", "زرد"],
    warranty: "۱۸ ماه گارانتی",
    seller: "دیجی‌کالا",
    desc: "گوشی میان‌رده با صفحه AMOLED و باتری ۵۰۰۰.",
    highlights: ["صفحه AMOLED", "دوربین ۵۰MP", "شارژ ۲۵ وات"],
    specs: { حافظه: "۱۲۸GB", رم: "۶GB", باتری: "۵۰۰۰", نمایش: "۶.۵ اینچ" },
  },
  {
    id: 7,
    imageKey: "samsung-a16",
    name: "گوشی موبایل سامسونگ Galaxy A16",
    shortName: "گلکسی A16",
    category: "mobile",
    brand: "samsung",
    price: 16899000,
    oldPrice: null,
    rating: 4.0,
    reviewCount: 78,
    stock: 25,
    isBestseller: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی", "سبز روشن"],
    warranty: "۱۸ ماه گارانتی",
    seller: "ترب",
    desc: "گوشی اقتصادی سامسونگ با ۶ سال آپدیت اندروید.",
    highlights: ["۶ سال آپدیت", "باتری ۵۰۰۰", "دوربین ۵۰MP"],
    specs: { حافظه: "۱۲۸GB", رم: "۴GB", باتری: "۵۰۰۰", نمایش: "۶.۷ اینچ" },
  },
  {
    id: 8,
    imageKey: "iphone-16-pro-max",
    name: "گوشی موبایل اپل iPhone 16 Pro Max",
    shortName: "آیفون ۱۶ پرو مکس",
    category: "mobile",
    brand: "apple",
    price: 202000000,
    oldPrice: null,
    rating: 4.9,
    reviewCount: 89,
    stock: 5,
    isNew: true,
    isBestseller: true,
    isFeatured: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["تیتانیوم طبیعی", "مشکی", "سفید"],
    warranty: "۱۲ ماه گارانتی آواژنگ",
    seller: "بلو مارکت",
    desc: "قدرتمندترین آیفون تاریخ با تراشه A18 Pro.",
    highlights: ["تراشه A18 Pro", "دوربین ۴۸MP", "بدنه تیتانیومی"],
    specs: { حافظه: "۲۵۶GB", رم: "۸GB", باتری: "۴۶۸۵", نمایش: "۶.۹ اینچ" },
  },
  {
    id: 9,
    imageKey: "iphone-16-pro",
    name: "گوشی موبایل اپل iPhone 16 Pro",
    shortName: "آیفون ۱۶ پرو",
    category: "mobile",
    brand: "apple",
    price: 178000000,
    oldPrice: 189000000,
    rating: 4.8,
    reviewCount: 76,
    stock: 6,
    isNew: true,
    isBestseller: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["تیتانیوم", "مشکی", "سفید"],
    warranty: "۱۲ ماه گارانتی آواژنگ",
    seller: "دیجی‌کالا",
    desc: "آیفون ۱۶ پرو با دوربین سه‌گانه و تراشه A18 Pro.",
    highlights: ["تراشه A18 Pro", "صفحه ۶.۳ اینچی", "USB-C"],
    specs: { حافظه: "۱۲۸GB", رم: "۸GB", باتری: "۳۵۸۲", نمایش: "۶.۳ اینچ" },
  },
  {
    id: 10,
    imageKey: "iphone-16",
    name: "گوشی موبایل اپل iPhone 16",
    shortName: "آیفون ۱۶",
    category: "mobile",
    brand: "apple",
    price: 95000000,
    oldPrice: null,
    rating: 4.7,
    reviewCount: 134,
    stock: 10,
    isNew: true,
    isBestseller: true,
    isSpecialSale: true,
    isFeatured: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی", "سفید", "صورتی", "آبی"],
    warranty: "۱۲ ماه گارانتی آواژنگ",
    seller: "ترب",
    desc: "آیفون ۱۶ با دوربین دوگانه و تراشه A18.",
    highlights: ["تراشه A18", "دوربین ۴۸MP", "Action Button"],
    specs: { حافظه: "۱۲۸GB", رم: "۸GB", باتری: "۳۵۶۱", نمایش: "۶.۱ اینچ" },
  },
  {
    id: 11,
    imageKey: "iphone-15-pro",
    name: "گوشی موبایل اپل iPhone 15 Pro",
    shortName: "آیفون ۱۵ پرو",
    category: "mobile",
    brand: "apple",
    price: 89000000,
    oldPrice: null,
    rating: 4.8,
    reviewCount: 167,
    stock: 8,
    isBestseller: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["تیتانیوم", "مشکی", "آبی"],
    warranty: "۱۲ ماه گارانتی آواژنگ",
    seller: "بلو مارکت",
    desc: "آیفون ۱۵ پرو با تراشه A17 Pro و بدنه تیتانیومی.",
    highlights: ["تراشه A17 Pro", "دوربین ۴۸MP", "USB-C"],
    specs: { حافظه: "۲۵۶GB", رم: "۸GB", باتری: "۳۲۷۴", نمایش: "۶.۱ اینچ" },
  },
  {
    id: 12,
    imageKey: "iphone-15",
    name: "گوشی موبایل اپل iPhone 15",
    shortName: "آیفون ۱۵",
    category: "mobile",
    brand: "apple",
    price: 45000000,
    oldPrice: 48000000,
    rating: 4.7,
    reviewCount: 156,
    stock: 10,
    isBestseller: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی", "سفید", "صورتی"],
    warranty: "۱۲ ماه گارانتی آواژنگ",
    seller: "دیجی‌کالا",
    desc: "آیفون ۱۵ با درگاه USB-C و دوربین ۴۸ مگاپیکسلی.",
    highlights: ["تراشه A16", "USB-C", "دوربین ۴۸MP"],
    specs: { حافظه: "۱۲۸GB", رم: "۶GB", باتری: "۳۳۴۹", نمایش: "۶.۱ اینچ" },
  },
  {
    id: 13,
    imageKey: "xiaomi-14-ultra",
    name: "گوشی موبایل شیائومی 14 Ultra",
    shortName: "شیائومی ۱۴ اولترا",
    category: "mobile",
    brand: "xiaomi",
    price: 109000000,
    oldPrice: null,
    rating: 4.8,
    reviewCount: 92,
    stock: 4,
    isNew: true,
    isBestseller: false,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی", "سفید"],
    warranty: "۱۸ ماه گارانتی",
    seller: "ترب",
    desc: "پرچمدار شیائومی با دوربین Leica و اسنپدراگون ۸ Gen 3.",
    highlights: ["دوربین Leica", "اسنپدراگون ۸ Gen 3", "شارژ ۹۰ وات"],
    specs: { حافظه: "۵۱۲GB", رم: "۱۶GB", باتری: "۵۰۰۰", نمایش: "۶.۷ اینچ" },
  },
  {
    id: 14,
    imageKey: "xiaomi-14",
    name: "گوشی موبایل شیائومی 14",
    shortName: "شیائومی ۱۴",
    category: "mobile",
    brand: "xiaomi",
    price: 69900000,
    oldPrice: null,
    rating: 4.6,
    reviewCount: 78,
    stock: 8,
    isNew: true,
    isBestseller: false,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی", "آبی"],
    warranty: "۱۸ ماه گارانتی",
    seller: "دیجی‌کالا",
    desc: "شیائومی ۱۴ با تراشه Snapdragon 8 Gen 3.",
    highlights: ["اسنپدراگون ۸ Gen 3", "دوربین ۵۰MP", "شارژ ۹۰ وات"],
    specs: { حافظه: "۲۵۶GB", رم: "۱۲GB", باتری: "۴۶۱۰", نمایش: "۶.۳۶ اینچ" },
  },
  {
    id: 15,
    imageKey: "poco-x6-pro",
    name: "گوشی موبایل شیائومی Poco X6 Pro",
    shortName: "پوکو X6 پرو",
    category: "mobile",
    brand: "xiaomi",
    price: 28990000,
    oldPrice: 33990000,
    rating: 4.6,
    reviewCount: 98,
    stock: 14,
    isBestseller: true,
    isFeatured: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی", "زرد"],
    warranty: "۱۸ ماه گارانتی",
    seller: "ترب",
    desc: "گوشی گیمینگ شیائومی با تراشه Dimensity 8300.",
    highlights: ["Dimensity 8300", "AMOLED 120Hz", "شارژ ۶۷ وات"],
    specs: { حافظه: "۲۵۶GB", رم: "۸GB", باتری: "۵۰۰۰", نمایش: "۶.۶۷ اینچ" },
  },
  {
    id: 16,
    imageKey: "redmi-note-13-pro",
    name: "گوشی موبایل شیائومی Redmi Note 13 Pro",
    shortName: "ردمی نوت ۱۳ پرو",
    category: "mobile",
    brand: "xiaomi",
    price: 18990000,
    oldPrice: null,
    rating: 4.5,
    reviewCount: 234,
    stock: 22,
    isBestseller: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی", "آبی", "سفید"],
    warranty: "۱۸ ماه گارانتی",
    seller: "دیجی‌کالا",
    desc: "ردمی نوت ۱۳ پرو با دوربین ۲۰۰ مگاپیکسلی.",
    highlights: ["دوربین ۲۰۰MP", "AMOLED", "شارژ ۶۷ وات"],
    specs: { حافظه: "۲۵۶GB", رم: "۸GB", باتری: "۵۱۰۰", نمایش: "۶.۶۷ اینچ" },
  },
  {
    id: 17,
    imageKey: "redmi-15",
    name: "گوشی موبایل شیائومی Redmi 15",
    shortName: "ردمی ۱۵",
    category: "mobile",
    brand: "xiaomi",
    price: 18189000,
    oldPrice: null,
    rating: 4.0,
    reviewCount: 45,
    stock: 15,
    isNew: true,
    isBestseller: false,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی", "آبی", "سبز"],
    warranty: "۱۸ ماه گارانتی",
    seller: "ترب",
    desc: "گوشی اقتصادی با باتری ۶۰۰۰ میلی‌آمپری.",
    highlights: ["باتری ۶۰۰۰", "صفحه ۶.۹ اینچی", "شارژ ۳۳ وات"],
    specs: { حافظه: "۱۲۸GB", رم: "۶GB", باتری: "۶۰۰۰", نمایش: "۶.۹ اینچ" },
  },
  {
    id: 18,
    imageKey: "huawei-pura-70-ultra",
    name: "گوشی موبایل هواوی Pura 70 Ultra",
    shortName: "پورا ۷۰ اولترا",
    category: "mobile",
    brand: "huawei",
    price: 145000000,
    oldPrice: 159000000,
    rating: 4.7,
    reviewCount: 56,
    stock: 3,
    isNew: true,
    isSpecialSale: true,
    isFeatured: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی", "سفید"],
    warranty: "۱۸ ماه گارانتی",
    seller: "بلو مارکت",
    desc: "پرچمدار هواوی با دوربین Retractable.",
    highlights: ["دوربین کشویی", "صفحه ۶.۸ اینچی", "شارژ ۱۰۰ وات"],
    specs: { حافظه: "۵۱۲GB", رم: "۱۶GB", باتری: "۵۲۰۰", نمایش: "۶.۸ اینچ" },
  },
  {
    id: 19,
    imageKey: "huawei-pura-70-pro",
    name: "گوشی موبایل هواوی Pura 70 Pro",
    shortName: "پورا ۷۰ پرو",
    category: "mobile",
    brand: "huawei",
    price: 98000000,
    oldPrice: null,
    rating: 4.6,
    reviewCount: 42,
    stock: 5,
    isNew: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی", "سبز"],
    warranty: "۱۸ ماه گارانتی",
    seller: "دیجی‌کالا",
    desc: "هواوی Pura 70 Pro با دوربین پیشرفته.",
    highlights: ["دوربین ۵۰MP", "صفحه ۶.۸ اینچی", "شارژ ۱۰۰ وات"],
    specs: { حافظه: "۲۵۶GB", رم: "۱۲GB", باتری: "۵۰۵۰", نمایش: "۶.۸ اینچ" },
  },
  {
    id: 20,
    imageKey: "huawei-nova-12",
    name: "گوشی موبایل هواوی Nova 12",
    shortName: "نوا ۱۲",
    category: "mobile",
    brand: "huawei",
    price: 30800000,
    oldPrice: null,
    rating: 4.0,
    reviewCount: 42,
    stock: 18,
    isNew: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی", "آبی"],
    warranty: "۱۸ ماه گارانتی",
    seller: "ترب",
    desc: "گوشی هواوی با طراحی زیبا و دوربین ۵۰ مگاپیکسلی.",
    highlights: ["دوربین ۵۰MP", "صفحه OLED", "شارژ ۶۶ وات"],
    specs: { حافظه: "۲۵۶GB", رم: "۸GB", باتری: "۴۶۰۰", نمایش: "۶.۷ اینچ" },
  },
  {
    id: 21,
    imageKey: "huawei-nova-12i",
    name: "گوشی موبایل هواوی Nova 12i",
    shortName: "نوا ۱۲i",
    category: "mobile",
    brand: "huawei",
    price: 15900000,
    oldPrice: 17900000,
    rating: 4.0,
    reviewCount: 34,
    stock: 22,
    isFeatured: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی", "آبی"],
    warranty: "۱۸ ماه گارانتی",
    seller: "بلو مارکت",
    desc: "گوشی میان‌رده هواوی با صفحه ۶.۷ اینچی.",
    highlights: ["صفحه ۶.۷ اینچی", "باتری ۵۰۰۰", "شارژ ۴۰ وات"],
    specs: { حافظه: "۱۲۸GB", رم: "۸GB", باتری: "۵۰۰۰", نمایش: "۶.۷ اینچ" },
  },
  {
    id: 22,
    imageKey: "huawei-mate-x5",
    name: "گوشی موبایل هواوی Mate X5",
    shortName: "میت X5",
    category: "mobile",
    brand: "huawei",
    price: 289000000,
    oldPrice: null,
    rating: 4.8,
    reviewCount: 23,
    stock: 2,
    isNew: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی", "طلایی"],
    warranty: "۱۸ ماه گارانتی",
    seller: "دیجی‌کالا",
    desc: "گوشی تاشو لوکس هواوی با صفحه انعطاف‌پذیر.",
    highlights: ["تاشو افقی", "صفحه ۷.۸ اینچی", "دوربین ۵۰MP"],
    specs: { حافظه: "۵۱۲GB", رم: "۱۲GB", باتری: "۵۰۶۰", نمایش: "۷.۸ اینچ" },
  },

  // ═══════════════════════════════════════════════════
  //  🆕 موبایل‌های پرچمدار جدید — isDemo: true
  // ═══════════════════════════════════════════════════

  {
    id: 113,
    imageKey: "iphone-17",
    name: "گوشی موبایل اپل iPhone 17 ظرفیت ۲۵۶ گیگابایت",
    shortName: "آیفون ۱۷ ۲۵۶ گیگ",
    category: "mobile",
    brand: "apple",
    price: 395000000,
    oldPrice: null,
    rating: 4.8,
    reviewCount: 0,
    stock: 3,
    isNew: true,
    isDemo: true,
    priceReviewRequired: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی", "سفید", "آبی"],
    warranty: "استعلام گارانتی و رجیستری",
    seller: "بلو مارکت",
    desc: "نسل جدید آیفون با نمایشگر روشن و دوربین پیشرفته. (داده Demo)",
    highlights: ["حافظه ۲۵۶ گیگابایت", "نمایشگر OLED", "دوربین پیشرفته"],
    specs: { حافظه: "۲۵۶GB", رم: "۸GB", نمایش: "۶.۳ اینچ", سیستم: "iOS" },
  },
  {
    id: 114,
    imageKey: "iphone-17-pro-max",
    name: "گوشی موبایل اپل iPhone 17 Pro Max ظرفیت ۲۵۶ گیگابایت",
    shortName: "آیفون ۱۷ پرو مکس",
    category: "mobile",
    brand: "apple",
    price: 601500000,
    oldPrice: null,
    rating: 4.9,
    reviewCount: 0,
    stock: 2,
    isNew: true,
    isBestseller: true,
    isDemo: true,
    priceReviewRequired: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["نارنجی", "نقره‌ای", "آبی"],
    warranty: "استعلام گارانتی و رجیستری",
    seller: "دیجی‌کالا",
    desc: "پرچمدار اپل با نمایشگر بزرگ و دوربین حرفه‌ای. (داده Demo)",
    highlights: ["حافظه ۲۵۶ گیگابایت", "نمایشگر ProMotion", "دوربین حرفه‌ای"],
    specs: { حافظه: "۲۵۶GB", رم: "۱۲GB", نمایش: "۶.۹ اینچ", سیستم: "iOS" },
  },
  {
    id: 115,
    imageKey: "iphone-13",
    name: "گوشی موبایل اپل iPhone 13 ظرفیت ۱۲۸ گیگابایت",
    shortName: "آیفون ۱۳",
    category: "mobile",
    brand: "apple",
    price: 141750000,
    oldPrice: null,
    rating: 4.5,
    reviewCount: 0,
    stock: 5,
    isBestseller: true,
    isDemo: true,
    priceReviewRequired: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی", "سفید", "آبی"],
    warranty: "استعلام وضعیت رجیستری",
    seller: "ترب",
    desc: "آیفون خوش‌دست با نمایشگر OLED و دوربین دوگانه. (داده Demo)",
    highlights: ["نمایشگر OLED", "دوربین دوگانه", "حافظه ۱۲۸ گیگابایت"],
    specs: { حافظه: "۱۲۸GB", نمایش: "۶.۱ اینچ", دوربین: "۱۲MP", سیستم: "iOS" },
  },
  {
    id: 116,
    imageKey: "iphone-14",
    name: "گوشی موبایل اپل iPhone 14 ظرفیت ۱۲۸ گیگابایت",
    shortName: "آیفون ۱۴",
    category: "mobile",
    brand: "apple",
    price: 226000000,
    oldPrice: null,
    rating: 4.6,
    reviewCount: 0,
    stock: 4,
    isDemo: true,
    priceReviewRequired: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی", "بنفش", "آبی"],
    warranty: "استعلام وضعیت رجیستری",
    seller: "بلو مارکت",
    desc: "آیفون نسل چهاردهم با دوربین دوگانه و قابلیت تشخیص تصادف. (داده Demo)",
    highlights: ["دوربین دوگانه", "نمایشگر OLED", "تشخیص تصادف"],
    specs: { حافظه: "۱۲۸GB", نمایش: "۶.۱ اینچ", دوربین: "۱۲MP", سیستم: "iOS" },
  },
  {
    id: 117,
    imageKey: "samsung-s26-ultra",
    name: "گوشی موبایل سامسونگ Galaxy S26 Ultra ظرفیت ۲۵۶ گیگابایت",
    shortName: "گلکسی S26 اولترا",
    category: "mobile",
    brand: "samsung",
    price: 549900000,
    oldPrice: null,
    rating: 4.9,
    reviewCount: 0,
    stock: 2,
    isNew: true,
    isBestseller: true,
    isDemo: true,
    priceReviewRequired: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی", "نقره‌ای", "بنفش"],
    warranty: "۱۸ ماه گارانتی - استعلام",
    seller: "دیجی‌کالا",
    desc: "پرچمدار سری S سامسونگ با نمایشگر بزرگ و دوربین پیشرفته. (داده Demo)",
    highlights: ["نمایشگر Dynamic AMOLED", "قلم S Pen", "دوربین پرچمدار"],
    specs: { حافظه: "۲۵۶GB", رم: "۱۲GB", نمایش: "۶.۹ اینچ", باتری: "۵۰۰۰mAh" },
  },
  {
    id: 118,
    imageKey: "samsung-s24-ultra",
    name: "گوشی موبایل سامسونگ Galaxy S24 Ultra",
    shortName: "گلکسی S24 اولترا",
    category: "mobile",
    brand: "samsung",
    price: 289000000,
    oldPrice: null,
    rating: 4.8,
    reviewCount: 0,
    stock: 4,
    isBestseller: true,
    isDemo: true,
    priceReviewRequired: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی", "خاکستری", "بنفش"],
    warranty: "۱۸ ماه گارانتی - استعلام",
    seller: "ترب",
    desc: "پرچمدار سامسونگ با قلم S Pen و دوربین قدرتمند. (داده Demo)",
    highlights: ["قلم S Pen", "دوربین ۲۰۰ مگاپیکسل", "نمایشگر AMOLED"],
    specs: { حافظه: "۲۵۶GB", رم: "۱۲GB", نمایش: "۶.۸ اینچ", باتری: "۵۰۰۰mAh" },
  },
  {
    id: 119,
    imageKey: "samsung-s23",
    name: "گوشی موبایل سامسونگ Galaxy S23",
    shortName: "گلکسی S23",
    category: "mobile",
    brand: "samsung",
    price: 159000000,
    oldPrice: null,
    rating: 4.5,
    reviewCount: 0,
    stock: 4,
    isDemo: true,
    priceReviewRequired: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی", "کرم", "سبز"],
    warranty: "استعلام گارانتی",
    seller: "بلو مارکت",
    desc: "گوشی پرچمدار جمع‌وجور سامسونگ. (داده Demo)",
    highlights: ["نمایشگر Dynamic AMOLED", "دوربین سه‌گانه", "مقاوم در برابر آب"],
    specs: { حافظه: "۲۵۶GB", رم: "۸GB", نمایش: "۶.۱ اینچ", باتری: "۳۹۰۰mAh" },
  },

  // ═══════════════════════════════════════════════════
  //  💻 لپ‌تاپ (۱۵ محصول فعلی + ۳ جدید Dell)
  // ═══════════════════════════════════════════════════

  {
    id: 23,
    imageKey: "rog-strix-scar-18",
    name: "لپ‌تاپ ایسوس ROG Strix Scar 18",
    shortName: "ROG Strix Scar 18",
    category: "laptop",
    brand: "asus",
    price: 289000000,
    oldPrice: null,
    rating: 5.0,
    reviewCount: 18,
    stock: 2,
    isNew: true,
    isSpecialSale: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی"],
    warranty: "۲۴ ماه گارانتی",
    seller: "بلو مارکت",
    desc: "قدرتمندترین لپ‌تاپ گیمینگ ایسوس با RTX 4090.",
    highlights: ["RTX 4090", "Core i9 نسل ۱۴", "صفحه 240Hz"],
    specs: {
      پردازنده: "Intel Core i9-14900HX",
      گرافیک: "RTX 4090 16GB",
      رم: "۳۲GB DDR5",
      حافظه: "۲TB SSD",
      نمایش: "۱۸ اینچ 240Hz",
    },
  },
  {
    id: 24,
    imageKey: "rog-zephyrus-g14",
    name: "لپ‌تاپ ایسوس ROG Zephyrus G14",
    shortName: "ROG Zephyrus G14",
    category: "laptop",
    brand: "asus",
    price: 145000000,
    oldPrice: 159000000,
    rating: 4.8,
    reviewCount: 45,
    stock: 4,
    isNew: true,
    isBestseller: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["خاکستری"],
    warranty: "۲۴ ماه گارانتی",
    seller: "دیجی‌کالا",
    desc: "لپ‌تاپ گیمینگ سبک با RTX 4070 و صفحه OLED.",
    highlights: ["RTX 4070", "Ryzen 9", "صفحه OLED 120Hz"],
    specs: {
      پردازنده: "AMD Ryzen 9 8945HS",
      گرافیک: "RTX 4070 8GB",
      رم: "۱۶GB",
      حافظه: "۱TB SSD",
      نمایش: "۱۴ اینچ OLED",
    },
  },
  {
    id: 25,
    imageKey: "asus-tuf-f16",
    name: "لپ‌تاپ ایسوس TUF Gaming F16",
    shortName: "ایسوس TUF F16",
    category: "laptop",
    brand: "asus",
    price: 99900000,
    oldPrice: null,
    rating: 4.8,
    reviewCount: 42,
    stock: 6,
    isBestseller: true,
    isFeatured: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی"],
    warranty: "۲۴ ماه گارانتی",
    seller: "ترب",
    desc: "لپ‌تاپ گیمینگ با نسل ۱۳ اینتل و RTX 4050.",
    highlights: ["Core i7", "RTX 4050", "رم ۱۶GB DDR5"],
    specs: {
      پردازنده: "Intel Core i7-13620H",
      گرافیک: "RTX 4050 6GB",
      رم: "۱۶GB DDR5",
      حافظه: "۵۱۲GB SSD",
      نمایش: "۱۶ اینچ 144Hz",
    },
  },
  {
    id: 26,
    imageKey: "asus-vivobook-16x",
    name: "لپ‌تاپ ایسوس Vivobook 16X",
    shortName: "ایسوس Vivobook 16X",
    category: "laptop",
    brand: "asus",
    price: 124000000,
    oldPrice: null,
    rating: 4.5,
    reviewCount: 15,
    stock: 5,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["نقره‌ای"],
    warranty: "۲۴ ماه گارانتی",
    seller: "بلو مارکت",
    desc: "لپ‌تاپ همه‌کاره با صفحه ۱۶ اینچی.",
    highlights: ["صفحه ۱۶ اینچ", "Core i5", "رم ۱۶GB"],
    specs: {
      پردازنده: "Intel Core i5",
      گرافیک: "RTX 3050",
      رم: "۱۶GB",
      حافظه: "۵۱۲GB SSD",
      نمایش: "۱۶ اینچ",
    },
  },
  {
    id: 27,
    imageKey: "asus-zenbook-14",
    name: "لپ‌تاپ ایسوس Zenbook 14 OLED",
    shortName: "ایسوس Zenbook 14",
    category: "laptop",
    brand: "asus",
    price: 89000000,
    oldPrice: 95000000,
    rating: 4.7,
    reviewCount: 28,
    stock: 7,
    isNew: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["نقره‌ای", "آبی"],
    warranty: "۲۴ ماه گارانتی",
    seller: "دیجی‌کالا",
    desc: "لپ‌تاپ اولترابوک با صفحه OLED.",
    highlights: ["صفحه OLED", "Core i7", "وزن ۱.۲kg"],
    specs: {
      پردازنده: "Intel Core i7-1360P",
      گرافیک: "Intel Iris Xe",
      رم: "۱۶GB",
      حافظه: "۱TB SSD",
      نمایش: "۱۴ اینچ OLED",
    },
  },
  {
    id: 28,
    imageKey: "hp-spectre-x360",
    name: "لپ‌تاپ اچ‌پی Spectre x360",
    shortName: "HP Spectre x360",
    category: "laptop",
    brand: "hp",
    price: 159000000,
    oldPrice: null,
    rating: 4.8,
    reviewCount: 22,
    stock: 3,
    isNew: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["نقره‌ای"],
    warranty: "۲۴ ماه گارانتی",
    seller: "ترب",
    desc: "لپ‌تاپ لوکس با صفحه لمسی و قابلیت چرخش.",
    highlights: ["صفحه لمسی", "چرخش ۳۶۰", "Core i7"],
    specs: {
      پردازنده: "Intel Core i7-1355U",
      گرافیک: "Intel Iris Xe",
      رم: "۱۶GB",
      حافظه: "۱TB SSD",
      نمایش: "۱۴ اینچ لمسی",
    },
  },
  {
    id: 29,
    imageKey: "hp-envy-15",
    name: "لپ‌تاپ اچ‌پی Envy 15",
    shortName: "HP Envy 15",
    category: "laptop",
    brand: "hp",
    price: 79900000,
    oldPrice: null,
    rating: 4.5,
    reviewCount: 34,
    stock: 8,
    isBestseller: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["نقره‌ای"],
    warranty: "۲۴ ماه گارانتی",
    seller: "بلو مارکت",
    desc: "لپ‌تاپ حرفه‌ای اچ‌پی با صفحه ۱۵.۶ اینچی.",
    highlights: ["Core i7", "صفحه ۱۵.۶", "رم ۱۶GB"],
    specs: {
      پردازنده: "Intel Core i7-1355U",
      گرافیک: "RTX 2050",
      رم: "۱۶GB",
      حافظه: "۵۱۲GB SSD",
      نمایش: "۱۵.۶ اینچ",
    },
  },
  {
    id: 30,
    imageKey: "hp-pavilion-15",
    name: "لپ‌تاپ اچ‌پی Pavilion 15",
    shortName: "اچ‌پی Pavilion 15",
    category: "laptop",
    brand: "hp",
    price: 38900000,
    oldPrice: 42900000,
    rating: 4.3,
    reviewCount: 56,
    stock: 12,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["نقره‌ای"],
    warranty: "۲۴ ماه گارانتی",
    seller: "دیجی‌کالا",
    desc: "لپ‌تاپ اداری و دانشجویی با قیمت مناسب.",
    highlights: ["Core i5", "رم ۸GB", "صفحه ۱۵.۶"],
    specs: {
      پردازنده: "Intel Core i5-1235U",
      گرافیک: "Intel Iris Xe",
      رم: "۸GB",
      حافظه: "۵۱۲GB SSD",
      نمایش: "۱۵.۶ اینچ",
    },
  },
  {
    id: 31,
    imageKey: "hp-victus-16",
    name: "لپ‌تاپ اچ‌پی Victus 16",
    shortName: "HP Victus 16",
    category: "laptop",
    brand: "hp",
    price: 74900000,
    oldPrice: null,
    rating: 4.6,
    reviewCount: 42,
    stock: 6,
    isBestseller: true,
    isFeatured: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی"],
    warranty: "۲۴ ماه گارانتی",
    seller: "ترب",
    desc: "لپ‌تاپ گیمینگ اقتصادی اچ‌پی.",
    highlights: ["RTX 3050", "Ryzen 5", "صفحه 144Hz"],
    specs: {
      پردازنده: "AMD Ryzen 5 7640HS",
      گرافیک: "RTX 3050 6GB",
      رم: "۱۶GB",
      حافظه: "۵۱۲GB SSD",
      نمایش: "۱۶ اینچ 144Hz",
    },
  },
  {
    id: 32,
    imageKey: "lenovo-legion-pro-5",
    name: "لپ‌تاپ لنوو Legion Pro 5",
    shortName: "Lenovo Legion Pro 5",
    category: "laptop",
    brand: "lenovo",
    price: 165000000,
    oldPrice: null,
    rating: 4.9,
    reviewCount: 25,
    stock: 3,
    isNew: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی"],
    warranty: "۲۴ ماه گارانتی",
    seller: "بلو مارکت",
    desc: "لپ‌تاپ گیمینگ قدرتمند لنوو.",
    highlights: ["RTX 4070", "Ryzen 7", "صفحه ۱۶۵Hz"],
    specs: {
      پردازنده: "AMD Ryzen 7 7745HX",
      گرافیک: "RTX 4070 8GB",
      رم: "۱۶GB",
      حافظه: "۱TB SSD",
      نمایش: "۱۶ اینچ ۱۶۵Hz",
    },
  },
  {
    id: 33,
    imageKey: "lenovo-x1-carbon",
    name: "لپ‌تاپ لنوو ThinkPad X1 Carbon",
    shortName: "لنوو X1 Carbon",
    category: "laptop",
    brand: "lenovo",
    price: 119000000,
    oldPrice: 139000000,
    rating: 4.7,
    reviewCount: 25,
    stock: 5,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی"],
    warranty: "۳۶ ماه گارانتی",
    seller: "دیجی‌کالا",
    desc: "لپ‌تاپ تجاری فوق سبک با بدنه کربنی.",
    highlights: ["بدنه کربن", "وزن ۱.۱۲kg", "OLED"],
    specs: {
      پردازنده: "Intel Core i7-1365U",
      گرافیک: "Intel Iris Xe",
      رم: "۱۶GB",
      حافظه: "۱TB SSD",
      نمایش: "۱۴ اینچ OLED",
    },
  },
  {
    id: 34,
    imageKey: "lenovo-ideapad-3",
    name: "لپ‌تاپ لنوو IdeaPad Slim 3",
    shortName: "Lenovo IdeaPad 3",
    category: "laptop",
    brand: "lenovo",
    price: 28900000,
    oldPrice: null,
    rating: 4.2,
    reviewCount: 78,
    stock: 15,
    isBestseller: true,
    isSpecialSale: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["خاکستری"],
    warranty: "۱۲ ماه گارانتی",
    seller: "ترب",
    desc: "لپ‌تاپ دانشجویی با قیمت مناسب.",
    highlights: ["Core i5", "رم ۸GB", "صفحه ۱۵.۶"],
    specs: {
      پردازنده: "Intel Core i5-1235U",
      گرافیک: "Intel UHD",
      رم: "۸GB",
      حافظه: "۲۵۶GB SSD",
      نمایش: "۱۵.۶ اینچ",
    },
  },
  {
    id: 35,
    imageKey: "macbook-pro-16-m3-max",
    name: "مک‌بوک پرو 16 اینچ M3 Max",
    shortName: "مک‌بوک پرو ۱۶",
    category: "laptop",
    brand: "apple",
    price: 385000000,
    oldPrice: null,
    rating: 5.0,
    reviewCount: 15,
    stock: 2,
    isNew: true,
    isBestseller: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["خاکستری", "نقره‌ای"],
    warranty: "۱۲ ماه گارانتی آواژنگ",
    seller: "بلو مارکت",
    desc: "قدرتمندترین مک‌بوک با تراشه M3 Max.",
    highlights: ["M3 Max", "صفحه XDR", "۴۰ ساعت باتری"],
    specs: {
      پردازنده: "Apple M3 Max",
      رم: "۳۶GB",
      حافظه: "۱TB SSD",
      نمایش: "۱۶.۲ اینچ XDR",
    },
  },
  {
    id: 36,
    imageKey: "macbook-pro-14-m3-pro",
    name: "مک‌بوک پرو 14 اینچ M3 Pro",
    shortName: "مک‌بوک پرو ۱۴",
    category: "laptop",
    brand: "apple",
    price: 245000000,
    oldPrice: 269000000,
    rating: 5.0,
    reviewCount: 34,
    stock: 3,
    isNew: true,
    isBestseller: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["خاکستری", "نقره‌ای"],
    warranty: "۱۲ ماه گارانتی آواژنگ",
    seller: "دیجی‌کالا",
    desc: "مک‌بوک پرو با تراشه M3 Pro و صفحه XDR.",
    highlights: ["M3 Pro", "صفحه XDR", "Touch ID"],
    specs: {
      پردازنده: "Apple M3 Pro",
      رم: "۱۸GB",
      حافظه: "۵۱۲GB SSD",
      نمایش: "۱۴.۲ اینچ XDR",
    },
  },
  {
    id: 37,
    imageKey: "macbook-air-15-m3",
    name: "مک‌بوک ایر 15 اینچ M3",
    shortName: "مک‌بوک ایر ۱۵",
    category: "laptop",
    brand: "apple",
    price: 129000000,
    oldPrice: null,
    rating: 4.8,
    reviewCount: 45,
    stock: 6,
    isNew: true,
    isBestseller: true,
    isFeatured: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["نقره‌ای", "خاکستری", "آبی"],
    warranty: "۱۲ ماه گارانتی آواژنگ",
    seller: "ترب",
    desc: "مک‌بوک ایر با تراشه M3 و باتری طولانی.",
    highlights: ["تراشه M3", "صفحه ۱۵.۳", "۱۸ ساعت باتری"],
    specs: {
      پردازنده: "Apple M3",
      رم: "۸GB",
      حافظه: "۲۵۶GB SSD",
      نمایش: "۱۵.۳ اینچ",
    },
  },

  // ═══════════════════════════════════════════════════
  //  🆕 لپ‌تاپ‌های پرچمدار جدید — isDemo: true
  // ═══════════════════════════════════════════════════

  {
    id: 120,
    imageKey: "macbook-air-15-m3",
    name: "لپ‌تاپ اپل MacBook Air 15 اینچ",
    shortName: "مک‌بوک ایر ۱۵ (M3)",
    category: "laptop",
    brand: "apple",
    price: 189000000,
    oldPrice: null,
    rating: 4.8,
    reviewCount: 0,
    stock: 3,
    isNew: true,
    isDemo: true,
    priceReviewRequired: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["نقره‌ای", "استارلایت"],
    warranty: "استعلام گارانتی",
    seller: "دیجی‌کالا",
    desc: "لپ‌تاپ سبک اپل با macOS و شارژدهی مناسب. (داده Demo)",
    highlights: ["نمایشگر ۱۵ اینچی", "سیستم‌عامل macOS", "طراحی سبک"],
    specs: {
      پردازنده: "Apple Silicon",
      نمایش: "۱۵.۳ اینچ",
      سیستم: "macOS",
      حافظه: "۲۵۶GB SSD",
    },
  },
  {
    id: 121,
    imageKey: "macbook-pro-14-m3-pro",
    name: "لپ‌تاپ اپل MacBook Pro 14 اینچ",
    shortName: "مک‌بوک پرو ۱۴ (M3 Pro)",
    category: "laptop",
    brand: "apple",
    price: 289000000,
    oldPrice: null,
    rating: 4.9,
    reviewCount: 0,
    stock: 2,
    isBestseller: true,
    isDemo: true,
    priceReviewRequired: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی", "نقره‌ای"],
    warranty: "استعلام گارانتی",
    seller: "ترب",
    desc: "مک‌بوک حرفه‌ای برای تدوین، طراحی و برنامه‌نویسی. (داده Demo)",
    highlights: ["نمایشگر XDR", "عملکرد حرفه‌ای", "سیستم‌عامل macOS"],
    specs: {
      پردازنده: "Apple Silicon Pro",
      نمایش: "۱۴.۲ اینچ",
      سیستم: "macOS",
      حافظه: "۵۱۲GB SSD",
    },
  },
  {
    id: 122,
    imageKey: "dell-inspiron-15",
    name: "لپ‌تاپ دل Dell Inspiron 15",
    shortName: "لپ‌تاپ دل اینسپایرون ۱۵",
    category: "laptop",
    brand: "dell",
    price: 84900000,
    oldPrice: null,
    rating: 4.4,
    reviewCount: 0,
    stock: 5,
    isNew: true,
    isDemo: true,
    priceReviewRequired: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["نقره‌ای"],
    warranty: "استعلام کانفیگ و گارانتی",
    seller: "بلو مارکت",
    desc: "لپ‌تاپ دل برای کاربری روزمره و اداری. (داده Demo)",
    highlights: ["نمایشگر ۱۵.۶ اینچی", "مناسب کار اداری", "کانفیگ‌های مختلف"],
    specs: { برند: "Dell", نمایش: "۱۵.۶ اینچ", سیستم: "Windows", کاربری: "اداری" },
  },
  {
    id: 123,
    imageKey: "dell-g15",
    name: "لپ‌تاپ گیمینگ دل Dell G15",
    shortName: "لپ‌تاپ دل G15",
    category: "laptop",
    brand: "dell",
    price: 149000000,
    oldPrice: null,
    rating: 4.6,
    reviewCount: 0,
    stock: 2,
    isDemo: true,
    priceReviewRequired: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی"],
    warranty: "استعلام کانفیگ و گارانتی",
    seller: "دیجی‌کالا",
    desc: "لپ‌تاپ گیمینگ دل برای بازی و کارهای گرافیکی. (داده Demo)",
    highlights: ["مناسب گیمینگ", "خنک‌کننده قدرتمند", "نمایشگر سریع"],
    specs: { برند: "Dell", نمایش: "۱۵.۶ اینچ", سیستم: "Windows", کاربری: "گیمینگ" },
  },

  // ═══════════════════════════════════════════════════
  //  📱 تبلت (۱۲ فعلی + ۲ جدید = ۱۴)
  // ═══════════════════════════════════════════════════

  {
    id: 38,
    imageKey: "ipad-pro-12-9-m4",
    name: "تبلت اپل آیپد پرو 12.9 M4",
    shortName: "آیپد پرو ۱۲.۹ M4",
    category: "tablet",
    brand: "apple",
    price: 219900000,
    oldPrice: null,
    rating: 5.0,
    reviewCount: 42,
    stock: 4,
    isNew: true,
    isBestseller: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["خاکستری", "نقره‌ای"],
    warranty: "۱۲ ماه گارانتی آواژنگ",
    seller: "بلو مارکت",
    desc: "قدرتمندترین آیپد با تراشه M4 و صفحه XDR.",
    highlights: ["تراشه M4", "صفحه XDR", "Ultra Retina"],
    specs: { پردازنده: "Apple M4", حافظه: "۲۵۶GB", نمایش: "۱۲.۹ اینچ XDR", باتری: "تا ۱۰ ساعت" },
  },
  {
    id: 39,
    imageKey: "ipad-pro-11-m4",
    name: "تبلت اپل آیپد پرو 11 M4",
    shortName: "آیپد پرو ۱۱ M4",
    category: "tablet",
    brand: "apple",
    price: 165000000,
    oldPrice: 179000000,
    rating: 4.9,
    reviewCount: 34,
    stock: 6,
    isNew: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["خاکستری", "نقره‌ای"],
    warranty: "۱۲ ماه گارانتی آواژنگ",
    seller: "دیجی‌کالا",
    desc: "آیپد پرو با تراشه M4 و صفحه ۱۱ اینچی.",
    highlights: ["تراشه M4", "صفحه ۱۱ اینچ", "Apple Pencil"],
    specs: { پردازنده: "Apple M4", حافظه: "۲۵۶GB", نمایش: "۱۱ اینچ", باتری: "تا ۱۰ ساعت" },
  },
  {
    id: 40,
    imageKey: "ipad-air-11-m2",
    name: "تبلت اپل آیپد Air 11 M2",
    shortName: "آیپد ایر ۱۱",
    category: "tablet",
    brand: "apple",
    price: 85000000,
    oldPrice: null,
    rating: 4.7,
    reviewCount: 45,
    stock: 8,
    isBestseller: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["خاکستری", "آبی", "صورتی"],
    warranty: "۱۲ ماه گارانتی آواژنگ",
    seller: "ترب",
    desc: "آیپد ایر با تراشه M2.",
    highlights: ["تراشه M2", "صفحه ۱۱ اینچ", "USB-C"],
    specs: { پردازنده: "Apple M2", حافظه: "۱۲۸GB", نمایش: "۱۱ اینچ", باتری: "تا ۱۰ ساعت" },
  },
  {
    id: 41,
    imageKey: "ipad-10-9",
    name: "تبلت اپل آیپد 10.9",
    shortName: "آیپد ۱۰.۹",
    category: "tablet",
    brand: "apple",
    price: 35000000,
    oldPrice: null,
    rating: 4.5,
    reviewCount: 98,
    stock: 12,
    isBestseller: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["نقره‌ای", "آبی", "زرد"],
    warranty: "۱۲ ماه گارانتی آواژنگ",
    seller: "بلو مارکت",
    desc: "آیپد اقتصادی اپل با صفحه ۱۰.۹ اینچی.",
    highlights: ["تراشه A14", "صفحه ۱۰.۹", "USB-C"],
    specs: { پردازنده: "Apple A14", حافظه: "۶۴GB", نمایش: "۱۰.۹ اینچ", باتری: "تا ۱۰ ساعت" },
  },
  {
    id: 42,
    imageKey: "samsung-tab-s10-ultra",
    name: "تبلت سامسونگ Galaxy Tab S10 Ultra",
    shortName: "گلکسی تب S10 Ultra",
    category: "tablet",
    brand: "samsung",
    price: 189000000,
    oldPrice: 209000000,
    rating: 4.9,
    reviewCount: 28,
    stock: 3,
    isNew: true,
    isBestseller: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["خاکستری", "بژ"],
    warranty: "۱۸ ماه گارانتی",
    seller: "دیجی‌کالا",
    desc: "پرچمدار تبلت سامسونگ با صفحه ۱۴.۶ اینچی.",
    highlights: ["صفحه ۱۴.۶", "قلم S Pen", "IP68"],
    specs: { پردازنده: "Snapdragon 8 Gen 3", حافظه: "۵۱۲GB", رم: "۱۲GB", نمایش: "۱۴.۶ اینچ AMOLED" },
  },
  {
    id: 43,
    imageKey: "samsung-tab-s10-plus",
    name: "تبلت سامسونگ Galaxy Tab S10+",
    shortName: "گلکسی تب S10+",
    category: "tablet",
    brand: "samsung",
    price: 139000000,
    oldPrice: null,
    rating: 4.8,
    reviewCount: 34,
    stock: 5,
    isNew: true,
    isFeatured: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["خاکستری", "بژ"],
    warranty: "۱۸ ماه گارانتی",
    seller: "ترب",
    desc: "تبلت پرچمدار سامسونگ با صفحه ۱۲.۴ اینچی.",
    highlights: ["صفحه ۱۲.۴", "قلم S Pen", "IP68"],
    specs: { پردازنده: "Snapdragon 8 Gen 3", حافظه: "۲۵۶GB", رم: "۱۲GB", نمایش: "۱۲.۴ اینچ AMOLED" },
  },
  {
    id: 44,
    imageKey: "samsung-tab-s9-fe",
    name: "تبلت سامسونگ Galaxy Tab S9 FE",
    shortName: "گلکسی تب S9 FE",
    category: "tablet",
    brand: "samsung",
    price: 45900000,
    oldPrice: null,
    rating: 4.5,
    reviewCount: 67,
    stock: 10,
    isBestseller: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["خاکستری", "نعنایی"],
    warranty: "۱۸ ماه گارانتی",
    seller: "بلو مارکت",
    desc: "تبلت میان‌رده سامسونگ با قلم S Pen.",
    highlights: ["قلم S Pen", "صفحه ۱۰.۹", "IP68"],
    specs: { پردازنده: "Exynos 1380", حافظه: "۱۲۸GB", رم: "۶GB", نمایش: "۱۰.۹ اینچ" },
  },
  {
    id: 45,
    imageKey: "samsung-tab-a9-plus",
    name: "تبلت سامسونگ Galaxy Tab A9+",
    shortName: "گلکسی تب A9+",
    category: "tablet",
    brand: "samsung",
    price: 18900000,
    oldPrice: 22900000,
    rating: 4.2,
    reviewCount: 78,
    stock: 15,
    isBestseller: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["خاکستری", "نقره‌ای"],
    warranty: "۱۸ ماه گارانتی",
    seller: "دیجی‌کالا",
    desc: "تبلت اقتصادی سامسونگ با صفحه ۱۱ اینچی.",
    highlights: ["صفحه ۱۱", "۴ اسپیکر", "باتری ۷۰۴۰"],
    specs: { پردازنده: "Snapdragon 695", حافظه: "۱۲۸GB", رم: "۸GB", نمایش: "۱۱ اینچ" },
  },
  {
    id: 46,
    imageKey: "samsung-tab-a9",
    name: "تبلت سامسونگ Galaxy Tab A9",
    shortName: "گلکسی تب A9",
    category: "tablet",
    brand: "samsung",
    price: 12900000,
    oldPrice: null,
    rating: 4.0,
    reviewCount: 45,
    stock: 20,
    isBestseller: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["خاکستری", "نقره‌ای"],
    warranty: "۱۸ ماه گارانتی",
    seller: "ترب",
    desc: "تبلت اقتصادی ۸.۷ اینچی سامسونگ.",
    highlights: ["صفحه ۸.۷", "باتری ۵۱۰۰", "ارزان"],
    specs: { پردازنده: "MediaTek Helio G99", حافظه: "۶۴GB", رم: "۴GB", نمایش: "۸.۷ اینچ" },
  },
  {
    id: 47,
    imageKey: "huawei-matepad-pro-13-2",
    name: "تبلت هوآوی MatePad Pro 13.2",
    shortName: "میت‌پد پرو ۱۳.۲",
    category: "tablet",
    brand: "huawei",
    price: 145000000,
    oldPrice: null,
    rating: 4.8,
    reviewCount: 22,
    stock: 4,
    isNew: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["خاکستری", "طلایی"],
    warranty: "۱۸ ماه گارانتی",
    seller: "بلو مارکت",
    desc: "تبلت پرچمدار هوآوی با صفحه ۱۳.۲ اینچی.",
    highlights: ["صفحه ۱۳.۲", "قلم M-Pencil", "OLED"],
    specs: { پردازنده: "Kirin 9000s", حافظه: "۵۱۲GB", رم: "۱۲GB", نمایش: "۱۳.۲ اینچ OLED" },
  },
  {
    id: 48,
    imageKey: "huawei-matepad-11-5",
    name: "تبلت هوآوی MatePad 11.5",
    shortName: "میت‌پد ۱۱.۵",
    category: "tablet",
    brand: "huawei",
    price: 35900000,
    oldPrice: 39900000,
    rating: 4.5,
    reviewCount: 45,
    stock: 8,
    isNew: true,
    isSpecialSale: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["خاکستری", "آبی"],
    warranty: "۱۸ ماه گارانتی",
    seller: "دیجی‌کالا",
    desc: "تبلت هوآوی با صفحه ۱۱.۵ اینچی.",
    highlights: ["صفحه ۱۱.۵", "۴ اسپیکر", "باتری ۷۷۰۰"],
    specs: { پردازنده: "Snapdragon 7 Gen 1", حافظه: "۱۲۸GB", رم: "۸GB", نمایش: "۱۱.۵ اینچ" },
  },
  {
    id: 49,
    imageKey: "huawei-matepad-11",
    name: "تبلت هوآوی MatePad 11",
    shortName: "میت‌پد ۱۱",
    category: "tablet",
    brand: "huawei",
    price: 125000000,
    oldPrice: null,
    rating: 4.5,
    reviewCount: 32,
    stock: 6,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["خاکستری", "آبی"],
    warranty: "۱۸ ماه گارانتی",
    seller: "ترب",
    desc: "تبلت هوآوی با صفحه ۱۱ اینچی و قلم M-Pencil.",
    highlights: ["صفحه 11 اینچ 120Hz", "قلم M-Pencil", "۴ اسپیکر"],
    specs: { پردازنده: "Snapdragon 865", حافظه: "۲۵۶GB", رم: "۸GB", نمایش: "۱۱ اینچ 120Hz" },
  },
  // 🆕 تبلت جدید
  {
    id: 159,
    imageKey: "ipad-air-11-m2",
    name: "آیپد ایر 11 M2 128GB Wi-Fi",
    shortName: "آیپد ایر ۱۱ (M2) 128GB",
    category: "tablet",
    brand: "apple",
    price: 79900000,
    oldPrice: 89900000,
    rating: 4.7,
    reviewCount: 56,
    stock: 8,
    isNew: true,
    isBestseller: true,
    isDemo: true,
    priceReviewRequired: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["خاکستری", "آبی"],
    warranty: "۱۲ ماه گارانتی آواژنگ - استعلام",
    seller: "بلو مارکت",
    desc: "آیپد ایر با تراشه M2 و صفحه ۱۱ اینچی. (داده Demo)",
    highlights: ["M2", "۱۱ اینچ", "USB-C"],
    specs: { پردازنده: "Apple M2", حافظه: "۱۲۸GB", نمایش: "۱۱ اینچ" },
  },
  {
    id: 160,
    imageKey: "samsung-tab-s10-plus",
    name: "تبلت سامسونگ Galaxy Tab S10+ 256GB",
    shortName: "گلکسی تب S10+ ۲۵۶",
    category: "tablet",
    brand: "samsung",
    price: 129000000,
    oldPrice: 139000000,
    rating: 4.8,
    reviewCount: 28,
    stock: 4,
    isNew: true,
    isDemo: true,
    priceReviewRequired: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["خاکستری"],
    warranty: "۱۸ ماه گارانتی - استعلام",
    seller: "دیجی‌کالا",
    desc: "تبلت سامسونگ با قلم S Pen و صفحه ۱۲.۴ اینچی. (داده Demo)",
    highlights: ["S Pen", "۱۲.۴ اینچ", "IP68"],
    specs: { پردازنده: "Snapdragon 8 Gen 3", حافظه: "۲۵۶GB", نمایش: "۱۲.۴ اینچ" },
  },

  // ═══════════════════════════════════════════════════
  //  ⌚ ساعت هوشمند (۱۲ فعلی + ۳ جدید = ۱۵)
  // ═══════════════════════════════════════════════════

  {
    id: 50,
    imageKey: "apple-watch-ultra-2",
    name: "ساعت هوشمند اپل واچ Ultra 2",
    shortName: "اپل واچ اولترا ۲",
    category: "watch",
    brand: "apple",
    price: 58900000,
    oldPrice: null,
    rating: 4.9,
    reviewCount: 45,
    stock: 4,
    isNew: true,
    isBestseller: true,
    isFeatured: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["تیتانیوم"],
    warranty: "۱۲ ماه گارانتی آواژنگ",
    seller: "بلو مارکت",
    desc: "اپل واچ اولترا ۲ برای ورزش‌های حرفه‌ای.",
    highlights: ["بدنه تیتانیومی", "GPS دقیق", "ضدآب ۱۰۰ متر"],
    specs: { نمایش: "۱.۹ اینچ", باتری: "تا ۳۶ ساعت", ضدآب: "۱۰۰ متر" },
  },
  {
    id: 51,
    imageKey: "apple-watch-series-10",
    name: "ساعت هوشمند اپل واچ سری 10",
    shortName: "اپل واچ سری ۱۰",
    category: "watch",
    brand: "apple",
    price: 35900000,
    oldPrice: 38900000,
    rating: 4.9,
    reviewCount: 65,
    stock: 8,
    isNew: true,
    isBestseller: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی", "نقره‌ای", "طلایی"],
    warranty: "۱۲ ماه گارانتی آواژنگ",
    seller: "دیجی‌کالا",
    desc: "اپل واچ سری ۱۰ با تراشه S10 و صفحه بزرگ‌تر.",
    highlights: ["تراشه S10", "صفحه ۱.۹", "شارژ سریع"],
    specs: { نمایش: "۱.۹ اینچ", باتری: "تا ۱۸ ساعت", ضدآب: "۵۰ متر" },
  },
  {
    id: 52,
    imageKey: "apple-watch-se",
    name: "ساعت هوشمند اپل واچ SE",
    shortName: "اپل واچ SE",
    category: "watch",
    brand: "apple",
    price: 24498400,
    oldPrice: null,
    rating: 4.5,
    reviewCount: 88,
    stock: 10,
    isNew: true,
    isBestseller: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی", "نقره‌ای", "طلایی"],
    warranty: "۱۲ ماه گارانتی آواژنگ",
    seller: "ترب",
    desc: "اپل واچ SE نسل دوم با تراشه S8.",
    highlights: ["تشخیص تصادف", "پایش ضربان قلب", "ضدآب ۵۰ متر"],
    specs: { نمایش: "۱.۶۹ اینچ", باتری: "تا ۱۸ ساعت", ضدآب: "۵۰ متر" },
  },
  {
    id: 53,
    imageKey: "samsung-watch-ultra",
    name: "ساعت هوشمند سامسونگ Galaxy Watch Ultra",
    shortName: "گلکسی واچ اولترا",
    category: "watch",
    brand: "samsung",
    price: 41900000,
    oldPrice: null,
    rating: 4.8,
    reviewCount: 34,
    stock: 5,
    isNew: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["تیتانیوم"],
    warranty: "۱۸ ماه گارانتی",
    seller: "بلو مارکت",
    desc: "گلکسی واچ اولترا برای ورزش‌های حرفه‌ای.",
    highlights: ["بدنه تیتانیومی", "Wear OS", "ضدآب ۱۰ATM"],
    specs: { نمایش: "۱.۵ اینچ", باتری: "تا ۱۰۰ ساعت", ضدآب: "۱۰ATM" },
  },
  {
    id: 54,
    imageKey: "samsung-watch-7",
    name: "ساعت هوشمند سامسونگ Galaxy Watch 7",
    shortName: "گلکسی واچ ۷",
    category: "watch",
    brand: "samsung",
    price: 21900000,
    oldPrice: 24900000,
    rating: 4.7,
    reviewCount: 45,
    stock: 8,
    isNew: true,
    isBestseller: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی", "نقره‌ای"],
    warranty: "۱۸ ماه گارانتی",
    seller: "دیجی‌کالا",
    desc: "گلکسی واچ ۷ با سنسور BioActive.",
    highlights: ["BioActive", "Wear OS", "GPS"],
    specs: { نمایش: "۱.۵ اینچ", باتری: "تا ۴۰ ساعت", ضدآب: "۵ATM" },
  },
  {
    id: 55,
    imageKey: "samsung-watch-6-classic",
    name: "ساعت هوشمند سامسونگ Galaxy Watch 6 Classic",
    shortName: "گلکسی واچ ۶ کلاسیک",
    category: "watch",
    brand: "samsung",
    price: 25900000,
    oldPrice: null,
    rating: 4.7,
    reviewCount: 55,
    stock: 6,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی", "نقره‌ای"],
    warranty: "۱۸ ماه گارانتی",
    seller: "ترب",
    desc: "گلکسی واچ ۶ کلاسیک با قاب چرخشی.",
    highlights: ["قاب چرخشی", "Wear OS", "پایش خواب"],
    specs: { نمایش: "۱.۵ اینچ", باتری: "تا ۴۰ ساعت", ضدآب: "۵ATM" },
  },
  {
    id: 56,
    imageKey: "garmin-fenix-7x",
    name: "ساعت هوشمند گارمین Fenix 7X Pro",
    shortName: "گارمین Fenix 7X",
    category: "watch",
    brand: "garmin",
    price: 82900000,
    oldPrice: null,
    rating: 4.9,
    reviewCount: 28,
    stock: 3,
    isNew: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی"],
    warranty: "۲۴ ماه گارانتی",
    seller: "بلو مارکت",
    desc: "ساعت ورزشی حرفه‌ای گارمین با باتری ۳۷ روزه.",
    highlights: ["باتری ۳۷ روز", "GPS چند باند", "نقشه"],
    specs: { نمایش: "۱.۴ اینچ", باتری: "تا ۳۷ روز", ضدآب: "۱۰ATM" },
  },
  {
    id: 57,
    imageKey: "garmin-venu-3",
    name: "ساعت هوشمند گارمین Venu 3",
    shortName: "گارمین Venu 3",
    category: "watch",
    brand: "garmin",
    price: 35900000,
    oldPrice: 39900000,
    rating: 4.7,
    reviewCount: 42,
    stock: 5,
    isNew: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی", "نقره‌ای"],
    warranty: "۲۴ ماه گارانتی",
    seller: "دیجی‌کالا",
    desc: "ساعت ورزشی گارمین با باتری ۱۴ روزه.",
    highlights: ["باتری ۱۴ روز", "GPS", "پایش خواب"],
    specs: { نمایش: "۱.۴ اینچ", باتری: "تا ۱۴ روز", ضدآب: "۵ATM" },
  },
  {
    id: 58,
    imageKey: "garmin-venu-2",
    name: "ساعت هوشمند گارمین Venu 2",
    shortName: "گارمین ونا ۲",
    category: "watch",
    brand: "garmin",
    price: 15999000,
    oldPrice: null,
    rating: 4.6,
    reviewCount: 42,
    stock: 5,
    isFeatured: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی", "نقره‌ای"],
    warranty: "۲۴ ماه گارانتی",
    seller: "ترب",
    desc: "ساعت ورزشی گارمین با GPS دقیق.",
    highlights: ["GPS دقیق", "باتری ۱۱ روز", "پایش سلامت"],
    specs: { نمایش: "۱.۳ اینچ", باتری: "تا ۱۱ روز", ضدآب: "۵ATM" },
  },
  {
    id: 59,
    imageKey: "amazfit-gtr-4",
    name: "ساعت هوشمند امیزفیت GTR 4",
    shortName: "امیزفیت GTR 4",
    category: "watch",
    brand: "amazfit",
    price: 8990000,
    oldPrice: null,
    rating: 4.3,
    reviewCount: 78,
    stock: 12,
    isNew: true,
    isBestseller: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی", "نقره‌ای"],
    warranty: "۱۲ ماه گارانتی",
    seller: "بلو مارکت",
    desc: "ساعت هوشمند با باتری ۱۴ روزه.",
    highlights: ["باتری ۱۴ روز", "GPS دو باند", "۱۵۰+ ورزش"],
    specs: { نمایش: "۱.۴۳ اینچ", باتری: "تا ۱۴ روز", ضدآب: "۵ATM" },
  },
  {
    id: 60,
    imageKey: "amazfit-t-rex-2",
    name: "ساعت هوشمند امیزفیت T-Rex 2",
    shortName: "امیزفیت T-Rex 2",
    category: "watch",
    brand: "amazfit",
    price: 12900000,
    oldPrice: 14900000,
    rating: 4.6,
    reviewCount: 56,
    stock: 8,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی"],
    warranty: "۱۲ ماه گارانتی",
    seller: "دیجی‌کالا",
    desc: "ساعت ورزشی مقاوم امیزفیت.",
    highlights: ["ضدضربه", "باتری ۲۴ روز", "IP69K"],
    specs: { نمایش: "۱.۳۹ اینچ", باتری: "تا ۲۴ روز", ضدآب: "۱۰ATM" },
  },
  {
    id: 61,
    imageKey: "amazfit-gts-4-mini",
    name: "ساعت هوشمند امیزفیت GTS 4 Mini",
    shortName: "امیزفیت GTS 4 Mini",
    category: "watch",
    brand: "amazfit",
    price: 5490000,
    oldPrice: null,
    rating: 4.2,
    reviewCount: 89,
    stock: 15,
    isBestseller: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی", "صورتی"],
    warranty: "۱۲ ماه گارانتی",
    seller: "ترب",
    desc: "ساعت هوشمند سبک و ارزان امیزفیت.",
    highlights: ["سبک", "باتری ۱۵ روز", "۱۵۰+ ورزش"],
    specs: { نمایش: "۱.۶۵ اینچ", باتری: "تا ۱۵ روز", ضدآب: "۵ATM" },
  },
  // 🆕 ساعت‌های جدید
  {
    id: 161,
    imageKey: "apple-watch-series-10",
    name: "اپل واچ سری 10 46mm GPS",
    shortName: "اپل واچ سری ۱۰ (46mm)",
    category: "watch",
    brand: "apple",
    price: 37900000,
    oldPrice: 41900000,
    rating: 4.9,
    reviewCount: 78,
    stock: 5,
    isNew: true,
    isBestseller: true,
    isDemo: true,
    priceReviewRequired: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی", "نقره‌ای"],
    warranty: "۱۲ ماه گارانتی آواژنگ - استعلام",
    seller: "ترب",
    desc: "اپل واچ سری ۱۰ با تراشه S10. (داده Demo)",
    highlights: ["S10", "۱.۹ اینچ", "شارژ سریع"],
    specs: { نمایش: "۱.۹ اینچ", باتری: "۱۸ ساعت", ضدآب: "۵۰ متر" },
  },
  {
    id: 162,
    imageKey: "samsung-watch-7",
    name: "گلکسی واچ 7 44mm LTE",
    shortName: "گلکسی واچ ۷ (44mm LTE)",
    category: "watch",
    brand: "samsung",
    price: 23900000,
    oldPrice: 26900000,
    rating: 4.7,
    reviewCount: 52,
    stock: 6,
    isNew: true,
    isBestseller: true,
    isDemo: true,
    priceReviewRequired: true,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    colors: ["مشکی", "نقره‌ای"],
    warranty: "۱۸ ماه گارانتی - استعلام",
    seller: "بلو مارکت",
    desc: "گلکسی واچ ۷ با سنسور BioActive. (داده Demo)",
    highlights: ["BioActive", "Wear OS", "GPS"],
    specs: { نمایش: "۱.۵ اینچ", باتری: "۴۰ ساعت", ضدآب: "۵ATM" },
  },

  // ═══════════════════════════════════════════════════
  //  🎧 هدفون (۱۵ فعلی + ۲ جدید = ۱۷)
  // ═══════════════════════════════════════════════════

  {
    id: 62, imageKey: "sony-wh-1000xm5",
    name: "هدفون سونی WH-1000XM5", shortName: "سونی WH-1000XM5",
    category: "accessory", brand: "sony",
    price: 5837330, oldPrice: null, rating: 4.8, reviewCount: 210, stock: 14,
    isBestseller: true, isSpecialSale: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی", "نقره‌ای"], warranty: "۱۸ ماه گارانتی", seller: "بلو مارکت",
    desc: "بهترین هدفون حذف نویز بازار.",
    highlights: ["حذف نویز", "۳۰ ساعت باتری", "۸ میکروفون"],
    specs: { نوع: "Over-Ear", اتصال: "BT 5.2", باتری: "۳۰ ساعت" },
  },
  {
    id: 63, imageKey: "sony-wf-1000xm5",
    name: "هدفون سونی WF-1000XM5", shortName: "سونی WF-1000XM5",
    category: "accessory", brand: "sony",
    price: 9890000, oldPrice: 11900000, rating: 4.8, reviewCount: 145, stock: 10,
    isNew: true, isBestseller: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی", "نقره‌ای"], warranty: "۱۸ ماه گارانتی", seller: "دیجی‌کالا",
    desc: "بهترین ایرباد سونی با حذف نویز.",
    highlights: ["حذف نویز", "۸ ساعت باتری", "IPX4"],
    specs: { نوع: "In-Ear", اتصال: "BT 5.3", باتری: "۸ ساعت" },
  },
  {
    id: 64, imageKey: "sony-wh-ch720n",
    name: "هدفون سونی WH-CH720N", shortName: "سونی WH-CH720N",
    category: "accessory", brand: "sony",
    price: 2890000, oldPrice: null, rating: 4.5, reviewCount: 178, stock: 25,
    isBestseller: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی", "سفید", "آبی"], warranty: "۱۲ ماه گارانتی", seller: "ترب",
    desc: "هدفون اقتصادی سونی با حذف نویز.",
    highlights: ["حذف نویز", "۳۵ ساعت باتری", "سبک"],
    specs: { نوع: "Over-Ear", اتصال: "BT 5.2", باتری: "۳۵ ساعت" },
  },
  {
    id: 65, imageKey: "airpods-pro-2",
    name: "ایرپاد اپل AirPods Pro 2 USB-C", shortName: "ایرپاد پرو ۲",
    category: "accessory", brand: "apple",
    price: 12500000, oldPrice: null, rating: 4.9, reviewCount: 320, stock: 20,
    isNew: true, isBestseller: true, isFeatured: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["سفید"], warranty: "۱۲ ماه گارانتی آواژنگ", seller: "بلو مارکت",
    desc: "ایرپاد پرو ۲ با تراشه H2 و USB-C.",
    highlights: ["تراشه H2", "حذف نویز", "USB-C"],
    specs: { نوع: "In-Ear", اتصال: "BT 5.3", باتری: "۳۰ ساعت با کیس" },
  },
  {
    id: 66, imageKey: "airpods-4",
    name: "ایرپاد اپل AirPods 4", shortName: "ایرپاد ۴",
    category: "accessory", brand: "apple",
    price: 8900000, oldPrice: 10500000, rating: 4.7, reviewCount: 156, stock: 15,
    isNew: true, isBestseller: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["سفید"], warranty: "۱۲ ماه گارانتی آواژنگ", seller: "دیجی‌کالا",
    desc: "ایرپاد ۴ با طراحی جدید و صدای بهتر.",
    highlights: ["تراشه H2", "صدای فضایی", "USB-C"],
    specs: { نوع: "In-Ear", اتصال: "BT 5.3", باتری: "۳۰ ساعت" },
  },
  {
    id: 67, imageKey: "samsung-buds3-pro",
    name: "هدفون سامسونگ Galaxy Buds3 Pro", shortName: "گلکسی بادز ۳ پرو",
    category: "accessory", brand: "samsung",
    price: 9900000, oldPrice: null, rating: 4.7, reviewCount: 89, stock: 12,
    isNew: true, isBestseller: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی", "سفید"], warranty: "۱۸ ماه گارانتی", seller: "ترب",
    desc: "گلکسی بادز ۳ پرو با طراحی جدید.",
    highlights: ["حذف نویز", "صدای Hi-Fi", "IP57"],
    specs: { نوع: "In-Ear", اتصال: "BT 5.4", باتری: "۳۰ ساعت" },
  },
  {
    id: 68, imageKey: "samsung-buds3",
    name: "هدفون سامسونگ Galaxy Buds3", shortName: "گلکسی بادز ۳",
    category: "accessory", brand: "samsung",
    price: 6900000, oldPrice: null, rating: 4.5, reviewCount: 67, stock: 18,
    isNew: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی", "سفید"], warranty: "۱۸ ماه گارانتی", seller: "بلو مارکت",
    desc: "گلکسی بادز ۳ اقتصادی سامسونگ.",
    highlights: ["حذف نویز", "صدای 24bit", "IP57"],
    specs: { نوع: "In-Ear", اتصال: "BT 5.4", باتری: "۳۰ ساعت" },
  },
  {
    id: 69, imageKey: "samsung-buds2-pro",
    name: "هدفون سامسونگ Galaxy Buds2 Pro", shortName: "گلکسی بادز ۲ پرو",
    category: "accessory", brand: "samsung",
    price: 8500000, oldPrice: 10500000, rating: 4.6, reviewCount: 145, stock: 18,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی", "سفید", "بنفش"], warranty: "۱۸ ماه گارانتی", seller: "دیجی‌کالا",
    desc: "ایرپاد سامسونگ با حذف نویز هوشمند.",
    highlights: ["حذف نویز", "صدای 24bit", "IPX7"],
    specs: { نوع: "In-Ear", اتصال: "BT 5.3", باتری: "۲۹ ساعت" },
  },
  {
    id: 70, imageKey: "xo-ev51",
    name: "هندزفری ایکس او EV51", shortName: "ایکس او EV51",
    category: "accessory", brand: "xo",
    price: 1900000, oldPrice: null, rating: 4.0, reviewCount: 42, stock: 30,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی", "سفید"], warranty: "۶ ماه گارانتی", seller: "ترب",
    desc: "هندزفری بلوتوثی اقتصادی.",
    highlights: ["باتری ۲۰ ساعته", "BT 5.1", "میکروفون"],
    specs: { نوع: "In-Ear", اتصال: "BT 5.1", باتری: "۲۰ ساعت" },
  },
  {
    id: 71, imageKey: "xo-be36",
    name: "هندزفری ایکس او BE36", shortName: "ایکس او BE36",
    category: "accessory", brand: "xo",
    price: 890000, oldPrice: null, rating: 3.8, reviewCount: 89, stock: 50,
    isBestseller: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی", "سفید"], warranty: "۶ ماه گارانتی", seller: "بلو مارکت",
    desc: "هندزفری بلوتوثی ارزان.",
    highlights: ["ارزان", "باتری ۱۵ ساعته"],
    specs: { نوع: "In-Ear", اتصال: "BT 5.0", باتری: "۱۵ ساعت" },
  },
  {
    id: 72, imageKey: "baseus-bowie-ma10",
    name: "هدفون باسئوس Bowie MA10", shortName: "باسئوس Bowie MA10",
    category: "accessory", brand: "baseus",
    price: 2890000, oldPrice: 3490000, rating: 4.4, reviewCount: 78, stock: 22,
    isNew: true, isFeatured: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی", "سفید"], warranty: "۱۲ ماه گارانتی", seller: "دیجی‌کالا",
    desc: "هدفون باسئوس با حذف نویز فعال.",
    highlights: ["حذف نویز", "۴۰ ساعت باتری", "IPX5"],
    specs: { نوع: "Over-Ear", اتصال: "BT 5.3", باتری: "۴۰ ساعت" },
  },
  {
    id: 73, imageKey: "anker-q30",
    name: "هدفون انکر Soundcore Q30", shortName: "انکر Soundcore Q30",
    category: "accessory", brand: "anker",
    price: 2190000, oldPrice: null, rating: 4.6, reviewCount: 234, stock: 28,
    isBestseller: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی", "آبی"], warranty: "۱۸ ماه گارانتی", seller: "ترب",
    desc: "هدفون انکر با حذف نویز فعال.",
    highlights: ["حذف نویز", "۴۰ ساعت باتری", "کیف حمل"],
    specs: { نوع: "Over-Ear", اتصال: "BT 5.0", باتری: "۴۰ ساعت" },
  },
  {
    id: 74, imageKey: "jbl-tune-770nc",
    name: "هدفون JBL Tune 770NC", shortName: "JBL Tune 770NC",
    category: "accessory", brand: "jbl",
    price: 3990000, oldPrice: null, rating: 4.5, reviewCount: 145, stock: 20,
    isBestseller: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی", "سفید", "آبی"], warranty: "۱۲ ماه گارانتی", seller: "بلو مارکت",
    desc: "هدفون JBL با صدای Pure Bass.",
    highlights: ["Pure Bass", "۷۰ ساعت باتری", "حذف نویز"],
    specs: { نوع: "Over-Ear", اتصال: "BT 5.3", باتری: "۷۰ ساعت" },
  },
  {
    id: 75, imageKey: "marshall-major-v",
    name: "هدفون مارشال Major V", shortName: "مارشال Major V",
    category: "accessory", brand: "marshall",
    price: 8900000, oldPrice: null, rating: 4.8, reviewCount: 67, stock: 8,
    isNew: true, isSpecialSale: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی", "قهوه‌ای"], warranty: "۱۲ ماه گارانتی", seller: "دیجی‌کالا",
    desc: "هدفون مارشال با طراحی کلاسیک.",
    highlights: ["طراحی کلاسیک", "۱۰۰ ساعت باتری", "صدای عالی"],
    specs: { نوع: "Over-Ear", اتصال: "BT 5.3", باتری: "۱۰۰ ساعت" },
  },
  {
    id: 76, imageKey: "marshall-minor-iv",
    name: "هدفون مارشال Minor IV", shortName: "مارشال Minor IV",
    category: "accessory", brand: "marshall",
    price: 5900000, oldPrice: null, rating: 4.6, reviewCount: 89, stock: 12,
    isNew: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی"], warranty: "۱۲ ماه گارانتی", seller: "ترب",
    desc: "ایرپاد مارشال با صدای قوی.",
    highlights: ["طراحی خاص", "۳۰ ساعت باتری", "IPX4"],
    specs: { نوع: "In-Ear", اتصال: "BT 5.2", باتری: "۳۰ ساعت" },
  },
  // 🆕 هدفون‌های جدید
  {
    id: 124, imageKey: "airpods-pro-2",
    name: "هندزفری بلوتوثی اپل AirPods Pro 2", shortName: "ایرپادز پرو ۲ (نسخه ۲)",
    category: "accessory", brand: "apple",
    price: 12900000, oldPrice: 14900000, rating: 4.8, reviewCount: 0, stock: 12,
    isBestseller: true, isDemo: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["سفید"], warranty: "گارانتی اصالت کالا", seller: "ترب",
    desc: "هندزفری بی‌سیم با حذف نویز فعال و حالت شفافیت. (داده Demo)",
    highlights: ["حذف نویز فعال", "حالت شفافیت", "کیف شارژ"],
    specs: { اتصال: "Bluetooth", نوع: "TWS", قابلیت: "ANC" },
  },
  {
    id: 126, imageKey: "anker-q30",
    name: "هدفون بلوتوثی انکر Soundcore Q30", shortName: "هدفون انکر Q30 (Demo)",
    category: "accessory", brand: "anker",
    price: 4990000, oldPrice: 5490000, rating: 4.6, reviewCount: 0, stock: 10,
    isDemo: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی"], warranty: "گارانتی اصالت کالا", seller: "دیجی‌کالا",
    desc: "هدفون دورگوشی با حذف نویز و باتری بادوام. (داده Demo)",
    highlights: ["حذف نویز فعال", "باتری بادوام", "اتصال بلوتوث"],
    specs: { اتصال: "Bluetooth", نوع: "Over-Ear", قابلیت: "ANC" },
  },

  // ═══════════════════════════════════════════════════
  //  🔋 پاوربانک (۱۲ فعلی + ۱ جدید = ۱۳)
  // ═══════════════════════════════════════════════════

  {
    id: 77, imageKey: "anker-737",
    name: "پاوربانک انکر 737 Power Bank 24000", shortName: "انکر 737",
    category: "accessory", brand: "anker",
    price: 6890000, oldPrice: null, rating: 4.9, reviewCount: 145, stock: 10,
    isNew: true, isBestseller: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی"], warranty: "۱۸ ماه گارانتی", seller: "بلو مارکت",
    desc: "پاوربانک قدرتمند انکر با شارژ ۱۴۰ وات.",
    highlights: ["۲۴۰۰۰mAh", "۱۴۰ وات", "نمایشگر"],
    specs: { ظرفیت: "۲۴۰۰۰", توان: "۱۴۰ وات", پورت: "۲ USB-C + ۱ USB-A" },
  },
  {
    id: 78, imageKey: "anker-20000",
    name: "پاوربانک انکر 20000mAh", shortName: "پاوربانک انکر ۲۰K",
    category: "accessory", brand: "anker",
    price: 3890000, oldPrice: 4590000, rating: 4.8, reviewCount: 234, stock: 15,
    isBestseller: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی"], warranty: "۱۸ ماه گارانتی", seller: "دیجی‌کالا",
    desc: "پاوربانک انکر با شارژ ۳۰ وات.",
    highlights: ["۲۰۰۰۰mAh", "شارژ ۳۰ وات", "PowerIQ 3.0"],
    specs: { ظرفیت: "۲۰۰۰۰", توان: "۳۰ وات", پورت: "۱ USB-A + ۱ USB-C" },
  },
  {
    id: 79, imageKey: "anker-10000",
    name: "پاوربانک انکر 10000mAh", shortName: "پاوربانک انکر ۱۰K",
    category: "accessory", brand: "anker",
    price: 2190000, oldPrice: null, rating: 4.7, reviewCount: 456, stock: 25,
    isBestseller: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی", "سفید", "آبی"], warranty: "۱۸ ماه گارانتی", seller: "ترب",
    desc: "پاوربانک انکر ۱۰۰۰۰ با شارژ ۲۲.۵ وات.",
    highlights: ["۱۰۰۰۰mAh", "۲۲.۵ وات", "سبک"],
    specs: { ظرفیت: "۱۰۰۰۰", توان: "۲۲.۵ وات", پورت: "۱ USB-A + ۱ USB-C" },
  },
  {
    id: 80, imageKey: "baseus-20000-65w",
    name: "پاوربانک باسئوس 20000mAh 65W", shortName: "باسئوس ۲۰K 65W",
    category: "accessory", brand: "baseus",
    price: 3890000, oldPrice: null, rating: 4.8, reviewCount: 178, stock: 18,
    isNew: true, isBestseller: true, isFeatured: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی"], warranty: "۱۲ ماه گارانتی", seller: "بلو مارکت",
    desc: "پاوربانک باسئوس با شارژ ۶۵ وات.",
    highlights: ["۲۰۰۰۰mAh", "شارژ ۶۵ وات", "نمایشگر"],
    specs: { ظرفیت: "۲۰۰۰۰", توان: "۶۵ وات", پورت: "۲ USB-A + ۱ USB-C" },
  },
  {
    id: 81, imageKey: "baseus-10000",
    name: "پاوربانک باسئوس 10000mAh", shortName: "باسئوس ۱۰K",
    category: "accessory", brand: "baseus",
    price: 1790000, oldPrice: 2190000, rating: 4.6, reviewCount: 234, stock: 35,
    isBestseller: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی", "سفید"], warranty: "۱۲ ماه گارانتی", seller: "دیجی‌کالا",
    desc: "پاوربانک باسئوس ۱۰۰۰۰ میلی‌آمپر.",
    highlights: ["۱۰۰۰۰mAh", "۲۲.۵ وات", "سبک"],
    specs: { ظرفیت: "۱۰۰۰۰", توان: "۲۲.۵ وات", پورت: "۲ USB-A + ۱ USB-C" },
  },
  {
    id: 82, imageKey: "xiaomi-20000-50w",
    name: "پاوربانک شیائومی 20000mAh 50W", shortName: "شیائومی ۲۰K 50W",
    category: "accessory", brand: "xiaomi",
    price: 2690000, oldPrice: null, rating: 4.7, reviewCount: 456, stock: 22,
    isBestseller: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی", "سفید"], warranty: "۱۲ ماه گارانتی", seller: "ترب",
    desc: "پاوربانک شیائومی با شارژ ۵۰ وات.",
    highlights: ["۲۰۰۰۰mAh", "شارژ ۵۰ وات", "۳ پورت"],
    specs: { ظرفیت: "۲۰۰۰۰", توان: "۵۰ وات", پورت: "۲ USB-A + ۱ USB-C" },
  },
  {
    id: 83, imageKey: "xiaomi-10000-pb",
    name: "پاوربانک شیائومی 10000mAh", shortName: "شیائومی ۱۰K",
    category: "accessory", brand: "xiaomi",
    price: 990000, oldPrice: null, rating: 4.5, reviewCount: 789, stock: 50,
    isBestseller: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی", "سفید", "آبی"], warranty: "۱۲ ماه گارانتی", seller: "بلو مارکت",
    desc: "پاوربانک اقتصادی شیائومی.",
    highlights: ["۱۰۰۰۰mAh", "۲۲.۵ وات", "ارزان"],
    specs: { ظرفیت: "۱۰۰۰۰", توان: "۲۲.۵ وات", پورت: "۲ USB-A + ۱ USB-C" },
  },
  {
    id: 84, imageKey: "tesco-10000",
    name: "پاوربانک تسکو 10000mAh", shortName: "پاوربانک تسکو",
    category: "accessory", brand: "tesco",
    price: 779000, oldPrice: 1112857, rating: 4.2, reviewCount: 156, stock: 40,
    isBestseller: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی", "سفید"], warranty: "۱۲ ماه گارانتی", seller: "دیجی‌کالا",
    desc: "پاوربانک ۱۰۰۰۰ تسکو.",
    highlights: ["۱۰۰۰۰mAh", "۲ پورت", "شارژ ۲.۴A"],
    specs: { ظرفیت: "۱۰۰۰۰", توان: "۱۲ وات", پورت: "۲ USB-A + ۱ USB-C" },
  },
  {
    id: 85, imageKey: "tesco-20000",
    name: "پاوربانک تسکو 20000mAh", shortName: "تسکو ۲۰K",
    category: "accessory", brand: "tesco",
    price: 1590000, oldPrice: null, rating: 4.3, reviewCount: 89, stock: 30,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی"], warranty: "۱۲ ماه گارانتی", seller: "ترب",
    desc: "پاوربانک ۲۰۰۰۰ تسکو.",
    highlights: ["۲۰۰۰۰mAh", "۲ پورت", "نمایشگر"],
    specs: { ظرفیت: "۲۰۰۰۰", توان: "۲۲.۵ وات", پورت: "۲ USB-A + ۱ USB-C" },
  },
  {
    id: 86, imageKey: "hiska-20000",
    name: "پاوربانک هیسکا 20000mAh", shortName: "هیسکا ۲۰K",
    category: "accessory", brand: "hiska",
    price: 2450000, oldPrice: null, rating: 4.5, reviewCount: 98, stock: 25,
    isBestseller: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی"], warranty: "۱۸ ماه گارانتی", seller: "بلو مارکت",
    desc: "پاوربانک ۲۰۰۰۰ با شارژ ۶۵ وات.",
    highlights: ["۲۰۰۰۰mAh", "۶۵ وات", "۳ پورت"],
    specs: { ظرفیت: "۲۰۰۰۰", توان: "۶۵ وات", پورت: "۲ USB-A + ۱ USB-C" },
  },
  {
    id: 87, imageKey: "hiska-30000",
    name: "پاوربانک هیسکا 30000mAh", shortName: "هیسکا ۳۰K",
    category: "accessory", brand: "hiska",
    price: 3290000, oldPrice: 3990000, rating: 4.6, reviewCount: 67, stock: 15,
    isNew: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی"], warranty: "۱۸ ماه گارانتی", seller: "دیجی‌کالا",
    desc: "پاوربانک ۳۰۰۰۰ برای لپ‌تاپ و موبایل.",
    highlights: ["۳۰۰۰۰mAh", "۶۵ وات", "مناسب لپ‌تاپ"],
    specs: { ظرفیت: "۳۰۰۰۰", توان: "۶۵ وات", پورت: "۲ USB-A + ۱ USB-C" },
  },
  {
    id: 88, imageKey: "apple-magsafe-battery",
    name: "پاوربانک مگ‌سیف اپل", shortName: "مگ‌سیف باتری",
    category: "accessory", brand: "apple",
    price: 5900000, oldPrice: null, rating: 4.4, reviewCount: 234, stock: 12,
    isBestseller: true, isFeatured: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["سفید"], warranty: "۱۲ ماه گارانتی", seller: "ترب",
    desc: "باتری مگ‌سیف اپل برای آیفون.",
    highlights: ["مگ‌سیف", "اورجینال اپل", "شارژ بی‌سیم"],
    specs: { ظرفیت: "۱۴۶۰", توان: "۱۵ وات", سازگار: "iPhone 12+" },
  },
  // 🆕 پاوربانک جدید
  {
    id: 130, imageKey: "anker-20000",
    name: "پاوربانک انکر ۲۰۰۰۰ میلی‌آمپر", shortName: "پاوربانک انکر ۲۰۰۰۰ (Demo)",
    category: "accessory", brand: "anker",
    price: 4590000, oldPrice: 4990000, rating: 4.7, reviewCount: 0, stock: 8,
    isBestseller: true, isDemo: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی"], warranty: "گارانتی اصالت کالا", seller: "ترب",
    desc: "پاوربانک ظرفیت بالا برای شارژ روزمره. (داده Demo)",
    highlights: ["ظرفیت ۲۰۰۰۰mAh", "شارژ چند دستگاه", "محافظت چندگانه"],
    specs: { ظرفیت: "۲۰۰۰۰mAh", درگاه: "USB-C و USB-A", نوع: "پاوربانک" },
  },

  // ═══════════════════════════════════════════════════
  //  ⚡ شارژر و کابل (۱۲ فعلی + ۱ جدید = ۱۳)
  // ═══════════════════════════════════════════════════

  {
    id: 89, imageKey: "anker-100w-gan",
    name: "شارژر انکر 100W GaN 4-Port", shortName: "انکر ۱۰۰W GaN",
    category: "accessory", brand: "anker",
    price: 3900000, oldPrice: null, rating: 4.9, reviewCount: 145, stock: 12,
    isNew: true, isBestseller: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی", "سفید"], warranty: "۱۸ ماه گارانتی", seller: "بلو مارکت",
    desc: "شارژر انکر ۱۰۰ وات با ۴ پورت.",
    highlights: ["۱۰۰ وات", "GaN", "۴ پورت"],
    specs: { توان: "۱۰۰ وات", پورت: "۳ USB-C + ۱ USB-A", GaN: "دارد" },
  },
  {
    id: 90, imageKey: "anker-65w-gan",
    name: "شارژر انکر 65W GaN", shortName: "انکر ۶۵W GaN",
    category: "accessory", brand: "anker",
    price: 2490000, oldPrice: 2990000, rating: 4.8, reviewCount: 234, stock: 20,
    isBestseller: true, isSpecialSale: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی", "سفید"], warranty: "۱۸ ماه گارانتی", seller: "دیجی‌کالا",
    desc: "شارژر انکر ۶۵ وات GaN.",
    highlights: ["۶۵ وات", "GaN", "۲ پورت"],
    specs: { توان: "۶۵ وات", پورت: "۲ USB-C + ۱ USB-A", GaN: "دارد" },
  },
  {
    id: 91, imageKey: "anker-30w",
    name: "شارژر انکر 30W USB-C", shortName: "انکر ۳۰W",
    category: "accessory", brand: "anker",
    price: 890000, oldPrice: null, rating: 4.7, reviewCount: 456, stock: 40,
    isBestseller: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["سفید", "مشکی"], warranty: "۱۸ ماه گارانتی", seller: "ترب",
    desc: "شارژر انکر ۳۰ وات USB-C.",
    highlights: ["۳۰ وات", "PD", "کوچک"],
    specs: { توان: "۳۰ وات", پورت: "۱ USB-C" },
  },
  {
    id: 92, imageKey: "baseus-65w-gan",
    name: "شارژر باسئوس 65W GaN", shortName: "باسئوس ۶۵W",
    category: "accessory", brand: "baseus",
    price: 890000, oldPrice: null, rating: 4.8, reviewCount: 175, stock: 50,
    isNew: true, isBestseller: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["سفید", "مشکی"], warranty: "۱۲ ماه گارانتی", seller: "بلو مارکت",
    desc: "شارژر ۶۵ وات GaN باسئوس.",
    highlights: ["۶۵ وات", "GaN", "۲ پورت"],
    specs: { توان: "۶۵ وات", پورت: "۱ USB-C + ۱ USB-A" },
  },
  {
    id: 93, imageKey: "baseus-100w-gan",
    name: "شارژر باسئوس 100W GaN", shortName: "باسئوس ۱۰۰W",
    category: "accessory", brand: "baseus",
    price: 2190000, oldPrice: 2690000, rating: 4.7, reviewCount: 89, stock: 20,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی"], warranty: "۱۲ ماه گارانتی", seller: "دیجی‌کالا",
    desc: "شارژر باسئوس ۱۰۰ وات.",
    highlights: ["۱۰۰ وات", "GaN", "۳ پورت"],
    specs: { توان: "۱۰۰ وات", پورت: "۲ USB-C + ۱ USB-A" },
  },
  {
    id: 94, imageKey: "apple-20w",
    name: "شارژر اپل 20W USB-C", shortName: "شارژر اپل ۲۰W",
    category: "accessory", brand: "apple",
    price: 950000, oldPrice: null, rating: 4.6, reviewCount: 320, stock: 60,
    isBestseller: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["سفید"], warranty: "۱۲ ماه گارانتی آواژنگ", seller: "ترب",
    desc: "شارژر اصلی اپل ۲۰ وات.",
    highlights: ["۲۰ وات", "USB-C", "اورجینال"],
    specs: { توان: "۲۰ وات", پورت: "۱ USB-C" },
  },
  {
    id: 95, imageKey: "apple-35w-dual",
    name: "شارژر اپل 35W Dual USB-C", shortName: "شارژر اپل ۳۵W",
    category: "accessory", brand: "apple",
    price: 1890000, oldPrice: null, rating: 4.7, reviewCount: 145, stock: 25,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["سفید"], warranty: "۱۲ ماه گارانتی آواژنگ", seller: "بلو مارکت",
    desc: "شارژر دو پورت اپل ۳۵ وات.",
    highlights: ["۳۵ وات", "۲ USB-C", "اورجینال"],
    specs: { توان: "۳۵ وات", پورت: "۲ USB-C" },
  },
  {
    id: 96, imageKey: "samsung-45w",
    name: "شارژر سامسونگ 45W USB-C", shortName: "شارژر سامسونگ ۴۵W",
    category: "accessory", brand: "samsung",
    price: 1290000, oldPrice: 1490000, rating: 4.7, reviewCount: 189, stock: 30,
    isBestseller: true, isFeatured: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی", "سفید"], warranty: "۱۸ ماه گارانتی", seller: "دیجی‌کالا",
    desc: "شارژر ۴۵ وات سامسونگ Super Fast Charging.",
    highlights: ["۴۵ وات", "USB-C", "PD 3.0"],
    specs: { توان: "۴۵ وات", پورت: "۱ USB-C" },
  },
  {
    id: 97, imageKey: "baseus-cable-2m",
    name: "کابل USB-C to C باسئوس 2m", shortName: "کابل Type-C باسئوس",
    category: "accessory", brand: "baseus",
    price: 250000, oldPrice: null, rating: 4.5, reviewCount: 420, stock: 100,
    isNew: true, isBestseller: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی", "سفید"], warranty: "۶ ماه گارانتی", seller: "ترب",
    desc: "کابل Type-C به Type-C با طول ۲ متر.",
    highlights: ["طول ۲ متر", "۱۰۰W", "نایلونی"],
    specs: { نوع: "USB-C to USB-C", طول: "۲ متر", توان: "۱۰۰ وات" },
  },
  {
    id: 98, imageKey: "apple-lightning-cable",
    name: "کابل USB-C به Lightning اپل", shortName: "کابل اپل",
    category: "accessory", brand: "apple",
    price: 1290000, oldPrice: null, rating: 4.6, reviewCount: 234, stock: 40,
    isBestseller: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["سفید"], warranty: "۶ ماه گارانتی", seller: "بلو مارکت",
    desc: "کابل اصلی اپل USB-C به Lightning.",
    highlights: ["اورجینال اپل", "۱ متر", "MFi"],
    specs: { نوع: "USB-C to Lightning", طول: "۱ متر" },
  },
  {
    id: 99, imageKey: "baseus-hdmi-21",
    name: "کابل HDMI 2.1 باسئوس 8K", shortName: "کابل HDMI",
    category: "accessory", brand: "baseus",
    price: 590000, oldPrice: 790000, rating: 4.6, reviewCount: 156, stock: 60,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی"], warranty: "۶ ماه گارانتی", seller: "دیجی‌کالا",
    desc: "کابل HDMI 2.1 با پشتیبانی 8K.",
    highlights: ["HDMI 2.1", "8K@60Hz", "۲ متر"],
    specs: { نوع: "HDMI 2.1", طول: "۲ متر" },
  },
  {
    id: 100, imageKey: "baseus-wireless-15w",
    name: "شارژر بی‌سیم باسئوس 15W", shortName: "شارژر بی‌سیم ۱۵W",
    category: "accessory", brand: "baseus",
    price: 690000, oldPrice: null, rating: 4.4, reviewCount: 89, stock: 35,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی", "سفید"], warranty: "۱۲ ماه گارانتی", seller: "ترب",
    desc: "شارژر بی‌سیم ۱۵ وات باسئوس.",
    highlights: ["۱۵ وات", "بی‌سیم", "Qi"],
    specs: { توان: "۱۵ وات", استاندارد: "Qi" },
  },
  // 🆕 شارژر جدید
  {
    id: 129, imageKey: "apple-20w",
    name: "شارژر دیواری USB-C اپل ۲۰ وات", shortName: "شارژر اپل ۲۰ وات (Demo)",
    category: "accessory", brand: "apple",
    price: 1290000, oldPrice: null, rating: 4.7, reviewCount: 0, stock: 30,
    isBestseller: true, isDemo: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["سفید"], warranty: "ضمانت اصالت کالا", seller: "دیجی‌کالا",
    desc: "آداپتور USB-C مناسب شارژ سریع. (داده Demo)",
    highlights: ["توان ۲۰ وات", "درگاه USB-C", "ابعاد جمع‌وجور"],
    specs: { توان: "۲۰W", درگاه: "USB-C", نوع: "آداپتور" },
  },

  // ═══════════════════════════════════════════════════
  //  📱 قاب و کیف (۱۲ فعلی + ۷ جدید = ۱۹)
  // ═══════════════════════════════════════════════════

  {
    id: 101, imageKey: "apple-magsafe-clear-16pm",
    name: "قاب اپل مگ‌سیف شفاف iPhone 16 Pro Max", shortName: "قاب مگ‌سیف ۱۶ پرو مکس",
    category: "accessory", brand: "apple",
    price: 2450000, oldPrice: null, rating: 4.7, reviewCount: 89, stock: 35,
    isNew: true, isBestseller: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["شفاف"], warranty: "۶ ماه گارانتی", seller: "بلو مارکت",
    desc: "قاب شفاف مگ‌سیف اپل.",
    highlights: ["مگ‌سیف", "شفاف", "اورجینال"],
    specs: { جنس: "پلی‌کربنات", مگ‌سیف: "دارد", سازگار: "iPhone 16 Pro Max" },
  },
  {
    id: 102, imageKey: "apple-silicone-16-pro",
    name: "قاب اپل سیلیکونی iPhone 16 Pro", shortName: "قاب سیلیکون اپل",
    category: "accessory", brand: "apple",
    price: 1850000, oldPrice: 2450000, rating: 4.7, reviewCount: 189, stock: 35,
    isBestseller: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی", "آبی", "صورتی", "سفید"], warranty: "۶ ماه گارانتی", seller: "دیجی‌کالا",
    desc: "قاب سیلیکونی اصلی اپل با مگ‌سیف.",
    highlights: ["مگ‌سیف", "سیلیکون نرم", "داخل مخملی"],
    specs: { جنس: "سیلیکون", مگ‌سیف: "دارد", سازگار: "iPhone 16 Pro" },
  },
  {
    id: 103, imageKey: "apple-leather-16",
    name: "قاب اپل چرمی iPhone 16", shortName: "قاب چرم اپل",
    category: "accessory", brand: "apple",
    price: 2590000, oldPrice: null, rating: 4.8, reviewCount: 67, stock: 20,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["قهوه‌ای", "مشکی"], warranty: "۶ ماه گارانتی", seller: "ترب",
    desc: "قاب چرم طبیعی اپل.",
    highlights: ["چرم طبیعی", "مگ‌سیف", "کلاسیک"],
    specs: { جنس: "چرم", مگ‌سیف: "دارد", سازگار: "iPhone 16" },
  },
  {
    id: 104, imageKey: "samsung-case-s25-ultra",
    name: "قاب سامسونگ S25 Ultra شفاف", shortName: "قاب S25 Ultra",
    category: "accessory", brand: "samsung",
    price: 890000, oldPrice: null, rating: 4.5, reviewCount: 67, stock: 45,
    isNew: true, isBestseller: true, isFeatured: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["شفاف", "مشکی"], warranty: "۶ ماه گارانتی", seller: "بلو مارکت",
    desc: "قاب شفاف سامسونگ برای S25 Ultra.",
    highlights: ["شفاف", "ضدضربه", "نازک"],
    specs: { جنس: "TPU", سازگار: "Galaxy S25 Ultra" },
  },
  {
    id: 105, imageKey: "samsung-case-s25",
    name: "قاب سامسونگ S25 سیلیکونی", shortName: "قاب S25 سیلیکون",
    category: "accessory", brand: "samsung",
    price: 690000, oldPrice: 890000, rating: 4.4, reviewCount: 89, stock: 55,
    isSpecialSale: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی", "سفید", "آبی"], warranty: "۶ ماه گارانتی", seller: "دیجی‌کالا",
    desc: "قاب سیلیکونی سامسونگ S25.",
    highlights: ["سیلیکون نرم", "مات", "ضد لک"],
    specs: { جنس: "سیلیکون", سازگار: "Galaxy S25" },
  },
  {
    id: 106, imageKey: "samsung-case-a55",
    name: "قاب سامسونگ A55 شفاف", shortName: "قاب A55",
    category: "accessory", brand: "samsung",
    price: 350000, oldPrice: null, rating: 4.3, reviewCount: 62, stock: 80,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["شفاف"], warranty: "بدون گارانتی", seller: "ترب",
    desc: "قاب شفاف سامسونگ A55.",
    highlights: ["شفاف", "ضدضربه"],
    specs: { جنس: "TPU", سازگار: "Galaxy A55" },
  },
  {
    id: 107, imageKey: "xiaomi-case-14-ultra",
    name: "قاب شیائومی 14 Ultra", shortName: "قاب شیائومی ۱۴",
    category: "accessory", brand: "xiaomi",
    price: 590000, oldPrice: null, rating: 4.4, reviewCount: 45, stock: 40,
    isNew: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["شفاف", "مشکی"], warranty: "بدون گارانتی", seller: "بلو مارکت",
    desc: "قاب محافظ شیائومی ۱۴ اولترا.",
    highlights: ["ضدضربه", "شفاف"],
    specs: { جنس: "TPU + PC", سازگار: "Xiaomi 14 Ultra" },
  },
  {
    id: 108, imageKey: "xiaomi-case-note-13-pro",
    name: "قاب شیائومی Redmi Note 13 Pro", shortName: "قاب Redmi Note 13",
    category: "accessory", brand: "xiaomi",
    price: 290000, oldPrice: 390000, rating: 4.2, reviewCount: 89, stock: 70,
    isBestseller: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["شفاف", "مشکی", "آبی"], warranty: "بدون گارانتی", seller: "دیجی‌کالا",
    desc: "قاب محافظ Redmi Note 13 Pro.",
    highlights: ["شفاف", "ضدضربه", "ارزان"],
    specs: { جنس: "TPU", سازگار: "Redmi Note 13 Pro" },
  },
  {
    id: 109, imageKey: "apple-airpods-pro-2-case",
    name: "قاب AirPods Pro 2 سیلیکونی", shortName: "قاب ایرپاد پرو ۲",
    category: "accessory", brand: "apple",
    price: 590000, oldPrice: null, rating: 4.5, reviewCount: 145, stock: 50,
    isBestseller: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی", "سفید", "آبی", "صورتی"], warranty: "بدون گارانتی", seller: "ترب",
    desc: "قاب سیلیکونی برای ایرپاد پرو ۲.",
    highlights: ["سیلیکون", "کارابین", "ضدضربه"],
    specs: { جنس: "سیلیکون", سازگار: "AirPods Pro 2" },
  },
  {
    id: 110, imageKey: "apple-watch-leather-band",
    name: "بند چرمی اپل واچ", shortName: "بند چرمی اپل واچ",
    category: "accessory", brand: "apple",
    price: 1890000, oldPrice: null, rating: 4.7, reviewCount: 67, stock: 25,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["قهوه‌ای", "مشکی"], warranty: "۶ ماه گارانتی", seller: "بلو مارکت",
    desc: "بند چرم طبیعی اپل واچ.",
    highlights: ["چرم طبیعی", "اورجینال", "کلاسیک"],
    specs: { جنس: "چرم", سازگار: "Apple Watch" },
  },
  {
    id: 111, imageKey: "apple-watch-silicone-band",
    name: "بند سیلیکونی اپل واچ", shortName: "بند سیلیکون اپل واچ",
    category: "accessory", brand: "apple",
    price: 590000, oldPrice: 790000, rating: 4.5, reviewCount: 189, stock: 60,
    isBestseller: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی", "سفید", "آبی", "صورتی"], warranty: "بدون گارانتی", seller: "دیجی‌کالا",
    desc: "بند سیلیکونی اپل واچ.",
    highlights: ["سیلیکون", "رنگ‌های متنوع", "سبک"],
    specs: { جنس: "سیلیکون", سازگار: "Apple Watch" },
  },
  {
    id: 112, imageKey: "apple-ipad-pro-case",
    name: "قاب آیپد پرو 12.9", shortName: "قاب آیپد پرو",
    category: "accessory", brand: "apple",
    price: 1890000, oldPrice: null, rating: 4.6, reviewCount: 45, stock: 20,
    isNew: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی", "آبی"], warranty: "۶ ماه گارانتی", seller: "ترب",
    desc: "قاب هوشمند آیپد پرو با قابلیت استند.",
    highlights: ["استند", "ضدضربه", "Auto Sleep"],
    specs: { جنس: "PU", سازگار: "iPad Pro 12.9" },
  },
  // 🆕 قاب‌های جدید
  {
    id: 127, imageKey: "samsung-case-s25-ultra",
    name: "قاب محافظ گوشی سامسونگ Galaxy S26 Ultra", shortName: "قاب S26 Ultra",
    category: "accessory", brand: "samsung",
    price: 890000, oldPrice: null, rating: 4.5, reviewCount: 0, stock: 25,
    isNew: true, isDemo: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["شفاف", "مشکی"], warranty: "ضمانت سلامت فیزیکی", seller: "ترب",
    desc: "قاب محافظ با لبه‌های تقویت‌شده. (داده Demo)",
    highlights: ["محافظت از لبه‌ها", "دسترسی آسان به کلیدها", "طراحی خوش‌دست"],
    specs: { سازگاری: "Galaxy S26 Ultra", جنس: "TPU و پلی‌کربنات", نوع: "قاب محافظ" },
  },
  {
    id: 128, imageKey: "iphone-16-pro-max",
    name: "قاب مگ‌سیف سازگار با iPhone 17 Pro Max", shortName: "قاب مگ‌سیف آیفون ۱۷ پرو مکس",
    category: "accessory", brand: "apple",
    price: 1190000, oldPrice: null, rating: 4.6, reviewCount: 0, stock: 20,
    isNew: true, isDemo: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["شفاف", "مشکی", "دودی"], warranty: "ضمانت سلامت فیزیکی", seller: "بلو مارکت",
    desc: "قاب سازگار با شارژرهای مگ‌سیف. (داده Demo)",
    highlights: ["سازگار با MagSafe", "لبه محافظ دوربین", "پوشش ضدخش"],
    specs: { سازگاری: "iPhone 17 Pro Max", جنس: "سیلیکون و پلی‌کربنات", نوع: "قاب مگ‌سیف" },
  },
  {
    id: 143, imageKey: "apple-silicone-16-pro",
    name: "قاب محافظ شفاف سازگار با iPhone 13", shortName: "قاب شفاف آیفون ۱۳",
    category: "accessory", brand: "apple",
    price: 590000, oldPrice: null, rating: 4.4, reviewCount: 0, stock: 25,
    isDemo: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["شفاف", "دودی"], warranty: "ضمانت سلامت فیزیکی", seller: "بلو مارکت",
    desc: "قاب شفاف محافظ برای آیفون ۱۳. (داده Demo)",
    highlights: ["شفاف و سبک", "لبه محافظ دوربین", "دسترسی به کلیدها"],
    specs: { سازگاری: "iPhone 13", نوع: "قاب شفاف", جنس: "TPU" },
  },
  {
    id: 144, imageKey: "apple-silicone-16-pro",
    name: "قاب سیلیکونی سازگار با iPhone 14", shortName: "قاب سیلیکونی آیفون ۱۴",
    category: "accessory", brand: "apple",
    price: 790000, oldPrice: null, rating: 4.5, reviewCount: 0, stock: 20,
    isDemo: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی", "آبی", "بنفش"], warranty: "ضمانت سلامت فیزیکی", seller: "دیجی‌کالا",
    desc: "قاب سیلیکونی خوش‌دست برای آیفون ۱۴. (داده Demo)",
    highlights: ["سطح نرم", "محافظت از لبه‌ها", "برش دقیق درگاه‌ها"],
    specs: { سازگاری: "iPhone 14", نوع: "قاب سیلیکونی", جنس: "Silicone" },
  },
  {
    id: 145, imageKey: "samsung-case-s25",
    name: "قاب ضدضربه سازگار با Galaxy S23", shortName: "قاب ضدضربه S23",
    category: "accessory", brand: "samsung",
    price: 690000, oldPrice: null, rating: 4.5, reviewCount: 0, stock: 18,
    isDemo: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی", "شفاف"], warranty: "ضمانت سلامت فیزیکی", seller: "ترب",
    desc: "قاب ضدضربه برای گلکسی S23. (داده Demo)",
    highlights: ["گوشه‌های ضربه‌گیر", "لبه برجسته دوربین", "خوش‌دست"],
    specs: { سازگاری: "Galaxy S23", نوع: "قاب ضدضربه", جنس: "TPU" },
  },
  {
    id: 146, imageKey: "samsung-case-s25-ultra",
    name: "قاب محافظ سازگار با Galaxy S24 Ultra", shortName: "قاب S24 Ultra",
    category: "accessory", brand: "samsung",
    price: 890000, oldPrice: null, rating: 4.6, reviewCount: 0, stock: 15,
    isBestseller: true, isDemo: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی", "شفاف"], warranty: "ضمانت سلامت فیزیکی", seller: "بلو مارکت",
    desc: "قاب محافظ مخصوص گلکسی S24 Ultra. (داده Demo)",
    highlights: ["محافظ لنز دوربین", "لبه تقویت‌شده", "دسترسی به قلم"],
    specs: { سازگاری: "Galaxy S24 Ultra", نوع: "قاب محافظ", جنس: "TPU" },
  },
  {
    id: 147, imageKey: "screen-protector",
    name: "گلس تمام‌صفحه سازگار با iPhone 17 Pro Max", shortName: "گلس آیفون ۱۷ پرو مکس",
    category: "accessory", brand: "apple",
    price: 690000, oldPrice: null, rating: 4.6, reviewCount: 0, stock: 30,
    isNew: true, isDemo: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["شفاف"], warranty: "ضمانت سلامت فیزیکی", seller: "دیجی‌کالا",
    desc: "محافظ صفحه تمام‌چسب برای آیفون ۱۷ پرو مکس. (داده Demo)",
    highlights: ["پوشش تمام‌صفحه", "شفافیت بالا", "مقاوم به خط و خش"],
    specs: { سازگاری: "iPhone 17 Pro Max", نوع: "گلس تمام‌صفحه", پوشش: "شفاف" },
  },
  {
    id: 148, imageKey: "screen-protector",
    name: "گلس محافظ صفحه سازگار با Galaxy S26 Ultra", shortName: "گلس S26 Ultra",
    category: "accessory", brand: "samsung",
    price: 790000, oldPrice: null, rating: 4.6, reviewCount: 0, stock: 25,
    isNew: true, isDemo: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["شفاف"], warranty: "ضمانت سلامت فیزیکی", seller: "ترب",
    desc: "محافظ صفحه شفاف برای گلکسی S26 Ultra. (داده Demo)",
    highlights: ["شفافیت بالا", "مقاوم به خط و خش", "سازگار با اولترا"],
    specs: { سازگاری: "Galaxy S26 Ultra", نوع: "محافظ صفحه", پوشش: "شفاف" },
  },
  {
    id: 149, imageKey: "battery-phone",
    name: "باتری گوشی موبایل سامسونگ اورجینال", shortName: "باتری سامسونگ",
    category: "accessory", brand: "samsung",
    price: 890000, oldPrice: null, rating: 4.5, reviewCount: 34, stock: 50,
    isBestseller: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی"], warranty: "۶ ماه گارانتی", seller: "بلو مارکت",
    desc: "باتری اورجینال برای گوشی‌های سامسونگ.",
    highlights: ["ظرفیت بالا", "اورجینال", "عمر طولانی"],
    specs: { سازگاری: "سامسونگ", ظرفیت: "۳۰۰۰mAh", ولتاژ: "۳.۸۵V" },
  },
  {
    id: 150, imageKey: "battery-phone",
    name: "باتری گوشی موبایل اپل اورجینال", shortName: "باتری اپل",
    category: "accessory", brand: "apple",
    price: 1290000, oldPrice: null, rating: 4.6, reviewCount: 28, stock: 40,
    isBestseller: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی"], warranty: "۶ ماه گارانتی", seller: "دیجی‌کالا",
    desc: "باتری اورجینال برای آیفون‌های اپل.",
    highlights: ["ظرفیت بالا", "اورجینال", "عمر طولانی"],
    specs: { سازگاری: "آیفون", ظرفیت: "۳۲۰۰mAh", ولتاژ: "۳.۸۲V" },
  },

  // ═══════════════════════════════════════════════════
  //  🎮 لوازم گیمینگ و کامپیوتر (۱۲ فعلی = ۱۲)
  // ═══════════════════════════════════════════════════

  {
    id: 131, imageKey: "gaming-keyboard",
    name: "کیبورد مکانیکال گیمینگ RGB", shortName: "کیبورد مکانیکال RGB",
    category: "accessory", brand: "generic",
    price: 3890000, oldPrice: 4290000, rating: 4.7, reviewCount: 0, stock: 12,
    isNew: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی"], warranty: "گارانتی اصالت کالا", seller: "بلو مارکت",
    desc: "کیبورد مکانیکال با نورپردازی RGB.",
    highlights: ["نورپردازی RGB", "کلیدهای مکانیکال", "اتصال USB"],
    specs: { نوع: "مکانیکال", نورپردازی: "RGB", اتصال: "USB" },
  },
  {
    id: 132, imageKey: "gaming-mouse",
    name: "ماوس گیمینگ RGB با دقت بالا", shortName: "ماوس گیمینگ RGB",
    category: "accessory", brand: "generic",
    price: 1590000, oldPrice: null, rating: 4.5, reviewCount: 0, stock: 18,
    isBestseller: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی"], warranty: "گارانتی اصالت کالا", seller: "دیجی‌کالا",
    desc: "ماوس گیمینگ ارگونومیک با نورپردازی.",
    highlights: ["طراحی ارگونومیک", "تنظیم DPI", "نورپردازی RGB"],
    specs: { اتصال: "USB", کاربری: "گیمینگ", قابلیت: "تنظیم DPI" },
  },
  {
    id: 133, imageKey: "usb-c-hub",
    name: "هاب USB-C چندکاره لپ‌تاپ", shortName: "هاب USB-C چندکاره",
    category: "accessory", brand: "generic",
    price: 2490000, oldPrice: null, rating: 4.6, reviewCount: 0, stock: 15,
    isNew: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["خاکستری"], warranty: "گارانتی اصالت کالا", seller: "ترب",
    desc: "هاب چندکاره برای افزایش درگاه‌های لپ‌تاپ.",
    highlights: ["درگاه USB-A", "خروجی HDMI", "درگاه USB-C"],
    specs: { اتصال: "USB-C", کاربری: "لپ‌تاپ", درگاه: "چندگانه" },
  },
  {
    id: 134, imageKey: "laptop-cooling-pad",
    name: "پایه خنک‌کننده لپ‌تاپ", shortName: "کول‌پد لپ‌تاپ",
    category: "accessory", brand: "generic",
    price: 1790000, oldPrice: null, rating: 4.4, reviewCount: 0, stock: 14,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی"], warranty: "گارانتی اصالت کالا", seller: "بلو مارکت",
    desc: "پایه خنک‌کننده برای بهبود گردش هوا.",
    highlights: ["فن خنک‌کننده", "پایه قابل تنظیم", "مناسب لپ‌تاپ"],
    specs: { نوع: "کول‌پد", سازگاری: "لپ‌تاپ", اتصال: "USB" },
  },
  {
    id: 135, imageKey: "gaming-controller",
    name: "دسته بازی بی‌سیم PC و کنسول", shortName: "دسته بازی بی‌سیم",
    category: "accessory", brand: "generic",
    price: 3290000, oldPrice: 3590000, rating: 4.6, reviewCount: 0, stock: 10,
    isNew: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی", "سفید"], warranty: "گارانتی اصالت کالا", seller: "دیجی‌کالا",
    desc: "دسته بازی بی‌سیم برای تجربه راحت‌تر.",
    highlights: ["اتصال بی‌سیم", "طراحی ارگونومیک", "کلیدهای قابل دسترس"],
    specs: { اتصال: "Bluetooth / USB", سازگاری: "PC و کنسول", نوع: "کنترلر" },
  },
  {
    id: 136, imageKey: "gaming-headset",
    name: "هدست گیمینگ استریو با میکروفون", shortName: "هدست گیمینگ",
    category: "accessory", brand: "generic",
    price: 2790000, oldPrice: null, rating: 4.5, reviewCount: 0, stock: 11,
    isBestseller: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی"], warranty: "گارانتی اصالت کالا", seller: "ترب",
    desc: "هدست دورگوشی با میکروفون برای بازی.",
    highlights: ["میکروفون داخلی", "صدای استریو", "پدهای نرم"],
    specs: { نوع: "Over-Ear", اتصال: "جک ۳.۵ / USB", کاربری: "گیمینگ" },
  },
  {
    id: 137, imageKey: "gaming-monitor",
    name: "مانیتور گیمینگ ۲۴ اینچ Full HD", shortName: "مانیتور گیمینگ ۲۴ اینچ",
    category: "accessory", brand: "generic",
    price: 15900000, oldPrice: null, rating: 4.6, reviewCount: 0, stock: 5,
    isNew: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی"], warranty: "استعلام گارانتی", seller: "بلو مارکت",
    desc: "مانیتور ۲۴ اینچی برای کاربری روزمره و بازی.",
    highlights: ["اندازه ۲۴ اینچ", "رزولوشن Full HD", "مناسب گیمینگ"],
    specs: { اندازه: "۲۴ اینچ", رزولوشن: "Full HD", درگاه: "HDMI" },
  },
  {
    id: 138, imageKey: "pc-ram-ddr5",
    name: "رم دسکتاپ DDR5 ظرفیت ۱۶ گیگابایت", shortName: "رم DDR5 شانزده گیگ",
    category: "accessory", brand: "generic",
    price: 5200000, oldPrice: null, rating: 4.5, reviewCount: 0, stock: 8,
    isNew: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی"], warranty: "استعلام گارانتی", seller: "دیجی‌کالا",
    desc: "ماژول حافظه DDR5 برای ارتقای سیستم.",
    highlights: ["ظرفیت ۱۶ گیگابایت", "استاندارد DDR5", "مناسب دسکتاپ"],
    specs: { ظرفیت: "۱۶GB", نسل: "DDR5", نوع: "DIMM" },
  },
  {
    id: 139, imageKey: "pc-ssd-nvme",
    name: "حافظه SSD NVMe ظرفیت ۱ ترابایت", shortName: "SSD NVMe یک ترابایت",
    category: "accessory", brand: "generic",
    price: 8900000, oldPrice: null, rating: 4.7, reviewCount: 0, stock: 7,
    isBestseller: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی"], warranty: "استعلام گارانتی", seller: "ترب",
    desc: "حافظه پرسرعت NVMe برای ارتقای سرعت بوت.",
    highlights: ["ظرفیت ۱ ترابایت", "رابط NVMe", "مناسب لپ‌تاپ و دسکتاپ"],
    specs: { ظرفیت: "۱TB", رابط: "M.2 NVMe", نوع: "SSD" },
  },
  {
    id: 140, imageKey: "pc-gpu",
    name: "کارت گرافیک گیمینگ سری RTX", shortName: "کارت گرافیک RTX",
    category: "accessory", brand: "generic",
    price: 54000000, oldPrice: null, rating: 4.6, reviewCount: 0, stock: 2,
    isNew: true,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی"], warranty: "استعلام مدل دقیق", seller: "بلو مارکت",
    desc: "کارت گرافیک مخصوص بازی و طراحی.",
    highlights: ["مناسب گیمینگ", "خروجی تصویر چندگانه", "نیازمند بررسی توان پاور"],
    specs: { سری: "RTX", کاربری: "گیمینگ و طراحی", درگاه: "PCIe" },
  },
  {
    id: 141, imageKey: "pc-cpu",
    name: "پردازنده دسکتاپ Intel Core i5", shortName: "پردازنده اینتل Core i5",
    category: "accessory", brand: "generic",
    price: 15000000, oldPrice: null, rating: 4.5, reviewCount: 0, stock: 4,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["جعبه‌ای"], warranty: "استعلام نسل و گارانتی", seller: "دیجی‌کالا",
    desc: "پردازنده دسکتاپ برای سیستم‌های اداری.",
    highlights: ["خانواده Core i5", "مناسب کاربری روزمره", "سازگاری با مادربرد منتخب"],
    specs: { برند: "Intel", سری: "Core i5", نوع: "Desktop CPU" },
  },
  {
    id: 142, imageKey: "pc-motherboard",
    name: "مادربرد دسکتاپ سری B", shortName: "مادربرد سری B",
    category: "accessory", brand: "generic",
    price: 13000000, oldPrice: null, rating: 4.4, reviewCount: 0, stock: 3,
    image: PLACEHOLDER, images: [PLACEHOLDER],
    colors: ["مشکی"], warranty: "استعلام مدل و گارانتی", seller: "ترب",
    desc: "مادربرد دسکتاپ؛ سوکت و فرم‌فاکتور باید بررسی شود.",
    highlights: ["درگاه‌های توسعه", "پشتیبانی از حافظه پرسرعت", "انتخاب بر اساس سوکت"],
    specs: { نوع: "ATX / mATX", درگاه: "PCIe و M.2", سازگاری: "وابسته به مدل" },
  },];

  // ← پایان ALL_PRODUCTS_RAW

/* ============================================================
   مرحله‌ی نهایی: نرمال‌سازی + حذف تکرار + ساخت ALL_PRODUCTS
   ============================================================ */

/* اصلاح ۵: حذف تکرارها بدون از دست دادن اطلاعات */
function deduplicateProducts(list) {
  const seen = new Map();
  const result = [];

  for (const p of list) {
    // کلید یکتایی: imageKey + قیمت + سازگاری (اگر قاب/گلس باشد)
    const compat = (p.specs && p.specs["سازگار"]) || (p.specs && p.specs["سازگاری"]) || "";
    const key = `${p.imageKey}|${p.price}|${compat}`;

    if (seen.has(key)) {
      // ادغام: نسخه‌ی اول را نگه می‌داریم و اطلاعات تکمیلی نسخه‌ی دوم را اضافه می‌کنیم
      const first = seen.get(key);
      if (!first.isDemo && p.isDemo) first.isDemo = true;
      if (!first.isNew && p.isNew) first.isNew = true;
      if (!first.isBestseller && p.isBestseller) first.isBestseller = true;
      if (!first.isSpecialSale && p.isSpecialSale) first.isSpecialSale = true;
      if (!first.isFeatured && p.isFeatured) first.isFeatured = true;

      // ادغام رنگ‌ها
      if (Array.isArray(p.colors) && p.colors.length) {
        const merged = new Set([...(first.colors || []), ...p.colors]);
        first.colors = Array.from(merged);
      }

      // ادغام highlights
      if (Array.isArray(p.highlights) && p.highlights.length) {
        const merged = new Set([...(first.highlights || []), ...p.highlights]);
        first.highlights = Array.from(merged);
      }

      // ادغام specs (اولویت با نسخه‌ی اول)
      if (p.specs && typeof p.specs === "object") {
        for (const k of Object.keys(p.specs)) {
          if (!first.specs[k]) first.specs[k] = p.specs[k];
        }
      }

      // نسخه‌ی دوم را از نتیجه حذف می‌کنیم
      continue;
    }

    seen.set(key, p);
    result.push(p);
  }

  return result;
}

/* اعمال نرمال‌سازی روی همه‌ی محصولات */
const ALL_PRODUCTS = deduplicateProducts(
  ALL_PRODUCTS_RAW.map(normalizeProduct)
);

/* ============================================================
   ProductsDB — توابع دسترسی به محصولات
   ============================================================ */

const ProductsDB = {
  all: () => ALL_PRODUCTS,

  getById: (id) =>
    ALL_PRODUCTS.find((p) => String(p.id) === String(id)) || null,

  byCategory: (cat) =>
    ALL_PRODUCTS.filter((p) => p.category === normCategory(cat)),

  byBrand: (brand) =>
    ALL_PRODUCTS.filter((p) => p.brand === normBrand(brand)),

  bySubcategory: (sub) =>
    ALL_PRODUCTS.filter((p) => p.subcategory === sub),

  /* محصولات تخفیف‌دار */
  onSale: () =>
    ALL_PRODUCTS.filter((p) => p.oldPrice && p.oldPrice > p.price),

  /* محصولات جدید */
  newArrivals: (limit = 10) =>
    ALL_PRODUCTS.filter((p) => p.isNew).slice(0, limit),

  /* پرفروش‌ها */
  bestsellers: (limit = 10) =>
    ALL_PRODUCTS.filter((p) => p.isBestseller).slice(0, limit),

  /* محصولات ویژه */
  featured: (limit = 10) =>
    ALL_PRODUCTS.filter((p) => p.isFeatured).slice(0, limit),

  /* محصولات Demo (ساختگی) */
  demoProducts: () =>
    ALL_PRODUCTS.filter((p) => p.isDemo === true),

  /* جستجو با تحمل غلط املایی */
  search: (query) => {
    if (!query) return ALL_PRODUCTS.slice(0, 20);
    const term = String(query)
      .toLowerCase()
      .replace(/[يى]/g, "ی")
      .replace(/ك/g, "ک")
      .replace(/[‌\s\-_]+/g, " ")
      .trim();
    const tokens = term.split(" ").filter(Boolean);

    const aliases = {
      apple: "اپل آیفون",
      samsung: "سامسونگ گلکسی",
      xiaomi: "شیائومی ردمی پوکو",
      huawei: "هوآوی",
      dell: "دل",
      hp: "اچ‌پی",
      asus: "ایسوس",
      lenovo: "لنوو",
      headphones: "هدفون هندزفری",
      case: "قاب کاور گلس محافظ",
      charger: "شارژر کابل",
      powerbank: "پاوربانک پاور بانک",
      "computer-accessory": "لوازم کامپیوتر هاب کول‌پد",
      "computer-parts": "قطعات کامپیوتر پردازنده کارت گرافیک رم SSD مادربرد",
      gaming: "گیمینگ بازی دسته کنسول",
    };

    return ALL_PRODUCTS.filter((p) => {
      const haystack = [
        p.name,
        p.shortName,
        p.brand,
        aliases[p.brand] || "",
        p.subcategory,
        aliases[p.subcategory] || "",
        p.desc,
        ...(p.highlights || []),
        ...Object.values(p.specs || {}),
      ]
        .join(" ")
        .toLowerCase()
        .replace(/[يى]/g, "ی")
        .replace(/ك/g, "ک");

      return tokens.every((t) => haystack.includes(t));
    });
  },

  /* محصولات مشابه */
  related: (id, limit = 4) => {
    const product = ProductsDB.getById(id);
    if (!product) return [];
    return ALL_PRODUCTS.filter(
      (p) =>
        String(p.id) !== String(id) &&
        (p.category === product.category || p.brand === product.brand),
    ).slice(0, limit);
  },

  /* آمار */
  stats: () => ({
    total: ALL_PRODUCTS.length,
    demo: ALL_PRODUCTS.filter((p) => p.isDemo === true).length,
    onSale: ALL_PRODUCTS.filter((p) => p.oldPrice && p.oldPrice > p.price).length,
    outOfStock: ALL_PRODUCTS.filter((p) => p.stock === 0).length,
    withOfficialPrice: ALL_PRODUCTS.filter((p) => p.priceReviewRequired === false).length,
    byCategory: {
      mobile: ALL_PRODUCTS.filter((p) => p.category === "mobile").length,
      laptop: ALL_PRODUCTS.filter((p) => p.category === "laptop").length,
      tablet: ALL_PRODUCTS.filter((p) => p.category === "tablet").length,
      watch: ALL_PRODUCTS.filter((p) => p.category === "watch").length,
      accessory: ALL_PRODUCTS.filter((p) => p.category === "accessory").length,
    },
  }),
};

/* ============================================================
   اصلاح ۳: همگام‌سازی با پنل ادمین
   ============================================================ */

try {
  const savedCatalog = JSON.parse(
    localStorage.getItem("bl_admin_products") || "null",
  );
  if (Array.isArray(savedCatalog) && savedCatalog.length) {
    const byId = new Map(savedCatalog.map((p) => [String(p.id), p]));
    const merged = ALL_PRODUCTS.map((p) => {
      const admin = byId.get(String(p.id));
      return admin ? { ...p, ...admin } : p;
    });
    const known = new Set(merged.map((p) => String(p.id)));
    savedCatalog.forEach((p) => {
      if (!known.has(String(p.id))) {
        // محصول جدید که فقط در ادمین هست
        const normalized = normalizeProduct(p);
        merged.push(normalized);
      }
    });
    ALL_PRODUCTS.length = 0;
    ALL_PRODUCTS.push(...merged);
  }
} catch (e) {
  console.warn("[Products] کاتالوگ ذخیره‌شده قابل خواندن نبود:", e);
}

/* ============================================================
   اکسپورت به window
   ============================================================ */

window.ALL_PRODUCTS = ALL_PRODUCTS;
window.ProductsDB = ProductsDB;
window.normalizeProduct = normalizeProduct;
window.detectSubcategory = detectSubcategory;
window.normBrand = normBrand;
window.normCategory = normCategory;

/* ============================================================
   CartStore — سبد خرید یکپارچه
   ============================================================ */

(function () {
  const KEY = "shoppingCart";

  function safePrice(value) {
    if (typeof value === "number")
      return Number.isFinite(value) ? Math.max(0, value) : 0;
    const digits = String(value ?? "")
      .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
      .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
    return Math.max(0, Number(digits.replace(/[^0-9.]/g, "")) || 0);
  }

  function normalizeItems(items) {
    if (!Array.isArray(items)) return [];
    const out = [];
    for (const raw of items) {
      if (!raw || raw.id === undefined || raw.id === null) continue;
      const id = String(raw.id).trim();
      if (!id) continue;
      const quantity = Math.max(
        1,
        Math.min(99, parseInt(raw.quantity ?? raw.qty ?? 1, 10) || 1),
      );
      const item = {
        id,
        name: String(raw.name || raw.title || "محصول"),
        price: safePrice(raw.price ?? raw.currentPrice),
        oldPrice: raw.oldPrice == null ? null : safePrice(raw.oldPrice),
        image: String(
          raw.image ||
            (raw.images && raw.images[0]) ||
            "images/products/placeholder-product.svg",
        ),
        rating: Number(raw.rating) || 0,
        color: String(raw.color || "پیش‌فرض"),
        quantity,
      };
      const found = out.find(
        (x) => x.id === item.id && x.color === item.color,
      );
      if (found) found.quantity = Math.min(99, found.quantity + item.quantity);
      else out.push(item);
    }
    return out;
  }

  function read() {
    try {
      let localItems = normalizeItems(
        JSON.parse(localStorage.getItem(KEY) || "[]"),
      );

      if (!localItems.length) {
        const shared = document.cookie
          .split("; ")
          .find((x) => x.startsWith("bl_cart_shared="));
        if (shared) {
          const sharedItems = normalizeItems(
            JSON.parse(
              decodeURIComponent(shared.substring("bl_cart_shared=".length)),
            ),
          );
          if (sharedItems.length) {
            localItems = sharedItems;
            localStorage.setItem(KEY, JSON.stringify(sharedItems));
          }
        }
      }

      if (localItems.length) return localItems;

      for (const legacyKey of ["cartItems", "cart", "bl_cart"]) {
        const legacy = localStorage.getItem(legacyKey);
        if (legacy) {
          const migrated = normalizeItems(JSON.parse(legacy));
          if (migrated.length) {
            write(migrated);
            return migrated;
          }
        }
      }

      return localItems;
    } catch (e) {
      console.warn("خواندن سبد خرید ممکن نشد:", e);
      return [];
    }
  }

  function write(items) {
    const clean = normalizeItems(items);
    const serialized = JSON.stringify(clean);

    try {
      localStorage.setItem(KEY, serialized);
    } catch (e) {
      console.error("ذخیره سبد خرید در localStorage ممکن نشد:", e);
      return false;
    }

    try {
      if (clean.length) {
        const shared = encodeURIComponent(serialized);
        if (shared.length < 3800) {
          document.cookie =
            "bl_cart_shared=" +
            shared +
            "; path=/; max-age=2592000; SameSite=Lax";
        }
      } else {
        document.cookie = "bl_cart_shared=; path=/; max-age=0; SameSite=Lax";
      }
    } catch (e) {
      // کوکی در دسترس نیست، مشکل جدی نیست
    }

    window.dispatchEvent(
      new CustomEvent("bl:cart-updated", { detail: { items: clean } }),
    );
    return clean;
  }

  function add(product, quantity = 1, color) {
    if (!product || product.id === undefined || product.id === null)
      return false;

    const list = read();
    const id = String(product.id);
    const chosen = String(color || product.colors?.[0] || "پیش‌فرض");
    const amount = Math.max(1, Math.min(99, parseInt(quantity, 10) || 1));

    const found = list.find((x) => String(x.id) === id && x.color === chosen);
    if (found) {
      found.quantity = Math.min(99, found.quantity + amount);
    } else {
      list.push({
        id,
        name: product.name || product.title || "محصول",
        price: safePrice(product.price ?? product.currentPrice),
        oldPrice: product.oldPrice == null ? null : safePrice(product.oldPrice),
        image:
          product.image ||
          (product.images && product.images[0]) ||
          "images/products/placeholder-product.svg",
        rating: Number(product.rating) || 0,
        color: chosen,
        quantity: amount,
      });
    }

    const saved = write(list);
    if (saved === false) return false;

    if (typeof window.updateCartBadge === "function") {
      window.updateCartBadge();
    }
    window.dispatchEvent(
      new CustomEvent("bl:cart-updated", { detail: { items: saved } }),
    );
    return true;
  }

  function remove(id, color) {
    const list = read().filter(
      (x) =>
        !(
          String(x.id) === String(id) &&
          String(x.color || "") === String(color || "")
        ),
    );
    return write(list);
  }

  function setQuantity(id, color, qty) {
    const list = read();
    const item = list.find(
      (x) =>
        String(x.id) === String(id) &&
        String(x.color || "") === String(color || ""),
    );
    if (!item) return list;
    item.quantity = Math.max(1, Math.min(99, parseInt(qty, 10) || 1));
    return write(list);
  }

  function clear() {
    return write([]);
  }

  window.CartStore = {
    key: KEY,
    normalize: normalizeItems,
    read,
    write,
    add,
    remove,
    setQuantity,
    clear,
    count: () => read().reduce((n, x) => n + (x.quantity || 0), 0),
    subtotal: () => read().reduce((s, x) => s + (x.price || 0) * (x.quantity || 0), 0),
  };

  window.addProductToCart = (product, quantity, color) =>
    window.CartStore.add(product, quantity, color);
})();

/* ============================================================
   لاگ‌های توسعه‌دهنده
   ============================================================ */

console.log("%c✅ BLUE MARKET — محصولات لود شد", "color:#f97316;font-weight:900;font-size:14px");
console.log(`   📦 کل محصولات: ${ALL_PRODUCTS.length}`);
console.log(`   📱 موبایل: ${ProductsDB.byCategory("mobile").length}`);
console.log(`   💻 لپ‌تاپ: ${ProductsDB.byCategory("laptop").length}`);
console.log(`   📱 تبلت: ${ProductsDB.byCategory("tablet").length}`);
console.log(`   ⌚ ساعت: ${ProductsDB.byCategory("watch").length}`);
console.log(`   🎧 لوازم جانبی: ${ProductsDB.byCategory("accessory").length}`);
console.log(`   🆕 Demo (ساختگی): ${ProductsDB.demoProducts().length}`);
console.log(`   🏷️ تخفیف‌دار: ${ProductsDB.onSale().length}`);
console.log(`   💰 قیمت رسمی: ${ALL_PRODUCTS.filter((p) => !p.priceReviewRequired).length}`);
console.log(`   ⚠️ نیازمند تأیید قیمت: ${ALL_PRODUCTS.filter((p) => p.priceReviewRequired).length}`);

/* ============================================================
   بارگذاری خودکار عکس‌ها
   ============================================================ */

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    if (window.ProductImages) {
      setTimeout(() => {
        window.ProductImages.hydrateAllProducts();
      }, 200);
    }
  });
}