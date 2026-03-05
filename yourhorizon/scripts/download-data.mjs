/**
 * Download and normalize ACNH data from public sources.
 * Run with: node scripts/download-data.mjs
 *
 * Data source: alexislours/ACNHAPI (CC BY 4.0)
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "public", "data");

const BASE_URL = "https://raw.githubusercontent.com/alexislours/ACNHAPI/master";

// Ensure data directory exists
mkdirSync(DATA_DIR, { recursive: true });

// ============================================================
// Fetch helper
// ============================================================
async function fetchJSON(url) {
  console.log(`  Fetching ${url}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

function saveJSON(filename, data) {
  const path = join(DATA_DIR, filename);
  writeFileSync(path, JSON.stringify(data));
  console.log(`  Saved ${filename} (${data.length} records)`);
}

// ============================================================
// Normalizers — convert ACNHAPI format to our schema
// ============================================================

/** Convert ACNHAPI object-keyed format to array, preserving the key as _fileName */
function toArray(obj) {
  return Object.entries(obj).map(([key, val]) => ({ ...val, _fileName: key }));
}

/** Build GitHub raw image URLs from file-name */
function iconUrl(category, fileName) {
  return `${BASE_URL}/icons/${category}/${fileName}.png`;
}
function imageUrl(category, fileName) {
  return `${BASE_URL}/images/${category}/${fileName}.png`;
}

/** Parse ACNHAPI availability into our MonthlyAvailability format */
function parseAvailability(avail) {
  if (!avail) return { northern: [], southern: [] };
  return {
    northern: avail["month-array-northern"] ?? [],
    southern: avail["month-array-southern"] ?? [],
  };
}

/** Parse time ranges from ACNHAPI time-array */
function parseTimeRanges(avail) {
  if (!avail || !avail["time-array"]) return [];
  const times = avail["time-array"];
  if (!times.length) return [{ start: 0, end: 24 }]; // All day

  // Group consecutive hours into ranges
  const ranges = [];
  let start = times[0];
  let prev = times[0];
  for (let i = 1; i < times.length; i++) {
    if (times[i] !== prev + 1) {
      ranges.push({ start, end: prev + 1 });
      start = times[i];
    }
    prev = times[i];
  }
  ranges.push({ start, end: prev + 1 });
  return ranges;
}

// ============================================================
// Download and normalize each category
// ============================================================

async function downloadVillagers() {
  console.log("\n[Villagers] (from Norviah - includes 2.0 update villagers)");
  const raw = await fetchJSON(
    "https://raw.githubusercontent.com/Norviah/animal-crossing/master/json/combined/Villagers.json"
  );
  const data = raw.map((v) => ({
    id: v.filename ?? v.uniqueEntryId ?? v.name,
    name: v.name,
    species: v.species ?? "",
    personality: v.personality ?? "",
    hobby: v.hobby ?? "",
    birthday: v.birthday ?? "",
    gender: v.gender ?? "",
    catchphrase: v.catchphrase ?? "",
    iconUri: v.iconImage ?? "",
    imageUri: v.photoImage ?? "",
  }));

  // 3.0 update villagers (Jan 2026) — not yet in Norviah dataset
  const update3Villagers = [
    { id: "cece", name: "Cece", species: "Squirrel", personality: "Peppy", hobby: "Play", birthday: "5/28", gender: "Female", catchphrase: "drip ink", iconUri: "https://dodo.ac/np/images/a/af/Cece_NH_Villager_Icon.png", imageUri: "https://dodo.ac/np/images/thumb/e/ec/Cece%27s_Photo_NH_Texture.png/128px-Cece%27s_Photo_NH_Texture.png" },
    { id: "viche", name: "Viché", species: "Squirrel", personality: "Normal", hobby: "Music", birthday: "7/7", gender: "Female", catchphrase: "lip-synch", iconUri: "https://dodo.ac/np/images/c/ca/Vich%C3%A9_NH_Villager_Icon.png", imageUri: "https://dodo.ac/np/images/thumb/4/4f/Vich%C3%A9%27s_Photo_NH_Texture.png/128px-Vich%C3%A9%27s_Photo_NH_Texture.png" },
    { id: "tulin", name: "Tulin", species: "Bird", personality: "Jock", hobby: "Play", birthday: "3/3", gender: "Male", catchphrase: "gust", iconUri: "https://dodo.ac/np/images/f/f9/Tulin_NH_Villager_Icon.png", imageUri: "https://dodo.ac/np/images/thumb/5/5d/Tulin%27s_Photo_NH_Texture.png/128px-Tulin%27s_Photo_NH_Texture.png" },
    { id: "mineru", name: "Mineru", species: "Deer", personality: "Snooty", hobby: "Education", birthday: "5/12", gender: "Female", catchphrase: "construct", iconUri: "https://dodo.ac/np/images/d/d5/Mineru_NH_Villager_Icon.png", imageUri: "https://dodo.ac/np/images/thumb/b/bb/Mineru%27s_Photo_NH_Texture.png/128px-Mineru%27s_Photo_NH_Texture.png" },
  ];
  data.push(...update3Villagers);

  saveJSON("villagers.json", data);
}

async function downloadFish() {
  console.log("\n[Fish]");
  const raw = await fetchJSON(`${BASE_URL}/fish.json`);
  const data = toArray(raw).map((f) => ({
    id: String(f.id),
    name: f.name["name-USen"],
    location: f.availability?.location ?? "",
    shadow: f.shadow ?? "",
    rarity: f.availability?.rarity ?? "",
    price: f.price ?? 0,
    availability: parseAvailability(f.availability),
    time: parseTimeRanges(f.availability),
    iconUri: iconUrl("fish", f._fileName),
    imageUri: imageUrl("fish", f._fileName),
  }));
  saveJSON("fish.json", data);
}

async function downloadBugs() {
  console.log("\n[Bugs]");
  const raw = await fetchJSON(`${BASE_URL}/bugs.json`);
  const data = toArray(raw).map((b) => ({
    id: String(b.id),
    name: b.name["name-USen"],
    location: b.availability?.location ?? "",
    rarity: b.availability?.rarity ?? "",
    price: b.price ?? 0,
    availability: parseAvailability(b.availability),
    time: parseTimeRanges(b.availability),
    iconUri: iconUrl("bugs", b._fileName),
    imageUri: imageUrl("bugs", b._fileName),
  }));
  saveJSON("bugs.json", data);
}

async function downloadSea() {
  console.log("\n[Sea Creatures]");
  const raw = await fetchJSON(`${BASE_URL}/sea.json`);
  const data = toArray(raw).map((s) => ({
    id: String(s.id),
    name: s.name["name-USen"],
    shadow: s.shadow ?? "",
    speed: s.speed ?? "",
    rarity: s.availability?.rarity ?? "",
    price: s.price ?? 0,
    availability: parseAvailability(s.availability),
    time: parseTimeRanges(s.availability),
    iconUri: iconUrl("sea", s._fileName),
    imageUri: imageUrl("sea", s._fileName),
  }));
  saveJSON("sea.json", data);
}

async function downloadFossils() {
  console.log("\n[Fossils]");
  const raw = await fetchJSON(`${BASE_URL}/fossils.json`);
  const data = toArray(raw).map((f) => ({
    id: String(f["file-name"] ?? f.name?.["name-USen"] ?? ""),
    name: f.name["name-USen"],
    price: f.price ?? 0,
    partOf: f["part-of"] ?? "",
    imageUri: imageUrl("fossils", f._fileName ?? f["file-name"] ?? ""),
  }));
  saveJSON("fossils.json", data);
}

async function downloadArt() {
  console.log("\n[Art]");
  const raw = await fetchJSON(`${BASE_URL}/art.json`);
  const data = toArray(raw).map((a) => ({
    id: String(a.id),
    name: a.name["name-USen"],
    hasFake: a["has-fake"] ?? false,
    buyPrice: a["buy-price"] ?? 0,
    sellPrice: a["sell-price"] ?? 0,
    imageUri: imageUrl("art", a._fileName),
  }));
  saveJSON("art.json", data);
}

async function downloadSongs() {
  console.log("\n[Songs/Music] (from Norviah - includes 2.0 songs)");
  const raw = await fetchJSON(
    "https://raw.githubusercontent.com/Norviah/animal-crossing/master/json/combined/Items.min.json"
  );
  const songs = raw.filter((i) => i.sourceSheet === "Music");
  const data = songs.map((s) => ({
    id: s.filename ?? s.uniqueEntryId ?? s.name,
    name: s.name,
    isOrderable: s.catalog === "For sale",
    buyPrice: s.buy ?? null,
    sellPrice: s.sell ?? 0,
    imageUri: s.albumImage ?? "",
  }));
  saveJSON("music.json", data);
}

async function downloadAllItems() {
  console.log("\n[Items] (from Norviah - all categories with variant expansion)");
  const raw = await fetchJSON(
    "https://raw.githubusercontent.com/Norviah/animal-crossing/master/json/combined/Items.min.json"
  );

  // Exclude categories handled by separate downloads
  const EXCLUDED = new Set(["Music", "Artwork", "Fossils"]);
  const filtered = raw.filter((i) => !EXCLUDED.has(i.sourceSheet));

  const data = [];
  let idx = 0;

  for (const item of filtered) {
    const category = item.sourceSheet ?? "Other";
    const source = Array.isArray(item.source) ? item.source.join(", ") : (item.source ?? "");
    const buyPrice = item.buy ?? null;
    const sellPrice = item.sell ?? 0;

    if (item.variations && item.variations.length > 0) {
      for (const v of item.variations) {
        // Priority: variant storageImage > variant image > item image > CDN fallback from filename
        const imageUri =
          v.storageImage || v.image || item.storageImage || item.image ||
          (v.filename ? `https://acnhcdn.com/latest/FtrIcon/${v.filename}.png` :
            (item.filename ? `https://acnhcdn.com/latest/FtrIcon/${item.filename}.png` : ""));

        data.push({
          id: `item-${idx++}`,
          name: item.name,
          category,
          source,
          buyPrice: v.buy ?? buyPrice,
          sellPrice: v.sell ?? sellPrice,
          variant: v.variation ?? null,
          imageUri,
        });
      }
    } else {
      const imageUri =
        item.storageImage || item.image ||
        (item.filename ? `https://acnhcdn.com/latest/FtrIcon/${item.filename}.png` : "");

      data.push({
        id: `item-${idx++}`,
        name: item.name,
        category,
        source,
        buyPrice,
        sellPrice,
        variant: null,
        imageUri,
      });
    }
  }

  saveJSON("items.json", data);
}

// ============================================================
// Norviah-sourced datasets
// ============================================================

async function downloadEvents() {
  console.log("\n[Events] (from Norviah)");
  const raw = await fetchJSON(
    "https://raw.githubusercontent.com/Norviah/animal-crossing/master/json/combined/SeasonsAndEvents.json"
  );
  // Filter to meaningful event types (skip zodiac seasons, shopping seasons)
  const eventTypes = new Set(["Special event", "Basegame event", "Nook Shopping event", "Crafting season"]);
  const data = raw
    .filter((e) => eventTypes.has(e.type))
    .map((e, i) => {
      // Parse months from NH date strings
      const months = parseEventMonths(e.datesNorthernHemisphere);
      return {
        id: e.uniqueEntryId ?? `evt-${i}`,
        name: e.displayName ?? e.name,
        month: months,
        dates: e.datesNorthernHemisphere?.replace(/\n/g, "; ") ?? "",
        description: `${e.type}. ${e.eventNotes ?? ""}`.trim(),
        isRecurring: e.type === "Basegame event" || e.type === "Special event",
      };
    });
  saveJSON("events.json", data);
}

/** Extract month numbers from Norviah date strings like "April 17" or "June 1 – June 30" */
function parseEventMonths(dateStr) {
  if (!dateStr) return [];
  const monthNames = { january: 1, february: 2, march: 3, april: 4, may: 5, june: 6, july: 7, august: 8, september: 9, october: 10, november: 11, december: 12 };
  const months = new Set();
  const lower = dateStr.toLowerCase();
  for (const [name, num] of Object.entries(monthNames)) {
    if (lower.includes(name)) months.add(num);
  }
  return [...months].sort((a, b) => a - b);
}

async function downloadReactions() {
  console.log("\n[Reactions] (from Norviah)");
  const raw = await fetchJSON(
    "https://raw.githubusercontent.com/Norviah/animal-crossing/master/json/combined/Reactions.json"
  );
  const data = raw.map((r) => ({
    id: r.iconFilename ?? r.uniqueEntryId ?? r.name,
    name: r.name,
    source: Array.isArray(r.source) ? r.source.join(", ") : (r.source ?? ""),
    sourceNotes: r.sourceNotes ?? "",
    imageUri: r.image ?? "",
  }));
  saveJSON("reactions.json", data);
}

async function downloadNPCVisitors() {
  console.log("\n[NPC Visitors] (from Norviah)");
  const raw = await fetchJSON(
    "https://raw.githubusercontent.com/Norviah/animal-crossing/master/json/combined/NPCs.json"
  );
  // Only the 11 weekly rotating visitors
  const visitingNPCs = new Set([
    "Wisp", "Celeste", "Kicks", "Label", "Saharah",
    "Gulliver", "C.J.", "Flick", "Leif", "Redd", "Gullivarrr",
  ]);
  const schedules = {
    "Celeste": "Random nights with meteor showers",
    "Wisp": "Random nights, 8 PM - 4 AM",
    "Label": "Random weekdays",
    "Kicks": "Random weekdays",
    "Leif": "Random weekdays",
    "Redd": "Random weekdays (arrives by boat)",
    "Flick": "Random weekdays",
    "C.J.": "Random weekdays",
    "Gulliver": "Random (found on beach)",
    "Gullivarrr": "Random (found on beach, requires wetsuit)",
    "Saharah": "Random weekdays",
  };
  const descriptions = {
    "Celeste": "Gives DIY recipes for star-themed and zodiac items.",
    "Wisp": "Find his scattered spirit pieces for a reward.",
    "Label": "Fashion designer who gives clothing challenges for Able Sisters rewards.",
    "Kicks": "Sells shoes, socks, and bags.",
    "Leif": "Sells shrubs, flowers, pumpkin starts, and produce.",
    "Redd": "Sells art (real and fake) and special furniture.",
    "Flick": "Buys bugs at 1.5x price. Commissions bug models.",
    "C.J.": "Buys fish at 1.5x price. Commissions fish models.",
    "Gulliver": "Help find communicator parts for exotic furniture rewards.",
    "Gullivarrr": "Help find communicator parts for pirate-themed rewards.",
    "Saharah": "Sells rugs, wallpaper, and flooring.",
  };
  // Deduplicate by name (e.g. Wisp has two entries)
  const seen = new Set();
  const data = raw
    .filter((n) => visitingNPCs.has(n.name))
    .filter((n) => {
      if (seen.has(n.name)) return false;
      seen.add(n.name);
      return true;
    })
    .map((n) => ({
      id: n.npcId ?? n.uniqueEntryId ?? n.name,
      name: n.name,
      schedule: schedules[n.name] ?? "",
      description: descriptions[n.name] ?? "",
      imageUri: n.iconImage ?? "",
      photoUri: n.photoImage ?? "",
    }));
  saveJSON("npc-visitors.json", data);
}

function createFlowers() {
  console.log("\n[Flowers]");
  const data = [
    // Roses
    { id: "rose-red", name: "Red Rose", type: "Rose", color: "Red", genes: "RR-yy-WW", hybridParents: [], imageUri: "" },
    { id: "rose-yellow", name: "Yellow Rose", type: "Rose", color: "Yellow", genes: "rr-YY-WW", hybridParents: [], imageUri: "" },
    { id: "rose-white", name: "White Rose", type: "Rose", color: "White", genes: "rr-yy-WW", hybridParents: [], imageUri: "" },
    { id: "rose-pink", name: "Pink Rose", type: "Rose", color: "Pink", genes: "Rr-yy-WW", hybridParents: [{ parent1: "Red Rose", parent2: "White Rose", probability: 50 }], imageUri: "" },
    { id: "rose-orange", name: "Orange Rose", type: "Rose", color: "Orange", genes: "Rr-Yy-WW", hybridParents: [{ parent1: "Red Rose", parent2: "Yellow Rose", probability: 50 }], imageUri: "" },
    { id: "rose-purple", name: "Purple Rose", type: "Rose", color: "Purple", genes: "RR-yy-ww", hybridParents: [{ parent1: "White Rose", parent2: "White Rose", probability: 25 }], imageUri: "" },
    { id: "rose-black", name: "Black Rose", type: "Rose", color: "Black", genes: "RR-Yy-Ww", hybridParents: [{ parent1: "Red Rose", parent2: "Red Rose", probability: 25 }], imageUri: "" },
    { id: "rose-blue", name: "Blue Rose", type: "Rose", color: "Blue", genes: "RR-YY-ww", hybridParents: [{ parent1: "Special Red (hybrid)", parent2: "Special Red (hybrid)", probability: 1.56 }], imageUri: "" },
    { id: "rose-gold", name: "Gold Rose", type: "Rose", color: "Gold", genes: "special", hybridParents: [{ parent1: "Black Rose (watered with gold can)", parent2: "Black Rose", probability: 50 }], imageUri: "" },
    // Tulips
    { id: "tulip-red", name: "Red Tulip", type: "Tulip", color: "Red", genes: "RR-yy", hybridParents: [], imageUri: "" },
    { id: "tulip-yellow", name: "Yellow Tulip", type: "Tulip", color: "Yellow", genes: "rr-YY", hybridParents: [], imageUri: "" },
    { id: "tulip-white", name: "White Tulip", type: "Tulip", color: "White", genes: "rr-yy", hybridParents: [], imageUri: "" },
    { id: "tulip-pink", name: "Pink Tulip", type: "Tulip", color: "Pink", genes: "Rr-yy", hybridParents: [{ parent1: "Red Tulip", parent2: "White Tulip", probability: 50 }], imageUri: "" },
    { id: "tulip-orange", name: "Orange Tulip", type: "Tulip", color: "Orange", genes: "Rr-Yy", hybridParents: [{ parent1: "Red Tulip", parent2: "Yellow Tulip", probability: 50 }], imageUri: "" },
    { id: "tulip-black", name: "Black Tulip", type: "Tulip", color: "Black", genes: "RR-Yy", hybridParents: [{ parent1: "Red Tulip", parent2: "Red Tulip", probability: 25 }], imageUri: "" },
    { id: "tulip-purple", name: "Purple Tulip", type: "Tulip", color: "Purple", genes: "RR-YY", hybridParents: [{ parent1: "Orange Tulip", parent2: "Orange Tulip", probability: 6.25 }], imageUri: "" },
    // Pansies
    { id: "pansy-red", name: "Red Pansy", type: "Pansy", color: "Red", genes: "RR-yy", hybridParents: [], imageUri: "" },
    { id: "pansy-yellow", name: "Yellow Pansy", type: "Pansy", color: "Yellow", genes: "rr-YY", hybridParents: [], imageUri: "" },
    { id: "pansy-white", name: "White Pansy", type: "Pansy", color: "White", genes: "rr-yy", hybridParents: [], imageUri: "" },
    { id: "pansy-orange", name: "Orange Pansy", type: "Pansy", color: "Orange", genes: "Rr-Yy", hybridParents: [{ parent1: "Red Pansy", parent2: "Yellow Pansy", probability: 50 }], imageUri: "" },
    { id: "pansy-blue", name: "Blue Pansy", type: "Pansy", color: "Blue", genes: "Rr-yy", hybridParents: [{ parent1: "White Pansy", parent2: "White Pansy", probability: 25 }], imageUri: "" },
    { id: "pansy-purple", name: "Purple Pansy", type: "Pansy", color: "Purple", genes: "RR-YY", hybridParents: [{ parent1: "Blue (hybrid)", parent2: "Red (hybrid)", probability: 6.25 }], imageUri: "" },
    // Cosmos
    { id: "cosmos-red", name: "Red Cosmos", type: "Cosmos", color: "Red", genes: "RR-yy", hybridParents: [], imageUri: "" },
    { id: "cosmos-yellow", name: "Yellow Cosmos", type: "Cosmos", color: "Yellow", genes: "rr-YY", hybridParents: [], imageUri: "" },
    { id: "cosmos-white", name: "White Cosmos", type: "Cosmos", color: "White", genes: "rr-yy", hybridParents: [], imageUri: "" },
    { id: "cosmos-pink", name: "Pink Cosmos", type: "Cosmos", color: "Pink", genes: "Rr-yy", hybridParents: [{ parent1: "Red Cosmos", parent2: "White Cosmos", probability: 50 }], imageUri: "" },
    { id: "cosmos-orange", name: "Orange Cosmos", type: "Cosmos", color: "Orange", genes: "Rr-Yy", hybridParents: [{ parent1: "Red Cosmos", parent2: "Yellow Cosmos", probability: 50 }], imageUri: "" },
    { id: "cosmos-black", name: "Black Cosmos", type: "Cosmos", color: "Black", genes: "RR-Yy", hybridParents: [{ parent1: "Orange Cosmos", parent2: "Orange Cosmos", probability: 6.25 }], imageUri: "" },
    // Lilies
    { id: "lily-red", name: "Red Lily", type: "Lily", color: "Red", genes: "RR-yy", hybridParents: [], imageUri: "" },
    { id: "lily-yellow", name: "Yellow Lily", type: "Lily", color: "Yellow", genes: "rr-YY", hybridParents: [], imageUri: "" },
    { id: "lily-white", name: "White Lily", type: "Lily", color: "White", genes: "rr-yy", hybridParents: [], imageUri: "" },
    { id: "lily-pink", name: "Pink Lily", type: "Lily", color: "Pink", genes: "Rr-yy", hybridParents: [{ parent1: "Red Lily", parent2: "White Lily", probability: 50 }], imageUri: "" },
    { id: "lily-orange", name: "Orange Lily", type: "Lily", color: "Orange", genes: "Rr-Yy", hybridParents: [{ parent1: "Red Lily", parent2: "Yellow Lily", probability: 50 }], imageUri: "" },
    { id: "lily-black", name: "Black Lily", type: "Lily", color: "Black", genes: "RR-Yy", hybridParents: [{ parent1: "Red Lily", parent2: "Red Lily", probability: 25 }], imageUri: "" },
    // Hyacinths
    { id: "hyacinth-red", name: "Red Hyacinth", type: "Hyacinth", color: "Red", genes: "RR-yy", hybridParents: [], imageUri: "" },
    { id: "hyacinth-yellow", name: "Yellow Hyacinth", type: "Hyacinth", color: "Yellow", genes: "rr-YY", hybridParents: [], imageUri: "" },
    { id: "hyacinth-white", name: "White Hyacinth", type: "Hyacinth", color: "White", genes: "rr-yy", hybridParents: [], imageUri: "" },
    { id: "hyacinth-pink", name: "Pink Hyacinth", type: "Hyacinth", color: "Pink", genes: "Rr-yy", hybridParents: [{ parent1: "Red Hyacinth", parent2: "White Hyacinth", probability: 50 }], imageUri: "" },
    { id: "hyacinth-orange", name: "Orange Hyacinth", type: "Hyacinth", color: "Orange", genes: "Rr-Yy", hybridParents: [{ parent1: "Red Hyacinth", parent2: "Yellow Hyacinth", probability: 50 }], imageUri: "" },
    { id: "hyacinth-blue", name: "Blue Hyacinth", type: "Hyacinth", color: "Blue", genes: "Rr-yy", hybridParents: [{ parent1: "White Hyacinth", parent2: "White Hyacinth", probability: 25 }], imageUri: "" },
    { id: "hyacinth-purple", name: "Purple Hyacinth", type: "Hyacinth", color: "Purple", genes: "RR-YY", hybridParents: [{ parent1: "Orange (hybrid)", parent2: "Orange (hybrid)", probability: 6.25 }], imageUri: "" },
    // Windflowers
    { id: "windflower-red", name: "Red Windflower", type: "Windflower", color: "Red", genes: "RR-oo", hybridParents: [], imageUri: "" },
    { id: "windflower-orange", name: "Orange Windflower", type: "Windflower", color: "Orange", genes: "rr-OO", hybridParents: [], imageUri: "" },
    { id: "windflower-white", name: "White Windflower", type: "Windflower", color: "White", genes: "rr-oo", hybridParents: [], imageUri: "" },
    { id: "windflower-pink", name: "Pink Windflower", type: "Windflower", color: "Pink", genes: "Rr-oo", hybridParents: [{ parent1: "Red Windflower", parent2: "Orange Windflower", probability: 50 }], imageUri: "" },
    { id: "windflower-blue", name: "Blue Windflower", type: "Windflower", color: "Blue", genes: "Rr-oo", hybridParents: [{ parent1: "White Windflower", parent2: "White Windflower", probability: 25 }], imageUri: "" },
    { id: "windflower-purple", name: "Purple Windflower", type: "Windflower", color: "Purple", genes: "RR-OO", hybridParents: [{ parent1: "Blue (hybrid)", parent2: "Pink (hybrid)", probability: 6.25 }], imageUri: "" },
    // Mums
    { id: "mum-red", name: "Red Mum", type: "Mum", color: "Red", genes: "RR-yy", hybridParents: [], imageUri: "" },
    { id: "mum-yellow", name: "Yellow Mum", type: "Mum", color: "Yellow", genes: "rr-YY", hybridParents: [], imageUri: "" },
    { id: "mum-white", name: "White Mum", type: "Mum", color: "White", genes: "rr-yy", hybridParents: [], imageUri: "" },
    { id: "mum-pink", name: "Pink Mum", type: "Mum", color: "Pink", genes: "Rr-yy", hybridParents: [{ parent1: "Red Mum", parent2: "White Mum", probability: 50 }], imageUri: "" },
    { id: "mum-purple", name: "Purple Mum", type: "Mum", color: "Purple", genes: "Rr-Yy", hybridParents: [{ parent1: "White Mum", parent2: "White Mum", probability: 25 }], imageUri: "" },
    { id: "mum-green", name: "Green Mum", type: "Mum", color: "Green", genes: "RR-YY", hybridParents: [{ parent1: "Purple (hybrid)", parent2: "Purple (hybrid)", probability: 25 }], imageUri: "" },
  ];
  saveJSON("flowers.json", data);
}

function createMysteryIslands() {
  console.log("\n[Mystery Islands]");
  // Data sourced from Nookipedia Mystery Tour page with actual spawn rates and map images
  const NP = "https://dodo.ac/np/images/thumb";
  const data = [
    { id: "0", name: "Short River & Pond", resources: "Fruit trees, flowers, rocks, river, pond", spawnRate: 9.68, nativeFruit: true, rockCount: 4, description: "Standard island with a short river and pond.", imageUri: `${NP}/2/2c/Mystery_Island_0_NH.jpg/300px-Mystery_Island_0_NH.jpg` },
    { id: "1", name: "Short River", resources: "Fruit trees, flowers, rocks, short river", spawnRate: 9.68, nativeFruit: true, rockCount: 4, description: "Standard island with a short river. No pond.", imageUri: `${NP}/b/bc/Mystery_Island_1_NH.jpg/300px-Mystery_Island_1_NH.jpg` },
    { id: "2", name: "Spiral Island", resources: "Fruit trees, flowers, rocks, spiral river", spawnRate: 9.68, nativeFruit: true, rockCount: 4, description: "Island with a distinctive spiral river formation.", imageUri: `${NP}/d/d5/Mystery_Island_2_NH.jpg/300px-Mystery_Island_2_NH.jpg` },
    { id: "4", name: "Large Pond Island", resources: "Fruit trees, flowers, rocks, large pond", spawnRate: 9.68, nativeFruit: true, rockCount: 4, description: "Island with a large central pond. Sometimes called Fidget Spinner Island.", imageUri: `${NP}/e/e6/Mystery_Island_4_NH.jpg/300px-Mystery_Island_4_NH.jpg` },
    { id: "6", name: "Mountain Island", resources: "Fruit trees, flowers, elevated terrain", spawnRate: 8, nativeFruit: true, rockCount: 4, description: "Island with a tall mountain and waterfalls. Rare flowers on top.", imageUri: `${NP}/e/ea/Mystery_Island_6_NH.jpg/300px-Mystery_Island_6_NH.jpg` },
    { id: "7", name: "Bell Rocks Island", resources: "5 money rocks, fruit trees", spawnRate: 5, nativeFruit: true, rockCount: 5, description: "Island where all rocks produce bells. Very profitable!", imageUri: `${NP}/6/65/Mystery_Island_7_NH.jpg/300px-Mystery_Island_7_NH.jpg` },
    { id: "8", name: "Bamboo Island", resources: "Bamboo trees, coconut trees", spawnRate: 9.85, nativeFruit: false, rockCount: 4, description: "Island covered entirely in bamboo. No native fruit trees.", imageUri: `${NP}/7/77/Mystery_Island_8_NH.jpg/300px-Mystery_Island_8_NH.jpg` },
    { id: "10", name: "Fruit Orchard", resources: "Non-native fruit trees, flowers", spawnRate: 10.15, nativeFruit: false, rockCount: 4, description: "Island packed with a non-native fruit type. Great for fruit collecting.", imageUri: `${NP}/c/ca/Mystery_Island_10_NH.jpg/300px-Mystery_Island_10_NH.jpg` },
    { id: "12", name: "Scorpion Island", resources: "Flat terrain, scorpions", spawnRate: 1, nativeFruit: false, rockCount: 0, description: "Flat island with no rivers. Scorpions spawn here at night (May-Oct).", imageUri: `${NP}/6/6a/Mystery_Island_12_NH.jpg/300px-Mystery_Island_12_NH.jpg` },
    { id: "13", name: "Tarantula Island", resources: "Flat terrain, tarantulas", spawnRate: 2, nativeFruit: false, rockCount: 0, description: "Flat island with no rivers. Tarantulas spawn here at night (Nov-Apr).", imageUri: `${NP}/1/1d/Mystery_Island_13_NH.jpg/300px-Mystery_Island_13_NH.jpg` },
    { id: "14", name: "Rugged Woodland", resources: "Hardwood trees, flowers", spawnRate: 1.5, nativeFruit: false, rockCount: 4, description: "Island covered in hardwood trees. Good for rare beetle farming.", imageUri: `${NP}/b/ba/Mystery_Island_14_NH.jpg/300px-Mystery_Island_14_NH.jpg` },
    { id: "17", name: "Flat Woodland", resources: "Hardwood trees, stumps", spawnRate: 1, nativeFruit: false, rockCount: 4, description: "Flat island with hardwood trees and stumps. Good for bug hunting.", imageUri: `${NP}/5/5a/Mystery_Island_17_NH.jpg/300px-Mystery_Island_17_NH.jpg` },
    { id: "18", name: "Curly River", resources: "Fruit trees, flowers, curving river", spawnRate: 8, nativeFruit: true, rockCount: 4, description: "Island with a long, curving river layout.", imageUri: `${NP}/9/9d/Mystery_Island_18_NH.jpg/300px-Mystery_Island_18_NH.jpg` },
    { id: "19", name: "Big Fish Island", resources: "Large pond, rare fish", spawnRate: 3, nativeFruit: true, rockCount: 4, description: "Island with a large elevated pond. Only large-shadow fish spawn here.", imageUri: `${NP}/0/03/Mystery_Island_19_NH.jpg/300px-Mystery_Island_19_NH.jpg` },
    { id: "20", name: "Trash Island", resources: "Trash items only (boots, cans, tires)", spawnRate: 1, nativeFruit: true, rockCount: 4, description: "Island where fishing only yields trash items. Useful for DIY crafting.", imageUri: `${NP}/0/01/Mystery_Island_20_NH.jpg/300px-Mystery_Island_20_NH.jpg` },
    { id: "21", name: "Dorsal-Fin Island", resources: "Fin fish only (sharks, etc.)", spawnRate: 0.5, nativeFruit: true, rockCount: 4, description: "Island where only dorsal-fin ocean fish (sharks, etc.) spawn. Very rare!", imageUri: `${NP}/7/7a/Mystery_Island_21_NH.jpg/300px-Mystery_Island_21_NH.jpg` },
    { id: "23", name: "Waterfalls Island", resources: "Elevated terrain, waterfalls, flowers", spawnRate: 10, nativeFruit: true, rockCount: 4, description: "Island with tall cliffs and multiple waterfalls.", imageUri: `${NP}/e/ed/Mystery_Island_23_NH.jpg/300px-Mystery_Island_23_NH.jpg` },
    { id: "24", name: "Gold Nuggets Island", resources: "Gold nugget rocks", spawnRate: 0.3, nativeFruit: false, rockCount: 6, description: "Island where rocks drop gold nuggets. Rarest island type!", imageUri: `${NP}/8/8c/Mystery_Island_24_NH.jpg/300px-Mystery_Island_24_NH.jpg` },
  ];
  saveJSON("mystery-islands.json", data);
}

// createNPCVisitors removed — now using downloadNPCVisitors() from Norviah above

async function downloadDIYRecipes() {
  console.log("\n[DIY Recipes]");
  const raw = await fetchJSON(
    "https://raw.githubusercontent.com/Norviah/animal-crossing/master/json/combined/Recipes.json"
  );
  const data = raw.map((r, i) => ({
    id: `diy-${r.internalId ?? i}`,
    name: r.name ?? "",
    category: r.category ?? "",
    materials: r.materials ?? {},
    source: Array.isArray(r.source) ? r.source.join(", ") : (r.source ?? ""),
    sellPrice: r.sell ?? 0,
    imageUri: r.image ?? "",
  }));
  saveJSON("diy-recipes.json", data);
}

// ============================================================
// Main
// ============================================================
async function main() {
  console.log("=== Your Horizon Data Download & Normalization ===");
  console.log(`Output: ${DATA_DIR}\n`);

  // ACNHAPI data
  await downloadVillagers();
  await downloadFish();
  await downloadBugs();
  await downloadSea();
  await downloadFossils();
  await downloadArt();
  await downloadSongs();

  // Norviah Items — all item categories with variant expansion (~20k items)
  await downloadAllItems();

  // Norviah-sourced datasets
  await downloadEvents();
  await downloadReactions();
  await downloadNPCVisitors();
  await downloadDIYRecipes();

  // Curated datasets (no external source available)
  createFlowers();
  createMysteryIslands();

  console.log("\n=== Done! ===");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
