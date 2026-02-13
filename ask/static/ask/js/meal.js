/* ask/static/ask/js/meal.js
   ============================================================
   ROMANTIC MEAL QUEST 🌹 (STEP-BY-STEP)
   Flow: Food Area -> Food -> After-Eating Place -> Stars -> Confirm
   - Supports real images per food item (optional "img" field)
   - Fallback: nicer canvas-generated "food-ish" cards (not just circles)
   - FIX: Better title readability + contrast
   - FIX: z-index so modal always above book UI
   ============================================================ */

(() => {
  // -----------------------------
  // 1) DATA (edit freely)
  // -----------------------------
  // Tip: Add "img" to any food to use a real picture:
  // { name:"Chickenjoy", tone:"#d35400", kind:"fried", img:"/static/ask/img/foods/jollibee/chickenjoy.png" }
  const restaurants = {
    jollibee: {
      name: "Jollibee",
      theme: "#ff4d6d",
      foods: [
        { name: "Chickenjoy (1pc)", tone: "#d35400", kind: "fried" },
        { name: "Chickenjoy (2pc)", tone: "#d35400", kind: "fried" },
        { name: "Jolly Spaghetti", tone: "#e74c3c", kind: "pasta" },
        { name: "Burger Steak", tone: "#8e5c2c", kind: "steak" },
        { name: "Yumburger", tone: "#f39c12", kind: "burger" },
        { name: "Cheesy Yumburger", tone: "#f1c40f", kind: "burger" },
        { name: "Chicken Sandwich", tone: "#e67e22", kind: "burger" },
        { name: "Palabok Fiesta", tone: "#c0392b", kind: "noodles" },
        { name: "Peach Mango Pie", tone: "#f5b041", kind: "dessert" },
        { name: "Jolly Hotdog", tone: "#e74c3c", kind: "hotdog" },
        { name: "Breakfast: Longganisa", tone: "#b03a2e", kind: "breakfast" },
        { name: "Pineapple Juice", tone: "#f7dc6f", kind: "drink" }
      ]
    },
    mcdo: {
      name: "McDonald's",
      theme: "#f1c40f",
      foods: [
        { name: "Big Mac", tone: "#f1c40f", kind: "burger" },
        { name: "McChicken", tone: "#f39c12", kind: "burger" },
        { name: "Quarter Pounder", tone: "#d35400", kind: "burger" },
        { name: "Cheeseburger", tone: "#f4d03f", kind: "burger" },
        { name: "Chicken McNuggets", tone: "#f39c12", kind: "fried" },
        { name: "McSpaghetti", tone: "#c0392b", kind: "pasta" },
        { name: "McCrispy Chicken", tone: "#e67e22", kind: "fried" },
        { name: "BFF Fries", tone: "#f39c12", kind: "fries" },
        { name: "Apple Pie", tone: "#f5b041", kind: "dessert" },
        { name: "Sundae", tone: "#af7ac5", kind: "dessert" },
        { name: "McFloat", tone: "#85c1e9", kind: "drink" },
        { name: "Iced Coffee", tone: "#6e2c00", kind: "drink" }
      ]
    },
    manginasal: {
      name: "Mang Inasal",
      theme: "#27ae60",
      foods: [
        { name: "PM1: Chicken Inasal (Pecho)", tone: "#a04000", kind: "grill" },
        { name: "PM1: Chicken Inasal (Paa)", tone: "#935116", kind: "grill" },
        { name: "Pork BBQ", tone: "#b03a2e", kind: "grill" },
        { name: "Liempo", tone: "#6e2c00", kind: "grill" },
        { name: "Bangus Sisig", tone: "#7f8c8d", kind: "sisig" },
        { name: "Pork Sisig", tone: "#8e5c2c", kind: "sisig" },
        { name: "Halo-Halo", tone: "#af7ac5", kind: "dessert" },
        { name: "Leche Flan", tone: "#f5cba7", kind: "dessert" },
        { name: "Chicken Soup", tone: "#f7dc6f", kind: "soup" },
        { name: "Pandesal Meal", tone: "#d7bde2", kind: "breakfast" },
        { name: "Iced Tea", tone: "#5dade2", kind: "drink" }
      ]
    },
    chowking: {
      name: "Chowking",
      theme: "#e74c3c",
      foods: [
        { name: "Chao Fan", tone: "#d68910", kind: "rice" },
        { name: "Siopao", tone: "#f5cba7", kind: "bun" },
        { name: "Sweet & Sour Pork", tone: "#cb4335", kind: "pork" },
        { name: "Beef Wanton Mami", tone: "#a04000", kind: "noodles" },
        { name: "Lauriat (Chicken)", tone: "#e67e22", kind: "meal" },
        { name: "La Paz Batchoy", tone: "#8e5c2c", kind: "noodles" },
        { name: "Siomai", tone: "#f0b27a", kind: "dimsum" },
        { name: "Halo-Halo", tone: "#af7ac5", kind: "dessert" },
        { name: "Buchi", tone: "#f5b041", kind: "dessert" },
        { name: "Milk Tea", tone: "#d2b48c", kind: "drink" }
      ]
    }
  };

  const afterPlaces = [
    { name: "Coffee shop ☕", vibe: "cozy" },
    { name: "Dessert place 🍰", vibe: "sweet" },
    { name: "Walk at the park 🌿", vibe: "breezy" },
    { name: "Arcade / games 🎮", vibe: "playful" },
    { name: "Mall stroll 🛍️", vibe: "chill" },
    { name: "Sunset spot 🌅", vibe: "romantic" },
    { name: "Photo booth 📸", vibe: "cute" },
    { name: "Bookstore 📚", vibe: "quiet" },
    { name: "Milk tea stop 🧋", vibe: "sweet" },
    { name: "Ice cream 🍦", vibe: "classic" }
  ];

  // -----------------------------
  // 2) STATE
  // -----------------------------
  const state = {
    step: 1, // 1=restaurant, 2=food, 3=after place, 4=stars, 5=confirm
    restaurantKey: null,
    restaurantName: null,
    foodName: null,
    afterPlace: null,
    stars: 5
  };

  document.addEventListener("DOMContentLoaded", () => {
    const openBtn = document.getElementById("openMealBtn");
    if (openBtn) openBtn.addEventListener("click", openMealModal);
  });

  window.addEventListener("openMealQuest", () => openMealModal());

  function openMealModal() {
    if (document.getElementById("mealModal")) return;

    const modal = document.createElement("div");
    modal.id = "mealModal";
    modal.innerHTML = `
      <div class="meal-overlay" aria-hidden="true"></div>

      <div class="meal-box mc-ui" role="dialog" aria-label="Plan our meal date">
        <div class="meal-head">
          <div class="meal-badge">Meal Quest</div>
          <h2 class="meal-title">Choose our meal date</h2>
          <p class="meal-subtitle">One step at a time — you pick, I’ll handle the rest.</p>

          <div class="meal-progress" aria-hidden="true">
            <span class="dot active"></span>
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>

        <div class="meal-body">
          <!-- dynamic content -->
        </div>

        <div class="meal-footer">
          <button type="button" class="meal-btn ghost" id="mealBack" aria-label="Go back">Back</button>
          <div class="meal-summary" id="mealSummary" aria-live="polite"></div>
          <button type="button" class="meal-btn primary" id="mealNext" aria-label="Next step">Next</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.classList.add("meal-lock");
    injectStyles();

    modal.querySelector(".meal-overlay").addEventListener("click", () => modal.remove());

    const escHandler = (e) => {
      if (e.key === "Escape") {
        const m = document.getElementById("mealModal");
        if (m) m.remove();
        window.removeEventListener("keydown", escHandler);
      }
    };
    window.addEventListener("keydown", escHandler);

    // footer buttons
    modal.querySelector("#mealBack").addEventListener("click", onBack);
    modal.querySelector("#mealNext").addEventListener("click", onNext);

    // start
    state.step = 1;
    state.restaurantKey = null;
    state.restaurantName = null;
    state.foodName = null;
    state.afterPlace = null;
    state.stars = 5;

    render();
  }

  // -----------------------------
  // 3) RENDER ROUTER
  // -----------------------------
  function render() {
    updateProgressDots();
    updateFooterButtons();
    updateSummary();

    const body = document.querySelector(".meal-body");
    if (!body) return;

    body.innerHTML = "";

    if (state.step === 1) renderRestaurantStep(body);
    if (state.step === 2) renderFoodStep(body);
    if (state.step === 3) renderAfterPlaceStep(body);
    if (state.step === 4) renderStarsStep(body);
    if (state.step === 5) renderConfirmStep(body);
  }

  function updateProgressDots() {
    const dots = document.querySelectorAll(".meal-progress .dot");
    dots.forEach((d, i) => {
      d.classList.toggle("active", i === state.step - 1);
      d.classList.toggle("done", i < state.step - 1);
    });
  }

  function updateFooterButtons() {
    const back = document.getElementById("mealBack");
    const next = document.getElementById("mealNext");
    if (!back || !next) return;

    back.disabled = state.step === 1;
    next.textContent = state.step === 5 ? "Seal the Date" : "Next";

    // Disable next until selection is made
    let ok = true;
    if (state.step === 1) ok = !!state.restaurantKey;
    if (state.step === 2) ok = !!state.foodName;
    if (state.step === 3) ok = !!state.afterPlace;
    if (state.step === 4) ok = typeof state.stars === "number" && state.stars >= 1;
    if (state.step === 5) ok = true;

    next.disabled = !ok;
  }

  function updateSummary() {
    const el = document.getElementById("mealSummary");
    if (!el) return;

    const parts = [];
    if (state.restaurantName) parts.push(`<span class="pill">${escapeHtml(state.restaurantName)}</span>`);
    if (state.foodName) parts.push(`<span class="pill">${escapeHtml(state.foodName)}</span>`);
    if (state.afterPlace) parts.push(`<span class="pill">${escapeHtml(state.afterPlace)}</span>`);
    if (state.step >= 4) parts.push(`<span class="pill">${"★".repeat(state.stars)}${"☆".repeat(5 - state.stars)}</span>`);

    el.innerHTML = parts.length ? parts.join(" ") : `<span class="hint">Pick a Food Area to begin.</span>`;
  }

  function onBack() {
    if (state.step <= 1) return;
    state.step -= 1;
    render();
  }

  function onNext() {
    if (state.step < 5) {
      state.step += 1;
      render();
      return;
    }

    // Final seal: show stars animation and close button
    const modal = document.getElementById("mealModal");
    if (!modal) return;

    const body = modal.querySelector(".meal-body");
    if (!body) return;

    body.innerHTML = `
      <div class="final-wrap">
        <div class="final-title">It’s a date. 💘</div>
        <div class="final-line">
          <strong>${escapeHtml(state.restaurantName)}</strong> — ${escapeHtml(state.foodName)}
        </div>
        <div class="final-line">
          After: <strong>${escapeHtml(state.afterPlace)}</strong>
        </div>

        <div class="final-stars" id="finalStars">${renderStarRow(state.stars)}</div>
        <button class="meal-btn primary final-btn" id="showStarsBtn" type="button">See the stars ✨</button>

        <button class="meal-btn ghost final-btn" id="closeMeal" type="button">Close</button>
      </div>
    `;

    const showStarsBtn = document.getElementById("showStarsBtn");
    if (showStarsBtn) {
      showStarsBtn.addEventListener("click", () => popStars(28), { once: false });
    }

    const closeBtn = document.getElementById("closeMeal");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => modal.remove(), { once: true });
    }

    // Hide footer on final screen
    const footer = modal.querySelector(".meal-footer");
    if (footer) footer.classList.add("hidden");
  }

  // -----------------------------
  // 4) STEPS
  // -----------------------------
  function renderRestaurantStep(body) {
    body.innerHTML = `
      <h3 class="step-title">Food Area</h3>
      <p class="step-sub">Choose where we’re eating first.</p>
      <div class="choice-grid" aria-label="Restaurants"></div>
    `;

    const grid = body.querySelector(".choice-grid");
    Object.keys(restaurants).forEach((key) => {
      const r = restaurants[key];
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice-card";
      btn.innerHTML = `
        <div class="choice-top">
          <div class="choice-icon" style="background:${r.theme}"></div>
          <div class="choice-name">${escapeHtml(r.name)}</div>
        </div>
        <div class="choice-meta">${r.foods.length} options</div>
      `;

      if (state.restaurantKey === key) btn.classList.add("active");

      btn.addEventListener("click", () => {
        state.restaurantKey = key;
        state.restaurantName = r.name;

        // reset downstream choices
        state.foodName = null;
        state.afterPlace = null;
        state.stars = 5;

        render();
      });

      grid.appendChild(btn);
    });
  }

  function renderFoodStep(body) {
    const r = restaurants[state.restaurantKey];
    if (!r) {
      state.step = 1;
      render();
      return;
    }

    body.innerHTML = `
      <h3 class="step-title">Foods</h3>
      <p class="step-sub">Pick what we’ll order at <strong>${escapeHtml(r.name)}</strong>.</p>

      <div class="search-wrap">
        <input id="foodSearch" class="meal-input" type="text" placeholder="Search food..." autocomplete="off" />
      </div>

      <div class="food-grid" aria-label="Food choices"></div>
    `;

    const input = body.querySelector("#foodSearch");
    const grid = body.querySelector(".food-grid");

    const renderList = (q) => {
      grid.innerHTML = "";
      const query = (q || "").trim().toLowerCase();

      r.foods
        .filter(f => !query || f.name.toLowerCase().includes(query))
        .forEach((food) => {
          const card = document.createElement("button");
          card.type = "button";
          card.className = "food-card";
          if (state.foodName === food.name) card.classList.add("active");

          const imgSrc = food.img ? food.img : generateFoodPNG(food.name, food.tone, food.kind);

          card.innerHTML = `
            <img alt="${escapeHtml(food.name)}" src="${imgSrc}" />
            <div class="food-name">${escapeHtml(food.name)}</div>
          `;

          card.addEventListener("click", () => {
            state.foodName = food.name;
            render();
          });

          grid.appendChild(card);
        });

      if (!grid.children.length) {
        grid.innerHTML = `<div class="empty">No matches. Try a different search.</div>`;
      }
    };

    renderList("");
    input.addEventListener("input", () => renderList(input.value));
  }

  function renderAfterPlaceStep(body) {
    body.innerHTML = `
      <h3 class="step-title">Place after eating</h3>
      <p class="step-sub">Where do we go after? (Pick one)</p>
      <div class="choice-grid" aria-label="After eating places"></div>
    `;

    const grid = body.querySelector(".choice-grid");
    afterPlaces.forEach((p) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice-card";

      btn.innerHTML = `
        <div class="choice-top">
          <div class="choice-emoji">${escapeHtml(p.name.split(" ").slice(-1)[0] || "✨")}</div>
          <div class="choice-name">${escapeHtml(p.name)}</div>
        </div>
        <div class="choice-meta">${escapeHtml(p.vibe)}</div>
      `;

      if (state.afterPlace === p.name) btn.classList.add("active");

      btn.addEventListener("click", () => {
        state.afterPlace = p.name;
        render();
      });

      grid.appendChild(btn);
    });
  }

  function renderStarsStep(body) {
    body.innerHTML = `
      <h3 class="step-title">Rate the plan</h3>
      <p class="step-sub">How perfect is this date?</p>

      <div class="stars-wrap" aria-label="Stars rating">
        <div class="stars" id="starsPick"></div>
        <div class="stars-label" id="starsLabel"></div>
      </div>

      <button class="meal-btn ghost inline" id="seeStars" type="button">See the stars ✨</button>
    `;

    const starsPick = body.querySelector("#starsPick");
    const label = body.querySelector("#starsLabel");
    const seeStars = body.querySelector("#seeStars");

    const setLabel = () => {
      const labels = {
        1: "We can do better 😅",
        2: "Not bad, not bad",
        3: "Cute!",
        4: "Almost perfect",
        5: "Perfect. No notes. 💘"
      };
      label.textContent = labels[state.stars] || "";
    };

    const drawStars = () => {
      starsPick.innerHTML = "";
      for (let i = 1; i <= 5; i++) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "star-btn";
        b.setAttribute("aria-label", `${i} stars`);
        b.textContent = i <= state.stars ? "★" : "☆";
        b.addEventListener("click", () => {
          state.stars = i;
          drawStars();
          setLabel();
          updateFooterButtons();
          updateSummary();
        });
        starsPick.appendChild(b);
      }
    };

    drawStars();
    setLabel();

    if (seeStars) seeStars.addEventListener("click", () => popStars(22));
  }

  function renderConfirmStep(body) {
    body.innerHTML = `
      <h3 class="step-title">Confirm</h3>
      <p class="step-sub">Here’s our plan:</p>

      <div class="confirm-card">
        <div class="confirm-row"><span>Food Area</span><strong>${escapeHtml(state.restaurantName || "-")}</strong></div>
        <div class="confirm-row"><span>Food</span><strong>${escapeHtml(state.foodName || "-")}</strong></div>
        <div class="confirm-row"><span>After</span><strong>${escapeHtml(state.afterPlace || "-")}</strong></div>
        <div class="confirm-row"><span>Rating</span><strong>${renderStarRow(state.stars)}</strong></div>
      </div>

      <p class="tiny-note">Hit “Seal the Date” to finish.</p>
    `;
  }

  // -----------------------------
  // 5) FOOD IMAGE GENERATOR (better than circles)
  // -----------------------------
  function generateFoodPNG(text, tone, kind) {
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 220;

    const ctx = canvas.getContext("2d");

    // soft background
    roundRect(ctx, 0, 0, canvas.width, canvas.height, 18);
    ctx.fillStyle = "#fff7fa";
    ctx.fill();

    // subtle gradient tint
    const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    g.addColorStop(0, "rgba(255,77,109,0.12)");
    g.addColorStop(1, "rgba(0,0,0,0.03)");
    ctx.fillStyle = g;
    roundRect(ctx, 0, 0, canvas.width, canvas.height, 18);
    ctx.fill();

    // plate
    ctx.save();
    ctx.translate(160, 110);
    ctx.shadowColor = "rgba(0,0,0,0.12)";
    ctx.shadowBlur = 16;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(0, 10, 110, 55, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(0,0,0,0.06)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 10, 95, 45, 0, 0, Math.PI * 2);
    ctx.stroke();

    // food based on kind (simple shapes but looks more “food”)
    const base = tone || "#ff4d6d";
    if (kind === "burger") drawBurger(ctx, base);
    else if (kind === "pasta") drawPasta(ctx, base);
    else if (kind === "noodles") drawNoodles(ctx, base);
    else if (kind === "fried") drawFried(ctx, base);
    else if (kind === "fries") drawFries(ctx, base);
    else if (kind === "dessert") drawDessert(ctx, base);
    else if (kind === "drink") drawDrink(ctx, base);
    else if (kind === "grill") drawGrill(ctx, base);
    else if (kind === "rice") drawRice(ctx, base);
    else drawDefaultFood(ctx, base);

    ctx.restore();

    // label strip
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    roundRect(ctx, 14, 160, 292, 44, 14);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.06)";
    ctx.stroke();

    ctx.fillStyle = "#1f1f1f";
    ctx.font = "800 16px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    const label = text.length > 26 ? text.slice(0, 26) + "…" : text;
    ctx.fillText(label, 26, 182);

    return canvas.toDataURL("image/png");
  }

  function drawBurger(ctx, base) {
    // bun top
    ctx.fillStyle = lighten(base, 0.35);
    roundRect(ctx, -70, -35, 140, 45, 22);
    ctx.fill();
    // sesame
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.ellipse(rand(-45, 45), rand(-28, -8), rand(2, 4), rand(1, 2.2), rand(0, Math.PI), 0, Math.PI * 2);
      ctx.fill();
    }
    // lettuce
    ctx.fillStyle = "#2ecc71";
    waveRect(ctx, -65, 5, 130, 12, 6);
    // patty
    ctx.fillStyle = "#6e2c00";
    roundRect(ctx, -62, 14, 124, 16, 10);
    ctx.fill();
    // cheese
    ctx.fillStyle = "#f1c40f";
    ctx.beginPath();
    ctx.moveTo(-40, 18);
    ctx.lineTo(40, 18);
    ctx.lineTo(25, 34);
    ctx.lineTo(-25, 34);
    ctx.closePath();
    ctx.fill();
    // bun bottom
    ctx.fillStyle = lighten(base, 0.25);
    roundRect(ctx, -70, 30, 140, 24, 16);
    ctx.fill();
  }

  function drawPasta(ctx, base) {
    ctx.strokeStyle = lighten(base, 0.25);
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    for (let i = 0; i < 14; i++) {
      ctx.beginPath();
      ctx.moveTo(rand(-70, 70), rand(-5, 35));
      ctx.bezierCurveTo(rand(-80, 80), rand(-30, 50), rand(-80, 80), rand(-30, 50), rand(-70, 70), rand(-10, 40));
      ctx.stroke();
    }
    // sauce blobs
    ctx.fillStyle = base;
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.arc(rand(-65, 65), rand(-20, 35), rand(10, 16), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawNoodles(ctx, base) {
    ctx.strokeStyle = lighten(base, 0.35);
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    for (let i = 0; i < 16; i++) {
      ctx.beginPath();
      ctx.moveTo(-80, rand(-20, 35));
      ctx.quadraticCurveTo(rand(-20, 20), rand(-40, 50), 80, rand(-20, 35));
      ctx.stroke();
    }
    ctx.fillStyle = base;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(rand(-55, 55), rand(-15, 30), rand(10, 14), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawFried(ctx, base) {
    ctx.fillStyle = lighten(base, 0.15);
    for (let i = 0; i < 6; i++) {
      roundRect(ctx, rand(-70, 40), rand(-10, 35), rand(40, 70), rand(22, 36), 16);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(0,0,0,0.10)";
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.arc(rand(-70, 70), rand(-15, 40), rand(2, 4), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawFries(ctx, base) {
    ctx.fillStyle = lighten(base, 0.2);
    for (let i = 0; i < 16; i++) {
      roundRect(ctx, rand(-65, 65), rand(-40, 10), 10, rand(50, 80), 6);
      ctx.fill();
    }
    ctx.fillStyle = "#c0392b";
    roundRect(ctx, -50, 25, 100, 22, 10);
    ctx.fill();
  }

  function drawDessert(ctx, base) {
    ctx.fillStyle = lighten(base, 0.25);
    ctx.beginPath();
    ctx.ellipse(0, 10, 60, 35, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.ellipse(0, 0, 55, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.beginPath();
    ctx.arc(18, -6, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#2f2f2f";
    ctx.beginPath();
    ctx.arc(-20, -6, 4, 0, Math.PI * 2);
    ctx.arc(-6, -10, 4, 0, Math.PI * 2);
    ctx.arc(6, -4, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawDrink(ctx, base) {
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    roundRect(ctx, -30, -45, 60, 95, 14);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.08)";
    ctx.stroke();

    ctx.fillStyle = base;
    roundRect(ctx, -26, -5, 52, 50, 12);
    ctx.fill();

    ctx.strokeStyle = lighten(base, 0.35);
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(10, -52);
    ctx.lineTo(40, -10);
    ctx.stroke();
  }

  function drawGrill(ctx, base) {
    ctx.fillStyle = base;
    roundRect(ctx, -70, -10, 140, 40, 18);
    ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    for (let i = 0; i < 6; i++) {
      roundRect(ctx, -60 + i * 20, -6, 10, 32, 6);
      ctx.fill();
    }
    ctx.fillStyle = "#27ae60";
    waveRect(ctx, -65, 28, 130, 10, 6);
  }

  function drawRice(ctx, base) {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(0, 12, 70, 40, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = base;
    roundRect(ctx, -55, -15, 110, 30, 16);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.6)";
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.ellipse(rand(-60, 60), rand(0, 35), rand(3, 6), rand(2, 4), rand(0, Math.PI), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawDefaultFood(ctx, base) {
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.ellipse(0, 10, 65, 35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath();
    ctx.arc(20, 0, 12, 0, Math.PI * 2);
    ctx.fill();
  }

  // -----------------------------
  // 6) STARS FX
  // -----------------------------
  function popStars(count) {
    const modal = document.getElementById("mealModal");
    if (!modal) return;

    for (let i = 0; i < count; i++) {
      const s = document.createElement("div");
      s.className = "pop-star";
      s.textContent = Math.random() > 0.5 ? "★" : "✦";
      s.style.left = `${rand(10, 90)}%`;
      s.style.top = `${rand(20, 80)}%`;
      s.style.transform = `translate(-50%, -50%) scale(${rand(0.9, 1.6)}) rotate(${rand(-35, 35)}deg)`;
      s.style.animationDuration = `${rand(700, 1200)}ms`;
      modal.appendChild(s);
      setTimeout(() => s.remove(), 1400);
    }
  }

  function renderStarRow(n) {
    const full = "★".repeat(Math.max(0, Math.min(5, n)));
    const empty = "☆".repeat(Math.max(0, 5 - n));
    return `${full}${empty}`;
  }

  // -----------------------------
  // 7) STYLES
  // -----------------------------
  function injectStyles() {
  if (document.getElementById("mealQuestStyles")) return;

  const style = document.createElement("style");
  style.id = "mealQuestStyles";
  style.textContent = `
    /* =========================
       MODAL LAYER + SCROLL FIX
       ========================= */
    #mealModal{
      position: fixed;
      inset: 0;
      z-index: 2000;
      /* allow overlay scrolling on small screens */
      overflow: auto;
      -webkit-overflow-scrolling: touch;
      padding: 18px;
      box-sizing: border-box;
    }

    .meal-overlay{
      position: fixed;
      inset: 0;
      z-index: 2000;
      background: rgba(0,0,0,0.68);
      image-rendering: pixelated;
    }

    /* =========================
       MINECRAFT UI THEME
       ========================= */
    .mc-ui{
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial;
      image-rendering: pixelated;
    }

    /* A subtle "pixel grid" texture using gradients (no images needed) */
    .mc-ui{
      --mc-border-dark: #1f1f1f;
      --mc-border-mid: #3a3a3a;
      --mc-border-light: #bfbfbf;
      --mc-panel: #d9d9d9;
      --mc-panel-2: #cfcfcf;
      --mc-accent: #3dbb4a;
      --mc-accent-2: #2a8b35;
      --mc-danger: #d64545;
      --mc-text: #111;
    }

    .meal-box{
      position: relative;
      z-index: 2001;

      /* important: do NOT fixed center with transform, let it fit viewport */
      margin: 18px auto;
      width: min(920px, 96vw);

      /* scrollable layout */
      max-height: calc(100vh - 36px);
      display: flex;
      flex-direction: column;

      background: var(--mc-panel);
      border-radius: 6px;

      /* chunky Minecraft-ish border */
      border: 4px solid var(--mc-border-dark);
      box-shadow:
        0 0 0 2px var(--mc-border-mid),
        0 0 0 4px var(--mc-border-light),
        0 20px 70px rgba(0,0,0,0.45);

      overflow: hidden;
      animation: mcPop .14s ease-out;
    }

    @keyframes mcPop{
      from{ transform: translateY(6px); opacity: 0; }
      to{ transform: translateY(0); opacity: 1; }
    }

    .meal-head{
      padding: 14px 16px 12px;
      background:
        linear-gradient(0deg, rgba(0,0,0,0.06), rgba(0,0,0,0.06)),
        repeating-linear-gradient(
          90deg,
          rgba(0,0,0,0.04) 0,
          rgba(0,0,0,0.04) 8px,
          rgba(255,255,255,0.04) 8px,
          rgba(255,255,255,0.04) 16px
        ),
        var(--mc-panel-2);
      border-bottom: 4px solid var(--mc-border-dark);
      box-shadow: inset 0 2px 0 rgba(255,255,255,0.35);
    }

    .meal-badge{
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-weight: 900;
      font-size: 12px;
      letter-spacing: .12em;
      text-transform: uppercase;
      color: rgba(0,0,0,0.75);
      margin-bottom: 6px;
    }

    .meal-title{
      margin: 0 0 4px;
      font-size: 22px;
      color: var(--mc-text);
      font-weight: 1000;
      text-shadow: 0 2px 0 rgba(255,255,255,0.35);
    }

    .meal-subtitle{
      margin: 0;
      font-size: 12px;
      font-weight: 800;
      color: rgba(0,0,0,0.75);
    }

    .meal-progress{
      display: flex;
      gap: 8px;
      margin-top: 10px;
    }
    .meal-progress .dot{
      width: 10px;
      height: 10px;
      border-radius: 2px;
      background: rgba(0,0,0,0.18);
      box-shadow: inset 0 2px 0 rgba(255,255,255,0.25);
    }
    .meal-progress .dot.done{
      background: rgba(61,187,74,0.55);
    }
    .meal-progress .dot.active{
      background: rgba(61,187,74,0.95);
    }

    /* =========================
       SCROLLABLE CONTENT AREA
       ========================= */
    .meal-body{
      padding: 14px 16px 10px;
      overflow: auto;                /* <--- THIS IS THE BIG FIX */
      -webkit-overflow-scrolling: touch;
      flex: 1;                       /* <--- allow it to take remaining height */
      background:
        radial-gradient(rgba(255,255,255,0.24) 1px, transparent 1px) 0 0/12px 12px,
        #e7e7e7;
    }

    /* Footer stays pinned while body scrolls */
    .meal-footer{
      display:flex;
      align-items:center;
      gap: 10px;
      padding: 10px 12px;
      border-top: 4px solid var(--mc-border-dark);
      background: var(--mc-panel-2);
    }

    .meal-summary{
      flex: 1;
      min-height: 34px;
      display:flex;
      align-items:center;
      gap: 6px;
      flex-wrap: wrap;
      padding: 4px 6px;
    }

    .pill{
      display:inline-flex;
      align-items:center;
      border-radius: 4px;
      padding: 6px 10px;
      background: rgba(0,0,0,0.06);
      border: 2px solid rgba(0,0,0,0.15);
      font-weight: 900;
      font-size: 12px;
      color: rgba(0,0,0,0.8);
    }

    .hint{
      color: rgba(0,0,0,0.7);
      font-size: 12px;
      font-weight: 900;
    }

    /* =========================
       Minecraft Buttons
       ========================= */
    .meal-btn{
      padding: 10px 12px;
      border-radius: 4px;
      border: 3px solid var(--mc-border-dark);
      cursor: pointer;
      font-weight: 1000;
      letter-spacing: .2px;
      user-select: none;
      box-shadow: inset 0 2px 0 rgba(255,255,255,0.25);
      transition: transform .06s ease, filter .12s ease;
    }
    .meal-btn:active{ transform: translateY(1px); }
    .meal-btn:disabled{ opacity: .55; cursor: not-allowed; }

    .meal-btn.primary{
      background: linear-gradient(#4ad35a, #2a8b35);
      color: #0b1a0e;
    }

    .meal-btn.ghost{
      background: linear-gradient(#f2f2f2, #cfcfcf);
      color: #111;
    }

    .meal-btn.danger{
      background: linear-gradient(#ff6b6b, #c0392b);
      color: #1a0707;
    }

    /* =========================
       Cards / Grid (pixel-ish)
       ========================= */
    .choice-grid{
      display:grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
    }

    .choice-card{
      border: 3px solid var(--mc-border-dark);
      background: linear-gradient(#f7f7f7, #dcdcdc);
      border-radius: 6px;
      padding: 10px;
      cursor: pointer;
      text-align:left;
      box-shadow: inset 0 2px 0 rgba(255,255,255,0.22);
      transition: transform .1s ease, filter .12s ease;
    }
    .choice-card:hover{ filter: brightness(1.03); }
    .choice-card:active{ transform: translateY(1px); }
    .choice-card.active{
      outline: 3px solid rgba(61,187,74,0.8);
      outline-offset: 2px;
    }

    .choice-top{
      display:flex;
      align-items:center;
      gap: 10px;
      margin-bottom: 6px;
    }

    .choice-icon{
      width: 16px;
      height: 16px;
      border-radius: 2px;
      border: 2px solid rgba(0,0,0,0.35);
      box-shadow: inset 0 2px 0 rgba(255,255,255,0.2);
    }

    .choice-emoji{
      width: 26px;
      height: 26px;
      border-radius: 4px;
      display:flex;
      align-items:center;
      justify-content:center;
      background: rgba(0,0,0,0.06);
      border: 2px solid rgba(0,0,0,0.2);
      font-weight: 1000;
    }

    .choice-name{
      font-weight: 1000;
      color: #111;
    }
    .choice-meta{
      font-size: 12px;
      color: rgba(0,0,0,0.75);
      font-weight: 900;
    }

    .search-wrap{ margin-bottom: 10px; }
    .meal-input{
      width: 100%;
      border: 3px solid var(--mc-border-dark);
      border-radius: 6px;
      padding: 10px 10px;
      outline: none;
      font-weight: 900;
      background: #f4f4f4;
    }
    .meal-input:focus{
      box-shadow: 0 0 0 3px rgba(61,187,74,0.22);
    }

    .food-grid{
      display:grid;
      grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
      gap: 12px;
    }

    .food-card{
      border: 3px solid var(--mc-border-dark);
      background: linear-gradient(#f7f7f7, #dcdcdc);
      border-radius: 6px;
      padding: 10px;
      cursor: pointer;
      text-align:left;
      box-shadow: inset 0 2px 0 rgba(255,255,255,0.22);
      transition: transform .1s ease, filter .12s ease;
    }
    .food-card:hover{ filter: brightness(1.03); }
    .food-card:active{ transform: translateY(1px); }
    .food-card.active{
      outline: 3px solid rgba(61,187,74,0.8);
      outline-offset: 2px;
    }

    .food-card img{
      width: 100%;
      height: 130px;
      object-fit: cover;
      border-radius: 4px;
      display:block;
      border: 2px solid rgba(0,0,0,0.25);
      image-rendering: pixelated;
      background: #fff;
    }

    .food-name{
      margin-top: 8px;
      font-weight: 1000;
      color: #111;
      font-size: 13px;
    }

    .empty{
      grid-column: 1 / -1;
      padding: 12px;
      border-radius: 6px;
      border: 3px dashed rgba(0,0,0,0.35);
      background: rgba(255,255,255,0.55);
      font-weight: 900;
      color: rgba(0,0,0,0.8);
    }

    /* Stars */
    .stars-wrap{
      display:flex;
      flex-direction: column;
      align-items:center;
      gap: 6px;
      padding: 8px 0 0;
    }
    .stars{
      display:flex;
      gap: 8px;
    }
    .star-btn{
      border: 0;
      background: transparent;
      cursor: pointer;
      font-size: 30px;
      line-height: 1;
      font-weight: 1000;
      color: rgba(255, 215, 0, 0.95);
      text-shadow: 0 3px 0 rgba(0,0,0,0.25);
    }
    .stars-label{
      font-weight: 1000;
      color: rgba(0,0,0,0.78);
    }

    /* star pop effect */
    .pop-star{
      position:absolute;
      z-index: 2002;
      color: rgba(255,255,255,0.95);
      text-shadow: 0 4px 0 rgba(0,0,0,0.3);
      animation: popStar 900ms ease forwards;
      pointer-events:none;
      font-size: 18px;
    }
    @keyframes popStar{
      0%{ opacity: 0; transform: translate(-50%, -50%) scale(0.6); }
      20%{ opacity: 1; }
      100%{ opacity: 0; transform: translate(-50%, -120%) scale(1.4); }
    }

    .hidden{ display:none !important; }

    /* Make sure page behind doesn't scroll while modal open */
    body.meal-lock{
      overflow: hidden !important;
    }
  `;
  document.head.appendChild(style);
}


  // -----------------------------
  // 8) HELPERS
  // -----------------------------
  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function lighten(hex, amt) {
    // hex like "#rrggbb"
    const c = hex.replace("#", "");
    if (c.length !== 6) return hex;
    const r = parseInt(c.slice(0, 2), 16);
    const g = parseInt(c.slice(2, 4), 16);
    const b = parseInt(c.slice(4, 6), 16);
    const nr = Math.round(r + (255 - r) * amt);
    const ng = Math.round(g + (255 - g) * amt);
    const nb = Math.round(b + (255 - b) * amt);
    return `rgb(${nr},${ng},${nb})`;
  }

  function roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function waveRect(ctx, x, y, w, h, wave) {
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    for (let i = 0; i <= w; i += 8) {
      ctx.lineTo(x + i, y + h - (Math.sin(i / 10) * wave));
    }
    ctx.lineTo(x + w, y);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.fill();
  }
})();
