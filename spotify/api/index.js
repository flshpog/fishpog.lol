// open.fishpog.lol (alias: spotify.fishpog.lol) - a drop-in replacement for
// open.spotify.com links that gives Discord (and Twitter/Telegram/etc.) a proper
// embed even when Spotify's own unfurl is broken.
//
// Usage: swap "open.spotify.com" for "open.fishpog.lol" in any link.
// Nothing here hardcodes the host; every URL is built from the request.
//
//   https://open.fishpog.lol/track/4PTG3Z6ehGkBFwjybzWkR8
//   https://open.fishpog.lol/video/track/4PTG3Z6ehGkBFwjybzWkR8   (mode prefix)
//
// Modes (prefix the path, or set DEFAULT_MODE env for bare paths):
//   card    mirror Spotify's own metadata 1:1 (provider "Spotify", title,
//           "Artist · Album · Song · Year", square cover). Default.
//   rich    card + proxies Spotify's real oEmbed (type "rich" with the
//           open.spotify.com iframe). Discord may or may not honor it.
//   player  card + twitter:player pointing at the Spotify embed iframe.
//   video   card + a generated MP4 (cover art + 30s preview) so the embed has
//           a real inline play button. Tracks and episodes only.
//
// Everyone gets the same HTML (bots read the tags, humans are bounced to
// open.spotify.com by meta refresh + JS) so responses are safely CDN-cached.

import { spawn } from 'node:child_process';
import { chmod, copyFile, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { WIDGET_HEIGHT, WIDGET_WIDTH, renderWidget } from '../lib/widget.js';

const SPOTIFY = 'https://open.spotify.com';
const TYPES = new Set(['track', 'album', 'playlist', 'artist', 'episode', 'show']);
const MODES = new Set(['card', 'rich', 'player', 'video', 'widget']);
const DEFAULT_MODE = MODES.has(process.env.DEFAULT_MODE) ? process.env.DEFAULT_MODE : 'card';
const SITE_NAME = process.env.SITE_NAME || 'Spotify';
// Spotify only server-renders OG tags for crawlers; browser UAs get the JS app shell.
const BROWSER_UA = 'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)';
const FETCH_TIMEOUT_MS = 6000;
const GENERIC_TITLE = 'Spotify - Web Player: Music for everyone';

const CACHE_HTML = 'public, s-maxage=3600, stale-while-revalidate=86400';
const CACHE_MEDIA = 'public, s-maxage=2592000, max-age=86400, immutable';

// ---------------------------------------------------------------------------
// Entry points (Vercel web-standard handlers)
// ---------------------------------------------------------------------------

export async function GET(request) {
  try {
    return await handle(request);
  } catch (err) {
    console.error(err);
    return text(`error: ${err?.message || err}`, 500);
  }
}

export async function HEAD(request) {
  const res = await GET(request);
  return new Response(null, { status: res.status, headers: res.headers });
}

async function handle(request) {
  const url = new URL(request.url);
  const origin = publicOrigin(request, url);
  // vercel.json rewrites "/:path*" to "/api/index?p=:path*"; fall back to the real path.
  const rawPath = url.searchParams.get('p') ?? url.pathname.replace(/^\/api\/index\/?/, '/');
  const segs = ('/' + rawPath).split('/').filter(Boolean);

  if (segs[0] === 'oembed') return oembed(url, origin);
  if (segs[0] === 'media') return media(segs.slice(1), origin);
  if (segs[0] === 'api' && segs[1] === 'meta') return apiMeta(segs.slice(2));
  if (segs.length === 0) return redirect(origin + '/'); // landing is static; shouldn't hit here

  const target = parseTarget(segs);
  if (!target) {
    // Not something we understand: behave like open.spotify.com would.
    return redirect(`${SPOTIFY}/${segs.join('/')}${url.search ? stripOurParams(url) : ''}`);
  }

  let { mode, type, id } = target;
  if (target.link) {
    const resolved = await resolveShortLink(target.link);
    if (!resolved) return redirect(`https://spotify.link/${target.link}`);
    ({ type, id } = resolved);
  }

  const meta = await getMeta(type, id);
  if (!meta) return notFound(origin, type, id);

  if ((mode === 'video' || mode === 'widget') && !meta.audio) mode = 'card';
  const html = renderEmbedPage({ meta, mode, type, id, origin });
  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': CACHE_HTML,
      'x-fishpog-mode': mode,
    },
  });
}

// ---------------------------------------------------------------------------
// Routing helpers
// ---------------------------------------------------------------------------

function parseTarget(input) {
  const segs = [...input];
  let mode = DEFAULT_MODE;
  if (segs.length && MODES.has(segs[0])) mode = segs.shift();
  if (segs[0] && /^intl-[a-z]{2}(-[a-z]+)?$/i.test(segs[0])) segs.shift();
  if (segs[0] === 'embed' || segs[0] === 'embed-podcast') segs.shift();
  if (segs[0] === 'link' && segs[1]) return { mode, link: segs[1] };
  if (segs.length >= 2 && TYPES.has(segs[0]) && /^[A-Za-z0-9]{22}$/.test(segs[1])) {
    return { mode, type: segs[0], id: segs[1] };
  }
  return null;
}

function publicOrigin(request, url) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || url.host;
  const proto = request.headers.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

function stripOurParams(url) {
  const q = new URLSearchParams(url.search);
  q.delete('p');
  const s = q.toString();
  return s ? `?${s}` : '';
}

async function resolveShortLink(code) {
  try {
    const res = await fetchWithTimeout(`https://spotify.link/${code}`, {
      redirect: 'manual',
      headers: { 'user-agent': BROWSER_UA },
    });
    const loc = res.headers.get('location') || '';
    const m = loc.match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(track|album|playlist|artist|episode|show)\/([A-Za-z0-9]{22})/i);
    if (m) return { type: m[1].toLowerCase(), id: m[2] };
  } catch (err) {
    console.warn('short link resolve failed', err?.message);
  }
  return null;
}

// ---------------------------------------------------------------------------
// Metadata: Spotify page OG tags (primary) + embed page JSON (color, preview)
// + oEmbed (last resort). Results are memoised per warm function instance.
// ---------------------------------------------------------------------------

const metaCache = new Map();
const META_TTL = 60 * 60 * 1000;

async function getMeta(type, id) {
  const key = `${type}/${id}`;
  const hit = metaCache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;

  const [page, embed] = await Promise.all([
    fromPage(type, id).catch(warn('page')),
    fromEmbed(type, id).catch(warn('embed')),
  ]);

  let value = null;
  if (page) {
    value = {
      ...page,
      color: embed?.color || null,
      subdued: embed?.subdued || null,
      // Widget line two: artists for tracks, otherwise the first " · " segment of Spotify's description.
      subtitle: embed?.subtitle || page.description.split(' · ')[0] || '',
      audio: page.audio || embed?.audio || null,
      image: page.image || embed?.image || null,
    };
  } else if (embed) {
    value = embed;
  } else {
    value = await fromOEmbed(type, id).catch(warn('oembed'));
  }
  if (value) metaCache.set(key, { value, expires: Date.now() + META_TTL });
  return value;
}

function warn(label) {
  return (err) => {
    console.warn(`${label} failed:`, err?.message || err);
    return null;
  };
}

async function fromPage(type, id) {
  const res = await fetchWithTimeout(`${SPOTIFY}/${type}/${id}`, {
    headers: { 'user-agent': BROWSER_UA, 'accept-language': 'en' },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`spotify page ${res.status}`);
  const html = await res.text();
  const tags = parseMetaTags(html);
  const title = tags['og:title'];
  if (!title || title === GENERIC_TITLE) return null; // Spotify's "nothing here" fallback page
  return {
    title,
    description: tags['og:description'] || tags['description'] || '',
    image: tags['og:image'] || null,
    imageWidth: Number(tags['og:image:width']) || 640,
    imageHeight: Number(tags['og:image:height']) || 640,
    audio: tags['og:audio'] || null,
    ogType: tags['og:type'] || ogTypeFor(type),
    url: `${SPOTIFY}/${type}/${id}`,
    source: 'page',
  };
}

async function fromEmbed(type, id) {
  const res = await fetchWithTimeout(`${SPOTIFY}/embed/${type}/${id}`, {
    headers: { 'user-agent': BROWSER_UA, 'accept-language': 'en' },
  });
  if (!res.ok) throw new Error(`spotify embed ${res.status}`);
  const html = await res.text();
  const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
  if (!m) throw new Error('no __NEXT_DATA__');
  const data = JSON.parse(m[1]);
  const entity = data?.props?.pageProps?.state?.data?.entity;
  if (!entity) return null;

  const images = entity.visualIdentity?.image || entity.coverArt?.sources || [];
  const best = [...images].sort((a, b) => (b.maxWidth || b.width || 0) - (a.maxWidth || a.width || 0))[0];
  const bg = entity.visualIdentity?.backgroundBase;
  const color = bg ? rgbToHex(bg.red, bg.green, bg.blue) : null;
  const artists = (entity.artists || []).map((a) => a.name).filter(Boolean).join(', ');
  const year = entity.releaseDate?.isoString?.slice(0, 4);
  const label = { track: 'Song', album: 'Album', playlist: 'Playlist', artist: 'Artist', episode: 'Episode', show: 'Podcast' }[type];
  const description = [artists || entity.subtitle, label, year].filter(Boolean).join(' · ');

  const sub = entity.visualIdentity?.textSubdued;
  return {
    title: entity.title || entity.name || '',
    description,
    subtitle: artists || entity.subtitle || '',
    image: best?.url || null,
    imageWidth: best?.maxWidth || best?.width || 640,
    imageHeight: best?.maxHeight || best?.height || 640,
    audio: entity.audioPreview?.url || null,
    color,
    subdued: sub ? rgbToHex(sub.red, sub.green, sub.blue) : null,
    ogType: ogTypeFor(type),
    url: `${SPOTIFY}/${type}/${id}`,
    source: 'embed',
  };
}

async function fromOEmbed(type, id) {
  const json = await fetchSpotifyOEmbed(`${SPOTIFY}/${type}/${id}`);
  if (!json?.title) return null;
  return {
    title: json.title,
    description: '',
    image: json.thumbnail_url || null,
    imageWidth: json.thumbnail_width || 300,
    imageHeight: json.thumbnail_height || 300,
    audio: null,
    color: null,
    ogType: ogTypeFor(type),
    url: `${SPOTIFY}/${type}/${id}`,
    source: 'oembed',
  };
}

async function fetchSpotifyOEmbed(spotifyUrl) {
  const res = await fetchWithTimeout(`${SPOTIFY}/oembed?url=${encodeURIComponent(spotifyUrl)}`, {
    headers: { 'user-agent': BROWSER_UA },
  });
  if (!res.ok) throw new Error(`spotify oembed ${res.status}`);
  return res.json();
}

function ogTypeFor(type) {
  return { track: 'music.song', album: 'music.album', playlist: 'music.playlist', artist: 'profile', episode: 'website', show: 'website' }[type] || 'website';
}

function parseMetaTags(html) {
  const out = {};
  const head = html.split(/<\/head>/i)[0] || html;
  for (const tag of head.match(/<meta\s[^>]*>/gi) || []) {
    const attrs = {};
    for (const m of tag.matchAll(/([\w:.-]+)\s*=\s*"([^"]*)"/g)) attrs[m[1].toLowerCase()] = decodeEntities(m[2]);
    const key = attrs.property || attrs.name;
    if (key && attrs.content !== undefined && !(key in out)) out[key] = attrs.content;
  }
  return out;
}

function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((n) => Math.max(0, Math.min(255, n | 0)).toString(16).padStart(2, '0')).join('');
}

async function fetchWithTimeout(url, init = {}, ms = FETCH_TIMEOUT_MS) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

// ---------------------------------------------------------------------------
// HTML rendering
// ---------------------------------------------------------------------------

function renderEmbedPage({ meta, mode, type, id, origin }) {
  const spotifyUrl = meta.url;
  const ourUrl = `${origin}/${mode === DEFAULT_MODE ? '' : mode + '/'}${type}/${id}`;
  const oembedUrl = `${origin}/oembed?url=${encodeURIComponent(ourUrl)}&mode=${mode}&type=${type}&id=${id}`;
  const embedIframe = `${SPOTIFY}/embed/${type}/${id}`;
  const playerHeight = type === 'track' || type === 'episode' ? 152 : 352;

  const tags = [];

  if (mode === 'widget') {
    // Bare video embed, no text: a painted copy of Spotify's player widget as the
    // poster, with the 30s preview as the video. This is what Discord shows natively.
    const mp4 = `${origin}/media/${type}/${id}.widget.mp4`;
    const poster = `${origin}/media/${type}/${id}.widget.png`;
    tags.push(
      ['property', 'og:type', 'video.other'],
      ['property', 'og:image', poster],
      ['property', 'og:image:width', String(WIDGET_WIDTH)],
      ['property', 'og:image:height', String(WIDGET_HEIGHT)],
      ['property', 'og:video', mp4],
      ['property', 'og:video:secure_url', mp4],
      ['property', 'og:video:type', 'video/mp4'],
      ['property', 'og:video:width', String(WIDGET_WIDTH)],
      ['property', 'og:video:height', String(WIDGET_HEIGHT)],
      // No title/description on purpose: any text makes Discord wrap the video in a card.
      ['name', 'twitter:card', 'player'],
      ['name', 'twitter:image', poster],
      ['name', 'twitter:player', mp4],
      ['name', 'twitter:player:width', String(WIDGET_WIDTH)],
      ['name', 'twitter:player:height', String(WIDGET_HEIGHT)],
      ['name', 'twitter:player:stream', mp4],
      ['name', 'twitter:player:stream:content_type', 'video/mp4'],
    );
  } else {
    tags.push(
      ['property', 'og:site_name', SITE_NAME],
      ['property', 'og:title', meta.title],
      ['property', 'og:description', meta.description],
      ['property', 'og:url', spotifyUrl],
      ['property', 'og:type', meta.ogType],
      ['name', 'twitter:site', '@spotify'],
      ['name', 'twitter:title', meta.title],
      ['name', 'twitter:description', meta.description],
    );
  }

  if (mode === 'widget') {
    // handled above
  } else if (mode === 'video') {
    const mp4 = `${origin}/media/${type}/${id}.mp4`;
    const poster = `${origin}/media/${type}/${id}.jpg`;
    tags.push(
      ['property', 'og:image', poster],
      ['property', 'og:image:width', '1280'],
      ['property', 'og:image:height', '720'],
      ['property', 'og:video', mp4],
      ['property', 'og:video:secure_url', mp4],
      ['property', 'og:video:type', 'video/mp4'],
      ['property', 'og:video:width', '1280'],
      ['property', 'og:video:height', '720'],
      ['name', 'twitter:card', 'player'],
      ['name', 'twitter:image', poster],
      ['name', 'twitter:player', mp4],
      ['name', 'twitter:player:width', '1280'],
      ['name', 'twitter:player:height', '720'],
      ['name', 'twitter:player:stream', mp4],
      ['name', 'twitter:player:stream:content_type', 'video/mp4'],
    );
  } else {
    if (meta.image) {
      tags.push(
        ['property', 'og:image', meta.image],
        ['property', 'og:image:width', String(meta.imageWidth)],
        ['property', 'og:image:height', String(meta.imageHeight)],
        ['name', 'twitter:image', meta.image],
      );
    }
    if (mode === 'player') {
      tags.push(
        ['name', 'twitter:card', 'player'],
        ['name', 'twitter:player', embedIframe],
        ['name', 'twitter:player:width', '456'],
        ['name', 'twitter:player:height', String(playerHeight)],
      );
    } else {
      tags.push(['name', 'twitter:card', 'summary']);
    }
    if (meta.audio) tags.push(['property', 'og:audio', meta.audio], ['property', 'og:audio:type', 'audio/mpeg']);
  }

  const metaHtml = tags
    .filter(([, , v]) => v !== undefined && v !== null && v !== '')
    .map(([attr, k, v]) => `<meta ${attr}="${esc(k)}" content="${esc(v)}">`)
    .join('\n');

  const accent = meta.color || '#1db954';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(meta.title)}</title>
<meta http-equiv="refresh" content="0;url=${esc(spotifyUrl)}">
<link rel="canonical" href="${esc(spotifyUrl)}">
${mode === 'widget' ? '' : `<link rel="alternate" type="application/json+oembed" href="${esc(oembedUrl)}" title="${esc(meta.title)}">`}
${metaHtml}
<style>
  html,body{margin:0;min-height:100%;background:#0a0a0a;color:#f5f5f5;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
  main{min-height:100vh;display:grid;place-items:center;padding:24px}
  .card{display:flex;gap:18px;align-items:center;background:${esc(accent)};border-radius:16px;padding:18px;max-width:480px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.6)}
  .card img{width:96px;height:96px;border-radius:8px;object-fit:cover;background:#222}
  .card h1{font-size:1.1rem;margin:0 0 4px}
  .card p{margin:0;opacity:.85;font-size:.9rem}
  .card a{color:#fff}
  .hint{margin-top:16px;opacity:.6;font-size:.85rem}
</style>
</head>
<body>
<main>
  <div>
    <div class="card">
      ${meta.image ? `<img src="${esc(meta.image)}" alt="">` : ''}
      <div>
        <h1>${esc(meta.title)}</h1>
        <p>${esc(meta.description)}</p>
        <p style="margin-top:8px"><a href="${esc(spotifyUrl)}">Open in Spotify</a></p>
      </div>
    </div>
    <p class="hint">Redirecting you to Spotify…</p>
  </div>
</main>
<script>location.replace(${JSON.stringify(spotifyUrl)});</script>
</body>
</html>`;
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function notFound(origin, type, id) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Not found</title>
<meta property="og:site_name" content="${esc(SITE_NAME)}">
<meta property="og:title" content="Couldn't load this ${esc(type)}">
<meta property="og:description" content="Spotify didn't return anything for this link. It may not exist, or Spotify is having a moment.">
<meta property="og:url" content="${esc(SPOTIFY)}/${esc(type)}/${esc(id)}">
<meta name="twitter:card" content="summary">
<meta http-equiv="refresh" content="0;url=${esc(SPOTIFY)}/${esc(type)}/${esc(id)}">
</head><body style="background:#0a0a0a;color:#eee;font-family:system-ui;padding:40px">
<p>Couldn't load this ${esc(type)}. <a style="color:#1db954" href="${esc(SPOTIFY)}/${esc(type)}/${esc(id)}">Open on Spotify</a></p>
</body></html>`;
  return new Response(html, {
    status: 404,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, s-maxage=120' },
  });
}

// ---------------------------------------------------------------------------
// oEmbed endpoint (Discord reads provider_name / provider_url / author from it)
// ---------------------------------------------------------------------------

async function oembed(url, origin) {
  const mode = url.searchParams.get('mode') || DEFAULT_MODE;
  let type = url.searchParams.get('type');
  let id = url.searchParams.get('id');
  if (!type || !id) {
    const target = parseTarget(new URL(url.searchParams.get('url') || '/', origin).pathname.split('/').filter(Boolean));
    if (target && target.type) ({ type, id } = target);
  }
  if (!type || !id) return json({ error: 'bad url' }, 400);

  if (mode === 'rich') {
    // Hand back Spotify's genuine oEmbed document (type "rich", iframe html).
    const real = await fetchSpotifyOEmbed(`${SPOTIFY}/${type}/${id}`).catch(warn('oembed proxy'));
    if (real) return json(real, 200, CACHE_HTML);
  }

  const meta = await getMeta(type, id);
  if (!meta) return json({ error: 'not found' }, 404);
  return json(
    {
      version: '1.0',
      type: 'link',
      provider_name: SITE_NAME,
      provider_url: 'https://spotify.com',
      title: meta.title,
      thumbnail_url: meta.image || undefined,
      thumbnail_width: meta.image ? meta.imageWidth : undefined,
      thumbnail_height: meta.image ? meta.imageHeight : undefined,
    },
    200,
    CACHE_HTML,
  );
}

async function apiMeta(segs) {
  const target = parseTarget(segs);
  if (!target) return json({ error: 'bad path' }, 400);
  let { type, id } = target;
  if (target.link) {
    const resolved = await resolveShortLink(target.link);
    if (!resolved) return json({ error: 'short link did not resolve' }, 404);
    ({ type, id } = resolved);
  }
  const meta = await getMeta(type, id);
  return meta ? json(meta, 200, CACHE_HTML) : json({ error: 'not found' }, 404);
}

// ---------------------------------------------------------------------------
// Media: 16:9 poster (cover on Spotify's tinted background) and an MP4 of that
// poster + the 30s preview, so Discord gets a real inline player.
// ---------------------------------------------------------------------------

async function media(segs, origin) {
  const m = segs.length === 2 && TYPES.has(segs[0]) ? segs[1].match(/^([A-Za-z0-9]{22})(\.widget)?\.(mp4|jpg|png)$/) : null;
  if (!m) return text('not found', 404);
  const [type, id, widget, ext] = [segs[0], m[1], Boolean(m[2]), m[3]];
  if ((widget && ext === 'jpg') || (!widget && ext === 'png')) return text('not found', 404);
  const meta = await getMeta(type, id);
  if (!meta || !meta.image) return text('not found', 404);
  if (ext === 'mp4' && !meta.audio) return text('no preview available for this item', 404);

  const dir = await mkdtemp(path.join(tmpdir(), 'fishpog-'));
  try {
    const artPath = path.join(dir, 'art.jpg');
    const posterPath = path.join(dir, widget ? 'poster.png' : 'poster.jpg');
    const [art, audio] = await Promise.all([
      fetchBuffer(meta.image),
      ext === 'mp4' ? fetchBuffer(meta.audio) : null,
    ]);
    if (widget) {
      const png = await renderWidget({
        cover: art,
        title: meta.title,
        subtitle: meta.subtitle || '',
        background: meta.color || undefined,
        subdued: meta.subdued || undefined,
      });
      await writeFile(posterPath, png);
    } else {
      await writeFile(artPath, art);
      await makePoster(artPath, posterPath, meta.color || '#282828');
    }
    if (ext !== 'mp4') {
      return new Response(await readFile(posterPath), {
        headers: { 'content-type': widget ? 'image/png' : 'image/jpeg', 'cache-control': CACHE_MEDIA },
      });
    }
    const audioPath = path.join(dir, 'preview.mp3');
    const outPath = path.join(dir, 'out.mp4');
    await writeFile(audioPath, audio);
    await makeVideo(posterPath, audioPath, outPath);
    const buf = await readFile(outPath);
    return new Response(buf, {
      headers: {
        'content-type': 'video/mp4',
        'content-length': String(buf.length),
        'accept-ranges': 'bytes',
        'cache-control': CACHE_MEDIA,
      },
    });
  } finally {
    rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

async function fetchBuffer(url) {
  const res = await fetchWithTimeout(url, { headers: { 'user-agent': BROWSER_UA } }, 10000);
  if (!res.ok) throw new Error(`fetch ${url} -> ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function makePoster(artPath, outPath, hex) {
  const color = /^#[0-9a-f]{6}$/i.test(hex) ? hex : '#282828';
  await ffmpeg([
    '-y', '-loglevel', 'error',
    '-f', 'lavfi', '-i', `color=c=${color.replace('#', '0x')}:s=1280x720`,
    '-i', artPath,
    '-filter_complex',
    '[1:v]scale=560:560:force_original_aspect_ratio=decrease[fg];' +
      '[0:v][fg]overlay=(W-w)/2:(H-h)/2:shortest=1,format=yuvj420p[v]',
    '-map', '[v]', '-frames:v', '1', '-q:v', '3', outPath,
  ]);
}

async function makeVideo(posterPath, audioPath, outPath) {
  await ffmpeg([
    '-y', '-loglevel', 'error',
    '-loop', '1', '-framerate', '1', '-i', posterPath,
    '-i', audioPath,
    '-map', '0:v', '-map', '1:a',
    '-c:v', 'libx264', '-preset', 'veryfast', '-tune', 'stillimage', '-pix_fmt', 'yuv420p', '-r', '1',
    '-c:a', 'aac', '-b:a', '160k',
    '-shortest', '-movflags', '+faststart',
    outPath,
  ]);
}

let ffmpegBinPromise;
async function ffmpegBin() {
  if (!ffmpegBinPromise) {
    ffmpegBinPromise = (async () => {
      if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH;
      const mod = await import('ffmpeg-static');
      return mod.default || mod;
    })();
  }
  return ffmpegBinPromise;
}

async function ffmpeg(args) {
  let bin = await ffmpegBin();
  try {
    return await run(bin, args);
  } catch (err) {
    if (err?.code !== 'EACCES' && !/EACCES/.test(String(err?.message))) throw err;
    // Bundled binary lost its exec bit: copy to /tmp and chmod.
    const copy = path.join(tmpdir(), 'ffmpeg');
    await copyFile(bin, copy);
    await chmod(copy, 0o755);
    ffmpegBinPromise = Promise.resolve(copy);
    return run(copy, args);
  }
}

function run(bin, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (d) => (stderr += d));
    child.on('error', reject);
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}: ${stderr.slice(-800)}`))));
  });
}

// ---------------------------------------------------------------------------
// Small response helpers
// ---------------------------------------------------------------------------

function json(body, status = 200, cache = 'no-store') {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': cache, 'access-control-allow-origin': '*' },
  });
}

function text(body, status = 200) {
  return new Response(body, { status, headers: { 'content-type': 'text/plain; charset=utf-8' } });
}

function redirect(location) {
  return new Response(null, { status: 302, headers: { location, 'cache-control': 'public, s-maxage=3600' } });
}
