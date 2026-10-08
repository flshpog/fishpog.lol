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
//   widget  a painted copy of Spotify's player widget as a bare image. This is
//           what Discord shows for native Spotify links. Not playable. Default.
//   preview same picture as the poster of a bare video with the 30s preview, so
//           it plays inline. Discord draws its own play button over it.
//           Tracks and episodes only.
//   card    mirror Spotify's own metadata 1:1 (provider "Spotify", title,
//           "Artist · Album · Song · Year", square cover on the right).
//   video   card + a 16:9 MP4 (cover art + 30s preview). Tracks and episodes.
//
// Everyone gets the same HTML (bots read the tags, humans are bounced to
// open.spotify.com by meta refresh + JS) so responses are safely CDN-cached.

import { spawn } from 'node:child_process';
import { chmod, copyFile, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { LAYOUTS, MAX_WIDTH, MIN_WIDTH, renderWidget, widgetSize } from '../lib/widget.js';
import { fromAppleMusic, fromSoundCloud, fromYouTube, resolveSoundCloudShort } from '../lib/providers.js';
import { coverColors } from '../lib/color.js';

const SPOTIFY = 'https://open.spotify.com';
const TYPES = new Set(['track', 'album', 'playlist', 'artist', 'episode', 'show']);
const MODES = new Set(['widget', 'preview', 'card', 'video']);
const DEFAULT_MODE = MODES.has(process.env.DEFAULT_MODE) ? process.env.DEFAULT_MODE : 'widget';
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
  if (segs[0] === 'media') return media(segs.slice(1), url.searchParams);
  if (segs[0] === 'api' && segs[1] === 'meta') return apiMeta(segs.slice(2), url.searchParams);
  if (segs.length === 0) return redirect(origin + '/'); // landing is static; shouldn't hit here

  const parsed = parseTarget(segs) || parseSwappedDomain(segs, url.searchParams);
  if (!parsed) {
    // Not something we understand: behave like open.spotify.com would.
    return redirect(`${SPOTIFY}/${segs.join('/')}${url.search ? stripOurParams(url) : ''}`);
  }

  const target = await resolveTarget(parsed);
  if (!target) return redirect(parsed.link ? `https://spotify.link/${parsed.link}` : `https://on.soundcloud.com/${parsed.scShort}`);

  let { mode } = target;
  const over = readOverrides(url.searchParams);
  const meta = await applyOverrides(await getMeta(target), over);
  if (!meta) return notFound(origin, target);

  if (mode === 'preview' && !meta.audio) mode = 'widget';
  if (mode === 'video' && !meta.audio) mode = 'card';
  const html = renderEmbedPage({ meta, mode, target, origin, over });
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

// Path shape: /[mode]/[compact|tall]/[w<160-400>]/[intl-xx]/[embed]/<type>/<id>
// Mode, layout and width tokens may appear in any order before the type.
function parseTarget(input) {
  const segs = [...input];
  let mode = DEFAULT_MODE;
  let layout = 'tall';
  let width = MAX_WIDTH;
  for (;;) {
    const s = segs[0];
    if (s && MODES.has(s)) mode = segs.shift();
    else if (s === 'rich' || s === 'player') { segs.shift(); mode = 'card'; } // retired modes
    else if (s && LAYOUTS[s]) layout = segs.shift();
    else if (s && /^w\d{3}$/.test(s)) width = Number(segs.shift().slice(1));
    else if (s && /^intl-[a-z]{2}(-[a-z]+)?$/i.test(s)) segs.shift();
    else if (s === 'embed' || s === 'embed-podcast') segs.shift();
    else break;
  }
  const opts = { mode, layout, width: Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, width)) };
  const [a, b, c, d] = segs;
  // Hand-made: everything comes from ?t= ?a= ?c= ?u=
  if (a === 'custom' && segs.length === 1) return { ...opts, provider: 'custom', type: 'track', id: 'custom', path: 'custom' };
  // Spotify
  if (a === 'link' && b) return { ...opts, provider: 'spotify', link: b };
  if (segs.length >= 2 && TYPES.has(a) && /^[A-Za-z0-9]{22}$/.test(b)) {
    return { ...opts, provider: 'spotify', type: a, id: b, path: `${a}/${b}` };
  }
  // YouTube: /yt/<videoId>
  if (a === 'yt' && b && /^[\w-]{11}$/.test(b)) return { ...opts, provider: 'yt', type: 'track', id: b, path: `yt/${b}` };
  // SoundCloud: /sc/<user>/<slug>, /sc/<user>/sets/<slug>, /sc/on/<code>
  if (a === 'sc' && b === 'on' && c) return { ...opts, provider: 'sc', scShort: c };
  if (a === 'sc' && b && c && /^[\w-]+$/.test(b)) {
    if (c === 'sets' && d && /^[\w-]+$/.test(d)) return { ...opts, provider: 'sc', type: 'playlist', id: `${b}/sets/${d}`, path: `sc/${b}/sets/${d}` };
    if (/^[\w-]+$/.test(c)) return { ...opts, provider: 'sc', type: 'track', id: `${b}/${c}`, path: `sc/${b}/${c}` };
  }
  // Apple Music: /am/<id> or /am/<cc>/<id>
  if (a === 'am' && b && /^\d+$/.test(b)) return { ...opts, provider: 'am', type: 'track', id: b, country: 'us', path: `am/${b}` };
  if (a === 'am' && b && /^[a-z]{2}$/i.test(b) && c && /^\d+$/.test(c)) {
    return { ...opts, provider: 'am', type: 'track', id: c, country: b.toLowerCase(), path: `am/${b.toLowerCase()}/${c}` };
  }
  return null;
}

// Someone swapped the domain by hand on a YouTube or Apple Music link:
//   /watch?v=ID            /shorts/ID
//   /us/album/slug/123?i=456   /us/song/slug/456
function parseSwappedDomain(segs, params) {
  const base = { mode: DEFAULT_MODE, layout: 'tall', width: MAX_WIDTH };
  const v = params.get('v');
  if (segs[0] === 'watch' && v && /^[\w-]{11}$/.test(v)) return { ...base, provider: 'yt', type: 'track', id: v, path: `yt/${v}` };
  if (segs[0] === 'shorts' && segs[1] && /^[\w-]{11}$/.test(segs[1])) return { ...base, provider: 'yt', type: 'track', id: segs[1], path: `yt/${segs[1]}` };
  if (/^[a-z]{2}$/i.test(segs[0] || '') && /^(album|song)$/.test(segs[1] || '')) {
    const last = segs[segs.length - 1];
    const id = params.get('i') || (/^\d+$/.test(last) ? last : null);
    if (id) {
      const cc = segs[0].toLowerCase();
      return { ...base, provider: 'am', type: 'track', id, country: cc, path: `am/${cc}/${id}` };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Overrides: ?t=Title&a=Artist&c=https://cover.jpg on any link, or a fully
// hand-made one at /custom?t=..&a=..&c=..&u=https://where-humans-go
// ---------------------------------------------------------------------------

function readOverrides(params) {
  const clean = (s) => (s || '').toString().replace(/\s+/g, ' ').trim().slice(0, 200);
  const c = clean(params.get('c'));
  const u = clean(params.get('u'));
  return {
    title: clean(params.get('t')),
    artist: clean(params.get('a')),
    cover: /^https?:\/\//i.test(c) ? c : '',
    url: /^https?:\/\//i.test(u) ? u : '',
  };
}

function overrideQuery(over) {
  const q = new URLSearchParams();
  if (over.title) q.set('t', over.title);
  if (over.artist) q.set('a', over.artist);
  if (over.cover) q.set('c', over.cover);
  const s = q.toString();
  return s ? '&' + s : '';
}

async function applyOverrides(meta, over) {
  if (!meta) return meta;
  if (!over.title && !over.artist && !over.cover && !over.url) return meta;
  const out = { ...meta };
  const segs = (meta.description || '').split(' · ').filter(Boolean);
  if (over.title) { out.title = over.title; out.name = over.title; }
  if (over.artist) { out.subtitle = over.artist; if (segs.length) segs[0] = over.artist; else segs.push(over.artist, 'Song'); }
  out.description = segs.join(' · ');
  if (over.url) out.url = over.url;
  if (over.cover && over.cover !== meta.image) {
    out.image = over.cover;
    out.imageWidth = 640;
    out.imageHeight = 640;
    try {
      const colors = await coverColors(await fetchBuffer(over.cover));
      out.color = colors.background;
      out.subdued = colors.subdued;
    } catch (err) {
      console.warn('override cover failed:', err?.message || err);
    }
  }
  return out;
}

// Turn short links into real targets. Returns null if they don't resolve.
async function resolveTarget(t) {
  if (t.link) {
    const r = await resolveShortLink(t.link);
    return r ? { ...t, link: undefined, type: r.type, id: r.id, path: `${r.type}/${r.id}` } : null;
  }
  if (t.scShort) {
    const p = await resolveSoundCloudShort(t.scShort).catch(warn('soundcloud short'));
    return p ? { ...t, scShort: undefined, type: /\/sets\//.test(p) ? 'playlist' : 'track', id: p, path: `sc/${p}` } : null;
  }
  return t;
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

async function getMeta(target) {
  const key = target.path;
  const hit = metaCache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;

  let value = null;
  if (target.provider === 'custom') {
    return { title: '', name: '', subtitle: '', description: '', image: null, imageWidth: 640, imageHeight: 640, audio: null, color: '#3a3a3a', subdued: '#b3b3b3', pill: true, ogType: 'music.song', url: SPOTIFY, source: 'custom' };
  }
  if (target.provider === 'yt') value = await fromYouTube(target.id).catch(warn('youtube'));
  else if (target.provider === 'sc') value = await fromSoundCloud(target.id).catch(warn('soundcloud'));
  else if (target.provider === 'am') value = await fromAppleMusic(target.id, target.country).catch(warn('apple'));
  else value = await getSpotifyMeta(target.type, target.id);

  if (value) metaCache.set(key, { value, expires: Date.now() + META_TTL });
  return value;
}

async function getSpotifyMeta(type, id) {
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
      // Spotify's og:title for albums is "Name - Single by Artist | Spotify"; the widget wants the bare name.
      name: embed?.title || page.title,
      audio: page.audio || embed?.audio || null,
      image: page.image || embed?.image || null,
    };
  } else if (embed) {
    value = embed;
  } else {
    value = await fromOEmbed(type, id).catch(warn('oembed'));
  }
  if (value) value.pill = Boolean(value.audio);
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

function renderEmbedPage({ meta, mode, target, origin, over = {} }) {
  const { path, layout = 'tall', width = MAX_WIDTH } = target;
  const spotifyUrl = meta.url; // where humans end up (Spotify, YouTube, SoundCloud or Apple)
  const ourUrl = `${origin}/${mode === DEFAULT_MODE ? '' : mode + '/'}${path}`;
  const oembedUrl = `${origin}/oembed?url=${encodeURIComponent(ourUrl)}`;
  const bare = mode === 'widget' || mode === 'preview';
  const oq = overrideQuery(over); // "&t=..&a=..&c=.." so the media routes apply the same overrides

  const tags = [];

  if (mode === 'widget') {
    // Bare image embed, no text: a painted copy of Spotify's player widget.
    // Any title/description would make Discord wrap it in a card.
    const size = widgetSize(layout, width);
    const poster = `${origin}/media/${path}.widget.png?layout=${size.layout}&w=${size.width}${oq}`;
    tags.push(
      ['property', 'og:image', poster],
      ['property', 'og:image:type', 'image/png'],
      ['property', 'og:image:width', String(size.canvas.width)],
      ['property', 'og:image:height', String(size.canvas.height)],
      ['name', 'twitter:card', 'summary_large_image'],
      ['name', 'twitter:image', poster],
    );
  } else if (mode === 'preview') {
    // Same picture as the poster of a bare video with the 30s preview.
    // Discord's player has a ~150px minimum height, so this is always the tall layout.
    const size = widgetSize('tall', MAX_WIDTH);
    const mp4 = `${origin}/media/${path}.widget.mp4?x=1${oq}`;
    const poster = `${origin}/media/${path}.widget.png?x=1${oq}`;
    tags.push(
      ['property', 'og:type', 'video.other'],
      ['property', 'og:image', poster],
      ['property', 'og:image:width', String(size.canvas.width)],
      ['property', 'og:image:height', String(size.canvas.height)],
      ['property', 'og:video', mp4],
      ['property', 'og:video:secure_url', mp4],
      ['property', 'og:video:type', 'video/mp4'],
      ['property', 'og:video:width', String(size.canvas.width)],
      ['property', 'og:video:height', String(size.canvas.height)],
      // No title/description on purpose: any text makes Discord wrap the video in a card.
      ['name', 'twitter:card', 'player'],
      ['name', 'twitter:image', poster],
      ['name', 'twitter:player', mp4],
      ['name', 'twitter:player:width', String(size.canvas.width)],
      ['name', 'twitter:player:height', String(size.canvas.height)],
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

  if (bare) {
    // handled above
  } else if (mode === 'video') {
    const mp4 = `${origin}/media/${path}.mp4?x=1${oq}`;
    const poster = `${origin}/media/${path}.jpg?x=1${oq}`;
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
    tags.push(['name', 'twitter:card', 'summary']);
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
${bare ? '' : `<link rel="alternate" type="application/json+oembed" href="${esc(oembedUrl)}" title="${esc(meta.title)}">`}
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

// Where a human should land if we couldn't get metadata for a target.
function originalUrl(t) {
  if (t.provider === 'yt') return `https://www.youtube.com/watch?v=${t.id}`;
  if (t.provider === 'sc') return `https://soundcloud.com/${t.id}`;
  if (t.provider === 'am') return `https://music.apple.com/${t.country || 'us'}/song/${t.id}`;
  return `${SPOTIFY}/${t.type}/${t.id}`;
}

function notFound(origin, target) {
  const back = originalUrl(target);
  const site = { yt: 'YouTube', sc: 'SoundCloud', am: 'Apple Music' }[target.provider] || 'Spotify';
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Not found</title>
<meta property="og:site_name" content="${esc(SITE_NAME)}">
<meta property="og:title" content="Couldn't load this ${esc(target.type)}">
<meta property="og:description" content="${esc(site)} didn't return anything for this link. It may not exist, or ${esc(site)} is having a moment.">
<meta property="og:url" content="${esc(back)}">
<meta name="twitter:card" content="summary">
<meta http-equiv="refresh" content="0;url=${esc(back)}">
</head><body style="background:#0a0a0a;color:#eee;font-family:system-ui;padding:40px">
<p>Couldn't load this ${esc(target.type)}. <a style="color:#1db954" href="${esc(back)}">Open on ${esc(site)}</a></p>
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
  const parsed = parseTarget(new URL(url.searchParams.get('url') || '/', origin).pathname.split('/').filter(Boolean));
  const target = parsed ? await resolveTarget(parsed) : null;
  if (!target) return json({ error: 'bad url' }, 400);

  const meta = await getMeta(target);
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

async function apiMeta(segs, params) {
  const parsed = parseTarget(segs);
  if (!parsed) return json({ error: 'bad path' }, 400);
  const target = await resolveTarget(parsed);
  if (!target) return json({ error: 'short link did not resolve' }, 404);
  const meta = await applyOverrides(await getMeta(target), readOverrides(params));
  return meta ? json({ ...meta, path: target.path, provider: target.provider }, 200, CACHE_HTML) : json({ error: 'not found' }, 404);
}

// ---------------------------------------------------------------------------
// Media: 16:9 poster (cover on Spotify's tinted background) and an MP4 of that
// poster + the 30s preview, so Discord gets a real inline player.
// ---------------------------------------------------------------------------

// /media/<target path>[.widget].(png|jpg|mp4), e.g. /media/track/ID.widget.png, /media/sc/user/slug.widget.png
async function media(segs, params) {
  const last = segs[segs.length - 1] || '';
  const m = last.match(/^(.+?)(\.widget)?\.(mp4|jpg|png)$/);
  if (!m) return text('not found', 404);
  const [widget, ext] = [Boolean(m[2]), m[3]];
  const target = parseTarget([...segs.slice(0, -1), m[1]]);
  if (!target || !target.path) return text('not found', 404);
  // ?layout=compact&w=320 only applies to the PNG; the video poster is always tall/400.
  const size = ext === 'png' ? widgetSize(params.get('layout') || 'tall', params.get('w') || MAX_WIDTH) : widgetSize('tall', MAX_WIDTH);
  if ((widget && ext === 'jpg') || (!widget && ext === 'png')) return text('not found', 404);
  const meta = await applyOverrides(await getMeta(target), readOverrides(params));
  if (!meta) return text('not found', 404);
  if (!meta.image && !(widget && ext === 'png')) return text('not found', 404);
  if (ext === 'mp4' && !meta.audio) return text('no preview available for this item', 404);

  const dir = await mkdtemp(path.join(tmpdir(), 'fishpog-'));
  try {
    const artPath = path.join(dir, 'art.jpg');
    const posterPath = path.join(dir, widget ? 'poster.png' : 'poster.jpg');
    const [art, audio] = await Promise.all([
      meta.image ? fetchBuffer(meta.image) : null,
      ext === 'mp4' ? fetchBuffer(meta.audio) : null,
    ]);
    if (widget) {
      const png = await renderWidget({
        cover: art,
        title: meta.name || meta.title,
        subtitle: meta.subtitle || '',
        background: meta.color || undefined,
        subdued: meta.subdued || undefined,
        preview: Boolean(meta.pill),
        layout: size.layout,
        width: size.width,
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
