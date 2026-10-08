// Derives Spotify-style widget colours from cover art.
//
// Spotify's embed uses a dark, fairly saturated tint of the artwork's dominant
// hue as the card background (e.g. #005f33 for a green cover, #125877 for a
// blue one) and a light tint of the same hue for secondary text (#a0dab9,
// #7dd9fb). We approximate that: find the saturation-weighted average hue of
// the artwork, then pick fixed lightness levels.

import { createCanvas, loadImage } from '@napi-rs/canvas';

const SAMPLE = 40;

/** @param {Buffer} image @returns {Promise<{background: string, subdued: string, accent: string|null}>} */
export async function coverColors(image) {
  const img = await loadImage(image);
  const canvas = createCanvas(SAMPLE, SAMPLE);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, SAMPLE, SAMPLE);
  const { data } = ctx.getImageData(0, 0, SAMPLE, SAMPLE);
  const accent = dominantByArea(data);

  // Pass 1: weighted hue histogram. Weight by saturation and by being mid-toned
  // (near-black/white pixels say nothing about hue). The biggest bin wins, so a
  // large blue sky beats a small but vivid red logo, which is what Spotify does.
  const BINS = 24;
  const bins = new Float64Array(BINS);
  const px = [];
  let wsum = 0, satSum = 0, n = 0;
  for (let i = 0; i < data.length; i += 4) {
    const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    n++;
    satSum += s;
    const w = s * (1 - Math.abs(l - 0.5) * 1.6);
    if (w <= 0) continue;
    px.push(h, w);
    bins[Math.floor(h / (360 / BINS)) % BINS] += w;
    wsum += w;
  }
  const avgSat = satSum / Math.max(1, n);
  if (wsum < 0.02 * n || avgSat < 0.08) {
    // Grey/monochrome artwork: Spotify falls back to a neutral dark card.
    return { background: '#3a3a3a', subdued: '#b3b3b3', accent };
  }
  let best = 0;
  for (let b = 1; b < BINS; b++) if (bins[b] + bins[(b + 1) % BINS] > bins[best] + bins[(best + 1) % BINS]) best = b;
  const centre = ((best + 1) % BINS) * (360 / BINS); // boundary between the two best adjacent bins

  // Pass 2: circular mean of the hues near that winner.
  let x = 0, y = 0;
  for (let i = 0; i < px.length; i += 2) {
    const h = px[i], w = px[i + 1];
    let d = Math.abs(h - centre);
    if (d > 180) d = 360 - d;
    if (d > 30) continue;
    const a = (h / 360) * Math.PI * 2;
    x += Math.cos(a) * w;
    y += Math.sin(a) * w;
  }
  let hue = (Math.atan2(y, x) * 180) / Math.PI;
  if (hue < 0) hue += 360;
  const strength = Math.min(1, wsum / (0.25 * n)); // how colourful the art is overall
  const bgSat = 0.55 + 0.45 * strength;
  return {
    background: hslToHex(hue, bgSat, 0.22),
    subdued: hslToHex(hue, 0.5, 0.76),
    accent,
  };
}

// The colour that covers the most area, neutrals included. Quantised to 6 levels
// per channel, the winning bin's pixels averaged back out.
//   - If the overall winner has a hue (a pastel pink, a blue sea) it wins; the
//     renderer deepens pale colours itself.
//   - If the overall winner is neutral (white paper, grey), use the winner among
//     darker pixels instead, so a black-on-white cover yields a black card.
// Null if nothing qualifies.
function dominantByArea(data) {
  const Q = 6;
  const all = new Map(), dark = new Map();
  const add = (map, key, r, g, b) => {
    const e = map.get(key) || { n: 0, r: 0, g: 0, b: 0 };
    e.n++; e.r += r; e.g += g; e.b += b;
    map.set(key, e);
  };
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const key = (Math.floor((r * Q) / 256) * Q + Math.floor((g * Q) / 256)) * Q + Math.floor((b * Q) / 256);
    add(all, key, r, g, b);
    if ((0.299 * r + 0.587 * g + 0.114 * b) / 255 <= 0.72) add(dark, key, r, g, b);
  }
  const top = (map) => { let best = null; for (const e of map.values()) if (!best || e.n > best.n) best = e; return best; };
  const toHex = (e) => '#' + [e.r, e.g, e.b].map((v) => Math.round(v / e.n).toString(16).padStart(2, '0')).join('');
  const minN = (data.length / 4) * 0.04;
  const overall = top(all);
  if (!overall) return null;
  const [, s] = rgbToHsl(overall.r / overall.n, overall.g / overall.n, overall.b / overall.n);
  if (s >= 0.12) return toHex(overall);
  const d = top(dark);
  if (d && d.n >= minN) return toHex(d);
  return overall.n >= minN ? toHex(overall) : null;
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b - r) / d + 2) * 60;
  else h = ((r - g) / d + 4) * 60;
  return [h, s, l];
}

function hslToHex(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const xx = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (hp < 1) [r, g, b] = [c, xx, 0];
  else if (hp < 2) [r, g, b] = [xx, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, xx];
  else if (hp < 4) [r, g, b] = [0, xx, c];
  else if (hp < 5) [r, g, b] = [xx, 0, c];
  else [r, g, b] = [c, 0, xx];
  const m = l - c / 2;
  return '#' + [r, g, b].map((v) => Math.round((v + m) * 255).toString(16).padStart(2, '0')).join('');
}
