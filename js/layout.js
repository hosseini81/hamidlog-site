// ==================== هسته لود قالب، ترنزیشن و وضعیت کاربر ====================
document.addEventListener("DOMContentLoaded", async () => {
  // الف) بارگذاری اسلات‌های ثابت
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

  // همگام‌سازی وضعیت لاگین در هدر و نوار پایین
  syncGlobalUserState();

  // ب) لود بازگشتی فایل‌های data-include
  await loadAllNestedIncludes();

  // ج) راه‌اندازی ترنزیشن و المان‌های تعاملی
  initPageTransitions();
  if (typeof initUIInteractions === "function") initUIInteractions();

  // علامت زدن صفحه فعال
  const page = window.location.pathname.split("/").pop().replace(".html", "") || "index";
  document.querySelectorAll(`[data-page="${page}"]`).forEach(el => el.classList.add("active"));
  document.querySelectorAll(`[data-bottom-page="${page}"]`).forEach(el => el.classList.add("active"));

  // اعلام رویداد اتمام بارگذاری برای ماژول‌های نیازمند به DOM
  window.dispatchEvent(new Event("allModulesLoaded"));
});

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
