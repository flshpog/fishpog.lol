// Renders a look-alike of Spotify's compact (80px) embed player as a PNG.
// Discord shows native Spotify links as that exact widget inside an iframe; we
// can't get an iframe from a third-party domain, so we paint the widget and
// ship it as the poster of a bare video embed instead.
//
// Canvas is 1000x200, i.e. the 400x80 widget at 2.5x so it stays crisp.

import { GlobalFonts, createCanvas, loadImage, Path2D } from '@napi-rs/canvas';
import { fileURLToPath } from 'node:url';

const S = 2.5;
const W = 400 * S;
const H = 80 * S;
const DISCORD_BG = '#313338'; // dark-theme chat background, shows through the rounded corners

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

  // Outside the rounded card: Discord's chat background.
  ctx.fillStyle = DISCORD_BG;
  ctx.fillRect(0, 0, W, H);

  // Card.
  roundRect(ctx, 0, 0, W, H, 12 * S);
  ctx.fillStyle = background;
  ctx.fill();

  // Cover art, 56x56 at (12,12), radius 4.
  const art = await loadImage(cover);
  ctx.save();
  roundRect(ctx, 12 * S, 12 * S, 56 * S, 56 * S, 4 * S);
  ctx.clip();
  ctx.drawImage(art, 12 * S, 12 * S, 56 * S, 56 * S);
  ctx.restore();

  // Spotify glyph, top right (16px, white).
  const glyph = 16 * S;
  ctx.save();
  ctx.translate(W - 12 * S - glyph, 12 * S);
  ctx.scale(glyph / 24, glyph / 24);
  ctx.fillStyle = '#ffffff';
  ctx.fill(new Path2D(SPOTIFY_PATH));
  ctx.restore();

  // Text column.
  const x = 80 * S;
  const maxText = W - x - 12 * S - glyph - 12 * S;
  ctx.fillStyle = '#ffffff';
  ctx.font = `${16 * S}px "Figtree Bold"`;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(ellipsize(ctx, title, maxText), x, 30 * S);

  ctx.fillStyle = subdued;
  ctx.font = `${12 * S}px "Figtree Medium"`;
  ctx.fillText(ellipsize(ctx, subtitle, maxText), x, 46 * S);

  if (preview) {
    ctx.font = `${9 * S}px "Figtree Bold"`;
    const label = 'PREVIEW';
    const tw = ctx.measureText(label).width + 2 * S; // crude letter-spacing
    const pw = tw + 12 * S;
    const ph = 14 * S;
    const py = 54 * S;
    roundRect(ctx, x, py, pw, ph, 3 * S);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    drawSpaced(ctx, label, x + 6 * S, py + 10.5 * S, 0.5 * S);
  }

  // "···" and the play button, bottom right.
  const cy = 62 * S;
  const playR = 12 * S;
  const playCx = W - 12 * S - playR;
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(playCx - playR - 14 * S - i * 6 * S, cy, 1.6 * S, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(playCx, cy, playR, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  const t = 5 * S;
  ctx.moveTo(playCx - t * 0.7, cy - t);
  ctx.lineTo(playCx + t * 1.0, cy);
  ctx.lineTo(playCx - t * 0.7, cy + t);
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
