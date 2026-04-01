(() => {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  // --- Sound generators (accent = louder + higher pitch) ---
  function makeSound(type, ctx, accent) {
    const vol = accent ? 1 : 0.5;
    const pitchMul = accent ? 1.3 : 1;

    switch (type) {
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
      case 'wood': {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        const baseFreq = accent ? 1000 : 800;
        osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.04);
        g.gain.setValueAtTime(vol * 0.7, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
        osc.connect(g).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
        break;
      }
      case 'hi-hat': {
        const dur = accent ? 0.07 : 0.04;
        const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = accent ? 6000 : 7500;
        const g = ctx.createGain();
        g.gain.setValueAtTime(vol * 0.7, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + dur);
        src.connect(hp).connect(g).connect(ctx.destination);
        src.start();
        break;
      }
    }
  }

  // --- State ---
  let bpm = 120;
  let running = false;
  let timerId = null;
  let currentSound = 'click';
  let currentLight = '#ff4444';
  let timeSignature = 4;
  let beatIndex = 0;

  // --- DOM ---
  const light = document.getElementById('light');
  const bpmValue = document.getElementById('bpm-value');
  const slider = document.getElementById('bpm-slider');
  const startBtn = document.getElementById('start-btn');
  const beatRow = document.getElementById('beat-row');

  function updateBpm(val) {
    bpm = Math.max(30, Math.min(240, val));
    slider.value = bpm;
    bpmValue.textContent = bpm;
    // highlight matching tempo preset
    document.querySelectorAll('.tempo').forEach(b => {
      b.classList.toggle('selected', +b.dataset.bpm === bpm);
    });
    if (running) restart();
  }

  // BPM slider
  slider.addEventListener('input', () => updateBpm(+slider.value));

  // BPM +/- buttons
  document.getElementById('bpm-minus').addEventListener('click', () => updateBpm(bpm - 1));
  document.getElementById('bpm-plus').addEventListener('click', () => updateBpm(bpm + 1));

  // Tempo presets
  document.querySelectorAll('.tempo').forEach(btn => {
    btn.addEventListener('click', () => updateBpm(+btn.dataset.bpm));
  });

  // Time signature
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
      timeSignature = +btn.dataset.ts;
      beatIndex = 0;
      buildBeatDots();
      if (running) restart();
    });
  });

  // Light options
  document.querySelectorAll('[data-light]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-light]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      currentLight = getComputedStyle(btn).getPropertyValue('--c').trim();
      light.style.setProperty('--light-color', currentLight);
      beatRow.style.setProperty('--light-color', currentLight);
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
    const isAccent = beatIndex === 0;
    makeSound(currentSound, audioCtx, isAccent);

    // Light flash
    light.classList.add('flash');
    if (isAccent) light.classList.add('accent-flash');
    setTimeout(() => {
      light.classList.remove('flash', 'accent-flash');
    }, 90);

    // Beat dots
    beatRow.querySelectorAll('.beat-dot').forEach(d => d.classList.remove('active'));
    const activeDot = beatRow.querySelector(`[data-beat="${beatIndex}"]`);
    if (activeDot) activeDot.classList.add('active');
    setTimeout(() => { if (activeDot) activeDot.classList.remove('active'); }, 90);

    beatIndex = (beatIndex + 1) % timeSignature;
  }

  function start() {
    beatIndex = 0;
    tick();
    timerId = setInterval(tick, 60000 / bpm);
  }

  function stop() {
    clearInterval(timerId);
    light.classList.remove('flash', 'accent-flash');
    beatRow.querySelectorAll('.beat-dot').forEach(d => d.classList.remove('active'));
    beatIndex = 0;
  }

  function restart() {
    stop();
    if (running) start();
  }

  // Init
  buildBeatDots();
})();
