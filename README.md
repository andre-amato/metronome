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
- 4 synthesized sounds: click, beep, wood, hi-hat
- Dark / light mode toggle
- Smartphone-optimized responsive UI

## How it was built

This project was built entirely with AI assistance using [Kiro](https://kiro.dev), an AI-powered IDE. The entire app — from concept to deployment — was generated through a conversational workflow with the AI agent.

### Tech decisions

- **Plain HTML/CSS/JS** — chosen deliberately over frameworks like React or Vue for maximum simplicity. No bundler, no transpiler, no `node_modules`. Just three files that run directly in the browser.
- **Web Audio API** — all four sounds are synthesized in real-time using oscillators and noise buffers. No audio files to load or host. Each sound has an accented variant (louder, higher pitch) for the downbeat, togglable by the user.
  - `click`: short white noise burst with fast decay
  - `beep`: 880Hz sine wave (1144Hz on accent) with exponential gain ramp
  - `wood`: triangle wave with rapid frequency sweep (800→200Hz, 1000→200Hz on accent)
  - `hi-hat`: high-pass filtered noise (7.5kHz cutoff, 6kHz on accent for fuller sound)
- **CSS custom properties** — light colors are driven by `--c` and `--light-color` variables. Dark/light themes are handled via body class toggling with scoped CSS rules.
- **Beat tracking** — a `beatIndex` counter cycles through the time signature. Beat 0 triggers the accent when enabled (louder sound, bigger visual pulse, scale 1.12× vs 1.05×).
- **Silent slider** — the metronome mutes while the user drags the BPM slider and resumes on release, avoiding chaotic sound bursts during adjustment.
- **Mobile-first design** — `max-width: 420px`, `100dvh` viewport, touch-friendly pill-shaped controls, circular light swatches.

### Project structure

```
index.html   → app shell and UI markup
style.css    → dark/light themes, responsive layout, flash animations
script.js    → audio engine, beat tracking, state management, DOM interaction
```

### Deployment

Hosted on GitHub Pages — push to `main` and it's live. No CI/CD pipeline needed.

## Run locally

Just open `index.html` in your browser. That's it.
