// ==================== مدیریت وبلاگ و مقالات آموزشی ====================

// تبدیل انواع مقادیر تاریخ شیت به رشته تمیز و استاندارد خورشیدی
function formatShamsiDate(rawDate) {
  if (!rawDate) return '';

  const str = String(rawDate).trim();
  // اگر از قبل به فرمت عددی شمسی نوشته شده باشد (مثلاً 1405/06/18)
  if (/^14\d{2}\/\d{1,2}\/\d{1,2}/.test(str)) {
    return str;
  }

  try {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      return new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Tehran'
      }).format(d);
    }
  } catch (e) {}

  return str;
}

// واکشی لیست مقالات منتشر شده برای آرشیو
function getPublishedArticles() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const bSheet = ss.getSheetByName('مقالات');
  if (!bSheet) return [];

  const data = bSheet.getDataRange().getValues();
  const articles = [];

  for (let i = 1; i < data.length; i++) {
    const status = String(data[i][10] || '').trim();
    if (status === 'منتشر شده') {
      articles.push({
        slug: String(data[i][0]).trim(),
        title: String(data[i][1]).trim(),
        category: String(data[i][2] || 'عمومی').trim(),
        excerpt: String(data[i][3] || '').trim(),
        coverImage: String(data[i][5] || '').trim(),
        readTime: Number(data[i][6]) || 5,
        author: String(data[i][7] || 'حمیدرضا').trim(),
        date: formatShamsiDate(data[i][8]),
        tags: String(data[i][9] || '').split(',').map(t => t.trim()).filter(Boolean)
      });
    }
  }
  return articles.reverse();
}

// واکشی متن کامل یک مقاله بر اساس شناسه (Slug)
function getSingleArticleBySlug(slug) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const bSheet = ss.getSheetByName('مقالات');
  if (!bSheet || !slug) return null;

  const data = bSheet.getDataRange().getValues();
  const cleanSlug = String(slug).trim().toLowerCase();

  for (let i = 1; i < data.length; i++) {
    const rowSlug = String(data[i][0]).trim().toLowerCase();
    const status = String(data[i][10] || '').trim();

    if (rowSlug === cleanSlug && status === 'منتشر شده') {
      return {
        slug: rowSlug,
        title: String(data[i][1]).trim(),
        category: String(data[i][2] || 'عمومی').trim(),
        excerpt: String(data[i][3] || '').trim(),
        content: String(data[i][4] || '').trim(),
        coverImage: String(data[i][5] || '').trim(),
        readTime: Number(data[i][6]) || 5,
        author: String(data[i][7] || 'حمیدرضا').trim(),
        date: formatShamsiDate(data[i][8]),
        tags: String(data[i][9] || '').split(',').map(t => t.trim()).filter(Boolean)
      };
    }
  }
  return null;
}
