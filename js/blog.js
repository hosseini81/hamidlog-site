// ==================== موتور کلاینت وبلاگ و نمایش مقالات ====================
let allArticles = [];

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("articlesGrid")) {
    initBlogArchive();
  } else if (document.getElementById("articleDetailContainer")) {
    initArticleSingleView();
  }
});

// ۱. راه‌اندازی آرشیو مقالات
async function initBlogArchive() {
  const grid = document.getElementById("articlesGrid");
  const searchInput = document.getElementById("blogSearchInput");

  try {
    const res = await sendToAppScript({ action: "getArticles" });
    allArticles = (res && res.data) ? res.data : [];

    if (allArticles.length === 0) {
      grid.innerHTML = '<div style="color:#64748b; text-align:center; padding:40px; grid-column:1/-1;">هنوز مقاله‌ای منتشر نشده است.</div>';
      return;
    }

    renderArticleCards(allArticles);
    buildCategoryFilters(allArticles);

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const q = e.target.value.trim().toLowerCase();
        const filtered = allArticles.filter(a => 
          a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q)
        );
        renderArticleCards(filtered);
      });
    }
  } catch (err) {
    grid.innerHTML = '<div style="color:#ef4444; text-align:center; grid-column:1/-1;">خطا در دریافت مقالات از سرور.</div>';
  }
}

// رندر کارت‌های مقاله
function renderArticleCards(articles) {
  const grid = document.getElementById("articlesGrid");
  if (!grid) return;
  grid.innerHTML = '';

  if (articles.length === 0) {
    grid.innerHTML = '<div style="color:#64748b; text-align:center; padding:30px; grid-column:1/-1;">مقاله‌ای با این مشخصات یافت نشد.</div>';
    return;
  }

  articles.forEach(a => {
    const imgHtml = a.coverImage 
      ? `<img src="${a.coverImage}" class="blog-card-img" alt="${a.title}" onerror="this.outerHTML='<div class=\\'blog-placeholder\\'>📝</div>'">`
      : `<div class="blog-placeholder">📝</div>`;

    grid.innerHTML += `
      <article class="blog-card">
        <a href="article.html?slug=${a.slug}" class="blog-thumb-link">
          ${imgHtml}
          <span class="blog-cat-badge">${a.category}</span>
        </a>
        <div class="blog-card-body">
          <div class="blog-meta-top">
            <span>⏱ ${a.readTime} دقیقه مطالعه</span>
            <span>📅 ${a.date}</span>
          </div>
          <h3 class="blog-card-title">
            <a href="article.html?slug=${a.slug}">${a.title}</a>
          </h3>
          <p class="blog-card-excerpt">${a.excerpt}</p>
          <div class="blog-card-footer">
            <span class="blog-author">✍️ ${a.author}</span>
            <a href="article.html?slug=${a.slug}" class="btn-read-more">مطالعه کامل ➔</a>
          </div>
        </div>
      </article>
    `;
  });
}

// دکمه‌های فیلتر دسته‌بندی
function buildCategoryFilters(articles) {
  const container = document.getElementById("categoryFilterBar");
  if (!container) return;

  const categories = ['all', ...new Set(articles.map(a => a.category))];
  container.innerHTML = '';

  categories.forEach(cat => {
    const label = cat === 'all' ? 'همه مقالات' : cat;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `cat-pill-btn ${cat === 'all' ? 'active' : ''}`;
    btn.textContent = label;
    btn.onclick = () => {
      document.querySelectorAll("#categoryFilterBar .cat-pill-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const filtered = cat === 'all' ? allArticles : allArticles.filter(a => a.category === cat);
      renderArticleCards(filtered);
    };
    container.appendChild(btn);
  });
}

// ۲. راه‌اندازی صفحه تکی مقاله
async function initArticleSingleView() {
  const container = document.getElementById("articleDetailContainer");
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  if (!slug) {
    window.location.href = "blog.html";
    return;
  }

  try {
    const res = await sendToAppScript({ action: "getSingleArticle", slug: slug });
    const a = (res && res.data) ? res.data : null;

    if (!a) {
      container.innerHTML = `
        <div style="text-align:center; padding:60px 20px;">
          <h2>مقاله یافت نشد!</h2>
          <p style="color:#64748b; margin:10px 0 20px;">ممکن است این مقاله حذف یا تغییر نام داده شده باشد.</p>
          <a href="blog.html" class="btn-main">بازگشت به لیست وبلاگ</a>
        </div>
      `;
      return;
    }

    // به‌روزرسانی تایتل مرورگر بر اساس عنوان مقاله
    document.title = `${a.title} | استودیو حمیدرضا`;

    const tagsHtml = (a.tags && a.tags.length > 0) 
      ? a.tags.map(t => `<span class="article-tag">#${t}</span>`).join(' ')
      : '';

    const heroImgHtml = a.coverImage 
      ? `<img src="${a.coverImage}" class="article-hero-img" alt="${a.title}">`
      : '';

    container.innerHTML = `
      <header class="article-header">
        <div class="article-meta-tags">
          <span class="badge badge-pkg">${a.category}</span>
          <span>📅 ${a.date}</span>
          <span>⏱ ${a.readTime} دقیقه زمان مطالعه</span>
        </div>
        <h1 class="article-main-title">${a.title}</h1>
        <p class="article-lead-excerpt">${a.excerpt}</p>
        <div class="article-author-badge">
          <span>نویسنده و توسعه‌دهنده: <strong>${a.author}</strong></span>
        </div>
      </header>

      ${heroImgHtml}

      <div class="article-content-body">
        ${a.content}
      </div>

      <footer class="article-footer-meta">
        <div class="article-tags-wrap">${tagsHtml}</div>
        <div style="margin-top:20px;">
          <a href="blog.html" class="btn-step-prev" style="text-decoration:none;">➔ بازگشت به لیست مقالات</a>
        </div>
      </footer>
    `;
  } catch (err) {
    container.innerHTML = '<div style="color:#ef4444; text-align:center;">خطا در بارگذاری محتوای مقاله.</div>';
  }
}
