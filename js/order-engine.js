// ==================== موتور استعلام و انتخاب خدمات طراحی سایت ====================
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

let calculatedFinalPrice = 0;
let calculatedFinalDays = 0;
let pkgBaseSum = 0;
let calculatedDeductedSum = 0;

function initOrderEngine() {
  if (document.getElementById("dataLoader") || document.getElementById("packagesGrid")) {
    loadOrderEngineData();
  }
}
window.addEventListener("allModulesLoaded", initOrderEngine);

// تابع هوشمند تولید تگ تصویر بندانگشتی یا گیف برای پکیج و خدمات
function renderMediaThumbnail(url, altText, fallbackIcon = '📦') {
  if (!url || !url.trim()) {
    return `<div class="service-thumb-placeholder">${fallbackIcon}</div>`;
  }
  const cleanUrl = url.trim();
  return `
    <div class="service-thumb-wrap">
      <img src="${cleanUrl}" alt="${altText}" class="service-thumb-img" loading="lazy" onerror="this.outerHTML='<div class=\\'service-thumb-placeholder\\'>${fallbackIcon}</div>'" />
    </div>
  `;
}

async function loadOrderEngineData() {
  const loader = document.getElementById("dataLoader");
  try {
    const result = await fetchInitialDataFromSheet();
    if (result && result.success && result.data) {
      appData = result.data;
      if (loader) loader.style.display = "none";
      const grid = document.getElementById("orderMainGrid");
      if (grid) grid.style.display = "grid";

      renderPackages();
    } else {
      throw new Error();
    }
  } catch (err) {
    window.onSheetFallbackLoaded = function(res) {
      if (res && res.success && res.data) {
        appData = res.data;
        if (loader) loader.style.display = "none";
        const grid = document.getElementById("orderMainGrid");
        if (grid) grid.style.display = "grid";
        renderPackages();
      }
    };
    if (typeof loadSheetDataViaJsonp === "function") {
      loadSheetDataViaJsonp("onSheetFallbackLoaded");
    }
  }
}

function renderPackages() {
  const grid = document.getElementById('packagesGrid');
  if (!grid || !appData.packages) return;
  grid.innerHTML = '';

  // ۱. فیلتر فقط پکیج‌های پروژه‌ای (جداسازی از پکیج‌های پشتیبانی دوره‌ای)
  const projectPackages = appData.packages.filter(p => !p.type || p.type === 'پروژه‌ای');

  if (projectPackages.length === 0) {
    grid.innerHTML = '<div style="color:#64748b; padding:20px; text-align:center; grid-column:1/-1;">پکیجی یافت نشد.</div>';
    return;
  }

  if (!selectedPackage || !projectPackages.some(p => String(p.id) === String(selectedPackage.id))) {
    selectedPackage = projectPackages[0];
  }

  projectPackages.forEach(pkg => {
    const isSelected = selectedPackage && String(selectedPackage.id) === String(pkg.id);
    const mediaHtml = pkg.imageUrl 
      ? `<div class="package-media-wrap">
           <img src="${pkg.imageUrl}" class="package-card-media" alt="${pkg.title}" loading="lazy" onerror="this.outerHTML='<div class=\\'package-card-placeholder\\'>📦</div>'">
         </div>`
      : `<div class="package-card-placeholder">📦</div>`;

    grid.innerHTML += `
      <div class="package-card ${isSelected ? 'selected' : ''}" onclick="selectPackageById('${pkg.id}')">
        ${mediaHtml}
        <div class="package-card-body">
          <div class="package-card-title">
            <span>${pkg.title}</span>
            ${isSelected ? '<span style="color:var(--primary); font-weight:900;">✔</span>' : ''}
          </div>
          <div class="package-card-desc">${pkg.desc}</div>
          <div class="package-card-footer">
            <span>مدت زمان: <strong>${pkg.days} روز</strong></span>
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

  if (!selectedPackage) return;

  const pkgServiceIds = (selectedPackage.services || []).map(id => String(id).trim().toLowerCase());
  appData.services.filter(s => pkgServiceIds.includes(String(s.id).trim().toLowerCase())).forEach(s => {
    if (s.variants && s.variants.length > 0) selectedVariants[s.id] = s.variants[0].id;
    if (s.billingCycle === 'ماهانه') selectedCycles[s.id] = 1;
  });

  refreshOrderViews();
}

function refreshOrderViews() {
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
  refreshOrderViews();
};

window.onCycleChanged = function(serviceId, cycleCount) {
  selectedCycles[serviceId] = Number(cycleCount);
  refreshOrderViews();
};

window.toggleLayout = function(type, mode) {
  if (type === 'extra') {
    extraViewMode = mode;
    document.getElementById('extraListBtn')?.classList.toggle('active', mode === 'list');
    document.getElementById('extraGridBtn')?.classList.toggle('active', mode === 'grid');
    const el = document.getElementById('extraItemsList');
    if (el) el.className = `services-container ${mode}-view`;
  } else {
    deductViewMode = mode;
    document.getElementById('deductListBtn')?.classList.toggle('active', mode === 'list');
    document.getElementById('deductGridBtn')?.classList.toggle('active', mode === 'grid');
    const el = document.getElementById('deductItemsList');
    if (el) el.className = `services-container ${mode}-view`;
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
  
  // فیلتر فقط خدمات مازاد مادام‌العمر یا پروژه‌ای (حذف خدمات ماهانه به جهت انتقال به صفحه نگهداری سایت)
  const extras = appData.services.filter(s => {
    const currentId = String(s.id).trim().toLowerCase();
    const isInsidePkg = pkgServiceIds.includes(currentId);
    const isMonthly = String(s.billingCycle || '').trim() === 'ماهانه';
    return currentId && !isInsidePkg && !isMonthly;
  });

  const categories = [...new Set(extras.map(s => s.category || 'عمومی'))];
  renderExtraCategoryFilters(categories);

  const filtered = currentExtraCategory === 'all' ? extras : extras.filter(s => (s.category || 'عمومی') === currentExtraCategory);

  filtered.forEach(s => {
    const eff = getEffectiveService(s);
    const isChecked = extraSelectedIds.has(s.id);
    const hasReq = s.prerequisites && s.prerequisites.length > 0;
    
    // اجرای ویدیو در پنجره پاپ‌آپ با متد openVideoModal
    const videoBtn = (s.videoUrl && s.videoUrl.trim()) 
      ? `<button type="button" class="btn-video-badge" onclick="event.stopPropagation(); openVideoModal('${s.videoUrl}', '${s.title}')">🎥 معرفی</button>` 
      : '';
      
    const thumbHtml = renderMediaThumbnail(s.imageUrl, s.title, '⚡');

    container.innerHTML += `
      <div class="service-card ${isChecked ? 'selected' : ''}" onclick="toggleExtraFromCard('${s.id}')">
        <div class="card-top">
          <input type="checkbox" ${isChecked ? 'checked' : ''} style="margin-left: 6px;" onclick="event.stopPropagation(); toggleExtra('${s.id}', this.checked)">
          ${thumbHtml}
          <div class="service-info">
            <div class="service-title">
              ${s.title}
              <span class="badge" style="background:#e0f2fe; color:#0369a1;">${s.category || 'عمومی'}</span>
              ${eff.isRecurring ? `<span class="badge badge-cycle">ماهانه</span>` : ''}
              ${hasReq ? `<span class="badge badge-req">پیش‌نیاز</span>` : ''}
            </div>
            <div class="service-desc">${s.desc}</div>
            ${videoBtn}
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
    if (!checkPrerequisites(s)) { refreshOrderViews(); return; }
    extraSelectedIds.add(id);
    if (s.variants && s.variants.length > 0 && !selectedVariants[id]) selectedVariants[id] = s.variants[0].id;
    if (s.billingCycle === 'ماهانه' && !selectedCycles[id]) selectedCycles[id] = 1;
  } else {
    extraSelectedIds.delete(id);
    deductedIds.delete(id);
  }
  refreshOrderViews();
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
  
  // خدمات انتخابی غیرماهانه برای کسر از فاکتور پروژه
  const extraServices = appData.services.filter(s => extraSelectedIds.has(s.id) && String(s.billingCycle || '').trim() !== 'ماهانه');
  const allItems = [...pkgServices.map(s => ({ ...s, source: 'پکیج پایه' })), ...extraServices.map(s => ({ ...s, source: 'خدمت جانبی' }))];

  const categories = [...new Set(allItems.map(s => s.category || 'عمومی'))];
  renderDeductCategoryFilters(categories);

  const filtered = currentDeductCategory === 'all' ? allItems : allItems.filter(s => (s.category || 'عمومی') === currentDeductCategory);

  filtered.forEach(s => {
    const eff = getEffectiveService(s);
    const isChecked = deductedIds.has(s.id);
    const badgeClass = s.source === 'پکیج پایه' ? 'badge-pkg' : 'badge-cycle';
    const thumbHtml = renderMediaThumbnail(s.imageUrl, s.title, '⚡');

    container.innerHTML += `
      <div class="service-card ${isChecked ? 'selected' : ''}" onclick="toggleDeductFromCard('${s.id}')">
        <div class="card-top">
          <input type="checkbox" ${isChecked ? 'checked' : ''} style="margin-left: 8px;" onclick="event.stopPropagation(); toggleDeduct('${s.id}', this.checked)">
          ${thumbHtml}
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
    html += `<div style="font-size:11px; font-weight:800; color:#16a34a;">ماژول‌های افزوده:</div><ul style="margin:4px 14px 6px 0; padding:0; font-size:10px; color:#475569;">`;
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

  let extraSum = 0, extraDays = 0;
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

  calculatedFinalPrice = Math.round((netPackage - discountAmount) + netExtra);
  calculatedFinalDays = Math.max(0, Math.round(selectedPackage.days - (deductedDays * 0.3) + extraDays));

  const kpiDisc = document.getElementById('kpiDiscount');
  const kpiDed = document.getElementById('kpiDeducted');
  const kpiDays = document.getElementById('kpiDays');
  const kpiTot = document.getElementById('kpiTotal');

  if (kpiDisc) kpiDisc.textContent = discountPercent + '٪';
  if (kpiDed) kpiDed.textContent = calculatedDeductedSum.toLocaleString('fa-IR') + ' ت';
  if (kpiDays) kpiDays.textContent = calculatedFinalDays + ' روز';
  if (kpiTot) kpiTot.textContent = calculatedFinalPrice.toLocaleString('fa-IR') + ' تومان';

  renderOrderItemsSummary();
}

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

// افزودن پروژه شخصی‌سازی شده به سبد خرید و هدایت
window.proceedToCheckout = function() {
  if (!selectedPackage) {
    return showCustomAlert("خطا", "لطفاً ابتدا یک پکیج پایه انتخاب فرمایید.");
  }

  const addedList = appData.services.filter(s => extraSelectedIds.has(s.id));
  const deductedList = appData.services.filter(s => deductedIds.has(s.id));

  // ارسال دقیق آبجکت‌ها با مشخصات کامل مدل و چرخه
  const addedDetails = addedList.map(s => {
    const eff = getEffectiveService(s);
    return {
      id: s.id,
      title: s.title,
      price: eff.price,
      variantInfo: eff.variantTitle || '',
      billingCycle: s.billingCycle || 'یکباره',
      durationMonths: eff.cycles || 1
    };
  });

  const serviceOrder = {
    packageId: selectedPackage.id,
    packageName: selectedPackage.title,
    pkgBaseSum: pkgBaseSum,
    discountPercent: selectedPackage.discount || 0,
    deductedSum: calculatedDeductedSum,
    finalPriceNumeric: calculatedFinalPrice,
    totalDaysNumeric: calculatedFinalDays,
    addedDetails: addedDetails,
    addedServicesSummary: addedList.map(s => `${s.title} ${getEffectiveService(s).variantTitle ? '(' + getEffectiveService(s).variantTitle + ')' : ''}`),
    deductedServicesSummary: deductedList.map(s => s.title)
  };

  if (typeof addToCartServiceProject === 'function') {
    addToCartServiceProject(serviceOrder);
    window.location.href = "cart.html";
  } else {
    sessionStorage.setItem("pending_order_data", JSON.stringify(serviceOrder));
    window.location.href = "checkout.html";
  }
};

// ==================== مدیریت پاپ‌آپ ویدیوهای معرفی ====================

// باز کردن مودال و لود فریم یا فایل ویدیو
window.openVideoModal = function(videoUrl, title) {
  const modal = document.getElementById('videoModalOverlay');
  const playerBox = document.getElementById('videoModalPlayerBox');
  const titleEl = document.getElementById('videoModalTitle');
  if (!modal || !playerBox) return;

  if (titleEl && title) {
    titleEl.textContent = 'معرفی خدمت: ' + title;
  }

  const cleanUrl = String(videoUrl).trim();

  // در صورت ارسال فایل مستقیم MP4
  if (cleanUrl.toLowerCase().endsWith('.mp4')) {
    playerBox.innerHTML = `
      <video controls autoplay playsinline style="width:100%; height:100%;">
        <source src="${cleanUrl}" type="video/mp4">
        مرورگر شما از تگ ویدیو پشتیبانی نمی‌کند.
      </video>
    `;
  } else {
    // لینک embed آپارات یا فریم وب
    playerBox.innerHTML = `
      <iframe src="${cleanUrl}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    `;
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
};

// بستن مودال و قطع پخش ویدیو
window.closeVideoModal = function() {
  const modal = document.getElementById('videoModalOverlay');
  const playerBox = document.getElementById('videoModalPlayerBox');
  if (modal) modal.classList.remove('active');
  if (playerBox) playerBox.innerHTML = '';
  document.body.style.overflow = '';
};

// بستن با کلید Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeVideoModal();
  }
});
