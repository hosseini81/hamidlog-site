// ==================== ماژول ثبت و نمایش نظرات مشتریان ====================
let selectedRating = 5;
const ADMIN_PHONE = '09965206696';

// شروع کار پس از لود ماژول‌های data-include
function initCommentsModule() {
  if (document.getElementById("commentsCardsList")) {
    autoFillUserFields();
    setupStarRating();
    loadCommentsList();
  }
}

window.addEventListener("allModulesLoaded", initCommentsModule);
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(initCommentsModule, 400);
});

// پر کردن خودکار فیلدها در صورت لاگین بودن کاربر
function autoFillUserFields() {
  const userRaw = localStorage.getItem("site_user_auth");
  if (!userRaw) return;

  try {
    const user = JSON.parse(userRaw);
    const nameInp = document.getElementById("commentName");
    const phoneInp = document.getElementById("commentPhone");
    const emailInp = document.getElementById("commentEmail");
    const tip = document.getElementById("commentAutoFillTip");

    if (nameInp && user.name) nameInp.value = user.name;
    if (phoneInp && user.phone) phoneInp.value = user.phone;
    if (emailInp && user.email) emailInp.value = user.email;
    if (tip) tip.style.display = "inline-block";
  } catch (e) {}
}

// مدیریت انتخاب ستاره‌های امتیازدهی
function setupStarRating() {
  const stars = document.querySelectorAll(".star-rating-select .star-item");
  if (!stars || stars.length === 0) return;

  stars.forEach(star => {
    star.addEventListener("click", () => {
      selectedRating = Number(star.getAttribute("data-value"));
      stars.forEach(s => {
        const val = Number(s.getAttribute("data-value"));
        s.classList.toggle("active", val <= selectedRating);
      });
    });
  });
}

// واکشی و رندر لیست نظرات
async function loadCommentsList() {
  const listContainer = document.getElementById("commentsCardsList");
  if (!listContainer) return;

  try {
    const res = await sendToAppScript({ action: "getComments" });
    const comments = (res && res.data) ? res.data : [];

    if (comments.length === 0) {
      listContainer.innerHTML = '<div style="text-align:center; padding:30px; color:#64748b; font-size:12px;">اولین دیدگاه را شما ثبت کنید!</div>';
      return;
    }

    const avgRating = (comments.reduce((sum, c) => sum + (c.rating || 5), 0) / comments.length).toFixed(1);
    const avgEl = document.getElementById("averageRatingText");
    if (avgEl) avgEl.textContent = `${avgRating} از ۵ ستاره رضایت`;

    let currentUser = {};
    try {
      currentUser = JSON.parse(localStorage.getItem("site_user_auth") || "{}");
    } catch (e) {}

    const isAdmin = currentUser.phone === ADMIN_PHONE;

    let html = '';
    comments.forEach(c => {
      let starsHtml = '★'.repeat(c.rating || 5) + '☆'.repeat(5 - (c.rating || 5));
      const avatarSrc = c.avatar || 'https://via.placeholder.com/48?text=User';

      let replyHtml = '';
      if (c.adminReply && c.adminReply.trim()) {
        replyHtml = `
          <div class="admin-reply-box">
            <div class="admin-reply-header">
              <span class="admin-badge">👑 پاسخ استودیو حمیدرضا (مدیریت)</span>
              <span class="admin-reply-date">${c.replyDate || ''}</span>
            </div>
            <p class="admin-reply-text">${c.adminReply}</p>
          </div>
        `;
      } else if (isAdmin) {
        replyHtml = `
          <div class="admin-action-box" id="replyBox_${c.id}">
            <button type="button" class="btn-step-prev" onclick="toggleAdminReplyForm('${c.id}')" style="font-size:10px; padding:4px 10px;">
              ✍️ ارسال پاسخ مدیریت
            </button>
            <div id="replyFormWrap_${c.id}" style="display:none; margin-top:8px;">
              <textarea id="replyText_${c.id}" placeholder="متن پاسخ رسمی مدیریت..." style="width:100%; border-radius:6px; border:1px solid #cbd5e1; padding:8px; font-size:11px; font-family:inherit;"></textarea>
              <button type="button" class="btn-main" onclick="sendAdminReply('${c.id}')" style="font-size:10px; padding:6px 14px; margin-top:6px;">
                ثبت و انتشار پاسخ
              </button>
            </div>
          </div>
        `;
      }

      html += `
        <div class="comment-card">
          <div class="comment-top">
            <div class="comment-user">
              <img src="${avatarSrc}" class="comment-avatar" alt="${c.name}" onerror="this.src='https://via.placeholder.com/48?text=U'" />
              <div>
                <strong class="comment-author">${c.name}</strong>
                <div class="comment-date">${c.date}</div>
              </div>
            </div>
            <div class="comment-stars" title="${c.rating} ستاره">${starsHtml}</div>
          </div>
          <p class="comment-body">${c.text}</p>
          ${replyHtml}
        </div>
      `;
    });

    listContainer.innerHTML = html;
  } catch (err) {
    listContainer.innerHTML = '<div style="color:#ef4444; font-size:11px; text-align:center;">خطا در واکشی دیدگاه‌ها.</div>';
  }
}

// ارسال نظر توسط کاربر
window.submitUserFeedback = async function(event) {
  if (event && event.preventDefault) event.preventDefault();

  const nameEl = document.getElementById("commentName");
  const phoneEl = document.getElementById("commentPhone");
  const emailEl = document.getElementById("commentEmail");
  const textEl = document.getElementById("commentText");
  const btn = document.getElementById("commentSubmitBtn");

  const name = nameEl ? nameEl.value.trim() : "";
  const phone = phoneEl ? phoneEl.value.trim() : "";
  const email = emailEl ? emailEl.value.trim() : "";
  const text = textEl ? textEl.value.trim() : "";

  if (!name || !text) {
    return showCustomAlert("ورودی ناقص", "نام و متن دیدگاه الزامی است.");
  }

  if (!phone && !email) {
    return showCustomAlert("اطلاعات تماس", "لطفاً حداقل یکی از موارد شماره همراه یا ایمیل را وارد فرمایید.");
  }

  if (btn) {
    btn.disabled = true;
    btn.textContent = "در حال ثبت نظر...";
  }

  let avatar = "";
  try {
    const user = JSON.parse(localStorage.getItem("site_user_auth") || "{}");
    avatar = user.avatar || "";
  } catch (e) {}

  try {
    const res = await sendToAppScript({
      action: "submitComment",
      payload: {
        name: name,
        phone: phone,
        email: email,
        text: text,
        rating: selectedRating,
        avatar: avatar
      }
    });

    if (res && res.success) {
      showCustomAlert("سپاسگزاریم", res.message || "نظر شما ثبت شد.", "🌟");
      if (textEl) textEl.value = "";
      loadCommentsList();
    } else {
      showCustomAlert("خطا", res ? res.message : "خطا در ثبت دیدگاه.");
    }
  } catch (err) {
    showCustomAlert("خطای ارتباطی", "عدم برقراری ارتباط با سرور ابری.");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "🚀 ارسال دیدگاه و امتیاز";
    }
  }
};

window.toggleAdminReplyForm = function(cid) {
  const form = document.getElementById("replyFormWrap_" + cid);
  if (form) form.style.display = form.style.display === "none" ? "block" : "none";
};

window.sendAdminReply = async function(cid) {
  const txt = (document.getElementById("replyText_" + cid)?.value || "").trim();
  if (!txt) return showCustomAlert("خطا", "متن پاسخ نمی‌تواند خالی باشد.");

  let currentUser = {};
  try {
    currentUser = JSON.parse(localStorage.getItem("site_user_auth") || "{}");
  } catch (e) {}

  try {
    const res = await sendToAppScript({
      action: "replyComment",
      commentId: cid,
      replyText: txt,
      adminPhone: currentUser.phone
    });

    if (res && res.success) {
      showCustomAlert("موفقیت‌آمیز", res.message, "✔");
      loadCommentsList();
    } else {
      showCustomAlert("خطا", res ? res.message : "خطا در ثبت پاسخ.");
    }
  } catch (err) {
    showCustomAlert("خطا", "خطا در ارسال پاسخ مدیریت.");
  }
};
