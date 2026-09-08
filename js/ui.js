// ==================== تعاملات رابط کاربری، منوها و انیمیشن‌های فوتر ====================

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

// ==================== انیمیشن‌های فوتر: ترمینال کدها و تعقیب و گریز 👾 و 🤖 ====================

function bootFooterAnimations() {
  const terminal = document.getElementById("codeStreamOutput");
  const virus = document.getElementById("actorVirus");

  if (!terminal || !virus) {
    setTimeout(bootFooterAnimations, 150);
    return;
  }

  startCodeStream();
  startPixelChaseGame();
}

window.addEventListener("allModulesLoaded", bootFooterAnimations);
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(bootFooterAnimations, 350);
});

// ۱. تایپ پیوسته و نامحدود کدها
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
      setTimeout(streamLoop, 14);
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

// ==================== موتور تعقیب و گریز شطرنجی ۲۵ ثانیه‌ای 👾 و 🤖 ====================
function startPixelChaseGame() {
  const virus = document.getElementById("actorVirus");
  const defender = document.getElementById("actorAntivirus");
  const virusBubble = document.getElementById("virusBubble");
  const defBubble = document.getElementById("defenderBubble");
  const stage = document.getElementById("chaseStage");
  if (!virus || !defender || !stage || stage.dataset.running) return;
  stage.dataset.running = "true";

  const delay = ms => new Promise(res => setTimeout(res, ms));

  function setPos(actor, leftPx, topPx, durationMs = 800) {
    actor.style.transition = `left ${durationMs}ms linear, top ${durationMs}ms linear`;
    actor.style.left = leftPx + "px";
    actor.style.top = topPx + "px";
  }

  async function runEpicChase() {
    const stageWidth = stage.clientWidth || window.innerWidth;
    const stageHeight = Math.max(160, stage.clientHeight);

    // ایستگاه‌های شطرنجی در کریدورهای خالی فوتر (حرکت‌های ۹۰ درجه پله‌پله)
    const waypoints = [
      { x: -50, y: 15 },
      { x: Math.round(stageWidth * 0.12), y: 15 },
      { x: Math.round(stageWidth * 0.12), y: stageHeight - 45 },
      { x: Math.round(stageWidth * 0.36), y: stageHeight - 45 },
      { x: Math.round(stageWidth * 0.36), y: 15 },
      { x: Math.round(stageWidth * 0.60), y: 15 },
      { x: Math.round(stageWidth * 0.60), y: stageHeight - 45 },
      { x: Math.round(stageWidth * 0.84), y: stageHeight - 45 },
      { x: Math.round(stageWidth * 0.84), y: 20 },
      { x: Math.round(stageWidth * 0.50), y: 20 }, // نقطه مواجهه روبه‌رو
      { x: stageWidth + 80, y: 20 }                // فرار به بیرون
    ];

    // ۱. ریست حالت‌های اولیه
    virus.className = "grid-actor actor-alien-virus";
    defender.className = "grid-actor actor-cyber-bot";
    virusBubble.classList.remove("show");
    defBubble.classList.remove("show");

    // قرار دادن اولیه بیرون صفحه سمت چپ
    setPos(virus, waypoints[0].x, waypoints[0].y, 0);
    setPos(defender, waypoints[0].x - 60, waypoints[0].y, 0);
    await delay(200);

    // ۲. چرخیدن شطرنجی پله‌به‌پله در طول ۲۰ ثانیه
    for (let i = 1; i < waypoints.length - 2; i++) {
      const p = waypoints[i];
      const prevP = waypoints[i - 1];

      // حرکت ویروس
      setPos(virus, p.x, p.y, 900);

      // آنتی‌ویروس به نقطه قبلی ویروس می‌رود (تعقیب گام به گام)
      setPos(defender, prevP.x, prevP.y, 900);
      await delay(1100);

      // رویداد ۱: ویروس می‌ایستد و قهقهه می‌زند (گام ۳)
      if (i === 3) {
        virus.classList.add("laughing");
        virusBubble.textContent = "HA! HA!";
        virusBubble.classList.add("show");
        await delay(1600);
        virus.classList.remove("laughing");
        virusBubble.classList.remove("show");
      }

      // رویداد ۲: آنتی‌ویروس می‌ایستد و چهره سوالی و گیج می‌گیرد (گام ۵)
      if (i === 5) {
        defender.classList.add("confused");
        defBubble.textContent = "?!";
        defBubble.classList.add("show");
        await delay(1600);
        defender.classList.remove("confused");
        defBubble.classList.remove("show");
      }
    }

    // ۳. مرحله مواجهه نهایی: رو در رو شدن در مرکز
    const meetSpot = waypoints[waypoints.length - 2];
    setPos(virus, meetSpot.x, meetSpot.y, 800);
    setPos(defender, meetSpot.x - 70, meetSpot.y, 800);
    await delay(900);

    // آنتی‌ویروس عصبانی و شکارچی می‌شود
    defender.classList.add("hunter");
    defBubble.textContent = "LOCKED ON!";
    defBubble.classList.add("show");

    // ویروس می‌ترسد و به لرزه می‌افتد
    virus.classList.add("panic");
    virusBubble.textContent = "OH NOOO!";
    virusBubble.classList.add("show");
    await delay(1500);

    // ۴. فرار سریع از صفحه
    const exitSpot = waypoints[waypoints.length - 1];
    setPos(virus, exitSpot.x, exitSpot.y, 700);
    setPos(defender, exitSpot.x + 40, exitSpot.y, 750);
    await delay(1000);

    // ۵. ریست کاراکترها و آماده‌سازی برای دور بعد
    virusBubble.classList.remove("show");
    defBubble.classList.remove("show");
    virus.classList.remove("panic");
    defender.classList.remove("hunter");
    setPos(virus, -120, 20, 0);
    setPos(defender, -180, 20, 0);

    // توقف دقیقاً ۱۰ ثانیه‌ای قبل از شروع دور بعدی
    setTimeout(runEpicChase, 10000);
  }

  // استارت اولین دور تعقیب پس از ۱ ثانیه
  setTimeout(runEpicChase, 1000);
}



// ==================== موتور هوشمند فارسی‌سازی فراگیر اعداد ====================
(function () {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

  function toPersianDigits(str) {
    if (!str) return str;
    return str.replace(/\d/g, d => farsiDigits[d]);
  }

  // تگ‌ها یا کلاس‌هایی که نباید اعدادشان دستکاری شود
  const ignoreTags = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'INPUT', 'TEXTAREA']);

  function convertElementNumbers(node) {
    if (!node) return;

    // گره متنی
    if (node.nodeType === Node.TEXT_NODE) {
      const parent = node.parentNode;
      if (!parent || ignoreTags.has(parent.nodeName)) return;
      if (parent.closest && parent.closest('[dir="ltr"], .no-farsi-num, code, pre')) return;

      const text = node.nodeValue;
      // اگر عدد انگلیسی داشت و کد پیگیری ORD نبود
      if (/\d/.test(text) && !text.includes('ORD-') && !text.includes('@')) {
        node.nodeValue = toPersianDigits(text);
      }
      return;
    }

    // گره‌های تگ‌ها
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (ignoreTags.has(node.nodeName)) return;
      if (node.hasAttribute('dir') && node.getAttribute('dir').toLowerCase() === 'ltr') return;
      if (node.classList && node.classList.contains('no-farsi-num')) return;

      for (let child of node.childNodes) {
        convertElementNumbers(child);
      }
    }
  }

  function runPersianNumberConverter() {
    convertElementNumbers(document.body);

    // رصد تغییرات داینامیک صفحه (لود پروژه‌ها از شیت، تغییرات سبد خرید و...)
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach(addedNode => {
          convertElementNumbers(addedNode);
        });
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runPersianNumberConverter);
  } else {
    runPersianNumberConverter();
  }
})();
