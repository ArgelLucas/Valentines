/* ask/static/ask/js/meal.js
   ============================================================
   ROMANTIC MEAL QUEST 🌹
   Generates PNG food images dynamically using canvas
   - Opens via button OR via CustomEvent("openMealQuest")
   ============================================================ */

(() => {
  const restaurants = {
    jollibee: {
      name: "Jollibee",
      foods: [
        { name: "Chickenjoy", color: "#d35400" },
        { name: "Jolly Spaghetti", color: "#e74c3c" },
        { name: "Burger Steak", color: "#8e5c2c" }
      ]
    },
    mcdo: {
      name: "McDonald's",
      foods: [
        { name: "Big Mac", color: "#f1c40f" },
        { name: "McSpaghetti", color: "#c0392b" },
        { name: "Fries", color: "#f39c12" }
      ]
    },
    manginasal: {
      name: "Mang Inasal",
      foods: [
        { name: "Pecho", color: "#a04000" },
        { name: "Paa", color: "#935116" },
        { name: "Halo-Halo", color: "#af7ac5" }
      ]
    },
    chowking: {
      name: "Chowking",
      foods: [
        { name: "Chao Fan", color: "#d68910" },
        { name: "Siopao", color: "#f5cba7" },
        { name: "Sweet & Sour Pork", color: "#cb4335" }
      ]
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    const openBtn = document.getElementById("openMealBtn");
    if (openBtn) openBtn.addEventListener("click", openMealModal);
  });

  window.addEventListener("openMealQuest", () => {
    openMealModal();
  });

  function openMealModal() {
    if (document.getElementById("mealModal")) return;

    const modal = document.createElement("div");
    modal.id = "mealModal";
    modal.innerHTML = `
      <div class="meal-overlay" aria-hidden="true"></div>
      <div class="meal-box" role="dialog" aria-label="Choose a meal">
        <h2 class="meal-title">Choose our meal date 💕</h2>
        <p class="meal-subtitle">Pick the place + food… and I’ll handle the rest. ✨</p>

        <div class="meal-tabs" role="tablist" aria-label="Restaurants"></div>
        <div class="meal-grid" aria-label="Food choices"></div>

        <div class="meal-confirm hidden" aria-live="polite">
          <h3 id="mealResult"></h3>
          <button id="closeMeal" class="meal-btn meal-close">Seal the Date 💖</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    injectStyles();
    renderTabs();

    modal.querySelector(".meal-overlay").addEventListener("click", () => modal.remove());

    window.addEventListener("keydown", function esc(e){
      if (e.key === "Escape") {
        const m = document.getElementById("mealModal");
        if (m) m.remove();
        window.removeEventListener("keydown", esc);
      }
    });
  }

  function renderTabs() {
    const tabs = document.querySelector(".meal-tabs");
    if (!tabs) return;
    tabs.innerHTML = "";

    Object.keys(restaurants).forEach((key, index) => {
      const btn = document.createElement("button");
      btn.className = "meal-btn meal-tab";
      btn.type = "button";
      btn.textContent = restaurants[key].name;

      btn.addEventListener("click", () => {
        tabs.querySelectorAll(".meal-tab").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderFoods(key);
      });

      tabs.appendChild(btn);

      if (index === 0) {
        btn.classList.add("active");
        renderFoods(key);
      }
    });
  }

  function renderFoods(key) {
    const grid = document.querySelector(".meal-grid");
    if (!grid) return;
    grid.innerHTML = "";

    restaurants[key].foods.forEach(food => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "meal-card";

      const img = document.createElement("img");
      img.alt = food.name;
      img.src = generateFoodPNG(food.name, food.color);

      const name = document.createElement("p");
      name.textContent = food.name;

      card.appendChild(img);
      card.appendChild(name);

      card.addEventListener("click", () => {
        card.classList.add("picked");
        setTimeout(() => confirmMeal(food.name, restaurants[key].name), 160);
      });

      grid.appendChild(card);
    });
  }

  function generateFoodPNG(text, color) {
    const canvas = document.createElement("canvas");
    canvas.width = 220;
    canvas.height = 220;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#fff0f5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const vg = ctx.createRadialGradient(110, 95, 40, 110, 110, 130);
    vg.addColorStop(0, "rgba(255,255,255,0)");
    vg.addColorStop(1, "rgba(0,0,0,0.08)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.shadowColor = "rgba(255,0,100,0.55)";
    ctx.shadowBlur = 18;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(110, 96, 62, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.beginPath();
    ctx.arc(132, 78, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#2f2f2f";
    ctx.font = "bold 18px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const label = text.length > 14 ? text.slice(0, 14) + "…" : text;
    ctx.fillText(label, 110, 182);

    return canvas.toDataURL("image/png");
  }

  function confirmMeal(foodName, restaurantName) {
    const grid = document.querySelector(".meal-grid");
    const tabs = document.querySelector(".meal-tabs");
    const confirmBox = document.querySelector(".meal-confirm");

    if (grid) grid.classList.add("hidden");
    if (tabs) tabs.classList.add("hidden");
    if (confirmBox) confirmBox.classList.remove("hidden");

    const result = document.getElementById("mealResult");
    if (result) result.textContent = `It’s a date at ${restaurantName} — ${foodName}. 💘`;

    const closeBtn = document.getElementById("closeMeal");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        const modal = document.getElementById("mealModal");
        if (modal) modal.remove();
      }, { once: true });
    }
  }

  function injectStyles() {
    if (document.getElementById("mealQuestStyles")) return;

    const style = document.createElement("style");
    style.id = "mealQuestStyles";
    style.textContent = `
      .meal-overlay{
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.62);
        backdrop-filter: blur(4px);
      }

      .meal-box{
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: min(740px, 92vw);
        background: #fff;
        border-radius: 18px;
        padding: 26px 22px 22px;
        text-align: center;
        box-shadow: 0 20px 70px rgba(0,0,0,0.35);
        animation: fadeIn .28s ease;
      }

      .meal-title{
        margin: 0 0 6px;
        font-size: 24px;
        letter-spacing: .2px;
      }
      .meal-subtitle{
        margin: 0 0 16px;
        font-size: 13px;
        opacity: .75;
      }

      .meal-tabs{
        display:flex;
        justify-content:center;
        gap:10px;
        flex-wrap:wrap;
        margin-bottom: 16px;
      }

      .meal-btn{
        padding: 8px 14px;
        border-radius: 999px;
        border: 0;
        cursor: pointer;
        background: #ffccd5;
        transition: transform .12s ease, filter .15s ease, background .2s ease;
        font-weight: 800;
      }

      .meal-btn:hover{ filter: brightness(1.03); }
      .meal-btn:active{ transform: translateY(1px); }

      .meal-tab.active{
        background:#ff4d6d;
        color:#fff;
      }

      .meal-grid{
        display:grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 14px;
      }

      .meal-card{
        border:0;
        background:#fff5f7;
        border-radius:16px;
        padding:10px;
        cursor:pointer;
        transition: transform .18s ease, filter .18s ease;
        text-align:left;
      }
      .meal-card:hover{
        transform: translateY(-2px) scale(1.02);
        filter: brightness(1.01);
      }
      .meal-card.picked{
        transform: scale(.98);
        filter: brightness(.98);
      }
      .meal-card img{
        width:100%;
        border-radius:12px;
        display:block;
      }
      .meal-card p{
        margin: 8px 6px 2px;
        font-weight: 800;
        letter-spacing: .2px;
        color:#333;
      }

      .meal-confirm h3{
        margin: 16px 0 12px;
        font-size: 18px;
      }

      .meal-close{
        background:#ff4d6d;
        color:#fff;
        padding: 10px 16px;
      }

      .hidden{ display:none; }

      @keyframes fadeIn{
        from{ opacity:0; transform: translate(-50%, -48%); }
        to{ opacity:1; transform: translate(-50%, -50%); }
      }
    `;
    document.head.appendChild(style);
  }
})();
