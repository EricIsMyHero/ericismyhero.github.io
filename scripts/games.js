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
      difficulty: 'Çətinlik', easy: 'Asan', medium: 'Orta', hard: 'Çətin', rings: 'Keçilən halqalar',
      expired: 'Vaxt bitdi!', bonus: '+3 saniyə',
      timerRule: '15 saniyə ilə başla. Keçdiyin hər halqa +3 saniyə qazandırır.',
      arena: 'Oyun arenası. Halqanın boşluğunu bu istiqamətə çevirmək üçün toxun.',
    },
    en: {
      title: 'Ring Escape', intro: 'Guide the ball through the gap in the rotating ring.',
      instructions: 'Tap the arena or use the ← → arrow keys to steer the ring.',
      play: 'Play game', start: 'Start', pause: 'Pause', resume: 'Resume', replay: 'Play again',
      mute: 'Mute', unmute: 'Unmute', left: 'Rotate ring left', right: 'Rotate ring right',
      round: 'Stage', time: 'Time', waiting: 'Ready to play', inside: 'The ball is inside the ring',
      outside: 'The ball escaped!', paused: 'Game paused', won: 'All three stages complete!',
      difficulty: 'Difficulty', easy: 'Easy', medium: 'Medium', hard: 'Hard', rings: 'Rings cleared',
      expired: 'Time is up!', bonus: '+3 seconds',
      timerRule: 'Start with 15 seconds. Every ring cleared adds 3 seconds.',
      arena: 'Game arena. Tap to steer the gap in that direction.',
    }
  };
  const tau = 2 * Math.PI;
  const ballRadius = 5;
  const innerRadius = 72;
  const ringSpacing = 16;
  const arenaRadius = 160;
  const startTime = 15;
  const ringBonus = 3;
  const haloDuration = .42;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const difficulties = {
    easy: { rings: [10, 25, 50], gap: .66 },
    medium: { rings: [25, 50, 75], gap: .56 },
    hard: { rings: [50, 75, 100], gap: .47 },
  };
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
    const ringCount = difficulties[state.difficulty].rings[state.round - 1];
    Object.assign(state, {
      x: -23, y: 16, vx: 101 + state.round * 15, vy: -144 + state.round * 26,
      gap: 0, ringShift: 0, levelStarted: state.elapsed, escapedAt: null, trail: [], halos: [], cleared: 0, soundUntil: 0,
      ringCount,
      rings: Array.from({ length: ringCount }, () => ({
        angle: Math.random() * tau,
        speed: (Math.random() < .5 ? -1 : 1) * (.18 + Math.random() * 1.12),
      })),
    });
  }

  const ringGap = (state, index) => {
    const ring = state.rings[index];
    return state.gap + ring.angle + ring.speed * (state.elapsed - state.levelStarted);
  };
  const aperture = state => difficulties[state.difficulty].gap - .035 * (state.round - 1);
  const outside = state => state.escapedAt !== null || state.elapsed < state.soundUntil;

  function step(state, seconds) {
    state.elapsed += seconds;
    state.ringShift = Math.max(0, state.ringShift - 260 * seconds);
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
    const contact = innerRadius;
    if (distance < contact) return;
    const angle = Math.atan2(state.y, state.x);
    const gapAngle = ringGap(state, state.cleared);
    const offset = angle - gapAngle;
    const clearance = Math.abs(Math.atan2(Math.sin(offset), Math.cos(offset)));
    if (clearance < aperture(state) - ballRadius / innerRadius) {
      if (!reducedMotion.matches) state.halos.push({ radius: innerRadius + state.ringShift, angle: gapAngle, at: state.elapsed });
      state.cleared++;
      state.remaining += ringBonus;
      state.soundUntil = state.elapsed + .35;
      if (state.cleared === state.ringCount) state.escapedAt = state.elapsed;
      else {
        // Move the next ring into the same play area while keeping the ball's position smooth on screen.
        const scale = (distance - ringSpacing) / distance;
        state.x *= scale;
        state.y *= scale;
        if (!reducedMotion.matches) state.ringShift += ringSpacing;
      }
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

  function setSound(state) {
    if (!state.audio) return;
    const { audio, volume, filter } = state;
    const time = audio.currentTime;
    const playing = state.phase === 'playing' && !state.muted;
    const loud = outside(state);
    volume.gain.setTargetAtTime(playing ? (loud ? .26 : .027) : 0, time, .085);
    filter.frequency.setTargetAtTime(loud ? 6000 : 720, time, .12);
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
    for (const r of [36, 51, 162]) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(176, 214, 243, .14)';
      ctx.setLineDash([2, 8]);
      ctx.lineWidth = 1;
      ctx.arc(0, 0, r, 0, tau);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    const gap = aperture(state);
    const lastVisible = Math.floor((arenaRadius - innerRadius - state.ringShift) / ringSpacing) + state.cleared;
    for (let index = Math.min(lastVisible, state.ringCount - 1); index >= state.cleared; index--) {
      const radius = innerRadius + (index - state.cleared) * ringSpacing + state.ringShift;
      const angle = ringGap(state, index);
      const active = index === state.cleared;
      ctx.beginPath();
      ctx.lineWidth = active ? 3 : 1.4;
      ctx.lineCap = 'round';
      const hue = 155 + index / (state.ringCount - 1) * 165 + (state.round - 1) * 22;
      ctx.strokeStyle = active ? colour : `hsl(${hue} 86% 71% / .5)`;
      ctx.shadowColor = colour;
      ctx.shadowBlur = active ? 9 : 0;
      ctx.arc(0, 0, radius, angle + gap, angle + tau - gap);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    state.halos = state.halos.filter(halo => state.elapsed - halo.at < haloDuration);
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = colour;
    for (const halo of state.halos) {
      const progress = (state.elapsed - halo.at) / haloDuration;
      const expansion = 26 * (1 - (1 - progress) ** 2);
      ctx.globalAlpha = .65 * (1 - progress);
      ctx.beginPath();
      ctx.arc(0, 0, halo.radius + expansion, halo.angle + gap, halo.angle + tau - gap);
      ctx.stroke();
    }

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
    const ballDistance = Math.hypot(state.x, state.y);
    const ballScale = ballDistance > 0 ? (ballDistance + state.ringShift) / ballDistance : 1;
    ctx.arc(state.x * ballScale, state.y * ballScale, ballRadius, 0, tau);
    ctx.fill();
    ctx.restore();
  }

  function update(state) {
    const l = copy();
    const status = {
      idle: l.waiting, paused: l.paused, won: l.won, lost: l.expired,
      playing: state.escapedAt !== null ? l.outside : outside(state) ? l.bonus : l.inside,
    };
    const setText = (node, value) => {
      if (node.textContent !== value) node.textContent = value;
    };
    setText(state.ui.stage, state.round + ' / ' + stages);
    setText(state.ui.time, Math.ceil(state.remaining) + ' s');
    setText(state.ui.rings, state.cleared + ' / ' + state.ringCount);
    state.ui.time.classList.toggle('game-time-low', state.remaining <= 5);
    state.ui.difficulty.disabled = state.phase === 'playing';
    setText(state.ui.status, status[state.phase]);
    setText(state.ui.main, l[{ idle: 'start', playing: 'pause', paused: 'resume', won: 'replay', lost: 'replay' }[state.phase]]);
    setText(state.ui.sound, state.muted ? l.unmute : l.mute);
    draw(state);
  }

  function frame(state, time) {
    if (state.phase !== 'playing') return;
    const wasOutside = outside(state);
    const elapsed = (time - (state.previousFrame ?? time)) / 1000;
    state.previousFrame = time;
    if (state.escapedAt === null) {
      state.remaining = Math.max(0, state.remaining - elapsed);
      if (!state.remaining) {
        state.phase = 'lost';
        setSound(state);
        update(state);
        return;
      }
    }
    // Small steps keep the ball from tunnelling through the ring.
    let seconds = Math.min(.05, elapsed);
    while (seconds > 0 && state.phase === 'playing') {
      const dt = Math.min(seconds, 1 / 240);
      step(state, dt);
      seconds -= dt;
    }
    const angle = Math.atan2(state.y, state.x);
    const distance = Math.hypot(state.x, state.y) + state.ringShift;
    state.trail.push({ x: distance * Math.cos(angle), y: distance * Math.sin(angle) });
    if (state.trail.length > 13) state.trail.shift();
    if (wasOutside !== outside(state) || state.phase === 'won') setSound(state);
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
        <fieldset class="game-difficulty">
          <legend>${esc(l.difficulty)}</legend>
          <div>${Object.keys(difficulties).map(key => `<label><input type="radio" name="game-difficulty" value="${key}" ${state.difficulty === key ? 'checked' : ''}><span>${esc(l[key])}</span></label>`).join('')}</div>
        </fieldset>
        <div class="game-stats">
          <span>${esc(l.round)} <strong class="game-stage"></strong></span>
          <span>${esc(l.rings)} <strong class="game-rings"></strong></span>
          <span>${esc(l.time)} <strong class="game-time"></strong></span>
        </div>
        <div class="game-arena">
          <canvas width="400" height="340" aria-hidden="true"></canvas>
          <button class="game-aim" type="button" aria-label="${esc(l.arena)}" title="${esc(l.arena)}"></button>
        </div>
        <p class="game-status" role="status"></p>
        <p class="game-instructions">${esc(l.instructions)}</p>
        <p class="game-instructions">${esc(l.timerRule)}</p>
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
      rings: $('.game-rings', root), difficulty: $('.game-difficulty', root),
      main: $('[data-game-action="main"]', root), sound: $('[data-game-action="sound"]', root),
    };
    state.ui.difficulty.onchange = event => {
      Object.assign(state, { difficulty: event.target.value, round: 1, elapsed: 0, remaining: startTime, phase: 'idle' });
      level(state);
      setSound(state);
      update(state);
    };
    $('.game-aim', root).onclick = event => {
      if (state.phase !== 'playing' || state.escapedAt !== null) return;
      if (!event.detail) return rotate(state, .36);
      const box = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - box.left - box.width / 2;
      const y = event.clientY - box.top - box.height / 2;
      if (Math.hypot(x, y) > 12) rotate(state, Math.atan2(y, x) - ringGap(state, state.cleared));
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
      if (state.phase === 'won' || state.phase === 'lost') {
        Object.assign(state, { round: 1, elapsed: 0, remaining: startTime, note: 0 });
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
    if (route.view === 'tower-descent') {
      leave();
      U.towerGame.render(root, title);
      return;
    }
    U.towerGame.leave();
    if (route.view === 'ring-escape') {
      if (!game) {
        game = { phase: 'idle', difficulty: 'easy', round: 1, elapsed: 0, remaining: startTime, muted: false };
        level(game);
      }
      renderArena(game);
      return;
    }
    leave();
    const l = copy();
    const tower = U.towerGame.copy();
    const games = [
      { id: 'ring-escape', title: l.title, intro: l.intro, art: '' },
      { id: 'tower-descent', title: tower.title, intro: tower.intro, art: ' game-entry-art--tower' },
    ];
    root.innerHTML = title(t('navGames'), t('gamesIntro'), 'functions', t('navFunctions')) + `
      <div class="game-list">${games.map(entry => `<a class="game-entry function-panel" href="#/games/${entry.id}">
        <span class="game-entry-art${entry.art}" aria-hidden="true"></span>
        <span class="game-entry-info"><strong>${esc(entry.title)}</strong><span>${esc(entry.intro)}</span>
          <span class="game-entry-play">${ic('play')} ${esc(l.play)}</span>
        </span>
      </a>`).join('')}</div>`;
  };

  window.addEventListener('unec:routechange', event => {
    if (event.detail.tab !== 'games') {
      leave();
      U.towerGame.leave();
    }
  });
  window.addEventListener('unec:langchange', () => {
    if (U.route?.tab === 'games') U.renderGames(U.route);
  });
  window.addEventListener('keydown', event => {
    if (game?.phase !== 'playing' || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') ||
        event.altKey || event.ctrlKey || event.metaKey || event.target.matches?.('input') || !root.contains(document.activeElement)) return;
    event.preventDefault();
    rotate(game, event.key === 'ArrowLeft' ? -.22 : .22);
  });
  window.addEventListener('pagehide', () => { if (game) pause(game); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && game) pause(game);
  });
})();
