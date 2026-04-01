(() => {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  // --- Sound generators ---
  const sounds = {
    click(ctx) {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.02, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const g = ctx.createGain();
      g.gain.setValueAtTime(1, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.02);
      src.connect(g).connect(ctx.destination);
      src.start();
    },
    beep(ctx) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880;
      g.gain.setValueAtTime(0.5, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(g).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    },
    wood(ctx) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.03);
      g.gain.setValueAtTime(0.6, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.connect(g).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    },
    'hi-hat'(ctx) {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 7000;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.6, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      src.connect(hp).connect(g).connect(ctx.destination);
      src.start();
    }
  };

  // --- State ---
  let bpm = 120;
  let running = false;
  let timerId = null;
  let currentSound = 'click';
  let currentLight = '#ff4444';

  // --- DOM ---
  const light = document.getElementById('light');
  const bpmValue = document.getElementById('bpm-value');
  const slider = document.getElementById('bpm-slider');
  const startBtn = document.getElementById('start-btn');

  // BPM slider
  slider.addEventListener('input', () => {
    bpm = +slider.value;
    bpmValue.textContent = bpm;
    if (running) restart();
  });

  // Light options
  document.querySelectorAll('[data-light]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-light]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      currentLight = getComputedStyle(btn).getPropertyValue('--c').trim();
      light.style.setProperty('--light-color', currentLight);
    });
  });

  // Sound options
  document.querySelectorAll('[data-sound]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-sound]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      currentSound = btn.dataset.sound;
    });
  });

  // Start / Stop
  startBtn.addEventListener('click', () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    running = !running;
    startBtn.textContent = running ? 'Stop' : 'Start';
    startBtn.classList.toggle('active', running);
    running ? start() : stop();
  });

  function tick() {
    sounds[currentSound](audioCtx);
    light.classList.add('flash');
    setTimeout(() => light.classList.remove('flash'), 80);
  }

  function start() {
    tick();
    timerId = setInterval(tick, 60000 / bpm);
  }

  function stop() {
    clearInterval(timerId);
    light.classList.remove('flash');
  }

  function restart() {
    stop();
    if (running) start();
  }
})();
