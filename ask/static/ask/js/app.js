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
   - "Romantic Night Gift" mode (from Meal Quest)
       -> transitions sunny to romantic night
       -> stars + meteors
       -> MORE flowers grow from grass
       -> couple sprites in the middle
       -> infinite romantic fireworks (includes heart-shaped)
       -> fireflies
       -> TEXT FIREWORK: “I love you Mahal ko!!” (readable) shows, stays, then disappears after ~10s
       -> moon
   ============================================================ */

(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const card = document.getElementById("card");
  const yesBtn = document.getElementById("yesBtn");
  const noBtn = document.getElementById("noBtn");
  const noBubble = document.getElementById("noBubble");

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

    deadMenuEl.querySelector("#deadRespawnBtn")?.addEventListener("click", () => window.location.reload());
    deadMenuEl.querySelector("#deadTitleBtn")?.addEventListener("click", () => (window.location.href = "/"));
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
  const weather = { stage: 0, flash: 0, boltTimer: 80, deadFade: 0 };

  const romantic = {
    on: false,
    t: 0,
    fade: 0,
    starTwinkle: 0,
    meteors: [],
    flowers: [],
    fireworks: [],
    sparkles: [],
    fireflies: [],
    textBursts: [],
    textCooldown: 0,
  };

  const FIREWORK_COLORS = ["#ff4d6d", "#ff6aa2", "#ffd85a", "#a855ff", "#ffffff"];

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
    if (romantic.on) return;
    weather.stage = clamp(Number(n) || 0, 0, 4);
    if (weather.stage !== 3) weather.flash = 0;
    if (weather.stage === 3 && weather.boltTimer <= 0) weather.boltTimer = 60;
    if (weather.stage !== 4) weather.deadFade = 0;
  }

  window.MCWeather = { setStage: setWeatherStage, getStage: () => weather.stage };

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
    if (romantic.on && !burst) return;
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
    if (romantic.on) return;
    const x = rand(30, W - 30);
    const y = rand(grassTop + 10, grassTop + grassHeight - 18);
    mobs.push({ type, x, y, vx: rand(-0.35, 0.35), life: 900, frame: 0 });
  }

  function spawnMobWave(count = 4) {
    if (romantic.on) return;
    for (let i = 0; i < count; i++) spawnMob(MOB_TYPES[(Math.random() * MOB_TYPES.length) | 0]);
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

  function drawMoon() {
    const mx = W - 150;
    const my = 80;
    const s = 56;

    ctx.save();
    ctx.globalAlpha = 0.25 + romantic.fade * 0.65;

    ctx.fillStyle = "rgba(230, 240, 255, 0.10)";
    ctx.fillRect(mx - 18, my - 18, s + 36, s + 36);

    ctx.fillStyle = "#EAF2FF";
    ctx.fillRect(mx, my, s, s);

    ctx.fillStyle = "rgba(8,11,26,1)";
    ctx.fillRect(mx + 18, my + 6, s, s);

    ctx.fillStyle = "rgba(160,180,210,0.35)";
    ctx.fillRect(mx + 10, my + 14, 6, 6);
    ctx.fillRect(mx + 22, my + 30, 8, 8);
    ctx.fillRect(mx + 30, my + 18, 5, 5);
    ctx.restore();
  }

  function drawSky() {
    const g = ctx.createLinearGradient(0, 0, 0, H);

    if (romantic.on) {
      const f = clamp(romantic.fade, 0, 1);
      const topDay = { r: 0x87, g: 0xCE, b: 0xEB };
      const topNight = { r: 0x08, g: 0x0B, b: 0x1A };
      const botDay = { r: 0xBE, g: 0xE9, b: 0xFF };
      const botNight = { r: 0x15, g: 0x12, b: 0x2A };

      const mix = (a, b) => Math.round(a + (b - a) * f);
      const t = `rgb(${mix(topDay.r, topNight.r)},${mix(topDay.g, topNight.g)},${mix(topDay.b, topNight.b)})`;
      const b = `rgb(${mix(botDay.r, botNight.r)},${mix(botDay.g, botNight.g)},${mix(botDay.b, botNight.b)})`;

      g.addColorStop(0, t);
      g.addColorStop(1, b);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      return;
    }

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
    if (romantic.on) return;
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

  // ============================================================
  // Romantic Night visuals
  // ============================================================
  function seedFlowers(count = 70) {
    romantic.flowers = [];
    for (let i = 0; i < count; i++) {
      const x = rand(20, W - 20);
      const y = grassTop + rand(10, grassHeight - 10);

      const roll = Math.random();
      const color =
        roll < 0.25 ? "#ff6aa2" :
        roll < 0.50 ? "#ffd85a" :
        roll < 0.75 ? "#a855ff" :
        "#ff4d6d";

      romantic.flowers.push({
        x,
        y,
        h: rand(10, 30),
        grow: 0,
        color,
        sway: rand(0, Math.PI * 2),
        speed: rand(0.006, 0.014),
      });
    }
  }

  function spawnMeteor() {
    const startX = rand(-80, W * 0.7);
    const startY = rand(0, H * 0.35);
    romantic.meteors.push({
      x: startX,
      y: startY,
      vx: rand(8, 12),
      vy: rand(4, 6),
      life: rand(26, 42),
      max: 0,
    });
    romantic.meteors[romantic.meteors.length - 1].max = romantic.meteors[romantic.meteors.length - 1].life;
  }

  function drawStarsSky() {
    romantic.starTwinkle += 0.02;
    const t = romantic.starTwinkle;

    ctx.save();
    ctx.globalAlpha = clamp(0.25 + romantic.fade * 0.75, 0, 1);

    for (let i = 0; i < 140; i++) {
      const sx = (i * 97) % W;
      const sy = ((i * 53) % Math.max(40, (grassTop - 20)));
      const tw = 0.55 + 0.45 * Math.sin(t + i * 0.6);
      ctx.globalAlpha = 0.15 + tw * 0.45;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(sx, sy, 2, 2);
      if (i % 7 === 0) ctx.fillRect(sx + 2, sy, 1, 1);
    }

    ctx.restore();
  }

  function drawMeteors() {
    if (reduceMotion) return;

    if (Math.random() < 0.02) spawnMeteor();

    for (let i = romantic.meteors.length - 1; i >= 0; i--) {
      const m = romantic.meteors[i];
      m.x += m.vx;
      m.y += m.vy;
      m.life -= 1;

      const a = clamp(m.life / m.max, 0, 1);

      ctx.save();
      ctx.globalAlpha = 0.25 + a * 0.75;
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - m.vx * 2.4, m.y - m.vy * 2.4);
      ctx.stroke();

      ctx.globalAlpha = 0.18 + a * 0.35;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - m.vx * 3.2, m.y - m.vy * 3.2);
      ctx.stroke();
      ctx.restore();

      if (m.life <= 0 || m.x > W + 120 || m.y > grassTop) romantic.meteors.splice(i, 1);
    }
  }

  function drawGrowingFlowers() {
    const growthBoost = clamp(romantic.fade, 0, 1);

    ctx.save();
    for (const f of romantic.flowers) {
      f.grow = clamp(f.grow + f.speed * (0.5 + growthBoost), 0, 1);
      f.sway += 0.03;

      const stemH = f.h * f.grow;
      const swayX = Math.sin(f.sway) * 2;

      ctx.globalAlpha = 0.65 + 0.25 * romantic.fade;
      ctx.fillStyle = "#2aa84a";
      ctx.fillRect(f.x + swayX, f.y, 2, -stemH);

      if (f.grow > 0.32) {
        ctx.globalAlpha = 0.55;
        ctx.fillRect(f.x + swayX - 4, f.y - stemH * 0.45, 4, 2);
        ctx.fillRect(f.x + swayX + 2, f.y - stemH * 0.55, 4, 2);
      }

      if (f.grow > 0.5) {
        const bx = f.x + swayX;
        const by = f.y - stemH - 2;

        ctx.globalAlpha = 0.88;
        ctx.fillStyle = f.color;
        ctx.fillRect(bx - 3, by - 3, 6, 6);

        ctx.globalAlpha = 0.5;
        ctx.fillRect(bx - 6, by - 1, 3, 3);
        ctx.fillRect(bx + 3, by - 1, 3, 3);

        ctx.globalAlpha = 0.95;
        ctx.fillStyle = "#fff3b0";
        ctx.fillRect(bx - 1, by - 1, 2, 2);
      }
    }
    ctx.restore();
  }

  // ============================================================
  // Fireflies
  // ============================================================
  function initFireflies(count = 34) {
    romantic.fireflies = [];
    for (let i = 0; i < count; i++) {
      romantic.fireflies.push({
        x: rand(0, W),
        y: rand(20, grassTop - 20),
        vx: rand(-0.25, 0.25),
        vy: rand(-0.12, 0.12),
        phase: rand(0, Math.PI * 2),
        r: rand(1, 3),
      });
    }
  }

  function drawFireflies() {
    if (reduceMotion) return;
    for (const f of romantic.fireflies) {
      f.phase += 0.06;
      f.x += f.vx;
      f.y += f.vy;

      if (f.x < -20) f.x = W + 20;
      if (f.x > W + 20) f.x = -20;
      if (f.y < 10) f.y = 10;
      if (f.y > grassTop - 10) f.y = grassTop - 10;

      const glow = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(f.phase));
      const alpha = (0.18 + glow * 0.65) * clamp(romantic.fade, 0, 1);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "rgba(255,255,200,1)";
      ctx.fillRect(f.x, f.y, f.r, f.r);

      ctx.globalAlpha = alpha * 0.35;
      ctx.fillStyle = "rgba(255,240,160,1)";
      ctx.fillRect(f.x - 2, f.y, 1, 1);
      ctx.fillRect(f.x + 3, f.y - 1, 1, 1);
      ctx.fillRect(f.x + 1, f.y + 3, 1, 1);
      ctx.restore();
    }
  }

  // ============================================================
  // TEXT FIREWORK (readable + auto disappears after ~10s)
  // ============================================================
  const _textCanvas = document.createElement("canvas");
  const _textCtx = _textCanvas.getContext("2d");
  let _textGroupId = 0;

  // 10 seconds @ ~60fps
  const TEXT_SHOW_FRAMES = 600;
  const TEXT_ASSEMBLE_FRAMES = 70; // quick settle
  const TEXT_FADE_FRAMES = 80;     // fade-out at end
  const TEXT_REPEAT_FRAMES = 680;  // next text spawn (so it doesn't overlap too much)

  function spawnTextFirework(text = "I love you Mahal ko!!") {
    if (reduceMotion) return;

    // Clear previous text so it's always readable (no stacking)
    romantic.textBursts.length = 0;

    _textGroupId++;
    const gid = _textGroupId; // (kept for potential future filtering)

    const fontSize = Math.max(22, Math.min(44, Math.floor(W / 24)));
    _textCanvas.width = Math.min(980, Math.floor(W * 0.94));
    _textCanvas.height = 160;

    _textCtx.clearRect(0, 0, _textCanvas.width, _textCanvas.height);
    _textCtx.textAlign = "center";
    _textCtx.textBaseline = "middle";
    _textCtx.font = `bold ${fontSize}px 'Press Start 2P', monospace`;

    // thicker glow + main (helps readability)
    _textCtx.fillStyle = "rgba(255,40,70,0.32)";
    _textCtx.fillText(text, _textCanvas.width / 2 + 3, _textCanvas.height / 2 + 3);
    _textCtx.fillText(text, _textCanvas.width / 2 - 3, _textCanvas.height / 2 - 3);
    _textCtx.fillStyle = "rgba(255,40,70,1)";
    _textCtx.fillText(text, _textCanvas.width / 2, _textCanvas.height / 2);

    const img = _textCtx.getImageData(0, 0, _textCanvas.width, _textCanvas.height).data;

    const tx = W * 0.5;
    const ty = Math.max(95, H * 0.22);

    // denser sampling => more readable
    const step = 3;

    for (let y = 0; y < _textCanvas.height; y += step) {
      for (let x = 0; x < _textCanvas.width; x += step) {
        const i = (y * _textCanvas.width + x) * 4;
        const a = img[i + 3];
        if (a < 60) continue;

        const targetX = tx - _textCanvas.width / 2 + x;
        const targetY = ty - _textCanvas.height / 2 + y;

        // start from a tight bloom near center, then assemble to target
        const startX = tx + rand(-38, 38);
        const startY = ty + rand(-22, 22);

        romantic.textBursts.push({
          gid,
          x: startX,
          y: startY,
          tx: targetX,
          ty: targetY,
          vx: rand(-1.2, 1.2),
          vy: rand(-1.2, 1.2),
          age: 0,
          life: TEXT_SHOW_FRAMES,
          c: Math.random() < 0.55 ? "#ff4d6d" : (Math.random() < 0.85 ? "#ff6aa2" : "#ffffff"),
        });
      }
    }

    // background pop behind the text
    for (let k = 0; k < 2; k++) romantic.fireworks.push({
      x: tx + rand(-240, 240),
      y: ty + rand(-90, 90),
      r: 0,
      max: rand(26, 44),
      color: FIREWORK_COLORS[(Math.random() * FIREWORK_COLORS.length) | 0],
      life: 1,
    });
  }

  function drawTextFirework() {
    if (reduceMotion) return;

    for (let i = romantic.textBursts.length - 1; i >= 0; i--) {
      const p = romantic.textBursts[i];
      p.age += 1;
      p.life -= 1;

      // assemble quickly, then "lock" (minimal motion) so it's readable
      if (p.age < TEXT_ASSEMBLE_FRAMES) {
        const pull = 0.22;
        p.vx += (p.tx - p.x) * pull * 0.02;
        p.vy += (p.ty - p.y) * pull * 0.02;
        p.x += p.vx;
        p.y += p.vy;
      } else {
        // after assemble: stay near target with tiny shimmer only
        const shimmer = 0.25;
        p.x = p.tx + Math.sin((romantic.t + i) * 0.06) * shimmer;
        p.y = p.ty + Math.cos((romantic.t + i) * 0.05) * shimmer;
      }

      // alpha: fade in, hold, then fade out (last ~TEXT_FADE_FRAMES)
      const fadeIn = clamp(p.age / 20, 0, 1);
      const fadeOut = p.life < TEXT_FADE_FRAMES ? clamp(p.life / TEXT_FADE_FRAMES, 0, 1) : 1;
      const alpha = (0.18 + 0.82 * fadeIn) * fadeOut * clamp(romantic.fade, 0, 1);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.c;
      ctx.fillRect(p.x, p.y, 2, 2);

      // little sparkle glints
      ctx.globalAlpha = alpha * 0.35;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(p.x + 2, p.y - 2, 1, 1);
      ctx.restore();

      if (p.life <= 0) romantic.textBursts.splice(i, 1);
    }
  }

  // ============================================================
  // Fireworks (includes HEART SHAPED)
  // ============================================================
  function spawnFireworkNormal() {
    const x = rand(W * 0.18, W * 0.82);
    const y = rand(H * 0.08, H * 0.35);
    const color = FIREWORK_COLORS[(Math.random() * FIREWORK_COLORS.length) | 0];

    romantic.fireworks.push({ x, y, r: 0, max: rand(28, 48), color, life: 1 });

    const pCount = 26 + ((Math.random() * 18) | 0);
    for (let i = 0; i < pCount; i++) {
      const ang = (Math.PI * 2 * i) / pCount;
      const sp = rand(1.6, 3.8);
      romantic.sparkles.push({
        x, y,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp,
        life: rand(28, 52),
        max: 0,
        c: FIREWORK_COLORS[(Math.random() * FIREWORK_COLORS.length) | 0],
      });
      romantic.sparkles[romantic.sparkles.length - 1].max =
        romantic.sparkles[romantic.sparkles.length - 1].life;
    }
  }

  function spawnFireworkHeart() {
    const x = rand(W * 0.20, W * 0.80);
    const y = rand(H * 0.10, H * 0.34);

    const color = Math.random() < 0.65 ? "#ff4d6d" : "#ff6aa2";

    romantic.fireworks.push({ x, y, r: 0, max: rand(28, 44), color, life: 1 });

    const points = 70;
    const scale = rand(0.95, 1.25);
    const speed = rand(0.26, 0.36) * scale;

    for (let i = 0; i < points; i++) {
      const t = (Math.PI * 2 * i) / points;

      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy =
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        1 * Math.cos(4 * t);

      const nx = hx / 18;
      const ny = -hy / 18;

      const vx = nx * 10 * speed + rand(-0.35, 0.35);
      const vy = ny * 10 * speed + rand(-0.35, 0.35);

      romantic.sparkles.push({
        x, y,
        vx, vy,
        life: rand(36, 64),
        max: 0,
        c: Math.random() < 0.20 ? "#ffd85a" : color,
      });
      romantic.sparkles[romantic.sparkles.length - 1].max =
        romantic.sparkles[romantic.sparkles.length - 1].life;
    }

    for (let k = 0; k < 18; k++) {
      romantic.sparkles.push({
        x: x + rand(-3, 3),
        y: y + rand(-3, 3),
        vx: rand(-1.2, 1.2),
        vy: rand(-1.2, 1.2),
        life: rand(18, 28),
        max: 0,
        c: "#ffffff",
      });
      romantic.sparkles[romantic.sparkles.length - 1].max =
        romantic.sparkles[romantic.sparkles.length - 1].life;
    }
  }

  function spawnFirework() {
    if (Math.random() < 0.35) spawnFireworkHeart();
    else spawnFireworkNormal();
  }

  function drawFireworks() {
    if (reduceMotion) return;

    if (Math.random() < 0.040) spawnFirework();

    for (let i = romantic.fireworks.length - 1; i >= 0; i--) {
      const f = romantic.fireworks[i];
      f.r += 2.2;
      f.life *= 0.86;

      const a = clamp(1 - f.r / f.max, 0, 1);
      ctx.save();
      ctx.globalAlpha = 0.22 + a * 0.48;
      ctx.strokeStyle = f.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      if (f.r > f.max) romantic.fireworks.splice(i, 1);
    }

    for (let i = romantic.sparkles.length - 1; i >= 0; i--) {
      const p = romantic.sparkles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.055;
      p.life -= 1;

      const a = clamp(p.life / p.max, 0, 1);

      ctx.save();
      ctx.globalAlpha = 0.15 + a * 0.75;
      ctx.fillStyle = p.c;
      ctx.fillRect(p.x, p.y, 2, 2);

      ctx.globalAlpha = 0.10 + a * 0.25;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(p.x + 2, p.y - 2, 1, 1);
      ctx.restore();

      if (p.life <= 0 || p.y > grassTop + grassHeight + 60) romantic.sparkles.splice(i, 1);
    }
  }

  function drawRomanticDecor() {
    const baseY = grassTop + grassHeight - 18;
    const cx = W * 0.5;

    const post = (x) => {
      drawPixelRect(x, baseY - 56, 6, 56, "#6b4b2a");
      drawPixelRect(x - 2, baseY - 56, 10, 6, "#7b5a3a");
      drawPixelRect(x - 6, baseY - 46, 18, 16, "rgba(30,20,10,0.65)");
      drawPixelRect(x - 4, baseY - 44, 14, 12, "#ffcc66");
      drawPixelRect(x - 2, baseY - 42, 10, 8, "#ffe7a6");
    };

    post(cx - 180);
    post(cx + 170);

    const candle = (x, y) => {
      drawPixelRect(x, y, 6, 10, "#f2f2f2");
      drawPixelRect(x + 2, y - 4, 2, 4, "#ffcc66");
      drawPixelRect(x + 1, y - 6, 4, 2, "rgba(255,200,120,0.35)");
    };

    candle(cx - 90, baseY + 6);
    candle(cx + 78, baseY + 6);
  }

  // ============================================================
  // COUPLE (UPDATED: her long black hair + dress, you white polo + black pants)
  // ============================================================
  function drawCouple() {
    const cx = W * 0.5;
    const baseY = grassTop + grassHeight - 16;

    const youX = cx - 34;
    const herX = cx + 12;

    const px = (x, y, w, h, c) =>
      drawPixelRect(Math.round(x), Math.round(y), w, h, c);

    // ground shadow
    ctx.globalAlpha = 0.35;
    px(cx - 32, baseY + 12, 64, 4, "rgba(0,0,0,0.6)");
    ctx.globalAlpha = 1;

    // -------------------------
    // YOU: white polo + black pants
    // -------------------------
    // head/face
    px(youX, baseY - 32, 14, 14, "#f2c6a0");
    px(youX + 3, baseY - 27, 3, 2, "rgba(0,0,0,0.6)");
    px(youX + 9, baseY - 27, 3, 2, "rgba(0,0,0,0.6)");

    // hair
    px(youX, baseY - 32, 14, 4, "#2b1d12");
    px(youX, baseY - 28, 3, 3, "#2b1d12");
    px(youX + 11, baseY - 28, 3, 3, "#2b1d12");

    // neck
    px(youX + 6, baseY - 18, 2, 2, "rgba(0,0,0,0.10)");

    // white polo (torso)
    px(youX + 1, baseY - 18, 12, 10, "#f5f5f5");
    // subtle shading
    px(youX + 1, baseY - 10, 12, 2, "rgba(0,0,0,0.10)");
    // collar
    px(youX + 4, baseY - 18, 6, 2, "rgba(0,0,0,0.14)");
    px(youX + 6, baseY - 16, 2, 2, "rgba(0,0,0,0.10)");

    // arms (skin)
    px(youX - 2, baseY - 18, 3, 10, "#f2c6a0");
    px(youX + 13, baseY - 18, 3, 10, "#f2c6a0");

    // black pants
    px(youX + 1, baseY - 8, 12, 8, "#1a1a1a");
    // legs/feet
    px(youX + 2, baseY, 4, 12, "#111111");
    px(youX + 8, baseY, 4, 12, "#111111");
    px(youX + 2, baseY + 12, 4, 2, "rgba(255,255,255,0.08)");
    px(youX + 8, baseY + 12, 4, 2, "rgba(255,255,255,0.08)");

    // -------------------------
    // HER: long black hair + dress
    // -------------------------
    // face/head
    px(herX, baseY - 32, 14, 14, "#f2c6a0");
    px(herX + 3, baseY - 27, 3, 2, "rgba(0,0,0,0.6)");
    px(herX + 9, baseY - 27, 3, 2, "rgba(0,0,0,0.6)");

    // LONG BLACK HAIR (top + thicker long sides + back)
    // crown
    px(herX, baseY - 32, 14, 5, "#0d0d0d");
    px(herX + 2, baseY - 32, 10, 2, "#000000");
    // long strands down to waist
    px(herX - 2, baseY - 27, 5, 22, "#0d0d0d");     // left thick strand
    px(herX + 11, baseY - 27, 5, 22, "#0d0d0d");    // right thick strand
    // back hair behind head/upper body
    px(herX + 1, baseY - 18, 12, 16, "#0b0b0b");
    // a tiny shine pixel
    px(herX + 10, baseY - 30, 2, 2, "rgba(255,255,255,0.08)");

    // DRESS (romantic)
    const dressMain = "#ffd84d";
    px(herX + 1, baseY - 18, 12, 18, dressMain);              // torso+skirt
    px(herX + 1, baseY - 10, 12, 2, "rgba(0,0,0,0.12)");      // waist shadow
    // hem highlight
    px(herX + 2, baseY - 1, 10, 1, "rgba(255,255,255,0.14)");

    // arms
    px(herX - 2, baseY - 18, 3, 10, "#f2c6a0");
    px(herX + 13, baseY - 18, 3, 10, "#f2c6a0");

    // legs/feet
    px(herX + 3, baseY, 3, 12, "#2a2a2a");
    px(herX + 8, baseY, 3, 12, "#2a2a2a");

    // little heart between them
    if (!reduceMotion) {
      const bob = Math.sin(romantic.t * 0.06) * 2;
      const hx = cx - 2;
      const hy = baseY - 44 + bob;
      ctx.globalAlpha = 0.9 * clamp(romantic.fade, 0, 1);
      px(hx, hy, 3, 3, "#ff5f9a");
      px(hx + 3, hy, 3, 3, "#ff5f9a");
      px(hx + 1, hy + 2, 4, 4, "#ff5f9a");
      ctx.globalAlpha = 1;
    }
  }

  // keep reference so we can stop ambient spawning during romantic gift
  let ambientSpawnIntervalId = null;

  function startRomanticNight() {
    if (!canvas || !ctx) return;

    romantic.on = true;
    romantic.t = 0;
    romantic.fade = 0;
    romantic.meteors = [];
    romantic.fireworks = [];
    romantic.sparkles = [];
    romantic.textBursts = [];
    romantic.textCooldown = 30; // show soon

    initFireflies(34);
    seedFlowers(90);

    items.length = 0;
    mobs.length = 0;
    if (ambientSpawnIntervalId) {
      clearInterval(ambientSpawnIntervalId);
      ambientSpawnIntervalId = null;
    }

    weather.stage = 0;
    weather.flash = 0;
    weather.deadFade = 0;
    document.body.classList.remove("dead-screen");
    hideDeadMenu();

    if (hudText) hudText.textContent = "Romantic Night";
    addChat("The world changed…", "sys");
    addChat("Look up — it’s for you…", "sys");

    beep(784, 70, "square", 0.02);
    setTimeout(() => beep(988, 70, "square", 0.02), 90);
    setTimeout(() => beep(1175, 80, "square", 0.02), 170);
  }

  window.addEventListener("romanticNightGift", () => startRomanticNight());

  function drawBg() {
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, W, H);

    romantic.t++;

    drawSky();

    if (!romantic.on && weather.stage === 0) drawSun();

    for (const c of clouds) {
      c.x += c.speed;
      if (c.x > W + 240) c.x = -240;

      if (romantic.on) ctx.globalAlpha = clamp(1 - romantic.fade * 1.25, 0, 1) * 0.55;
      else if (weather.stage >= 2) ctx.globalAlpha = 0.55;
      else if (weather.stage === 1) ctx.globalAlpha = 0.75;
      else ctx.globalAlpha = 1;

      drawCloud(c.x, c.y, c.size);
      ctx.globalAlpha = 1;
    }

    if (!romantic.on && weather.stage === 0) {
      const haze = ctx.createLinearGradient(0, 0, 0, H);
      haze.addColorStop(0, "rgba(255,255,255,0.10)");
      haze.addColorStop(1, "rgba(255,255,255,0.00)");
      ctx.fillStyle = haze;
      ctx.fillRect(0, 0, W, H);
    }

    drawGround();

    if (!romantic.on) {
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
        if (m.x < 18) { m.x = 18; m.vx *= -1; }
        if (m.x > W - 18) { m.x = W - 18; m.vx *= -1; }

        if (m.frame % 120 === 0) m.vx = clamp(m.vx + rand(-0.25, 0.25), -0.6, 0.6);
        drawMob(m);

        if (m.life <= 0) mobs.splice(i, 1); // FIXED
      }
    }

    if (!romantic.on && (weather.stage === 2 || weather.stage === 3)) drawRain();

    if (!romantic.on && weather.stage === 3) {
      weather.boltTimer -= 1;
      if (weather.boltTimer <= 0) {
        weather.flash = 1;
        weather.boltTimer = 90 + Math.floor(Math.random() * 140);
        drawLightningBolt();
      }
    }

    if (!romantic.on) {
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
    }

    if (romantic.on) {
      romantic.fade = clamp(romantic.fade + 0.006, 0, 1);

      drawStarsSky();
      drawMoon();
      drawMeteors();
      drawFireflies();

      romantic.textCooldown -= 1;
      if (romantic.textCooldown <= 0) {
        spawnTextFirework("I love you Mahal ko!!");
        romantic.textCooldown = TEXT_REPEAT_FRAMES;
      }

      drawFireworks();
      drawTextFirework();

      ctx.save();
      ctx.globalAlpha = 0.18 + 0.22 * romantic.fade;
      ctx.fillStyle = "#0a0f2a";
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      drawGrowingFlowers();
      drawRomanticDecor();
      drawCouple();
    }

    if (!reduceMotion) requestAnimationFrame(drawBg);
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

  if (canvas && ctx) {
    resize();
    window.addEventListener("resize", resize);

    setWeatherStage(0);

    for (let i = 0; i < 22; i++) spawnItem(rand(0, W), rand(0, H));
    if (!reduceMotion) ambientSpawnIntervalId = setInterval(() => spawnItem(), 260);

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
    if (romantic.on) return;

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
      if (romantic.on) return;

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
        if (romantic.on) return;
        setTimeout(() => moveNoAnywhere(), 60);
      },
      { passive: true }
    );
  }
})();
