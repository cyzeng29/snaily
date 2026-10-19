# snaily

A little postcard you can spin, flip and write on. Built mobile-first; the final product will be a mobile app.

## Run locally

```bash
python3 -m http.server 8080   # then open http://localhost:8080
```

It is a single static page (`index.html`, three.js from cdnjs), so there is no build step.

## Sending (Supabase)

Postcards are sent as links. Setup, once per Supabase project:

1. Run `supabase/schema.sql` in the SQL editor.
2. Turn on Authentication → Sign In / Providers → **Allow anonymous sign-ins**.
3. Put the project URL and the **publishable** key in `js/config.js` (both are public; never the secret key).

A sent card is a row in `postcards` plus `front.jpg` / `back.jpg`, a print per photo (`p0.jpg`, `p1.jpg`, …) and `layout.json` (paper clip or canvas, and where each photo goes) in the private `postcards` bucket. Anyone with the link can see who it's from and when it arrives; the images unlock at `deliver_at` ("by snail" means 8:00 the next morning).

## Deploy

Hosted on Vercel via Git import: every push to `main` deploys to production, and other branches get preview URLs.

## Structure

- `index.html`: the markup: header, bottom nav and the views (`#home`, `#write`, `#board`, `#sent`, `#gallery`, `#settings`)
- `css/app.css`: all styles
- `js/postcard.js`: the 3D postcard (three.js)
- `js/shell.js`: routing, nav, settings and the stamp intro
- `js/store.js`: the local draft (postcard, photos, captions) in IndexedDB, plus photo resizing
- `js/board.js`: the photo board: collage, drag, tap-to-focus caption bubble
- `js/send.js`: the postcard-into-envelope animation
- `js/compose.js`: prints (each photo as a finished polaroid: ink, caption) and the arrangement: the card with its photos paper-clipped to its corner or spread around it on a canvas you can drag them about; shared by the arrange step, the archive and the postcard link
- `js/card3d.js`: the 3D postcard you can turn and flip, for postcards sent before the arrangement existed
- `js/preview.js`: the arrange step (`#sent`): paper clip or canvas, the reorder carousel (drag, arrows, delete with a check), then Send off: the envelope, who it's from and when, and the completion screen once it's really posted
- `js/archive.js`: the Archive (`#gallery`): sent and received postcards; a sent one opens just as it went, from the copy kept on the device
- `js/net.js`, `js/config.js`: sending through Supabase (anonymous sign-in, upload, open by link)
- `js/open.js`: what a postcard link (`?p=<id>`) shows: the card, or the snail still on its way
- `supabase/schema.sql`: the database, functions and storage rules
- `images/`: artwork cropped and recolored from the originals in `images/source/` (`*-dark.png` are the dark-mode versions)
