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
  const regEmail = document.getElementById('regEmailField');
  const passGroup = document.getElementById('passFieldGroup');
  const toggleText = document.getElementById('authToggleText');
  const toggleLink = document.getElementById('authToggleLink');

  if (isRegisterMode) {
    if (titleEl) titleEl.textContent = 'ثبت‌نام کاربر جدید';
    if (submitBtn) submitBtn.textContent = 'ثبت‌نام و ایجاد حساب';
    if (regName) regName.style.display = 'block';
    if (regEmail) regEmail.style.display = 'block';
    if (toggleText) toggleText.textContent = 'قبلاً ثبت‌نام کرده‌اید؟';
    if (toggleLink) toggleLink.textContent = 'وارد شوید';
  } else {
    if (titleEl) titleEl.textContent = 'ورود به حساب کاربری';
    if (submitBtn) submitBtn.textContent = 'ورود به حساب کاربری';
    if (regName) regName.style.display = 'none';
    if (regEmail) regEmail.style.display = 'none';
    if (toggleText) toggleText.textContent = 'حساب کاربری ندارید؟';
    if (toggleLink) toggleLink.textContent = 'ثبت‌نام کنید';
  }
};

window.submitAuth = async function() {
  const phone = (document.getElementById('authPhone')?.value || '').trim();
  const pass = (document.getElementById('authPass')?.value || '').trim();
  const name = (document.getElementById('authName')?.value || '').trim();
  const email = (document.getElementById('authEmail')?.value || '').trim().toLowerCase();

  if (!phone || !pass) {
    return showCustomAlert('ورودی ناقص', 'شماره موبایل و رمز عبور الزامی است.');
  }

  if (isRegisterMode) {
    if (!name) return showCustomAlert('ورودی ناقص', 'نام و نام خانوادگی الزامی است.');
    if (!email || !email.includes('@') || !email.includes('.')) {
      return showCustomAlert('ایمیل نامعتبر', 'لطفاً یک آدرس ایمیل معتبر جهت دریافت فاکتورها وارد فرمایید.');
    }
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
      name: name,
      email: email
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
      showCustomAlert('خطا در احراز هویت', res ? res.message : 'اطلاعات وارد شده نامعتبر است.');
    }
  } catch (err) {
    btn.disabled = false;
    btn.textContent = isRegisterMode ? 'ثبت‌نام و ایجاد حساب' : 'ورود به حساب کاربری';
    showCustomAlert('خطای ارتباطی', 'خطا در ارتباط با سرور.');
  }
};

// فرایند ارسال رمز موقت به ایمیل کاربر
window.startForgotPasswordFlow = async function() {
  const phone = (document.getElementById('authPhone')?.value || '').trim();
  if (!phone) {
    return showCustomAlert('شماره تماس الزامی است', 'لطفاً ابتدا شماره موبایل خود را در کادر شماره همراه وارد کرده و مجدداً روی فراموشی رمز کلیک کنید.');
  }

  showCustomAlert('در حال بررسی', 'در حال بررسی مشخصات و ارسال ایمیل بازیابی رمز...', '⏳');

  try {
    const res = await sendToAppScript({ action: 'forgotPassword', phone: phone });
    if (res && res.success) {
      showCustomAlert('ارسال شد', res.message, '📧');
    } else {
      showCustomAlert('خطا', res ? res.message : 'حساب کاربری با این شماره یافت نشد.');
    }
  } catch (err) {
    showCustomAlert('خطای ارتباطی', 'خطا در ارسال درخواست بازیابی رمز عبور.');
  }
};

async function loadUserDashboard() {
  if (!currentUser || !currentUser.phone) return;

  const dashName = document.getElementById('dashUserName');
  const dashPhone = document.getElementById('dashUserPhone');
  const dashEmail = document.getElementById('dashUserEmail');
  const editName = document.getElementById('editProfileName');
  const editPhone = document.getElementById('editProfilePhone');
  const editEmail = document.getElementById('editProfileEmail');
  const avatarImg = document.getElementById('dashAvatarImg');

  if (dashName) dashName.textContent = currentUser.name || "کاربر گرامی";
  if (dashPhone) dashPhone.textContent = currentUser.phone || "";
  if (dashEmail) dashEmail.textContent = currentUser.email || "";
  if (editName) editName.value = currentUser.name || "";
  if (editPhone) editPhone.value = currentUser.phone || "";
  if (editEmail) editEmail.value = currentUser.email || "";
  if (currentUser.avatar && avatarImg) avatarImg.src = currentUser.avatar;

  const ordersContainer = document.getElementById('userProjectsList');

  try {
    const res = await sendToAppScript({ action: 'getDashboard', phone: currentUser.phone });
    const data = (res && res.data) ? res.data : (res || {});

    // به‌روزرسانی آواتار و ایمیل کاربر در صورت واکشی اطلاعات از سرور
    if (data.avatar) {
      currentUser.avatar = data.avatar;
      if (avatarImg) avatarImg.src = data.avatar;
    }
    if (data.email) {
      currentUser.email = data.email;
      if (dashEmail) dashEmail.textContent = data.email;
      if (editEmail) editEmail.value = data.email;
    }
    localStorage.setItem('site_user_auth', JSON.stringify(currentUser));
    if (typeof syncGlobalUserState === "function") syncGlobalUserState();

    // رندر محصولات دانلودی در تب دوم
    if (typeof renderUserDownloads === "function") {
      renderUserDownloads(data.purchasedDownloads || []);
    }

    // رندر پروژه‌ها، چک‌لیست مراحل کار و اقساط
    if (ordersContainer) {
      ordersContainer.innerHTML = '';
      const orders = data.orders || [];

      if (orders.length === 0) {
        ordersContainer.innerHTML = '<div style="color:#64748b; padding:24px; background:#f8fafc; border:1px solid var(--border-color); border-radius:12px; text-align:center; font-size:12px;">سفارش فعالی برای حساب شما ثبت نشده است.</div>';
      } else {
        orders.forEach(o => {
          // ساخت آیتم‌های چک‌لیست مراحل به همراه تاریخ شمسی تکمیل
          let tasksHtml = '';
          const tasks = (o.projectTasks && o.projectTasks.length > 0) ? o.projectTasks : [
            { title: 'بررسی اولیه و تنظیم نیازمندی‌ها', completed: true, date: o.date || '' },
            { title: `پیکربندی هسته اصلی: ${o.packageName}`, completed: false, date: '' },
            { title: 'پیاده‌سازی ماژول‌های فنی و صفحات', completed: false, date: '' },
            { title: 'تحویل نهایی و اتصال درگاه پرداخت', completed: false, date: '' }
          ];

          tasks.forEach(t => {
            const dateBadge = t.completed && t.date 
              ? `<span style="font-size:9px; background:#dcfce7; color:#15803d; padding:2px 8px; border-radius:4px; margin-right:auto; white-space:nowrap;">تکمیل در: ${t.date}</span>` 
              : `<span style="font-size:9px; margin-right:auto; color:#94a3b8; white-space:nowrap;">در دست اقدام</span>`;

            tasksHtml += `
              <div class="task-item-row ${t.completed ? 'done' : ''}">
                <span class="task-status-icon">${t.completed ? '✅' : '⏳'}</span>
                <span class="task-name">${t.title}</span>
                ${dateBadge}
              </div>
            `;
          });

          // وضعیت مالی و اقساط فاکتور
          let paymentDetailsHtml = '';
          if (o.paymentType && o.paymentType.includes('اقساطی')) {
            paymentDetailsHtml = `
              <div class="installments-grid-box">
                <div class="inst-card paid">
                  <strong>قسط ۱ (پیش‌پرداخت):</strong>
                  <div>${o.installment1 || 'تسویه شده'}</div>
                </div>
                <div class="inst-card ${String(o.installment2 || '').includes('پرداخت شده') ? 'paid' : 'waiting'}">
                  <strong>قسط ۲ (سررسید ۳۰ روزه):</strong>
                  <div>${o.installment2 || 'در انتظار'}</div>
                </div>
                <div class="inst-card ${String(o.installment3 || '').includes('پرداخت شده') ? 'paid' : 'waiting'}">
                  <strong>قسط ۳ (سررسید ۶۰ روزه):</strong>
                  <div>${o.installment3 || 'در انتظار'}</div>
                </div>
              </div>
            `;
          } else {
            paymentDetailsHtml = `
              <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:10px; margin-top:10px; font-size:11px; color:#166534; display:flex; justify-content:space-between; align-items:center;">
                <span>💳 روش تسویه: <strong>تسویه نقدی کامل (یکباره)</strong></span>
                <span style="font-weight:900;">${Number(o.totalPrice).toLocaleString('fa-IR')} تومان</span>
              </div>
            `;
          }

          ordersContainer.innerHTML += `
            <div style="border:1px solid var(--border-color); border-radius:14px; padding:18px; background:#ffffff; margin-bottom:16px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <strong style="font-size:14px; color:var(--bg-dark);">${o.packageName}</strong>
                <span class="badge badge-pkg" style="font-size:10px;">کد پیگیری: ${o.trackingCode}</span>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; margin-bottom:10px;">
                <span style="color:#64748b;">مدت اجرا: <strong>${o.deliveryDays || '-'} روز</strong> | تخفیف: <strong>${o.coupon || 'ندارد'}</strong></span>
                <span class="badge-status-green">پیشرفت پروژه: ${o.progressPercent || '۰٪'}</span>
              </div>

              <!-- چک‌لیست اختصاصی خدمات و مراحل پروژه -->
              <div class="tasks-checklist-box">
                <div class="tasks-checklist-title">
                  <span>📋 چک‌لیست خدمات و مراحل انجام کار</span>
                  <span style="font-size:10px; color:#64748b;">به‌روزرسانی آنلاین</span>
                </div>
                ${tasksHtml}
              </div>

              ${paymentDetailsHtml}

              <div style="margin-top:14px; display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:10px; color:#94a3b8;">تاریخ ثبت سفارش: ${o.date || '-'}</span>
                <a href="${o.pdfUrl}" target="_blank" class="btn-step-prev" style="font-size:11px; padding:6px 14px; text-decoration:none;">
                  📄 دانلود پیش‌فاکتور رسمی (PDF)
                </a>
              </div>
            </div>
          `;
        });
      }
    }
  } catch (err) {
    if (ordersContainer) ordersContainer.innerHTML = '<div style="color:#ef4444; padding:14px; text-align:center; font-size:11px;">خطا در دریافت اطلاعات داشبورد از سرور.</div>';
  }
}

// تغییر وضعیت تب‌های داشبورد
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

// ذخیره همزمان تغییرات نام و ایمیل کاربر در پروفایل
window.saveUserProfileData = async function() {
  const nameInput = document.getElementById('editProfileName');
  const emailInput = document.getElementById('editProfileEmail');

  const newName = nameInput ? nameInput.value.trim() : '';
  const newEmail = emailInput ? emailInput.value.trim().toLowerCase() : '';

  if (!newName) return showCustomAlert('خطا', 'نام نمی‌تواند خالی باشد.');
  if (newEmail && (!newEmail.includes('@') || !newEmail.includes('.'))) {
    return showCustomAlert('ایمیل نامعتبر', 'لطفاً فرمت ایمیل را صحیح وارد نمایید.');
  }

  try {
    const res = await sendToAppScript({ 
      action: 'updateProfile', 
      phone: currentUser.phone, 
      name: newName,
      email: newEmail 
    });

    if (res && res.success) {
      currentUser.name = newName;
      currentUser.email = newEmail;
      localStorage.setItem('site_user_auth', JSON.stringify(currentUser));
      
      const dashName = document.getElementById('dashUserName');
      const dashEmail = document.getElementById('dashUserEmail');
      if (dashName) dashName.textContent = newName;
      if (dashEmail) dashEmail.textContent = newEmail;

      if (typeof syncGlobalUserState === "function") syncGlobalUserState();
      showCustomAlert('موفقیت‌آمیز', 'مشخصات شما با موفقیت ذخیره شد.', '✔');
    } else {
      showCustomAlert('خطا', res ? res.error : 'خطا در به‌روزرسانی مشخصات.');
    }
  } catch (err) {
    showCustomAlert('خطا', 'عدم برقراری ارتباط با سرور.');
  }
};

// پشتیبانی از دکمه قبلی ذخیره نام
window.saveUserProfileName = window.saveUserProfileData;

// آپلود تصویر آواتار و نمایش فوری در صفحه
window.uploadAvatarFile = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function(e) {
    const base64Data = e.target.result;

    // نمایش بلادرنگ در رابط کاربری
    const img = document.getElementById('dashAvatarImg');
    if (img) img.src = base64Data;

    try {
      const res = await sendToAppScript({ action: 'updateAvatar', phone: currentUser.phone, avatar: base64Data });
      if (res && res.success) {
        currentUser.avatar = res.avatar || base64Data;
        if (img && res.avatar) img.src = res.avatar;
        localStorage.setItem('site_user_auth', JSON.stringify(currentUser));
        if (typeof syncGlobalUserState === "function") syncGlobalUserState();
        showCustomAlert('موفقیت', 'عکس پروفایل شما در فضای ابری ذخیره شد.', '✔');
      } else {
        showCustomAlert('خطا', res ? res.message : 'خطا در بارگذاری عکس.');
      }
    } catch (err) {
      showCustomAlert('خطا', 'خطا در ذخیره‌سازی تصویر نمایه.');
    }
  };
  reader.readAsDataURL(file);
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
