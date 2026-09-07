// ==================== تعاملات رابط کاربری و منوها ====================

// راه‌اندازی لیسنرهای رابط کاربری
function initUIInteractions() {
  const burger = document.getElementById("hamburgerBtn");
  const drawer = document.getElementById("mobileDrawer");
  const backdrop = document.getElementById("drawerBackdrop");
  const closeBtn = document.getElementById("drawerCloseBtn");

  const openDrawer = () => {
    if (drawer) drawer.classList.add("show");
    if (backdrop) backdrop.classList.add("show");
    document.body.style.overflow = "hidden";
  };

  const closeDrawer = () => {
    if (drawer) drawer.classList.remove("show");
    if (backdrop) backdrop.classList.remove("show");
    document.body.style.overflow = "";
  };

  if (burger) burger.addEventListener("click", openDrawer);
  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  if (backdrop) backdrop.addEventListener("click", closeDrawer);

  document.querySelectorAll(".mobile-drawer .mobile-link, .mobile-drawer .mobile-cta-btn").forEach(link => {
    link.addEventListener("click", closeDrawer);
  });

  initTypeWriter();
}

// سوئیچر تب‌های دراور موبایل (صفحات / شبکه‌های اجتماعی)
window.switchDrawerTab = function(tabName) {
  const tabPages = document.getElementById("drawerTabPages");
  const tabSocials = document.getElementById("drawerTabSocials");
  const btnPages = document.getElementById("btnDrawerPages");
  const btnSocials = document.getElementById("btnDrawerSocials");

  if (tabName === "pages") {
    if (tabPages) tabPages.classList.add("active");
    if (tabSocials) tabSocials.classList.remove("active");
    if (btnPages) btnPages.classList.add("active");
    if (btnSocials) btnSocials.classList.remove("active");
  } else {
    if (tabSocials) tabSocials.classList.add("active");
    if (tabPages) tabPages.classList.remove("active");
    if (btnSocials) btnSocials.classList.add("active");
    if (btnPages) btnPages.classList.remove("active");
  }
};

// پاپ‌آپ سیستم
window.showCustomAlert = function(title, text, icon = '⚠️') {
  const iconEl = document.getElementById('customAlertIcon');
  const titleEl = document.getElementById('customAlertTitle');
  const textEl = document.getElementById('customAlertText');
  const alertEl = document.getElementById('customAlert');

  if (iconEl) iconEl.textContent = icon;
  if (titleEl) titleEl.textContent = title;
  if (textEl) textEl.textContent = text;
  if (alertEl) alertEl.style.display = 'flex';
};

window.closeCustomAlert = function() {
  const alertEl = document.getElementById('customAlert');
  if (alertEl) alertEl.style.display = 'none';
};

// افکت تایپ ماشین‌نویسی
function initTypeWriter() {
  const target = document.getElementById("typeTarget");
  if (!target) return;

  const phrases = ["فروشگاه‌های آنلاین ووکامرس", "وب‌سایت‌های شرکتی مدرن", "سامانه‌های متصل به دیتابیس"];
  let pIdx = 0, chIdx = 0, isDel = false;

  function run() {
    const cur = phrases[pIdx];
    if (isDel) {
      target.textContent = cur.substring(0, chIdx--);
      if (chIdx < 0) { isDel = false; pIdx = (pIdx + 1) % phrases.length; setTimeout(run, 350); return; }
    } else {
      target.textContent = cur.substring(0, chIdx++);
      if (chIdx > cur.length) { isDel = true; setTimeout(run, 1800); return; }
    }
    setTimeout(run, isDel ? 30 : 65);
  }
  run();

  const activeFaq = document.querySelector(".faq-item.active .faq-a");
  if (activeFaq) activeFaq.style.maxHeight = activeFaq.scrollHeight + "px";
}

// آکاردئون FAQ
window.toggleFaq = function(btn) {
  const item = btn.parentElement;
  const ans = item.querySelector(".faq-a");
  const isOpen = item.classList.contains("active");

  document.querySelectorAll(".faq-item").forEach(i => {
    i.classList.remove("active");
    i.querySelector(".faq-a").style.maxHeight = null;
  });

  if (!isOpen) {
    item.classList.add("active");
    ans.style.maxHeight = ans.scrollHeight + "px";
  }
};

// فیلتر پروژه‌ها در نمونه‌کار
window.filterProjects = function(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  document.querySelectorAll('.project-card').forEach(card => {
    if (cat === 'all' || card.getAttribute('data-cat') === cat) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
};




// ==================== موتور شبیه‌ساز انفجار بمب و افکت آتشین ====================
document.addEventListener("DOMContentLoaded", () => {
  initBoomTransitions();
});

function initBoomTransitions() {
  const canvas = document.getElementById("boomCanvas");
  const shockwave = document.getElementById("fireShockwave");
  if (!canvas || !shockwave) return;

  const ctx = canvas.getContext("2d");
  let particles = [];
  let animId = null;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  document.querySelectorAll(".boom-link").forEach(link => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      const target = link.getAttribute("target");

      // لینک‌های تلگرام یا تماس خارج از صفحه را به حالت عادی باز می‌کند
      if (!href || href.startsWith("tel:") || target === "_blank") return;

      e.preventDefault();

      const rect = link.getBoundingClientRect();
      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2;

      triggerBlast(originX, originY, href);
    });
  });

  function triggerBlast(x, y, destinationUrl) {
    canvas.style.display = "block";
    particles = [];

    // تولید ۷۵ ذره آتش، اخگر و دود نورانی
    const colors = ["#ffedd5", "#fed7aa", "#fb923c", "#f97316", "#dc2626", "#991b1b"];
    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 14 + 4;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: Math.random() * 8 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.03 + 0.015
      });
    }

    // پخش موج نورانی و آتش
    shockwave.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(254, 215, 170, 1) 0%, rgba(249, 115, 22, 0.95) 30%, rgba(220, 38, 38, 0.95) 60%, #0f172a 90%)`;
    shockwave.classList.add("detonate");

    function renderExplosion() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // گرانش آتش
        p.size *= 0.96;
        p.alpha -= p.decay;

        if (p.alpha > 0) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 12;
          ctx.shadowColor = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      particles = particles.filter(p => p.alpha > 0);

      if (particles.length > 0) {
        animId = requestAnimationFrame(renderExplosion);
      }
    }

    renderExplosion();

    // انتقال روان به مقصد پس از فروکش کردن انفجار
    setTimeout(() => {
      cancelAnimationFrame(animId);
      window.location.href = destinationUrl;
    }, 280);
  }
}



// ==================== موتور کدهای نامحدود و تعقیب و گریز فوتر ====================

// راه‌اندازی ایمن پس از لود کامل فوتر ماژولار
function bootFooterAnimations() {
  const terminal = document.getElementById("codeStreamOutput");
  const virus = document.getElementById("actorVirus");

  // اگر هنوز فوتر fetch نشده بود، پس از 150 میلی‌ثانیه دوباره تلاش کن
  if (!terminal || !virus) {
    setTimeout(bootFooterAnimations, 150);
    return;
  }

  startCodeStream();
  startVirusChase();
}

window.addEventListener("allModulesLoaded", bootFooterAnimations);
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(bootFooterAnimations, 300);
});

// ۱. تایپر فوق‌سریع و نامحدود کدها
function startCodeStream() {
  const terminal = document.getElementById("codeStreamOutput");
  const screen = document.getElementById("terminalScreen");
  if (!terminal || !screen || terminal.dataset.running) return;
  terminal.dataset.running = "true";

  const snippets = [
    '<span class="token-kw">import</span> { createStore } <span class="token-kw">from</span> <span class="token-val">"vuex"</span>;\n',
    '<span class="token-kw">const</span> gateway = <span class="token-fn">connectShaparak</span>({ merchantId: <span class="token-val">"ZARIN-889"</span> });\n',
    '<span class="token-tag">&lt;div</span> <span class="token-attr">class</span>=<span class="token-val">"cloud-service-node"</span><span class="token-tag">&gt;</span>\n',
    '  <span class="token-tag">&lt;p&gt;</span>Database status: 200 OK • Response Time: 14ms<span class="token-tag">&lt;/p&gt;</span>\n',
    '<span class="token-tag">&lt;/div&gt;</span>\n',
    '<span class="token-comment">/* Real-time CSS Pipeline Engine */</span>\n',
    '<span class="token-tag">.app-core</span> {\n',
    '  <span class="token-attr">display</span>: flex;\n',
    '  <span class="token-attr">backdrop-filter</span>: <span class="token-fn">blur</span>(20px);\n',
    '  <span class="token-attr">border</span>: 1px solid <span class="token-val">#10b981</span>;\n',
    '}\n',
    '<span class="token-kw">async function</span> <span class="token-fn">syncSheetPipeline</span>(data) {\n',
    '  <span class="token-kw">const</span> token = <span class="token-kw">await</span> crypto.<span class="token-fn">randomUUID</span>();\n',
    '  <span class="token-kw">return await</span> fetch(<span class="token-val">"https://script.google.com/exec"</span>, { method: <span class="token-val">"POST"</span>, body: data });\n',
    '}\n',
    '<span class="token-comment">// Infinite Streaming Loop Active...</span>\n'
  ];

  let snipIdx = 0;
  let charIdx = 0;
  let textAccumulator = "";

  function streamLoop() {
    const currentText = snippets[snipIdx];

    if (charIdx < currentText.length) {
      if (currentText[charIdx] === '<') {
        const closeTag = currentText.indexOf('>', charIdx);
        if (closeTag !== -1) {
          textAccumulator += currentText.substring(charIdx, closeTag + 1);
          charIdx = closeTag + 1;
        } else {
          textAccumulator += currentText[charIdx++];
        }
      } else {
        textAccumulator += currentText[charIdx++];
      }

      terminal.innerHTML = textAccumulator;
      screen.scrollTop = screen.scrollHeight;
      setTimeout(streamLoop, 15); // تایپ سریع خط به خط
    } else {
      charIdx = 0;
      snipIdx = (snipIdx + 1) % snippets.length;
      if (textAccumulator.length > 2000) {
        textAccumulator = textAccumulator.substring(textAccumulator.indexOf('\n') + 1);
      }
      setTimeout(streamLoop, 70);
    }
  }

  streamLoop();
}

// ۲. شبیه‌ساز تعقیب و گریز ویروس و آنتی‌ویروس با حلقه بی‌نهایت و وقفه ۱۰ ثانیه‌ای
function startVirusChase() {
  const virus = document.getElementById("actorVirus");
  const defender = document.getElementById("actorAntivirus");
  const stage = document.getElementById("chaseStage");
  if (!virus || !defender || !stage || stage.dataset.running) return;
  stage.dataset.running = "true";

  function runChase() {
    const stageWidth = window.innerWidth;
    const duration = 6000; // ۶ ثانیه مدت دویدن روی صفحه
    const start = performance.now();

    function step(timestamp) {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);

      // ویروس جلوتر است و آنتی‌ویروس به دنبال آن می‌دود اما به آن نمی‌رسد
      const virusX = progress * (stageWidth + 260) - 100;
      const defenderX = virusX - 110;

      // حرکت موجی و زیگزاگی میان ستون‌ها
      const waveY = Math.sin(progress * Math.PI * 5) * 45 + 50;
      const defWaveY = Math.sin((progress - 0.04) * Math.PI * 5) * 45 + 50;

      // چرخش و انحنای حرکتی کاراکترها
      const rotV = Math.cos(progress * Math.PI * 5) * 22;
      const rotD = Math.cos((progress - 0.04) * Math.PI * 5) * 16;

      virus.style.transform = `translate(${virusX}px, ${waveY}px) rotate(${rotV}deg)`;
      defender.style.transform = `translate(${defenderX}px, ${defWaveY}px) rotate(${rotD}deg)`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        // پنهان شدن پشت صفحه
        virus.style.transform = "translate(-300px, 40px)";
        defender.style.transform = "translate(-300px, 40px)";

        // توقف دقیقاً ۱۰ ثانیه‌ای قبل از تکرار مجدد چرخه
        setTimeout(runChase, 10000);
      }
    }

    requestAnimationFrame(step);
  }

  // شروع اولین حرکت پس از ۱ ثانیه
  setTimeout(runChase, 1000);
}
