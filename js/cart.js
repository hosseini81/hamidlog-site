// ==================== مدیریت جامع سبد خرید و نشانگرها ====================
const CART_STORAGE_KEY = 'site_user_cart';

// دریافت اقلام سبد خرید
function getCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

// ذخیره اقلام در حافظه
function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  updateCartBadges();
}

// به‌روزرسانی بج و نشانگر تعداد سبد خرید در هدر و نوار پایین موبایل
function updateCartBadges() {
  const cart = getCart();
  const totalCount = cart.reduce((sum, item) => sum + (item.qty || 1), 0);

  const desktopBadge = document.getElementById('headerCartCount');
  const bottomBadge = document.getElementById('bottomCartCount');

  [desktopBadge, bottomBadge].forEach(badge => {
    if (badge) {
      badge.textContent = totalCount;
      badge.style.display = totalCount > 0 ? 'inline-flex' : 'none';
    }
  });
}
window.syncCartBadgeCount = updateCartBadges;

// افزودن محصول دانلودی به سبد
window.addToCartProduct = function(product) {
  let cart = getCart();
  const existing = cart.find(i => i.id === String(product.id) && i.type === 'download');
  if (existing) {
    showCustomAlert('اطلاع', 'این محصول دانلودی در سبد خرید شما وجود دارد.', 'ℹ️');
    return;
  }
  cart.push({
    id: String(product.id),
    type: 'download',
    title: product.title,
    version: product.version || '1.0',
    price: Number(product.price) || 0,
    qty: 1
  });
  saveCart(cart);
  showCustomAlert('افزوده شد', `محصول «${product.title}» به سبد خرید اضافه شد.`, '🛒');
};

// افزودن سفارش خدمات طراحی سایت یا نگهداری به سبد
window.addToCartServiceProject = function(projectData) {
  let cart = getCart();

  // تفکیک نوع سفارش (نگهداری دوره‌ای یا پروژه وب)
  const isSupport = Boolean(projectData.isSupportContract || projectData.type === 'support');

  // حذف سفارش قبلی از همان دسته تا سفارش جدید جایگزین شود
  cart = cart.filter(item => isSupport ? !item.isSupportContract : !item.isProject);

  // استخراج قطعی و دقیق مبلغ بدون احتمال خطا یا صفر شدن
  let rawPrice = projectData.finalPrice ?? projectData.price ?? projectData.finalPriceNumeric ?? 0;
  if (typeof rawPrice === 'string') {
    rawPrice = rawPrice.replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replace(/[^\d]/g, '');
  }
  const numericPrice = Number(rawPrice) || 0;

  const cartItem = {
    id: String(projectData.packageId || (isSupport ? 'support-order' : 'project-order')),
    title: String(projectData.packageName || projectData.title || (isSupport ? 'قرارداد نگهداری سایت' : 'پروژه طراحی وب‌سایت')),
    price: numericPrice,
    qty: 1,
    type: isSupport ? 'support' : 'project',
    isProject: !isSupport,
    isSupportContract: isSupport,
    details: projectData
  };

  cart.push(cartItem);
  saveCart(cart);
};

// حذف آیتم از سبد خرید
window.removeFromCart = function(index) {
  let cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCartPage();
};

// پاکسازی کل سبد خرید پس از پرداخت موفق
window.clearCart = function() {
  localStorage.removeItem(CART_STORAGE_KEY);
  updateCartBadges();
  renderCartPage();
};

// رندر داینامیک جدول سبد خرید در صفحه cart.html
function renderCartPage() {
  const container = document.getElementById('cartItemsContainer');
  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:50px 20px; background:#f8fafc; border:1px solid var(--border-color); border-radius:14px;">
        <div style="font-size:42px; margin-bottom:12px;">🛒</div>
        <h3 style="font-size:15px; font-weight:800; color:var(--bg-dark); margin-bottom:6px;">سبد خرید شما در حال حاضر خالی است</h3>
        <p style="font-size:11px; color:#64748b; margin-bottom:18px;">می‌توانید از بخش خدمات یا فروشگاه اقلام مورد نظر خود را انتخاب فرمایید.</p>
        <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
          <a href="services.html" class="btn-main" style="text-decoration:none; font-size:11px;">💻 خدمات طراحی سایت</a>
          <a href="support.html" class="btn-step-prev" style="text-decoration:none; font-size:11px;">🛠️ خدمات نگهداری سایت</a>
          <a href="shop.html" class="btn-step-prev" style="text-decoration:none; font-size:11px;">🛍️ فروشگاه محصولات</a>
        </div>
      </div>
    `;
    return;
  }

  let rowsHtml = '';
  let totalSum = 0;

  cart.forEach((item, index) => {
    const itemPrice = Number(item.price) || 0;
    totalSum += itemPrice;

    // عنوان هوشمند و حذف پیشوند اشتباه برای نگهداری سایت
    let displayTitle = item.title;
    let subText = 'محصول دانلودی';

    if (item.isSupportContract) {
      subText = 'قرارداد پشتیبانی و نگهداری دوره‌ای';
      // حذف هرگونه پیشوند ناخواسته احتمالی
      displayTitle = displayTitle.replace(/^پروژه طراحی سایت:\s*/, '');
    } else if (item.isProject) {
      subText = 'پروژه اختصاصی طراحی و توسعه وب';
      if (!displayTitle.startsWith('پروژه طراحی سایت')) {
        displayTitle = `پروژه طراحی سایت: ${displayTitle}`;
      }
    }

    rowsHtml += `
      <tr>
        <td>
          <strong style="font-size:13px; color:var(--bg-dark);">${displayTitle}</strong>
          <div style="font-size:10px; color:#64748b; margin-top:3px;">${subText}</div>
        </td>
        <td style="font-weight:800; color:#059669; font-size:13px; white-space:nowrap;">
          ${itemPrice.toLocaleString('fa-IR')} تومان
        </td>
        <td style="text-align:center;">
          <button type="button" class="btn-remove-item" onclick="removeFromCart(${index})" title="حذف از سبد">✕</button>
        </td>
      </tr>
    `;
  });

  container.innerHTML = `
    <table class="cart-table">
      <thead>
        <tr>
          <th>شرح کالا یا خدمات</th>
          <th>مبلغ</th>
          <th style="text-align:center;">حذف</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <div class="cart-checkout-bar" style="margin-top:20px; display:flex; justify-content:space-between; align-items:center; background:#f8fafc; border:1px solid var(--border-color); border-radius:12px; padding:16px 20px;">
      <div>
        <div style="font-size:11px; color:#64748b;">جمع کل قابل پرداخت:</div>
        <div style="font-size:20px; font-weight:900; color:#059669; margin-top:2px;">
          ${totalSum.toLocaleString('fa-IR')} تومان
        </div>
      </div>
      <button type="button" class="btn-main" onclick="goToCheckoutPage()" style="padding:12px 28px; font-size:13px;">
        تکمیل سفارش و پرداخت ➔
      </button>
    </div>
  `;
}

// انتقال به صفحه پرداخت و ذخیره وضعیت سفارش
window.goToCheckoutPage = function() {
  const cart = getCart();
  if (cart.length === 0) {
    showCustomAlert('سبد خالی است', 'ابتدا محصول یا خدمتی را به سبد خرید اضافه فرمایید.');
    return;
  }

  // اولویت انتقال جزئیات برای پروژه‌ها یا قرارداد نگهداری
  const activeOrder = cart.find(i => i.isProject || i.isSupportContract);
  if (activeOrder && activeOrder.details) {
    sessionStorage.setItem("pending_order_data", JSON.stringify(activeOrder.details));
  }

  window.location.href = "checkout.html";
};

// راه‌اندازی و اجرای همگام‌سازها
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadges();
  renderCartPage();
});

window.addEventListener('allModulesLoaded', () => {
  updateCartBadges();
  renderCartPage();
});
