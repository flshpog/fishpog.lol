# open.fishpog.lol

Drop-in replacement for `open.spotify.com` links so they embed properly on Discord
(and Twitter, Telegram, Slack, iMessage...) even while Spotify's own unfurl is broken.
`spotify.fishpog.lol` is an alias; the code builds every URL from the request host, so
any domain pointed at the project works.

```
https://open.spotify.com/track/4PTG3Z6ehGkBFwjybzWkR8
https://open.fishpog.lol/track/4PTG3Z6ehGkBFwjybzWkR8
```

Humans who click the link are bounced straight to Spotify. Crawlers get a page whose
Open Graph / Twitter / oEmbed metadata mirrors what Spotify itself publishes:
provider "Spotify", the title, "Artist · Album · Song · Year", and the square cover art.

## Embed styles

Prefix the path with a mode. Bare paths use `DEFAULT_MODE` (env var, defaults to `card`).

| mode | url | what Discord gets |
| --- | --- | --- |
| `card` | `/track/ID` | Spotify's own metadata, 1:1. Compact card, cover on the right. |
| `video` | `/video/track/ID` | Same card plus a generated MP4 (cover art on Spotify's tinted background + the 30 s preview) so there's a real inline play button. Tracks and episodes only; other types fall back to `card`. |
| `rich` | `/rich/track/ID` | Card, but the oEmbed document handed to Discord is Spotify's genuine one (`type: rich` with the `open.spotify.com/embed` iframe). Experimental. |
| `player` | `/player/track/ID` | Card plus `twitter:card=player` pointing at the Spotify embed iframe. Experimental. |

`rich` and `player` are attempts to get Discord to show its native Spotify player from a
third-party domain. Discord has stated it won't render arbitrary iframes, so expect them to
look identical to `card`. Test all four in a Discord channel and set `DEFAULT_MODE` to the
winner.

Also handled: `/intl-xx/` prefixes, `/embed/` paths, `?si=` junk, `spotify.link` short
links as `/link/CODE`, and albums / playlists / artists / episodes / shows. Anything else
redirects to the same path on `open.spotify.com`.

## Other routes

- `/oembed?url=...` oEmbed document (provider name/url for Discord)
- `/media/track/ID.jpg` 1280x720 poster
- `/media/track/ID.mp4` poster + 30 s preview, h264/aac
- `/api/meta/track/ID` the resolved metadata as JSON (debugging)

## How metadata is resolved

1. `open.spotify.com/<type>/<id>` fetched with a crawler user agent (Spotify only
   server-renders OG tags for crawlers). This is the source of truth.
2. `open.spotify.com/embed/<type>/<id>` `__NEXT_DATA__` JSON, fetched in parallel. Supplies
   the preview MP3 and Spotify's tint color, and is the fallback if (1) fails.
3. `open.spotify.com/oembed` as a last resort (title + thumbnail only).

Results are cached per warm function instance for an hour, and every response carries
`s-maxage` so Vercel's CDN caches it too.

## Deploying (Vercel)

1. Push this repo. In Vercel, **Add New Project** → import `fishpog.lol` → set
   **Root Directory** to `spotify`. Framework preset: Other. Deploy.
2. Project → Settings → Domains → add `open.fishpog.lol` (and `spotify.fishpog.lol` if you
   want the alias).
3. In Spaceship DNS for `fishpog.lol`, add a record per domain:
   `CNAME  open     →  cname.vercel-dns.com`
   `CNAME  spotify  →  cname.vercel-dns.com`
4. Optional env vars: `DEFAULT_MODE` (`card` | `video` | `rich` | `player`),
   `SITE_NAME` (the provider text at the top of the embed, default `Spotify`).

`ffmpeg-static` is bundled via `includeFiles` in `vercel.json` for the video mode. If the
function ever logs `EACCES` for ffmpeg, the handler copies the binary to `/tmp` and chmods it.

## Local dev

```
cd spotify
npm install
npm run dev          # http://localhost:3000
```

Set `FFMPEG_PATH` to use a system ffmpeg instead of the bundled one.

## Discord caching

Discord caches unfurls per URL for a while. When testing changes, append something
harmless like `?v=2` to force a fresh fetch.
