// ==================== ۱. هسته لود قالب و رفتارهای عمومی سایت ====================
document.addEventListener("DOMContentLoaded", async () => {
  // الف) بارگذاری هدر و فوتر
  const loadSlot = async (id, file) => {
    const el = document.getElementById(id);
    if (el) {
      try {
        const res = await fetch(file);
        el.innerHTML = await res.text();
      } catch (err) {
        console.error(`Error loading ${file}:`, err);
      }
    }
  };

  await loadSlot("header-slot", "components/header.html");
  await loadSlot("footer-slot", "components/footer.html");

  // همگام‌سازی فوری وضعیت کاربر در هدر و نوار پایین در تمام صفحات
  syncGlobalUserState();

  // ب) بارگذاری تمام بخش‌های data-include به صورت تودرتو
  await loadAllNestedIncludes();

  // ج) راه‌اندازی منوی کشویی موبایل (Drawer) و بک‌دراپ
  const burger = document.getElementById("hamburgerBtn");
  const drawer = document.getElementById("mobileDrawer");
  const backdrop = document.getElementById("drawerBackdrop");
  const closeBtn = document.getElementById("drawerCloseBtn");

  const openDrawer = () => {
    if (drawer) drawer.classList.add("show");
    if (backdrop) backdrop.classList.add("show");
    document.body.style.overflow = "hidden";
  };

  const closeDrawer = () => {
    if (drawer) drawer.classList.remove("show");
    if (backdrop) backdrop.classList.remove("show");
    document.body.style.overflow = "";
  };

  if (burger) burger.addEventListener("click", openDrawer);
  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  if (backdrop) backdrop.addEventListener("click", closeDrawer);

  document.querySelectorAll(".mobile-drawer .mobile-link, .mobile-drawer .mobile-cta-btn").forEach(link => {
    link.addEventListener("click", closeDrawer);
  });

  // د) علامت زدن لینک فعال صفحه در منوها
  const page = window.location.pathname.split("/").pop().replace(".html", "") || "index";
  document.querySelectorAll(`[data-page="${page}"]`).forEach(el => el.classList.add("active"));
  document.querySelectorAll(`[data-bottom-page="${page}"]`).forEach(el => el.classList.add("active"));

  // هـ) اجرای رفتارهای متحرک صفحه اصلی
  initDynamicFeatures();

  // و) اعلام پایان لود کامل تمام بخش‌ها
  window.dispatchEvent(new Event("allModulesLoaded"));
});

// ==================== ۲. حفظ نشست کاربر و به‌روزرسانی هدر در کل سایت ====================
function syncGlobalUserState() {
  let user = null;
  try {
    const saved = localStorage.getItem('site_user_auth');
    if (saved) {
      user = JSON.parse(saved);
    }
  } catch (e) {
    console.warn("خطا در بازیابی نشست کاربری:", e);
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
    } else {
      if (avatarImg) avatarImg.style.display = "none";
      if (avatarPlaceholder) avatarPlaceholder.style.display = "flex";
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

// در دسترس قرار دادن تابع برای صدا زدن پس از لاگین/خروج
window.syncGlobalUserState = syncGlobalUserState;

// ==================== ۳. سوئیچر تب‌های منوی کشویی موبایل ====================
window.switchDrawerTab = function(tabName) {
  const tabPages = document.getElementById("drawerTabPages");
  const tabSocials = document.getElementById("drawerTabSocials");
  const btnPages = document.getElementById("btnDrawerPages");
  const btnSocials = document.getElementById("btnDrawerSocials");

  if (tabName === "pages") {
    if (tabPages) tabPages.classList.add("active");
    if (tabSocials) tabSocials.classList.remove("active");
    if (btnPages) btnPages.classList.add("active");
    if (btnSocials) btnSocials.classList.remove("active");
  } else {
    if (tabSocials) tabSocials.classList.add("active");
    if (tabPages) tabPages.classList.remove("active");
    if (btnSocials) btnSocials.classList.add("active");
    if (btnPages) btnPages.classList.remove("active");
  }
};

// ==================== ۴. توابع کمکی قالب ====================
async function loadAllNestedIncludes() {
  let pending = document.querySelectorAll("[data-include]");
  while (pending.length > 0) {
    for (const el of pending) {
      const file = el.getAttribute("data-include");
      try {
        const res = await fetch(file);
        el.outerHTML = await res.text();
      } catch (err) {
        console.error(`Error loading include file (${file}):`, err);
        el.removeAttribute("data-include");
      }
    }
    pending = document.querySelectorAll("[data-include]");
  }
}

function initDynamicFeatures() {
  const target = document.getElementById("typeTarget");
  if (target) {
    const phrases = ["فروشگاه‌های آنلاین ووکامرس", "وب‌سایت‌های شرکتی مدرن", "سامانه‌های متصل به دیتابیس"];
    let pIdx = 0, chIdx = 0, isDel = false;
    function run() {
      const cur = phrases[pIdx];
      if (isDel) {
        target.textContent = cur.substring(0, chIdx--);
        if (chIdx < 0) { isDel = false; pIdx = (pIdx + 1) % phrases.length; setTimeout(run, 350); return; }
      } else {
        target.textContent = cur.substring(0, chIdx++);
        if (chIdx > cur.length) { isDel = true; setTimeout(run, 1800); return; }
      }
      setTimeout(run, isDel ? 30 : 65);
    }
    run();
  }

  const activeFaq = document.querySelector(".faq-item.active .faq-a");
  if (activeFaq) activeFaq.style.maxHeight = activeFaq.scrollHeight + "px";
}

window.toggleFaq = function(btn) {
  const item = btn.parentElement;
  const ans = item.querySelector(".faq-a");
  const isOpen = item.classList.contains("active");

  document.querySelectorAll(".faq-item").forEach(i => {
    i.classList.remove("active");
    i.querySelector(".faq-a").style.maxHeight = null;
  });

  if (!isOpen) {
    item.classList.add("active");
    ans.style.maxHeight = ans.scrollHeight + "px";
  }
};

window.filterProjects = function(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  document.querySelectorAll('.project-card').forEach(card => {
    if (cat === 'all' || card.getAttribute('data-cat') === cat) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
};
