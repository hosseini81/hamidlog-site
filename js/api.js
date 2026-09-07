// ==================== تنظیمات و کلاینت ارتباط با سرور ابری ====================
const SCRIPT_API_URL = "https://script.google.com/macros/s/AKfycbzN_Bi4QiDSHA7WoWs1ZoaolA3ipi47GvJ9FrEpsUVDCGLj6QJ6lurKkPCAt-eGXMpT-Q/exec";

// ارسال عمومی درخواست به گوگل اسکریپت با دور زدن محدودیت CORS
async function sendToAppScript(payloadData) {
  try {
    const response = await fetch(SCRIPT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payloadData)
    });
    return await response.json();
  } catch (error) {
    console.error("خطا در ارسال درخواست به سرور:", error);
    throw error;
  }
}

// واکشی داده‌های اولیه (پکیج‌ها و خدمات)
async function fetchInitialDataFromSheet() {
  const response = await fetch(`${SCRIPT_API_URL}?action=getInitialData`);
  return await response.json();
}

// روش جانبی JSONP در صورت مسدود شدن یا کندی fetch
function loadSheetDataViaJsonp(callbackName) {
  const script = document.createElement("script");
  script.src = `${SCRIPT_API_URL}?action=getInitialData&callback=${callbackName}`;
  script.onerror = () => {
    console.error("ارتباط JSONP با سرور برقرار نشد.");
  };
  document.body.appendChild(script);
}
