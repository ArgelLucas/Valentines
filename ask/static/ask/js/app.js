/* ask/static/ask/js/app.js
   ============================================================
   MINECRAFT-THEMED VALENTINE LOGIC + MOB SPAWNS + CHAT
   - Background runs on ANY page that has #bg canvas
   - Home page: YES redirects to /yes (Book & Quill)
   - NO starts beside YES (normal layout), then on first click:
     -> leaves the card (ported to <body>) and smoothly moves around
   - Progressive weather + hearts on NO clicks:
       1st NO: dark (-25%)
       2nd NO: rain (-25%)
       3rd NO: thunder + lightning (-25%)
       4th NO: YOU DIED screen (-25%) + disables buttons + death menu
   ============================================================ */

(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const card = document.getElementById("card");
  const yesBtn = document.getElementById("yesBtn");
  const noBtn = document.getElementById("noBtn");
  const noBubble = document.getElementById("noBubble");
const isHome = !!(card && yesBtn && noBtn);

  const success = document.getElementById("success");
  const againBtn = document.getElementById("againBtn");

  const hudText = document.getElementById("hudText");
  const hudHeartsEl =
    document.getElementById("hudHearts") ||
    document.querySelector(".hud-hearts") ||
    null;

  // Chat elements (home only)
  const mcChat = document.getElementById("mcChat");
  const mcChatLines = document.getElementById("mcChatLines");

  // Card subtitle (fallback)
  const subtitleEl = document.querySelector("#card .subtitle");

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const rand = (a, b) => a + Math.random() * (b - a);

  function getPointer(e) {
    if (e && e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    return { x: e?.clientX ?? window.innerWidth / 2, y: e?.clientY ?? window.innerHeight / 2 };
  }

  function rectsOverlap(a, b) {
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
  }

  // ------------------------------------------------------------
  // Tiny 8-bit beep
  // ------------------------------------------------------------
  let audioCtx;
  function beep(freq = 660, ms = 70, type = "square", gain = 0.03) {
    if (reduceMotion) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.value = gain;
      o.connect(g);
      g.connect(audioCtx.destination);
      o.start();
      setTimeout(() => o.stop(), ms);
    } catch (_) {}
  }

  // ============================================================
  // CHAT BOX (home only)
  // ============================================================
  let chatHideT = null;

  function addChat(text, kind = "sys") {
    if (!mcChat || !mcChatLines) return;

    mcChat.classList.add("is-on");
    clearTimeout(chatHideT);

    const line = document.createElement("div");
    line.className = "mc-line";

    if (kind === "player") {
      line.innerHTML = `<span class="mc-name">Her</span><span class="mc-sys">: ${escapeHtml(text)}</span>`;
    } else if (kind === "warn") {
      line.innerHTML = `<span class="mc-warn">${escapeHtml(text)}</span>`;
    } else {
      line.innerHTML = `<span class="mc-sys">${escapeHtml(text)}</span>`;
    }

    mcChatLines.appendChild(line);
    while (mcChatLines.children.length > 7) mcChatLines.removeChild(mcChatLines.firstChild);

    chatHideT = setTimeout(() => mcChat.classList.remove("is-on"), 6000);
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // ============================================================
  // DEAD SCREEN MENU (Respawn / Title Screen)
  // ============================================================
  let deadMenuEl = null;

  function showDeadMenu() {
    if (deadMenuEl) return;

    deadMenuEl = document.createElement("div");
    deadMenuEl.id = "deadMenu";
    deadMenuEl.innerHTML = `
      <div class="dead-menu-inner" role="dialog" aria-label="You Died Menu">
        <button type="button" class="dead-btn dead-btn-primary" id="deadRespawnBtn">Respawn</button>
        <button type="button" class="dead-btn" id="deadTitleBtn">Title Screen</button>
      </div>
    `;
    document.body.appendChild(deadMenuEl);

    deadMenuEl.querySelector("#deadRespawnBtn")?.addEventListener("click", () => {
      window.location.reload();
    });

    deadMenuEl.querySelector("#deadTitleBtn")?.addEventListener("click", () => {
      window.location.href = "/";
    });
  }

  function hideDeadMenu() {
    if (!deadMenuEl) return;
    deadMenuEl.remove();
    deadMenuEl = null;
  }

  // ============================================================
  // 1) Pixel Background + Items + MOBS + WEATHER (runs anywhere #bg exists)
  // ============================================================
  const canvas = document.getElementById("bg");
  const ctx = canvas?.getContext("2d", { alpha: true });

  let DPR = 1;
  let W = 0,
    H = 0;

  let grassHeight = 0;
  let dirtHeight = 0;
  let grassTop = 0;
  let dirtTop = 0;

  const items = [];
  const itemPalette = [
    "rgba(255,255,255,0.75)",
    "rgba(160,255,180,0.75)",
    "rgba(255,210,90,0.75)",
    "rgba(255,120,160,0.65)",
  ];

  const mobs = [];
  const MOB_TYPES = ["creeper", "slime", "zombie"];

  // Weather state (0 sunny, 1 dark, 2 rain, 3 thunder, 4 dead)
  const weather = {
    stage: 0,
    flash: 0,
    boltTimer: 80,
    deadFade: 0,
  };

  // Clouds
  const clouds = Array.from({ length: 6 }).map(() => ({
    x: Math.random() * window.innerWidth,
    y: 35 + Math.random() * 170,
    speed: 0.15 + Math.random() * 0.35,
    size: 90 + Math.random() * 90,
  }));

  // Rain drops
  const rain = Array.from({ length: 220 }).map(() => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    v: 6 + Math.random() * 8,
    len: 10 + Math.random() * 14,
  }));

  function setWeatherStage(n) {
    weather.stage = clamp(Number(n) || 0, 0, 4);
    if (weather.stage !== 3) weather.flash = 0;
    if (weather.stage === 3 && weather.boltTimer <= 0) weather.boltTimer = 60;
    if (weather.stage !== 4) weather.deadFade = 0;
  }

  // expose for debugging / other pages if needed
  window.MCWeather = {
    setStage: setWeatherStage,
    getStage: () => weather.stage,
  };

  function resize() {
    if (!canvas || !ctx) return;
    DPR = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.imageSmoothingEnabled = false;

    grassHeight = Math.floor(H * 0.18);
    dirtHeight = Math.floor(H * 0.16);
    grassTop = H - grassHeight - dirtHeight;
    dirtTop = H - dirtHeight;
  }

  function spawnItem(x = rand(0, W), y = rand(0, H), burst = false) {
    const s = burst ? rand(6, 12) : rand(4, 9);
    items.push({
      x,
      y,
      vx: burst ? rand(-2.2, 2.2) : rand(-0.3, 0.3),
      vy: burst ? rand(-3.4, -1.4) : rand(-0.8, -0.3),
      size: s,
      life: burst ? 40 : 220,
      c: itemPalette[(Math.random() * itemPalette.length) | 0],
    });
  }

  function spawnMob(type = "creeper") {
    const x = rand(30, W - 30);
    const y = rand(grassTop + 10, grassTop + grassHeight - 18);

    mobs.push({
      type,
      x,
      y,
      vx: rand(-0.35, 0.35),
      life: 900,
      frame: 0,
    });
  }

  function spawnMobWave(count = 4) {
    for (let i = 0; i < count; i++) {
      const t = MOB_TYPES[(Math.random() * MOB_TYPES.length) | 0];
      spawnMob(t);
    }
  }

  function drawPixelRect(x, y, w, h, fill) {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
  }

  function drawGround() {
    const block = 24;

    for (let x = 0; x < W; x += block) {
      drawPixelRect(x, grassTop, block, grassHeight, (x / block) % 2 ? "#4aa52e" : "#62c243");
      for (let i = 0; i < 6; i++) {
        const px = x + ((Math.random() * block) | 0);
        const py = grassTop + ((Math.random() * 10) | 0);
        drawPixelRect(px, py, 2, 2, "rgba(0,0,0,0.12)");
      }
    }

    for (let x = 0; x < W; x += block) {
      drawPixelRect(x, dirtTop, block, dirtHeight, (x / block) % 2 ? "#7b5a3a" : "#916743");
      for (let i = 0; i < 5; i++) {
        const px = x + ((Math.random() * block) | 0);
        const py = dirtTop + ((Math.random() * dirtHeight) | 0);
        drawPixelRect(px, py, 2, 2, "rgba(0,0,0,0.18)");
      }
    }
  }

  function drawCloud(x, y, size) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, y, size, size * 0.38);
    ctx.fillRect(x + size * 0.18, y - size * 0.18, size * 0.62, size * 0.38);
    ctx.fillRect(x + size * 0.62, y + size * 0.08, size * 0.5, size * 0.3);
  }

  function drawSun() {
    const size = 90;
    const sx = W - size - 40;
    const sy = 40;

    ctx.fillStyle = "#FFD84D";
    ctx.fillRect(sx, sy, size, size);

    ctx.fillStyle = "rgba(255, 216, 77, 0.18)";
    ctx.fillRect(sx - 18, sy - 18, size + 36, size + 36);
  }

  function drawSky() {
    const g = ctx.createLinearGradient(0, 0, 0, H);

    if (weather.stage === 0) {
      g.addColorStop(0, "#87CEEB");
      g.addColorStop(1, "#BEE9FF");
    } else if (weather.stage === 1) {
      g.addColorStop(0, "#5a7fa3");
      g.addColorStop(1, "#8fa9bf");
    } else if (weather.stage === 2 || weather.stage === 3) {
      g.addColorStop(0, "#3d5f7a");
      g.addColorStop(1, "#6d8294");
    } else {
      g.addColorStop(0, "#2a2a2a");
      g.addColorStop(1, "#161616");
    }

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function drawDarkOverlay() {
    let a = 0;
    if (weather.stage === 1) a = 0.18;
    if (weather.stage === 2) a = 0.26;
    if (weather.stage === 3) a = 0.32;
    if (weather.stage === 4) a = 0.62;

    ctx.fillStyle = `rgba(0,0,0,${a})`;
    ctx.fillRect(0, 0, W, H);
  }

  function drawRain() {
    const wind = 1.4;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(190, 225, 255, 0.55)";
    ctx.beginPath();
    for (const d of rain) {
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x + wind, d.y + d.len);

      d.x += wind;
      d.y += d.v;

      if (d.y > H) {
        d.y = -20 - Math.random() * 50;
        d.x = Math.random() * W;
      }
      if (d.x > W + 30) d.x = -30;
    }
    ctx.stroke();
  }

  function drawLightningBolt() {
    const startX = Math.random() * W * 0.9 + W * 0.05;
    const startY = 0;

    let x = startX;
    let y = startY;

    ctx.strokeStyle = "rgba(245, 245, 255, 0.95)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x, y);

    const segments = 10 + Math.floor(Math.random() * 6);
    for (let i = 0; i < segments; i++) {
      x += (Math.random() < 0.5 ? -1 : 1) * (18 + Math.random() * 35);
      y += 35 + Math.random() * 55;
      ctx.lineTo(x, y);
      if (y > H * 0.7) break;
    }
    ctx.stroke();
  }

  function drawLightningFlash() {
    if (weather.flash <= 0) return;
    ctx.fillStyle = `rgba(255,255,255,${Math.min(0.65, weather.flash)})`;
    ctx.fillRect(0, 0, W, H);
  }

  function drawDeadOverlay() {
    const alpha = Math.min(0.9, 0.25 + weather.deadFade * 0.65);
    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = "bold 52px 'Press Start 2P', monospace";
    ctx.fillText("YOU DIED", W / 2, H * 0.42);
    ctx.restore();
  }

  function drawMob(m) {
    const bob = Math.sin(m.frame * 0.2) * 1.2;

    ctx.globalAlpha = 0.35;
    drawPixelRect(m.x - 6, m.y + 14, 12, 3, "rgba(0,0,0,0.6)");
    ctx.globalAlpha = 1;

    const x = m.x;
    const y = m.y + bob;

    if (m.type === "creeper") {
      drawPixelRect(x - 6, y - 12, 12, 12, "#2db84d");
      drawPixelRect(x - 4, y - 8, 2, 2, "#0b1a0f");
      drawPixelRect(x + 2, y - 8, 2, 2, "#0b1a0f");
      drawPixelRect(x - 2, y - 5, 4, 3, "#0b1a0f");
      drawPixelRect(x - 6, y, 3, 6, "#239b3f");
      drawPixelRect(x - 1, y, 3, 6, "#239b3f");
      drawPixelRect(x + 3, y, 3, 6, "#239b3f");
      drawPixelRect(x - 4, y, 3, 6, "#239b3f");
    } else if (m.type === "slime") {
      drawPixelRect(x - 7, y - 10, 14, 12, "rgba(80, 255, 120, 0.85)");
      drawPixelRect(x - 3, y - 6, 2, 2, "rgba(0,0,0,0.35)");
      drawPixelRect(x + 1, y - 6, 2, 2, "rgba(0,0,0,0.35)");
      drawPixelRect(x - 2, y - 3, 4, 2, "rgba(0,0,0,0.25)");
    } else {
      drawPixelRect(x - 6, y - 12, 12, 12, "#3aa0a0");
      drawPixelRect(x - 6, y, 12, 8, "#2e6bb2");
      drawPixelRect(x - 6, y + 8, 5, 6, "#394a6d");
      drawPixelRect(x + 1, y + 8, 5, 6, "#394a6d");
      drawPixelRect(x - 4, y - 8, 2, 2, "#101515");
      drawPixelRect(x + 2, y - 8, 2, 2, "#101515");
    }
  }

  function drawBg() {
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, W, H);

    drawSky();

    if (weather.stage === 0) drawSun();

    for (const c of clouds) {
      c.x += c.speed;
      if (c.x > W + 240) c.x = -240;

      if (weather.stage >= 2) ctx.globalAlpha = 0.55;
      else if (weather.stage === 1) ctx.globalAlpha = 0.75;
      else ctx.globalAlpha = 1;

      drawCloud(c.x, c.y, c.size);
      ctx.globalAlpha = 1;
    }

    if (weather.stage === 0) {
      const haze = ctx.createLinearGradient(0, 0, 0, H);
      haze.addColorStop(0, "rgba(255,255,255,0.10)");
      haze.addColorStop(1, "rgba(255,255,255,0.00)");
      ctx.fillStyle = haze;
      ctx.fillRect(0, 0, W, H);
    }

    drawGround();

    for (let i = items.length - 1; i >= 0; i--) {
      const p = items[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 1;

      const a = clamp(p.life / 40, 0, 1);
      ctx.globalAlpha = a;
      drawPixelRect(p.x, p.y, p.size, p.size, p.c);
      drawPixelRect(
        p.x + p.size * 0.35,
        p.y - p.size * 0.35,
        p.size * 0.5,
        p.size * 0.5,
        "rgba(255,255,255,0.45)"
      );
      ctx.globalAlpha = 1;

      if (p.life <= 0 || p.y < -40 || p.x < -60 || p.x > W + 60) items.splice(i, 1);
    }

    for (let i = mobs.length - 1; i >= 0; i--) {
      const m = mobs[i];
      m.frame++;
      m.life--;

      m.x += m.vx;
      if (m.x < 18) {
        m.x = 18;
        m.vx *= -1;
      }
      if (m.x > W - 18) {
        m.x = W - 18;
        m.vx *= -1;
      }

      if (m.frame % 120 === 0) m.vx = clamp(m.vx + rand(-0.25, 0.25), -0.6, 0.6);

      drawMob(m);

      if (m.life <= 0) mobs.splice(i, 1);
    }

    if (weather.stage === 2 || weather.stage === 3) drawRain();

    if (weather.stage === 3) {
      weather.boltTimer -= 1;
      if (weather.boltTimer <= 0) {
        weather.flash = 1;
        weather.boltTimer = 90 + Math.floor(Math.random() * 140);
        drawLightningBolt();
      }
    }

    if (weather.flash > 0) weather.flash *= 0.85;
    if (weather.flash < 0.02) weather.flash = 0;
    drawLightningFlash();

    drawDarkOverlay();

    if (weather.stage === 4) {
      weather.deadFade = Math.min(1, weather.deadFade + 0.015);
      drawDeadOverlay();
    } else {
      weather.deadFade = Math.max(0, weather.deadFade - 0.02);
    }

    if (!reduceMotion) requestAnimationFrame(drawBg);
  }

  if (canvas && ctx) {
    resize();
    window.addEventListener("resize", resize);

    setWeatherStage(0);

    for (let i = 0; i < 22; i++) spawnItem(rand(0, W), rand(0, H));
    if (!reduceMotion) setInterval(() => spawnItem(), 260);

    drawBg();
  }

  // ============================================================
  // HEARTS / HP display helper (25% per NO)
  // ============================================================
  let hpPct = 100;

  function renderHpBar(pct) {
    const filled = clamp(Math.round((pct / 100) * 10), 0, 10);
    const empty = 10 - filled;
    return "▮".repeat(filled) + "▯".repeat(empty);
  }

  function setHP(newPct) {
    hpPct = clamp(newPct, 0, 100);
    if (hudHeartsEl) hudHeartsEl.textContent = renderHpBar(hpPct);
  }

  setHP(100);

  // ============================================================
  // YES: redirect to Book & Quill page (COUNTDOWN in success overlay)
  // ============================================================
  function showSuccess() {
    if (!success) return;
    success.classList.add("is-on");
    success.setAttribute("aria-hidden", "false");
    if (hudText) hudText.textContent = "Blessed";
    addChat("Achievement Get! Valentine Acquired", "sys");
  }

  function hideSuccess() {
    if (!success) return;
    success.classList.remove("is-on");
    success.setAttribute("aria-hidden", "true");
    if (hudText) hudText.textContent = "Peaceful";
  }

  function sparkleBurstFrom(el) {
    if (reduceMotion || !el) return;
    const r = el.getBoundingClientRect();
    const x = r.left + r.width * 0.5;
    const y = r.top + r.height * 0.3;
    for (let i = 0; i < 28; i++) spawnItem(x + rand(-16, 16), y + rand(-10, 10), true);
    beep(880, 60);
    setTimeout(() => beep(990, 60), 70);
    setTimeout(() => beep(1180, 70), 150);
  }

  const successMsgEl = success?.querySelector(".success-card p");
  const originalSuccessMsg = successMsgEl ? successMsgEl.textContent : null;

  function setSuccessMessage(text) {
    if (successMsgEl) {
      successMsgEl.textContent = text;
      successMsgEl.classList.add("countdown");
    } else if (subtitleEl) {
      subtitleEl.textContent = text;
    }
  }

  function restoreSuccessMessage() {
    if (successMsgEl && originalSuccessMsg != null) {
      successMsgEl.textContent = originalSuccessMsg;
      successMsgEl.classList.remove("countdown");
    }
  }

  let yesCountdownTimer = null;
  let yesCountdownActive = false;

  const YES_COUNTDOWN_SECONDS = 5;

  yesBtn?.addEventListener("click", () => {
    if (yesCountdownActive) return;
    yesCountdownActive = true;

    const yesUrl = yesBtn.dataset.yesUrl;

    try {
      yesBtn.disabled = true;
      if (noBtn) noBtn.disabled = true;
    } catch (_) {}

    sparkleBurstFrom(yesBtn);
    showSuccess();

    if (reduceMotion) {
      if (yesUrl) window.location.href = yesUrl;
      return;
    }

    let seconds = YES_COUNTDOWN_SECONDS;
    setSuccessMessage(`Opening the book & quill in ${seconds}...`);

    yesCountdownTimer = setInterval(() => {
      seconds -= 1;

      if (seconds > 0) {
        setSuccessMessage(`Opening the book & quill in ${seconds}...`);
        return;
      }

      clearInterval(yesCountdownTimer);
      yesCountdownTimer = null;

      setSuccessMessage("Opening the book & quill...");
      if (yesUrl) window.location.href = yesUrl;
    }, 1000);
  });

  function resetYesCountdownState() {
    if (yesCountdownTimer) clearInterval(yesCountdownTimer);
    yesCountdownTimer = null;
    yesCountdownActive = false;

    try {
      if (yesBtn) yesBtn.disabled = false;
      if (noBtn) noBtn.disabled = false;
    } catch (_) {}

    restoreSuccessMessage();
  }

  againBtn?.addEventListener("click", () => {
    resetYesCountdownState();
    hideSuccess();
  });

  success?.addEventListener("click", (e) => {
    if (e.target !== success) return;
    resetYesCountdownState();
    hideSuccess();
  });

  // ============================================================
  // NO: progressive weather + HP + death menu
  // ============================================================
  const creeperLines = [
    "tssss...",
    "Not today, human.",
    "Creeper says: NOPE.",
    "Wrong block!",
    "Try again.",
    "You meant YES.",
    "Can’t click me.",
    "Nice try.",
    "Creative mode: YES only.",
  ];

  let lastLine = -1;

  function showBubble(text) {
    if (!noBubble) return;
    noBubble.textContent = text;
    noBubble.classList.add("show");
    clearTimeout(showBubble._t);
    showBubble._t = setTimeout(() => noBubble.classList.remove("show"), 1100);
  }

  function shakeCard() {
    if (!card) return;
    card.classList.remove("shake");
    void card.offsetWidth;
    card.classList.add("shake");
  }

  let noCount = 0;
  function applyNoProgression() {
    noCount += 1;

    setHP(100 - noCount * 25);
    setWeatherStage(noCount);

    if (hudText) {
      const labels = ["Peaceful", "Gloomy", "Raining", "Thunder", "Dead"];
      hudText.textContent = labels[Math.min(4, noCount)];
    }

    if (noCount >= 4) {
      addChat("You died.", "warn");
      try {
        if (yesBtn) yesBtn.disabled = true;
        if (noBtn) noBtn.disabled = true;
      } catch (_) {}
      document.body.classList.add("dead-screen");
      showDeadMenu();
    }
  }

  if (noBtn) {
    let attempts = 0;
    let isActivated = false;
    let placeholder = null;

    function activateNoButtonPortal() {
      const rect = noBtn.getBoundingClientRect();

      placeholder = document.createElement("span");
      placeholder.style.display = "inline-block";
      placeholder.style.width = `${rect.width}px`;
      placeholder.style.height = `${rect.height}px`;
      placeholder.style.verticalAlign = "middle";
      noBtn.parentNode?.insertBefore(placeholder, noBtn);

      document.body.appendChild(noBtn);

      noBtn.style.position = "fixed";
      noBtn.style.zIndex = "9999";
      noBtn.style.left = `${rect.left}px`;
      noBtn.style.top = `${rect.top}px`;
      noBtn.style.margin = "0";
      noBtn.style.display = "inline-flex";
      noBtn.style.willChange = "left, top, transform";
      noBtn.style.pointerEvents = "auto";
    }

    function moveNoAnywhere() {
      if (!isActivated) return;
      if (noCount >= 4) return;

      const noRect = noBtn.getBoundingClientRect();
      const yesRect = yesBtn?.getBoundingClientRect();

      const pad = 10;
      const minX = pad;
      const maxX = window.innerWidth - noRect.width - pad;
      const minY = pad;
      const maxY = window.innerHeight - noRect.height - pad;
      if (maxX <= minX || maxY <= minY) return;

      let best = null;
      for (let i = 0; i < 140; i++) {
        const left = minX + Math.random() * (maxX - minX);
        const top = minY + Math.random() * (maxY - minY);

        const candidate = { left, top, right: left + noRect.width, bottom: top + noRect.height };
        if (yesRect && rectsOverlap(candidate, yesRect)) continue;

        best = { left, top };
        break;
      }
      if (!best) best = { left: minX, top: minY };

      const dur = clamp(220 - attempts * 6, 120, 220);
      const ease = "cubic-bezier(.22,.61,.36,1)";

      noBtn.style.transition = `left ${dur}ms ${ease}, top ${dur}ms ${ease}, transform 160ms ${ease}`;
      noBtn.style.left = `${best.left}px`;
      noBtn.style.top = `${best.top}px`;
      noBtn.style.transform = `translate3d(0,0,0) rotate(${(Math.random() - 0.5) * 10}deg)`;
    }

    noBtn.addEventListener("click", (e) => {
      e.preventDefault();

      if (noCount < 4) applyNoProgression();
      attempts++;

      if (!isActivated) {
        activateNoButtonPortal();
        isActivated = true;
      }

      let idx;
      do {
        idx = (Math.random() * creeperLines.length) | 0;
      } while (idx === lastLine && creeperLines.length > 1);
      lastLine = idx;

      const line = creeperLines[idx];

      if (noCount >= 4) {
        showBubble("YOU DIED.");
        addChat("YOU DIED.", "warn");
      } else {
        showBubble(line);
        addChat(line, "player");
      }

      shakeCard();

      const wave = clamp(3 + Math.floor(attempts / 2), 3, 10);
      spawnMobWave(wave);

      if (attempts === 1) addChat("Mobs are spawning because she said NO...", "warn");
      if (attempts === 4) addChat("Difficulty set to: HARD", "warn");

      const { x, y } = getPointer(e);
      if (!reduceMotion) for (let i = 0; i < 10; i++) spawnItem(x + rand(-12, 12), y + rand(-8, 8), true);

      beep(220 + attempts * 6, 55, "square", 0.02);

      if (noCount < 4) moveNoAnywhere();
    });

    window.addEventListener(
      "resize",
      () => {
        if (!isActivated) return;
        if (noCount >= 4) return;
        setTimeout(() => moveNoAnywhere(), 60);
      },
      { passive: true }
    );
  }
})();
