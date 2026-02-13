/* ask/static/ask/js/meal.js
   ============================================================
   ROMANTIC MEAL QUEST 🌹
   Generates PNG food images dynamically using canvas
   ============================================================ */

(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const openBtn = document.getElementById("openMealBtn"); 
    if (!openBtn) return;

    openBtn.addEventListener("click", openMealModal);
  });

  // ------------------------------------------------------------
  // FOOD DATA
  // ------------------------------------------------------------

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

  // ------------------------------------------------------------
  // CREATE MODAL
  // ------------------------------------------------------------

  function openMealModal() {
    if (document.getElementById("mealModal")) return;

    const modal = document.createElement("div");
    modal.id = "mealModal";
    modal.innerHTML = `
      <div class="meal-overlay"></div>
      <div class="meal-box">
        <h2 class="meal-title">Choose our romantic meal 💕</h2>
        <div class="meal-tabs"></div>
        <div class="meal-grid"></div>
        <div class="meal-confirm hidden">
          <h3 id="mealResult"></h3>
          <button id="closeMeal" class="meal-btn">Seal the Date 💖</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    injectStyles();
    renderTabs();
  }

  // ------------------------------------------------------------
  // RENDER TABS
  // ------------------------------------------------------------

  function renderTabs() {
    const tabs = document.querySelector(".meal-tabs");
    const grid = document.querySelector(".meal-grid");

    Object.keys(restaurants).forEach((key, index) => {
      const btn = document.createElement("button");
      btn.className = "meal-btn";
      btn.textContent = restaurants[key].name;

      btn.addEventListener("click", () => {
        document.querySelectorAll(".meal-btn").forEach(b => b.classList.remove("active"));
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

  // ------------------------------------------------------------
  // RENDER FOODS
  // ------------------------------------------------------------

  function renderFoods(key) {
    const grid = document.querySelector(".meal-grid");
    grid.innerHTML = "";

    restaurants[key].foods.forEach(food => {
      const card = document.createElement("div");
      card.className = "meal-card";

      const img = document.createElement("img");
      img.src = generateFoodPNG(food.name, food.color);

      const name = document.createElement("p");
      name.textContent = food.name;

      card.appendChild(img);
      card.appendChild(name);

      card.addEventListener("click", () => confirmMeal(food.name, restaurants[key].name));

      grid.appendChild(card);
    });
  }

  // ------------------------------------------------------------
  // GENERATE PNG USING CANVAS
  // ------------------------------------------------------------

  function generateFoodPNG(text, color) {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#fff0f5";
    ctx.fillRect(0, 0, 200, 200);

    // Food circle
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(100, 90, 60, 0, Math.PI * 2);
    ctx.fill();

    // Romantic glow
    ctx.shadowColor = "rgba(255,0,100,0.6)";
    ctx.shadowBlur = 20;
    ctx.fill();

    // Text
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#333";
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(text, 100, 170);

    return canvas.toDataURL("image/png");
  }

  // ------------------------------------------------------------
  // CONFIRMATION
  // ------------------------------------------------------------

  function confirmMeal(foodName, restaurantName) {
    document.querySelector(".meal-grid").classList.add("hidden");
    document.querySelector(".meal-tabs").classList.add("hidden");

    const confirmBox = document.querySelector(".meal-confirm");
    confirmBox.classList.remove("hidden");

    const result = document.getElementById("mealResult");
    result.textContent = `It's a date at ${restaurantName} for ${foodName}! 💘`;

    document.getElementById("closeMeal").addEventListener("click", () => {
      document.getElementById("mealModal").remove();
    });
  }

  // ------------------------------------------------------------
  // STYLES
  // ------------------------------------------------------------

  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .meal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.6);
        backdrop-filter: blur(4px);
      }

      .meal-box {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90%;
        max-width: 700px;
        background: white;
        border-radius: 20px;
        padding: 30px;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        animation: fadeIn 0.4s ease;
      }

      .meal-title {
        margin-bottom: 20px;
        font-size: 24px;
      }

      .meal-tabs {
        display: flex;
        justify-content: center;
        gap: 10px;
        flex-wrap: wrap;
        margin-bottom: 20px;
      }

      .meal-btn {
        padding: 8px 14px;
        border-radius: 20px;
        border: none;
        cursor: pointer;
        background: #ffccd5;
        transition: 0.3s;
      }

      .meal-btn.active,
      .meal-btn:hover {
        background: #ff4d6d;
        color: white;
      }

      .meal-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 15px;
      }

      .meal-card {
        background: #fff5f7;
        border-radius: 16px;
        padding: 10px;
        cursor: pointer;
        transition: 0.3s;
      }

      .meal-card:hover {
        transform: scale(1.05);
      }

      .meal-card img {
        width: 100%;
        border-radius: 12px;
      }

      .hidden {
        display: none;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translate(-50%, -45%); }
        to { opacity: 1; transform: translate(-50%, -50%); }
      }
    `;
    document.head.appendChild(style);
  }

})();
