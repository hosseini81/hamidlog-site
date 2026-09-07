// ==================== احراز هویت، داشبورد مشتری و دانلود امن ====================
let currentUser = null;
let isRegisterMode = false;

document.addEventListener("DOMContentLoaded", () => {
  try {
    const savedUser = localStorage.getItem('site_user_auth');
    if (savedUser) {
      currentUser = JSON.parse(savedUser);
      updateHeaderUserUI();
      fillOrderUserFields();
    }
  } catch (e) { console.warn(e); }
});

function updateHeaderUserUI() {
  const nameEl = document.getElementById('headerUserName');
  const avatarEl = document.getElementById('headerUserAvatar');
  if (currentUser) {
    if (nameEl) nameEl.textContent = currentUser.name;
    if (avatarEl && currentUser.avatar) avatarEl.src = currentUser.avatar;
  } else {
    if (nameEl) nameEl.textContent = 'ورود / ثبت‌نام';
    if (avatarEl) avatarEl.src = 'https://via.placeholder.com/26?text=U';
  }
}

function fillOrderUserFields() {
  if (currentUser) {
    const nameInput = document.getElementById('custName');
    const phoneInput = document.getElementById('custPhone');
    const badge = document.getElementById('autoFilledBadge');
    if (nameInput && !nameInput.value) nameInput.value = currentUser.name;
    if (phoneInput && !phoneInput.value) phoneInput.value = currentUser.phone;
    if (badge) badge.style.display = 'inline-block';
  }
}

window.toggleAuthMode = function() {
  isRegisterMode = !isRegisterMode;
  const titleEl = document.getElementById('authTitle');
  const submitBtn = document.getElementById('authSubmitBtn');
  const regName = document.getElementById('regNameField');
  const toggleText = document.getElementById('authToggleText');
  const toggleLink = document.getElementById('authToggleLink');

  if (isRegisterMode) {
    if (titleEl) titleEl.textContent = 'ثبت‌نام کاربر جدید';
    if (submitBtn) submitBtn.textContent = 'ثبت‌نام و ایجاد حساب';
    if (regName) regName.style.display = 'block';
    if (toggleText) toggleText.textContent = 'قبلاً ثبت‌نام کرده‌اید؟';
    if (toggleLink) toggleLink.textContent = 'وارد شوید';
  } else {
    if (titleEl) titleEl.textContent = 'ورود به حساب کاربری';
    if (submitBtn) submitBtn.textContent = 'ورود به حساب کاربری';
    if (regName) regName.style.display = 'none';
    if (toggleText) toggleText.textContent = 'حساب کاربری ندارید؟';
    if (toggleLink) toggleLink.textContent = 'ثبت‌نام کنید';
  }
};

window.submitAuth = async function() {
  const phone = document.getElementById('authPhone').value.trim();
  const pass = document.getElementById('authPass').value.trim();
  const name = document.getElementById('authName').value.trim();

  if (!phone || !pass || (isRegisterMode && !name)) {
    return showCustomAlert('ورودی ناقص', 'تمامی فیلدها الزامی است.');
  }

  try {
    const res = await sendToAppScript({
      action: 'auth',
      authType: isRegisterMode ? 'register' : 'login',
      phone: phone,
      pass: pass,
      name: name
    });

    if (res.success) {
      currentUser = res.user;
      localStorage.setItem('site_user_auth', JSON.stringify(currentUser));
      updateHeaderUserUI();
      fillOrderUserFields();
      loadDashboard();
    } else {
      showCustomAlert('خطا', res.message);
    }
  } catch (err) {
    showCustomAlert('خطا', 'عدم برقراری ارتباط با سامانه ورود.');
  }
};

async function loadDashboard() {
  document.getElementById('authBox').style.display = 'none';
  document.getElementById('userDashboard').style.display = 'block';
  document.getElementById('dashUserName').textContent = currentUser.name;
  document.getElementById('dashUserPhone').textContent = currentUser.phone;

  try {
    const res = await sendToAppScript({ action: 'getDashboard', phone: currentUser.phone });
    const data = res.data;

    if (data && data.avatar) {
      currentUser.avatar = data.avatar;
      document.getElementById('dashAvatarImg').src = data.avatar;
      document.getElementById('headerUserAvatar').src = data.avatar;
      localStorage.setItem('site_user_auth', JSON.stringify(currentUser));
    }

    // رندر محصولات دانلودی کاربر
    const dlContainer = document.getElementById('userPurchasedDownloadsList');
    if (dlContainer) {
      dlContainer.innerHTML = '';
      const downloads = data ? data.purchasedDownloads : [];
      if (!downloads || downloads.length === 0) {
        dlContainer.innerHTML = '<div style="font-size:11px; color:#64748b; padding:8px; background:#f8fafc; border-radius:6px;">هنوز فایل دانلودی خریداری نکرده‌اید.</div>';
      } else {
        downloads.forEach(d => {
          dlContainer.innerHTML += `
            <div style="display:flex; justify-content:space-between; align-items:center; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:10px; margin-bottom:6px;">
              <div>
                <strong style="font-size:12px; color:#166534;">${d.title}</strong>
                <div style="font-size:10px; color:#475569; margin-top:2px;">نسخه: ${d.version} | خرید: ${d.purchaseDate}</div>
              </div>
              <button type="button" class="btn-main" onclick="downloadProductSecurely('${d.id}')" style="padding:6px 12px; font-size:11px;">
                ⬇ دانلود فایل
              </button>
            </div>
          `;
        });
      }
    }

    // رندر پروژه‌ها و وضعیت اقساط
    const list = document.getElementById('userProjectsList');
    if (!list) return;
    list.innerHTML = '';

    const orders = data ? data.orders : [];
    if (!orders || orders.length === 0) {
      list.innerHTML = '<div style="color:#64748b; padding:12px; background:#fff; border-radius:8px; text-align:center;">سفارشی ثبت نشده است.</div>';
      return;
    }

    orders.forEach(o => {
      let stepsHtml = '';
      const allServices = [...o.addedServices];
      allServices.forEach((item, idx) => {
        const stepClass = idx === 0 ? 'done' : (idx === 1 ? 'in-progress' : '');
        const icon = idx === 0 ? '✔' : (idx === 1 ? '⚡' : '⏳');
        const stateText = idx === 0 ? 'انجام شده' : (idx === 1 ? 'در حال انجام' : 'در نوبت');
        stepsHtml += `<li class="timeline-item ${stepClass}"><span>${icon} ${item}</span><span>${stateText}</span></li>`;
      });

      const hasInstallment = o.remainingAmount > 0;
      const installmentSection = hasInstallment ? `
        <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:10px; margin-top:10px; font-size:11px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <strong>اقساط باقی‌مانده:</strong>
            <span style="color:#dc2626; font-weight:800;">${Number(o.remainingAmount).toLocaleString('fa-IR')} ت</span>
          </div>
          <div style="display:flex; gap:6px;">
            <input type="number" id="pay_amt_${o.trackingCode}" value="${o.remainingAmount}" style="margin-bottom:0; font-size:11px;" />
            <button type="button" class="btn-main" onclick="payCustomRemaining('${o.trackingCode}')" style="white-space:nowrap; font-size:11px;">پرداخت</button>
          </div>
        </div>
      ` : `<div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:6px; margin-top:6px; font-size:11px; color:#166534; text-align:center;">✔ تمامی اقساط تسویه شده است.</div>`;

      list.innerHTML += `
        <div style="border:1px solid var(--border-color); border-radius:10px; padding:12px; background:#fff; margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <strong>${o.packageName}</strong>
            <span class="badge badge-pkg">${o.trackingCode}</span>
          </div>
          <div style="font-size:11px; color:#64748b; margin-bottom:6px;">وضعیت: <strong>${o.projectStatus}</strong></div>
          <div style="font-size:11px; font-weight:700; color:#334155;">📋 مراحل انجام پروژه:</div>
          <ul class="timeline-steps-list">${stepsHtml}</ul>
          ${installmentSection}
          <div style="margin-top:10px; text-align:left;">
            <a href="${o.pdfUrl}" target="_blank" class="btn-step-prev" style="font-size:10px; text-decoration:none;">📄 دانلود پیش‌فاکتور</a>
          </div>
        </div>
      `;
    });
  } catch (err) {
    showCustomAlert('خطا', 'خطا در دریافت سوابق پنل.');
  }
}

window.downloadProductSecurely = async function(productId) {
  if (!currentUser || !currentUser.phone) {
    return showCustomAlert('نیاز به ورود', 'لطفاً ابتدا وارد حساب کاربری خود شوید.');
  }

  try {
    const res = await sendToAppScript({ action: 'requestDownload', phone: currentUser.phone, productId: productId });
    if (res && res.success && res.downloadUrl) {
      window.open(res.downloadUrl, '_blank');
    } else {
      showCustomAlert('عدم دسترسی به فایل', res.error || 'دسترسی برای دانلود این فایل صادر نشد.');
    }
  } catch (err) {
    showCustomAlert('خطا', 'خطا در دریافت لینک امن دانلود.');
  }
};

window.uploadAvatarFile = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function(e) {
    const base64Data = e.target.result;
    try {
      const res = await sendToAppScript({ action: 'updateAvatar', phone: currentUser.phone, avatar: base64Data });
      if (res && res.success) {
        currentUser.avatar = base64Data;
        document.getElementById('dashAvatarImg').src = base64Data;
        document.getElementById('headerUserAvatar').src = base64Data;
        localStorage.setItem('site_user_auth', JSON.stringify(currentUser));
      }
    } catch (err) {
      showCustomAlert('خطا', 'خطا در ذخیره‌سازی نمایه.');
    }
  };
  reader.readAsDataURL(file);
};

window.payCustomRemaining = async function(orderCode) {
  const input = document.getElementById('pay_amt_' + orderCode);
  const amount = input ? input.value : 0;
  if (!amount || amount < 1000) {
    return showCustomAlert('مبلغ نامعتبر', 'حداقل مبلغ پرداخت ۱,۰۰۰ تومان است.');
  }

  try {
    const res = await sendToAppScript({ action: 'payInstallment', orderCode: orderCode, amount: amount, phone: currentUser.phone });
    if (res.success && res.paymentUrl) {
      window.open(res.paymentUrl, '_blank');
    } else {
      showCustomAlert('خطا در درگاه', res.error);
    }
  } catch (err) {
    showCustomAlert('خطا', 'عدم امکان اتصال به درگاه.');
  }
};

window.logoutUser = function() {
  currentUser = null;
  localStorage.removeItem('site_user_auth');
  updateHeaderUserUI();
  document.getElementById('userDashboard').style.display = 'none';
  document.getElementById('authBox').style.display = 'block';
};
