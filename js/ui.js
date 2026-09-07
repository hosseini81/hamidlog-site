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
document.addEventListener("DOMContentLoaded", () => {
  initInfiniteCodeTerminal();
  initVirusChaseGame();
});

// ۱. تایپر نامحدود و سریع کدهای وب
function initInfiniteCodeTerminal() {
  const terminal = document.getElementById("codeStreamOutput");
  const screen = document.getElementById("terminalScreen");
  if (!terminal || !screen) return;

  const codeSnippets = [
    '<span class="token-kw">import</span> { createApp } <span class="token-kw">from</span> <span class="token-val">"vue"</span>;\n',
    '<span class="token-kw">const</span> app = <span class="token-fn">createApp</span>({ data() { <span class="token-kw">return</span> { secure: <span class="token-val">true</span> } } });\n',
    '<span class="token-tag">&lt;div</span> <span class="token-attr">class</span>=<span class="token-val">"cloud-database-sync"</span><span class="token-tag">&gt;</span>\n',
    '  <span class="token-tag">&lt;h3&gt;</span>Connecting to Shaparak Gateway...<span class="token-tag">&lt;/h3&gt;</span>\n',
    '<span class="token-tag">&lt;/div&gt;</span>\n',
    '<span class="token-comment">/* CSS Core Layout */</span>\n',
    '<span class="token-tag">.app-cluster</span> {\n',
    '  <span class="token-attr">display</span>: flex;\n',
    '  <span class="token-attr">backdrop-filter</span>: <span class="token-fn">blur</span>(16px);\n',
    '  <span class="token-attr">box-shadow</span>: 0 10px 30px <span class="token-val">rgba(0,0,0,0.5)</span>;\n',
    '}\n',
    '<span class="token-kw">async function</span> <span class="token-fn">executeOrder</span>(payload) {\n',
    '  <span class="token-kw">const</span> token = <span class="token-kw">await</span> crypto.<span class="token-fn">randomUUID</span>();\n',
    '  <span class="token-kw">const</span> res = <span class="token-kw">await</span> fetch(<span class="token-val">"/api/v2/orders"</span>, { body: JSON.<span class="token-fn">stringify</span>(payload) });\n',
    '  <span class="token-kw">return</span> res.<span class="token-fn">json</span>();\n',
    '}\n',
    '<span class="token-comment">// Live Apps Script Pipeline Ready</span>\n'
  ];

  let snippetIndex = 0;
  let charIndex = 0;
  let buffer = "";

  function streamNextChar() {
    const currentSnippet = codeSnippets[snippetIndex];

    if (charIndex < currentSnippet.length) {
      // پیدا کردن تگ‌های HTML در متن برای جلوگیری از شکسته شدن آن‌ها
      if (currentSnippet[charIndex] === '<') {
        const closeTag = currentSnippet.indexOf('>', charIndex);
        if (closeTag !== -1) {
          buffer += currentSnippet.substring(charIndex, closeTag + 1);
          charIndex = closeTag + 1;
        } else {
          buffer += currentSnippet[charIndex++];
        }
      } else {
        buffer += currentSnippet[charIndex++];
      }

      terminal.innerHTML = buffer;
      screen.scrollTop = screen.scrollHeight;
      setTimeout(streamNextChar, 14); // سرعت بسیار بالا در تایپ
    } else {
      charIndex = 0;
      snippetIndex = (snippetIndex + 1) % codeSnippets.length;
      // جلوگیری از سنگین شدن DOM با حذف خطوط ابتدایی
      if (buffer.length > 2500) {
        buffer = buffer.substring(buffer.indexOf('\n') + 1);
      }
      setTimeout(streamNextChar, 80);
    }
  }

  streamNextChar();
}

// ۲. شبیه‌ساز تعقیب و گریز ویروس و آنتی‌ویروس با حلقه بی‌نهایت و وقفه ۱۰ ثانیه‌ای
function initVirusChaseGame() {
  const virus = document.getElementById("actorVirus");
  const defender = document.getElementById("actorAntivirus");
  const stage = document.getElementById("chaseStage");
  if (!virus || !defender || !stage) return;

  function runChaseSequence() {
    const stageWidth = window.innerWidth;
    const duration = 6500; // مدت‌زمان دویدن در صفحه: ۶.۵ ثانیه
    const startTime = performance.now();

    function animateChase(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // مسیر حرکت افقی
      const virusX = progress * (stageWidth + 300) - 100;
      const defenderX = virusX - 95; // آنتی‌ویروس با فاصله به دنبال ویروس است اما به آن نمی‌رسد

      // مسیر مارپیچ و عمودی (حرکت زیگزاگی بین بخش‌ها بدون برخورد به لینک‌ها)
      const waveY = Math.sin(progress * Math.PI * 6) * 45 + 55;
      const defenderWaveY = Math.sin((progress - 0.05) * Math.PI * 6) * 45 + 55;

      // زاویه چرخش کاراکترها براساس شیب مسیر
      const rotVirus = Math.cos(progress * Math.PI * 6) * 20;
      const rotDefender = Math.cos((progress - 0.05) * Math.PI * 6) * 15;

      virus.style.transform = `translate(${virusX}px, ${waveY}px) rotate(${rotVirus}deg)`;
      defender.style.transform = `translate(${defenderX}px, ${defenderWaveY}px) rotate(${rotDefender}deg)`;

      if (progress < 1) {
        requestAnimationFrame(animateChase);
      } else {
        // خروج از صفحه و ریست پوزیشن به خارج از کادر
        virus.style.transform = "translate(-250px, 0)";
        defender.style.transform = "translate(-250px, 0)";

        // توقف ۱۰ ثانیه‌ای قبل از اجرای دور بعدی
        setTimeout(runChaseSequence, 10000);
      }
    }

    requestAnimationFrame(animateChase);
  }

  // شروع اولین دور ۳ ثانیه پس از لود صفحه
  setTimeout(runChaseSequence, 3000);
}
