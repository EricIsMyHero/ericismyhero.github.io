const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '../games/semester-defense/index.html'), 'utf8');
const source = html.match(/<script id="semester-balance">([\s\S]*?)<\/script>/)[1];
const context = { window: {} };
vm.runInNewContext(source, context);
const balance = context.window.UNECSemesterBalance;
const local = value => JSON.parse(JSON.stringify(value));
const assertNear = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, actual + ' ≠ ' + expected);

test('portal distribution matches the stated examples and preserves clean remainders', () => {
  const examples = [[100], [50, 50], [33, 33, 34], [23, 23, 24, 30], [17, 17, 18, 18, 30]];
  for (const [index, expected] of examples.entries()) {
    assert.deepEqual(Array.from(balance.portalCounts(100, index + 1)), expected);
  }
  for (let total = 0; total <= 250; total++) {
    for (let count = 2; count <= 22; count++) {
      const assigned = balance.portalCounts(total, count);
      const newest = assigned.at(-1);
      assert.equal(assigned.length, count);
      assert.equal(assigned.reduce((sum, number) => sum + number, 0), total);
      assert(assigned.every(number => Number.isInteger(number) && number >= 0));
      assert.equal(newest, count <= 3 ? Math.ceil(total / count) : Math.ceil(total * 30 / 100));
      const evenPool = count <= 3 ? assigned : assigned.slice(0, -1);
      assert(Math.max(...evenPool) - Math.min(...evenPool) <= 1);
    }
  }
});

test('the wave planner assigns each boss, elite and regular enemy inside its portal quota', () => {
  const fronts = Array.from({ length: 6 }, (_, index) => ({ id: index + 1 }));
  const entries = ['boss', 'boss', ...Array(20).fill('brute'), ...Array(83).fill('runner')].map(kind => ({ kind }));
  const allocation = balance.assignPortals(entries, fronts);
  const counts = fronts.map(front => entries.filter(enemy => enemy.front === front).length);
  assert.deepEqual(counts, Array.from(balance.portalCounts(entries.length, fronts.length)));
  assert.deepEqual(counts, Array.from(allocation, portal => portal.count));
  assert.equal(entries[0].front, fronts.at(-1));
  assert.equal(entries[1].front, fronts.at(-1));
  assert(allocation.every(portal => portal.unassigned === 0));
});

test('expansions add enemies permanently and tower upgrades and refunds use current prices', () => {
  let total = 61;
  for (const choice of ['extension', 'branch', 'extension', 'branch']) total += balance.expansion[choice];
  assert.equal(total, 89);
  assert.deepEqual(local(balance.towerCosts), { arrow: 40, cannon: 75, frost: 100, flame: 125, storm: 150 });
  const upgrades = { arrow: [27, 42], cannon: [51, 79], frost: [68, 105], flame: [85, 131], storm: [102, 158] };
  const refunds = { arrow: 81.75, cannon: 153.75, frost: 204.75, flame: 255.75, storm: 307.50 };
  for (const [kind, base] of Object.entries(balance.towerCosts)) {
    const prices = [balance.upgradePrice(base, 1), balance.upgradePrice(base, 2)];
    assert.deepEqual(prices, upgrades[kind]);
    assert.equal(balance.refund(base + prices[0] + prices[1]), refunds[kind]);
  }
});

test('session health and rewards, late movement and blackout multipliers are distinct', () => {
  assert.equal(80 * balance.events.session.maxHp, 100);
  assert.equal(12 * balance.events.session.reward, 15);
  assert.equal(balance.speedDuring('session', 5), 1);
  assert.equal(balance.speedDuring('late', 0), 0.9);
  assert.equal(balance.speedDuring('late', 19.999), 0.9);
  assert.equal(balance.speedDuring('late', 20), 1);
  const travel = Array.from({ length: 30 }, (_, second) => 5 * balance.speedDuring('late', second))
    .reduce((distance, advance) => distance + advance, 0);
  assert.equal(travel, 140);
  assert.equal(balance.events.blackout.damage, 2);
  assert.equal(balance.events.blackout.range, 0.9);
});

test('ability timing and relative armor reduction match the updated balance', () => {
  const { strike, appeal, boost } = balance.abilities;
  assert.equal(strike.cooldown, 75);
  assert.equal(strike.damage, 125);
  assert.deepEqual([appeal.cooldown, appeal.duration, appeal.armorReduction], [100, 6, 0.25]);
  assertNear(balance.armorFactor(), 0.48);
  assertNear(balance.armorFactor(appeal.armorReduction), 0.61);
  assertNear((1 - balance.armorFactor(appeal.armorReduction)) / (1 - balance.armorFactor()), 0.75);
  assert.deepEqual([boost.cooldown, boost.duration, boost.rate], [60, 12, 2]);
});
