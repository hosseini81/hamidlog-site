// ==================== تعاملات رابط کاربری، منوها و انیمیشن‌های فوتر ====================

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

// افکت تایپ ماشین‌نویسی در صفحه اصلی
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

// ==================== موتور کدهای زنده و تعقیب و گریز شطرنجی فوتر ====================

// بررسی لود فوتر و راه‌اندازی امن
function bootFooterAnimations() {
  const terminal = document.getElementById("codeStreamOutput");
  const virus = document.getElementById("actorVirus");

  if (!terminal || !virus) {
    setTimeout(bootFooterAnimations, 150);
    return;
  }

  startCodeStream();
  startGridChaseSequence();
  spawnClickableMiniBugs();
}

window.addEventListener("allModulesLoaded", bootFooterAnimations);
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(bootFooterAnimations, 300);
});

// ۱. تایپر فوق‌سریع و نامحدود کدهای HTML / CSS / JS
function startCodeStream() {
  const terminal = document.getElementById("codeStreamOutput");
  const screen = document.getElementById("terminalScreen");
  if (!terminal || !screen || terminal.dataset.running) return;
  terminal.dataset.running = "true";

  const snippets = [
    '<span class="token-kw">import</span> { createApp, ref } <span class="token-kw">from</span> <span class="token-val">"vue"</span>;\n',
    '<span class="token-kw">const</span> authSession = <span class="token-fn">initializeUserGuard</span>({ secure: <span class="token-val">true</span> });\n',
    '<span class="token-tag">&lt;section</span> <span class="token-attr">id</span>=<span class="token-val">"cloud-cluster-v3"</span><span class="token-tag">&gt;</span>\n',
    '  <span class="token-tag">&lt;div</span> <span class="token-attr">class</span>=<span class="token-val">"status-active"</span><span class="token-tag">&gt;</span>Database: 200 OK | Latency: 12ms<span class="token-tag">&lt;/div&gt;</span>\n',
    '<span class="token-tag">&lt;/section&gt;</span>\n',
    '<span class="token-comment">/* CSS GPU Acceleration Engine */</span>\n',
    '<span class="token-tag">.app-viewport</span> {\n',
    '  <span class="token-attr">display</span>: grid;\n',
    '  <span class="token-attr">backdrop-filter</span>: <span class="token-fn">blur</span>(24px);\n',
    '  <span class="token-attr">box-shadow</span>: 0 8px 32px <span class="token-val">rgba(15, 23, 42, 0.8)</span>;\n',
    '}\n',
    '<span class="token-kw">async function</span> <span class="token-fn">dispatchPaymentVerification</span>(authority) {\n',
    '  <span class="token-kw">const</span> token = <span class="token-kw">await</span> crypto.<span class="token-fn">randomUUID</span>();\n',
    '  <span class="token-kw">const</span> res = <span class="token-kw">await</span> fetch(<span class="token-val">"https://api.shaparak.ir/verify"</span>, { body: JSON.<span class="token-fn">stringify</span>({ authority, token }) });\n',
    '  <span class="token-kw">return</span> res.<span class="token-fn">json</span>();\n',
    '}\n',
    '<span class="token-comment">// Live Pipeline Stream Active (60fps)</span>\n'
  ];

  let snipIdx = 0;
  let charIdx = 0;
  let textAccumulator = "";

  function streamLoop() {
    const currentSnippet = snippets[snipIdx];

    if (charIdx < currentSnippet.length) {
      if (currentSnippet[charIdx] === '<') {
        const closeTag = currentSnippet.indexOf('>', charIdx);
        if (closeTag !== -1) {
          textAccumulator += currentSnippet.substring(charIdx, closeTag + 1);
          charIdx = closeTag + 1;
        } else {
          textAccumulator += currentSnippet[charIdx++];
        }
      } else {
        textAccumulator += currentSnippet[charIdx++];
      }

      terminal.innerHTML = textAccumulator;
      screen.scrollTop = screen.scrollHeight;
      setTimeout(streamLoop, 14); // سرعت بسیار بالای تایپ
    } else {
      charIdx = 0;
      snipIdx = (snipIdx + 1) % snippets.length;
      if (textAccumulator.length > 2000) {
        textAccumulator = textAccumulator.substring(textAccumulator.indexOf('\n') + 1);
      }
      setTimeout(streamLoop, 65);
    }
  }

  streamLoop();
}

// ۲. الگوریتم تعقیب و گریز شطرنجی (بیش از ۲۰ ثانیه در کریدورهای خالی، بدون برخورد به لینک‌ها)
function startGridChaseSequence() {
  const virus = document.getElementById("actorVirus");
  const defender = document.getElementById("actorAntivirus");
  const virusBubble = document.getElementById("virusBubble");
  const defBubble = document.getElementById("defenderBubble");
  const stage = document.getElementById("chaseStage");
  if (!virus || !defender || !stage || stage.dataset.running) return;
  stage.dataset.running = "true";

  // ساخت مسیرهای پله‌پله شطرنجی ۹۰ درجه در کانال‌های بدون متن فوتر
  function generateGridWaypoints() {
    const w = stage.clientWidth || window.innerWidth;
    const h = stage.clientHeight || 180;

    return [
      { x: -50, y: 12 },
      { x: w * 0.12, y: 12 },
      { x: w * 0.12, y: h - 35 },
      { x: w * 0.35, y: h - 35 },
      { x: w * 0.35, y: 12 },
      { x: w * 0.58, y: 12 },
      { x: w * 0.58, y: h - 35 },
      { x: w * 0.82, y: h - 35 },
      { x: w * 0.82, y: 15 },
      { x: w * 0.48, y: 15 }, // مواجهه رو در رو
      { x: w + 80, y: 15 }    // فرار از کادر
    ];
  }

  async function runGrandChase() {
    const points = generateGridWaypoints();
    const delay = ms => new Promise(r => setTimeout(r, ms));

    // ریست حالت‌های بصری
    virus.className = "grid-actor virus-claude";
    defender.className = "grid-actor defender-bot";
    virusBubble.classList.remove("show");
    defBubble.classList.remove("show");

    // گام‌زدن شطرنجی در طول حدود ۲۰ ثانیه
    for (let i = 0; i < points.length - 2; i++) {
      const p = points[i];

      // حرکت گام‌به‌گام ویروس
      virus.style.transform = `translate(${p.x}px, ${p.y}px)`;

      // تعقیب آنتی‌ویروس با ۱ خانه تأخیر شطرنجی
      if (i > 0) {
        const prevP = points[i - 1];
        defender.style.transform = `translate(${prevP.x}px, ${prevP.y}px)`;
      }

      await delay(1250);

      // توقف ۱: ویروس می‌ایستد و قهقهه می‌زند
      if (i === 2) {
        virus.classList.add("laughing");
        virusBubble.textContent = "HA! HA!";
        virusBubble.classList.add("show");
        await delay(1600);
        virus.classList.remove("laughing");
        virusBubble.classList.remove("show");
      }

      // توقف ۲: آنتی‌ویروس می‌ایستد و چهره تعجب و سوالی می‌گیرد
      if (i === 4) {
        defender.classList.add("confused");
        defBubble.textContent = "?!";
        defBubble.classList.add("show");
        await delay(1600);
        defender.classList.remove("confused");
        defBubble.classList.remove("show");
      }
    }

    // مرحله مواجهه نهایی
    const spot = points[points.length - 2];
    virus.style.transform = `translate(${spot.x}px, ${spot.y}px)`;
    defender.style.transform = `translate(${spot.x - 65}px, ${spot.y}px)`;
    await delay(500);

    // آنتی‌ویروس متوجه شده و چهره خفن و خشمگین می‌گیرد
    defender.classList.add("hunter");
    defBubble.textContent = "LOCKED ON!";
    defBubble.classList.add("show");

    // ویروس وحشت‌زده می‌شود
    virus.classList.add("panic");
    virusBubble.textContent = "OH NOOO!";
    virusBubble.classList.add("show");
    await delay(1400);

    // فرار سریع و شتاب‌زده هر دو کاراکتر به بیرون از صفحه فوتر
    const exitPoint = points[points.length - 1];
    virus.style.transition = "transform 0.75s cubic-bezier(0.4, 0, 0.2, 1)";
    defender.style.transition = "transform 0.85s cubic-bezier(0.4, 0, 0.2, 1)";

    virus.style.transform = `translate(${exitPoint.x}px, ${exitPoint.y}px)`;
    defender.style.transform = `translate(${exitPoint.x + 50}px, ${exitPoint.y}px)`;

    await delay(1100);

    // ریست به پوزیشن خارج از کادر
    virus.style.transition = "none";
    defender.style.transition = "none";
    virus.style.transform = "translate(-150px, -150px)";
    defender.style.transform = "translate(-150px, -150px)";
    virusBubble.classList.remove("show");
    defBubble.classList.remove("show");
    virus.classList.remove("panic");
    defender.classList.remove("hunter");

    setTimeout(() => {
      virus.style.transition = "transform 0.45s cubic-bezier(0.2, 0.9, 0.3, 1.2)";
      defender.style.transition = "transform 0.45s cubic-bezier(0.2, 0.9, 0.3, 1.2)";
    }, 100);

    // وقفه دقیقاً ۱۰ ثانیه‌ای قبل از شروع دور بعدی
    setTimeout(runGrandChase, 10000);
  }

  setTimeout(runGrandChase, 1500);
}

// ۳. ویروس‌های بنفش کوچک تعاملی جهت کلیک یا لمس
function spawnClickableMiniBugs() {
  const container = document.getElementById("miniBugsContainer");
  if (!container) return;
  container.innerHTML = "";

  // جایگاه‌های امن در حاشیه‌های آزاد
  const safePositions = [
    { top: "10px", left: "3%" },
    { top: "120px", left: "26%" },
    { top: "15px", right: "6%" },
    { top: "115px", right: "24%" }
  ];

  safePositions.forEach((pos) => {
    const bug = document.createElement("div");
    bug.className = "mini-bug";
    bug.style.top = pos.top;
    if (pos.left) bug.style.left = pos.left;
    if (pos.right) bug.style.right = pos.right;
    bug.title = "روی من بزن تا نابود بشم!";

    bug.innerHTML = `
      <div class="mini-bug-body">
        <span class="mini-bug-eye l"></span>
        <span class="mini-bug-eye r"></span>
      </div>
    `;

    const popBug = (e) => {
      e.stopPropagation();
      if (bug.classList.contains("popping")) return;

      bug.classList.add("popping");

      if (navigator.vibrate) navigator.vibrate(40);
      createPopParticles(bug.getBoundingClientRect());

      setTimeout(() => {
        bug.remove();
        setTimeout(() => spawnClickableMiniBugs(), 12000);
      }, 400);
    };

    bug.addEventListener("click", popBug);
    bug.addEventListener("touchstart", popBug, { passive: true });

    container.appendChild(bug);
  });
}

function createPopParticles(rect) {
  for (let i = 0; i < 6; i++) {
    const spark = document.createElement("div");
    spark.style.position = "fixed";
    spark.style.left = rect.left + rect.width / 2 + "px";
    spark.style.top = rect.top + rect.height / 2 + "px";
    spark.style.width = "4px";
    spark.style.height = "4px";
    spark.style.background = "#c084fc";
    spark.style.borderRadius = "50%";
    spark.style.pointerEvents = "none";
    spark.style.zIndex = "99999";
    spark.style.boxShadow = "0 0 6px #a855f7";
    document.body.appendChild(spark);

    const angle = (Math.PI * 2 / 6) * i;
    const distance = 24;
    const destX = Math.cos(angle) * distance;
    const destY = Math.sin(angle) * distance;

    spark.animate([
      { transform: "translate(0, 0) scale(1)", opacity: 1 },
      { transform: `translate(${destX}px, ${destY}px) scale(0)`, opacity: 0 }
    ], { duration: 350, easing: "ease-out" }).onfinish = () => spark.remove();
  }
}
