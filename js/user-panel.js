// ==================== احراز هویت و مدیریت داشبورد کارفرما ====================
let currentUser = null;
let isRegisterMode = false;

function initUserSession() {
  try {
    const saved = localStorage.getItem('site_user_auth');
    if (saved) currentUser = JSON.parse(saved);
  } catch (e) {
    console.warn(e);
  }

  if (typeof syncGlobalUserState === "function") syncGlobalUserState();

  const authBox = document.getElementById("authBox");
  const userDash = document.getElementById("userDashboard");

  if (authBox && userDash) {
    if (currentUser && currentUser.phone) {
      authBox.style.display = "none";
      userDash.style.display = "block";
      loadUserDashboard();
    } else {
      authBox.style.display = "block";
      userDash.style.display = "none";
    }
  }
}
window.addEventListener("allModulesLoaded", initUserSession);

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
  const phone = (document.getElementById('authPhone')?.value || '').trim();
  const pass = (document.getElementById('authPass')?.value || '').trim();
  const name = (document.getElementById('authName')?.value || '').trim();

  if (!phone || !pass || (isRegisterMode && !name)) {
    return showCustomAlert('ورودی ناقص', 'تمامی فیلدها الزامی است.');
  }

  const btn = document.getElementById('authSubmitBtn');
  btn.disabled = true;
  btn.textContent = 'در حال ارتباط با سرور...';

  try {
    const res = await sendToAppScript({
      action: 'auth',
      authType: isRegisterMode ? 'register' : 'login',
      phone: phone,
      pass: pass,
      name: name
    });

    if (res && res.success) {
      currentUser = res.user;
      localStorage.setItem('site_user_auth', JSON.stringify(currentUser));
      if (typeof syncGlobalUserState === "function") syncGlobalUserState();

      document.getElementById('authBox').style.display = 'none';
      document.getElementById('userDashboard').style.display = 'block';
      loadUserDashboard();
    } else {
      btn.disabled = false;
      btn.textContent = isRegisterMode ? 'ثبت‌نام و ایجاد حساب' : 'ورود به حساب کاربری';
      showCustomAlert('خطا در ورود', res ? res.message : 'اطلاعات وارد شده نامعتبر است.');
    }
  } catch (err) {
    btn.disabled = false;
    btn.textContent = isRegisterMode ? 'ثبت‌نام و ایجاد حساب' : 'ورود به حساب کاربری';
    showCustomAlert('خطای ارتباطی', 'خطا در ارتباط با سرور.');
  }
};

async function loadUserDashboard() {
  if (!currentUser || !currentUser.phone) return;

  const dashName = document.getElementById('dashUserName');
  const dashPhone = document.getElementById('dashUserPhone');
  const editName = document.getElementById('editProfileName');
  const editPhone = document.getElementById('editProfilePhone');
  const avatarImg = document.getElementById('dashAvatarImg');

  if (dashName) dashName.textContent = currentUser.name || "کاربر گرامی";
  if (dashPhone) dashPhone.textContent = currentUser.phone || "";
  if (editName) editName.value = currentUser.name || "";
  if (editPhone) editPhone.value = currentUser.phone || "";
  if (currentUser.avatar && avatarImg) avatarImg.src = currentUser.avatar;

  const ordersContainer = document.getElementById('userProjectsList');

  try {
    const res = await sendToAppScript({ action: 'getDashboard', phone: currentUser.phone });
    const data = (res && res.data) ? res.data : (res || {});

    if (data.avatar) {
      currentUser.avatar = data.avatar;
      if (avatarImg) avatarImg.src = data.avatar;
      localStorage.setItem('site_user_auth', JSON.stringify(currentUser));
      if (typeof syncGlobalUserState === "function") syncGlobalUserState();
    }

    // رندر دانلودها در ماژول shop.js انجام می‌شود
    if (typeof renderUserDownloads === "function") {
      renderUserDownloads(data.purchasedDownloads || []);
    }

    // رندر پروژه‌ها و اقساط
    if (ordersContainer) {
      ordersContainer.innerHTML = '';
      const orders = data.orders || [];
      if (orders.length === 0) {
        ordersContainer.innerHTML = '<div style="color:#64748b; padding:20px; background:#f8fafc; border:1px solid var(--border-color); border-radius:12px; text-align:center; font-size:12px;">سفارش فعالی برای شما ثبت نشده است.</div>';
      } else {
        orders.forEach(o => {
          let stepsHtml = '';
          const allServices = (o.addedServices && o.addedServices.length > 0) ? o.addedServices : ['بررسی و تحلیل اولیه'];
          
          allServices.forEach((item, idx) => {
            const stepClass = idx === 0 ? 'done' : (idx === 1 ? 'in-progress' : '');
            const icon = idx === 0 ? '✔' : (idx === 1 ? '⚡' : '⏳');
            const stateText = idx === 0 ? 'انجام شد' : (idx === 1 ? 'در حال انجام' : 'در نوبت');
            stepsHtml += `<li class="timeline-item ${stepClass}"><span>${icon} ${item}</span><span>${stateText}</span></li>`;
          });

          const hasInstallment = Number(o.remainingAmount) > 0;
          const installmentSection = hasInstallment ? `
            <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:10px; margin-top:10px; font-size:11px;">
              <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                <strong>اقساط باقی‌مانده فاکتور:</strong>
                <span style="color:#dc2626; font-weight:900;">${Number(o.remainingAmount).toLocaleString('fa-IR')} تومان</span>
              </div>
              <div style="display:flex; gap:6px;">
                <input type="number" id="pay_amt_${o.trackingCode}" value="${o.remainingAmount}" style="padding:6px; font-size:11px; border:1px solid #cbd5e1; border-radius:6px; width:130px;" />
                <button type="button" class="btn-main" onclick="payCustomRemaining('${o.trackingCode}')" style="white-space:nowrap; font-size:11px; padding:6px 12px;">پرداخت قسط</button>
              </div>
            </div>
          ` : `<div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:8px; margin-top:8px; font-size:11px; color:#166534; text-align:center;">✔ تمامی اقساط این فاکتور تسویه شده است.</div>`;

          ordersContainer.innerHTML += `
            <div style="border:1px solid var(--border-color); border-radius:12px; padding:16px; background:#fff; margin-bottom:12px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <strong style="font-size:13px;">${o.packageName}</strong>
                <span class="badge badge-pkg">${o.trackingCode}</span>
              </div>
              <div style="font-size:11px; color:#64748b; margin-bottom:8px;">وضعیت: <strong>${o.projectStatus}</strong></div>
              <div style="font-size:11px; font-weight:800; color:#334155;">📋 مراحل انجام پروژه:</div>
              <ul class="timeline-steps-list">${stepsHtml}</ul>
              ${installmentSection}
              <div style="margin-top:12px; text-align:left;">
                <a href="${o.pdfUrl}" target="_blank" class="btn-step-prev" style="font-size:10px; text-decoration:none;">📄 دانلود پیش‌فاکتور رسمی</a>
              </div>
            </div>
          `;
        });
      }
    }
  } catch (err) {
    if (ordersContainer) ordersContainer.innerHTML = '<div style="color:#ef4444; padding:12px; text-align:center; font-size:11px;">خطا در دریافت اطلاعات.</div>';
  }
}

// سوئیچر تب‌های سه‌گانه پنل
window.switchUserPanelTab = function(tabName) {
  document.querySelectorAll('.dash-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.dash-panel-tab').forEach(t => t.classList.remove('active'));

  if (tabName === 'projects') {
    document.getElementById('tabBtnProjects').classList.add('active');
    document.getElementById('panelTabProjects').classList.add('active');
  } else if (tabName === 'downloads') {
    document.getElementById('tabBtnDownloads').classList.add('active');
    document.getElementById('panelTabDownloads').classList.add('active');
  } else if (tabName === 'profile') {
    document.getElementById('tabBtnProfile').classList.add('active');
    document.getElementById('panelTabProfile').classList.add('active');
  }
};

window.saveUserProfileName = async function() {
  const nameInput = document.getElementById('editProfileName');
  const newName = nameInput ? nameInput.value.trim() : '';

  if (!newName) return showCustomAlert('خطا', 'نام نمی‌تواند خالی باشد.');

  try {
    const res = await sendToAppScript({ action: 'updateName', phone: currentUser.phone, name: newName });
    if (res && res.success) {
      currentUser.name = newName;
      localStorage.setItem('site_user_auth', JSON.stringify(currentUser));
      document.getElementById('dashUserName').textContent = newName;
      if (typeof syncGlobalUserState === "function") syncGlobalUserState();
      showCustomAlert('موفقیت‌آمیز', 'نام شما با موفقیت ذخیره شد.', '✔');
    } else {
      showCustomAlert('خطا', res ? res.error : 'خطا در ثبت نام.');
    }
  } catch (err) {
    showCustomAlert('خطا', 'عدم برقراری ارتباط با سرور.');
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
        const img = document.getElementById('dashAvatarImg');
        if (img) img.src = base64Data;
        localStorage.setItem('site_user_auth', JSON.stringify(currentUser));
        if (typeof syncGlobalUserState === "function") syncGlobalUserState();
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
  if (!amount || amount < 1000) return showCustomAlert('مبلغ نامعتبر', 'حداقل مبلغ ۱,۰۰۰ تومان است.');

  try {
    const res = await sendToAppScript({ action: 'payInstallment', orderCode: orderCode, amount: amount, phone: currentUser.phone });
    if (res && res.success && res.paymentUrl) {
      window.open(res.paymentUrl, '_blank');
    } else {
      showCustomAlert('خطا در درگاه', res ? res.error : 'خطا در اتصال به بانک.');
    }
  } catch (err) {
    showCustomAlert('خطا', 'عدم امکان اتصال به درگاه.');
  }
};

window.logoutUser = function() {
  currentUser = null;
  localStorage.removeItem('site_user_auth');
  if (typeof syncGlobalUserState === "function") syncGlobalUserState();
  
  const userDash = document.getElementById('userDashboard');
  const authBox = document.getElementById('authBox');
  if (userDash) userDash.style.display = 'none';
  if (authBox) authBox.style.display = 'block';
};
