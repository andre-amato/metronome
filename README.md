# 🥁 Metronome

A simple, mobile-friendly metronome built with plain HTML, CSS, and JavaScript — no frameworks, no build step.

## Demo

👉 [https://andre-amato.github.io/metronome/](https://andre-amato.github.io/metronome/)

## Features

- BPM slider (30–240) with +/− fine-tune buttons
- Silent BPM adjustment — no sound while dragging the slider
- Time signatures: 2/4, 3/4, 4/4, 6/8
- Accented first beat toggle — louder, higher pitch, bigger flash (like a real metronome) or equal beats
- Beat indicator dots synced to the time signature
- 4 light colors: red, cyan, gold, lime
- 5 synthesized sounds: beep, tick, click, snap, knock
- Smartphone-optimized UI

### Tech decisions

- **Plain HTML/CSS/JS** — chosen deliberately over frameworks like React or Vue for maximum simplicity. No bundler, no transpiler, no `node_modules`. Just three files that run directly in the browser.
- **Web Audio API** — all five sounds are synthesized in real-time using oscillators and noise buffers. No audio files to load or host. Each sound has an accented variant (louder, higher pitch) for the downbeat, togglable by the user.
  - `beep`: 880Hz sine wave (1144Hz on accent) with exponential gain ramp
  - `tick`: square wave burst with sine body resonance — mimics a mechanical metronome
  - `click`: short white noise burst with fast decay
  - `snap`: layered bandpass noise + sine pop — sharp and punchy
  - `knock`: deep low-frequency thump (220→60Hz sweep) with noise transient — loud and full
- **CSS custom properties** — light colors are driven by `--c` and `--light-color` variables for easy color switching.
- **Beat tracking** — a `beatIndex` counter cycles through the time signature. Beat 0 triggers the accent when enabled (louder sound, bigger visual pulse, scale 1.12× vs 1.05×).
- **Silent slider** — the metronome mutes while the user drags the BPM slider and resumes on release, avoiding chaotic sound bursts during adjustment.
- **Mobile-first design** — `max-width: 420px`, `100dvh` viewport, touch-friendly pill-shaped controls, circular light swatches.

### Project structure

```
index.html   → app shell and UI markup
style.css    → responsive layout, flash animations
script.js    → audio engine, beat tracking, state management, DOM interaction
```

### Deployment

Hosted on GitHub Pages — push to `main` and it's live. No CI/CD pipeline needed.

## Run locally

Just open `index.html` in your browser. That's it.
