// Animated GIFs of the widget: the title / artist marquee when a line doesn't
// fit, and the album / playlist card cycling through its track rows. A static
// PNG can't move and Discord animates GIFs in embeds, so this is the only way
// to get motion into a Discord card.
//
// ffmpeg is only used to quantise the frames to one shared palette; the GIF
// itself is written here. Discord's image proxy re-encodes GIFs and mangled the
// space-saving tricks ffmpeg's encoder uses (sub-rectangle frames at an offset,
// a different transparent index on the first frame), so this writes the plain
// structure every optimised GIF uses: full-canvas frames, one transparent index
// for the whole file, "do not dispose" between frames, and pixels that didn't
// change since the previous frame marked transparent so they are kept. The
// corners are transparent in frame 0 and never painted again. Unchanged areas
// compress to almost nothing, so bytes scale with the pixels that move: text
// glyphs x frames. Holds are single frames with a long delay.

import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { LIST_ROWS, renderWidget, textMetrics } from './widget.js';

const FPS = 20;
const GIF_DPI = 1.5;        // 600px wide frames; Discord shows 400. Bytes scale with
                            // glyph pixels x frames, so this is the main size lever.
const TRANSPARENT = 255;    // palettegen reserve_transparent puts it last

// Marquee: hold, scroll left until the end is visible, hold, loop.
const HOLD_SECONDS = 1.6;
const SPEED_DESIGN_PX = 26; // design px per second (400-wide design space)
const MAX_SCROLL_SECONDS = 7.5; // very long titles scroll faster rather than forever

// Track list: show three rows, slide up one row, repeat round the list.
const LIST_HOLD_SECONDS = 2.4;
const LIST_SLIDE_FRAMES = 6; // 0.3 s at 20 fps

/**
 * @param {object} baseOpts   the same options renderWidget takes
 * @param {(args: string[]) => Promise<void>} ffmpeg  runs ffmpeg with args
 * @returns {Promise<Buffer>} GIF bytes
 */
export async function renderMarqueeGif(baseOpts, ffmpeg, { fps = FPS, dpi = GIF_DPI } = {}) {
  const opts = { ...baseOpts, hiDpi: dpi };
  const m = textMetrics(opts);
  const distT = Math.max(0, m.titleW - m.maxText);
  const distS = Math.max(0, m.subW - m.maxText);
  const dist = Math.max(distT, distS);
  const speed = Math.max(SPEED_DESIGN_PX * m.S, dist / MAX_SCROLL_SECONDS);
  const scrollFrames = Math.max(1, Math.ceil((dist / speed) * fps));

  const frames = [];
  const at = (p, delay) => frames.push({ opts: { ...opts, shift: { title: Math.round(distT * p), sub: Math.round(distS * p) } }, delay });
  at(0, Math.round(HOLD_SECONDS * 100));
  for (let i = 1; i < scrollFrames; i++) at(i / scrollFrames, Math.round(100 / fps));
  at(1, Math.round(HOLD_SECONDS * 100));
  return encodeFrames(frames, ffmpeg, m.size.canvas);
}

/**
 * Album / playlist card cycling through its rows: hold on rows i..i+2, slide up
 * one row (eased), hold, ... and after the last row it wraps round to the first,
 * so the loop is seamless.
 */
export async function renderListGif(baseOpts, ffmpeg, { fps = FPS, dpi = GIF_DPI } = {}) {
  const opts = { ...baseOpts, hiDpi: dpi };
  const m = textMetrics(opts);
  const n = opts.tracks.length;
  if (n <= LIST_ROWS) throw new Error('list GIF needs more rows than fit');
  const frames = [];
  for (let i = 0; i < n; i++) {
    frames.push({ opts: { ...opts, listShift: i }, delay: Math.round(LIST_HOLD_SECONDS * 100) });
    for (let t = 1; t < LIST_SLIDE_FRAMES; t++) {
      const e = (1 - Math.cos((Math.PI * t) / LIST_SLIDE_FRAMES)) / 2; // ease in-out
      frames.push({ opts: { ...opts, listShift: i + e }, delay: Math.round(100 / fps) });
    }
  }
  return encodeFrames(frames, ffmpeg, m.size.canvas);
}

/**
 * Render each frame's widget, quantise them all to one palette and write the GIF.
 * @param {{ opts: object, delay: number }[]} frames  delay in centiseconds
 */
async function encodeFrames(frames, ffmpeg, { width, height }) {
  const dir = await mkdtemp(path.join(tmpdir(), 'fishpog-gif-'));
  try {
    for (let i = 0; i < frames.length; i++) {
      const png = await renderWidget(frames[i].opts);
      await writeFile(path.join(dir, `f${String(i).padStart(4, '0')}.png`), png);
    }
    // One palette for the whole clip; ordered (bayer) dithering so a pixel's
    // colour depends only on its position and the frame diff stays small.
    const raw = path.join(dir, 'out.raw');
    await ffmpeg([
      '-y', '-loglevel', 'error',
      '-framerate', String(FPS), '-i', path.join(dir, 'f%04d.png'),
      '-filter_complex',
      '[0:v]split[a][b];[a]palettegen=reserve_transparent=1:stats_mode=full[p];[b][p]paletteuse=dither=bayer:bayer_scale=4',
      '-f', 'rawvideo', '-pix_fmt', 'pal8', raw,
    ]);
    const data = await readFile(raw);
    const frameBytes = width * height + 1024; // pal8 raw: indexes then the BGRA palette
    if (data.length !== frameBytes * frames.length) {
      throw new Error(`unexpected pal8 output: ${data.length} bytes for ${frames.length} frames of ${width}x${height}`);
    }
    const palette = Buffer.alloc(256 * 3);
    for (let i = 0; i < 256; i++) {
      const o = width * height + i * 4;
      palette[i * 3] = data[o + 2];
      palette[i * 3 + 1] = data[o + 1];
      palette[i * 3 + 2] = data[o];
    }
    const indexed = frames.map((_, i) => data.subarray(i * frameBytes, i * frameBytes + width * height));
    return encodeGif({ width, height, palette, frames: indexed, delays: frames.map((f) => f.delay) });
  } finally {
    rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

// --- GIF writer -------------------------------------------------------------

function encodeGif({ width, height, palette, frames, delays }) {
  const parts = [];
  parts.push(Buffer.from('GIF89a', 'latin1'));
  const lsd = Buffer.alloc(7);
  lsd.writeUInt16LE(width, 0);
  lsd.writeUInt16LE(height, 2);
  lsd[4] = 0x80 | 0x70 | 0x07; // global colour table, 8 bits/colour, 256 entries
  lsd[5] = 0;                  // background index
  lsd[6] = 0;
  parts.push(lsd, palette);
  // Netscape looping extension: loop forever.
  parts.push(Buffer.from([0x21, 0xff, 0x0b, ...Buffer.from('NETSCAPE2.0', 'latin1'), 0x03, 0x01, 0x00, 0x00, 0x00]));

  let prev = null;
  const diff = Buffer.alloc(width * height);
  for (let f = 0; f < frames.length; f++) {
    const cur = frames[f];
    let pixels = cur;
    if (prev) {
      for (let i = 0; i < cur.length; i++) diff[i] = cur[i] === prev[i] ? TRANSPARENT : cur[i];
      pixels = diff;
    }
    // Graphic control: do not dispose, transparent index set, delay.
    const gce = Buffer.from([0x21, 0xf9, 0x04, (1 << 2) | 0x01, 0, 0, TRANSPARENT, 0x00]);
    gce.writeUInt16LE(Math.max(2, delays[f]), 4);
    const desc = Buffer.alloc(10);
    desc[0] = 0x2c;
    desc.writeUInt16LE(0, 1);
    desc.writeUInt16LE(0, 3);
    desc.writeUInt16LE(width, 5);
    desc.writeUInt16LE(height, 7);
    desc[9] = 0; // no local colour table, not interlaced
    parts.push(gce, desc, Buffer.from([8]), subBlocks(lzwEncode(pixels, 8)), Buffer.from([0]));
    prev = cur;
  }
  parts.push(Buffer.from([0x3b]));
  return Buffer.concat(parts);
}

function subBlocks(buf) {
  const out = Buffer.alloc(buf.length + Math.ceil(buf.length / 255));
  let o = 0;
  for (let i = 0; i < buf.length; i += 255) {
    const n = Math.min(255, buf.length - i);
    out[o++] = n;
    buf.copy(out, o, i, i + n);
    o += n;
  }
  return out;
}

// Standard GIF LZW with the usual code-size growth and clear-on-full.
function lzwEncode(pixels, minCodeSize) {
  const CLEAR = 1 << minCodeSize;
  const EOI = CLEAR + 1;
  const out = Buffer.alloc(Math.ceil(pixels.length * 1.5) + 64);
  let outLen = 0;
  let bitBuf = 0;
  let bitCnt = 0;
  let codeSize = minCodeSize + 1;
  const emit = (code) => {
    bitBuf |= code << bitCnt;
    bitCnt += codeSize;
    while (bitCnt >= 8) {
      out[outLen++] = bitBuf & 0xff;
      bitBuf >>>= 8;
      bitCnt -= 8;
    }
  };
  let dict = new Map();
  let next = EOI + 1;
  emit(CLEAR);
  let prefix = pixels[0];
  for (let i = 1; i < pixels.length; i++) {
    const c = pixels[i];
    const key = (prefix << 8) | c;
    const found = dict.get(key);
    if (found !== undefined) {
      prefix = found;
      continue;
    }
    emit(prefix);
    if (next < 4096) {
      if (next >= 1 << codeSize && codeSize < 12) codeSize++;
      dict.set(key, next++);
    } else {
      emit(CLEAR);
      dict = new Map();
      next = EOI + 1;
      codeSize = minCodeSize + 1;
    }
    prefix = c;
  }
  emit(prefix);
  emit(EOI);
  if (bitCnt > 0) out[outLen++] = bitBuf & 0xff;
  return out.subarray(0, outLen);
}
