(function () {
  'use strict';

  const U = window.UNEC;
  const { $, esc, ic } = U;
  const root = $('#gamesRoot');
  const labels = {
    az: {
      title: 'Halqadan çıxış', intro: 'Topu fırlanan halqanın boşluğundan keçir.',
      instructions: 'Halqanı yönəltmək üçün arenaya toxun və ya ← → düymələrindən istifadə et.',
      play: 'Oyuna keç', start: 'Başla', pause: 'Fasilə', resume: 'Davam et', replay: 'Yenidən oyna',
      mute: 'Səsi söndür', unmute: 'Səsi aç', left: 'Halqanı sola döndər', right: 'Halqanı sağa döndər',
      round: 'Mərhələ', time: 'Vaxt', waiting: 'Başlamağa hazır', inside: 'Top halqanın içindədir',
      outside: 'Top halqadan çıxdı!', paused: 'Oyun dayandırıldı', won: 'Üç mərhələ tamamlandı!',
      arena: 'Oyun arenası. Halqanın boşluğunu bu istiqamətə çevirmək üçün toxun.',
    },
    en: {
      title: 'Ring Escape', intro: 'Guide the ball through the gap in the rotating ring.',
      instructions: 'Tap the arena or use the ← → arrow keys to steer the ring.',
      play: 'Play game', start: 'Start', pause: 'Pause', resume: 'Resume', replay: 'Play again',
      mute: 'Mute', unmute: 'Unmute', left: 'Rotate ring left', right: 'Rotate ring right',
      round: 'Stage', time: 'Time', waiting: 'Ready to play', inside: 'The ball is inside the ring',
      outside: 'The ball escaped!', paused: 'Game paused', won: 'All three stages complete!',
      arena: 'Game arena. Tap to steer the gap in that direction.',
    }
  };
  const tau = 2 * Math.PI;
  const radius = 100;
  const ballRadius = 5;
  const stages = 3;
  const melody = [69, 76, 72, 76, 67, 74, 71, 74, 65, 72, 69, 72, 64, 71, 67, 71];
  const colours = ['#78f2cb', '#a8c5ff', '#ffca8d'];
  const copy = () => labels[lang === 'en' ? 'en' : 'az'];
  let game;

  function title(heading, description, back, backName) {
    return `<header class="function-hero">
      <a class="icon-btn icon-btn--filled function-back" href="#/${back}" aria-label="${esc(backName)}">${ic('arrow-left')}</a>
      <span class="function-hero-icon">${ic('play')}</span>
      <div class="function-hero-copy"><h1 tabindex="-1" id="gamesTitle">${esc(heading)}</h1><p>${esc(description)}</p></div>
    </header>`;
  }

  function level(state) {
    Object.assign(state, {
      x: -35, y: 20, vx: 106 + state.round * 16, vy: -144 + state.round * 28,
      gap: 1.4, escapedAt: null, trail: [],
    });
  }

  function step(state, seconds) {
    state.elapsed += seconds;
    state.gap = (state.gap + (.47 + state.round * .22) * seconds) % tau;
    state.x += state.vx * seconds;
    state.y += state.vy * seconds;

    if (state.escapedAt !== null) {
      if (state.elapsed - state.escapedAt >= 1.35) {
        if (state.round === stages) state.phase = 'won';
        else {
          state.round++;
          level(state);
        }
      }
      return;
    }

    const distance = Math.hypot(state.x, state.y);
    const contact = radius - ballRadius;
    if (distance < contact) return;
    const angle = Math.atan2(state.y, state.x);
    const offset = angle - state.gap;
    const clearance = Math.abs(Math.atan2(Math.sin(offset), Math.cos(offset)));
    if (clearance < aperture(state) - (ballRadius + 4) / radius) {
      if (distance >= radius + ballRadius + 4) state.escapedAt = state.elapsed;
      return;
    }
    const nx = state.x / distance;
    const ny = state.y / distance;
    const outward = state.vx * nx + state.vy * ny;
    if (outward > 0) {
      state.vx -= 2 * outward * nx;
      state.vy -= 2 * outward * ny;
    }
    state.x = nx * (contact - .15);
    state.y = ny * (contact - .15);
  }

  const aperture = state => .73 - .11 * state.round;

  function setSound(state) {
    if (!state.audio) return;
    const { audio, volume, filter } = state;
    const time = audio.currentTime;
    const playing = state.phase === 'playing' && !state.muted;
    const outside = state.escapedAt !== null;
    volume.gain.setTargetAtTime(playing ? (outside ? .26 : .027) : 0, time, .085);
    filter.frequency.setTargetAtTime(outside ? 6000 : 720, time, .12);
  }

  function enableSound(state) {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    try {
      if (!state.audio) {
        const audio = new Audio();
        const filter = audio.createBiquadFilter();
        filter.type = 'lowpass';
        const volume = audio.createGain();
        volume.gain.value = 0;
        filter.connect(volume);
        volume.connect(audio.destination);
        Object.assign(state, { audio, filter, volume, noteAt: audio.currentTime, note: 0 });
      }
      if (state.audio.state === 'suspended') void state.audio.resume().catch(() => {});
      setSound(state);
    } catch {
      // Audio is optional on devices that do not offer Web Audio.
    }
  }

  function playNote(state) {
    const { audio, filter } = state;
    if (!audio || audio.state !== 'running' || state.muted || audio.currentTime < state.noteAt) return;
    const time = audio.currentTime;
    const note = melody[state.note % melody.length];
    state.noteAt = time + .22;
    state.note++;
    const oscillator = audio.createOscillator();
    oscillator.type = state.note % 4 === 1 ? 'sine' : 'triangle';
    oscillator.frequency.value = 440 * 2 ** ((note - 69) / 12);
    const envelope = audio.createGain();
    envelope.gain.setValueAtTime(.001, time);
    envelope.gain.exponentialRampToValueAtTime(.44, time + .028);
    envelope.gain.exponentialRampToValueAtTime(.001, time + .34);
    oscillator.connect(envelope);
    envelope.connect(filter);
    oscillator.start(time);
    oscillator.stop(time + .35);
  }

  function draw(state) {
    const { ctx, trail } = state;
    if (!ctx) return;
    ctx.clearRect(0, 0, 400, 340);
    ctx.save();
    ctx.translate(200, 170);
    const colour = colours[state.round - 1];
    for (const r of [50, 76, 132, 152]) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(176, 214, 243, .14)';
      ctx.setLineDash([2, 8]);
      ctx.lineWidth = 1;
      ctx.arc(0, 0, r, 0, tau);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    const gap = aperture(state);
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(176, 214, 243, .16)';
    ctx.lineWidth = 2;
    ctx.arc(0, 0, radius, 0, tau);
    ctx.stroke();

    for (const distance of [117, 126]) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(188, 229, 255, .3)';
      ctx.arc(0, 0, distance, state.gap - gap, state.gap + gap);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.strokeStyle = colour;
    ctx.shadowColor = colour;
    ctx.shadowBlur = 13;
    ctx.arc(0, 0, radius, state.gap + gap, state.gap + tau - gap);
    ctx.stroke();
    ctx.shadowBlur = 0;

    for (let i = 0; i < trail.length; i++) {
      ctx.globalAlpha = .42 * (i + 1) / trail.length;
      ctx.fillStyle = colour;
      ctx.beginPath();
      ctx.arc(trail[i].x, trail[i].y, 1 + i / trail.length * 3.5, 0, tau);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowColor = colour;
    ctx.shadowBlur = 14;
    ctx.fillStyle = '#f6fffe';
    ctx.beginPath();
    ctx.arc(state.x, state.y, ballRadius, 0, tau);
    ctx.fill();
    ctx.restore();
  }

  function update(state) {
    const l = copy();
    const status = {
      idle: l.waiting, paused: l.paused, won: l.won,
      playing: state.escapedAt === null ? l.inside : l.outside,
    };
    const setText = (node, value) => {
      if (node.textContent !== value) node.textContent = value;
    };
    setText(state.ui.stage, state.round + ' / ' + stages);
    setText(state.ui.time, Math.floor(state.elapsed) + ' s');
    setText(state.ui.status, status[state.phase]);
    setText(state.ui.main, l[{ idle: 'start', playing: 'pause', paused: 'resume', won: 'replay' }[state.phase]]);
    setText(state.ui.sound, state.muted ? l.unmute : l.mute);
    draw(state);
  }

  function frame(state, time) {
    if (state.phase !== 'playing') return;
    const wasOutside = state.escapedAt !== null;
    // Small steps keep the ball from tunnelling through the ring.
    let seconds = Math.min(.05, (time - (state.previousFrame ?? time)) / 1000);
    state.previousFrame = time;
    while (seconds > 0 && state.phase === 'playing') {
      const dt = Math.min(seconds, 1 / 120);
      step(state, dt);
      seconds -= dt;
    }
    state.trail.push({ x: state.x, y: state.y });
    if (state.trail.length > 13) state.trail.shift();
    if (wasOutside !== (state.escapedAt !== null) || state.phase === 'won') setSound(state);
    if (state.phase === 'playing') {
      playNote(state);
      state.frame = requestAnimationFrame(next => frame(state, next));
    }
    update(state);
  }

  function pause(state) {
    if (state.phase !== 'playing') return;
    cancelAnimationFrame(state.frame);
    state.phase = 'paused';
    setSound(state);
    update(state);
  }

  function leave() {
    if (!game) return;
    cancelAnimationFrame(game.frame);
    if (game.audio) void game.audio.close().catch(() => {});
    game = undefined;
  }

  function rotate(state, amount) {
    if (state.phase !== 'playing' || state.escapedAt !== null) return;
    state.gap = (state.gap + amount) % tau;
    draw(state);
  }

  function renderArena(state) {
    const l = copy();
    root.innerHTML = title(l.title, l.intro, 'games', t('navGames')) + `
      <section class="game-shell function-panel" aria-labelledby="gamesTitle">
        <div class="game-stats">
          <span>${esc(l.round)} <strong class="game-stage"></strong></span>
          <span>${esc(l.time)} <strong class="game-time"></strong></span>
        </div>
        <div class="game-arena">
          <canvas width="400" height="340" aria-hidden="true"></canvas>
          <button class="game-aim" type="button" aria-label="${esc(l.arena)}" title="${esc(l.arena)}"></button>
        </div>
        <p class="game-status" role="status"></p>
        <p class="game-instructions">${esc(l.instructions)}</p>
        <div class="game-controls">
          <button type="button" class="btn btn--secondary" data-game-action="left" aria-label="${esc(l.left)}">${ic('chevron-left')}</button>
          <button type="button" class="btn btn--primary" data-game-action="main"></button>
          <button type="button" class="btn btn--secondary" data-game-action="right" aria-label="${esc(l.right)}">${ic('chevron-right')}</button>
          <button type="button" class="btn btn--secondary" data-game-action="sound"></button>
        </div>
      </section>`;
    state.ctx = $('canvas', root).getContext('2d');
    state.ui = {
      stage: $('.game-stage', root), time: $('.game-time', root), status: $('.game-status', root),
      main: $('[data-game-action="main"]', root), sound: $('[data-game-action="sound"]', root),
    };
    $('.game-aim', root).onclick = event => {
      if (!event.detail) return rotate(state, .36);
      const box = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - box.left - box.width / 2;
      const y = event.clientY - box.top - box.height / 2;
      if (Math.hypot(x, y) > 12) rotate(state, Math.atan2(y, x) - state.gap);
    };
    $('[data-game-action="left"]', root).onclick = () => rotate(state, -.36);
    $('[data-game-action="right"]', root).onclick = () => rotate(state, .36);
    state.ui.sound.onclick = () => {
      state.muted = !state.muted;
      if (!state.muted && state.phase === 'playing') enableSound(state);
      setSound(state);
      update(state);
    };
    state.ui.main.onclick = () => {
      if (state.phase === 'playing') return pause(state);
      if (state.phase === 'won') {
        Object.assign(state, { round: 1, elapsed: 0, note: 0 });
        level(state);
      }
      state.phase = 'playing';
      state.previousFrame = null;
      if (!state.muted) enableSound(state);
      state.frame = requestAnimationFrame(time => frame(state, time));
      update(state);
    };
    update(state);
  }

  U.renderGames = function (route) {
    if (route.view === 'ring-escape') {
      if (!game) {
        game = { phase: 'idle', round: 1, elapsed: 0, muted: false };
        level(game);
      }
      renderArena(game);
      return;
    }
    leave();
    const l = copy();
    root.innerHTML = title(t('navGames'), t('gamesIntro'), 'functions', t('navFunctions')) + `
      <a class="game-entry function-panel" href="#/games/ring-escape">
        <span class="game-entry-art" aria-hidden="true"></span>
        <span class="game-entry-info"><strong>${esc(l.title)}</strong><span>${esc(l.intro)}</span>
          <span class="game-entry-play">${ic('play')} ${esc(l.play)}</span>
        </span>
      </a>`;
  };

  window.addEventListener('unec:routechange', event => {
    if (event.detail.tab !== 'games') leave();
  });
  window.addEventListener('unec:langchange', () => {
    if (U.route?.tab === 'games') U.renderGames(U.route);
  });
  window.addEventListener('keydown', event => {
    if (game?.phase !== 'playing' || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') ||
        event.altKey || event.ctrlKey || event.metaKey || !root.contains(document.activeElement)) return;
    event.preventDefault();
    rotate(game, event.key === 'ArrowLeft' ? -.22 : .22);
  });
  window.addEventListener('pagehide', () => { if (game) pause(game); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && game) pause(game);
  });
})();
