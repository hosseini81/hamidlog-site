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
      showCustomAlert('خطا در ورود', res ? res.message : 'اطلاعات وارد شده نامعتبر است.');
    }
  } catch (err) {
    btn.disabled = false;
    showCustomAlert('خطا', 'عدم برقراری ارتباط با سرور.');
  }
};

// فرایند فراموشی رمز عبور و ارسال کد موقت به ایمیل
window.startForgotPasswordFlow = async function() {
  const phone = (document.getElementById('authPhone')?.value || '').trim();
  if (!phone) {
    return showCustomAlert('شماره تماس الزامی است', 'لطفاً ابتدا شماره موبایل خود را در کادر بالا وارد کرده و سپس دکمه فراموشی رمز را بزنید.');
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
    showCustomAlert('خطای ارتباطی', 'خطا در ارتباط با سرور ابری.');
  }
};

// سوئیچر تب‌های چهارگانه داشبورد
window.switchUserPanelTab = function(tabName) {
  document.querySelectorAll('.dash-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.dash-panel-tab').forEach(t => t.classList.remove('active'));

  if (tabName === 'projects') {
    document.getElementById('tabBtnProjects')?.classList.add('active');
    document.getElementById('panelTabProjects')?.classList.add('active');
  } else if (tabName === 'support') {
    document.getElementById('tabBtnSupport')?.classList.add('active');
    document.getElementById('panelTabSupport')?.classList.add('active');
  } else if (tabName === 'downloads') {
    document.getElementById('tabBtnDownloads')?.classList.add('active');
    document.getElementById('panelTabDownloads')?.classList.add('active');
  } else if (tabName === 'profile') {
    document.getElementById('tabBtnProfile')?.classList.add('active');
    document.getElementById('panelTabProfile')?.classList.add('active');
  }
};

// ساخت ستاره‌های امتیازدهی تعاملی
function createRatingStars(type, rowId, currentRating) {
  let h = `<div class="task-rating-bar" title="ثبت رضایت شما">`;
  for (let i = 1; i <= 5; i++) {
    const act = i <= (currentRating || 0) ? 'active' : '';
    h += `<span class="star-rating-chip ${act}" onclick="rateItem('${type}', ${rowId}, ${i})">★</span>`;
  }
  h += `</div>`;
  return h;
}

// ثبت امتیاز در شیت و به‌روزرسانی زنده رابط کاربری
window.rateItem = async function(type, rowId, val) {
  try {
    const res = await sendToAppScript({ action: 'rateTask', type: type, rowId: rowId, rating: val });
    if (res && res.success) {
      showCustomAlert('سپاسگزاریم', 'امتیاز شما با موفقیت ثبت گردید.', '⭐');
      loadUserDashboard();
    } else {
      showCustomAlert('خطا', res ? res.error : 'خطا در ثبت امتیاز.');
    }
  } catch (e) {
    console.error('خطا در ثبت امتیاز:', e);
  }
};

// تابع تعاملی باز و بسته کردن پکیج‌های نگهداری و پروژه‌ها (آکاردئون)
window.toggleContractAccordion = function(headerEl) {
  const group = headerEl.closest('.support-contract-group, .project-accordion-card');
  if (group) {
    group.classList.toggle('collapsed');
  }
};

// تابع کمکی برای پاکسازی متن تکراری تسک‌ها
function sanitizeTaskTitle(rawTitle) {
  if (!rawTitle) return '';
  return rawTitle
    .replace(/^پروژه طراحی سایت:\s*/, '')
    .replace(/^پیکربندی پایه و نصب ساختار پروژه طراحی سایت:\s*/, 'پیکربندی پایه و راه‌اندازی ساختار: ')
    .replace(/^پیکربندی هسته اصلی پکیج:\s*/, 'پیکربندی هسته اصلی: ')
    .replace(/\s*\([\d,٬]+\s*ت\)$/, '')
    .trim();
}

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

    // لود محصولات دانلودی در تب سوم
    if (typeof renderUserDownloads === "function") {
      renderUserDownloads(data.purchasedDownloads || []);
    }

    // ۱. رندر پروژه‌های طراحی سایت (فیلتر کردن قراردادهای نگهداری از تب پروژه‌ها)
    if (ordersContainer) {
      ordersContainer.innerHTML = '';
      const allOrders = data.orders || [];

      // فیلتر: فقط پروژه‌های واقعی طراحی سایت (قراردادهای نگهداری حذف می‌شوند)
      const projectOrders = allOrders.filter(o => {
        const title = String(o.packageName || '');
        return !title.includes('قرارداد نگهداری') && !title.includes('پشتیبانی دوره‌ای');
      });

      if (projectOrders.length === 0) {
        ordersContainer.innerHTML = `
          <div style="text-align:center; padding:36px 20px; background:#f8fafc; border-radius:14px; border:1px solid #e2e8f0;">
            <div style="font-size:32px; margin-bottom:10px;">📋</div>
            <p style="color:#64748b; font-size:12px; margin-bottom:12px;">سفارش فعالی در بخش پروژه‌های طراحی سایت یافت نشد.</p>
            <a href="services.html" class="btn-main" style="display:inline-block; font-size:11px; text-decoration:none;">
              استعلام آنلاین پروژه جدید ➔
            </a>
          </div>
        `;
      } else {
        projectOrders.forEach(o => {
          // محاسبه درصد پیشرفت دقیق
          const allTasks = [...(o.packageTasks || []), ...(o.extraTasks || [])];
          const completedTasks = allTasks.filter(t => t.completed).length;
          let numericPercent = 0;
          if (allTasks.length > 0) {
            numericPercent = Math.round((completedTasks / allTasks.length) * 100);
          } else {
            numericPercent = parseInt(String(o.progressPercent || '0').replace(/[^\d]/g, ''), 10) || 0;
          }

          // تمیزسازی عنوان پروژه
          const displayProjectTitle = String(o.packageName || 'پروژه اختصاصی وب')
            .replace(/^پروژه طراحی سایت:\s*/, '');

          // مدت زمان تحویل
          const deliveryText = Number(o.deliveryDays) > 0 ? `${o.deliveryDays} روز کاری` : 'طبق زمان‌بندی قرارداد';

          // وضعیت برچسب پروژه
          let statusBadgeText = 'در دست اقدام';
          let statusBadgeClass = 'contract-active-badge';
          if (numericPercent === 100) {
            statusBadgeText = 'تحویل نهایی';
            statusBadgeClass = 'badge-status-green';
          } else if (numericPercent > 0) {
            statusBadgeText = 'فاز اجرایی فعال';
          }

          // الف) رندر تسک‌های اصلی پکیج
          let pkgHtml = '';
          (o.packageTasks || []).forEach(t => {
            const dateTag = t.completed && t.date ? `<span class="task-date-tag">تکمیل: ${t.date}</span>` : `<span class="task-pending-tag">در دست اجرا</span>`;
            const linkTag = t.link ? `<a href="${t.link}" target="_blank" class="task-link-badge">🔗 مشاهده فاز</a>` : '';
            pkgHtml += `
              <div class="task-item-row ${t.completed ? 'done' : ''}">
                <span class="task-status-icon">${t.completed ? '✅' : '⏳'}</span>
                <span class="task-name">${sanitizeTaskTitle(t.title)}</span>
                ${linkTag}
                ${dateTag}
                ${createRatingStars('project', t.rowId, t.rating)}
              </div>
            `;
          });

          // ب) رندر خدمات مازاد و ویژه
          let extraHtml = '';
          (o.extraTasks || []).forEach(t => {
            const dateTag = t.completed && t.date ? `<span class="task-date-tag">تکمیل: ${t.date}</span>` : `<span class="task-pending-tag">در نوبت اجرا</span>`;
            const linkTag = t.link ? `<a href="${t.link}" target="_blank" class="task-link-badge">🔗 مشاهده گزارش</a>` : '';
            extraHtml += `
              <div class="task-item-row ${t.completed ? 'done' : ''}">
                <span class="task-status-icon">${t.completed ? '💎' : '⏳'}</span>
                <span class="task-name">${sanitizeTaskTitle(t.title)}</span>
                ${linkTag}
                ${dateTag}
                ${createRatingStars('project', t.rowId, t.rating)}
              </div>
            `;
          });

          // لینک پیش‌فاکتور رسمی
          const invoiceBtn = o.pdfUrl 
            ? `<a href="${o.pdfUrl}" target="_blank" class="btn-step-prev" style="font-size:11px; text-decoration:none;">📄 دانلود پیش‌فاکتور و شرح قرارداد</a>`
            : '';

          ordersContainer.innerHTML += `
            <div class="project-accordion-card">
              <!-- سربرگ پروژه با نوار پیشرفت و قابلیت کلیک برای باز/بسته شدن -->
              <div class="project-accordion-header" onclick="toggleContractAccordion(this)">
                <div class="project-header-info">
                  <div class="project-title-row">
                    <strong class="project-card-title">${displayProjectTitle}</strong>
                    <span class="badge badge-pkg">${o.trackingCode || 'ORD'}</span>
                    <span class="${statusBadgeClass}">${statusBadgeText}</span>
                  </div>
                  <div class="project-meta-row">
                    <div class="project-progress-wrap">
                      <div class="project-progress-bar">
                        <div class="project-progress-fill" style="width: ${numericPercent}%;"></div>
                      </div>
                      <span class="project-progress-text">${numericPercent}٪ تکمیل شده</span>
                    </div>
                    <span class="project-delivery-meta">⏱ تحویل: <strong>${deliveryText}</strong></span>
                  </div>
                </div>
                <button type="button" class="contract-toggle-btn" aria-label="نمایش جزئیات">▾</button>
              </div>

              <!-- بدنه کشویی مراحل و چک‌لیست کار -->
              <div class="project-accordion-body">
                <div class="tasks-checklist-box">
                  <div class="tasks-checklist-title">📦 چک‌لیست مراحل اجرایی پروژه</div>
                  ${pkgHtml || '<div style="font-size:11px; color:#94a3b8;">در حال آماده‌سازی مستندات فاز اول...</div>'}
                </div>

                ${extraHtml ? `
                  <div class="tasks-checklist-box" style="margin-top:12px; background:#f0fdf4; border-color:#bbf7d0;">
                    <div class="tasks-checklist-title" style="color:#166534;">💎 ماژول‌ها و خدمات مازاد سفارشی‌شده</div>
                    ${extraHtml}
                  </div>
                ` : ''}

                ${invoiceBtn ? `<div style="margin-top:14px; text-align:left;">${invoiceBtn}</div>` : ''}
              </div>
            </div>
          `;
        });
      }
    }

    // ۲. رندر تفکیک‌شده و ساختاریافته خدمات پشتیبانی دوره‌ای زیرمجموعه هر پکیج
    if (supportContainer) {
      supportContainer.innerHTML = '';
      const supportList = data.supportList || [];

      if (supportList.length === 0) {
        supportContainer.innerHTML = `
          <div style="text-align:center; padding:30px 20px; background:#f8fafc; border-radius:12px; border:1px solid #e2e8f0;">
            <p style="color:#64748b; font-size:12px;">قرارداد پشتیبانی دوره‌ای فعالی برای حساب شما ثبت نشده است.</p>
            <a href="support.html" class="btn-main" style="display:inline-block; font-size:11px; margin-top:8px; text-decoration:none;">
              مشاهده پلن‌های نگهداری سایت ➔
            </a>
          </div>
        `;
      } else {
        const contractsMap = {};
        supportList.forEach(item => {
          const contractKey = item.supCode || item.planTitle || 'default-contract';
          if (!contractsMap[contractKey]) {
            contractsMap[contractKey] = {
              planTitle: item.planTitle || 'قرارداد پشتیبانی سایت',
              supCode: item.supCode || '',
              periodsMap: {}
            };
          }

          const periodKey = item.period || 'ماه اول';
          if (!contractsMap[contractKey].periodsMap[periodKey]) {
            contractsMap[contractKey].periodsMap[periodKey] = {
              period: periodKey,
              dateRange: item.dateRange || '',
              tasks: []
            };
          }

          contractsMap[contractKey].periodsMap[periodKey].tasks.push(item);
        });

        for (const [cKey, contract] of Object.entries(contractsMap)) {
          const periods = Object.values(contract.periodsMap);
          const totalMonths = periods.length;
          
          let completedMonthsCount = 0;
          periods.forEach(p => {
            if (p.tasks.some(t => t.completed)) completedMonthsCount++;
          });

          const progressPercent = totalMonths > 0 ? Math.round((completedMonthsCount / totalMonths) * 100) : 0;
          const isVip = contract.planTitle.includes('VIP') || contract.planTitle.includes('سئو');

          let periodsHtml = '';
          periods.forEach(p => {
            let tasksRows = '';
            p.tasks.forEach(it => {
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

            periodsHtml += `
              <div class="support-period-card">
                <div class="support-period-head">
                  <strong>${isVip ? '💎' : '🛡️'} ${p.period}</strong>
                  ${p.dateRange ? `<span class="support-range-badge">بازه: ${p.dateRange}</span>` : ''}
                </div>
                <div class="support-period-body">${tasksRows}</div>
              </div>
            `;
          });

          supportContainer.innerHTML += `
            <div class="support-contract-group">
              <div class="contract-group-header" onclick="toggleContractAccordion(this)">
                <div class="contract-header-right">
                  <span class="contract-badge-icon" style="${isVip ? 'background:#eff6ff; color:#2563eb;' : ''}">${isVip ? '💎' : '🛡️'}</span>
                  <div>
                    <div class="contract-title-row">
                      <strong class="contract-title">${contract.planTitle}</strong>
                      <span class="contract-duration-pill" style="${isVip ? 'background:#eff6ff; color:#1d4ed8;' : ''}">دوره ${totalMonths} ماهه</span>
                      <span class="contract-active-badge">${progressPercent === 100 ? 'تکمیل شده' : 'در حال اجرا'}</span>
                    </div>
                    <div class="contract-progress-wrap">
                      <div class="contract-progress-bar">
                        <div class="contract-progress-fill" style="width: ${progressPercent}%; ${isVip ? 'background:#2563eb;' : ''}"></div>
                      </div>
                      <span class="contract-progress-text">${completedMonthsCount} از ${totalMonths} ماه تکمیل شده (${progressPercent}٪)</span>
                    </div>
                  </div>
                </div>
                <button type="button" class="contract-toggle-btn" aria-label="نمایش جزئیات">▾</button>
              </div>

              <div class="contract-group-body">
                ${periodsHtml}
              </div>
            </div>
          `;
        }
      }
    }

  } catch (err) {
    if (ordersContainer) ordersContainer.innerHTML = '<div style="color:#ef4444; padding:12px; text-align:center;">خطا در دریافت اطلاعات داشبورد.</div>';
  }
}

// ذخیره اطلاعات هویتی
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
      showCustomAlert('موفق', 'مشخصات شما با موفقیت ذخیره شد.', '✔');
    }
  } catch (e) {}
};

// آپلود و پیش‌نمایش بلادرنگ آواتار
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
        showCustomAlert('موفق', 'عکس پروفایل شما ذخیره شد.', '✔');
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
