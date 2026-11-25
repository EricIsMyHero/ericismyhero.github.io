(function () {
  'use strict';

  const U = window.UNEC;
  const { $, esc, ic } = U;
  const words = {
    az: {
      title: 'Qüllə enişi', intro: 'Qülləni döndər, platformaları qır və ən aşağıya en.',
      instructions: 'Qülləni sürüşdürərək və ya ← → ilə döndər. Sarı hissəni qırmaq üçün arenaya, «Qır» düyməsinə və ya Space düyməsinə basılı saxla.',
      rules: 'Qırmızı və mavi hissədə qırmağa çalışsan, oyun bitir. Bənövşəyi orb 4 saniyə ərzində istənilən hissəni qırmağa imkan verir.',
      floor: 'Platforma', score: 'Xal', boost: 'Güc', start: 'Başla', pause: 'Fasilə', resume: 'Davam et', replay: 'Yenidən oyna',
      left: 'Qülləni sola döndər', right: 'Qülləni sağa döndər', smash: 'Basılı saxla · Qır',
      ready: 'Başla, sonra sarı hissəni qabağa gətir.', paused: 'Oyun dayandırılıb.',
      section: { yellow: 'Sarı · qırıla bilir', solid: 'Mavi · bərk səth', red: 'Qırmızı · təhlükə' },
      lost: { red: 'Qırmızı hissəyə dəydin!', solid: 'Mavi platformanı qırmaq olmur!' },
      won: 'Qüllənin sonuna çatdın!', falling: 'Növbəti platformaya enirsən',
      powered: 'Orb gücü aktivdir', coin: 'Sikkə · +10 xal', orb: 'Orb · 4 saniyə güc', arena: 'Qüllə arenası',
    },
    en: {
      title: 'Tower Descent', intro: 'Rotate the tower, break platforms and reach the bottom.',
      instructions: 'Drag or use ← → to rotate. Hold the arena, Smash or Space to break a yellow section.',
      rules: 'Trying to smash red or blue ends the run. A purple orb lets you break any section for 4 seconds.',
      floor: 'Platform', score: 'Score', boost: 'Power', start: 'Start', pause: 'Pause', resume: 'Resume', replay: 'Play again',
      left: 'Rotate tower left', right: 'Rotate tower right', smash: 'Hold · Smash',
      ready: 'Start, then turn a yellow section to the front.', paused: 'Game paused.',
      section: { yellow: 'Yellow · breakable', solid: 'Blue · solid surface', red: 'Red · danger' },
      lost: { red: 'You hit a red section!', solid: 'Blue platforms cannot be smashed!' },
      won: 'You reached the bottom!', falling: 'Dropping to the next platform',
      powered: 'Orb power is active', coin: 'Coin · +10 points', orb: 'Orb · 4 seconds of power', arena: 'Tower arena',
    }
  };
  const floorCount = 18;
  const tau = 2 * Math.PI;
  const segments = ['yellow', 'solid', 'red', 'yellow', 'solid', 'yellow', 'red', 'solid'];
  const wedge = tau / segments.length;
  const colours = {
    yellow: ['#ffcb67', '#a35e2d'], solid: ['#456d9b', '#223f61'], red: ['#f77d8b', '#90334d'],
  };
  const geometry = { width: 400, height: 420, x: 200, y: 185, radius: 121, depth: 29, pitch: 77 };
  const ballRadius = 12;
  const holdTime = .24;
  const bounceTime = .65;
  const boostTime = 4;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const copy = () => words[lang === 'en' ? 'en' : 'az'];
  const wrap = angle => (angle % tau + tau) % tau;
  let game;

  function reset(state) {
    const floors = Array.from({ length: floorCount }, (_, index) => {
      const angle = index === 0 ? Math.PI / 2 - wedge / 2 : Math.random() * tau;
      const coins = new Set([0, 3 + Math.floor(Math.random() * 3)]);
      const orb = index >= 2 && Math.random() < .12 ? Math.floor(Math.random() * segments.length) : -1;
      if (orb >= 0) coins.delete(orb);
      return { angle, coins, orb };
    });
    Object.assign(state, {
      phase: 'idle', floors, floor: 0, score: 0, power: 0, rotation: 0,
      bounce: 0, fall: null, fragment: null, pointer: null, held: false, charge: 0,
      failure: null, previousFrame: null,
    });
  }

  function activeSector(state) {
    const floor = state.floors[state.floor];
    return floor ? Math.floor(wrap(Math.PI / 2 - floor.angle - state.rotation) / wedge) % segments.length : -1;
  }

  function impact(state) {
    const index = activeSector(state);
    const floor = state.floors[state.floor];
    if (floor.coins.delete(index)) state.score += 10;
    if (floor.orb === index) {
      state.power = boostTime;
      floor.orb = -1;
    }
    if (state.charge < holdTime) return;
    const zone = segments[index];
    if (zone !== 'yellow' && !state.power) {
      state.failure = zone;
      state.phase = 'lost';
      release(state);
      return;
    }
    state.fall = { age: 0, duration: state.power ? .13 : .26 };
    state.fragment = { index, colour: colours[zone][0] };
  }

  function step(state, dt) {
    state.power = Math.max(0, state.power - dt);
    if (state.held) state.charge = Math.min(holdTime, state.charge + dt);
    if (state.fall) {
      state.fall.age += dt;
      if (state.fall.age >= state.fall.duration) {
        state.floor++;
        state.fall = null;
        state.fragment = null;
        if (state.floor === floorCount) {
          state.phase = 'won';
          release(state);
        } else {
          impact(state);
        }
      }
      return;
    }
    state.bounce += dt;
    if (state.bounce >= bounceTime) {
      state.bounce = 0;
      impact(state);
    }
  }

  function slice(ctx, y, angle, layer) {
    const { x, radius, depth } = geometry;
    ctx.beginPath();
    ctx.ellipse(x, y + layer, radius, depth, 0, angle, angle + wedge);
    ctx.ellipse(x, y + layer, radius * .23, depth * .23, 0, angle + wedge, angle, true);
    ctx.closePath();
  }

  function platform(ctx, y, rotation, floor, selected = -1) {
    const { x, radius, depth } = geometry;
    for (const layer of [7, 0]) {
      for (let index = 0; index < segments.length; index++) {
        const angle = floor.angle + rotation + index * wedge;
        slice(ctx, y, angle, layer);
        ctx.fillStyle = colours[segments[index]][layer ? 1 : 0];
        ctx.fill();
        if (layer) continue;
        ctx.lineWidth = selected === index ? 2.1 : 1;
        ctx.strokeStyle = selected === index ? '#ffffff' : '#101d33';
        ctx.stroke();
      }
    }
    for (const index of [...floor.coins, floor.orb].filter(value => value >= 0)) {
      const angle = floor.angle + rotation + (index + .5) * wedge;
      const px = x + Math.cos(angle) * radius * .79;
      const py = y + Math.sin(angle) * depth * .82;
      const isOrb = floor.orb === index;
      ctx.save();
      ctx.translate(px, py - 8);
      ctx.beginPath();
      if (isOrb) {
        ctx.moveTo(0, -9);
        ctx.lineTo(8, 0);
        ctx.lineTo(0, 9);
        ctx.lineTo(-8, 0);
        ctx.closePath();
      } else {
        ctx.ellipse(0, 0, 6, 8, .22, 0, tau);
      }
      ctx.fillStyle = isOrb ? '#ca99ff' : '#fff5b4';
      ctx.strokeStyle = isOrb ? '#56259e' : '#af702d';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  function draw(state) {
    const ctx = state.ctx;
    const { width, height, x, y, depth, pitch } = geometry;
    const fall = state.fall ? Math.min(1, state.fall.age / state.fall.duration) : 0;
    const camera = fall * pitch;
    ctx.clearRect(0, 0, width, height);
    const shaft = ctx.createLinearGradient(x - 25, 0, x + 25, 0);
    shaft.addColorStop(0, '#142e4a');
    shaft.addColorStop(.45, '#4f7d9a');
    shaft.addColorStop(1, '#132a42');
    ctx.fillStyle = shaft;
    ctx.fillRect(x - 25, y - 114 - camera, 50, height);
    ctx.fillStyle = '#507b99';
    ctx.beginPath();
    ctx.ellipse(x, y - 114 - camera, 25, 10, 0, 0, tau);
    ctx.fill();

    // Draw the floors below first so upper platforms cover their back edges.
    const first = state.floor + (state.fall ? 1 : 0);
    for (let index = Math.min(floorCount - 1, state.floor + 5); index >= first; index--) {
      const heightOnScreen = y + (index - state.floor) * pitch - camera;
      if (heightOnScreen > height + 30) continue;
      platform(ctx, heightOnScreen, state.rotation, state.floors[index], index === state.floor ? activeSector(state) : -1);
    }
    if (state.floor >= floorCount - 3) {
      const base = y + (floorCount - state.floor) * pitch - camera;
      ctx.fillStyle = '#78f2cb';
      ctx.beginPath();
      ctx.ellipse(x, base, 100, 23, 0, 0, tau);
      ctx.fill();
    }
    if (state.fragment) {
      const motion = reducedMotion.matches ? 0 : fall;
      ctx.globalAlpha = 1 - fall;
      ctx.fillStyle = state.fragment.colour;
      const centre = x + (state.fragment.index % 2 ? -1 : 1) * 23 * motion;
      for (let index = 0; index < 9; index++) {
        ctx.fillRect(centre + (index - 4) * (7 + motion * 11), y + depth - camera + index % 3 * 5 + motion * 26, 5, 4);
      }
      ctx.globalAlpha = 1;
    }

    const foot = y + depth * .82;
    const motion = Math.sin(Math.PI * state.bounce / bounceTime) * 69;
    const ballY = foot - ballRadius - (state.fall ? 0 : motion);
    ctx.fillStyle = '#09172890';
    ctx.beginPath();
    ctx.ellipse(x, foot, 13, 4, 0, 0, tau);
    ctx.fill();
    const glowing = state.power > 0;
    const fill = ctx.createRadialGradient(x - 5, ballY - 6, 1, x, ballY, ballRadius);
    fill.addColorStop(0, '#ffffff');
    fill.addColorStop(.48, glowing ? '#edceff' : '#a5ffe2');
    fill.addColorStop(1, glowing ? '#9150e8' : '#35a99d');
    ctx.shadowColor = glowing ? '#ca99ff' : '#66dfc3';
    ctx.shadowBlur = state.charge >= holdTime ? 20 : 8;
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(x, ballY, ballRadius, 0, tau);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function update(state) {
    const l = copy();
    const status = {
      idle: l.ready, paused: l.paused, won: l.won, lost: l.lost[state.failure],
      playing: state.power ? l.powered : state.fall ? l.falling : l.section[segments[activeSector(state)]],
    };
    const set = (node, value) => { if (node.textContent !== value) node.textContent = value; };
    set(state.ui.floor, Math.min(state.floor + 1, floorCount) + ' / ' + floorCount);
    set(state.ui.score, String(state.score));
    set(state.ui.power, Math.ceil(state.power) + ' s');
    set(state.ui.status, status[state.phase]);
    set(state.ui.main, { idle: l.start, playing: l.pause, paused: l.resume, lost: l.replay, won: l.replay }[state.phase]);
    state.ui.smash.classList.toggle('tower-charging', state.held);
    draw(state);
  }

  function tick(state, stamp) {
    if (state.phase !== 'playing') return;
    let delta = Math.min(.05, (stamp - (state.previousFrame ?? stamp)) / 1000);
    state.previousFrame = stamp;
    while (delta > 0 && state.phase === 'playing') {
      const dt = Math.min(delta, 1 / 120);
      step(state, dt);
      delta -= dt;
    }
    update(state);
    if (state.phase === 'playing') state.frame = requestAnimationFrame(time => tick(state, time));
  }

  function rotate(state, amount) {
    if (state.phase !== 'playing') return;
    state.rotation = wrap(state.rotation + amount);
    update(state);
  }

  function release(state) {
    state.held = false;
    state.charge = 0;
    state.pointer = null;
  }

  function pause(state) {
    if (state.phase !== 'playing') return;
    cancelAnimationFrame(state.frame);
    state.phase = 'paused';
    release(state);
    update(state);
  }

  function bindInput(state, surface, drag) {
    surface.oncontextmenu = event => event.preventDefault();
    surface.onpointerdown = event => {
      if (state.phase !== 'playing' || state.pointer || event.button !== 0) return;
      surface.setPointerCapture(event.pointerId);
      state.pointer = { id: event.pointerId, x: event.clientX, dragged: false };
      state.held = true;
      state.charge = 0;
    };
    surface.onpointermove = event => {
      const pointer = state.pointer;
      if (!drag || pointer?.id !== event.pointerId) return;
      const dx = event.clientX - pointer.x;
      if (!pointer.dragged && Math.abs(dx) < 7) return;
      pointer.dragged = true;
      state.held = false;
      state.charge = 0;
      pointer.x = event.clientX;
      rotate(state, dx * .016);
    };
    surface.onpointerup = surface.onpointercancel = surface.onlostpointercapture = event => {
      if (state.pointer?.id === event.pointerId) release(state);
    };
  }

  function render(root, title) {
    if (!game) {
      game = {};
      reset(game);
    }
    const state = game;
    release(state);
    const l = copy();
    root.innerHTML = title(l.title, l.intro, 'games', t('navGames')) + `
      <section class="game-shell function-panel" aria-labelledby="gamesTitle">
        <div class="game-stats">
          <span>${esc(l.floor)} <strong class="tower-floor"></strong></span>
          <span>${esc(l.score)} <strong class="tower-score"></strong></span>
          <span>${esc(l.boost)} <strong class="tower-power"></strong></span>
        </div>
        <div class="game-arena tower-arena" tabindex="0" role="group" aria-label="${esc(l.arena)}" aria-describedby="towerInstructions">
          <canvas width="400" height="420" aria-hidden="true"></canvas>
        </div>
        <p class="game-status tower-status" role="status"></p>
        <div class="game-controls tower-controls">
          <button class="btn btn--secondary" type="button" data-tower="left" aria-label="${esc(l.left)}">${ic('chevron-left')}</button>
          <button class="btn btn--primary" type="button" data-tower="main"></button>
          <button class="btn btn--secondary" type="button" data-tower="right" aria-label="${esc(l.right)}">${ic('chevron-right')}</button>
          <button class="btn btn--secondary tower-smash" type="button" data-tower="smash">${ic('zap')}${esc(l.smash)}</button>
        </div>
        <div class="tower-legend"><span>${esc(l.coin)}</span><span>${esc(l.orb)}</span></div>
        <p class="game-instructions" id="towerInstructions">${esc(l.instructions)}</p>
        <p class="game-instructions">${esc(l.rules)}</p>
      </section>`;
    const arena = $('.tower-arena', root);
    state.ctx = $('canvas', arena).getContext('2d');
    state.root = root;
    state.ui = {
      floor: $('.tower-floor', root), score: $('.tower-score', root), power: $('.tower-power', root),
      status: $('.tower-status', root), main: $('[data-tower="main"]', root), smash: $('[data-tower="smash"]', root),
    };
    $('[data-tower="left"]', root).onclick = () => rotate(state, -wedge / 2);
    $('[data-tower="right"]', root).onclick = () => rotate(state, wedge / 2);
    bindInput(state, arena, true);
    bindInput(state, state.ui.smash, false);
    state.ui.main.onclick = () => {
      if (state.phase === 'playing') return pause(state);
      if (state.phase === 'lost' || state.phase === 'won') reset(state);
      state.phase = 'playing';
      state.previousFrame = null;
      state.frame = requestAnimationFrame(time => tick(state, time));
      update(state);
      arena.focus({ preventScroll: true });
    };
    update(state);
  }

  function leave() {
    if (!game) return;
    cancelAnimationFrame(game.frame);
    release(game);
    game = undefined;
  }

  window.addEventListener('keydown', event => {
    if (game?.phase !== 'playing' || !game.root.contains(document.activeElement) || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      rotate(game, event.key === 'ArrowLeft' ? -.2 : .2);
    } else if (event.code === 'Space' && (event.target.matches?.('.tower-arena, .tower-smash'))) {
      event.preventDefault();
      if (!event.repeat && !game.pointer) game.held = true;
    }
  });
  window.addEventListener('keyup', event => {
    if (event.code === 'Space' && game?.held && !game.pointer) release(game);
  });
  window.addEventListener('blur', () => { if (game) pause(game); });
  window.addEventListener('pagehide', () => { if (game) pause(game); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && game) pause(game); });

  U.towerGame = { render, leave, copy };
})();
