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

// افزودن محصول دانلودی به سبد
window.addToCartProduct = function(product) {
  let cart = getCart();
  const existing = cart.find(i => i.id === product.id && i.type === 'download');
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

// افزودن سفارش خدمات طراحی سایت به سبد
window.addToCartServiceProject = function(projectData) {
  let cart = getCart();
  // هر کاربر در لحظه می‌تواند یک پروژه فعال در سبد داشته باشد، پروژه قبلی جایگزین می‌شود
  cart = cart.filter(i => i.type !== 'service');
  
  cart.push({
    id: 'SVC-' + Date.now(),
    type: 'service',
    title: `پروژه طراحی سایت: ${projectData.packageName}`,
    price: Number(projectData.finalPriceNumeric) || 0,
    qty: 1,
    details: projectData
  });

  saveCart(cart);
  showCustomAlert('ثبت شد', 'پیکربندی پروژه طراحی سایت به سبد خرید اضافه شد.', '🎉');
};

// حذف آیتم از سبد خرید
window.removeFromCart = function(index) {
  let cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  if (typeof renderCartPage === 'function') renderCartPage();
};

// پاکسازی کل سبد خرید پس از پرداخت موفق
window.clearCart = function() {
  localStorage.removeItem(CART_STORAGE_KEY);
  updateCartBadges();
};

document.addEventListener('DOMContentLoaded', updateCartBadges);
window.addEventListener('allModulesLoaded', updateCartBadges);
