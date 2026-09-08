// ==================== موتور استعلام و انتخاب پلن‌های نگهداری و پشتیبانی دوره‌ای ====================
let currentSupportStep = 1;
let supportAppData = { packages: [], services: [] };
let selectedSupportPackage = null;
let supportExtraSelectedIds = new Set();
let selectedSupportVariants = {};
let selectedSupportDurationMonths = 3; // پیش‌فرض فصلی
let currentSupportCategory = 'all';

function initSupportEngine() {
  if (document.getElementById("supportDataLoader") || document.getElementById("supportPackagesGrid")) {
    loadSupportEngineData();
  }
}
window.addEventListener("allModulesLoaded", initSupportEngine);

// تولید امن تصویر بنری یا بندانگشتی
function renderSupportMediaThumb(url, altText, fallbackIcon = '🛡️') {
  if (!url || !url.trim()) return `<div class="service-thumb-placeholder">${fallbackIcon}</div>`;
  const cleanUrl = url.trim();
  return `
    <div class="service-thumb-wrap">
      <img src="${cleanUrl}" alt="${altText}" class="service-thumb-img" loading="lazy" onerror="this.outerHTML='<div class=\\'service-thumb-placeholder\\'>${fallbackIcon}</div>'" />
    </div>
  `;
}

async function loadSupportEngineData() {
  const loader = document.getElementById("supportDataLoader");
  try {
    const result = await fetchInitialDataFromSheet();
    if (result && result.success && result.data) {
      supportAppData = result.data;
      if (loader) loader.style.display = "none";
      const grid = document.getElementById("supportMainGrid");
      if (grid) grid.style.display = "block";

      renderSupportPackages();
    }
  } catch (err) {
    console.error("خطا در دریافت اطلاعات نگهداری:", err);
  }
}

// ۱. رندر پکیج‌های اختصاصی نگهداری سایت (نوع: پشتیبانی دوره‌ای)
function renderSupportPackages() {
  const grid = document.getElementById('supportPackagesGrid');
  if (!grid || !supportAppData.packages) return;
  grid.innerHTML = '';

  const supportPackages = supportAppData.packages.filter(p => p.type === 'پشتیبانی دوره‌ای');

  if (supportPackages.length === 0) {
    grid.innerHTML = '<div style="color:#64748b; padding:30px; text-align:center; grid-column:1/-1;">پلن نگهداری دوره‌ای فعالی یافت نشد.</div>';
    return;
  }

  if (!selectedSupportPackage || !supportPackages.some(p => String(p.id) === String(selectedSupportPackage.id))) {
    selectedSupportPackage = supportPackages[0];
  }

  supportPackages.forEach(pkg => {
    const isSelected = selectedSupportPackage && String(selectedSupportPackage.id) === String(pkg.id);
    const mediaHtml = pkg.imageUrl 
      ? `<div class="package-media-wrap">
           <img src="${pkg.imageUrl}" class="package-card-media" alt="${pkg.title}" loading="lazy" onerror="this.outerHTML='<div class=\\'package-card-placeholder\\'>🛡️</div>'">
         </div>`
      : `<div class="package-card-placeholder">🛡️</div>`;

    grid.innerHTML += `
      <div class="package-card ${isSelected ? 'selected' : ''}" onclick="selectSupportPkgById('${pkg.id}')">
        ${mediaHtml}
        <div class="package-card-body">
          <div class="package-card-title">
            <span>${pkg.title}</span>
            ${isSelected ? '<span style="color:var(--primary); font-weight:900;">✔</span>' : ''}
          </div>
          <div class="package-card-desc">${pkg.desc}</div>
          <div class="package-card-footer">
            <span>دوره مبنا: <strong>ماهانه</strong></span>
            ${pkg.discount > 0 ? `<span class="badge badge-cycle">${pkg.discount}٪ تخفیف</span>` : ''}
          </div>
        </div>
      </div>
    `;
  });

  onSupportPackageSelected();
}

window.selectSupportPkgById = function(pkgId) {
  selectedSupportPackage = supportAppData.packages.find(p => String(p.id) === String(pkgId));
  renderSupportPackages();
};

function onSupportPackageSelected() {
  supportExtraSelectedIds.clear();
  selectedSupportVariants = {};

  if (!selectedSupportPackage) return;

  const pkgServiceIds = (selectedSupportPackage.services || []).map(id => String(id).trim().toLowerCase());
  supportAppData.services.filter(s => pkgServiceIds.includes(String(s.id).trim().toLowerCase())).forEach(s => {
    if (s.variants && s.variants.length > 0) selectedSupportVariants[s.id] = s.variants[0].id;
  });

  refreshSupportViews();
}

function refreshSupportViews() {
  renderSupportExtraItems();
  calculateSupportSummary();
}

function getEffectiveSupportService(service) {
  let basePrice = Number(service.price) || 0;
  let vTitle = '';

  if (service.variants && service.variants.length > 0) {
    const chosenVarId = selectedSupportVariants[service.id] || service.variants[0].id;
    const variant = service.variants.find(v => String(v.id) === String(chosenVarId)) || service.variants[0];
    basePrice = Number(variant.price) || 0;
    vTitle = `${variant.brand ? variant.brand + ' - ' : ''}${variant.modelTitle}`;
  }

  return {
    monthlyPrice: basePrice,
    variantTitle: vTitle
  };
}

// ۲. رندر خدمات ماهانه مازاد
function renderSupportExtraItems() {
  const container = document.getElementById('supportServicesList');
  if (!container || !selectedSupportPackage) return;
  container.innerHTML = '';

  const pkgServiceIds = (selectedSupportPackage.services || []).map(id => String(id).trim().toLowerCase());
  
  // فقط خدماتی که دوره پرداخت آنها "ماهانه" است و داخل پکیج پایه نیستند
  const monthlyExtras = supportAppData.services.filter(s => {
    const currentId = String(s.id).trim().toLowerCase();
    const isInsidePkg = pkgServiceIds.includes(currentId);
    const isMonthly = String(s.billingCycle || '').trim() === 'ماهانه';
    return currentId && !isInsidePkg && isMonthly;
  });

  const categories = [...new Set(monthlyExtras.map(s => s.category || 'عمومی'))];
  renderSupportCategoryFilters(categories);

  const filtered = currentSupportCategory === 'all' ? monthlyExtras : monthlyExtras.filter(s => (s.category || 'عمومی') === currentSupportCategory);

  if (filtered.length === 0) {
    container.innerHTML = '<div style="color:#64748b; font-size:12px; padding:20px; text-align:center;">خدمت ماهانه اضافه‌ای برای این بخش یافت نشد.</div>';
    return;
  }

  filtered.forEach(s => {
    const eff = getEffectiveSupportService(s);
    const isChecked = supportExtraSelectedIds.has(s.id);
    const thumbHtml = renderSupportMediaThumb(s.imageUrl, s.title, '⚡');
    const videoBtn = (s.videoUrl && s.videoUrl.trim()) 
      ? `<button type="button" class="btn-video-badge" onclick="event.stopPropagation(); openVideoModal('${s.videoUrl}', '${s.title}')">🎥 معرفی</button>` 
      : '';

    container.innerHTML += `
      <div class="service-card ${isChecked ? 'selected' : ''}" onclick="toggleSupportExtraFromCard('${s.id}')">
        <div class="card-top">
          <input type="checkbox" ${isChecked ? 'checked' : ''} style="margin-left: 6px;" onclick="event.stopPropagation(); toggleSupportExtra('${s.id}', this.checked)">
          ${thumbHtml}
          <div class="service-info">
            <div class="service-title">
              ${s.title}
              <span class="badge badge-cycle">ماهانه</span>
            </div>
            <div class="service-desc">${s.desc}</div>
            ${videoBtn}
          </div>
          <div class="service-meta">
            <div class="service-price">+${eff.monthlyPrice.toLocaleString('fa-IR')} ت / ماه</div>
          </div>
        </div>
      </div>
    `;
  });
}

function renderSupportCategoryFilters(categories) {
  const bar = document.getElementById('supportCatFilters');
  if (!bar) return;
  bar.innerHTML = `<button type="button" class="cat-pill-btn ${currentSupportCategory === 'all' ? 'active' : ''}" onclick="setSupportCategory('all')">همه دسته‌ها</button>`;
  categories.forEach(cat => {
    bar.innerHTML += `<button type="button" class="cat-pill-btn ${currentSupportCategory === cat ? 'active' : ''}" onclick="setSupportCategory('${cat}')">${cat}</button>`;
  });
}

window.setSupportCategory = function(cat) {
  currentSupportCategory = cat;
  renderSupportExtraItems();
};

window.toggleSupportExtraFromCard = function(id) {
  toggleSupportExtra(id, !supportExtraSelectedIds.has(id));
};

window.toggleSupportExtra = function(id, checked) {
  if (checked) supportExtraSelectedIds.add(id);
  else supportExtraSelectedIds.delete(id);
  refreshSupportViews();
};

// تنظیم مدت قرارداد (۱، ۳، ۶ یا ۱۲ ماهه)
window.setSupportContractDuration = function(months, btnEl) {
  selectedSupportDurationMonths = Number(months);
  document.querySelectorAll('.duration-btn').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  calculateSupportSummary();
};

// ۳. محاسبه پیش‌فاکتور و تخفیف‌های دوره‌ای
function calculateSupportSummary() {
  if (!selectedSupportPackage) return;

  const pkgServiceIds = (selectedSupportPackage.services || []).map(id => String(id).trim().toLowerCase());
  const pkgServices = supportAppData.services.filter(s => pkgServiceIds.includes(String(s.id).trim().toLowerCase()));
  
  const baseMonthlySum = pkgServices.reduce((sum, s) => sum + getEffectiveSupportService(s).monthlyPrice, 0);

  let extraMonthlySum = 0;
  supportAppData.services.filter(s => supportExtraSelectedIds.has(s.id)).forEach(s => {
    extraMonthlySum += getEffectiveSupportService(s).monthlyPrice;
  });

  const totalMonthly = baseMonthlySum + extraMonthlySum;

  // تخفیف بر اساس مدت زمان قرارداد (مثلاً ۱۲ ماهه = ۱۵٪ تخفیف، ۶ ماهه = ۵٪ تخفیف)
  let durationDiscountPercent = selectedSupportPackage.discount || 0;
  if (selectedSupportDurationMonths === 12) durationDiscountPercent += 15;
  else if (selectedSupportDurationMonths === 6) durationDiscountPercent += 5;

  const totalBeforeDiscount = totalMonthly * selectedSupportDurationMonths;
  const discountAmount = totalBeforeDiscount * (durationDiscountPercent / 100);
  const finalSupportPrice = Math.round(totalBeforeDiscount - discountAmount);

  // به‌روزرسانی شاخص‌های سایدبار
  document.getElementById('kpiSupportDuration').textContent = `${selectedSupportDurationMonths} ماهه`;
  document.getElementById('kpiSupportMonthly').textContent = `${totalMonthly.toLocaleString('fa-IR')} تومان`;
  document.getElementById('kpiSupportDiscount').textContent = `${durationDiscountPercent}٪`;
  document.getElementById('kpiSupportTotal').textContent = `${finalSupportPrice.toLocaleString('fa-IR')} تومان`;

  renderSupportOrderItemsSummary();
}

function renderSupportOrderItemsSummary() {
  const listEl = document.getElementById('supportOrderSummaryList');
  if (!listEl || !selectedSupportPackage) return;

  const pkgServices = supportAppData.services.filter(s => (selectedSupportPackage.services || []).map(id => String(id).trim().toLowerCase()).includes(String(s.id).trim().toLowerCase()));
  const addedList = supportAppData.services.filter(s => supportExtraSelectedIds.has(s.id));

  let html = `<div style="font-size:11px; margin-bottom:4px;">🛡️ <strong>پلن انتخابی:</strong> ${selectedSupportPackage.title}</div>`;

  if (pkgServices.length > 0) {
    html += `<ul style="margin:4px 14px 6px 0; padding:0; font-size:10px; color:#475569;">`;
    pkgServices.forEach(s => {
      html += `<li>${s.title} (پایه)</li>`;
    });
    html += `</ul>`;
  }

  if (addedList.length > 0) {
    html += `<div style="font-size:11px; font-weight:800; color:#16a34a;">سرویس‌های ماهانه مازاد:</div><ul style="margin:4px 14px 6px 0; padding:0; font-size:10px; color:#475569;">`;
    addedList.forEach(s => {
      const eff = getEffectiveSupportService(s);
      html += `<li>+ ${s.title} (${eff.monthlyPrice.toLocaleString('fa-IR')} ت / ماه)</li>`;
    });
    html += `</ul>`;
  }

  listEl.innerHTML = html;
}

// ناوبری بین مراحل
window.goSupportStep = function(step) {
  currentSupportStep = step;
  if (step === 2) renderSupportExtraItems();

  document.querySelectorAll('#sStepBtn1, #sStepBtn2, #sStepBtn3').forEach((b, i) => b.classList.toggle('active', i + 1 === step));
  document.querySelectorAll('#sStep1, #sStep2, #sStep3').forEach((c, i) => c.classList.toggle('active', i + 1 === step));

  const prevBtn = document.getElementById('sPrevBtn');
  const nextBtn = document.getElementById('sNextBtn');
  if (prevBtn) prevBtn.style.visibility = step === 1 ? 'hidden' : 'visible';
  if (nextBtn) nextBtn.style.display = step === 3 ? 'none' : 'block';
};

window.changeSupportStep = function(delta) {
  goSupportStep(currentSupportStep + delta);
};

// ثبت قرارداد و هدایت به پیش‌فاکتور و درگاه
window.proceedSupportToCheckout = function() {
  if (!selectedSupportPackage) {
    return showCustomAlert("خطا", "لطفاً ابتدا یک پلن نگهداری انتخاب کنید.");
  }

  const addedList = supportAppData.services.filter(s => supportExtraSelectedIds.has(s.id));
  const finalPrice = parseInt(document.getElementById('kpiSupportTotal').textContent.replace(/[^\d]/g, '')) || 0;

  const supportOrder = {
    packageId: selectedSupportPackage.id,
    packageName: `قرارداد نگهداری: ${selectedSupportPackage.title} (${selectedSupportDurationMonths} ماهه)`,
    durationMonths: selectedSupportDurationMonths,
    finalPriceNumeric: finalPrice,
    totalDaysNumeric: selectedSupportDurationMonths * 30,
    isSupportContract: true,
    addedServicesSummary: addedList.map(s => `${s.title} [ماهانه]`),
    deductedServicesSummary: []
  };

  if (typeof addToCartServiceProject === 'function') {
    addToCartServiceProject(supportOrder);
    window.location.href = "cart.html";
  } else {
    sessionStorage.setItem("pending_order_data", JSON.stringify(supportOrder));
    window.location.href = "checkout.html";
  }
};

// ==================== مدیریت پاپ‌آپ ویدیوهای معرفی ====================
window.openVideoModal = function(videoUrl, title) {
  const modal = document.getElementById('videoModalOverlay');
  const playerBox = document.getElementById('videoModalPlayerBox');
  const titleEl = document.getElementById('videoModalTitle');
  if (!modal || !playerBox) return;

  if (titleEl && title) titleEl.textContent = 'معرفی خدمت: ' + title;

  const cleanUrl = String(videoUrl).trim();
  if (cleanUrl.toLowerCase().endsWith('.mp4')) {
    playerBox.innerHTML = `<video controls autoplay playsinline style="width:100%; height:100%;"><source src="${cleanUrl}" type="video/mp4"></video>`;
  } else {
    playerBox.innerHTML = `<iframe src="${cleanUrl}" allowfullscreen></iframe>`;
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
};

window.closeVideoModal = function() {
  const modal = document.getElementById('videoModalOverlay');
  const playerBox = document.getElementById('videoModalPlayerBox');
  if (modal) modal.classList.remove('active');
  if (playerBox) playerBox.innerHTML = '';
  document.body.style.overflow = '';
};

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeVideoModal();
});
