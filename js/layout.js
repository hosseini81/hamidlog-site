// ==================== تنظیمات و آدرس وب‌اپلیکیشن ====================
const SCRIPT_API_URL = "https://script.google.com/macros/s/AKfycbzN_Bi4QiDSHA7WoWs1ZoaolA3ipi47GvJ9FrEpsUVDCGLj6QJ6lurKkPCAt-eGXMpT-Q/exec";

let appDb = { packages: [], services: [], downloadProducts: [] };
let activePackage = null;
let currentDiscountAmount = 0;
let appliedCouponCode = "";
let isLoginMode = true;

// ==================== ۱. بارگذاری ساختار ماژولار قالب ====================
document.addEventListener("DOMContentLoaded", async () => {
  // الف) لود اسلات‌های اصلی (هدر و فوتر)
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

  // ب) لود سکشن‌های داخلی صفحات با data-include
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

  // ج) منوی همبرگری موبایل
  const burger = document.getElementById("hamburgerBtn");
  const drawer = document.getElementById("mobileDrawer");
  if (burger && drawer) {
    burger.addEventListener("click", () => {
      burger.classList.toggle("open");
      drawer.classList.toggle("show");
    });
  }

  // د) هایلایت کردن تب صفحه فعال
  const page = window.location.pathname.split("/").pop().replace(".html", "") || "index";
  document.querySelectorAll(`[data-page="${page}"]`).forEach(el => el.classList.add("active"));

  // هـ) اجرای رفتارهای متحرک صفحه اصلی
  initDynamicFeatures();

  // و) فراخوانی اطلاعات سامانه سفارش در صورت حضور فرم در صفحه
  if (document.getElementById("dataLoader")) {
    fetchAppInitialData();
  }
});

// ==================== ۲. رفتارهای تعاملی صفحات ====================
function initDynamicFeatures() {
  // انیمیشن تایپ یکنواخت
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

  // ارتفاع اولیه FAQ باز
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

// فیلتر دسته‌بندی پروژه‌ها
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

// ==================== ۳. هسته ارتباط با سرور و حل CORS ====================
// تابع ارسال درخواست به Apps Script بدون تداخل CORS
async function sendToAppScript(payloadData) {
  const response = await fetch(SCRIPT_API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payloadData)
  });
  return await response.json();
}

// تابع واکشی اولیه اطلاعات با راهکار ضد قفل
async function fetchAppInitialData() {
  const loader = document.getElementById("dataLoader");
  if (!loader) return;

  try {
    const res = await fetch(`${SCRIPT_API_URL}?action=getInitialData`);
    const result = await res.json();

    if (result && result.success && result.data) {
      setupInitialDb(result.data);
    } else {
      throw new Error(result.error || "خطا در خروجی داده‌ها");
    }
  } catch (err) {
    console.warn("ارتباط مستقیم با متد GET مسدود شد. تلاش با روش جانبی JSONP...", err);
    loadViaJsonp();
  }
}

// راهکار کمکی بارگذاری از سرور در صورت انسداد مرورگر
function loadViaJsonp() {
  const loader = document.getElementById("dataLoader");
  const script = document.createElement("script");
  
  window.onGoogleSheetDataLoaded = function(result) {
    if (result && result.success && result.data) {
      setupInitialDb(result.data);
    } else {
      if (loader) loader.innerHTML = "⚠️ خطا در خواندن شیت. لطفاً ستون‌های شیت را بررسی کنید.";
    }
  };

  script.src = `${SCRIPT_API_URL}?action=getInitialData&callback=onGoogleSheetDataLoaded`;
  script.onerror = () => {
    if (loader) loader.innerHTML = "❌ ارتباط با سرور ابری برقرار نشد. لطفاً دسترسی Deploy را در گوگل روی Anyone قرار دهید.";
  };
  document.body.appendChild(script);
}

// آماده‌سازی المان‌ها پس از دریافت داده
function setupInitialDb(data) {
  appDb = data;
  const loader = document.getElementById("dataLoader");
  if (loader) loader.style.display = "none";

  renderPackages();
  renderServices();

  const pkgSec = document.getElementById("pkgSection");
  const srvSec = document.getElementById("servicesSection");
  const paySec = document.getElementById("paymentTypeSection");

  if (pkgSec) pkgSec.style.display = "block";
  if (srvSec) srvSec.style.display = "block";
  if (paySec) paySec.style.display = "block";

  calculateOrderTotal();
}

// ==================== ۴. رندر پکیج‌ها و خدمات ====================
function renderPackages() {
  const container = document.getElementById("packagesContainer");
  if (!container || !appDb.packages) return;
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
        <span class="pkg-price">${pkg.discount ? `تخفیف: ${pkg.discount}٪` : "تعرفه پایه"}</span>
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

function renderServices() {
  const container = document.getElementById("servicesContainer");
  if (!container || !appDb.services) return;
  container.innerHTML = "";

  appDb.services.forEach(srv => {
    const item = document.createElement("div");
    item.className = "service-check-item";

    let variantsHtml = "";
    if (srv.variants && srv.variants.length > 0) {
      variantsHtml = `<select class="variant-select" onchange="calculateOrderTotal()">`;
      srv.variants.forEach(v => {
        variantsHtml += `<option value="${v.id}" data-price="${v.price}" data-days="${v.days}">${v.brand} - ${v.modelTitle} (+${Number(v.price).toLocaleString('fa-IR')} ت)</option>`;
      });
      variantsHtml += `</select>`;
    }

    item.innerHTML = `
      <div class="service-main-row">
        <label class="service-label-group">
          <input type="checkbox" class="srv-checkbox" value="${srv.id}" data-base-price="${srv.price}" data-days="${srv.days}" data-title="${srv.title}" onchange="calculateOrderTotal()">
          <span>${srv.title}</span>
        </label>
        <strong style="color:var(--primary); font-size:11px;">+${Number(srv.price).toLocaleString('fa-IR')} تومان</strong>
      </div>
      ${variantsHtml}
    `;
    container.appendChild(item);
  });
}

// ==================== ۵. محاسبات آنلاین پیش‌فاکتور ====================
window.calculateOrderTotal = function() {
  if (!activePackage) return;

  const invPkgTitle = document.getElementById("invPkgTitle");
  const invPkgPrice = document.getElementById("invPkgPrice");
  const invAddedList = document.getElementById("invAddedServices");
  const invDiscount = document.getElementById("invDiscountPrice");
  const invFinal = document.getElementById("invFinalPrice");
  const invPayable = document.getElementById("invPayableNow");

  if (invPkgTitle) invPkgTitle.textContent = activePackage.title;

  // مجموع مبالغ خدمات پایه پکیج
  let pkgBaseSum = 0;
  if (activePackage.services && appDb.services) {
    activePackage.services.forEach(sId => {
      const match = appDb.services.find(s => s.id === sId);
      if (match) pkgBaseSum += match.price;
    });
  }
  if (pkgBaseSum === 0) pkgBaseSum = 7500000;
  if (invPkgPrice) invPkgPrice.textContent = pkgBaseSum.toLocaleString('fa-IR') + " تومان";

  // خدمات مازاد
  if (invAddedList) invAddedList.innerHTML = "";
  let addedSum = 0;
  const addedDetails = [];

  document.querySelectorAll(".srv-checkbox:checked").forEach(cb => {
    const parent = cb.closest(".service-check-item");
    const vSelect = parent ? parent.querySelector(".variant-select") : null;
    let itemPrice = Number(cb.getAttribute("data-base-price")) || 0;
    let vTitle = "";

    if (vSelect && vSelect.selectedOptions[0]) {
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

    if (invAddedList) {
      const row = document.createElement("div");
      row.className = "inv-add-item";
      row.innerHTML = `<span>+ ${cb.getAttribute("data-title")}</span><strong>${itemPrice.toLocaleString('fa-IR')} ت</strong>`;
      invAddedList.appendChild(row);
    }
  });

  const rawSubTotal = pkgBaseSum + addedSum;
  const payTypeEl = document.querySelector('input[name="paymentType"]:checked');
  const payType = payTypeEl ? payTypeEl.value : "full";

  let finalPrice = rawSubTotal;
  let payableAmount = 0;

  if (payType === "full") {
    finalPrice = Math.round(rawSubTotal * 0.95);
    payableAmount = finalPrice - currentDiscountAmount;
    if (invDiscount) invDiscount.textContent = "۵٪ نقدی" + (currentDiscountAmount > 0 ? ` + ${currentDiscountAmount.toLocaleString('fa-IR')} تخفیف` : "");
  } else {
    finalPrice = Math.round(rawSubTotal * 1.05);
    payableAmount = Math.round(finalPrice * 0.4) - currentDiscountAmount;
    if (invDiscount) invDiscount.textContent = "اقساطی (۴۰٪ پیش‌پرداخت)";
  }

  payableAmount = Math.max(1000, payableAmount);

  if (invFinal) invFinal.textContent = finalPrice.toLocaleString('fa-IR') + " تومان";
  if (invPayable) invPayable.textContent = payableAmount.toLocaleString('fa-IR') + " تومان";

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
};

// اعمال کوپن تخفیف
window.applyCoupon = async function() {
  const codeInput = document.getElementById("couponInput");
  const msg = document.getElementById("couponMsg");
  if (!codeInput || !msg) return;

  const code = codeInput.value.trim();
  if (!code) return;

  msg.textContent = "در حال بررسی اعتبارسنجی...";
  msg.style.color = "#2563eb";

  try {
    const data = await sendToAppScript({ action: "validateCoupon", code: code, total: 5000000 });
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
};

// ==================== ۶. ارسال سفارش و اتصال به درگاه شاپرک ====================
window.handleFinalSubmit = async function(e) {
  e.preventDefault();
  const btn = document.getElementById("submitOrderBtn");
  const msg = document.getElementById("orderStatusMsg");
  const nameInput = document.getElementById("orderCustName");
  const phoneInput = document.getElementById("orderCustPhone");

  if (!nameInput || !phoneInput) return;

  const orderData = calculateOrderTotal();
  orderData.customerName = nameInput.value.trim();
  orderData.customerPhone = phoneInput.value.trim();

  btn.disabled = true;
  btn.textContent = "در حال صدور فاکتور و اتصال به درگاه شاپرک...";
  msg.style.display = "block";
  msg.style.background = "#eff6ff";
  msg.style.color = "#1d4ed8";
  msg.textContent = "در حال ثبت فاکتور رسمی و اتصال به زرین‌پال...";

  try {
    const result = await sendToAppScript({ action: "submitOrder", payload: orderData });

    if (result.success && result.paymentUrl) {
      msg.style.background = "#dcfce7";
      msg.style.color = "#166534";
      msg.textContent = `پیش‌فاکتور با کد ${result.trackingCode} صادر شد. انتقال به درگاه بانکی...`;
      window.location.href = result.paymentUrl;
    } else {
      msg.style.background = "#fee2e2";
      msg.style.color = "#991b1b";
      msg.textContent = result.error || "خطا در اتصال به درگاه بانکی.";
      btn.disabled = false;
      btn.textContent = "💳 ثبت سفارش و ورود به درگاه شاپرک";
    }
  } catch (err) {
    msg.style.background = "#fee2e2";
    msg.style.color = "#991b1b";
    msg.textContent = "خطای غیرمنتظره در ثبت سفارش.";
    btn.disabled = false;
    btn.textContent = "💳 ثبت سفارش و ورود به درگاه شاپرک";
  }
};

// ==================== ۷. پنل مشتریان، ورود و پیگیری اقساط ====================
window.switchMainTab = function(tabId, btn) {
  document.querySelectorAll(".sys-tab-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
  btn.classList.add("active");
  const targetTab = document.getElementById(tabId);
  if (targetTab) targetTab.classList.add("active");
};

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

  msg.textContent = "در حال پردازش اطلاعات...";
  try {
    const result = await sendToAppScript({
      action: "auth",
      authType: isLoginMode ? "login" : "register",
      phone: phone,
      pass: pass,
      name: name
    });

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
    msg.style.color = "#dc2626";
  }
};

async function loadUserDashboard(phone) {
  const ordersWrap = document.getElementById("ordersContainer");
  const dlWrap = document.getElementById("downloadsContainer");
  if (!ordersWrap) return;
  ordersWrap.innerHTML = "در حال بارگذاری سوابق سفارشات...";

  try {
    const result = await sendToAppScript({ action: "getDashboard", phone: phone });
    ordersWrap.innerHTML = "";
    if (dlWrap) dlWrap.innerHTML = "";

    if (!result.data || result.data.orders.length === 0) {
      ordersWrap.innerHTML = "<p style='font-size:12px; color:#64748b;'>هنوز سفارشی برای این شماره ثبت نشده است.</p>";
      return;
    }

    result.data.orders.forEach(o => {
      const card = document.createElement("div");
      card.className = "order-tracking-card";
      card.innerHTML = `
        <div class="tracking-header">
          <span>کد پیگیری: ${o.trackingCode}</span>
          <span style="color:#16a34a;">${o.projectStatus}</span>
        </div>
        <p style="font-size:12px; font-weight:800; margin-bottom:4px;">${o.packageName}</p>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill" style="width:${o.progressPercent};"></div>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:10px; color:#64748b; margin-top:8px;">
          <span>مبلغ کل: ${Number(o.totalPrice).toLocaleString('fa-IR')} ت</span>
          <span>مانده حساب: ${Number(o.remainingAmount).toLocaleString('fa-IR')} ت</span>
        </div>
        <a href="${o.pdfUrl}" target="_blank" style="display:inline-block; margin-top:10px; font-size:11px; color:#2563eb; font-weight:800; text-decoration:none;">📄 دانلود PDF پیش‌فاکتور</a>
      `;
      ordersWrap.appendChild(card);
    });
  } catch (err) {
    ordersWrap.innerHTML = "خطا در دریافت لیست پروژه‌ها.";
  }
}

window.logoutUser = function() {
  document.getElementById("userDashboard").style.display = "none";
  document.getElementById("authBox").style.display = "block";
};
