// Renders a look-alike of Spotify's standard (152px) embed player as a PNG.
// Discord shows native Spotify links as Spotify's widget inside an iframe; we
// can't get an iframe from a third-party domain, so we paint the widget and
// ship it as the poster of a bare video embed instead.
//
// Discord reserves roughly 150px of height for a 400px-wide video player, which
// is why this uses Spotify's 152px variant rather than the 80px compact one:
// the compact one left a big empty strip underneath.
//
// Canvas is 1000x380, i.e. the 400x152 widget at 2.5x so it stays crisp.

import { GlobalFonts, createCanvas, loadImage, Path2D } from '@napi-rs/canvas';
import { fileURLToPath } from 'node:url';

const S = 2.5;
const BASE_W = 400;
const BASE_H = 152;
const W = BASE_W * S;
const H = BASE_H * S;
const DISCORD_BG = '#000000'; // behind the rounded corners; black blends with every dark theme best

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

export const WIDGET_WIDTH = W;
export const WIDGET_HEIGHT = H;

/**
 * @param {object} o
 * @param {Buffer} o.cover        cover art bytes (jpg/png)
 * @param {string} o.title
 * @param {string} o.subtitle     artist(s) / show name
 * @param {string} [o.background] hex, Spotify's backgroundBase
 * @param {string} [o.subdued]    hex, Spotify's textSubdued
 * @param {boolean} [o.preview]   show the PREVIEW pill (Discord's native one does)
 * @returns {Promise<Buffer>} PNG
 */
export async function renderWidget({ cover, title, subtitle, background = '#282828', subdued = '#b3b3b3', preview = true }) {
  ensureFonts();
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = DISCORD_BG;
  ctx.fillRect(0, 0, W, H);

  // Card.
  roundRect(ctx, 0, 0, W, H, 12 * S);
  ctx.fillStyle = background;
  ctx.fill();

  // Cover art, 120x120 at (16,16), radius 6.
  const art = await loadImage(cover);
  ctx.save();
  roundRect(ctx, 16 * S, 16 * S, 120 * S, 120 * S, 6 * S);
  ctx.clip();
  ctx.drawImage(art, 16 * S, 16 * S, 120 * S, 120 * S);
  ctx.restore();

  // Spotify glyph, top right (21px, white).
  const glyph = 21 * S;
  ctx.save();
  ctx.translate(W - 16 * S - glyph, 16 * S);
  ctx.scale(glyph / 24, glyph / 24);
  ctx.fillStyle = '#ffffff';
  ctx.fill(new Path2D(SPOTIFY_PATH));
  ctx.restore();

  // Text column.
  const x = 152 * S;
  const maxText = W - x - 16 * S - glyph - 12 * S;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#ffffff';
  ctx.font = `${20 * S}px "Figtree Bold"`;
  ctx.fillText(ellipsize(ctx, title, maxText), x, 42 * S);

  ctx.fillStyle = subdued;
  ctx.font = `${14 * S}px "Figtree Medium"`;
  ctx.fillText(ellipsize(ctx, subtitle, maxText), x, 64 * S);

  if (preview) {
    ctx.font = `${10 * S}px "Figtree Bold"`;
    const label = 'PREVIEW';
    const tw = ctx.measureText(label).width + 3 * S;
    const pw = tw + 14 * S;
    const ph = 18 * S;
    const py = 78 * S;
    roundRect(ctx, x, py, pw, ph, 4 * S);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    drawSpaced(ctx, label, x + 7 * S, py + 13 * S, 0.5 * S);
  }

  // "···" and the play button, bottom right, vertically aligned with the cover's bottom edge.
  const playR = 18 * S;
  const cy = 136 * S - playR;
  const playCx = W - 16 * S - playR;
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(playCx - playR - 18 * S - i * 7 * S, cy, 2 * S, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(playCx, cy, playR, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  const t = 7 * S;
  ctx.moveTo(playCx - t * 0.65, cy - t);
  ctx.lineTo(playCx + t * 1.0, cy);
  ctx.lineTo(playCx - t * 0.65, cy + t);
  ctx.closePath();
  ctx.fill();

  return canvas.toBuffer('image/png');
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
