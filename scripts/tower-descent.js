(function () {
  'use strict';

  const U = window.UNEC;
  const { $, esc, ic } = U;
  const progress = window.UNECGameProgress;
  const words = {
    az: {
      title: 'Qüllə enişi', intro: 'Qülləni döndər, platformaları qır və ən aşağıya en.',
      instructions: 'Qülləni sürüşdürərək və ya ← → ilə döndər. Sarı hissəni qırmaq üçün arenaya, «Qır» düyməsinə və ya Space düyməsinə basılı saxla.',
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
  const scene = U.towerScene;
  const holdTime = .24;
  const bounceTime = .65;
  const boostTime = 4;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const copy = () => words[lang === 'en' ? 'en' : 'az'];
  const wrap = angle => (angle % tau + tau) % tau;
  const score = state => state.score + state.floor * 20 + (state.phase === 'won' ? 100 : 0);
  let game;

  function reset(state) {
    const floors = Array.from({ length: floorCount }, (_, index) => {
      const angle = index === 0 ? Math.PI / 2 - wedge / 2 : Math.random() * tau;
      const coins = new Set([0, 3 + Math.floor(Math.random() * 3)]);
      const vacant = segments.map((_, sector) => sector).filter(sector => !coins.has(sector));
      coins.add(vacant.splice(Math.floor(Math.random() * vacant.length), 1)[0]);
      const orb = index >= 2 && Math.random() < .12 ? vacant[Math.floor(Math.random() * vacant.length)] : -1;
      return { angle, coins, orb };
    });
    Object.assign(state, {
      phase: 'idle', floors, floor: 0, score: 0, power: 0, rotation: 0,
      bounce: 0, fall: null, fragment: null, pointer: null, held: false, charge: 0,
      failure: null, previousFrame: null, run: null, skin: progress.activeSkin(),
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
    state.fragment = { index, zone, angle: floor.angle + state.rotation + (index + .5) * wedge };
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

  function draw(state) {
    if (!state.ctx) return;
    scene.draw(state.ctx, {
      floors: state.floors, floor: state.floor, rotation: state.rotation, sectors: segments,
      active: activeSector(state), fragment: state.fragment,
      falling: state.fall ? Math.min(1, state.fall.age / state.fall.duration) : null,
      bounce: state.fall ? 0 : Math.sin(Math.PI * state.bounce / bounceTime) * 69,
      powered: state.power > 0, charged: state.charge >= holdTime, reducedMotion: reducedMotion.matches,
      skin: state.run?.skin ?? state.skin,
    });
  }

  function update(state) {
    const l = copy();
    const status = {
      idle: l.ready, paused: l.paused, won: l.won, lost: l.lost[state.failure],
      playing: state.power ? l.powered : state.fall ? l.falling : l.section[segments[activeSector(state)]],
    };
    const set = (node, value) => { if (node.textContent !== value) node.textContent = value; };
    set(state.ui.floor, Math.min(state.floor + 1, floorCount) + ' / ' + floorCount);
    set(state.ui.score, String(score(state)));
    set(state.ui.power, Math.ceil(state.power) + ' s');
    set(state.ui.status, status[state.phase]);
    set(state.ui.main, { idle: l.start, playing: l.pause, paused: l.resume, lost: l.replay, won: l.replay }[state.phase]);
    state.ui.smash.classList.toggle('tower-charging', state.held);
    if ((state.phase === 'won' || state.phase === 'lost') && state.run && !state.run.result) {
      const result = progress.finish(state.run, score(state), state.phase === 'won');
      state.meta?.showResult(result);
    }
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
          <canvas width="${scene.width}" height="${scene.height}" aria-hidden="true"></canvas>
        </div>
        <p class="game-status tower-status" role="status"></p>
        <div class="game-controls tower-controls">
          <button class="btn btn--secondary" type="button" data-tower="left" aria-label="${esc(l.left)}">${ic('chevron-left')}</button>
          <button class="btn btn--primary" type="button" data-tower="main"></button>
          <button class="btn btn--secondary" type="button" data-tower="right" aria-label="${esc(l.right)}">${ic('chevron-right')}</button>
          <button class="btn btn--secondary tower-smash" type="button" data-tower="smash">${ic('zap')}${esc(l.smash)}</button>
        </div>
        <div class="tower-legend"><span>${esc(l.coin)}</span><span>${esc(l.orb)}</span></div>
        <p class="sr-only" id="towerInstructions">${esc(l.instructions)}</p>
        <div data-game-profile></div>
      </section>`;
    const arena = $('.tower-arena', root);
    state.ctx = $('canvas', arena).getContext('2d');
    state.root = root;
    state.ui = {
      floor: $('.tower-floor', root), score: $('.tower-score', root), power: $('.tower-power', root),
      status: $('.tower-status', root), main: $('[data-tower="main"]', root), smash: $('[data-tower="smash"]', root),
    };
    state.meta = progress.mount($('[data-game-profile]', root), {
      game: 'tower-descent', mode: 'standard', language: lang, result: state.run?.result, onOpen: () => pause(state)
    });
    $('[data-tower="left"]', root).onclick = () => rotate(state, -wedge / 2);
    $('[data-tower="right"]', root).onclick = () => rotate(state, wedge / 2);
    bindInput(state, arena, true);
    bindInput(state, state.ui.smash, false);
    state.ui.main.onclick = () => {
      if (state.phase === 'playing') return pause(state);
      if (state.phase === 'lost' || state.phase === 'won') reset(state);
      if (!state.run) {
        state.run = progress.start('tower-descent', 'standard');
        state.meta.showResult(null);
      }
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
