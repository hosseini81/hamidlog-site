// ==================== هسته لود قالب، ترنزیشن و وضعیت کاربر ====================
document.addEventListener("DOMContentLoaded", async () => {
  // الف) بارگذاری اسلات‌های ثابت (هدر و فوتر)
  const loadSlot = async (id, file) => {
    const el = document.getElementById(id);
    if (el) {
      try {
        const res = await fetch(file);
        el.innerHTML = await res.text();
      } catch (err) {
        console.error(`خطا در لود ${file}:`, err);
      }
    }
  };

  await loadSlot("header-slot", "components/header.html");
  await loadSlot("footer-slot", "components/footer.html");

  // همگام‌سازی وضعیت نشست کاربر در هدر و نوار پایین
  syncGlobalUserState();

  // ب) لود بازگشتی فایل‌های data-include
  await loadAllNestedIncludes();

  // ج) راه‌اندازی ترنزیشن و المان‌های تعاملی
  initPageTransitions();
  if (typeof initUIInteractions === "function") initUIInteractions();

  // علامت‌گذاری صفحه فعال در منوی دسکتاپ، منوی کشویی و نوار پایین موبایل
  highlightActiveNavigation();

  // اعلام رویداد اتمام بارگذاری برای ماژول‌های نیازمند به DOM
  window.dispatchEvent(new Event("allModulesLoaded"));
});

// شناسایی هوشمند و دقیق صفحه فعلی و فعال‌سازی افکت Snake Border
function highlightActiveNavigation() {
  let path = window.location.pathname.split("/").pop().toLowerCase();
  
  // پاکسازی پارامترها و هش‌های احتمالی
  path = path.split("?")[0].split("#")[0];
  
  // استخراج شناسه صفحه (پیش‌فرض index)
  let page = path.replace(".html", "").trim();
  if (!page || page === "" || page === "index") {
    page = "index";
  }

  // پاکسازی فعال‌های قبلی و نشاندن کلاس active روی آیتم‌های متناظر
  document.querySelectorAll("[data-page]").forEach(el => {
    if (el.getAttribute("data-page") === page) {
      el.classList.add("active");
    } else {
      el.classList.remove("active");
    }
  });

  // پشتیبانی از اتریبیوت‌های اختصاصی نوار پایینی در صورت وجود
  document.querySelectorAll("[data-bottom-page]").forEach(el => {
    if (el.getAttribute("data-bottom-page") === page) {
      el.classList.add("active");
    } else {
      el.classList.remove("active");
    }
  });
}
window.highlightActiveNavigation = highlightActiveNavigation;

// جلوگیری از گیر افتادن کلاس خروج در صورت زدن دکمه Back مرورگر
window.addEventListener("pageshow", (e) => {
  if (e.persisted) document.body.classList.remove("page-leaving");
});

// لود تودرتوی فایل‌های HTML
async function loadAllNestedIncludes() {
  let pending = document.querySelectorAll("[data-include]");
  while (pending.length > 0) {
    for (const el of pending) {
      const file = el.getAttribute("data-include");
      try {
        const res = await fetch(file);
        el.outerHTML = await res.text();
      } catch (err) {
        console.error(`خطا در فایل include (${file}):`, err);
        el.removeAttribute("data-include");
      }
    }
    pending = document.querySelectorAll("[data-include]");
  }
}

// ترنزیشن نرم جابه‌جایی بین صفحات
function initPageTransitions() {
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;

    const href = link.getAttribute("href");
    const target = link.getAttribute("target");

    if (!href || href.startsWith("#") || href.startsWith("tel:") || href.startsWith("mailto:") || href.startsWith("javascript:") || target === "_blank" || e.ctrlKey || e.shiftKey) {
      return;
    }

    if (href.endsWith(".html") || href === "/" || href.startsWith("./") || href.startsWith("/")) {
      e.preventDefault();
      document.body.classList.add("page-leaving");
      setTimeout(() => { window.location.href = href; }, 190);
    }
  });
}

// نگه‌داری و نمایش نشست کاربر در تمام صفحات
function syncGlobalUserState() {
  let user = null;
  try {
    const saved = localStorage.getItem('site_user_auth');
    if (saved) user = JSON.parse(saved);
  } catch (e) {
    console.warn(e);
  }

  const nameEl = document.getElementById('headerUserName');
  const statusEl = document.getElementById('headerUserStatus');
  const avatarImg = document.getElementById('headerUserAvatar');
  const avatarPlaceholder = document.getElementById('headerUserPlaceholder');
  const headerBtn = document.getElementById('headerUserBtn');
  const bottomLabel = document.getElementById('bottomNavUserLabel');

  if (user && user.phone) {
    if (nameEl) nameEl.textContent = user.name || "کاربر گرامی";
    if (statusEl) statusEl.textContent = "پنل کاربری فعال";
    if (headerBtn) headerBtn.classList.add("logged-in");
    if (bottomLabel) bottomLabel.textContent = (user.name ? user.name.split(" ")[0] : "حساب من");

    if (user.avatar && avatarImg) {
      avatarImg.src = user.avatar;
      avatarImg.style.display = "block";
      if (avatarPlaceholder) avatarPlaceholder.style.display = "none";
    }
  } else {
    if (nameEl) nameEl.textContent = "حساب کاربری";
    if (statusEl) statusEl.textContent = "ورود / ثبت‌نام";
    if (headerBtn) headerBtn.classList.remove("logged-in");
    if (bottomLabel) bottomLabel.textContent = "حساب من";
    if (avatarImg) avatarImg.style.display = "none";
    if (avatarPlaceholder) avatarPlaceholder.style.display = "flex";
  }
}
window.syncGlobalUserState = syncGlobalUserState;
