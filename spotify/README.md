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

Prefix the path with a mode. Bare paths use `DEFAULT_MODE` (env var, defaults to `widget`).

| mode | url | what Discord gets |
| --- | --- | --- |
| `widget` | `/track/ID` | A painted copy of Spotify's player widget as a bare image. Add `compact/` for the 80px variant (the one Discord itself shows) and `w<px>/` for a width between 160 and 400, e.g. `/compact/w300/track/ID`. Discord shows images at their real pixel size, so the PNG is painted at exactly that width (2.5x at 400). That is what Discord shows for a working native Spotify link, minus the ability to click play. Rendered with `@napi-rs/canvas` in Spotify's own tint colours. Works for every type. Default. |
| `preview` | `/preview/track/ID` | The same picture as the poster of a bare video embed with the 30 s preview, so it plays inline. Discord draws its own play button in the middle. Tracks and episodes only; otherwise falls back to `widget`. |
| `card` | `/card/track/ID` | Spotify's own metadata, 1:1. Compact card, cover on the right. |
| `video` | `/video/track/ID` | Card plus a 16:9 MP4 (cover art on Spotify's tinted background + the 30 s preview). Tracks and episodes only; otherwise falls back to `card`. |

Neither the widget nor the preview page carries a title or description: any text makes
Discord wrap the media in a card instead of showing it bare.

## Other services, dressed as Spotify

YouTube, SoundCloud and Apple Music links get the same treatment: metadata comes from
each service's public endpoint, a Spotify-style tint is derived from the artwork
(`lib/color.js`), and the result goes through the exact same widget and card renderers.
Humans who click are sent to the original service.

| source | our path | metadata from |
| --- | --- | --- |
| `youtube.com/watch?v=ID`, `youtu.be/ID`, shorts, music.youtube.com | `/yt/ID` | YouTube oEmbed + `i.ytimg.com` thumbnail (centre-cropped square) |
| `soundcloud.com/user/slug`, `.../user/sets/slug`, `on.soundcloud.com/code` | `/sc/user/slug`, `/sc/user/sets/slug`, `/sc/on/code` | SoundCloud oEmbed |
| `music.apple.com/cc/album/.../ID?i=TRACK`, `.../song/.../ID` | `/am/cc/ID` (or `/am/ID`, US) | iTunes lookup API (also gives a 30 s preview, so `preview` and `video` work) |

Mode and size tokens go in front as usual: `/compact/w300/yt/dQw4w9WgXcQ`.

Also handled: `/intl-xx/` prefixes, `/embed/` paths, `?si=` junk, `spotify.link` short
links as `/link/CODE`, and albums / playlists / artists / episodes / shows. Anything else
redirects to the same path on `open.spotify.com`.

## Other routes

- `/oembed?url=...` oEmbed document (provider name/url for Discord)
- `/media/track/ID.jpg` 1280x720 poster
- `/media/track/ID.mp4` poster + 30 s preview, h264/aac
- `/media/track/ID.widget.png?layout=tall|compact&w=160..400` painted Spotify widget
- `/media/track/ID.widget.mp4` widget + 30 s preview
- `/api/meta/<path>` the resolved metadata as JSON for any target (debugging, and the landing page preview)

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
4. Optional env vars: `DEFAULT_MODE` (`widget` | `preview` | `card` | `video`),
   `SITE_NAME` (the provider text at the top of the embed, default `Spotify`).

`ffmpeg-static`, the `assets/` fonts and `lib/` are bundled via `includeFiles` in `vercel.json` for the video and widget modes. If the
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
