// Non-Spotify sources that get dressed up as Spotify: YouTube, SoundCloud,
// Apple Music. Each returns the same meta shape the Spotify fetchers do:
//   { title, name, subtitle, description, image, imageWidth, imageHeight,
//     audio, color, subdued, pill, ogType, url, source }

import { coverColors } from './color.js';

const UA = 'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)';
const TIMEOUT = 6000;

export async function fromYouTube(id) {
  const watch = `https://www.youtube.com/watch?v=${id}`;
  // YouTube's oEmbed sometimes refuses datacenter IPs; noembed.com is a second
  // opinion, and if both fail we still return something (the thumbnail always
  // works) so ?t= and ?a= overrides can fill in the rest.
  let o = null;
  try {
    const res = await fetchWithTimeout(`https://www.youtube.com/oembed?url=${encodeURIComponent(watch)}&format=json`);
    if (res.status === 404 || res.status === 401) return null; // genuinely no such video
    if (res.ok) o = await res.json();
    else console.warn(`youtube oembed ${res.status}`);
  } catch (err) {
    console.warn('youtube oembed failed:', err?.message || err);
  }
  if (!o) {
    try {
      const res = await fetchWithTimeout(`https://noembed.com/embed?url=${encodeURIComponent(watch)}`);
      const j = res.ok ? await res.json() : null;
      if (j && j.title && !j.error) o = j;
    } catch (err) {
      console.warn('noembed failed:', err?.message || err);
    }
  }
  o = o || { title: '', author_name: '' };
  // maxresdefault only exists for HD uploads; fall back to the 480x360 one.
  let image = `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
  const head = await fetchWithTimeout(image, { method: 'HEAD' }).catch(() => null);
  if (!head || !head.ok) image = o.thumbnail_url || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  const author = (o.author_name || '').replace(/\s*-\s*Topic$/i, '').replace(/VEVO$/i, '');
  return finish({
    title: o.title,
    name: cleanTitle(o.title, author),
    subtitle: author,
    description: `${author} · Song`,
    image,
    imageWidth: 1280,
    imageHeight: 720,
    audio: null,
    ogType: 'music.song',
    url: watch,
    source: 'youtube',
  });
}

export async function fromSoundCloud(path) {
  const page = `https://soundcloud.com/${path}`;
  const res = await fetchWithTimeout(`https://soundcloud.com/oembed?url=${encodeURIComponent(page)}&format=json`);
  if (res.status === 404 || res.status === 403) return null;
  if (!res.ok) throw new Error(`soundcloud oembed ${res.status}`);
  const o = await res.json();
  const author = o.author_name || '';
  const name = String(o.title || '').replace(new RegExp(`\\s+by\\s+${escapeRe(author)}$`, 'i'), '');
  const isSet = /\/sets\//.test(path);
  return finish({
    title: name,
    name,
    subtitle: author,
    description: `${author} · ${isSet ? 'Playlist' : 'Song'}`,
    image: (o.thumbnail_url || '').replace('-large.', '-t500x500.') || null,
    imageWidth: 500,
    imageHeight: 500,
    audio: null,
    ogType: isSet ? 'music.playlist' : 'music.song',
    url: page,
    source: 'soundcloud',
  });
}

export async function fromAppleMusic(id, country = 'us') {
  const res = await fetchWithTimeout(`https://itunes.apple.com/lookup?id=${encodeURIComponent(id)}&country=${encodeURIComponent(country)}`);
  if (!res.ok) throw new Error(`itunes lookup ${res.status}`);
  const data = await res.json();
  const r = data.results?.[0];
  if (!r) return null;
  const isTrack = r.wrapperType === 'track';
  const year = (r.releaseDate || '').slice(0, 4);
  const image = (r.artworkUrl100 || r.artworkUrl60 || '').replace(/\/\d+x\d+bb\./, '/640x640bb.') || null;
  const title = isTrack ? r.trackName : r.collectionName;
  return finish({
    title,
    name: title,
    subtitle: r.artistName,
    description: isTrack
      ? [r.artistName, r.collectionName, 'Song', year].filter(Boolean).join(' · ')
      : [r.artistName, 'Album', year, r.trackCount ? `${r.trackCount} songs` : ''].filter(Boolean).join(' · '),
    image,
    imageWidth: 640,
    imageHeight: 640,
    audio: isTrack ? r.previewUrl || null : null,
    ogType: isTrack ? 'music.song' : 'music.album',
    url: isTrack ? r.trackViewUrl : r.collectionViewUrl,
    source: 'apple',
  });
}

/** Resolve on.soundcloud.com/<code> to a soundcloud.com path, or null. */
export async function resolveSoundCloudShort(code) {
  const res = await fetchWithTimeout(`https://on.soundcloud.com/${code}`, { redirect: 'manual' });
  const loc = res.headers.get('location') || '';
  const m = loc.match(/soundcloud\.com\/([\w-]+(?:\/sets)?\/[\w-]+)/i);
  return m ? m[1] : null;
}

// Spotify-style tint from the artwork; the PREVIEW pill always shows for
// track-like things, which is what Discord's native widget does.
async function finish(meta) {
  let colors = { background: null, subdued: null };
  if (meta.image) {
    try {
      const res = await fetchWithTimeout(meta.image);
      if (res.ok) colors = await coverColors(Buffer.from(await res.arrayBuffer()));
    } catch (err) {
      console.warn('cover colour failed:', err?.message || err);
    }
  }
  return { ...meta, color: colors.background, subdued: colors.subdued, pill: meta.ogType === 'music.song' };
}

function cleanTitle(title, author) {
  // "Artist - Song (Official Video)" -> "Song" when the artist is the channel.
  let t = String(title || '');
  t = t.replace(/\s*[\(\[][^\)\]]*(official|video|audio|lyric|visuali[sz]er|hd|4k|remaster)[^\)\]]*[\)\]]\s*/gi, ' ');
  if (author) {
    const re = new RegExp(`^${escapeRe(author)}\\s*[-–—:]\\s*`, 'i');
    t = t.replace(re, '');
  }
  return t.trim() || title;
}

function escapeRe(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function fetchWithTimeout(url, init = {}, ms = TIMEOUT) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, headers: { 'user-agent': UA, ...(init.headers || {}) }, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}
