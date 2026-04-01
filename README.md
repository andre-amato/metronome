# 🥁 Metronome

A simple, mobile-friendly metronome built with plain HTML, CSS, and JavaScript — no frameworks, no build step.

## Demo

👉 [https://andre-amato.github.io/metronome/](https://andre-amato.github.io/metronome/)

## Features

- BPM slider (30–240)
- 4 light colors: red, cyan, gold, lime
- 4 synthesized sounds: click, beep, wood, hi-hat
- Visual flash synced with audio
- Smartphone-optimized dark UI

## How it was built

This project was built entirely with AI assistance using [Kiro](https://kiro.dev), an AI-powered IDE. The entire app — from concept to deployment — was generated through a conversational workflow with the AI agent.

### Tech decisions

- **Plain HTML/CSS/JS** — chosen deliberately over frameworks like React or Vue for maximum simplicity. No bundler, no transpiler, no `node_modules`. Just three files that run directly in the browser.
- **Web Audio API** — all four sounds (click, beep, wood, hi-hat) are synthesized in real-time using oscillators and noise buffers. No audio files to load or host.
  - `click`: short white noise burst with fast decay
  - `beep`: 880Hz sine wave with exponential gain ramp
  - `wood`: triangle wave with rapid frequency sweep (800→200Hz)
  - `hi-hat`: high-pass filtered noise (7kHz cutoff)
- **CSS custom properties** — light colors are driven by `--c` and `--light-color` variables, making it easy to swap themes without touching JS.
- **`setInterval` scheduling** — keeps the metronome ticking at the selected BPM. The interval restarts on BPM change for instant response.
- **Mobile-first design** — `max-width: 400px`, `100dvh` viewport, touch-friendly controls, dark theme to reduce eye strain.

### Project structure

```
index.html   → app shell and UI markup
style.css    → dark theme, responsive layout
script.js    → audio engine, state management, DOM interaction
```

### Deployment

Hosted on GitHub Pages — push to `main` and it's live. No CI/CD pipeline needed.

## Run locally

Just open `index.html` in your browser. That's it.
