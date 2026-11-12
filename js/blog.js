/* ============================================
   BLOG — منطق صفحه مقالات
   ============================================ */
"use strict";

(function () {
  // اگر در صفحه blog.html هستیم
  if (document.getElementById("blogGrid")) {
    renderBlogCards();
    initBlogFilters();
  }

  // اگر در صفحه blog-post.html هستیم
  if (document.getElementById("blogPostContent")) {
    renderSinglePost();
  }
})();

/* ═══ رندر کارت‌های بلاگ ═══ */
function renderBlogCards() {
  const grid = document.getElementById("blogGrid");
  if (!grid || !window.BlogDB) return;

  grid.innerHTML = window.BlogDB.all()
    .map(
      (post) => `
        <a href="blog-post.html?id=${post.id}" class="bm-blog-card" data-cat="${post.category}">
            <div class="bm-blog-img" style="background:${post.bg};">
                <i class="bi ${post.icon}"></i>
            </div>
            <div class="bm-blog-content">
                <span class="bm-blog-tag">${post.tag}</span>
                <h3>${post.title}</h3>
                <p>${post.excerpt}</p>
                <span class="bm-blog-meta"><i class="bi bi-clock"></i> ${post.readTime} دقیقه مطالعه</span>
            </div>
        </a>
    `,
    )
    .join("");
}

/* ═══ فیلترها ═══ */
function initBlogFilters() {
  // دکمه‌ها
  document.querySelectorAll(".bm-blog-filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.cat || "all";
      filterBlog(cat, btn);
    });
  });

  // خواندن پارامتر ?cat= از URL
  const params = new URLSearchParams(window.location.search);
  const cat = params.get("cat") || "all";
  const targetBtn = document.querySelector(
    `.bm-blog-filter-btn[data-cat="${cat}"]`,
  );
  if (targetBtn) {
    filterBlog(cat, targetBtn);
  } else {
    const allBtn = document.querySelector(
      '.bm-blog-filter-btn[data-cat="all"]',
    );
    if (allBtn) allBtn.classList.add("active");
  }
}

function filterBlog(cat, btn) {
  document
    .querySelectorAll(".bm-blog-filter-btn")
    .forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");

  const cards = document.querySelectorAll("#blogGrid .bm-blog-card");
  let count = 0;
  cards.forEach((card) => {
    const cardCat = card.dataset.cat;
    if (cat === "all" || cardCat === cat) {
      card.style.display = "";
      count++;
    } else {
      card.style.display = "none";
    }
  });

  // پیام خالی
  let emptyMsg = document.getElementById("blogEmptyMsg");
  if (count === 0 && !emptyMsg) {
    emptyMsg = document.createElement("div");
    emptyMsg.id = "blogEmptyMsg";
    emptyMsg.style.cssText =
      "text-align:center;padding:60px 20px;color:#6b7280;font-size:1rem;grid-column:1/-1;";
    emptyMsg.innerHTML =
      '<i class="bi bi-journal-x" style="font-size:3rem;display:block;margin-bottom:12px;color:#d1d5db;"></i>مقاله‌ای در این دسته یافت نشد.';
    document.getElementById("blogGrid").appendChild(emptyMsg);
  } else if (emptyMsg) {
    emptyMsg.style.display = count === 0 ? "block" : "none";
  }
}

/* ═══ رندر مقاله تک ═══ */
function renderSinglePost() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const post = window.BlogDB.getById(id) || window.BlogDB.all()[0];

  if (!post) return;

  // عنوان صفحه
  document.title = post.title + " | بلو مارکت";

  // هدر
  const tagEl = document.getElementById("blogPostTag");
  if (tagEl) {
    tagEl.textContent = post.tag;
    tagEl.className = "bm-blog-tag tag-" + post.tagClass;
  }
  const titleEl = document.getElementById("blogPostTitle");
  if (titleEl) titleEl.textContent = post.title;

  // متا
  const metaEl = document.getElementById("blogPostMeta");
  if (metaEl) {
    metaEl.innerHTML = `
            <span><i class="bi bi-person-fill"></i> تیم محتوای بلو مارکت</span>
            <span><i class="bi bi-calendar3"></i> ${post.date}</span>
            <span><i class="bi bi-clock"></i> ${post.readTime} دقیقه مطالعه</span>
        `;
  }

  // کاور
  const coverEl = document.getElementById("blogPostCover");
  if (coverEl) {
    coverEl.src = post.cover;
    coverEl.alt = post.title;
  }

  // محتوا
  const contentEl = document.getElementById("blogPostContent");
  if (contentEl) contentEl.innerHTML = post.content;

  // مقالات مرتبط (غیر از مقاله فعلی، همون دسته)
  const relatedGrid = document.getElementById("relatedPostsGrid");
  if (relatedGrid) {
    const related = window.BlogDB.all()
      .filter((p) => p.id !== post.id && p.category === post.category)
      .slice(0, 3);

    if (related.length === 0) {
      // اگر مقاله هم‌دسته نبود، از بقیه انتخاب کن
      const others = window.BlogDB.all()
        .filter((p) => p.id !== post.id)
        .slice(0, 3);
      relatedGrid.innerHTML = others.map(renderRelatedCard).join("");
    } else {
      relatedGrid.innerHTML = related.map(renderRelatedCard).join("");
    }
  }
}

function renderRelatedCard(post) {
  return `
        <a href="blog-post.html?id=${post.id}" class="bm-blog-card">
            <div class="bm-blog-img" style="background:${post.bg}; height:160px;">
                <i class="bi ${post.icon}"></i>
            </div>
            <div class="bm-blog-content">
                <span class="bm-blog-tag">${post.tag}</span>
                <h3>${post.title}</h3>
                <span class="bm-blog-meta"><i class="bi bi-clock"></i> ${post.readTime} دقیقه مطالعه</span>
            </div>
        </a>
    `;
}

window.BlogPage = {
  renderBlogCards,
  initBlogFilters,
  filterBlog,
  renderSinglePost,
};
