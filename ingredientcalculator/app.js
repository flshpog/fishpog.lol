// === CALCULATION ENGINE ===
function calculate(item, count, steps, depth) {
  steps = steps || [];
  depth = depth || 0;
  const recipe = RECIPES[item];
  if (!recipe) return { [item]: count }; // raw material

  const crafts = Math.ceil(count / recipe.out);
  const produced = crafts * recipe.out;

  steps.push({
    depth,
    text: `Craft ${item} x${produced} (${crafts} craft${crafts > 1 ? "s" : ""})`,
    ingredients: Object.entries(recipe.in).map(([k, v]) => `${k} x${crafts * v}`).join(", ")
  });

  const result = {};
  for (const [ing, amt] of Object.entries(recipe.in)) {
    const needed = crafts * amt;
    const sub = calculate(ing, needed, steps, depth + 1);
    for (const [raw, rawAmt] of Object.entries(sub)) {
      result[raw] = (result[raw] || 0) + rawAmt;
    }
  }
  return result;
}

// === UI ===
const searchInput = document.getElementById("itemSearch");
const dropdown = document.getElementById("dropdown");
const stacksInput = document.getElementById("stacks");
const extraInput = document.getElementById("extra");
const totalSpan = document.getElementById("totalItems");
const calcBtn = document.getElementById("calcBtn");
const resultsDiv = document.getElementById("results");

let selectedItem = "";
let activeIndex = -1;

// Get all craftable items sorted
const allItems = Object.keys(RECIPES).sort();

// Build category lookup
const itemCategory = {};
for (const [cat, items] of Object.entries(CATEGORIES)) {
  for (const item of items) itemCategory[item] = cat;
}

function updateTotal() {
  const s = parseInt(stacksInput.value) || 0;
  const e = parseInt(extraInput.value) || 0;
  totalSpan.textContent = s * 64 + e;
}

stacksInput.addEventListener("input", updateTotal);
extraInput.addEventListener("input", updateTotal);

function showDropdown(filter) {
  const f = filter.toLowerCase();
  const matches = f
    ? allItems.filter(i => i.toLowerCase().includes(f))
    : allItems;

  if (matches.length === 0) {
    dropdown.innerHTML = '<div class="dropdown-item" style="color:#666">No items found</div>';
    dropdown.classList.add("show");
    return;
  }

  dropdown.innerHTML = matches.slice(0, 50).map((item, i) => {
    const cat = itemCategory[item] || "";
    return `<div class="dropdown-item" data-item="${item}" data-index="${i}">${item}${cat ? `<span class="cat">${cat}</span>` : ""}</div>`;
  }).join("");

  dropdown.classList.add("show");
  activeIndex = -1;
}

function selectItem(name) {
  selectedItem = name;
  searchInput.value = name;
  dropdown.classList.remove("show");
}

// Search input events
searchInput.addEventListener("focus", () => showDropdown(searchInput.value));
searchInput.addEventListener("input", () => {
  selectedItem = "";
  showDropdown(searchInput.value);
});

searchInput.addEventListener("keydown", (e) => {
  const items = dropdown.querySelectorAll(".dropdown-item[data-item]");
  if (e.key === "ArrowDown") {
    e.preventDefault();
    activeIndex = Math.min(activeIndex + 1, items.length - 1);
    updateActive(items);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    activeIndex = Math.max(activeIndex - 1, 0);
    updateActive(items);
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (activeIndex >= 0 && items[activeIndex]) {
      selectItem(items[activeIndex].dataset.item);
    } else if (items.length > 0) {
      selectItem(items[0].dataset.item);
    }
    doCalculate();
  } else if (e.key === "Escape") {
    dropdown.classList.remove("show");
  }
});

function updateActive(items) {
  items.forEach((el, i) => el.classList.toggle("active", i === activeIndex));
  if (items[activeIndex]) items[activeIndex].scrollIntoView({ block: "nearest" });
}

// Dropdown click
dropdown.addEventListener("click", (e) => {
  const el = e.target.closest(".dropdown-item[data-item]");
  if (el) selectItem(el.dataset.item);
});

// Close dropdown on outside click
document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-wrap")) dropdown.classList.remove("show");
});

// Calculate
calcBtn.addEventListener("click", doCalculate);

function formatAmount(n) {
  if (n >= 64) {
    const stacks = Math.floor(n / 64);
    const remainder = n % 64;
    return remainder > 0 ? `${stacks} stack${stacks > 1 ? "s" : ""} + ${remainder}` : `${stacks} stack${stacks > 1 ? "s" : ""}`;
  }
  return "";
}

function doCalculate() {
  const item = selectedItem || searchInput.value;
  if (!RECIPES[item]) {
    resultsDiv.innerHTML = `<div class="error">${item ? `"${item}" not found in recipes. Try searching for it!` : "Please select an item first."}</div>`;
    return;
  }

  const stacks = parseInt(stacksInput.value) || 0;
  const extra = parseInt(extraInput.value) || 0;
  const total = stacks * 64 + extra;

  if (total <= 0) {
    resultsDiv.innerHTML = '<div class="error">Enter a quantity (stacks or extra items).</div>';
    return;
  }

  const steps = [];
  const rawMaterials = calculate(item, total, steps);

  // Sort raw materials by amount (descending)
  const sorted = Object.entries(rawMaterials).sort((a, b) => b[1] - a[1]);

  let html = `<h2>Raw materials for ${total} ${item}</h2>`;

  for (const [mat, amt] of sorted) {
    const stackStr = formatAmount(amt);
    html += `<div class="result-item">
      <span class="name">${mat}</span>
      <span><span class="amount">${amt}</span>${stackStr ? `<span class="stacks">(${stackStr})</span>` : ""}</span>
    </div>`;
  }

  // Crafting steps breakdown (collapsible)
  html += `<div class="breakdown">
    <h3 id="toggleSteps">▸ Crafting steps (click to expand)</h3>
    <div id="stepsContent" style="display:none">`;

  for (const step of steps) {
    html += `<div class="step" style="margin-left:${10 + step.depth * 15}px">
      ${step.text} — needs ${step.ingredients}
    </div>`;
  }

  html += `</div></div>`;
  resultsDiv.innerHTML = html;

  // Toggle steps
  document.getElementById("toggleSteps").addEventListener("click", function () {
    const content = document.getElementById("stepsContent");
    const showing = content.style.display !== "none";
    content.style.display = showing ? "none" : "block";
    this.textContent = showing ? "▸ Crafting steps (click to expand)" : "▾ Crafting steps (click to collapse)";
  });
}
