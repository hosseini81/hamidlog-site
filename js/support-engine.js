// ==================== موتور استعلام و انتخاب پلن‌های نگهداری و پشتیبانی سایت ====================
let appSupportData = { packages: [], services: [] };
let selectedSupportPkg = null;
let selectedSupportExtras = new Set();
let selectedSupportMonths = 3; // پیش‌فرض ۳ ماهه

function initSupportEngine() {
  if (document.getElementById("supportDataLoader") || document.getElementById("supportPackagesGrid")) {
    loadSupportEngineData();
  }
}
window.addEventListener("allModulesLoaded", initSupportEngine);

async function loadSupportEngineData() {
  const loader = document.getElementById("supportDataLoader");
  try {
    const result = await fetchInitialDataFromSheet();
    if (result && result.success && result.data) {
      appSupportData = result.data;
      if (loader) loader.style.display = "none";
      const grid = document.getElementById("supportMainGrid");
      if (grid) grid.style.display = "grid";

      renderSupportPackages();
    }
  } catch (err) {
    console.error("خطا در بارگذاری اطلاعات پشتیبانی", err);
  }
}

function renderSupportPackages() {
  const grid = document.getElementById('supportPackagesGrid');
  if (!grid || !appSupportData.packages) return;
  grid.innerHTML = '';

  // فیلتر فقط پکیج‌های از نوع "پشتیبانی دوره‌ای"
  const supportPackages = appSupportData.packages.filter(p => p.type === 'پشتیبانی دوره‌ای');

  if (supportPackages.length === 0) {
    grid.innerHTML = '<div style="color:#64748b; padding:20px; text-align:center; grid-column:1/-1;">پلن پشتیبانی یافت نشد.</div>';
    return;
  }

  if (!selectedSupportPkg) selectedSupportPkg = supportPackages[0];

  supportPackages.forEach(pkg => {
    const isSelected = selectedSupportPkg && String(selectedSupportPkg.id) === String(pkg.id);
    const mediaHtml = pkg.imageUrl 
      ? `<div class="package-media-wrap"><img src="${pkg.imageUrl}" class="package-card-media" alt="${pkg.title}" /></div>`
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
            <span>دوره پایه: <strong>${pkg.days || 30} روزه</strong></span>
          </div>
        </div>
      </div>
    `;
  });

  renderSupportServices();
  calculateSupportSummary();
}

window.selectSupportPkgById = function(pkgId) {
  selectedSupportPkg = appSupportData.supportPackages.find(p => String(p.id) === String(pkgId)) || appSupportData.packages.find(p => String(p.id) === String(pkgId));
  renderSupportPackages();
};

function renderSupportServices() {
  const container = document.getElementById('supportServicesList');
  if (!container || !appSupportData.services) return;
  container.innerHTML = '';

  // فقط خدمات با دوره پرداخت ماهانه
  const monthlyServices = appSupportData.services.filter(s => String(s.billingCycle || '').trim() === 'ماهانه');

  monthlyServices.forEach(s => {
    const isChecked = selectedSupportExtras.has(s.id);
    container.innerHTML += `
      <div class="service-card ${isChecked ? 'selected' : ''}" onclick="toggleSupportService('${s.id}')">
        <div class="card-top">
          <input type="checkbox" ${isChecked ? 'checked' : ''} onclick="event.stopPropagation(); toggleSupportService('${s.id}')">
          <div class="service-info">
            <div class="service-title">${s.title} <span class="badge badge-cycle">ماهانه</span></div>
            <div class="service-desc">${s.desc}</div>
          </div>
          <div class="service-meta">
            <div class="service-price">+${Number(s.price).toLocaleString('fa-IR')} ت / ماه</div>
          </div>
        </div>
      </div>
    `;
  });
}

window.toggleSupportService = function(id) {
  if (selectedSupportExtras.has(id)) selectedSupportExtras.delete(id);
  else selectedSupportExtras.add(id);
  renderSupportServices();
  calculateSupportSummary();
};

window.changeSupportDuration = function(months) {
  selectedSupportMonths = Number(months);
  calculateSupportSummary();
};

function calculateSupportSummary() {
  if (!selectedSupportPkg) return;

  // محاسبه قیمت پکیج پایه بر اساس تعداد ماه
  let basePkgPrice = 0; // می‌توانید از قیمت خدمات تشکیل‌دهنده پکیج محاسبه کنید
  // خدمات مازاد ماهانه ضربدر تعداد ماه
  let extrasMonthlySum = 0;
  appSupportData.services.filter(s => selectedSupportExtras.has(s.id)).forEach(s => {
    extrasMonthlySum += Number(s.price) || 0;
  });

  const totalPrice = (basePkgPrice + extrasMonthlySum) * selectedSupportMonths;

  const totalEl = document.getElementById('supportTotalKpi');
  if (totalEl) totalEl.textContent = totalPrice.toLocaleString('fa-IR') + ' تومان';
}

// ثبت و هدایت به سبد خرید برای قرارداد نگهداری
window.proceedSupportCheckout = function() {
  if (!selectedSupportPkg) return showCustomAlert("خطا", "لطفاً یک پلن نگهداری انتخاب کنید.");

  const addedList = appSupportData.services.filter(s => selectedSupportExtras.has(s.id));
  const supportOrder = {
    packageName: `قرارداد نگهداری: ${selectedSupportPkg.title} (${selectedSupportMonths} ماهه)`,
    finalPriceNumeric: 0, // محاسبه بر اساس فرمول بالا
    totalDaysNumeric: selectedSupportMonths * 30,
    addedServicesSummary: addedList.map(s => `${s.title} (${selectedSupportMonths} ماه)`),
    isSupportContract: true,
    months: selectedSupportMonths
  };

  sessionStorage.setItem("pending_order_data", JSON.stringify(supportOrder));
  window.location.href = "checkout.html";
};
