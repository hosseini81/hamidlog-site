// ==================== موتور استعلام، پیش‌فاکتور و پرداخت ====================
const SCRIPT_API_URL = "https://script.google.com/macros/s/AKfycbzN_Bi4QiDSHA7WoWs1ZoaolA3ipi47GvJ9FrEpsUVDCGLj6QJ6lurKkPCAt-eGXMpT-Q/exec";

let currentStep = 1;
let appData = { packages: [], services: [], downloadProducts: [] };
let selectedPackage = null;
let extraSelectedIds = new Set();
let deductedIds = new Set();
let selectedVariants = {};
let selectedCycles = {};

let extraViewMode = 'list';
let deductViewMode = 'list';
let currentExtraCategory = 'all';
let currentDeductCategory = 'all';

let appliedCoupon = null;
let calculatedFinalPrice = 0;
let calculatedFinalDays = 0;
let pkgBaseSum = 0;
let calculatedDeductedSum = 0;

// تابع عمومی ارسال به گوگل اسکریپت
async function sendToAppScript(payloadData) {
  const response = await fetch(SCRIPT_API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payloadData)
  });
  return await response.json();
}

// پاپ‌آپ اختصاصی
window.showCustomAlert = function(title, text, icon = '⚠️') {
  const iconEl = document.getElementById('customAlertIcon');
  const titleEl = document.getElementById('customAlertTitle');
  const textEl = document.getElementById('customAlertText');
  const alertEl = document.getElementById('customAlert');

  if (iconEl) iconEl.textContent = icon;
  if (titleEl) titleEl.textContent = title;
  if (textEl) textEl.textContent = text;
  if (alertEl) alertEl.style.display = 'flex';
};

window.closeCustomAlert = function() {
  const alertEl = document.getElementById('customAlert');
  if (alertEl) alertEl.style.display = 'none';
};

// راه‌اندازی مستقل و مستقیم
function initOrderEngine() {
  if (document.getElementById("dataLoader") || document.getElementById("packagesGrid")) {
    fetchInitialData();
  }
}

// گوش دادن به هر دو حالت لود
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initOrderEngine);
} else {
  initOrderEngine();
}
window.addEventListener("allModulesLoaded", initOrderEngine);

// سوئیچ تب‌های سامانه
window.switchNavTab = function(tabId) {
  document.querySelectorAll('.hub-tab-panel').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.hub-tab-btn').forEach(btn => btn.classList.remove('active'));

  const target = document.getElementById(tabId);
  const btn = document.getElementById('btn-' + tabId);
  if (target) target.classList.add('active');
  if (btn) btn.classList.add('active');

  if (tabId === 'tabProduct') renderShopProducts();
};

// دریافت اطلاعات اولیه شیت
async function fetchInitialData() {
  const loader = document.getElementById("dataLoader");
  try {
    const res = await fetch(`${SCRIPT_API_URL}?action=getInitialData`);
    const result = await res.json();

    if (result && result.success && result.data) {
      appData = result.data;
      if (loader) loader.style.display = "none";
      const grid = document.getElementById("orderMainGrid");
      if (grid) grid.style.display = "grid";

      renderPackages();
      renderShopProducts();
    } else {
      throw new Error(result.error || "خروجی نامعتبر");
    }
  } catch (err) {
    loadViaJsonp();
  }
}

function loadViaJsonp() {
  const loader = document.getElementById("dataLoader");
  const script = document.createElement("script");

  window.onGoogleSheetDataLoaded = function(result) {
    if (result && result.success && result.data) {
      appData = result.data;
      if (loader) loader.style.display = "none";
      const grid = document.getElementById("orderMainGrid");
      if (grid) grid.style.display = "grid";

      renderPackages();
      renderShopProducts();
    } else {
      if (loader) loader.innerHTML = "⚠️ خطا در دریافت اطلاعات. ستون‌های شیت را بررسی فرمایید.";
    }
  };

  script.src = `${SCRIPT_API_URL}?action=getInitialData&callback=onGoogleSheetDataLoaded`;
  document.body.appendChild(script);
}

// رندر پکیج‌ها
function renderPackages() {
  const grid = document.getElementById('packagesGrid');
  if (!grid || !appData.packages) return;
  grid.innerHTML = '';

  if (!selectedPackage && appData.packages.length > 0) {
    selectedPackage = appData.packages[0];
  }

  appData.packages.forEach(pkg => {
    const isSelected = selectedPackage && String(selectedPackage.id) === String(pkg.id);
    const mediaHtml = pkg.imageUrl 
      ? `<img src="${pkg.imageUrl}" class="package-card-media" alt="${pkg.title}" onerror="this.outerHTML='<div class=\\'package-card-placeholder\\'>📦</div>'">`
      : `<div class="package-card-placeholder">📦</div>`;

    grid.innerHTML += `
      <div class="package-card ${isSelected ? 'selected' : ''}" onclick="selectPackageById('${pkg.id}')">
        ${mediaHtml}
        <div class="package-card-body">
          <div class="package-card-title">
            <span>${pkg.title}</span>
            ${isSelected ? '<span style="color:var(--primary);">✔</span>' : ''}
          </div>
          <div class="package-card-desc">${pkg.desc}</div>
          <div class="package-card-footer">
            <span>زمان: <strong>${pkg.days} روز</strong></span>
            ${pkg.discount > 0 ? `<span class="badge badge-cycle">${pkg.discount}٪ تخفیف</span>` : ''}
          </div>
        </div>
      </div>
    `;
  });

  onPackageSelected();
}

window.selectPackageById = function(pkgId) {
  selectedPackage = appData.packages.find(p => String(p.id) === String(pkgId));
  renderPackages();
};

function onPackageSelected() {
  extraSelectedIds.clear();
  deductedIds.clear();
  selectedVariants = {};
  selectedCycles = {};
  appliedCoupon = null;

  const msgEl = document.getElementById('couponMessage');
  if (msgEl) msgEl.textContent = '';

  if (!selectedPackage) return;

  const pkgServiceIds = (selectedPackage.services || []).map(id => String(id).trim().toLowerCase());
  appData.services.filter(s => pkgServiceIds.includes(String(s.id).trim().toLowerCase())).forEach(s => {
    if (s.variants && s.variants.length > 0) selectedVariants[s.id] = s.variants[0].id;
    if (s.billingCycle === 'ماهانه') selectedCycles[s.id] = 1;
  });

  refreshViews();
}

function refreshViews() {
  renderExtraItems();
  renderDeductItems();
  calculateSummary();
}

function getEffectiveService(service) {
  let basePrice = Number(service.price) || 0;
  let baseDays = Number(service.days) || 0;
  let vTitle = '';

  if (service.variants && service.variants.length > 0) {
    const chosenVarId = selectedVariants[service.id] || service.variants[0].id;
    const variant = service.variants.find(v => String(v.id) === String(chosenVarId)) || service.variants[0];
    basePrice = variant.price;
    baseDays = variant.days;
    vTitle = `${variant.brand ? variant.brand + ' - ' : ''}${variant.modelTitle}`;
  }

  const cycleMultiplier = (service.billingCycle === 'ماهانه') ? (selectedCycles[service.id] || 1) : 1;

  return {
    unitPrice: basePrice,
    price: basePrice * cycleMultiplier,
    days: baseDays,
    cycles: cycleMultiplier,
    isRecurring: service.billingCycle === 'ماهانه',
    variantTitle: vTitle
  };
}

function checkPrerequisites(service) {
  if (!service.prerequisites || service.prerequisites.length === 0) return true;
  const missing = [];
  const pkgServiceIds = (selectedPackage.services || []).map(id => String(id).trim().toLowerCase());

  service.prerequisites.forEach(preId => {
    const cleanPreId = String(preId).trim().toLowerCase();
    const inPkg = pkgServiceIds.includes(cleanPreId);
    const inExtra = Array.from(extraSelectedIds).some(id => String(id).trim().toLowerCase() === cleanPreId);
    const isDeducted = Array.from(deductedIds).some(id => String(id).trim().toLowerCase() === cleanPreId);

    if ((!inPkg && !inExtra) || isDeducted) {
      const preService = appData.services.find(s => String(s.id).trim().toLowerCase() === cleanPreId);
      missing.push(preService ? preService.title : preId);
    }
  });

  if (missing.length > 0) {
    showCustomAlert('نیازمند پیش‌نیاز', `برای انتخاب «${service.title}»، ابتدا باید «${missing.join(' و ')}» در سفارش موجود باشد.`);
    return false;
  }
  return true;
}

function renderThumbnailHtml(s) {
  if (s.imageUrl) {
    return `<img src="${s.imageUrl}" class="service-thumb" alt="${s.title}" onerror="this.outerHTML='<div class=\\'service-thumb-placeholder\\'>⚡</div>'">`;
  }
  return `<div class="service-thumb-placeholder">⚡</div>`;
}

function renderOptionsControl(s) {
  let html = '';
  const hasVariants = s.variants && s.variants.length > 0;
  const isRecurring = s.billingCycle === 'ماهانه';
  if (!hasVariants && !isRecurring) return '';

  html += `<div class="service-options-box" onclick="event.stopPropagation()">`;
  if (hasVariants) {
    const currentVal = selectedVariants[s.id] || s.variants[0].id;
    const options = s.variants.map(v => `
      <option value="${v.id}" ${String(v.id) === String(currentVal) ? 'selected' : ''}>
        ${v.brand ? v.brand + ' / ' : ''}${v.modelTitle} (+${Number(v.price).toLocaleString('fa-IR')} ت)
      </option>
    `).join('');
    html += `<span>مدل: <select onchange="onVariantChanged('${s.id}', this.value)">${options}</select></span>`;
  }

  if (isRecurring) {
    const currentCycle = selectedCycles[s.id] || 1;
    let cycleOptions = '';
    for (let i = 1; i <= 12; i++) {
      cycleOptions += `<option value="${i}" ${i === currentCycle ? 'selected' : ''}>${i} ماه</option>`;
    }
    html += `<span>دوره: <select onchange="onCycleChanged('${s.id}', this.value)">${cycleOptions}</select></span>`;
  }
  html += `</div>`;
  return html;
}

window.onVariantChanged = function(serviceId, variantId) {
  selectedVariants[serviceId] = variantId;
  refreshViews();
};

window.onCycleChanged = function(serviceId, cycleCount) {
  selectedCycles[serviceId] = Number(cycleCount);
  refreshViews();
};

window.toggleLayout = function(type, mode) {
  if (type === 'extra') {
    extraViewMode = mode;
    document.getElementById('extraListBtn').classList.toggle('active', mode === 'list');
    document.getElementById('extraGridBtn').classList.toggle('active', mode === 'grid');
    document.getElementById('extraItemsList').className = `services-container ${mode}-view`;
  } else {
    deductViewMode = mode;
    document.getElementById('deductListBtn').classList.toggle('active', mode === 'list');
    document.getElementById('deductGridBtn').classList.toggle('active', mode === 'grid');
    document.getElementById('deductItemsList').className = `services-container ${mode}-view`;
  }
};

function renderExtraCategoryFilters(categories) {
  const bar = document.getElementById('extraCatFilters');
  if (!bar) return;
  bar.innerHTML = `<button type="button" class="cat-pill-btn ${currentExtraCategory === 'all' ? 'active' : ''}" onclick="setExtraCategory('all')">همه دسته‌ها</button>`;
  categories.forEach(cat => {
    bar.innerHTML += `<button type="button" class="cat-pill-btn ${currentExtraCategory === cat ? 'active' : ''}" onclick="setExtraCategory('${cat}')">${cat}</button>`;
  });
}

window.setExtraCategory = function(cat) {
  currentExtraCategory = cat;
  renderExtraItems();
};

function renderExtraItems() {
  const container = document.getElementById('extraItemsList');
  if (!container || !selectedPackage) return;
  container.innerHTML = '';

  const pkgServiceIds = (selectedPackage.services || []).map(id => String(id).trim().toLowerCase());
  const extras = appData.services.filter(s => {
    const currentId = String(s.id).trim().toLowerCase();
    return currentId && !pkgServiceIds.includes(currentId);
  });

  const categories = [...new Set(extras.map(s => s.category || 'عمومی'))];
  renderExtraCategoryFilters(categories);

  const filtered = currentExtraCategory === 'all' ? extras : extras.filter(s => (s.category || 'عمومی') === currentExtraCategory);

  filtered.forEach(s => {
    const eff = getEffectiveService(s);
    const isChecked = extraSelectedIds.has(s.id);
    const hasReq = s.prerequisites && s.prerequisites.length > 0;
    
    const videoBtnHtml = (s.videoUrl && s.videoUrl.trim() !== '')
      ? `<a href="${s.videoUrl}" target="_blank" class="btn-video-badge" onclick="event.stopPropagation()">🎥 ویدیوی معرفی</a>`
      : '';

    container.innerHTML += `
      <div class="service-card ${isChecked ? 'selected' : ''}" onclick="toggleExtraFromCard('${s.id}')">
        <div class="card-top">
          <input type="checkbox" ${isChecked ? 'checked' : ''} style="margin-left: 6px;" onclick="event.stopPropagation(); toggleExtra('${s.id}', this.checked)">
          ${renderThumbnailHtml(s)}
          <div class="service-info">
            <div class="service-title">
              ${s.title}
              <span class="badge" style="background:#e0f2fe; color:#0369a1;">${s.category || 'عمومی'}</span>
              ${eff.isRecurring ? `<span class="badge badge-cycle">ماهانه</span>` : ''}
              ${hasReq ? `<span class="badge badge-req">پیش‌نیاز</span>` : ''}
            </div>
            <div class="service-desc">${s.desc}</div>
            ${videoBtnHtml}
          </div>
          <div class="service-meta">
            <div class="service-price">+${eff.price.toLocaleString('fa-IR')} ت</div>
            <div class="service-days">${eff.days} روز</div>
          </div>
        </div>
        ${isChecked ? renderOptionsControl(s) : ''}
      </div>
    `;
  });
}

window.toggleExtraFromCard = function(id) { toggleExtra(id, !extraSelectedIds.has(id)); };

window.toggleExtra = function(id, checked) {
  const s = appData.services.find(x => String(x.id) === String(id));
  if (!s) return;

  if (checked) {
    if (!checkPrerequisites(s)) { refreshViews(); return; }
    extraSelectedIds.add(id);
    if (s.variants && s.variants.length > 0 && !selectedVariants[id]) selectedVariants[id] = s.variants[0].id;
    if (s.billingCycle === 'ماهانه' && !selectedCycles[id]) selectedCycles[id] = 1;
  } else {
    extraSelectedIds.delete(id);
    deductedIds.delete(id);
  }
  refreshViews();
};

function renderDeductCategoryFilters(categories) {
  const bar = document.getElementById('deductCatFilters');
  if (!bar) return;
  bar.innerHTML = `<button type="button" class="cat-pill-btn ${currentDeductCategory === 'all' ? 'active' : ''}" onclick="setDeductCategory('all')">همه دسته‌ها</button>`;
  categories.forEach(cat => {
    bar.innerHTML += `<button type="button" class="cat-pill-btn ${currentDeductCategory === cat ? 'active' : ''}" onclick="setDeductCategory('${cat}')">${cat}</button>`;
  });
}

window.setDeductCategory = function(cat) {
  currentDeductCategory = cat;
  renderDeductItems();
};

function renderDeductItems() {
  const container = document.getElementById('deductItemsList');
  if (!container || !selectedPackage) return;
  container.innerHTML = '';

  const pkgServiceIds = (selectedPackage.services || []).map(id => String(id).trim().toLowerCase());
  const pkgServices = appData.services.filter(s => pkgServiceIds.includes(String(s.id).trim().toLowerCase()));
  const extraServices = appData.services.filter(s => extraSelectedIds.has(s.id));
  const allItems = [
    ...pkgServices.map(s => ({ ...s, source: 'پکیج پایه' })),
    ...extraServices.map(s => ({ ...s, source: 'خدمت جانبی' }))
  ];

  const categories = [...new Set(allItems.map(s => s.category || 'عمومی'))];
  renderDeductCategoryFilters(categories);

  const filtered = currentDeductCategory === 'all' ? allItems : allItems.filter(s => (s.category || 'عمومی') === currentDeductCategory);

  filtered.forEach(s => {
    const eff = getEffectiveService(s);
    const isChecked = deductedIds.has(s.id);
    const badgeClass = s.source === 'پکیج پایه' ? 'badge-pkg' : 'badge-cycle';

    container.innerHTML += `
      <div class="service-card ${isChecked ? 'selected' : ''}" onclick="toggleDeductFromCard('${s.id}')">
        <div class="card-top">
          <input type="checkbox" ${isChecked ? 'checked' : ''} style="margin-left: 8px;" onclick="event.stopPropagation(); toggleDeduct('${s.id}', this.checked)">
          ${renderThumbnailHtml(s)}
          <div class="service-info">
            <div class="service-title">
              ${s.title} 
              <span class="badge ${badgeClass}">${s.source}</span>
              ${eff.variantTitle ? `<small style="color:#2563eb;">(${eff.variantTitle})</small>` : ''}
            </div>
            <div class="service-desc">از قبل دارم، از فاکتور کسر شود.</div>
          </div>
          <div class="service-meta">
            <div class="service-price" style="color:#dc2626;">-${eff.price.toLocaleString('fa-IR')} ت</div>
          </div>
        </div>
      </div>
    `;
  });
}

window.toggleDeductFromCard = function(id) { toggleDeduct(id, !deductedIds.has(id)); };

window.toggleDeduct = function(id, checked) {
  if (checked) deductedIds.add(id);
  else deductedIds.delete(id);
  calculateSummary();
  renderDeductItems();
};

function renderOrderItemsSummary() {
  const listEl = document.getElementById('orderItemsSummaryList');
  if (!listEl || !selectedPackage) return;

  const pkgServices = appData.services.filter(s => (selectedPackage.services || []).map(id => String(id).trim().toLowerCase()).includes(String(s.id).trim().toLowerCase()));
  const addedList = appData.services.filter(s => extraSelectedIds.has(s.id));

  let html = `<div style="font-size:11px; margin-bottom:4px;">📦 <strong>پکیج انتخابی:</strong> ${selectedPackage.title}</div>`;

  if (pkgServices.length > 0) {
    html += `<ul style="margin:4px 14px 6px 0; padding:0; font-size:10px; color:#475569;">`;
    pkgServices.forEach(s => {
      const eff = getEffectiveService(s);
      const isDeduct = deductedIds.has(s.id);
      html += `<li style="${isDeduct ? 'text-decoration: line-through; color:#94a3b8;' : ''}">${s.title} ${eff.variantTitle ? `[مدل: ${eff.variantTitle}]` : ''} ${isDeduct ? '(کسر شد)' : ''}</li>`;
    });
    html += `</ul>`;
  }

  if (addedList.length > 0) {
    html += `<div style="font-size:11px; font-weight:800; color:#16a34a;">ماژول‌های اضافه:</div><ul style="margin:4px 14px 6px 0; padding:0; font-size:10px; color:#475569;">`;
    addedList.forEach(s => {
      const eff = getEffectiveService(s);
      const isDeduct = deductedIds.has(s.id);
      html += `<li style="${isDeduct ? 'text-decoration: line-through; color:#94a3b8;' : ''}">+ ${s.title} (${Number(eff.price).toLocaleString('fa-IR')} ت) ${isDeduct ? '(کسر شد)' : ''}</li>`;
    });
    html += `</ul>`;
  }

  listEl.innerHTML = html;
}

function calculateSummary() {
  if (!selectedPackage) return;

  const pkgServiceIds = (selectedPackage.services || []).map(id => String(id).trim().toLowerCase());
  const pkgServices = appData.services.filter(s => pkgServiceIds.includes(String(s.id).trim().toLowerCase()));
  pkgBaseSum = pkgServices.reduce((sum, s) => sum + getEffectiveService(s).price, 0);

  let extraSum = 0;
  let extraDays = 0;
  appData.services.filter(s => extraSelectedIds.has(s.id)).forEach(s => {
    const eff = getEffectiveService(s);
    extraSum += eff.price;
    extraDays += eff.days;
  });

  calculatedDeductedSum = 0;
  let deductedDays = 0;
  appData.services.filter(s => deductedIds.has(s.id)).forEach(s => {
    const eff = getEffectiveService(s);
    calculatedDeductedSum += eff.price;
    deductedDays += eff.days;
  });

  const pkgDeductedSum = pkgServices.filter(s => deductedIds.has(s.id)).reduce((sum, s) => sum + getEffectiveService(s).price, 0);
  const extraDeductedSum = calculatedDeductedSum - pkgDeductedSum;

  const discountPercent = selectedPackage.discount || 0;
  const netPackage = Math.max(0, pkgBaseSum - pkgDeductedSum);
  const discountAmount = netPackage * (discountPercent / 100);
  const netExtra = Math.max(0, extraSum - extraDeductedSum);

  let subTotal = Math.round((netPackage - discountAmount) + netExtra);

  if (appliedCoupon && appliedCoupon.valid) {
    subTotal = Math.max(0, subTotal - appliedCoupon.discountAmount);
  }

  calculatedFinalPrice = subTotal;
  calculatedFinalDays = Math.max(0, Math.round(selectedPackage.days - (deductedDays * 0.3) + extraDays));

  const kpiDisc = document.getElementById('kpiDiscount');
  const kpiDed = document.getElementById('kpiDeducted');
  const kpiDays = document.getElementById('kpiDays');
  const kpiTot = document.getElementById('kpiTotal');

  if (kpiDisc) kpiDisc.textContent = discountPercent + '٪';
  if (kpiDed) kpiDed.textContent = calculatedDeductedSum.toLocaleString('fa-IR') + ' ت';
  if (kpiDays) kpiDays.textContent = calculatedFinalDays + ' روز';
  if (kpiTot) kpiTot.textContent = calculatedFinalPrice.toLocaleString('fa-IR') + ' تومان';

  updatePaymentOptionLabels();
  renderOrderItemsSummary();
}

function updatePaymentOptionLabels() {
  const cashPrice = Math.round(calculatedFinalPrice * 0.95);
  const installmentTotal = Math.round(calculatedFinalPrice * 1.05);
  const firstInstallment = Math.round(installmentTotal * 0.4);
  const remainingTwo = Math.round((installmentTotal - firstInstallment) / 2);

  const fullEl = document.getElementById('fullPaySummary');
  const instEl = document.getElementById('installmentPaySummary');
  if (fullEl) fullEl.textContent = `مبلغ تسویه کامل: ${cashPrice.toLocaleString('fa-IR')} تومان`;
  if (instEl) instEl.textContent = `پیش‌پرداخت اول: ${firstInstallment.toLocaleString('fa-IR')} ت + ۲ قسط ${remainingTwo.toLocaleString('fa-IR')} ت`;
}

window.onPaymentPlanChanged = function(plan) { calculateSummary(); };

window.applyCoupon = async function() {
  const couponInput = document.getElementById('couponInput');
  if (!couponInput) return;
  const code = couponInput.value.trim();
  if (!code) return;

  const msg = document.getElementById('couponMessage');
  msg.textContent = 'در حال اعتبارسنجی کد...';
  msg.style.color = '#2563eb';

  try {
    const res = await sendToAppScript({ action: 'validateCoupon', code: code, total: calculatedFinalPrice });
    if (res.valid) {
      appliedCoupon = res;
      msg.style.color = '#16a34a';
      msg.textContent = res.message;
    } else {
      appliedCoupon = null;
      msg.style.color = '#dc2626';
      msg.textContent = res.message;
    }
    calculateSummary();
  } catch (err) {
    showCustomAlert('خطا', 'عدم برقراری ارتباط با سرور تخفیف.');
  }
};

window.goStep = function(step) {
  currentStep = step;
  if (step === 2) renderExtraItems();
  if (step === 3) renderDeductItems();

  document.querySelectorAll('.step-btn').forEach((b, i) => b.classList.toggle('active', i + 1 === step));
  document.querySelectorAll('.step-content').forEach((c, i) => c.classList.toggle('active', i + 1 === step));

  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  if (prevBtn) prevBtn.style.visibility = step === 1 ? 'hidden' : 'visible';
  if (nextBtn) nextBtn.style.display = step === 3 ? 'none' : 'block';
};

window.changeStep = function(delta) { goStep(currentStep + delta); };

window.finishOrder = async function() {
  const nameEl = document.getElementById('custName');
  const phoneEl = document.getElementById('custPhone');
  const name = nameEl ? nameEl.value.trim() : '';
  const phone = phoneEl ? phoneEl.value.trim() : '';

  if (!name || !phone) {
    return showCustomAlert('اطلاعات ناقص', 'لطفاً نام و شماره همراه مستقیم را وارد فرمایید.');
  }

  const payTypeEl = document.querySelector('input[name="payType"]:checked');
  const payType = payTypeEl ? payTypeEl.value : 'full';

  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'در حال صدور فاکتور و اتصال به درگاه شاپرک...';
  }

  const addedList = appData.services.filter(s => extraSelectedIds.has(s.id));
  const deductedList = appData.services.filter(s => deductedIds.has(s.id));

  const payload = {
    customerName: name,
    customerPhone: phone,
    packageName: selectedPackage.title,
    pkgBaseSum: pkgBaseSum,
    discountPercent: selectedPackage.discount || 0,
    deductedSum: calculatedDeductedSum,
    finalPriceNumeric: calculatedFinalPrice,
    totalDaysNumeric: calculatedFinalDays,
    paymentType: payType,
    appliedCouponCode: appliedCoupon ? appliedCoupon.code : 'ندارد',
    addedServicesSummary: addedList.map(s => {
      const eff = getEffectiveService(s);
      return `${s.title} ${eff.variantTitle ? '(' + eff.variantTitle + ')' : ''}`;
    }),
    deductedServicesSummary: deductedList.map(s => s.title),
    addedDetails: addedList.map(s => {
      const eff = getEffectiveService(s);
      return { title: s.title, variantInfo: eff.variantTitle, price: eff.price, days: eff.days };
    }),
    deductedDetails: deductedList.map(s => {
      const eff = getEffectiveService(s);
      return { title: s.title, price: eff.price };
    })
  };

  try {
    const res = await sendToAppScript({ action: 'submitOrder', payload: payload });

    if (res && res.success) {
      document.getElementById('step4FormWrap').style.display = 'none';
      document.getElementById('orderSuccessWrap').style.display = 'block';
      document.getElementById('successTrackCodeText').textContent = res.trackingCode;
      document.getElementById('successInvoiceLink').href = res.pdfUrl;

      if (res.paymentUrl) {
        const link = document.getElementById('successGatewayLink');
        link.href = res.paymentUrl;
        window.location.href = res.paymentUrl;
      }
    } else {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = '💳 ثبت نهایی و اتصال به شاپرک';
      }
      showCustomAlert('خطا در ثبت سفارش', res ? res.error : 'خطا در اتصال به زرین‌پال.');
    }
  } catch (err) {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = '💳 ثبت نهایی و اتصال به شاپرک';
    }
    showCustomAlert('خطای ارتباطی', 'خطا در برقراری ارتباط با سرور.');
  }
};

window.resetFormForNewOrder = function() {
  document.getElementById('step4FormWrap').style.display = 'block';
  document.getElementById('orderSuccessWrap').style.display = 'none';
  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = '💳 ثبت نهایی و اتصال به شاپرک';
  }

  extraSelectedIds.clear();
  deductedIds.clear();
  selectedVariants = {};
  selectedCycles = {};
  appliedCoupon = null;

  const couponMsg = document.getElementById('couponMessage');
  const couponInp = document.getElementById('couponInput');
  if (couponMsg) couponMsg.textContent = '';
  if (couponInp) couponInp.value = '';

  if (appData.packages && appData.packages.length > 0) {
    selectedPackage = appData.packages[0];
  }

  goStep(1);
  renderPackages();
};

// نمایش و خرید مستقیم محصولات دانلودی
function renderShopProducts() {
  const container = document.getElementById('shopProductsGrid');
  if (!container) return;
  container.innerHTML = '';

  const prods = appData.downloadProducts || [];
  if (prods.length === 0) {
    container.innerHTML = '<div style="color:#64748b; padding:15px; grid-column: 1/-1;">محصول دانلودی در شیت ثبت نشده است.</div>';
    return;
  }

  prods.forEach(p => {
    container.innerHTML += `
      <div class="package-card" style="cursor:default;">
        <div class="package-card-placeholder">📦</div>
        <div class="package-card-body">
          <div class="package-card-title">
            <span>${p.title}</span>
            <span class="badge badge-pkg">نسخه ${p.version}</span>
          </div>
          <div class="package-card-desc">فایل دانلودی با دسترسی مادام‌العمر در پنل کاربری</div>
          <div style="font-size:14px; font-weight:800; color:#059669; margin:8px 0;">
            ${Number(p.price).toLocaleString('fa-IR')} تومان
          </div>
          <button type="button" class="btn-main" onclick="buyProductNow('${p.id}')" style="width:100%; font-size:11px;">
            ⚡ خرید آنلاین و تحویل آنی
          </button>
        </div>
      </div>
    `;
  });
}

window.buyProductNow = function(prodId) {
  const prod = (appData.downloadProducts || []).find(p => String(p.id).trim() === String(prodId).trim());
  if (!prod) return showCustomAlert('خطا', 'محصول مورد نظر یافت نشد.');

  resetFormForNewOrder();

  selectedPackage = {
    id: prod.id,
    title: prod.title + ' [نسخه ' + prod.version + ']',
    desc: 'محصول دانلودی با تحویل آنی در پنل کاربری',
    services: [],
    discount: 0,
    days: 0
  };
  pkgBaseSum = prod.price;
  calculatedFinalPrice = prod.price;
  calculatedFinalDays = 0;
  calculatedDeductedSum = 0;

  switchNavTab('tabOrder');
  goStep(3);

  const kpiTot = document.getElementById('kpiTotal');
  if (kpiTot) kpiTot.textContent = prod.price.toLocaleString('fa-IR') + ' تومان';
  const kpiDays = document.getElementById('kpiDays');
  if (kpiDays) kpiDays.textContent = 'آنی';

  updatePaymentOptionLabels();

  const listEl = document.getElementById('orderItemsSummaryList');
  if (listEl) {
    listEl.innerHTML = `
      <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:8px; font-size:11px;">
        📦 <strong>سفارش دانلودی:</strong> ${prod.title} (نسخه ${prod.version}) <br>
        💳 <strong>مبلغ:</strong> ${Number(prod.price).toLocaleString('fa-IR')} تومان
      </div>
    `;
  }
};
