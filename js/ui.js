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




// ==================== موتور تعقیب و گریز شطرنجی و بازی مینی‌ویروس‌ها ====================

function bootFooterAnimations() {
  const terminal = document.getElementById("codeStreamOutput");
  const virus = document.getElementById("actorVirus");

  if (!terminal || !virus) {
    setTimeout(bootFooterAnimations, 150);
    return;
  }

  if (typeof startCodeStream === "function") startCodeStream();
  startGridChaseSequence();
  spawnClickableMiniBugs();
}

window.addEventListener("allModulesLoaded", bootFooterAnimations);
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(bootFooterAnimations, 300);
});

// ۱. الگوریتم حرکت شطرنجی دقیق با توقف‌ها، حالات چهره و فرار حماسی
function startGridChaseSequence() {
  const virus = document.getElementById("actorVirus");
  const defender = document.getElementById("actorAntivirus");
  const virusBubble = document.getElementById("virusBubble");
  const defBubble = document.getElementById("defenderBubble");
  const stage = document.getElementById("chaseStage");
  if (!virus || !defender || !stage || stage.dataset.running) return;
  stage.dataset.running = "true";

  // محاسبه ابعاد استیج برای نقاط خالی شطرنجی (بین ستون‌ها و حاشیه‌ها)
  function generateGridWaypoints() {
    const w = stage.clientWidth || window.innerWidth;
    const h = stage.clientHeight || 200;
    
    // نقاط کلیدی شطرنجی در کریدورهای خالی فوتر (دور از متن ستون‌ها)
    return [
      { x: -50, y: 30 },
      { x: w * 0.15, y: 30 },
      { x: w * 0.15, y: h * 0.7 },
      { x: w * 0.38, y: h * 0.7 },
      { x: w * 0.38, y: 20 },
      { x: w * 0.62, y: 20 },
      { x: w * 0.62, y: h * 0.75 },
      { x: w * 0.85, y: h * 0.75 },
      { x: w * 0.85, y: 25 },
      { x: w * 0.5, y: 25 }, // توقف میانی برای مواجهه
      { x: w + 80, y: 25 }   // خروج از صفحه
    ];
  }

  async function runGrandChase() {
    const points = generateGridWaypoints();
    const delay = ms => new Promise(r => setTimeout(r, ms));

    // حالت اولیه
    virus.className = "grid-actor virus-claude";
    defender.className = "grid-actor defender-bot";
    virusBubble.classList.remove("show");
    defBubble.classList.remove("show");

    // ۱. حرکت پله‌پله و شطرنجی در طول ۲۰ ثانیه
    for (let i = 0; i < points.length - 2; i++) {
      const p = points[i];

      // ویروس حرکت می‌کند
      virus.style.transform = `translate(${p.x}px, ${p.y}px)`;
      
      // آنتی‌ویروس یک گام با تأخیر شطرنجی حرکت می‌کند
      if (i > 0) {
        const prevP = points[i - 1];
        defender.style.transform = `translate(${prevP.x}px, ${prevP.y}px)`;
      }

      await delay(1200);

      // رویداد میانی ۱: ایستادن ویروس و خنده قهقهه (در گام ۳)
      if (i === 2) {
        virus.classList.add("laughing");
        virusBubble.textContent = "HA! HA!";
        virusBubble.classList.add("show");
        await delay(1500);
        virus.classList.remove("laughing");
        virusBubble.classList.remove("show");
      }

      // رویداد میانی ۲: ایستادن آنتی‌ویروس و چهره سوالی (در گام ۵)
      if (i === 4) {
        defender.classList.add("confused");
        defBubble.textContent = "?!";
        defBubble.classList.add("show");
        await delay(1500);
        defender.classList.remove("confused");
        defBubble.classList.remove("show");
      }
    }

    // ۲. مرحله اوج مواجهه: آنتی‌ویروس، ویروس را می‌بیند!
    const spot = points[points.length - 2];
    virus.style.transform = `translate(${spot.x}px, ${spot.y}px)`;
    defender.style.transform = `translate(${spot.x - 70}px, ${spot.y}px)`;
    await delay(600);

    // آنتی‌ویروس چهره خفن و خشمگین می‌گیرد
    defender.classList.add("hunter");
    defBubble.textContent = "LOCKED ON!";
    defBubble.classList.add("show");

    // ویروس چهره ترس و وحشت به خود می‌گیرد
    virus.classList.add("panic");
    virusBubble.textContent = "OH NOOO!";
    virusBubble.classList.add("show");
    await delay(1400);

    // ۳. فرار سریع از صفحه فوتر
    const exitPoint = points[points.length - 1];
    virus.style.transition = "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
    defender.style.transition = "transform 0.9s cubic-bezier(0.4, 0, 0.2, 1)";

    virus.style.transform = `translate(${exitPoint.x}px, ${exitPoint.y}px)`;
    defender.style.transform = `translate(${exitPoint.x + 50}px, ${exitPoint.y}px)`;

    await delay(1200);

    // ریست موقعیت برای دور بعد
    virus.style.transition = "none";
    defender.style.transition = "none";
    virus.style.transform = "translate(-150px, -150px)";
    defender.style.transform = "translate(-150px, -150px)";
    virusBubble.classList.remove("show");
    defBubble.classList.remove("show");
    virus.classList.remove("panic");
    defender.classList.remove("hunter");

    // بازگرداندن ترنزیشن شطرنجی
    setTimeout(() => {
      virus.style.transition = "transform 0.45s cubic-bezier(0.2, 0.9, 0.3, 1.2)";
      defender.style.transition = "transform 0.45s cubic-bezier(0.2, 0.9, 0.3, 1.2)";
    }, 100);

    // دقیقاً ۱۰ ثانیه وقفه قبل از شروع دور بعدی
    setTimeout(runGrandChase, 10000);
  }

  // شروع اولین چرخه تعقیب
  setTimeout(runGrandChase, 1500);
}

// ۲. ساخت و ترکیدن مینی‌ویروس‌های تعاملی با کلیک یا لمس
function spawnClickableMiniBugs() {
  const container = document.getElementById("miniBugsContainer");
  if (!container) return;
  container.innerHTML = "";

  // موقعیت‌های امن در گوشه‌ها و فضاهای خالی فوتر
  const safePositions = [
    { top: "25px", left: "4%" },
    { top: "140px", left: "28%" },
    { top: "35px", right: "8%" },
    { top: "135px", right: "26%" }
  ];

  safePositions.forEach((pos, idx) => {
    const bug = document.createElement("div");
    bug.className = "mini-bug";
    bug.style.top = pos.top;
    if (pos.left) bug.style.left = pos.left;
    if (pos.right) bug.style.right = pos.right;
    bug.title = "روی من کلیک کن تا نابود بشم!";

    bug.innerHTML = `
      <div class="mini-bug-body">
        <span class="mini-bug-eye l"></span>
        <span class="mini-bug-eye r"></span>
      </div>
    `;

    // اکشن ترکیدن هنگام کلیک یا لمس
    const popBug = (e) => {
      e.stopPropagation();
      if (bug.classList.contains("popping")) return;

      bug.classList.add("popping");

      // صدای لرزش در موبایل‌های پشتیبانی‌کننده
      if (navigator.vibrate) navigator.vibrate(50);

      // ایجاد چند پارتیکل نوری کوچک در لحظه ترکیدن
      createPopParticles(bug.getBoundingClientRect());

      setTimeout(() => {
        bug.remove();
        // پس از ۱۵ ثانیه ویروس جدیدی متولد می‌شود!
        setTimeout(() => spawnClickableMiniBugs(), 15000);
      }, 400);
    };

    bug.addEventListener("click", popBug);
    bug.addEventListener("touchstart", popBug, { passive: true });

    container.appendChild(bug);
  });
}

// افکت ذرات هنگام ترکیدن مینی‌ویروس
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
    spark.style.zIndex = "9999";
    spark.style.boxShadow = "0 0 6px #a855f7";
    document.body.appendChild(spark);

    const angle = (Math.PI * 2 / 6) * i;
    const distance = 25;
    const destX = Math.cos(angle) * distance;
    const destY = Math.sin(angle) * distance;

    spark.animate([
      { transform: "translate(0, 0) scale(1)", opacity: 1 },
      { transform: `translate(${destX}px, ${destY}px) scale(0)`, opacity: 0 }
    ], { duration: 350, easing: "ease-out" }).onfinish = () => spark.remove();
  }
}
