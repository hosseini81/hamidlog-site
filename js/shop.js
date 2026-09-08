// ==================== مدیریت فروشگاه محصولات دانلودی و تحویل فایل ====================

// واکشی خودکار داده‌های فروشگاه در صفحه shop.html
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("shopProductsGrid")) {
    loadShopCatalog();
  }
});

async function loadShopCatalog() {
  const loader = document.getElementById("dataLoader");
  try {
    const result = await fetchInitialDataFromSheet();
    if (result && result.success && result.data) {
      if (loader) loader.style.display = "none";
      if (typeof appData === "undefined") {
        window.appData = {};
      }
      window.appData.downloadProducts = result.data.downloadProducts || [];
      renderShopProducts(window.appData.downloadProducts);
    } else {
      throw new Error();
    }
  } catch (err) {
    window.onShopFallbackLoaded = function(res) {
      if (res && res.success && res.data) {
        if (loader) loader.style.display = "none";
        if (typeof appData === "undefined") {
          window.appData = {};
        }
        window.appData.downloadProducts = res.data.downloadProducts || [];
        renderShopProducts(window.appData.downloadProducts);
      }
    };
    if (typeof loadSheetDataViaJsonp === "function") {
      loadSheetDataViaJsonp("onShopFallbackLoaded");
    }
  }
}

// رندر گرید کارتی محصولات همراه با توضیحات اختصاصی شیت
function renderShopProducts(products) {
  const container = document.getElementById('shopProductsGrid');
  if (!container) return;
  container.innerHTML = '';

  const prods = products || [];
  if (prods.length === 0) {
    container.innerHTML = '<div style="color:#64748b; padding:24px; grid-column: 1/-1; text-align:center; font-size:12px;">در حال حاضر محصول دانلودی فعالی در سیستم ثبت نشده است.</div>';
    return;
  }

  prods.forEach(p => {
    // استفاده مستقیم از ستون جدید توضیحات در شیت
    const productDescription = (p.desc && p.desc.trim()) 
      ? p.desc.trim() 
      : 'محصول دانلودی اورجینال با دسترسی نامحدود، پشتیبانی و تحویل آنی فایل در پنل کاربری';

    container.innerHTML += `
      <div class="package-card" style="cursor:default; display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <div class="package-card-placeholder">📦</div>
          <div class="package-card-body">
            <div class="package-card-title">
              <span>${p.title}</span>
              <span class="badge badge-pkg">نسخه ${p.version || '1.0'}</span>
            </div>
            <div class="package-card-desc" style="font-size:11px; line-height:1.8; color:#64748b; margin:6px 0 10px;">
              ${productDescription}
            </div>
          </div>
        </div>

        <div style="padding: 0 16px 16px;">
          <div style="font-size:14px; font-weight:900; color:#059669; margin-bottom:10px; text-align:left;">
            ${Number(p.price).toLocaleString('fa-IR')} تومان
          </div>
          <button type="button" class="btn-main" onclick="buyProductNow('${p.id}')" style="width:100%; font-size:11px; padding:10px;">
            🛒 افزودن به سبد خرید
          </button>
        </div>
      </div>
    `;
  });
}

// افزودن محصول دانلودی به سبد خرید مشترک سایت
window.buyProductNow = function(prodId) {
  let product = null;
  if (typeof appData !== 'undefined' && appData.downloadProducts) {
    product = appData.downloadProducts.find(p => String(p.id).trim() === String(prodId).trim());
  }

  // اگر در متغیر عمومی نبود، مقادیر اولیه پایه می‌سازد
  if (!product) {
    product = { id: prodId, title: 'محصول دانلودی', price: 0, version: '1.0' };
  }

  if (typeof addToCartProduct === 'function') {
    addToCartProduct(product);
  } else {
    showCustomAlert('خطا', 'ماژول سبد خرید در این صفحه لود نشده است.');
  }
};

// رندر محصولات دانلودی خریداری‌شده در تب اختصاصی پنل کاربری (user.html)
function renderUserDownloads(downloads) {
  const dlContainer = document.getElementById('userPurchasedDownloadsList');
  if (!dlContainer) return;
  dlContainer.innerHTML = '';

  if (!downloads || downloads.length === 0) {
    dlContainer.innerHTML = '<div style="font-size:11px; color:#64748b; padding:24px; background:#f8fafc; border:1px solid var(--border-color); border-radius:10px; text-align:center;">هنوز فایل دانلودی خریداری نکرده‌اید.</div>';
    return;
  }

  downloads.forEach(d => {
    dlContainer.innerHTML += `
      <div style="display:flex; justify-content:space-between; align-items:center; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:12px; margin-bottom:10px;">
        <div>
          <strong style="font-size:12px; color:#166534;">${d.title}</strong>
          <div style="font-size:10px; color:#475569; margin-top:3px;">
            نسخه: ${d.version || '1.0'} | تاریخ خرید: ${d.purchaseDate || '-'}
          </div>
        </div>
        <button type="button" class="btn-main" onclick="downloadProductSecurely('${d.id}')" style="padding:6px 14px; font-size:11px;">
          ⬇ دریافت فایل امن
        </button>
      </div>
    `;
  });
}

// دانلود امن فایل محافظت‌شده از گوگل‌درایو
window.downloadProductSecurely = async function(productId) {
  if (!currentUser || !currentUser.phone) {
    return showCustomAlert('نیاز به ورود', 'جهت دریافت لینک فایل، ابتدا وارد حساب کاربری خود شوید.');
  }

  try {
    const res = await sendToAppScript({ action: 'requestDownload', phone: currentUser.phone, productId: productId });
    if (res && res.success && res.downloadUrl) {
      window.open(res.downloadUrl, '_blank');
    } else {
      showCustomAlert('عدم دسترسی', res ? (res.error || 'دسترسی برای دانلود صادر نشد.') : 'خطا در صدور لینک دانلود.');
    }
  } catch (err) {
    showCustomAlert('خطا', 'عدم برقراری ارتباط با سرور ابری.');
  }
};
