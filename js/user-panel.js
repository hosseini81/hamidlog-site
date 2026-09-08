// ==================== احراز هویت و مدیریت داشبورد ۴گانه کارفرما ====================
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

  if (!phone || !pass) return showCustomAlert('ورودی ناقص', 'شماره همراه و رمز عبور الزامی است.');
  if (isRegisterMode && (!name || !email)) return showCustomAlert('ورودی ناقص', 'نام و آدرس ایمیل الزامی است.');

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
      btn.textContent = isRegisterMode ? 'ثبت‌نام' : 'ورود';
      showCustomAlert('خطا', res ? res.message : 'اطلاعات نامعتبر است.');
    }
  } catch (err) {
    btn.disabled = false;
    showCustomAlert('خطا', 'عدم برقراری ارتباط با سرور.');
  }
};

// سوئیچر ۴ گانه تب‌های داشبورد
window.switchUserPanelTab = function(tabName) {
  document.querySelectorAll('.dash-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.dash-panel-tab').forEach(t => t.classList.remove('active'));

  if (tabName === 'projects') {
    document.getElementById('tabBtnProjects').classList.add('active');
    document.getElementById('panelTabProjects').classList.add('active');
  } else if (tabName === 'support') {
    document.getElementById('tabBtnSupport').classList.add('active');
    document.getElementById('panelTabSupport').classList.add('active');
  } else if (tabName === 'downloads') {
    document.getElementById('tabBtnDownloads').classList.add('active');
    document.getElementById('panelTabDownloads').classList.add('active');
  } else if (tabName === 'profile') {
    document.getElementById('tabBtnProfile').classList.add('active');
    document.getElementById('panelTabProfile').classList.add('active');
  }
};

// تولید ستاره‌های امتیازدهی
function createRatingStars(type, rowId, currentRating) {
  let h = `<div class="task-rating-bar">`;
  for (let i = 1; i <= 5; i++) {
    const act = i <= (currentRating || 0) ? 'active' : '';
    h += `<span class="star-rating-chip ${act}" onclick="rateItem('${type}', ${rowId}, ${i})">★</span>`;
  }
  h += `</div>`;
  return h;
}

window.rateItem = async function(type, rowId, val) {
  try {
    const res = await sendToAppScript({ action: 'rateTask', type: type, rowId: rowId, rating: val });
    if (res && res.success) {
      showCustomAlert('ثبت شد', 'امتیاز شما با موفقیت ثبت گردید.', '⭐');
      loadUserDashboard();
    }
  } catch (e) {}
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
  const supportContainer = document.getElementById('userSupportContainer');

  try {
    const res = await sendToAppScript({ action: 'getDashboard', phone: currentUser.phone });
    const data = (res && res.data) ? res.data : (res || {});

    // ۱. رندر پروژه‌ها و تفکیک دقیق خدمات پکیج از خدمات ویژه
    if (ordersContainer) {
      ordersContainer.innerHTML = '';
      const orders = data.orders || [];

      if (orders.length === 0) {
        ordersContainer.innerHTML = '<div style="color:#64748b; padding:24px; text-align:center;">سفارش فعالی در بخش پروژه‌ها ثبت نشده است.</div>';
      } else {
        orders.forEach(o => {
          // الف: خدمات پکیج
          let pkgHtml = '';
          (o.packageTasks || []).forEach(t => {
            const dateTag = t.completed && t.date ? `<span class="task-date-tag">تکمیل: ${t.date}</span>` : `<span class="task-pending-tag">در دست اجرا</span>`;
            const linkTag = t.link ? `<a href="${t.link}" target="_blank" class="task-link-badge">🔗 مشاهده</a>` : '';
            pkgHtml += `
              <div class="task-item-row ${t.completed ? 'done' : ''}">
                <span class="task-status-icon">${t.completed ? '✅' : '⏳'}</span>
                <span class="task-name">${t.title}</span>
                ${linkTag}
                ${dateTag}
                ${createRatingStars('project', t.rowId, t.rating)}
              </div>
            `;
          });

          // ب: خدمات ویژه و مازاد
          let extraHtml = '';
          (o.extraTasks || []).forEach(t => {
            const dateTag = t.completed && t.date ? `<span class="task-date-tag">تکمیل: ${t.date}</span>` : `<span class="task-pending-tag">در نوبت</span>`;
            const linkTag = t.link ? `<a href="${t.link}" target="_blank" class="task-link-badge">🔗 مشاهده گزارش</a>` : '';
            extraHtml += `
              <div class="task-item-row ${t.completed ? 'done' : ''}">
                <span class="task-status-icon">${t.completed ? '💎' : '⏳'}</span>
                <span class="task-name">${t.title}</span>
                ${linkTag}
                ${dateTag}
                ${createRatingStars('project', t.rowId, t.rating)}
              </div>
            `;
          });

          ordersContainer.innerHTML += `
            <div class="order-dashboard-card">
              <div class="order-header-row">
                <strong style="font-size:14px;">${o.packageName}</strong>
                <span class="badge badge-pkg">${o.trackingCode}</span>
              </div>
              <div class="order-meta-subbar">
                <span>⏱ تحویل: ${o.deliveryDays} روز</span>
                <span class="badge-status-green">پیشرفت کل: ${o.progressPercent}</span>
              </div>

              <!-- بخش خدمات پکیج -->
              <div class="tasks-checklist-box">
                <div class="tasks-checklist-title">📦 خدمات اصلی پکیج انتخابی</div>
                ${pkgHtml || '<div style="font-size:11px; color:#94a3b8;">در انتظار شروع فاز اجرایی...</div>'}
              </div>

              <!-- بخش خدمات ویژه و مازاد -->
              ${extraHtml ? `
                <div class="tasks-checklist-box" style="margin-top:12px; background:#f0fdf4; border-color:#bbf7d0;">
                  <div class="tasks-checklist-title" style="color:#166534;">💎 خدمات ویژه و امکانات مازاد</div>
                  ${extraHtml}
                </div>
              ` : ''}

              <div style="margin-top:14px; text-align:left;">
                <a href="${o.pdfUrl}" target="_blank" class="btn-step-prev" style="font-size:11px; text-decoration:none;">📄 دانلود پیش‌فاکتور رسمی</a>
              </div>
            </div>
          `;
        });
      }
    }

    // ۲. رندر تب خدمات پشتیبانی دوره‌ای (ماه به ماه، بازه زمانی، لینک و امتیاز)
    if (supportContainer) {
      supportContainer.innerHTML = '';
      const supportList = data.supportList || [];

      if (supportList.length === 0) {
        supportContainer.innerHTML = `
          <div style="text-align:center; padding:30px 20px; background:#f8fafc; border-radius:12px; border:1px solid #e2e8f0;">
            <p style="color:#64748b; font-size:12px;">شما هنوز قرارداد پشتیبانی دوره‌ای فعالی ثبت نکرده‌اید.</p>
            <a href="support.html" class="btn-main" style="display:inline-block; font-size:11px; margin-top:8px; text-decoration:none;">
              سفارش پلن پشتیبانی وب‌سایت ➔
            </a>
          </div>
        `;
      } else {
        // گروه‌بندی بر اساس شناسه و دوره
        const grouped = {};
        supportList.forEach(item => {
          const key = `${item.supCode}_${item.period}`;
          if (!grouped[key]) grouped[key] = { ...item, items: [] };
          grouped[key].items.push(item);
        });

        for (const [k, p] of Object.entries(grouped)) {
          let tasksRows = '';
          p.items.forEach(it => {
            const linkElem = it.link 
              ? `<a href="${it.link}" target="_blank" class="support-task-link">🔗 ${it.taskText}</a>`
              : `<span>${it.taskText}</span>`;

            tasksRows += `
              <div class="support-task-row ${it.completed ? 'done' : ''}">
                <span class="task-status-icon">${it.completed ? '✅' : '🕒'}</span>
                <div style="flex:1;">${linkElem}</div>
                ${it.completed && it.date ? `<span class="task-date-tag">${it.date}</span>` : ''}
                ${createRatingStars('support', it.rowId, it.rating)}
              </div>
            `;
          });

          supportContainer.innerHTML += `
            <div class="support-period-card">
              <div class="support-period-head">
                <strong>🛡️ ${p.planTitle} (${p.period})</strong>
                <span class="support-range-badge">بازه: ${p.dateRange}</span>
              </div>
              <div class="support-period-body">${tasksRows}</div>
            </div>
          `;
        }
      }
    }

  } catch (err) {
    if (ordersContainer) ordersContainer.innerHTML = '<div style="color:#ef4444; padding:12px; text-align:center;">خطا در واکشی اطلاعات.</div>';
  }
}

// ذخیره تغییرات پروفایل
window.saveUserProfileData = async function() {
  const newName = (document.getElementById('editProfileName')?.value || '').trim();
  const newEmail = (document.getElementById('editProfileEmail')?.value || '').trim().toLowerCase();
  if (!newName) return showCustomAlert('خطا', 'نام الزامی است.');

  try {
    const res = await sendToAppScript({ action: 'updateProfile', phone: currentUser.phone, name: newName, email: newEmail });
    if (res && res.success) {
      currentUser.name = newName;
      currentUser.email = newEmail;
      localStorage.setItem('site_user_auth', JSON.stringify(currentUser));
      document.getElementById('dashUserName').textContent = newName;
      if (typeof syncGlobalUserState === "function") syncGlobalUserState();
      showCustomAlert('موفق', 'اطلاعات با موفقیت ذخیره شد.', '✔');
    }
  } catch (e) {}
};

window.uploadAvatarFile = function(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async function(e) {
    const b64 = e.target.result;
    document.getElementById('dashAvatarImg').src = b64;
    try {
      const res = await sendToAppScript({ action: 'updateAvatar', phone: currentUser.phone, avatar: b64 });
      if (res && res.success) {
        currentUser.avatar = res.avatar || b64;
        localStorage.setItem('site_user_auth', JSON.stringify(currentUser));
        if (typeof syncGlobalUserState === "function") syncGlobalUserState();
        showCustomAlert('موفق', 'آواتار ذخیره شد.', '✔');
      }
    } catch (e) {}
  };
  reader.readAsDataURL(file);
};

window.logoutUser = function() {
  currentUser = null;
  localStorage.removeItem('site_user_auth');
  if (typeof syncGlobalUserState === "function") syncGlobalUserState();
  document.getElementById('userDashboard').style.display = 'none';
  document.getElementById('authBox').style.display = 'block';
};




// ==================== اصلاحات تعاملی پنل کاربری ====================

// فراموشی رمز عبور
window.startForgotPasswordFlow = async function() {
  const phone = (document.getElementById('authPhone')?.value || '').trim();
  if (!phone) {
    return showCustomAlert('شماره تماس الزامی است', 'لطفاً ابتدا شماره موبایل خود را در کادر شماره همراه وارد کرده و مجدداً دکمه را بزنید.');
  }

  showCustomAlert('در حال بررسی', 'در حال صدور رمز عبور موقت و ارسال به ایمیل شما...', '⏳');

  try {
    const res = await sendToAppScript({ action: 'forgotPassword', phone: phone });
    if (res && res.success) {
      showCustomAlert('ارسال شد', res.message, '📧');
    } else {
      showCustomAlert('خطا', res ? res.message : 'حساب کاربری با این شماره یافت نشد.');
    }
  } catch (err) {
    showCustomAlert('خطای ارتباطی', 'خطا در ارتباط با سرور.');
  }
};

// ثبت امتیاز بدون باگ و رندر بلافاصله
window.rateItem = async function(type, rowId, val) {
  try {
    const res = await sendToAppScript({ action: 'rateTask', type: type, rowId: rowId, rating: val });
    if (res && res.success) {
      showCustomAlert('سپاسگزاریم', 'امتیاز شما با موفقیت ثبت شد.', '⭐');
      loadUserDashboard();
    }
  } catch (e) {
    console.error('خطا در ثبت امتیاز:', e);
  }
};
