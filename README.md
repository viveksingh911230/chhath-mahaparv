# छठ महापर्व – सूर्य देव की पावन यात्रा
## Chhath Mahaparv – The Sacred Journey of Surya Dev

**▶ Play online:** https://viveksingh911230.github.io/chhath-mahaparv/ · also on itch.io

Made by **Genius Bro!** — https://geniusbro.in

A 2D side-scrolling cultural adventure game (HTML5 Canvas + Web Audio, no install, no external assets).

### Run locally
- Easiest: double-click `index.html` (it is fully self-contained).
- Or serve the folder: `python3 -m http.server 8000` and open http://localhost:8000

### Rebuild from source
`src/` holds the modules; `./build.sh` concatenates them into `index.html`.

| File | Contents |
|---|---|
| src/core.js | canvas scaling, input (keyboard/touch), Hindi/English text, save/load |
| src/audio.js | procedural music (bansuri, tabla, manjira, bells, tanpura drone), ambience, sound effects |
| src/art.js | Madhubani-style procedural art: sky, sun, village, people, Surya Pankhi, Surya Dev's chariot |
| src/levels.js | 8 levels, dialogue, missions, cultural knowledge cards, knowledge book |
| src/world.js | side-scrolling gameplay, HUD, inventory, map, photo mode, family mode |
| src/minigames.js | 8 mini-games + recipe cooking + Madhubani art renderer |
| src/screens.js | menus, cinematics, gallery, settings, Chhath Geet mode, Virtual Ghat |
| src/main.js | main loop |

### Controls
PC: A/D or arrows move · Space/W jump · E interact · I basket · M map · H hint · P photo · Esc pause
Family mode: P1 = A/D/W/E, P2 = arrow keys + Enter
Mobile: on-screen ◀ ▶, jump, ✋ interact; tap Surya Pankhi for a hint.

All artwork and music are original and generated in code.
