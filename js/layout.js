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



// ==================== لاجیک سامانه خدمات و پرداخت ====================
// آدرس وب‌اپلیکیشن گوگل‌اسکریپت برگرفته از فایل Code.gs
const SCRIPT_API_URL = "https://script.google.com/macros/s/AKfycbzN_Bi4QiDSHA7WoWs1ZoaolA3ipi47GvJ9FrEpsUVDCGLj6QJ6lurKkPCAt-eGXMpT-Q/exec";

let appDb = { packages: [], services: [], downloadProducts: [] };
let activePackage = null;
let currentDiscountAmount = 0;
let appliedCouponCode = "";
let isLoginMode = true;

// بارگذاری اولیه داده‌ها
async function fetchAppInitialData() {
  const loader = document.getElementById("dataLoader");
  if (!loader) return;

  try {
    const res = await fetch(SCRIPT_API_URL, {
      method: "POST",
      body: JSON.stringify({ action: "getInitialData" })
    });
    const result = await res.json();

    if (result.success) {
      appDb = result.data;
      renderPackages();
      renderServices();
      loader.style.display = "none";
      document.getElementById("pkgSection").style.display = "block";
      document.getElementById("servicesSection").style.display = "block";
      document.getElementById("paymentTypeSection").style.display = "block";
      calculateOrderTotal();
    }
  } catch (err) {
    loader.innerHTML = "❌ خطا در بارگذاری تعرفه‌ها. لطفاً مجدداً صفحه را رفرش کنید.";
  }
}

// نمایش پکیج‌ها
function renderPackages() {
  const container = document.getElementById("packagesContainer");
  if (!container) return;
  container.innerHTML = "";

  appDb.packages.forEach((pkg, index) => {
    const card = document.createElement("div");
    card.className = `pkg-card ${index === 0 ? "active" : ""}`;
    card.onclick = () => selectPackage(pkg.id, card);
    card.innerHTML = `
      <div>
        <div class="pkg-title">📦 ${pkg.title}</div>
        <div class="pkg-desc">${pkg.desc}</div>
      </div>
      <div class="pkg-meta">
        <span>⏱️ ${pkg.days} روز کاری</span>
        <span class="pkg-price">${pkg.discount ? `تخفیف: ${pkg.discount}٪` : "تعرفه اصلی"}</span>
      </div>
    `;
    container.appendChild(card);
    if (index === 0) activePackage = pkg;
  });
}

function selectPackage(pkgId, cardEl) {
  document.querySelectorAll(".pkg-card").forEach(c => c.classList.remove("active"));
  cardEl.classList.add("active");
  activePackage = appDb.packages.find(p => p.id === pkgId);
  calculateOrderTotal();
}

// نمایش خدمات تکمیلی
function renderServices() {
  const container = document.getElementById("servicesContainer");
  if (!container) return;
  container.innerHTML = "";

  appDb.services.forEach(srv => {
    const item = document.createElement("div");
    item.className = "service-check-item";

    let variantsHtml = "";
    if (srv.variants && srv.variants.length > 0) {
      variantsHtml = `<select class="variant-select" onchange="calculateOrderTotal()">`;
      srv.variants.forEach(v => {
        variantsHtml += `<option value="${v.id}" data-price="${v.price}" data-days="${v.days}">${v.brand} - ${v.modelTitle} (+${v.price.toLocaleString('fa-IR')} ت)</option>`;
      });
      variantsHtml += `</select>`;
    }

    item.innerHTML = `
      <div class="service-main-row">
        <label class="service-label-group">
          <input type="checkbox" class="srv-checkbox" value="${srv.id}" data-base-price="${srv.price}" data-days="${srv.days}" data-title="${srv.title}" onchange="calculateOrderTotal()">
          <span>${srv.title}</span>
        </label>
        <strong style="color:var(--primary); font-size:11px;">+${srv.price.toLocaleString('fa-IR')} تومان</strong>
      </div>
      ${variantsHtml}
    `;
    container.appendChild(item);
  });
}

// محاسبه قیمت، اقساط و فاکتور
function calculateOrderTotal() {
  if (!activePackage) return;

  const invPkgTitle = document.getElementById("invPkgTitle");
  const invPkgPrice = document.getElementById("invPkgPrice");
  const invAddedList = document.getElementById("invAddedServices");
  const invDiscount = document.getElementById("invDiscountPrice");
  const invFinal = document.getElementById("invFinalPrice");
  const invPayable = document.getElementById("invPayableNow");

  invPkgTitle.textContent = activePackage.title;

  // محاسبه مجموع پکیج پایه (با خدمات شامل‌شده)
  let pkgBaseSum = 0;
  if (activePackage.services) {
    activePackage.services.forEach(sId => {
      const match = appDb.services.find(s => s.id === sId);
      if (match) pkgBaseSum += match.price;
    });
  }
  if (pkgBaseSum === 0) pkgBaseSum = 7500000; // پیش‌فرض در صورت خالی بودن شیت پکیج
  invPkgPrice.textContent = pkgBaseSum.toLocaleString('fa-IR') + " تومان";

  // خدمات اضافه شده انتخابی
  invAddedList.innerHTML = "";
  let addedSum = 0;
  const addedDetails = [];

  document.querySelectorAll(".srv-checkbox:checked").forEach(cb => {
    const parent = cb.closest(".service-check-item");
    const vSelect = parent.querySelector(".variant-select");
    let itemPrice = Number(cb.getAttribute("data-base-price")) || 0;
    let vTitle = "";

    if (vSelect) {
      const opt = vSelect.selectedOptions[0];
      itemPrice = Number(opt.getAttribute("data-price")) || itemPrice;
      vTitle = opt.text;
    }

    addedSum += itemPrice;
    addedDetails.push({
      id: cb.value,
      title: cb.getAttribute("data-title"),
      price: itemPrice,
      variantInfo: vTitle,
      days: Number(cb.getAttribute("data-days")) || 0
    });

    const row = document.createElement("div");
    row.className = "inv-add-item";
    row.innerHTML = `<span>+ ${cb.getAttribute("data-title")}</span><strong>${itemPrice.toLocaleString('fa-IR')} ت</strong>`;
    invAddedList.appendChild(row);
  });

  const rawSubTotal = pkgBaseSum + addedSum;
  const payType = document.querySelector('input[name="paymentType"]:checked').value;

  // اعمال تخفیف نقدی ۵٪ یا افزایش اقساطی ۵٪
  let finalPrice = rawSubTotal;
  let payableAmount = 0;

  if (payType === "full") {
    finalPrice = Math.round(rawSubTotal * 0.95);
    payableAmount = finalPrice - currentDiscountAmount;
    invDiscount.textContent = "۵٪ نقدی" + (currentDiscountAmount > 0 ? ` + ${currentDiscountAmount.toLocaleString('fa-IR')} تخفیف` : "");
  } else {
    finalPrice = Math.round(rawSubTotal * 1.05);
    payableAmount = Math.round(finalPrice * 0.4) - currentDiscountAmount;
    invDiscount.textContent = "اقساطی (۴۰٪ پیش‌پرداخت)";
  }

  payableAmount = Math.max(1000, payableAmount);

  invFinal.textContent = finalPrice.toLocaleString('fa-IR') + " تومان";
  invPayable.textContent = payableAmount.toLocaleString('fa-IR') + " تومان";

  return {
    packageName: activePackage.title,
    pkgBaseSum: pkgBaseSum,
    addedDetails: addedDetails,
    addedServicesSummary: addedDetails.map(d => `${d.title} (${d.price} ت)`),
    deductedServicesSummary: [],
    finalPriceNumeric: finalPrice,
    paymentType: payType,
    payableAmount: payableAmount
  };
}

// بررسی کد تخفیف
async function applyCoupon() {
  const code = document.getElementById("couponInput").value.trim();
  const msg = document.getElementById("couponMsg");
  if (!code) return;

  msg.textContent = "در حال بررسی...";
  msg.style.color = "#2563eb";

  try {
    const res = await fetch(SCRIPT_API_URL, {
      method: "POST",
      body: JSON.stringify({ action: "validateCoupon", code: code, total: 5000000 })
    });
    const data = await res.json();
    if (data.valid) {
      currentDiscountAmount = data.discountAmount;
      appliedCouponCode = data.code;
      msg.textContent = data.message;
      msg.style.color = "#16a34a";
      calculateOrderTotal();
    } else {
      msg.textContent = data.message;
      msg.style.color = "#dc2626";
    }
  } catch (err) {
    msg.textContent = "خطا در ارتباط با سرور تخفیف.";
    msg.style.color = "#dc2626";
  }
}

// ارسال نهایی سفارش و دریافت درگاه زرین‌پال
async function handleFinalSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById("submitOrderBtn");
  const msg = document.getElementById("orderStatusMsg");
  const name = document.getElementById("orderCustName").value.trim();
  const phone = document.getElementById("orderCustPhone").value.trim();

  const orderData = calculateOrderTotal();
  orderData.customerName = name;
  orderData.customerPhone = phone;

  btn.disabled = true;
  btn.textContent = "در حال ایجاد پیش‌فاکتور و اتصال به درگاه شاپرک...";
  msg.style.display = "block";
  msg.style.background = "#eff6ff";
  msg.style.color = "#1d4ed8";
  msg.textContent = "در حال صدور فاکتور رسمی و ارسال داده‌ها به زرین‌پال...";

  try {
    const res = await fetch(SCRIPT_API_URL, {
      method: "POST",
      body: JSON.stringify({ action: "submitOrder", payload: orderData })
    });
    const result = await res.json();

    if (result.success && result.paymentUrl) {
      msg.style.background = "#dcfce7";
      msg.style.color = "#166534";
      msg.textContent = `پیش‌فاکتور صادر شد (${result.trackingCode}). انتقال به درگاه بانکی...`;
      window.location.href = result.paymentUrl;
    } else {
      msg.style.background = "#fee2e2";
      msg.style.color = "#991b1b";
      msg.textContent = result.error || "خطا در اتصال به درگاه زرین‌پال.";
      btn.disabled = false;
      btn.textContent = "💳 ثبت سفارش و ورود به درگاه شاپرک";
    }
  } catch (err) {
    msg.style.background = "#fee2e2";
    msg.style.color = "#991b1b";
    msg.textContent = "خطای ارتباطی با سرور ابری.";
    btn.disabled = false;
    btn.textContent = "💳 ثبت سفارش و ورود به درگاه شاپرک";
  }
}

// جابجایی تب‌های سامانه
window.switchMainTab = function(tabId, btn) {
  document.querySelectorAll(".sys-tab-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById(tabId).classList.add("active");
};

// ورود و ثبت نام
window.toggleAuthMode = function() {
  isLoginMode = !isLoginMode;
  document.getElementById("authTitle").textContent = isLoginMode ? "ورود به پنل کاربری" : "ثبت نام حساب جدید";
  document.getElementById("authName").style.display = isLoginMode ? "none" : "block";
  document.getElementById("authSubmitBtn").textContent = isLoginMode ? "ورود به پنل" : "ثبت نام و ایجاد حساب";
  document.getElementById("authToggleText").textContent = isLoginMode ? "حساب کاربری ندارید؟" : "قبلاً ثبت نام کرده‌اید؟";
};

window.processAuth = async function() {
  const phone = document.getElementById("authPhone").value.trim();
  const pass = document.getElementById("authPass").value.trim();
  const name = document.getElementById("authName").value.trim();
  const msg = document.getElementById("authMsg");

  msg.textContent = "در حال پردازش...";
  try {
    const res = await fetch(SCRIPT_API_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "auth",
        authType: isLoginMode ? "login" : "register",
        phone: phone,
        pass: pass,
        name: name
      })
    });
    const result = await res.json();

    if (result.success) {
      document.getElementById("authBox").style.display = "none";
      document.getElementById("userDashboard").style.display = "block";
      document.getElementById("dashUserName").textContent = result.user.name;
      document.getElementById("dashUserPhone").textContent = result.user.phone;
      loadUserDashboard(result.user.phone);
    } else {
      msg.textContent = result.message;
      msg.style.color = "#dc2626";
    }
  } catch (err) {
    msg.textContent = "خطا در برقراری ارتباط.";
  }
};

async function loadUserDashboard(phone) {
  const ordersWrap = document.getElementById("ordersContainer");
  const dlWrap = document.getElementById("downloadsContainer");
  ordersWrap.innerHTML = "در حال بارگذاری سوابق سفارشات...";

  try {
    const res = await fetch(SCRIPT_API_URL, {
      method: "POST",
      body: JSON.stringify({ action: "getDashboard", phone: phone })
    });
    const result = await res.json();
    ordersWrap.innerHTML = "";
    dlWrap.innerHTML = "";

    if (result.data.orders.length === 0) {
      ordersWrap.innerHTML = "<p style='font-size:12px; color:#64748b;'>هنوز سفارشی ثبت نکرده‌اید.</p>";
    }

    result.data.orders.forEach(o => {
      const card = document.createElement("div");
      card.className = "order-tracking-card";
      card.innerHTML = `
        <div class="tracking-header">
          <span>کد: ${o.trackingCode}</span>
          <span style="color:#16a34a;">${o.projectStatus}</span>
        </div>
        <p style="font-size:12px; font-weight:800; margin-bottom:4px;">${o.packageName}</p>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill" style="width:${o.progressPercent};"></div>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:10px; color:#64748b; margin-top:8px;">
          <span>مبلغ کل: ${o.totalPrice.toLocaleString('fa-IR')} ت</span>
          <span>مانده: ${o.remainingAmount.toLocaleString('fa-IR')} ت</span>
        </div>
        <a href="${o.pdfUrl}" target="_blank" style="display:inline-block; margin-top:10px; font-size:11px; color:#2563eb; font-weight:800; text-decoration:none;">📄 دانلود PDF پیش‌فاکتور</a>
      `;
      ordersWrap.appendChild(card);
    });
  } catch (err) {
    ordersWrap.innerHTML = "خطا در دریافت پروژه‌ها.";
  }
}

window.logoutUser = function() {
  document.getElementById("userDashboard").style.display = "none";
  document.getElementById("authBox").style.display = "block";
};

// راه‌اندازی پس از لود شدن ماژول
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(fetchAppInitialData, 300);
});
