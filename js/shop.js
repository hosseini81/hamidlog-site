// ==================== مدیریت محصولات دانلودی و تحویل امن فایل ====================

// رندر فروشگاه محصولات دانلودی در تب دوم
function renderShopProducts(products) {
  const container = document.getElementById('shopProductsGrid');
  if (!container) return;
  container.innerHTML = '';

  const prods = products || [];
  if (prods.length === 0) {
    container.innerHTML = '<div style="color:#64748b; padding:15px; grid-column: 1/-1; text-align:center;">محصول دانلودی فعالی یافت نشد.</div>';
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
          <div class="package-card-desc">فایل دانلودی با دسترسی مادام‌العمر و پایدار در پنل کاربری</div>
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

// خرید مستقیم محصول دانلودی و انتقال مستقیم به صفحه تسویه حساب (checkout.html)
window.buyProductNow = function(prodId) {
  const prods = (typeof appData !== 'undefined' && appData.downloadProducts) ? appData.downloadProducts : [];
  const prod = prods.find(p => String(p.id).trim() === String(prodId).trim());
  if (!prod) return showCustomAlert('خطا', 'محصول مورد نظر یافت نشد.');

  const downloadOrder = {
    packageName: `${prod.title} [نسخه ${prod.version}]`,
    pkgBaseSum: Number(prod.price) || 0,
    discountPercent: 0,
    deductedSum: 0,
    finalPriceNumeric: Number(prod.price) || 0,
    totalDaysNumeric: 0,
    addedServicesSummary: ['محصول دانلودی - تحویل آنی فایل'],
    deductedServicesSummary: []
  };

  sessionStorage.setItem("pending_order_data", JSON.stringify(downloadOrder));
  window.location.href = "checkout.html";
};

// رندر محصولات دانلودی خریداری‌شده در داشبورد کاربری
function renderUserDownloads(downloads) {
  const dlContainer = document.getElementById('userPurchasedDownloadsList');
  if (!dlContainer) return;
  dlContainer.innerHTML = '';

  if (downloads.length === 0) {
    dlContainer.innerHTML = '<div style="font-size:11px; color:#64748b; padding:20px; background:#f8fafc; border:1px solid var(--border-color); border-radius:10px; text-align:center;">هنوز فایل دانلودی خریداری نکرده‌اید.</div>';
    return;
  }

  downloads.forEach(d => {
    dlContainer.innerHTML += `
      <div style="display:flex; justify-content:space-between; align-items:center; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:12px; margin-bottom:8px;">
        <div>
          <strong style="font-size:12px; color:#166534;">${d.title}</strong>
          <div style="font-size:10px; color:#475569; margin-top:2px;">نسخه: ${d.version} | تاریخ خرید: ${d.purchaseDate}</div>
        </div>
        <button type="button" class="btn-main" onclick="downloadProductSecurely('${d.id}')" style="padding:6px 14px; font-size:11px;">
          ⬇ دانلود فایل
        </button>
      </div>
    `;
  });
}

// درخواست لینک دانلود امن فایل
window.downloadProductSecurely = async function(productId) {
  if (!currentUser || !currentUser.phone) {
    return showCustomAlert('نیاز به ورود', 'لطفاً ابتدا وارد حساب کاربری شوید.');
  }

  try {
    const res = await sendToAppScript({ action: 'requestDownload', phone: currentUser.phone, productId: productId });
    if (res && res.success && res.downloadUrl) {
      window.open(res.downloadUrl, '_blank');
    } else {
      showCustomAlert('عدم دسترسی', res ? (res.error || 'دسترسی برای دانلود صادر نشد.') : 'خطا در دانلود.');
    }
  } catch (err) {
    showCustomAlert('خطا', 'خطا در دریافت لینک امن دانلود.');
  }
};
