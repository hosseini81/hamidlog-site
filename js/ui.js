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

// ۲. موتور تعقیب و گریز ۲۵ ثانیه‌ای شطرنجی با وقفه‌ها و انیمیشن روان
function startPixelChaseGame() {
  const virus = document.getElementById("actorVirus");
  const defender = document.getElementById("actorAntivirus");
  const virusBubble = document.getElementById("virusBubble");
  const defBubble = document.getElementById("defenderBubble");
  const stage = document.getElementById("chaseStage");
  if (!virus || !defender || !stage || stage.dataset.running) return;
  stage.dataset.running = "true";

  function getWaypoints() {
    const w = stage.clientWidth || window.innerWidth;
    const h = stage.clientHeight || 180;

    // مسیر شطرنجی گام‌به‌گام (حرکت‌ها با زوایای ۹۰ درجه و در فضاهای خالی بدون متن)
    return [
      { x: -50, y: 15 },
      { x: w * 0.12, y: 15 },
      { x: w * 0.12, y: h - 35 },
      { x: w * 0.36, y: h - 35 },
      { x: w * 0.36, y: 15 },
      { x: w * 0.60, y: 15 },
      { x: w * 0.60, y: h - 35 },
      { x: w * 0.84, y: h - 35 },
      { x: w * 0.84, y: 18 },
      { x: w * 0.48, y: 18 }, // نقطه مواجهه نهایی
      { x: w + 90, y: 18 }    // خروج نهایی
    ];
  }

  function setPos(actor, x, y) {
    actor.style.transform = `translate(${x}px, ${y}px)`;
  }

  // تابع درون‌یابی حرکت پله‌ای برای گام برداشتن شطرنجی
  function stepInterpolate(p1, p2, t) {
    // ابتدا در یک محور حرکت کن، سپس در محور دیگر (حرکت شطرنجی واقعی)
    if (t < 0.5) {
      const subT = t * 2;
      return {
        x: p1.x + (p2.x - p1.x) * subT,
        y: p1.y
      };
    } else {
      const subT = (t - 0.5) * 2;
      return {
        x: p2.x,
        y: p1.y + (p2.y - p1.y) * subT
      };
    }
  }

  function runEpicChase() {
    const waypoints = getWaypoints();
    const totalLegs = waypoints.length - 2;
    const legDuration = 2200; // هر خانه شطرنجی ۲.۲ ثانیه طول می‌کشد تا حس چرخیدن ۲۰ الی ۲۵ ثانیه‌ای ایجاد شود
    const totalTime = totalLegs * legDuration;
    const startTime = performance.now();

    // پاکسازی کلاس‌های حالت قبلی
    virus.className = "grid-actor actor-alien-virus";
    defender.className = "grid-actor actor-cyber-bot";
    virusBubble.classList.remove("show");
    defBubble.classList.remove("show");

    let isFacingBoss = false;

    function frame(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / totalTime, 1);

      // محاسبه شاخص نقطه فعلی
      const currentFloatLeg = progress * totalLegs;
      const legIndex = Math.min(Math.floor(currentFloatLeg), totalLegs - 1);
      const legT = currentFloatLeg - legIndex;

      // ۱. حرکت شطرنجی ویروس 👾
      const vPos = stepInterpolate(waypoints[legIndex], waypoints[legIndex + 1], legT);
      setPos(virus, vPos.x, vPos.y);

      // ۲. حرکت شطرنجی آنتی‌ویروس 🤖 با ۲ ثانیه تأخیر
      const defDelaySec = 0.8;
      const defLegFloat = Math.max(0, currentFloatLeg - defDelaySec);
      const defLegIndex = Math.min(Math.floor(defLegFloat), totalLegs - 1);
      const defLegT = defLegFloat - defLegIndex;
      const dPos = stepInterpolate(waypoints[defLegIndex], waypoints[defLegIndex + 1], defLegT);
      setPos(defender, dPos.x, dPos.y);

      // رویداد ۱: خنده و قهقهه ویروس در گام ۳ (ثانیه ۷)
      if (legIndex === 3 && legT > 0.2 && legT < 0.8) {
        virus.classList.add("laughing");
        virusBubble.textContent = "HA! HA!";
        virusBubble.classList.add("show");
      } else if (legIndex !== 3) {
        virus.classList.remove("laughing");
        if (!isFacingBoss) virusBubble.classList.remove("show");
      }

      // رویداد ۲: تعجب و چهره سوالی آنتی‌ویروس در گام ۵ (ثانیه ۱۳)
      if (defLegIndex === 5 && defLegT > 0.2 && defLegT < 0.8) {
        defender.classList.add("confused");
        defBubble.textContent = "?!";
        defBubble.classList.add("show");
      } else if (defLegIndex !== 5) {
        defender.classList.remove("confused");
        if (!isFacingBoss) defBubble.classList.remove("show");
      }

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        // مرحله ۳: اوج مواجهه و فرار سریع
        triggerBossEncounter();
      }
    }

    requestAnimationFrame(frame);

    function triggerBossEncounter() {
      isFacingBoss = true;
      const spot = waypoints[waypoints.length - 2];
      setPos(virus, spot.x, spot.y);
      setPos(defender, spot.x - 55, spot.y);

      // چهره خفن و خشمگین آنتی‌ویروس 🤖
      defender.classList.add("hunter");
      defBubble.textContent = "LOCKED ON!";
      defBubble.classList.add("show");

      // چهره ترس و لرزش شدید ویروس 👾
      virus.classList.add("panic");
      virusBubble.textContent = "OH NOOO!";
      virusBubble.classList.add("show");

      // بعد از ۱.۴ ثانیه فرار با نهایت سرعت
      setTimeout(() => {
        const exit = waypoints[waypoints.length - 1];
        virus.style.transition = "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
        defender.style.transition = "transform 0.9s cubic-bezier(0.4, 0, 0.2, 1)";

        setPos(virus, exit.x, exit.y);
        setPos(defender, exit.x + 50, exit.y);

        setTimeout(() => {
          // ریست کردن پوزیشن برای خارج از کادر و آماده‌سازی برای دور بعد
          virus.style.transition = "none";
          defender.style.transition = "none";
          setPos(virus, -150, -150);
          setPos(defender, -150, -150);
          virusBubble.classList.remove("show");
          defBubble.classList.remove("show");
          virus.classList.remove("panic");
          defender.classList.remove("hunter");

          // وقفه دقیقاً ۱۰ ثانیه‌ای قبل از اجرای مجدد دور بعدی
          setTimeout(runEpicChase, 10000);
        }, 1000);
      }, 1400);
    }
  }

  // استارت دور اول پس از ۱.۵ ثانیه
  setTimeout(runEpicChase, 1500);
}
