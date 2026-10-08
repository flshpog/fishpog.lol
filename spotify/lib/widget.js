// Renders a look-alike of Spotify's embed player as a PNG.
// Discord shows native Spotify links as Spotify's widget inside an iframe; we
// can't get an iframe from a third-party domain, so we paint the widget and
// ship it as a bare image (or as the poster of a bare video) instead.
//
// Two layouts, matching Spotify's own embed heights at 400px wide:
//   tall     400x152, big cover, title, artist, PREVIEW pill, dots + play.
//   compact  400x80, the one Discord itself shows for a native Spotify link.
//
// Width: Discord displays an image at its real pixel size up to 400px wide, so
// for width < 400 we paint at exactly that size (1x). At 400 we paint at 2.5x so
// it stays crisp; Discord scales it down to 400.
//
// The video player has a ~150px minimum height, so only `tall` makes sense as a
// video poster.

import { GlobalFonts, createCanvas, loadImage, Path2D } from '@napi-rs/canvas';
import { fileURLToPath } from 'node:url';

const DISCORD_BG = '#000000'; // behind the rounded corners; black blends with every dark theme best
export const LAYOUTS = { tall: { h: 80 + 72 }, compact: { h: 80 } };
export const MIN_WIDTH = 160;
export const MAX_WIDTH = 400;

// Spotify glyph (Simple Icons), 24x24 viewBox.
const SPOTIFY_PATH =
  'M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z';

let fontsReady = false;
function ensureFonts() {
  if (fontsReady) return;
  GlobalFonts.registerFromPath(fileURLToPath(new URL('../assets/Figtree-Bold.ttf', import.meta.url)), 'Figtree Bold');
  GlobalFonts.registerFromPath(fileURLToPath(new URL('../assets/Figtree-Medium.ttf', import.meta.url)), 'Figtree Medium');
  fontsReady = true;
}

/** Display size (what Discord will show) and canvas size for a layout/width. */
export function widgetSize(layout = 'tall', width = MAX_WIDTH) {
  const L = LAYOUTS[layout] ? layout : 'tall';
  const w = clamp(Math.round(Number(width) || MAX_WIDTH), MIN_WIDTH, MAX_WIDTH);
  const scale = w / 400; // design units are the 400-wide widget
  const display = { width: w, height: Math.round(LAYOUTS[L].h * scale) };
  const S = w >= MAX_WIDTH ? 2.5 : scale;
  return { layout: L, width: w, display, S, canvas: { width: Math.round(400 * S), height: Math.round(LAYOUTS[L].h * S) } };
}

/**
 * @param {object} o
 * @param {Buffer} o.cover        cover art bytes (jpg/png)
 * @param {string} o.title
 * @param {string} o.subtitle     artist(s) / show name
 * @param {string} [o.background] hex, Spotify's backgroundBase
 * @param {string} [o.subdued]    hex, Spotify's textSubdued
 * @param {boolean} [o.preview]   show the PREVIEW pill (Discord's native one does)
 * @param {'tall'|'compact'} [o.layout]
 * @param {number} [o.width]      display width in px, 160..400
 * @returns {Promise<Buffer>} PNG
 */
export const THEMES = { spotify: {}, solseekers: { color: '#6896aa' } };
// Bump whenever the painted output changes: it's put in every media URL so
// Vercel's CDN and Discord's image cache stop serving the old picture.
export const RENDER_VERSION = 6;
let logoPromise;
function solseekersLogo() {
  return (logoPromise ||= loadImage(fileURLToPath(new URL('../assets/solseekerslogo.png', import.meta.url))));
}

export async function renderWidget({ cover, title, subtitle, background = '#282828', subdued = '#b3b3b3', preview = true, layout = 'tall', width = MAX_WIDTH, theme = 'spotify' }) {
  ensureFonts();
  const ss = theme === 'solseekers'; // SolSeekers: compact only, gradient to the game colour, logo instead of controls
  const size = widgetSize(ss ? 'compact' : layout, width);
  const { S } = size;
  const W = size.canvas.width;
  const H = size.canvas.height;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  const art = cover ? await loadImage(cover) : null;

  ctx.fillStyle = DISCORD_BG;
  ctx.fillRect(0, 0, W, H);
  roundRect(ctx, 0, 0, W, H, 12 * S);
  if (ss) {
    const g = ctx.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, background);
    g.addColorStop(1, THEMES.solseekers.color);
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = background;
  }
  ctx.fill();

  // SolSeekers: white outline on the card, matching the logo's stroke weight
  // (the logo's outer ring is ~9px of its 128px, about 4.4 design units here).
  const outline = 4.4 * S;

  const d = size.layout === 'tall'
    ? { pad: 16, cover: 120, coverR: 6, glyph: 21, textX: 152, titleY: 42, titleSize: 20, subY: 64, subSize: 14, pill: { y: 78, h: 18, size: 10, padX: 7, baseline: 13, r: 4 }, playR: 18, dotR: 2, dotGap: 7, dotOff: 18 }
    : { pad: 12, cover: 56, coverR: 4, glyph: 16, textX: 80, titleY: 30, titleSize: 16, subY: 46, subSize: 12, pill: { y: 54, h: 14, size: 9, padX: 6, baseline: 10.5, r: 3 }, playR: 12, dotR: 1.6, dotGap: 6, dotOff: 14 };

  // Cover art, centre-cropped to a square (YouTube thumbnails are 16:9).
  // SolSeekers: the cover fills the whole left side, flush inside the card outline.
  const cvX = ss ? outline : d.pad * S;
  const cvY = ss ? outline : d.pad * S;
  const cvS = ss ? H - 2 * outline : d.cover * S;
  ctx.save();
  if (ss) leftRoundRect(ctx, cvX, cvY, cvS, cvS, 12 * S - outline);
  else roundRect(ctx, cvX, cvY, cvS, cvS, d.coverR * S);
  ctx.clip();
  if (art) {
    const side = Math.min(art.width, art.height);
    const sx = (art.width - side) / 2;
    const sy = (art.height - side) / 2;
    ctx.drawImage(art, sx, sy, side, side, cvX, cvY, cvS, cvS);
  } else {
    // No artwork: a quiet placeholder with a drawn music note (the font has no ♪ glyph).
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(cvX, cvY, cvS, cvS);
    const cx = cvX + cvS / 2;
    const cy0 = cvY + cvS / 2;
    const u = cvS * 0.06; // unit
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    ctx.ellipse(cx - 2.2 * u, cy0 + 3.2 * u, 2.2 * u, 1.6 * u, -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 3.2 * u, cy0 + 2.2 * u, 2.2 * u, 1.6 * u, -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 1.1 * u;
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    ctx.moveTo(cx - 0.3 * u, cy0 + 3.2 * u);
    ctx.lineTo(cx - 0.3 * u, cy0 - 4.6 * u);
    ctx.lineTo(cx + 5.1 * u, cy0 - 5.8 * u);
    ctx.lineTo(cx + 5.1 * u, cy0 + 2.2 * u);
    ctx.stroke();
  }
  ctx.restore();

  if (ss) {
    // Background: every row starts from the colour at the cover's right edge on
    // that row and fades across to SolSeekers blue, so the art bleeds into the
    // card instead of meeting one flat averaged colour.
    const x0 = cvX + cvS;
    const rows = Math.round(cvS);
    // Sample a strip (the rightmost ~8% of the cover) rather than one column, then
    // blur it vertically with a wide gaussian so the fade reads as smooth tones
    // instead of stripes of individual pixel rows.
    const stripW = Math.max(4, Math.round(cvS * 0.12));
    const strip = ctx.getImageData(Math.round(x0) - stripW, Math.round(cvY), stripW, rows).data;
    const rowRgb = new Float64Array(rows * 3);
    for (let r = 0; r < rows; r++) {
      let R = 0, G = 0, B = 0;
      for (let c = 0; c < stripW; c++) {
        const i = (r * stripW + c) * 4;
        R += strip[i]; G += strip[i + 1]; B += strip[i + 2];
      }
      rowRgb[r * 3] = R / stripW; rowRgb[r * 3 + 1] = G / stripW; rowRgb[r * 3 + 2] = B / stripW;
    }
    // How busy is the edge? Calm edges (a wall, a sky) get a wide dissolve and a
    // light blur so the scene seems to continue. Busy edges (buildings, text)
    // keep the art crisp and get a heavy blur, so the background is a few broad
    // tones taken from the cover rather than smeared detail.
    // The signal that matters is horizontal structure inside the strip: if the
    // colour changes a lot left-to-right within the edge (windows, letters,
    // objects), stretching it sideways produces smears. Measured on 4px blocks
    // so film grain doesn't count. A plain wall or sky scores ~3, a painting ~20.
    const blk = 4;
    const bw = Math.max(1, Math.floor(stripW / blk));
    const bh = Math.max(1, Math.floor(rows / blk));
    let hStd = 0;
    for (let by = 0; by < bh; by++) {
      const bl = [];
      for (let bx = 0; bx < bw; bx++) {
        const m = [0, 0, 0];
        for (let y = 0; y < blk; y++) for (let x = 0; x < blk; x++) for (let ch = 0; ch < 3; ch++) m[ch] += strip[((by * blk + y) * stripW + bx * blk + x) * 4 + ch] / (blk * blk);
        bl.push(m);
      }
      const mean = [0, 1, 2].map((ch) => bl.reduce((a, b) => a + b[ch], 0) / bw);
      hStd += Math.sqrt(bl.reduce((a, b) => a + ((b[0] - mean[0]) ** 2 + (b[1] - mean[1]) ** 2 + (b[2] - mean[2]) ** 2) / 3, 0) / bw);
    }
    hStd /= bh;
    const busy = Math.min(1, Math.max(0, (hStd - 6) / 12)); // 0 calm (<=6) .. 1 busy (>=18)
    const ease = busy * busy * (3 - 2 * busy);
    if (process.env.DEBUG_WIDGET) console.log(`edge: hStd=${hStd.toFixed(1)} busy=${ease.toFixed(2)}`);

    const sigma = (6 + 20 * ease) * S; // ~15px calm .. ~65px busy at full size
    const radius = Math.round(sigma * 3);
    const weights = [];
    for (let k = -radius; k <= radius; k++) weights.push(Math.exp(-(k * k) / (2 * sigma * sigma)));
    const target = hexToRgb(THEMES.solseekers.color);
    // Dissolve the cover's right edge into its own averaged colour over this many
    // px, so there's no hard vertical seam where the picture stops.
    const fadeW = cvS * (0.35 - 0.29 * ease);
    const xs = x0 - fadeW;
    const fadeStop = fadeW / (W - xs);
    ctx.save();
    roundRect(ctx, 0, 0, W, H, 12 * S);
    ctx.clip();
    for (let r = 0; r < rows; r++) {
      let R = 0, G = 0, B = 0, n = 0;
      for (let k = -radius; k <= radius; k++) {
        const rr = Math.min(rows - 1, Math.max(0, r + k));
        const w = weights[k + radius];
        R += rowRgb[rr * 3] * w; G += rowRgb[rr * 3 + 1] * w; B += rowRgb[rr * 3 + 2] * w; n += w;
      }
      const c = `${Math.round(R / n)},${Math.round(G / n)},${Math.round(B / n)}`;
      // Muted or washed-out edges (pale sky, khaki, grey) make mud when stretched.
      // Keep the row's hue but push it to a rich, darker tone, like Spotify's tints,
      // and glide into that just after the cover so the melt stays seamless.
      const rich = richTone(R / n, G / n, B / n);
      const g = ctx.createLinearGradient(xs, 0, W, 0);
      g.addColorStop(0, `rgba(${c},0)`);
      g.addColorStop(fadeStop, `rgb(${c})`);
      g.addColorStop(Math.min(0.98, fadeStop + 0.22), `rgb(${rich})`);
      g.addColorStop(1, `rgb(${target.r},${target.g},${target.b})`);
      ctx.fillStyle = g;
      ctx.fillRect(xs, cvY + r, W - xs, 1.5);
    }
    ctx.restore();

    // Card outline on top of everything painted so far.
    roundRect(ctx, outline / 2, outline / 2, W - outline, H - outline, 12 * S - outline / 2);
    ctx.lineWidth = outline;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
  }

  // Top right: Spotify glyph, or the SolSeekers logo filling the right edge.
  let rightReserve;
  if (ss) {
    const logo = await solseekersLogo();
    const lh = 62 * S;
    ctx.drawImage(logo, W - 9 * S - lh, (80 * S - lh) / 2, lh, lh);
    rightReserve = lh + 9 * S;
  } else {
    const glyph = d.glyph * S;
    ctx.save();
    ctx.translate(W - d.pad * S - glyph, d.pad * S);
    ctx.scale(glyph / 24, glyph / 24);
    ctx.fillStyle = '#ffffff';
    ctx.fill(new Path2D(SPOTIFY_PATH));
    ctx.restore();
    rightReserve = d.pad * S + glyph;
  }

  // Text column.
  const x = ss ? cvX + cvS + 14 * S : d.textX * S;
  const maxText = W - x - rightReserve - 12 * S;
  ctx.textBaseline = 'alphabetic';
  // SolSeekers: no PREVIEW pill, so centre the two lines vertically in the 80px card.
  const titleY = ss ? 36 * S : d.titleY * S;
  const subY = ss ? 54 * S : d.subY * S;
  ctx.fillStyle = '#ffffff';
  ctx.font = `${d.titleSize * S}px "Figtree Bold"`;
  ctx.fillText(ellipsize(ctx, title, maxText), x, titleY);

  ctx.fillStyle = subdued;
  ctx.font = `${d.subSize * S}px "Figtree Medium"`;
  ctx.fillText(ellipsize(ctx, subtitle, maxText), x, subY);

  if (preview && !ss) {
    const p = d.pill;
    ctx.font = `${p.size * S}px "Figtree Bold"`;
    const label = 'PREVIEW';
    const spacing = 0.5 * S;
    const tw = ctx.measureText(label).width + spacing * (label.length - 1);
    roundRect(ctx, x, p.y * S, tw + 2 * p.padX * S, p.h * S, p.r * S);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    drawSpaced(ctx, label, x + p.padX * S, (p.y + p.baseline) * S, spacing);
  }

  if (ss) return canvas.toBuffer('image/png'); // no play controls on the SolSeekers card

  // "···" and the play button, bottom right, aligned with the cover's bottom edge.
  const playR = d.playR * S;
  const cy = (d.pad + d.cover) * S - playR;
  const playCx = W - d.pad * S - playR;
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(playCx - playR - d.dotOff * S - i * d.dotGap * S, cy, d.dotR * S, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(playCx, cy, playR, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  const t = playR * 0.4;
  ctx.moveTo(playCx - t * 0.65, cy - t);
  ctx.lineTo(playCx + t * 1.0, cy);
  ctx.lineTo(playCx - t * 0.65, cy + t);
  ctx.closePath();
  ctx.fill();

  return canvas.toBuffer('image/png');
}

function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}

// Same hue, but saturated and in a dark-mid lightness band: beige -> warm brown,
// pale sky -> deep blue, near-grey stays a dark neutral.
function richTone(r, g, b) {
  const [h, s, l] = rgb2hsl(r, g, b);
  // How much to intervene: nothing for dark colours, fully for pale/washed ones.
  const pale = Math.min(1, Math.max(0, (l - 0.32) / 0.25));
  if (pale === 0) return [r, g, b].map(Math.round).join(',');
  const s2 = s < 0.06 ? s : Math.min(0.8, Math.max(0.35, s * 1.2));
  const deep = hsl2rgb(h, s2, 0.3);
  return [r, g, b].map((v, i) => Math.round(v + (deep[i] - v) * pale)).join(',');
}

function rgb2hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b - r) / d + 2) * 60;
  else h = ((r - g) / d + 4) * 60;
  return [h, s, l];
}

function hsl2rgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s, hp = h / 60, x = c * (1 - Math.abs((hp % 2) - 1)), m = l - c / 2;
  let rgb;
  if (hp < 1) rgb = [c, x, 0]; else if (hp < 2) rgb = [x, c, 0]; else if (hp < 3) rgb = [0, c, x];
  else if (hp < 4) rgb = [0, x, c]; else if (hp < 5) rgb = [x, 0, c]; else rgb = [c, 0, x];
  return rgb.map((v) => (v + m) * 255);
}

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

// Rounded on the left corners only (cover art flush against the card's left edge).
function leftRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function ellipsize(ctx, text, maxWidth) {
  let s = String(text || '');
  if (ctx.measureText(s).width <= maxWidth) return s;
  while (s.length > 1 && ctx.measureText(s + '…').width > maxWidth) s = s.slice(0, -1);
  return s.trimEnd() + '…';
}

function drawSpaced(ctx, text, x, y, spacing) {
  for (const ch of text) {
    ctx.fillText(ch, x, y);
    x += ctx.measureText(ch).width + spacing;
  }
}
