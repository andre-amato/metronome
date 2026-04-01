(() => {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  function makeSound(type, ctx, accent) {
    const vol = accent ? 1 : 0.5;
    const pitchMul = accent ? 1.3 : 1;

    switch (type) {
      case 'beep': {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 880 * pitchMul;
        g.gain.setValueAtTime(vol, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.connect(g).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
        break;
      }
      case 'tick': {
        // Mechanical metronome tick — sharp, dry, loud
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(accent ? 1800 : 1500, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.005);
        g.gain.setValueAtTime(vol * 1.2, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.015);
        osc.connect(g).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.02);
        // Body resonance
        const osc2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.value = accent ? 700 : 550;
        g2.gain.setValueAtTime(vol * 0.4, ctx.currentTime);
        g2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03);
        osc2.connect(g2).connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.03);
        break;
      }
      case 'click': {
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.025, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const g = ctx.createGain();
        g.gain.setValueAtTime(vol, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.025);
        src.connect(g).connect(ctx.destination);
        src.start();
        break;
      }
      case 'snap': {
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.015, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = accent ? 3500 : 3000;
        bp.Q.value = 2;
        const g = ctx.createGain();
        g.gain.setValueAtTime(vol * 1.2, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.02);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start();
        const osc = ctx.createOscillator();
        const g2 = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 1200 * pitchMul;
        g2.gain.setValueAtTime(vol * 0.6, ctx.currentTime);
        g2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.015);
        osc.connect(g2).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.02);
        break;
      }
      case 'knock': {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(accent ? 220 : 180, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.06);
        g.gain.setValueAtTime(vol * 1.4, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.connect(g).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.008, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const g2 = ctx.createGain();
        g2.gain.setValueAtTime(vol * 0.8, ctx.currentTime);
        g2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.01);
        src.connect(g2).connect(ctx.destination);
        src.start();
        break;
      }
    }
  }

  let bpm = 120, running = false, timerId = null;
  let currentSound = 'beep', currentLight = '#ff4444';
  let timeSignature = 4, beatIndex = 0, accentOn = true, sliding = false;

  const light = document.getElementById('light');
  const bpmValue = document.getElementById('bpm-value');
  const slider = document.getElementById('bpm-slider');
  const startBtn = document.getElementById('start-btn');
  const beatRow = document.getElementById('beat-row');

  slider.addEventListener('input', () => {
    bpm = +slider.value;
    bpmValue.textContent = bpm;
    if (!sliding) { sliding = true; if (running) stop(); }
  });
  slider.addEventListener('change', () => { sliding = false; if (running) start(); });

  document.getElementById('bpm-minus').addEventListener('click', () => {
    bpm = Math.max(30, bpm - 1); slider.value = bpm; bpmValue.textContent = bpm;
    if (running) restart();
  });
  document.getElementById('bpm-plus').addEventListener('click', () => {
    bpm = Math.min(240, bpm + 1); slider.value = bpm; bpmValue.textContent = bpm;
    if (running) restart();
  });

  function buildBeatDots() {
    beatRow.innerHTML = '';
    for (let i = 0; i < timeSignature; i++) {
      const dot = document.createElement('div');
      dot.className = 'beat-dot' + (i === 0 ? ' accent' : '');
      dot.dataset.beat = i;
      beatRow.appendChild(dot);
    }
  }

  document.querySelectorAll('.ts').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ts').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      timeSignature = +btn.dataset.ts; beatIndex = 0; buildBeatDots();
      if (running) restart();
    });
  });

  document.querySelectorAll('.accent-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.accent-opt').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      accentOn = btn.dataset.accent === 'on';
    });
  });

  document.querySelectorAll('[data-light]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-light]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      currentLight = getComputedStyle(btn).getPropertyValue('--c').trim();
      light.style.setProperty('--light-color', currentLight);
      beatRow.style.setProperty('--light-color', currentLight);
    });
  });

  document.querySelectorAll('[data-sound]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-sound]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      currentSound = btn.dataset.sound;
    });
  });

  startBtn.addEventListener('click', () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    running = !running;
    startBtn.textContent = running ? 'Stop' : 'Start';
    startBtn.classList.toggle('active', running);
    running ? start() : stop();
  });

  function tick() {
    const isAccent = accentOn && beatIndex === 0;
    makeSound(currentSound, audioCtx, isAccent);
    light.classList.add('flash');
    if (isAccent) light.classList.add('accent-flash');
    setTimeout(() => light.classList.remove('flash', 'accent-flash'), 90);
    beatRow.querySelectorAll('.beat-dot').forEach(d => d.classList.remove('active'));
    const dot = beatRow.querySelector(`[data-beat="${beatIndex}"]`);
    if (dot) dot.classList.add('active');
    setTimeout(() => { if (dot) dot.classList.remove('active'); }, 90);
    beatIndex = (beatIndex + 1) % timeSignature;
  }

  function start() { beatIndex = 0; tick(); timerId = setInterval(tick, 60000 / bpm); }
  function stop() {
    clearInterval(timerId);
    light.classList.remove('flash', 'accent-flash');
    beatRow.querySelectorAll('.beat-dot').forEach(d => d.classList.remove('active'));
    beatIndex = 0;
  }
  function restart() { stop(); if (running) start(); }

  buildBeatDots();
})();
