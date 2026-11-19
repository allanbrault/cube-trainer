# Cube Trainer

Static site served by a Cloudflare Worker (`cube-oll-pll`) at https://cube.lyuz.net.

- `/` — two-look OLL & PLL on a 3D cube, with a last-layer drill timer (`public/index.html`)
- `/timer` — full-solve timer: random-state scrambles, inspection, +2 / DNF, ao5 / ao12 / ao100 (`public/timer.html`)

```sh
npm install        # once: installs wrangler
npm run dev        # local server on http://localhost:8787
npm test           # cube model, scrambler, timing rules, algorithm database
npm run deploy     # runs the tests, then publishes ./public to the Worker
```

`npm run deploy` publishes whatever is in the working tree, committed or not, straight to
production. It needs a one-time `npx wrangler login`.

## Layout

- `public/js/cube.js` — sticker-level cube model (applies any move notation)
- `public/js/scrambler.js` — uniform random cube state + two-phase solver; runs in `scramble-worker.js`
- `public/js/timer-core.js` — WCA timing rules: truncation, penalties, averages
- `test/` — `node --test` suites; not deployed. `SCRAMBLES=1500 npm test` checks more scrambles
