document.addEventListener("DOMContentLoaded", () => {
  Promise.all([
    fetch("components/header.html").then(res => res.text()),
    fetch("components/footer.html").then(res => res.text())
  ])
  .then(([headerHtml, footerHtml]) => {
    const headerSlot = document.getElementById("header-slot");
    const footerSlot = document.getElementById("footer-slot");

    if (headerSlot) headerSlot.innerHTML = headerHtml;
    if (footerSlot) footerSlot.innerHTML = footerHtml;

    // رویداد منوی همبرگری موبایل
    const burger = document.getElementById("hamburgerBtn");
    const drawer = document.getElementById("mobileDrawer");
    if (burger && drawer) {
      burger.addEventListener("click", () => {
        burger.classList.toggle("open");
        drawer.classList.toggle("show");
      });
    }

    // شناسایی صفحه فعلی و اکتیو کردن تب مربوطه در منو
    const path = window.location.pathname;
    let page = path.split("/").pop().replace(".html", "");
    if (!page || page === "") page = "index";

    document.querySelectorAll(`[data-page="${page}"]`).forEach(el => {
      el.classList.add("active");
    });
  })
  .catch(err => console.error("Error loading components:", err));
});
