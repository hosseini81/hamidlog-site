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

  // ب) بارگذاری تمام بخش‌های data-include حتی به صورت تودرتو و لایه‌ای
  await loadAllNestedIncludes();

  // ج) منوی همبرگری موبایل
  const burger = document.getElementById("hamburgerBtn");
  const drawer = document.getElementById("mobileDrawer");
  if (burger && drawer) {
    burger.addEventListener("click", () => {
      burger.classList.toggle("open");
      drawer.classList.toggle("show");
    });
  }

  // د) علامت زدن لینک فعال صفحه در منو
  const page = window.location.pathname.split("/").pop().replace(".html", "") || "index";
  document.querySelectorAll(`[data-page="${page}"]`).forEach(el => el.classList.add("active"));

  // هـ) اجرای رفتارهای متحرک صفحه اصلی
  initDynamicFeatures();

  // و) اعلام پایان لود کامل تمام بخش‌ها جهت استارت موتور سفارش و پنل
  window.dispatchEvent(new Event("allModulesLoaded"));
});

// تابع هوشمند برای بارگذاری فایل‌های include تودرتو
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
    // بررسی مجدد برای فایل‌های لود شده جدید که خودشان data-include دارند
    pending = document.querySelectorAll("[data-include]");
  }
}

// رفتارهای متحرک صفحه اصلی (تایپ خودکار و FAQ)
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

// باز و بسته شدن سوالات متداول
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

// فیلتر دسته‌بندی پروژه‌ها در صفحه نمونه‌کار
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
