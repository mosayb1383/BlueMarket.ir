/* ============================================
   SEO HELPER — بلو مارکت
   تزریق Schema.org پویا و متا تگ‌های تکمیلی
   ============================================ */

"use strict";

(function () {
  const SITE = {
    name: "بلو مارکت",
    nameEn: "BLUE MARKET",
    url: "https://YOUR-DOMAIN.ir",
    logo: "https://YOUR-DOMAIN.ir/images/logo.svg",
    phone: "+989229480252",
    email: "mshanbhzhi@gmail.com",
    address: {
      street: "گلشن، جنب پاساژ محمد رسول الله",
      city: "گلشن",
      region: "سیستان و بلوچستان",
      country: "IR",
    },
    social: {
      whatsapp: "https://api.whatsapp.com/send?phone=+989229480252",
      telegram: "https://t.me/",
      instagram: "https://instagram.com/",
    },
  };

  /* ---------- Organization Schema ---------- */
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": SITE.url + "/#organization",
    name: SITE.name,
    alternateName: SITE.nameEn,
    url: SITE.url,
    logo: SITE.logo,
    email: SITE.email,
    telephone: SITE.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.region,
      addressCountry: SITE.address.country,
    },
    sameAs: [SITE.social.whatsapp, SITE.social.telegram, SITE.social.instagram],
  };

  /* ---------- WebSite Schema با SearchAction ---------- */
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE.url + "/#website",
    url: SITE.url,
    name: SITE.name,
    description: "فروشگاه آنلاین موبایل، لپ‌تاپ و لوازم جانبی دیجیتال",
    inLanguage: "fa-IR",
    publisher: { "@id": SITE.url + "/#organization" },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: SITE.url + "/products.html?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  /* ---------- Store / LocalBusiness Schema ---------- */
  const storeSchema = {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": SITE.url + "/#store",
    name: SITE.name,
    image: SITE.logo,
    url: SITE.url,
    telephone: SITE.phone,
    email: SITE.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.region,
      addressCountry: SITE.address.country,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"],
        opens: "09:00",
        closes: "20:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Thursday",
        opens: "09:00",
        closes: "18:00",
      },
    ],
    priceRange: "$$",
    currenciesAccepted: "IRR",
    paymentAccepted: "Cash, Credit Card",
    areaServed: { "@type": "Country", name: "Iran" },
    sameAs: [SITE.social.whatsapp, SITE.social.telegram, SITE.social.instagram],
  };

  /* ---------- BreadcrumbList Schema ---------- */
  function buildBreadcrumb(items) {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((it, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: it.name,
        item: it.url ? SITE.url + it.url : undefined,
      })),
    };
  }

  /* ---------- Product Schema ---------- */
  function buildProductSchema(product) {
    if (!product) return null;
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      image: (product.images || []).map((img) =>
        img.startsWith("http") ? img : SITE.url + "/" + img,
      ),
      description: product.desc || product.shortName || "",
      sku: "BM-" + product.id,
      brand: { "@type": "Brand", name: product.brand || "بلو مارکت" },
      category: product.category,
      offers: {
        "@type": "Offer",
        url: SITE.url + "/product.html?id=" + product.id,
        priceCurrency: "IRR",
        price: product.price,
        availability:
          product.stock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        seller: { "@id": SITE.url + "/#organization" },
        priceValidUntil: new Date(Date.now() + 30 * 86400000)
          .toISOString()
          .split("T")[0],
      },
      aggregateRating:
        product.rating > 0
          ? {
              "@type": "AggregateRating",
              ratingValue: product.rating,
              reviewCount: product.reviewCount || 1,
              bestRating: 5,
              worstRating: 1,
            }
          : undefined,
      isDemo: product.isDemo === true ? true : undefined,
    };
  }

  /* ---------- تزریق Schema ---------- */
  function injectSchema(schema) {
    if (!schema) return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);
  }

  /* ---------- تزریق متا تگ‌های تکمیلی ---------- */
  function injectMeta(name, content, attr = "name") {
    if (!content) return;
    let tag = document.querySelector(`meta[${attr}="${name}"]`);
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute(attr, name);
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", content);
  }

  /* ---------- تزریق canonical ---------- */
  function setCanonical(url) {
    let canon = document.querySelector('link[rel="canonical"]');
    if (!canon) {
      canon = document.createElement("link");
      canon.rel = "canonical";
      document.head.appendChild(canon);
    }
    canon.href = SITE.url + url;
  }

  /* ---------- تزریق alternate hreflang ---------- */
  function setHreflang() {
    const link = document.createElement("link");
    link.rel = "alternate";
    link.hreflang = "fa-IR";
    link.href = window.location.href;
    document.head.appendChild(link);
  }

  /* ---------- تشخیص صفحه ---------- */
  function detectPage() {
    const path = window.location.pathname.split("/").pop() || "index.html";
    const page = path.replace(".html", "");
    return {
      path: "/" + path,
      page,
      isHome: page === "index" || page === "",
      isProduct: page === "product",
      isProducts: page === "products",
      isCategory: [
        "mobiles",
        "laptops",
        "tablets",
        "watches",
        "accessories",
      ].includes(page),
      isBlog: page === "blog",
      isBlogPost: page === "blog-post",
    };
  }

  /* ---------- اجرا ---------- */
  function run() {
    const info = detectPage();

    // در همه‌ی صفحات عمومی: Organization + WebSite
    if (
      !info.page.startsWith("admin") &&
      ![
        "auth",
        "account",
        "cart",
        "checkout",
        "thankyou",
        "notifications",
        "user-panel",
        "report",
      ].includes(info.page)
    ) {
      injectSchema(organizationSchema);
      injectSchema(websiteSchema);
      setHreflang();
    }

    // صفحه اصلی: Store
    if (info.isHome) {
      injectSchema(storeSchema);
      setCanonical("/");
    }

    // صفحه محصول: Product + Breadcrumb
    if (info.isProduct && window.ProductsDB) {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get("id");
      const product = ProductsDB.getById(id);
      if (product) {
        injectSchema(buildProductSchema(product));
        injectSchema(
          buildBreadcrumb([
            { name: "خانه", url: "/" },
            { name: "محصولات", url: "/products.html" },
            {
              name:
                product.category === "mobile"
                  ? "موبایل"
                  : product.category === "laptop"
                    ? "لپ‌تاپ"
                    : product.category === "tablet"
                      ? "تبلت"
                      : product.category === "watch"
                        ? "ساعت هوشمند"
                        : "لوازم جانبی",
              url:
                "/" +
                (product.category === "mobile"
                  ? "mobiles"
                  : product.category === "laptop"
                    ? "laptops"
                    : product.category === "tablet"
                      ? "tablets"
                      : product.category === "watch"
                        ? "watches"
                        : "accessories") +
                ".html",
            },
            { name: product.shortName || product.name },
          ]),
        );
        setCanonical("/product.html?id=" + product.id);
      }
    }

    // صفحه فروشگاه: Breadcrumb
    if (info.isProducts) {
      injectSchema(
        buildBreadcrumb([{ name: "خانه", url: "/" }, { name: "فروشگاه" }]),
      );
      setCanonical("/products.html");
    }

    // صفحات دسته: Breadcrumb
    if (info.isCategory) {
      const catName = {
        mobiles: "گوشی موبایل",
        laptops: "لپ‌تاپ",
        tablets: "تبلت",
        watches: "ساعت هوشمند",
        accessories: "لوازم جانبی",
      }[info.page];
      injectSchema(
        buildBreadcrumb([
          { name: "خانه", url: "/" },
          { name: "محصولات", url: "/products.html" },
          { name: catName },
        ]),
      );
      setCanonical("/" + info.path.replace(/^\//, ""));
    }
  }

  // اکسپورت
  window.SEO = {
    SITE,
    organizationSchema,
    websiteSchema,
    storeSchema,
    buildBreadcrumb,
    buildProductSchema,
    injectSchema,
    injectMeta,
    setCanonical,
    run,
  };

  // اجرا در DOMContentLoaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
})();
