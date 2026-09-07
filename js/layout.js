document.addEventListener("DOMContentLoaded", async () => {
  // ۱. بارگذاری هدر و فوتر
  const loadSlot = async (id, file) => {
    const el = document.getElementById(id);
    if (el) {
      const res = await fetch(file);
      el.innerHTML = await res.text();
    }
  };
  await loadSlot("header-slot", "components/header.html");
  await loadSlot("footer-slot", "components/footer.html");

  // ۲. بارگذاری قطعات اختصاصی صفحه (مانند بخش‌های صفحه اصلی)
  const includes = document.querySelectorAll("[data-include]");
  for (const el of includes) {
    const file = el.getAttribute("data-include");
    const res = await fetch(file);
    el.innerHTML = await res.text();
  }

  // ۳. فعال‌سازی منوی همبرگری موبایل
  const burger = document.getElementById("hamburgerBtn");
  const drawer = document.getElementById("mobileDrawer");
  if (burger && drawer) {
    burger.addEventListener("click", () => {
      burger.classList.toggle("open");
      drawer.classList.toggle("show");
    });
  }

  // ۴. اکتیو کردن تب صفحه در منو
  const page = window.location.pathname.split("/").pop().replace(".html", "") || "index";
  document.querySelectorAll(`[data-page="${page}"]`).forEach(el => el.classList.add("active"));

  // ۵. راه‌اندازی اسکریپت‌های پویا پس از لود کامل HTMLها
  initDynamicFeatures();
});

function initDynamicFeatures() {
  // افکت تایپ
  const target = document.getElementById("typeTarget");
  if (target) {
    const phrases = ["فروشگاه‌های آنلاین ووکامرس", "وب‌سایت‌های شرکتی مدرن", "سامانه‌های متصل به دیتابیس"];
    let pIdx = 0, chIdx = 0, isDel = false;
    function runType() {
      const cur = phrases[pIdx];
      if (isDel) {
        target.textContent = cur.substring(0, chIdx--);
        if (chIdx < 0) { isDel = false; pIdx = (pIdx + 1) % phrases.length; setTimeout(runType, 350); return; }
      } else {
        target.textContent = cur.substring(0, chIdx++);
        if (chIdx > cur.length) { isDel = true; setTimeout(runType, 1800); return; }
      }
      setTimeout(runType, isDel ? 30 : 65);
    }
    runType();
  }

  // تنظیم ارتفاع اولیه FAQ باز
  const activeFaq = document.querySelector(".faq-item.active .faq-a");
  if (activeFaq) activeFaq.style.maxHeight = activeFaq.scrollHeight + "px";
}

// تابع سراسری باز و بسته شدن سوالات متداول
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
