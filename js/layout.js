document.addEventListener("DOMContentLoaded", async () => {
  // ۱. بارگذاری هدر و فوتر
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

  // ۲. بارگذاری خودکار تمام بخش‌های مشخص شده با data-include
  const includes = document.querySelectorAll("[data-include]");
  for (const el of includes) {
    const file = el.getAttribute("data-include");
    try {
      const res = await fetch(file);
      el.outerHTML = await res.text();
    } catch (err) {
      console.error(`Error loading ${file}:`, err);
    }
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

  // ۴. اکتیو کردن لینک صفحه در منو
  const page = window.location.pathname.split("/").pop().replace(".html", "") || "index";
  document.querySelectorAll(`[data-page="${page}"]`).forEach(el => el.classList.add("active"));

  // ۵. اجرای توابع تعاملی (تایپ متن و آکاردئون)
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



// تابع فیلتر دسته‌بندی پروژه‌ها
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



// متغیر ذخیره URL دریافتی از گوگل شیت
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzN_Bi4QiDSHA7WoWs1ZoaolA3ipi47GvJ9FrEpsUVDCGLj6QJ6lurKkPCAt-eGXMpT-Q/exec";

// تولید کد تصادفی سفارش
let currentOrderId = "ORD-" + Math.floor(1000 + Math.random() * 9000);

// محاسبه آنلاین مجموع فاکتور
window.calcTotal = function() {
  const codeEl = document.getElementById("orderIdText");
  if (codeEl) codeEl.textContent = "#" + currentOrderId;

  const planEl = document.querySelector('input[name="plan"]:checked');
  if (!planEl) return;

  const planPrice = parseInt(planEl.getAttribute("data-price"), 10);
  const planName = planEl.getAttribute("data-name");

  document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('active'));
  planEl.closest('.plan-card').classList.add('active');

  let featuresPrice = 0;
  const featuresListWrap = document.getElementById("selectedFeaturesList");
  if (featuresListWrap) featuresListWrap.innerHTML = "";

  document.querySelectorAll('.feature-opt:checked').forEach(f => {
    const fPrice = parseInt(f.getAttribute("data-price"), 10);
    featuresPrice += fPrice;

    if (featuresListWrap) {
      const row = document.createElement("div");
      row.className = "feature-item-row";
      row.innerHTML = `<span>+ ${f.value}</span><span>${fPrice.toLocaleString('fa-IR')}</span>`;
      featuresListWrap.appendChild(row);
    }
  });

  const grandTotal = planPrice + featuresPrice;

  const sumPlanName = document.getElementById("sumPlanName");
  const sumPlanPrice = document.getElementById("sumPlanPrice");
  const sumTotalPrice = document.getElementById("sumTotalPrice");

  if (sumPlanName) sumPlanName.textContent = planName;
  if (sumPlanPrice) sumPlanPrice.textContent = planPrice.toLocaleString('fa-IR') + " تومان";
  if (sumTotalPrice) sumTotalPrice.textContent = grandTotal.toLocaleString('fa-IR') + " تومان";

  return { planName, grandTotal };
};

// ارسال سفارش به گوگل‌شیت
window.submitOrder = async function(e) {
  e.preventDefault();
  const btn = document.getElementById("submitBtn");
  const msg = document.getElementById("statusMessage");

  const name = document.getElementById("custName").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  const activePlan = document.querySelector('input[name="plan"]:checked');

  const selectedFeatures = [];
  document.querySelectorAll('.feature-opt:checked').forEach(f => selectedFeatures.push(f.value));

  const total = window.calcTotal();

  btn.disabled = true;
  btn.textContent = "در حال ثبت اطلاعات...";
  msg.style.display = "block";
  msg.style.background = "#eff6ff";
  msg.style.color = "#1d4ed8";
  msg.textContent = "ارتباط با سرور...";

  try {
    await fetch(WEB_APP_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: currentOrderId,
        fullName: name,
        phone: phone,
        planName: total.planName,
        features: selectedFeatures,
        totalPrice: total.grandTotal
      })
    });

    msg.style.background = "#dcfce7";
    msg.style.color = "#166534";
    msg.textContent = "✅ فاکتور با موفقیت ثبت شد. به زودی جهت هماهنگی با شما تماس می‌گیریم.";
    document.getElementById("leadForm").reset();

  } catch (err) {
    msg.style.background = "#fee2e2";
    msg.style.color = "#991b1b";
    msg.textContent = "خطا در برقراری ارتباط. لطفاً از طریق تلگرام با ما تماس بگیرید.";
  } finally {
    btn.disabled = false;
    btn.textContent = "ثبت نهایی و دریافت مشاوره ➔";
  }
};
