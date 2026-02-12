/* ask/static/ask/js/app.js
   ============================================================
   MINECRAFT-THEMED VALENTINE LOGIC + MOB SPAWNS + CHAT
   - Background runs on ANY page that has #bg canvas
   - Home page: YES redirects to /yes (Book & Quill)
   - NO teleports anywhere on screen
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

  // Chat elements (home only)
  const mcChat = document.getElementById("mcChat");
  const mcChatLines = document.getElementById("mcChatLines");

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
  // 1) Pixel Background + Items + MOBS (runs anywhere #bg exists)
  // ============================================================
  const canvas = document.getElementById("bg");
  const ctx = canvas?.getContext("2d", { alpha: true });

  let DPR = 1;
  let W = 0, H = 0;

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
      x, y,
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

    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "rgba(126,192,255,0.15)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    drawGround();

    for (let i = items.length - 1; i >= 0; i--) {
      const p = items[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 1;

      const a = clamp(p.life / 40, 0, 1);
      ctx.globalAlpha = a;
      drawPixelRect(p.x, p.y, p.size, p.size, p.c);
      drawPixelRect(p.x + p.size * 0.35, p.y - p.size * 0.35, p.size * 0.5, p.size * 0.5, "rgba(255,255,255,0.45)");
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

      if (m.life <= 0) mobs.splice(i, 1);
    }

    if (!reduceMotion) requestAnimationFrame(drawBg);
  }

  if (canvas && ctx) {
    resize();
    window.addEventListener("resize", resize);
    for (let i = 0; i < 22; i++) spawnItem(rand(0, W), rand(0, H));
    if (!reduceMotion) setInterval(() => spawnItem(), 260);
    drawBg();
  }

  // ============================================================
  // YES: redirect to Book & Quill page
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

  yesBtn?.addEventListener("click", () => {
    const yesUrl = yesBtn.dataset.yesUrl; // comes from home.html
    sparkleBurstFrom(yesBtn);

    // show a quick overlay, then go to the book page
    showSuccess();

    // small delay so you see the effect
    setTimeout(() => {
      if (yesUrl) window.location.href = yesUrl;
    }, reduceMotion ? 0 : 550);
  });

  againBtn?.addEventListener("click", () => {
    hideSuccess();
  });

  success?.addEventListener("click", (e) => {
    if (e.target === success) hideSuccess();
  });

  // ============================================================
  // NO: TELEPORT WHOLE SCREEN (home only)
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

  if (noBtn) {
    let attempts = 0;

    // Keep initial position so it doesn't "vanish", then switch to fixed
    const startRect = noBtn.getBoundingClientRect();
    noBtn.style.position = "fixed";
    noBtn.style.zIndex = "9999";
    noBtn.style.left = `${startRect.left}px`;
    noBtn.style.top = `${startRect.top}px`;
    noBtn.style.display = "inline-flex";

    function moveNoAnywhere() {
      const noRect = noBtn.getBoundingClientRect();
      const yesRect = yesBtn?.getBoundingClientRect();

      const pad = 10;
      const minX = pad;
      const maxX = window.innerWidth - noRect.width - pad;
      const minY = pad;
      const maxY = window.innerHeight - noRect.height - pad;

      if (maxX <= minX || maxY <= minY) return;

      let best = null;
      for (let i = 0; i < 120; i++) {
        const left = minX + Math.random() * (maxX - minX);
        const top = minY + Math.random() * (maxY - minY);

        const candidate = { left, top, right: left + noRect.width, bottom: top + noRect.height };
        if (yesRect && rectsOverlap(candidate, yesRect)) continue;

        best = { left, top };
        break;
      }

      if (!best) best = { left: minX, top: minY };

      const dur = Math.max(70, 140 - attempts * 4);
      noBtn.style.transition = `left ${dur}ms steps(4,end), top ${dur}ms steps(4,end), transform 120ms ease`;
      noBtn.style.left = `${best.left}px`;
      noBtn.style.top = `${best.top}px`;
      noBtn.style.transform = `rotate(${(Math.random() - 0.5) * 18}deg)`;
    }

    noBtn.addEventListener("click", (e) => {
      e.preventDefault();
      attempts++;

      let idx;
      do { idx = (Math.random() * creeperLines.length) | 0; }
      while (idx === lastLine && creeperLines.length > 1);
      lastLine = idx;

      const line = creeperLines[idx];

      showBubble(line);
      shakeCard();
      addChat(line, "player");

      const wave = clamp(3 + Math.floor(attempts / 2), 3, 10);
      spawnMobWave(wave);

      if (attempts === 1) addChat("Mobs are spawning because she said NO...", "warn");
      if (attempts === 4) addChat("Difficulty set to: HARD", "warn");

      const { x, y } = getPointer(e);
      if (!reduceMotion) for (let i = 0; i < 10; i++) spawnItem(x + rand(-12, 12), y + rand(-8, 8), true);

      beep(220 + attempts * 6, 55, "square", 0.02);
      moveNoAnywhere();
    });

    window.addEventListener("resize", () => setTimeout(moveNoAnywhere, 50), { passive: true });
  }
})();
