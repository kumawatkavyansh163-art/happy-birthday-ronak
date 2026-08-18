# Happy Birthday, Ronak 🎂✨

A cinematic, Apple-quality interactive birthday website — galaxy background, aurora lighting,
glassmorphism, and a 9-scene storytelling flow, built with plain HTML/CSS/JS + GSAP + Three.js.

## How to run it

1. Unzip the project.
2. Because it uses `fetch`-like module loading for fonts/canvas and reads local audio files,
   open it through a local server rather than double-clicking the file (some browsers block
   audio/canvas features on `file://`). Easiest options:
   - VS Code → "Live Server" extension → **Go Live**
   - or, from a terminal in the project folder: `python3 -m http.server 8080`, then visit
     `http://localhost:8080`
3. Click **"Tap to begin"** — this unlocks audio playback (required by browser autoplay rules)
   and starts the loading sequence.
4. Scroll to move through the story. Tap the cake to blow out the candles, tap the gift to open it.

## Add your own assets

- **Music:** drop two MP3s into `assets/music/`:
  - `cinematic-theme.mp3` — plays from the galaxy intro through the memory gallery
  - `uplifting-theme.mp3` — automatically takes over once the candles are blown out
- **Photos:** the memory gallery currently uses placeholder images from `picsum.photos`.
  Replace the four `<img src="...">` URLs in `index.html` (Scene 5) with your own photos —
  put files in `assets/images/` and point the `src` at e.g. `assets/images/memory-1.jpg`.
- **Icons/Lottie:** `assets/icons/` and `assets/lottie/` are ready if you want to swap any
  inline SVG icon for a custom one, or add a Lottie animation later.

## Project structure

```
index.html      → all 9 scenes, semantic markup, CDN script tags
style.css        → design tokens, layout, and every scene's styling
script.js        → Three.js galaxy, GSAP scene orchestration, interactions, replay system
assets/
  music/         → put cinematic-theme.mp3 + uplifting-theme.mp3 here
  images/        → put real memory photos here
  icons/         → optional custom icon assets
  lottie/        → optional Lottie JSON animations
```

## The 9 scenes

1. **Loading** — animated progress bar and "Preparing something special…" text
2. **Galaxy Intro** — parallax starfield + aurora, "A message for someone truly special"
3. **Birthday Reveal** — letter-by-letter glowing title, particle burst, confetti, camera zoom
4. **Personal Letter** — glassmorphic card with a typewriter-typed message
5. **Memory Gallery** — captioned photos animating in on scroll
6. **Birthday Cake** — flickering candles; clicking "Blow Out Candles" extinguishes them,
   triggers smoke + confetti, and switches the music to an uplifting track
7. **Gift Box** — clicking the box unties the ribbon, opens the lid, and reveals a message
   surrounded by floating hearts and golden light
8. **Fireworks Finale** — canvas fireworks, rising balloons, and the closing message
9. **Ending** — a final note and a slowly, forever-pulsing heart

A thin **constellation line** quietly connects a star for each scene as you scroll, and
resolves into a heart shape by the ending — a small signature thread tying the whole story together.

## Replay

The floating replay button (top right, and again at the very end) resets every animation,
the typewriter, the music, and scroll position, then restarts the whole experience —
no page reload.

## Tech stack

HTML5 · CSS3 · Vanilla JavaScript · GSAP + ScrollTrigger · Three.js · canvas-confetti.
No frameworks, no backend.

---
Made with ❤️ by Kavyansh, for Ronak.
