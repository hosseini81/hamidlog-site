// ==================== مدیریت پنل کاربری، احراز هویت و دانلودها ====================
let currentUser = null;
let isRegisterMode = false;

document.addEventListener("DOMContentLoaded", () => {
  initUserAuthUI();
});

// شنیدن رویداد اتمام بارگذاری هدر و لایوت
window.addEventListener("allModulesLoaded", () => {
  initUserAuthUI();
});

function initUserAuthUI() {
  try {
    const savedUser = localStorage.getItem('site_user_auth');
    if (savedUser) {
      currentUser = JSON.parse(savedUser);
    }
  } catch (e) {
    console.warn(e);
  }

  updateGlobalHeaderUserUI();

  // اگر در صفحه user.html بودیم
  if (document.getElementById("authBox") && document.getElementById("userDashboard")) {
    if (currentUser) {
      loadDashboard();
    } else {
      document.getElementById("authBox").style.display = "block";
      document.getElementById("userDashboard").style.display = "none";
    }
  }
}

// به‌روزرسانی همزمان هدر دسکتاپ و نوار پایین موبایل
function updateGlobalHeaderUserUI() {
  const nameEl = document.getElementById('headerUserName');
  const statusEl = document.getElementById('headerUserStatus');
  const avatarImg = document.getElementById('headerUserAvatar');
  const avatarPlaceholder = document.getElementById('headerUserPlaceholder');
  const headerBtn = document.getElementById('headerUserBtn');
  const bottomLabel = document.getElementById('bottomNavUserLabel');

  if (currentUser) {
    if (nameEl) nameEl.textContent = currentUser.name;
    if (statusEl) statusEl.textContent = "پنل کاربری فعال";
    if (headerBtn) headerBtn.classList.add("logged-in");
    if (bottomLabel) bottomLabel.textContent = currentUser.name.split(" ")[0];

    if (currentUser.avatar && avatarImg) {
      avatarImg.src = currentUser.avatar;
      avatarImg.style.display = "block";
      if (avatarPlaceholder) avatarPlaceholder.style.display = "none";
    }
  } else {
    if (nameEl) nameEl.textContent = "حساب کاربری";
    if (statusEl) statusEl.textContent = "ورود / ثبت‌نام";
    if (headerBtn) headerBtn.classList.remove("logged-in");
    if (bottomLabel) bottomLabel.textContent = "حساب من";
    if (avatarImg) avatarImg.style.display = "none";
    if (avatarPlaceholder) avatarPlaceholder.style.display = "flex";
  }
}

// سوئیچ بین حالت ورود و ثبت‌نام
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
  const nameEl = document.getElementById('authName');
  const name = nameEl ? nameEl.value.trim() : '';

  if (!phone || !pass || (isRegisterMode && !name)) {
    return showCustomAlert('ورودی ناقص', 'تمامی فیلدها الزامی است.');
  }

  const btn = document.getElementById('authSubmitBtn');
  btn.disabled = true;
  btn.textContent = 'در حال پردازش...';

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
      updateGlobalHeaderUserUI();
      loadDashboard();
    } else {
      btn.disabled = false;
      btn.textContent = isRegisterMode ? 'ثبت‌نام و ایجاد حساب' : 'ورود به حساب کاربری';
      showCustomAlert('خطا در احراز هویت', res.message);
    }
  } catch (err) {
    btn.disabled = false;
    btn.textContent = isRegisterMode ? 'ثبت‌نام و ایجاد حساب' : 'ورود به حساب کاربری';
    showCustomAlert('خطا', 'عدم برقراری ارتباط با سرور.');
  }
};

// بارگذاری داشبورد
async function loadDashboard() {
  document.getElementById('authBox').style.display = 'none';
  document.getElementById('userDashboard').style.display = 'block';
  document.getElementById('dashUserName').textContent = currentUser.name;
  document.getElementById('dashUserPhone').textContent = currentUser.phone;

  // مقداردهی فیلدهای ویرایش هویت
  const editName = document.getElementById('editProfileName');
  const editPhone = document.getElementById('editProfilePhone');
  if (editName) editName.value = currentUser.name;
  if (editPhone) editPhone.value = currentUser.phone;

  if (currentUser.avatar) {
    document.getElementById('dashAvatarImg').src = currentUser.avatar;
  }

  try {
    const res = await sendToAppScript({ action: 'getDashboard', phone: currentUser.phone });
    const data = res.data;

    if (data && data.avatar) {
      currentUser.avatar = data.avatar;
      document.getElementById('dashAvatarImg').src = data.avatar;
      localStorage.setItem('site_user_auth', JSON.stringify(currentUser));
      updateGlobalHeaderUserUI();
    }

    // رندر محصولات دانلودی
    const dlContainer = document.getElementById('userPurchasedDownloadsList');
    if (dlContainer) {
      dlContainer.innerHTML = '';
      const downloads = (data && data.purchasedDownloads) ? data.purchasedDownloads : [];
      if (downloads.length === 0) {
        dlContainer.innerHTML = '<div style="font-size:11px; color:#64748b; padding:16px; background:#f8fafc; border-radius:10px; text-align:center;">هنوز فایل دانلودی خریداری نکرده‌اید.</div>';
      } else {
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
    }

    // رندر پروژه‌ها و اقساط
    const list = document.getElementById('userProjectsList');
    if (list) {
      list.innerHTML = '';
      const orders = (data && data.orders) ? data.orders : [];
      if (orders.length === 0) {
        list.innerHTML = '<div style="color:#64748b; padding:20px; background:#fff; border:1px solid var(--border-color); border-radius:12px; text-align:center;">سفارش فعالی برای شما ثبت نشده است.</div>';
        return;
      }

      orders.forEach(o => {
        let stepsHtml = '';
        const allServices = [...o.addedServices];
        allServices.forEach((item, idx) => {
          const stepClass = idx === 0 ? 'done' : (idx === 1 ? 'in-progress' : '');
          const icon = idx === 0 ? '✔' : (idx === 1 ? '⚡' : '⏳');
          const stateText = idx === 0 ? 'انجام شد' : (idx === 1 ? 'در حال انجام' : 'در نوبت');
          stepsHtml += `<li class="timeline-item ${stepClass}"><span>${icon} ${item}</span><span>${stateText}</span></li>`;
        });

        const hasInstallment = o.remainingAmount > 0;
        const installmentSection = hasInstallment ? `
          <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:10px; margin-top:10px; font-size:11px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
              <strong>اقساط باقی‌مانده فاکتور:</strong>
              <span style="color:#dc2626; font-weight:900;">${Number(o.remainingAmount).toLocaleString('fa-IR')} تومان</span>
            </div>
            <div style="display:flex; gap:6px;">
              <input type="number" id="pay_amt_${o.trackingCode}" value="${o.remainingAmount}" style="padding:6px; font-size:11px; border:1px solid #cbd5e1; border-radius:6px;" />
              <button type="button" class="btn-main" onclick="payCustomRemaining('${o.trackingCode}')" style="white-space:nowrap; font-size:11px; padding:6px 12px;">پرداخت قسط</button>
            </div>
          </div>
        ` : `<div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:8px; margin-top:8px; font-size:11px; color:#166534; text-align:center;">✔ تمامی اقساط این فاکتور تسویه شده است.</div>`;

        list.innerHTML += `
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
  } catch (err) {
    showCustomAlert('خطا', 'خطا در واکشی سوابق.');
  }
}

// سوئیچر تب‌های سه‌گانه داشبورد
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

// تغییر نام کاربر
window.saveUserProfileName = async function() {
  const nameInput = document.getElementById('editProfileName');
  const newName = nameInput ? nameInput.value.trim() : '';

  if (!newName) {
    return showCustomAlert('خطا', 'نام نمی‌تواند خالی باشد.');
  }

  try {
    const res = await sendToAppScript({
      action: 'updateName',
      phone: currentUser.phone,
      name: newName
    });

    if (res && res.success) {
      currentUser.name = newName;
      localStorage.setItem('site_user_auth', JSON.stringify(currentUser));
      document.getElementById('dashUserName').textContent = newName;
      updateGlobalHeaderUserUI();
      showCustomAlert('موفقیت‌آمیز', 'نام شما با موفقیت به‌روزرسانی شد.', '✔');
    } else {
      showCustomAlert('خطا', res.error || 'خطا در ثبت تغییرات.');
    }
  } catch (err) {
    showCustomAlert('خطا', 'عدم برقراری ارتباط با سرور.');
  }
};

// تغییر تصویر پروفایل
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
        localStorage.setItem('site_user_auth', JSON.stringify(currentUser));
        updateGlobalHeaderUserUI();
      }
    } catch (err) {
      showCustomAlert('خطا', 'خطا در ذخیره‌سازی نمایه.');
    }
  };
  reader.readAsDataURL(file);
};

// دانلود امن
window.downloadProductSecurely = async function(productId) {
  if (!currentUser || !currentUser.phone) {
    return showCustomAlert('نیاز به ورود', 'لطفاً وارد حساب کاربری خود شوید.');
  }

  try {
    const res = await sendToAppScript({ action: 'requestDownload', phone: currentUser.phone, productId: productId });
    if (res && res.success && res.downloadUrl) {
      window.open(res.downloadUrl, '_blank');
    } else {
      showCustomAlert('عدم دسترسی', res.error || 'دسترسی برای دانلود این فایل تایید نشد.');
    }
  } catch (err) {
    showCustomAlert('خطا', 'خطا در دریافت لینک امن.');
  }
};

// پرداخت اقساط
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

// خروج
window.logoutUser = function() {
  currentUser = null;
  localStorage.removeItem('site_user_auth');
  updateGlobalHeaderUserUI();
  document.getElementById('userDashboard').style.display = 'none';
  document.getElementById('authBox').style.display = 'block';
};
