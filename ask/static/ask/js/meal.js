/* ask/static/ask/js/meal.js
   ============================================================
   MINECRAFT MEAL QUEST (STEP-BY-STEP + SCROLLABLE + READABLE)
   Flow: Food Area -> Build Order -> After-Eating Place -> Stars -> Confirm -> Seal
   - Multi-select foods with quantity (cart)
   - Minecraft UI theme
   - Modal body scrolls (footer pinned)
   - Better contrast (confirm text readable)
   - Food order uses "order" then A->Z
   ============================================================ */

(() => {
  // -----------------------------
  // 1) DATA
  // -----------------------------
  const restaurants = {
    jollibee: {
      name: "Jollibee",
      theme: "#ff4d6d",
      foods: [
        // Chickenjoy / mains
        { name: "Chickenjoy (1pc)", tone: "#d35400", kind: "fried", order: 1 },
        { name: "Chickenjoy (2pc)", tone: "#d35400", kind: "fried", order: 2 },
        { name: "Chickenjoy (Bucket)", tone: "#d35400", kind: "fried", order: 3 },
        { name: "Chicken Sandwich", tone: "#e67e22", kind: "burger", order: 4 },
        { name: "Yumburger", tone: "#f39c12", kind: "burger", order: 5 },
        { name: "Cheesy Yumburger", tone: "#f1c40f", kind: "burger", order: 6 },
        { name: "Jolly Hotdog", tone: "#e74c3c", kind: "hotdog", order: 7 },
        { name: "Burger Steak (1pc)", tone: "#8e5c2c", kind: "steak", order: 8 },
        { name: "Burger Steak (2pc)", tone: "#8e5c2c", kind: "steak", order: 9 },

        // Pasta / noodles
        { name: "Jolly Spaghetti", tone: "#e74c3c", kind: "pasta", order: 10 },
        { name: "Palabok Fiesta", tone: "#c0392b", kind: "noodles", order: 11 },

        // Sides / add-ons
        { name: "Rice", tone: "#f4d03f", kind: "rice", order: 12 },
        { name: "Fries", tone: "#f39c12", kind: "fries", order: 13 },
        { name: "Mashed Potato", tone: "#f5cba7", kind: "side", order: 14 },

        // Desserts
        { name: "Peach Mango Pie", tone: "#f5b041", kind: "dessert", order: 15 },
        { name: "Sundae", tone: "#af7ac5", kind: "dessert", order: 16 },

        // Drinks
        { name: "Coke", tone: "#cb4335", kind: "drink", order: 17 },
        { name: "Sprite", tone: "#2ecc71", kind: "drink", order: 18 },
        { name: "Iced Tea", tone: "#5dade2", kind: "drink", order: 19 },
        { name: "Pineapple Juice", tone: "#f7dc6f", kind: "drink", order: 20 },

        // Breakfast (extra)
        { name: "Breakfast: Longganisa", tone: "#b03a2e", kind: "breakfast", order: 30 },
        { name: "Breakfast: Tapa", tone: "#6e2c00", kind: "breakfast", order: 31 }
      ]
    },

    mcdo: {
      name: "McDonald's",
      theme: "#f1c40f",
      foods: [
        // Burgers
        { name: "Big Mac", tone: "#f1c40f", kind: "burger", order: 1 },
        { name: "Quarter Pounder", tone: "#d35400", kind: "burger", order: 2 },
        { name: "McChicken", tone: "#f39c12", kind: "burger", order: 3 },
        { name: "Cheeseburger", tone: "#f4d03f", kind: "burger", order: 4 },
        { name: "Chicken Sandwich", tone: "#e67e22", kind: "burger", order: 5 },

        // Chicken
        { name: "McCrispy Chicken", tone: "#e67e22", kind: "fried", order: 6 },
        { name: "Chicken McNuggets (6pc)", tone: "#f39c12", kind: "fried", order: 7 },
        { name: "Chicken McNuggets (10pc)", tone: "#f39c12", kind: "fried", order: 8 },

        // Sides
        { name: "Regular Fries", tone: "#f39c12", kind: "fries", order: 9 },
        { name: "BFF Fries", tone: "#f39c12", kind: "fries", order: 10 },
        { name: "Apple Slices", tone: "#85c1e9", kind: "side", order: 11 },

        // Pasta
        { name: "McSpaghetti", tone: "#c0392b", kind: "pasta", order: 12 },

        // Desserts
        { name: "Sundae", tone: "#af7ac5", kind: "dessert", order: 13 },
        { name: "Apple Pie", tone: "#f5b041", kind: "dessert", order: 14 },
        { name: "McFlurry", tone: "#af7ac5", kind: "dessert", order: 15 },

        // Drinks
        { name: "Coke McFloat", tone: "#85c1e9", kind: "drink", order: 16 },
        { name: "Iced Coffee", tone: "#6e2c00", kind: "drink", order: 17 },
        { name: "Orange Juice", tone: "#f7dc6f", kind: "drink", order: 18 }
      ]
    },

    manginasal: {
      name: "Mang Inasal",
      theme: "#27ae60",
      foods: [
        // Mains
        { name: "PM1: Chicken Inasal (Pecho)", tone: "#a04000", kind: "grill", order: 1 },
        { name: "PM1: Chicken Inasal (Paa)", tone: "#935116", kind: "grill", order: 2 },
        { name: "Pork BBQ", tone: "#b03a2e", kind: "grill", order: 3 },
        { name: "Liempo", tone: "#6e2c00", kind: "grill", order: 4 },
        { name: "Pork Sisig", tone: "#8e5c2c", kind: "sisig", order: 5 },
        { name: "Bangus Sisig", tone: "#7f8c8d", kind: "sisig", order: 6 },

        // Sides
        { name: "Extra Rice", tone: "#f4d03f", kind: "rice", order: 7 },
        { name: "Chicken Soup", tone: "#f7dc6f", kind: "soup", order: 8 },

        // Desserts
        { name: "Halo-Halo", tone: "#af7ac5", kind: "dessert", order: 9 },
        { name: "Leche Flan", tone: "#f5cba7", kind: "dessert", order: 10 },

        // Drinks
        { name: "Iced Tea", tone: "#5dade2", kind: "drink", order: 11 },
        { name: "Softdrink", tone: "#85c1e9", kind: "drink", order: 12 }
      ]
    },

    chowking: {
      name: "Chowking",
      theme: "#e74c3c",
      foods: [
        // Rice / meals
        { name: "Chao Fan", tone: "#d68910", kind: "rice", order: 1 },
        { name: "Lauriat (Chicken)", tone: "#e67e22", kind: "meal", order: 2 },
        { name: "Sweet & Sour Pork", tone: "#cb4335", kind: "pork", order: 3 },

        // Noodles / soup
        { name: "Beef Wanton Mami", tone: "#a04000", kind: "noodles", order: 4 },
        { name: "La Paz Batchoy", tone: "#8e5c2c", kind: "noodles", order: 5 },

        // Dimsum
        { name: "Siomai", tone: "#f0b27a", kind: "dimsum", order: 6 },
        { name: "Siopao", tone: "#f5cba7", kind: "bun", order: 7 },

        // Desserts
        { name: "Halo-Halo", tone: "#af7ac5", kind: "dessert", order: 8 },
        { name: "Buchi", tone: "#f5b041", kind: "dessert", order: 9 },

        // Drinks
        { name: "Milk Tea", tone: "#d2b48c", kind: "drink", order: 10 },
        { name: "Iced Tea", tone: "#5dade2", kind: "drink", order: 11 }
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
    step: 1,
    restaurantKey: null,
    restaurantName: null,

    // NEW: cart of items instead of one food
    cart: {}, // { [foodName]: { name, qty } }

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
          <div class="meal-badge">MEAL QUEST</div>
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

        <div class="meal-body"></div>

        <div class="meal-footer">
          <button type="button" class="meal-btn ghost" id="mealBack">Back</button>
          <div class="meal-summary" id="mealSummary" aria-live="polite"></div>
          <button type="button" class="meal-btn primary" id="mealNext">Next</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.classList.add("meal-lock");
    injectStyles();

    modal.querySelector(".meal-overlay").addEventListener("click", () => closeMealModal());
    window.addEventListener("keydown", escClose);

    modal.querySelector("#mealBack").addEventListener("click", onBack);
    modal.querySelector("#mealNext").addEventListener("click", onNext);

    // reset state
    state.step = 1;
    state.restaurantKey = null;
    state.restaurantName = null;
    state.cart = {};
    state.afterPlace = null;
    state.stars = 5;

    render();

    function escClose(e) {
      if (e.key === "Escape") closeMealModal();
    }

    function closeMealModal() {
      const m = document.getElementById("mealModal");
      if (m) m.remove();
      document.body.classList.remove("meal-lock");
      window.removeEventListener("keydown", escClose);
    }
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
    if (state.step === 2) renderFoodStep(body);        // now: build order
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

    let ok = true;
    if (state.step === 1) ok = !!state.restaurantKey;
    if (state.step === 2) ok = cartCount() > 0; // NEW
    if (state.step === 3) ok = !!state.afterPlace;
    if (state.step === 4) ok = typeof state.stars === "number" && state.stars >= 1;

    next.disabled = !ok;
  }

  function updateSummary() {
    const el = document.getElementById("mealSummary");
    if (!el) return;

    const parts = [];
    if (state.restaurantName) parts.push(`<span class="pill">${escapeHtml(state.restaurantName)}</span>`);

    const cnt = cartCount();
    if (cnt > 0) parts.push(`<span class="pill">${cnt} item${cnt === 1 ? "" : "s"}</span>`);

    if (state.afterPlace) parts.push(`<span class="pill">${escapeHtml(state.afterPlace)}</span>`);
    if (state.step >= 4) parts.push(`<span class="pill">${starText(state.stars)}</span>`);

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

    // Seal
    const modal = document.getElementById("mealModal");
    if (!modal) return;

    const body = modal.querySelector(".meal-body");
    const footer = modal.querySelector(".meal-footer");
    if (!body) return;

    body.innerHTML = `
      <div class="final-wrap">
        <div class="final-title">It’s a date.</div>
        <div class="final-line"><span>Food Area:</span> <strong>${escapeHtml(state.restaurantName)}</strong></div>

        <div class="final-line"><span>Order:</span></div>
        <div class="final-list">${escapeHtml(orderText())}</div>

        <div class="final-line"><span>After:</span> <strong>${escapeHtml(state.afterPlace)}</strong></div>

        <div class="final-stars" id="finalStars">${starText(state.stars)}</div>

        <button class="meal-btn ghost inline" id="showStarsBtn" type="button">See the stars</button>
        <button class="meal-btn primary inline" id="closeMeal" type="button">Close</button>
      </div>
    `;

    if (footer) footer.classList.add("hidden");

    const showStarsBtn = document.getElementById("showStarsBtn");
    if (showStarsBtn) showStarsBtn.addEventListener("click", () => popStars(26));

    const closeBtn = document.getElementById("closeMeal");
    if (closeBtn) {
      closeBtn.addEventListener(
        "click",
        () => {
          const m = document.getElementById("mealModal");
          if (m) m.remove();
          document.body.classList.remove("meal-lock");
        },
        { once: true }
      );
    }
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
        <div class="choice-meta">${r.foods.length} items</div>
      `;

      if (state.restaurantKey === key) btn.classList.add("active");

      btn.addEventListener("click", () => {
        grid.querySelectorAll(".choice-card").forEach((c) => c.classList.remove("active"));
        btn.classList.add("active");

        state.restaurantKey = key;
        state.restaurantName = r.name;

        // reset downstream
        state.cart = {};
        state.afterPlace = null;
        state.stars = 5;

        updateFooterButtons();
        updateSummary();
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
      <h3 class="step-title">Build our order</h3>
      <p class="step-sub">Pick anything you want at <strong>${escapeHtml(r.name)}</strong> (you can choose multiple).</p>

      <div class="search-wrap">
        <input id="foodSearch" class="meal-input" type="text" placeholder="Search items..." autocomplete="off" />
      </div>

      <div class="cart-bar" id="cartBar">
        <div class="cart-left">
          <div class="cart-title">Your order</div>
          <div class="cart-sub" id="cartSub">Pick at least one item.</div>
        </div>
        <button class="meal-btn ghost cart-clear" id="cartClear" type="button">Clear</button>
      </div>

      <div class="cart-chips" id="cartChips" aria-label="Selected items"></div>

      <div class="food-grid" aria-label="Food choices"></div>
    `;

    const input = body.querySelector("#foodSearch");
    const grid = body.querySelector(".food-grid");
    const cartChips = body.querySelector("#cartChips");
    const cartSub = body.querySelector("#cartSub");
    const cartClear = body.querySelector("#cartClear");

    const foodsSorted = sortFoods(r.foods);

    const renderCart = () => {
      const items = Object.values(state.cart);
      const count = cartCount();
      cartSub.textContent = count ? `${count} item${count === 1 ? "" : "s"} selected` : "Pick at least one item.";

      cartChips.innerHTML = "";
      if (!items.length) {
        cartChips.innerHTML = `<div class="empty">No items yet. Tap foods below to add them.</div>`;
      } else {
        items.forEach((it) => {
          const chip = document.createElement("div");
          chip.className = "cart-chip";
          chip.innerHTML = `
            <div class="chip-name">${escapeHtml(it.name)}</div>

            <div class="qty">
              <button type="button" class="qty-btn" aria-label="Decrease">−</button>
              <div class="qty-num">${it.qty}</div>
              <button type="button" class="qty-btn" aria-label="Increase">+</button>
            </div>

            <button type="button" class="chip-x" aria-label="Remove">✕</button>
          `;

          const [minusBtn, plusBtn] = chip.querySelectorAll(".qty-btn");
          const xBtn = chip.querySelector(".chip-x");

          minusBtn.addEventListener("click", () => {
            it.qty = Math.max(1, (it.qty || 1) - 1);
            state.cart[it.name].qty = it.qty;
            renderCart();
            updateFooterButtons();
            updateSummary();
          });

          plusBtn.addEventListener("click", () => {
            it.qty = Math.min(9, (it.qty || 1) + 1);
            state.cart[it.name].qty = it.qty;
            renderCart();
            updateFooterButtons();
            updateSummary();
          });

          xBtn.addEventListener("click", () => {
            delete state.cart[it.name];
            renderCart();
            updateFooterButtons();
            updateSummary();
          });

          cartChips.appendChild(chip);
        });
      }
    };

    const toggleItem = (food) => {
      const key = food.name;
      if (state.cart[key]) {
        // remove
        delete state.cart[key];
      } else {
        // add with qty 1
        state.cart[key] = { name: food.name, qty: 1 };
      }
      renderCart();
      updateFooterButtons();
      updateSummary();
    };

    const renderList = (q) => {
      grid.innerHTML = "";
      const query = (q || "").trim().toLowerCase();

      foodsSorted
        .filter((f) => !query || f.name.toLowerCase().includes(query))
        .forEach((food) => {
          const card = document.createElement("button");
          card.type = "button";
          card.className = "food-card";
          if (state.cart[food.name]) card.classList.add("active");

          const imgSrc = food.img ? food.img : generateFoodPNG(food.name, food.tone, food.kind);

          card.innerHTML = `
            <img alt="${escapeHtml(food.name)}" src="${imgSrc}" />
            <div class="food-name">${escapeHtml(food.name)}</div>
            <div class="food-meta">${state.cart[food.name] ? "Added ✓" : "Tap to add"}</div>
          `;

          card.addEventListener("click", () => {
            toggleItem(food);
            // update visuals fast
            renderList(input.value);
          });

          grid.appendChild(card);
        });

      if (!grid.children.length) {
        grid.innerHTML = `<div class="empty">No matches. Try a different search.</div>`;
      }
    };

    cartClear.addEventListener("click", () => {
      state.cart = {};
      renderCart();
      renderList(input.value);
      updateFooterButtons();
      updateSummary();
    });

    renderCart();
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
          <div class="choice-emoji">✦</div>
          <div class="choice-name">${escapeHtml(p.name)}</div>
        </div>
        <div class="choice-meta">${escapeHtml(p.vibe)}</div>
      `;

      if (state.afterPlace === p.name) btn.classList.add("active");

      btn.addEventListener("click", () => {
        grid.querySelectorAll(".choice-card").forEach((c) => c.classList.remove("active"));
        btn.classList.add("active");

        state.afterPlace = p.name;
        updateFooterButtons();
        updateSummary();
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

      <button class="meal-btn ghost inline" id="seeStars" type="button">See the stars</button>
    `;

    const starsPick = body.querySelector("#starsPick");
    const label = body.querySelector("#starsLabel");
    const seeStars = body.querySelector("#seeStars");

    const labels = {
      1: "We can do better",
      2: "Not bad",
      3: "Cute",
      4: "Almost perfect",
      5: "Perfect"
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
          label.textContent = labels[i] || "";
          updateFooterButtons();
          updateSummary();
        });
        starsPick.appendChild(b);
      }
    };

    drawStars();
    label.textContent = labels[state.stars] || "";

    if (seeStars) seeStars.addEventListener("click", () => popStars(22));
  }

  function renderConfirmStep(body) {
    body.innerHTML = `
      <h3 class="step-title">Confirm</h3>
      <p class="step-sub">Here’s our plan:</p>

      <div class="mc-panel">
        <div class="mc-row"><span>Food Area</span><strong>${escapeHtml(state.restaurantName || "-")}</strong></div>
        <div class="mc-row"><span>Order</span><strong>${escapeHtml(orderText() || "-")}</strong></div>
        <div class="mc-row"><span>After</span><strong>${escapeHtml(state.afterPlace || "-")}</strong></div>
        <div class="mc-row"><span>Rating</span><strong class="stars-strong">${starText(state.stars)}</strong></div>
      </div>

      <p class="tiny-note">Hit <strong>Seal the Date</strong> to finish.</p>
    `;
  }

  // -----------------------------
  // 5) FOOD ORDERING
  // -----------------------------
  function sortFoods(list) {
    return [...list].sort((a, b) => {
      const ao = Number.isFinite(a.order) ? a.order : 9999;
      const bo = Number.isFinite(b.order) ? b.order : 9999;
      if (ao !== bo) return ao - bo;
      return String(a.name).localeCompare(String(b.name));
    });
  }

  function cartCount() {
    return Object.keys(state.cart || {}).length;
  }

  function orderText() {
    const items = Object.values(state.cart || {});
    if (!items.length) return "";
    // keep stable order by name
    items.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    return items
      .map((it) => (it.qty > 1 ? `${it.name} x${it.qty}` : it.name))
      .join(", ");
  }

  // -----------------------------
  // 6) FOOD IMAGE GENERATOR
  // -----------------------------
  function generateFoodPNG(text, tone, kind) {
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 220;

    const ctx = canvas.getContext("2d");

    // background
    roundRect(ctx, 0, 0, canvas.width, canvas.height, 12);
    ctx.fillStyle = "#f4eef2";
    ctx.fill();

    // plate
    ctx.save();
    ctx.translate(160, 110);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(0, 10, 110, 55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.08)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 10, 95, 45, 0, 0, Math.PI * 2);
    ctx.stroke();

    const base = tone || "#ff4d6d";
    if (kind === "burger") drawBurger(ctx, base);
    else if (kind === "pasta") drawPasta(ctx, base);
    else if (kind === "noodles") drawNoodles(ctx, base);
    else if (kind === "fried") drawFried(ctx, base);
    else if (kind === "fries") drawFries(ctx, base);
    else if (kind === "drink") drawDrink(ctx, base);
    else drawDefaultFood(ctx, base);

    ctx.restore();

    // label strip
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    roundRect(ctx, 14, 152, 292, 50, 10);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.08)";
    ctx.stroke();

    ctx.fillStyle = "#111";
    ctx.font = "900 14px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    const label = text.length > 28 ? text.slice(0, 28) + "…" : text;
    ctx.fillText(label, 24, 178);

    return canvas.toDataURL("image/png");
  }

  function drawBurger(ctx, base) {
    ctx.fillStyle = lighten(base, 0.35);
    roundRect(ctx, -70, -35, 140, 45, 18);
    ctx.fill();

    ctx.fillStyle = "#2ecc71";
    ctx.fillRect(-62, 6, 124, 10);

    ctx.fillStyle = "#6e2c00";
    roundRect(ctx, -62, 16, 124, 16, 8);
    ctx.fill();

    ctx.fillStyle = "#f1c40f";
    ctx.beginPath();
    ctx.moveTo(-40, 18);
    ctx.lineTo(40, 18);
    ctx.lineTo(25, 34);
    ctx.lineTo(-25, 34);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = lighten(base, 0.25);
    roundRect(ctx, -70, 32, 140, 24, 14);
    ctx.fill();
  }

  function drawPasta(ctx, base) {
    ctx.strokeStyle = lighten(base, 0.25);
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.moveTo(rand(-70, 70), rand(-5, 35));
      ctx.bezierCurveTo(rand(-80, 80), rand(-30, 50), rand(-80, 80), rand(-30, 50), rand(-70, 70), rand(-10, 40));
      ctx.stroke();
    }
    ctx.fillStyle = base;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.arc(rand(-65, 65), rand(-20, 35), rand(10, 16), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawNoodles(ctx, base) {
    ctx.strokeStyle = lighten(base, 0.35);
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    for (let i = 0; i < 14; i++) {
      ctx.beginPath();
      ctx.moveTo(-80, rand(-20, 35));
      ctx.quadraticCurveTo(rand(-20, 20), rand(-40, 50), 80, rand(-20, 35));
      ctx.stroke();
    }
    ctx.fillStyle = base;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(rand(-55, 55), rand(-15, 30), rand(10, 14), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawFried(ctx, base) {
    ctx.fillStyle = lighten(base, 0.15);
    for (let i = 0; i < 6; i++) {
      roundRect(ctx, rand(-70, 40), rand(-10, 35), rand(40, 70), rand(22, 36), 14);
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

  function drawDrink(ctx, base) {
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    roundRect(ctx, -30, -45, 60, 95, 12);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.10)";
    ctx.stroke();

    ctx.fillStyle = base;
    roundRect(ctx, -26, -5, 52, 50, 10);
    ctx.fill();
  }

  function drawDefaultFood(ctx, base) {
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.ellipse(0, 10, 65, 35, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // -----------------------------
  // 7) STARS FX
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
      s.style.transform = `translate(-50%, -50%) scale(${rand(0.9, 1.6)})`;
      s.style.animationDuration = `${rand(700, 1200)}ms`;
      modal.appendChild(s);
      setTimeout(() => s.remove(), 1400);
    }
  }

  function starText(n) {
    const full = "★".repeat(Math.max(0, Math.min(5, n)));
    const empty = "☆".repeat(Math.max(0, 5 - n));
    return `${full}${empty}`;
  }

  // -----------------------------
  // 8) MINECRAFT STYLES + SCROLL FIX
  // -----------------------------
  function injectStyles() {
    if (document.getElementById("mealQuestStyles")) return;

    const style = document.createElement("style");
    style.id = "mealQuestStyles";
    style.textContent = `
      #mealModal{
        position: fixed;
        inset: 0;
        z-index: 2000;
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

      body.meal-lock{ overflow: hidden !important; }

      .mc-ui{
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial;
        image-rendering: pixelated;

        --mc-border-dark: #1f1f1f;
        --mc-border-mid: #3a3a3a;
        --mc-border-light: #bfbfbf;
        --mc-panel: #d9d9d9;
        --mc-panel-2: #cfcfcf;
        --mc-accent: #3dbb4a;
        --mc-accent-2: #2a8b35;
        --mc-text: #101010;
      }

      .meal-box{
        position: relative;
        z-index: 2001;
        margin: 18px auto;
        width: min(920px, 96vw);

        max-height: calc(100vh - 36px);
        display: flex;
        flex-direction: column;

        background: var(--mc-panel);
        border-radius: 6px;
        border: 4px solid var(--mc-border-dark);
        box-shadow:
          0 0 0 2px var(--mc-border-mid),
          0 0 0 4px var(--mc-border-light),
          0 20px 70px rgba(0,0,0,0.45);
        overflow: hidden;
      }

      .meal-head{
        padding: 14px 16px 12px;
        background:
          repeating-linear-gradient(
            90deg,
            rgba(0,0,0,0.05) 0,
            rgba(0,0,0,0.05) 10px,
            rgba(255,255,255,0.06) 10px,
            rgba(255,255,255,0.06) 20px
          ),
          var(--mc-panel-2);
        border-bottom: 4px solid var(--mc-border-dark);
        box-shadow: inset 0 2px 0 rgba(255,255,255,0.35);
      }

      .meal-badge{
        font-weight: 1000;
        font-size: 12px;
        letter-spacing: .16em;
        text-transform: uppercase;
        color: rgba(0,0,0,0.78);
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
        font-weight: 900;
        color: rgba(0,0,0,0.78);
      }

      .meal-progress{
        display:flex;
        gap: 8px;
        margin-top: 10px;
      }
      .meal-progress .dot{
        width: 10px;
        height: 10px;
        border-radius: 2px;
        background: rgba(0,0,0,0.22);
        box-shadow: inset 0 2px 0 rgba(255,255,255,0.25);
      }
      .meal-progress .dot.done{ background: rgba(61,187,74,0.55); }
      .meal-progress .dot.active{ background: rgba(61,187,74,0.95); }

      .meal-body{
        padding: 14px 16px 10px;
        overflow: auto;
        -webkit-overflow-scrolling: touch;
        flex: 1;
        background:
          radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px) 0 0/12px 12px,
          #e7e7e7;
      }

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
        border-radius: 4px;
        padding: 6px 10px;
        background: rgba(255,255,255,0.55);
        border: 2px solid rgba(0,0,0,0.20);
        font-weight: 1000;
        font-size: 12px;
        color: rgba(0,0,0,0.88);
      }
      .hint{
        color: rgba(0,0,0,0.75);
        font-size: 12px;
        font-weight: 1000;
      }

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
        color: #111;
        white-space: nowrap;
      }
      .meal-btn:active{ transform: translateY(1px); }
      .meal-btn:disabled{ opacity: .55; cursor: not-allowed; }

      .meal-btn.primary{
        background: linear-gradient(#4ad35a, #2a8b35);
        color: #071409;
      }
      .meal-btn.ghost{
        background: linear-gradient(#f2f2f2, #cfcfcf);
        color: #111;
      }
      .meal-btn.inline{ margin-top: 10px; }

      .step-title{
        margin: 0 0 6px;
        font-size: 18px;
        color: #111;
        font-weight: 1000;
      }
      .step-sub{
        margin: 0 0 12px;
        font-size: 12px;
        font-weight: 900;
        color: rgba(0,0,0,0.80);
      }

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
      }
      .choice-card.active{
        outline: 3px solid rgba(61,187,74,0.85);
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
        background: rgba(255,255,255,0.55);
        border: 2px solid rgba(0,0,0,0.2);
        font-weight: 1000;
        color: #111;
      }

      .choice-name{
        font-weight: 1000;
        color: #111;
      }
      .choice-meta{
        font-size: 12px;
        color: rgba(0,0,0,0.78);
        font-weight: 1000;
      }

      .search-wrap{ margin-bottom: 10px; }
      .meal-input{
        width: 100%;
        border: 3px solid var(--mc-border-dark);
        border-radius: 6px;
        padding: 10px 10px;
        outline: none;
        font-weight: 1000;
        background: #f4f4f4;
        color: #111;
      }
      .meal-input::placeholder{ color: rgba(0,0,0,0.55); }

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
      }
      .food-card.active{
        outline: 3px solid rgba(61,187,74,0.85);
        outline-offset: 2px;
      }

      .food-card img{
        width: 100%;
        height: 130px;
        object-fit: cover;
        border-radius: 4px;
        display:block;
        border: 2px solid rgba(0,0,0,0.25);
        background: #fff;
      }

      .food-name{
        margin-top: 8px;
        font-weight: 1000;
        color: #111;
        font-size: 13px;
      }
      .food-meta{
        margin-top: 4px;
        font-size: 12px;
        font-weight: 1000;
        color: rgba(0,0,0,0.72);
      }

      .empty{
        grid-column: 1 / -1;
        padding: 12px;
        border-radius: 6px;
        border: 3px dashed rgba(0,0,0,0.35);
        background: rgba(255,255,255,0.55);
        font-weight: 1000;
        color: rgba(0,0,0,0.85);
      }

      /* Cart UI */
      .cart-bar{
        display:flex;
        align-items:center;
        justify-content: space-between;
        gap: 10px;
        margin: 10px 0 8px;
        padding: 10px;
        border-radius: 6px;
        border: 3px solid var(--mc-border-dark);
        background: rgba(255,255,255,0.60);
      }
      .cart-title{
        font-weight: 1000;
        color:#111;
        margin-bottom: 2px;
      }
      .cart-sub{
        font-weight: 1000;
        font-size: 12px;
        color: rgba(0,0,0,0.75);
      }
      .cart-clear{
        padding: 8px 10px;
      }
      .cart-chips{
        display:flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 12px;
      }
      .cart-chip{
        display:flex;
        align-items:center;
        justify-content: space-between;
        gap: 10px;
        padding: 10px;
        border-radius: 6px;
        border: 3px solid var(--mc-border-dark);
        background: rgba(255,255,255,0.70);
      }
      .chip-name{
        flex: 1;
        font-weight: 1000;
        color:#111;
      }
      .qty{
        display:flex;
        align-items:center;
        gap: 6px;
      }
      .qty-btn{
        border: 3px solid var(--mc-border-dark);
        border-radius: 6px;
        background: linear-gradient(#f2f2f2, #cfcfcf);
        font-weight: 1000;
        padding: 6px 10px;
        cursor: pointer;
      }
      .qty-num{
        min-width: 18px;
        text-align:center;
        font-weight: 1000;
        color:#111;
      }
      .chip-x{
        border: 3px solid var(--mc-border-dark);
        border-radius: 6px;
        background: linear-gradient(#f7f7f7, #dcdcdc);
        font-weight: 1000;
        padding: 6px 10px;
        cursor: pointer;
      }

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
        color: rgba(0,0,0,0.85);
      }

      .mc-panel{
        border: 3px solid var(--mc-border-dark);
        border-radius: 6px;
        background: rgba(255,255,255,0.60);
        padding: 10px;
      }
      .mc-row{
        display:flex;
        justify-content: space-between;
        gap: 12px;
        padding: 8px 6px;
        border-bottom: 2px dashed rgba(0,0,0,0.18);
      }
      .mc-row:last-child{ border-bottom: 0; }

      .mc-row span{
        font-weight: 1000;
        color: rgba(0,0,0,0.78);
      }
      .mc-row strong{
        font-weight: 1000;
        color: rgba(0,0,0,0.92);
      }
      .stars-strong{
        letter-spacing: 1px;
        color: rgba(255, 215, 0, 0.95);
        text-shadow: 0 3px 0 rgba(0,0,0,0.25);
      }

      .tiny-note{
        margin-top: 12px;
        font-size: 12px;
        font-weight: 1000;
        color: rgba(0,0,0,0.85);
      }

      .final-wrap{
        padding: 8px 6px 4px;
        text-align:center;
        color: #111;
      }
      .final-title{
        font-size: 20px;
        font-weight: 1000;
        margin-bottom: 8px;
      }
      .final-line{
        font-weight: 1000;
        color: rgba(0,0,0,0.85);
        margin: 6px 0;
      }
      .final-line span{ color: rgba(0,0,0,0.75); }

      .final-list{
        margin: 8px auto 10px;
        padding: 10px;
        border-radius: 6px;
        border: 3px solid var(--mc-border-dark);
        background: rgba(255,255,255,0.70);
        max-width: 720px;
        font-weight: 1000;
        color: rgba(0,0,0,0.88);
        word-wrap: break-word;
      }

      .final-stars{
        font-size: 28px;
        font-weight: 1000;
        margin: 12px 0 10px;
        color: rgba(255, 215, 0, 0.95);
        text-shadow: 0 3px 0 rgba(0,0,0,0.25);
      }

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
    `;
    document.head.appendChild(style);
  }

  // -----------------------------
  // 9) HELPERS
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
    const c = String(hex || "").replace("#", "");
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
})();

/* =====================================
   GIFT REVEAL LOGIC
===================================== */

(function() {
  const seeStarsBtn = document.querySelector("#seeStarsBtn"); // make sure id matches
  const giftStage = document.getElementById("giftStage");
  const giftBox = document.getElementById("giftBox");
  const flowerReveal = document.getElementById("flowerReveal");

  if (!giftBox) return;

  let clickCount = 0;
  const requiredClicks = 6;

  // When she clicks "See the stars"
  if (seeStarsBtn) {
    seeStarsBtn.addEventListener("click", () => {
      giftStage.classList.remove("hidden");
      seeStarsBtn.style.display = "none";
    });
  }

  giftBox.addEventListener("click", () => {
    if (giftBox.classList.contains("open")) return;

    clickCount++;

    giftBox.classList.add("shake");
    setTimeout(() => giftBox.classList.remove("shake"), 250);

    if (clickCount >= requiredClicks) {
      openGift();
    }
  });

  function openGift() {
    giftBox.classList.add("open");

    setTimeout(() => {
      flowerReveal.classList.remove("hidden");
      createFlowers();
    }, 600);
  }

  function createFlowers() {
    flowerReveal.innerHTML = "";

    for (let i = 0; i < 5; i++) {
      const flower = document.createElement("div");
      flower.className = "flower";

      flower.innerHTML = `
        <div class="flower-head"></div>
        <div class="flower-stem"></div>
      `;

      flowerReveal.appendChild(flower);
    }
  }
})();
