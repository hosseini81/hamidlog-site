/* ۱. لود استاندارد فونت فارسی وزیرمتن در بالاترین خط */
@import url('https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css');

/* ۲. پایه‌ها، متغیرها و ریست */
@import url('variables.css');
@import url('reset.css');
@import url('components.css');

/* ۳. ساختارهای مشترک سراسری */
@import url('header.css');
@import url('footer.css');

/* ۴. صفحات و سکشن‌های اختصاصی */
@import url('home.css');
@import url('portfolio.css');
@import url('order.css');
@import url('user.css');
@import url('about.css');
@import url('contact.css');
@import url('blog.css');
@import url('testimonials.css');

/* ۵. استایل‌های پایه بدنه */
html {
  font-family: 'Vazirmatn', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  direction: rtl;
}

body {
  font-family: 'Vazirmatn', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  direction: rtl;
  text-align: right;
  margin: 0;
  padding: 0;
  background-color: var(--bg-light, #f8fafc);
  color: var(--text-dark, #0f172a);
}
