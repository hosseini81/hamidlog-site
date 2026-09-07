// ==================== مدیریت اختصاصی صفحه تسویه حساب و درگاه ====================
let checkoutData = null;
let appliedCheckoutCoupon = null;

document.addEventListener("DOMContentLoaded", () => {
  initCheckoutPage();
});

function initCheckoutPage() {
  const raw = sessionStorage.getItem("pending_order_data");
  if (!raw) {
    const listEl = document.getElementById("chkItemsList");
    if (listEl) {
      listEl.innerHTML = '<div style="color:#dc2626; font-size:11px;">سبد استعلام شما خالی است! لطفاً ابتدا پکیج یا محصول مورد نظر را انتخاب فرمایید.</div>';
    }
    return;
  }

  checkoutData = JSON.parse(raw);

  // تکمیل خودکار مشخصات در صورت لاگین بودن کاربر
  const userRaw = localStorage.getItem("site_user_auth");
  if (userRaw) {
    const user = JSON.parse(userRaw);
    const nameInp = document.getElementById("custName");
    const phoneInp = document.getElementById("custPhone");
    const badge = document.getElementById("autoFilledBadge");
    if (nameInp && user.name) nameInp.value = user.name;
    if (phoneInp && user.phone) phoneInp.value = user.phone;
    if (badge) badge.style.display = "inline-block";
  }

  renderCheckoutSummary();
}

function renderCheckoutSummary() {
  if (!checkoutData) return;

  const priceEl = document.getElementById("chkFinalPrice");
  const itemsEl = document.getElementById("chkItemsList");

  let payable = checkoutData.finalPriceNumeric;
  if (appliedCheckoutCoupon && appliedCheckoutCoupon.valid) {
    payable = Math.max(0, payable - appliedCheckoutCoupon.discountAmount);
  }

  if (priceEl) priceEl.textContent = Number(payable).toLocaleString("fa-IR") + " تومان";

  if (itemsEl) {
    let html = `<div style="font-size:11px; margin-bottom:6px;">📦 <strong>عنوان سفارش:</strong> ${checkoutData.packageName}</div>`;
    if (checkoutData.addedServicesSummary && checkoutData.addedServicesSummary.length > 0) {
      html += `<div style="font-size:10px; font-weight:800; color:#16a34a; margin-top:6px;">امکانات و ماژول‌ها:</div><ul style="margin:4px 14px; font-size:10px; color:#475569;">`;
      checkoutData.addedServicesSummary.forEach(item => {
        html += `<li>+ ${item}</li>`;
      });
      html += `</ul>`;
    }
    if (checkoutData.deductedServicesSummary && checkoutData.deductedServicesSummary.length > 0) {
      html += `<div style="font-size:10px; font-weight:800; color:#dc2626; margin-top:6px;">اقلام کسر شده:</div><ul style="margin:4px 14px; font-size:10px; color:#94a3b8;">`;
      checkoutData.deductedServicesSummary.forEach(item => {
        html += `<li style="text-decoration:line-through;">- ${item}</li>`;
      });
      html += `</ul>`;
    }
    itemsEl.innerHTML = html;
  }

  // به‌روزرسانی مبالغ نقدی و اقساطی
  const cashPrice = Math.round(payable * 0.95);
  const installmentTotal = Math.round(payable * 1.05);
  const firstInstallment = Math.round(installmentTotal * 0.4);
  const remainingTwo = Math.round((installmentTotal - firstInstallment) / 2);

  const fullEl = document.getElementById("fullPaySummary");
  const instEl = document.getElementById("installmentPaySummary");
  if (fullEl) fullEl.textContent = `مبلغ با ۵٪ تخفیف تسویه کامل: ${cashPrice.toLocaleString("fa-IR")} تومان`;
  if (instEl) instEl.textContent = `قسط اول: ${firstInstallment.toLocaleString("fa-IR")} ت + ۲ قسط ماهانه ${remainingTwo.toLocaleString("fa-IR")} ت`;
}

window.onCheckoutPlanChanged = function(plan) {
  renderCheckoutSummary();
};

window.applyCouponInCheckout = async function() {
  const couponInp = document.getElementById("couponInput");
  const msg = document.getElementById("couponMessage");
  if (!couponInp || !msg) return;

  const code = couponInp.value.trim();
  if (!code) return;

  msg.textContent = "در حال بررسی کد...";
  msg.style.color = "#2563eb";

  try {
    const res = await sendToAppScript({
      action: "validateCoupon",
      code: code,
      total: checkoutData.finalPriceNumeric
    });

    if (res && res.valid) {
      appliedCheckoutCoupon = res;
      msg.style.color = "#16a34a";
      msg.textContent = res.message;
    } else {
      appliedCheckoutCoupon = null;
      msg.style.color = "#dc2626";
      msg.textContent = res ? res.message : "کد نامعتبر است.";
    }
    renderCheckoutSummary();
  } catch (err) {
    showCustomAlert("خطا", "عدم امکان اعتبارسنجی کد تخفیف.");
  }
};

window.submitFinalCheckoutOrder = async function() {
  const name = (document.getElementById("custName")?.value || "").trim();
  const phone = (document.getElementById("custPhone")?.value || "").trim();

  if (!name || !phone) {
    return showCustomAlert("اطلاعات ناقص", "لطفاً نام و شماره همراه را تکمیل فرمایید.");
  }

  const payType = document.querySelector('input[name="payType"]:checked')?.value || "full";
  const btn = document.getElementById("submitBtn");
  btn.disabled = true;
  btn.textContent = "در حال صدور فاکتور و اتصال به درگاه شاپرک...";

  const finalPayload = {
    ...checkoutData,
    customerName: name,
    customerPhone: phone,
    paymentType: payType,
    appliedCouponCode: appliedCheckoutCoupon ? appliedCheckoutCoupon.code : "ندارد"
  };

  try {
    const res = await sendToAppScript({ action: "submitOrder", payload: finalPayload });
    if (res && res.success) {
      sessionStorage.removeItem("pending_order_data");
      document.getElementById("checkoutFormBox").style.display = "none";
      document.getElementById("orderSuccessWrap").style.display = "block";
      document.getElementById("successTrackCodeText").textContent = res.trackingCode;
      document.getElementById("successInvoiceLink").href = res.pdfUrl;

      if (res.paymentUrl) {
        document.getElementById("successGatewayLink").href = res.paymentUrl;
        window.location.href = res.paymentUrl;
      }
    } else {
      btn.disabled = false;
      btn.textContent = "💳 صدور پیش‌فاکتور و اتصال به درگاه شاپرک";
      showCustomAlert("خطا", res ? res.error : "خطا در اتصال به درگاه.");
    }
  } catch (err) {
    btn.disabled = false;
    btn.textContent = "💳 صدور پیش‌فاکتور و اتصال به درگاه شاپرک";
    showCustomAlert("خطای ارتباطی", "خطا در ارتباط با سرور ابری.");
  }
};
