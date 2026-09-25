(() => {
  "use strict";

  // ── Inställningar ────────────────────────────────────────────
  const CONFIG = {
    columns: 10,
    mainCells: 100,       // 100 cirklar = 100 % av dagsmålet
    overflowCells: 30,    // extra cirklar för överskott (upp till 130 %)
    // "up":   fyll nedifrån och upp, överskottet ligger ovanför målstrecket.
    // "down": fyll uppifrån och ned, överskottet ligger under målstrecket.
    fillDirection: "up",
    proteinPerKg: 1.2,
    defaultWeightKg: 70,
  };

  // Färger som tillagda livsmedel får, i tur och ordning.
  const PALETTE = ["#3DAE7E", "#7EA6F2", "#F2BE4A", "#EE8A6A", "#A58BD9", "#4DBDC6", "#E484B3", "#96C25A"];

  const STORAGE_KEY = "proteinbalans:v1";
  const TOTAL_CELLS = CONFIG.mainCells + CONFIG.overflowCells;

  const FOODS = window.FOODS || [];
  const CATEGORIES = window.CATEGORIES || [];
  const foodById = new Map(FOODS.map((f) => [f.id, f]));

  // ── Tillstånd ────────────────────────────────────────────────
  // items: [{ id, count, color }] i den ordning de lades till.
  const state = loadState();
  const view = { category: "alla", query: "" };

  function loadState() {
    const fallback = { weightKg: CONFIG.defaultWeightKg, items: [] };
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!saved) return fallback;
      return {
        weightKg: Number(saved.weightKg) > 0 ? Number(saved.weightKg) : fallback.weightKg,
        items: Array.isArray(saved.items) ? saved.items.filter((i) => foodById.has(i.id) && i.count > 0) : [],
      };
    } catch {
      return fallback;
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Lagring är inte nödvändig för att sidan ska fungera.
    }
  }

  // ── Beräkningar ──────────────────────────────────────────────
  function proteinPerPortion(food) {
    if (food.ingredients) {
      return food.ingredients.reduce((sum, ing) => sum + (ing.grams * ing.proteinPer100g) / 100, 0);
    }
    return (food.grams * food.proteinPer100g) / 100;
  }

  const goalGrams = () => Math.round(state.weightKg * CONFIG.proteinPerKg);

  function totalProtein() {
    return state.items.reduce((sum, item) => sum + proteinPerPortion(foodById.get(item.id)) * item.count, 0);
  }

  // Avrundar den ackumulerade summan (inte varje livsmedel för sig) så att
  // små bidrag inte försvinner och summan av cirklar stämmer med totalen.
  function computeFills() {
    const fills = new Array(TOTAL_CELLS).fill(null);
    const goal = goalGrams();
    let cumulative = 0;
    for (const item of state.items) {
      const pct = (proteinPerPortion(foodById.get(item.id)) * item.count * 100) / goal;
      const start = Math.round(cumulative);
      cumulative += pct;
      const end = Math.min(Math.round(cumulative), TOTAL_CELLS);
      for (let i = start; i < end; i++) fills[i] = item.color;
    }
    return fills;
  }

  function nextColor() {
    const used = new Set(state.items.map((i) => i.color));
    return PALETTE.find((c) => !used.has(c)) || PALETTE[state.items.length % PALETTE.length];
  }

  const fmt = (n) => n.toLocaleString("sv-SE", { maximumFractionDigits: 1 });

  // ── Åtgärder ─────────────────────────────────────────────────
  function addFood(id) {
    if (!foodById.has(id)) return;
    const existing = state.items.find((i) => i.id === id);
    if (existing) existing.count += 1;
    else state.items.push({ id, count: 1, color: nextColor() });
    saveState();
    render({ highlightId: id });
  }

  function removeOne(id) {
    const idx = state.items.findIndex((i) => i.id === id);
    if (idx === -1) return;
    state.items[idx].count -= 1;
    if (state.items[idx].count <= 0) state.items.splice(idx, 1);
    saveState();
    render();
  }

  function clearAll() {
    state.items = [];
    saveState();
    render();
  }

  // ── DOM ──────────────────────────────────────────────────────
  const $ = (id) => document.getElementById(id);
  const el = {
    grid: $("grid"),
    gridOverflow: $("grid-overflow"),
    percent: $("stat-percent"),
    grams: $("stat-grams"),
    rest: $("stat-rest"),
    goalPill: $("goal-pill-text"),
    chips: $("chips"),
    chipsEmpty: $("chips-empty"),
    clearAll: $("clear-all"),
    filters: $("filters"),
    search: $("search"),
    foodList: $("food-list"),
    foodEmpty: $("food-empty"),
    goalPanel: $("goal-panel"),
    dropzone: $("dropzone"),
  };

  // Bygger ett block med cirklar och returnerar dem i fyllnadsordning.
  function buildBlock(count, className, bottomUp) {
    const block = document.createElement("div");
    block.className = `cell-block ${className}`;
    const rows = Math.ceil(count / CONFIG.columns);
    const domCells = [];
    for (let i = 0; i < count; i++) {
      const cell = document.createElement("span");
      cell.className = "cell";
      block.appendChild(cell);
      domCells.push(cell);
    }
    const ordered = [];
    for (let k = 0; k < count; k++) {
      const rowFromStart = Math.floor(k / CONFIG.columns);
      const col = k % CONFIG.columns;
      const row = bottomUp ? rows - 1 - rowFromStart : rowFromStart;
      ordered.push(domCells[row * CONFIG.columns + col]);
    }
    return { block, ordered };
  }

  let cells = [];
  let lastFills = [];

  function buildGrid() {
    const up = CONFIG.fillDirection === "up";
    const main = buildBlock(CONFIG.mainCells, "main-block", up);
    const over = buildBlock(CONFIG.overflowCells, "overflow-block", up);

    const line = document.createElement("div");
    line.className = "goal-line";
    line.innerHTML = "<span>100 % · Dagsmålet</span>";

    el.grid.style.setProperty("--cols", CONFIG.columns);
    el.grid.replaceChildren(...(up ? [over.block, line, main.block] : [main.block, line, over.block]));
    cells = [...main.ordered, ...over.ordered];
    lastFills = new Array(TOTAL_CELLS).fill(null);
  }

  function renderGrid() {
    const fills = computeFills();
    let newIndex = 0;
    fills.forEach((color, i) => {
      if (color === lastFills[i]) return;
      const cell = cells[i];
      if (color) {
        cell.style.setProperty("--fill", color);
        cell.classList.add("filled");
        if (!lastFills[i]) {
          cell.classList.remove("pop");
          void cell.offsetWidth; // starta om animationen
          cell.style.animationDelay = `${Math.min(newIndex++ * 12, 600)}ms`;
          cell.classList.add("pop");
        }
      } else {
        cell.classList.remove("filled", "pop");
        cell.style.removeProperty("--fill");
      }
    });
    lastFills = fills;
  }

  function renderStats() {
    const goal = goalGrams();
    const total = totalProtein();
    const pct = (total / goal) * 100;
    el.percent.textContent = Math.round(pct);
    el.grams.textContent = `${fmt(total)} av ${goal} g protein`;
    el.goalPill.textContent = `${goal} g protein`;

    const diff = goal - total;
    if (diff > 0.05) el.rest.textContent = `${fmt(diff)} g kvar till ditt mål`;
    else if (diff < -0.05) el.rest.textContent = `Målet nått! ${fmt(-diff)} g över`;
    else el.rest.textContent = "Målet nått!";

    const beyond = Math.round(pct) - TOTAL_CELLS;
    el.gridOverflow.hidden = beyond <= 0;
    if (beyond > 0) el.gridOverflow.textContent = `+${beyond} % utöver skalan`;
  }

  function renderChips(highlightId) {
    el.chips.replaceChildren(
      ...state.items.map((item) => {
        const food = foodById.get(item.id);
        const grams = proteinPerPortion(food) * item.count;
        const li = document.createElement("li");
        li.className = "chip";
        if (item.id === highlightId) li.classList.add("flash");
        li.innerHTML = `
          <span class="dot" style="background:${item.color}"></span>
          <span class="chip-text"></span>
          <button type="button" class="chip-remove" aria-label="Ta bort en portion ${food.name}" title="Ta bort en portion">×</button>`;
        li.querySelector(".chip-text").textContent =
          `${food.name}${item.count > 1 ? ` ×${item.count}` : ""} · ${fmt(grams)} g`;
        li.querySelector(".chip-remove").addEventListener("click", () => removeOne(item.id));
        return li;
      })
    );
    const empty = state.items.length === 0;
    el.chipsEmpty.hidden = !empty;
    el.clearAll.hidden = empty;
  }

  function renderFilters() {
    el.filters.replaceChildren(
      ...CATEGORIES.map((cat) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "filter";
        b.textContent = cat.label;
        b.setAttribute("aria-pressed", String(cat.id === view.category));
        b.addEventListener("click", () => {
          view.category = cat.id;
          renderFilters();
          renderFoods();
        });
        return b;
      })
    );
  }

  function matchesView(food) {
    if (view.category !== "alla" && food.category !== view.category) return false;
    if (!view.query) return true;
    const hay = `${food.name} ${food.slvName || ""}`.toLowerCase();
    return hay.includes(view.query);
  }

  function renderFoods() {
    const visible = FOODS.filter(matchesView);
    el.foodList.replaceChildren(
      ...visible.map((food) => {
        const li = document.createElement("li");
        li.className = "food-card";
        li.dataset.id = food.id;
        li.innerHTML = `
          <div class="food-image" aria-hidden="true"></div>
          <div class="food-info">
            <div class="food-name"></div>
            <div class="food-portion"></div>
            <span class="pill pill-protein"></span>
          </div>
          <button type="button" class="add-btn">+</button>`;
        li.querySelector(".food-image").textContent = food.emoji || "🍽️";
        li.querySelector(".food-name").textContent = food.name;
        li.querySelector(".food-portion").textContent = food.portion;
        li.querySelector(".pill-protein").textContent = `${fmt(proteinPerPortion(food))} g protein`;
        const add = li.querySelector(".add-btn");
        add.setAttribute("aria-label", `Lägg till ${food.name}`);
        add.addEventListener("click", () => addFood(food.id));
        return li;
      })
    );
    el.foodEmpty.hidden = visible.length > 0;
  }

  function render({ highlightId } = {}) {
    renderGrid();
    renderStats();
    renderChips(highlightId);
  }

  // ── Dra och släpp (Pointer Events: mus och touch) ────────────
  const LONG_PRESS_MS = 280;
  const MOVE_THRESHOLD = 8;
  let drag = null;

  function onPointerDown(e) {
    const card = e.target.closest(".food-card");
    if (!card || e.target.closest(".add-btn") || e.button !== 0) return;
    drag = {
      id: card.dataset.id,
      card,
      pointerId: e.pointerId,
      isMouse: e.pointerType === "mouse",
      startX: e.clientX,
      startY: e.clientY,
      active: false,
      ghost: null,
      timer: null,
    };
    // På touch krävs ett långt tryck så att listan fortfarande går att scrolla.
    if (!drag.isMouse) {
      drag.timer = setTimeout(() => startDrag(drag.startX, drag.startY), LONG_PRESS_MS);
    }
  }

  function startDrag(x, y) {
    if (!drag || drag.active) return;
    drag.active = true;
    const food = foodById.get(drag.id);
    const ghost = document.createElement("div");
    ghost.className = "drag-ghost";
    ghost.innerHTML = `<span class="ghost-emoji"></span><span class="ghost-name"></span>`;
    ghost.querySelector(".ghost-emoji").textContent = food.emoji || "🍽️";
    ghost.querySelector(".ghost-name").textContent = food.name;
    document.body.appendChild(ghost);
    drag.ghost = ghost;
    drag.card.classList.add("dragging");
    document.body.classList.add("is-dragging");
    if (navigator.vibrate && !drag.isMouse) navigator.vibrate(10);
    moveGhost(x, y);
  }

  function moveGhost(x, y) {
    drag.ghost.style.transform = `translate(${x}px, ${y}px) translate(-50%, -60%)`;
    const over = isOverDropTarget(x, y);
    el.goalPanel.classList.toggle("drop-active", over);
  }

  function isOverDropTarget(x, y) {
    const r = el.goalPanel.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  }

  function onPointerMove(e) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    if (!drag.active) {
      const moved = Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > MOVE_THRESHOLD;
      if (!moved) return;
      if (drag.isMouse) startDrag(e.clientX, e.clientY);
      else endDrag(false); // rörelse före långt tryck = scroll
      return;
    }
    moveGhost(e.clientX, e.clientY);
  }

  function onPointerUp(e) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    endDrag(drag.active && isOverDropTarget(e.clientX, e.clientY));
  }

  function endDrag(dropped) {
    if (!drag) return;
    clearTimeout(drag.timer);
    if (drag.active) {
      const ghost = drag.ghost;
      ghost.classList.add(dropped ? "dropped" : "cancelled");
      ghost.addEventListener("animationend", () => ghost.remove(), { once: true });
      setTimeout(() => ghost.remove(), 400);
      drag.card.classList.remove("dragging");
      document.body.classList.remove("is-dragging");
      el.goalPanel.classList.remove("drop-active");
      if (dropped) addFood(drag.id);
    }
    drag = null;
  }

  el.foodList.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", () => endDrag(false));
  // Stoppa sidscroll medan ett livsmedel dras på touchskärm.
  document.addEventListener("touchmove", (e) => { if (drag && drag.active) e.preventDefault(); }, { passive: false });
  el.foodList.addEventListener("contextmenu", (e) => { if (e.target.closest(".food-card")) e.preventDefault(); });

  // ── Sök ──────────────────────────────────────────────────────
  el.search.addEventListener("input", () => {
    view.query = el.search.value.trim().toLowerCase();
    renderFoods();
  });

  el.clearAll.addEventListener("click", clearAll);

  // ── Dialog: dagsmål ──────────────────────────────────────────
  const goalDialog = $("goal-dialog");
  const weightInput = $("weight-input");
  const goalPreview = $("goal-preview");
  $("per-kg-text").textContent = fmt(CONFIG.proteinPerKg);

  function updateGoalPreview() {
    const w = Number(weightInput.value);
    goalPreview.textContent = w > 0 ? `${Math.round(w * CONFIG.proteinPerKg)} g protein` : "–";
  }

  $("goal-open").addEventListener("click", () => {
    weightInput.value = state.weightKg;
    updateGoalPreview();
    goalDialog.showModal();
    weightInput.select();
  });
  weightInput.addEventListener("input", updateGoalPreview);
  $("goal-cancel").addEventListener("click", () => goalDialog.close("cancel"));
  $("goal-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const w = Number(weightInput.value);
    if (w > 0) {
      state.weightKg = w;
      saveState();
      render();
    }
    goalDialog.close();
  });

  // ── Dialog: hjälp ────────────────────────────────────────────
  const helpDialog = $("help-dialog");
  $("help-open").addEventListener("click", () => helpDialog.showModal());

  // Stäng dialoger vid klick utanför.
  for (const d of [goalDialog, helpDialog]) {
    d.addEventListener("click", (e) => { if (e.target === d) d.close("cancel"); });
  }

  // ── Start ────────────────────────────────────────────────────
  buildGrid();
  renderFilters();
  renderFoods();
  render();
})();
