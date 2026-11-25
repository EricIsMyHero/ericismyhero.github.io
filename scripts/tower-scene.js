(function () {
  'use strict';

  const tau = Math.PI * 2;
  const width = 400;
  const height = 460;
  const pitch = 94;
  const radius = 158;
  const shaftRadius = 29;
  const playRadius = radius * .79;
  const cameraTilt = .48;
  const cosTilt = Math.cos(cameraTilt);
  const sinTilt = Math.sin(cameraTilt);
  const surfaces = {
    yellow: [255, 199, 88], solid: [104, 149, 211], red: [245, 102, 128],
  };
  const coinColour = [255, 219, 110];
  const orbColour = [198, 138, 248];
  const floorColour = [97, 238, 192];
  const shaftColour = [105, 142, 182];

  const polar = (r, a, y) => [Math.cos(a) * r, y, Math.sin(a) * r];
  const shade = (colour, light) => 'rgb(' + colour.map(channel => Math.round(Math.min(255, channel * light))).join(' ') + ')';

  function draw(ctx, view) {
    const { floors, floor, rotation, sectors, active, falling, fragment, bounce, powered, charged, reducedMotion } = view;
    const descent = falling === null ? 0 : falling;
    const camera = descent * descent * (3 - 2 * descent) * pitch;
    const wedge = tau / sectors.length;
    const queue = [];
    const project = ([x, y, z]) => {
      const relative = y - camera;
      const distance = 510 + relative * sinTilt - z * cosTilt;
      const scale = 430 / distance;
      return { x: width / 2 + x * scale, y: 199 + (relative * cosTilt + z * sinTilt) * scale, distance, scale };
    };

    function face(vertices, colour, edge = '') {
      const points = vertices.map(project);
      if (points.every(point => point.y > height + 1) || points.every(point => point.y < -1)) return;
      const depth = points.reduce((total, point) => total + point.distance, 0) / points.length;
      queue.push({ depth, paint() {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (const point of points.slice(1)) ctx.lineTo(point.x, point.y);
        ctx.closePath();
        ctx.fillStyle = colour;
        ctx.fill();
        ctx.lineWidth = edge ? 1 : .65;
        ctx.strokeStyle = edge || colour;
        ctx.stroke();
      } });
    }

    function disc(y, outer, inner, start, stop, colour, depth, mark = false) {
      const slices = Math.max(3, Math.round((stop - start) / tau * 32));
      for (let index = 0; index < slices; index++) {
        const a = start + (stop - start) * index / slices;
        const b = start + (stop - start) * (index + 1) / slices;
        const mid = (a + b) / 2;
        const outerA = polar(outer, a, y);
        const outerB = polar(outer, b, y);
        const topLight = .94 + Math.cos(mid + .5) * .09;
        if (depth && Math.sin(mid) > .02) {
          face([outerA, outerB, polar(outer, b, y + depth), polar(outer, a, y + depth)],
            shade(colour, .4 + .3 * Math.sin(mid)));
        }
        face([polar(inner, a, y), outerA, outerB, polar(inner, b, y)], shade(colour, topLight));
        if (mark) {
          face([polar(outer - 6, a, y - .6), polar(outer - 1, a, y - .6),
            polar(outer - 1, b, y - .6), polar(outer - 6, b, y - .6)], '#fff6de');
        }
      }
      if (depth && stop - start < tau) {
        for (const a of [start, stop]) {
          face([polar(inner, a, y), polar(outer, a, y), polar(outer, a, y + depth), polar(inner, a, y + depth)],
            shade(colour, .69));
        }
      }
    }

    function towerShaft(top, bottom) {
      const slices = 18;
      for (let y = top; y < bottom; y += pitch / 2) {
        const lower = Math.min(bottom, y + pitch / 2);
        for (let index = 0; index < slices; index++) {
          const a = index / slices * tau;
          const b = (index + 1) / slices * tau;
          const mid = (a + b) / 2;
          if (Math.sin(mid) < 0) continue;
          face([polar(shaftRadius, a, y), polar(shaftRadius, b, y), polar(shaftRadius, b, lower),
            polar(shaftRadius, a, lower)], shade(shaftColour, .66 + Math.cos(mid - .85) * .27));
        }
      }
      disc(top, shaftRadius, 0, 0, tau, shaftColour, 0);
    }

    function token(y, angle, orb) {
      const point = project(polar(playRadius, angle, y - 11));
      queue.push({ depth: point.distance, paint() {
        ctx.save();
        ctx.translate(point.x, point.y);
        ctx.scale(point.scale, point.scale);
        ctx.beginPath();
        if (orb) {
          ctx.moveTo(0, -10);
          ctx.lineTo(8, 0);
          ctx.lineTo(0, 10);
          ctx.lineTo(-8, 0);
          ctx.closePath();
        } else {
          ctx.ellipse(0, 0, 6, 8, -.18, 0, tau);
        }
        ctx.shadowColor = orb ? '#ae6aff' : '#fac85b';
        ctx.shadowBlur = orb ? 13 : 5;
        ctx.fillStyle = shade(orb ? orbColour : coinColour, 1.13);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = shade(orb ? orbColour : coinColour, .53);
        ctx.stroke();
        ctx.restore();
      } });
    }

    const end = Math.min(floors.length, floor + 6);
    const top = Math.max(-320, -110 - floor * pitch);
    towerShaft(top, (end - floor) * pitch + 12);
    for (let index = floor; index < end; index++) {
      const level = floors[index];
      const y = (index - floor) * pitch;
      for (let section = 0; section < sectors.length; section++) {
        if (index === floor && fragment?.index === section) continue;
        const a = level.angle + rotation + section * wedge;
        disc(y, radius, shaftRadius - 1, a + .016, a + wedge - .016,
          surfaces[sectors[section]], 13, index === floor && section === active);
      }
      for (const coin of level.coins) token(y, level.angle + rotation + (coin + .5) * wedge, false);
      if (level.orb >= 0) token(y, level.angle + rotation + (level.orb + .5) * wedge, true);
    }
    if (end === floors.length) disc((end - floor) * pitch, radius * .92, 0, 0, tau, floorColour, 15);

    if (fragment) {
      const movement = reducedMotion ? 0 : descent;
      for (let index = 0; index < 8; index++) {
        const a = fragment.angle + (index - 3.5) * (.06 + movement * .1);
        const r = (playRadius - 16 + index * 4) * (1 + movement * .22);
        const y = 13 + movement * (50 + index % 2 * 30);
        const point = project(polar(r, a, y));
        queue.push({ depth: point.distance, paint() {
          ctx.globalAlpha = 1 - descent;
          ctx.fillStyle = shade(surfaces[fragment.zone], 1.05);
          ctx.fillRect(point.x - 2, point.y - 2, 5 * point.scale, 5 * point.scale);
          ctx.globalAlpha = 1;
        } });
      }
    }

    const contact = project([0, 0, playRadius]);
    if (falling === null) {
      queue.push({ depth: contact.distance - .5, paint() {
        ctx.fillStyle = 'rgba(8, 17, 28, .38)';
        ctx.beginPath();
        ctx.ellipse(contact.x, contact.y, 16 * contact.scale, 5 * contact.scale, 0, 0, tau);
        ctx.fill();
      } });
    }
    const ball = project([0, descent * descent * pitch - bounce - 14, playRadius]);
    queue.push({ depth: ball.distance - 1, paint() {
      const size = 14 * ball.scale;
      const fill = ctx.createRadialGradient(ball.x - size * .4, ball.y - size * .5, 1, ball.x, ball.y, size);
      fill.addColorStop(0, '#fff');
      fill.addColorStop(.48, powered ? '#e6c7ff' : '#abffe5');
      fill.addColorStop(1, powered ? '#7946c7' : '#288e92');
      ctx.shadowColor = powered ? '#bd8aff' : '#66dfc3';
      ctx.shadowBlur = charged ? 20 : 8;
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, size, 0, tau);
      ctx.fill();
      ctx.shadowBlur = 0;
    } });

    ctx.clearRect(0, 0, width, height);
    queue.sort((a, b) => b.depth - a.depth);
    for (const item of queue) item.paint();
  }

  window.UNEC.towerScene = { draw, width, height };
})();
