const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function device(localStorage = storage()) {
  const window = { addEventListener() {}, dispatchEvent() {} };
  const sessionStorage = storage();
  const context = vm.createContext({ window, localStorage, sessionStorage, navigator: {}, CustomEvent: class {} });
  for (const file of ['wardrobe-collection', 'student-wardrobe', 'semester-profile']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../scripts', file + '.js'), 'utf8'), context);
  }
  function earn(uid, times) {
    for (let i = 0; i < times; i++) {
      window.UNECSemesterProfile.saveGameRecord(uid + i, { uid, game: 'semester-defense', mode: 'daily',
        score: 9000, won: true, economy: 2 });
    }
  }
  return { ...window, localStorage, earn };
}
function storage() {
  const entries = new Map();
  return {
    get length() { return entries.size; },
    key: index => [...entries.keys()][index],
    getItem: key => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
    removeItem: key => entries.delete(key)
  };
}
const wallet = (p, uid) => {
  const { points, available, spent } = p.stats(uid);
  return [points, available, spent];
};

test('the 50 additions all render distinct art and have prices from 50 to 500', () => {
  const { UNECWardrobeCollection: newItems, UNECStudentWardrobe: wardrobe } = device();
  const entries = Object.entries(newItems).flatMap(([section, rows]) => rows.map(row => [section, ...row]));
  assert.equal(entries.length, 50);
  const images = new Set();
  for (const [section, id, az, en, price] of entries) {
    assert(price >= 50 && price <= 500);
    assert.equal(wardrobe.collection[section][id].price, price);
    assert(id.length <= 24);
    assert(az && en);
    const art = wardrobe.avatar({ ...wardrobe.defaults, [section]: id });
    assert.notEqual(art, wardrobe.avatar(wardrobe.defaults));
    images.add(art);
  }
  assert.equal(images.size, 50);
});

test('purchases preserve lifetime points, persist across reload, and charge only once', async () => {
  const app = device(), p = app.UNECSemesterProfile;
  p.setAccount({ uid: 'a' }, 'A');
  app.earn('a', 13);
  assert.deepEqual(wallet(p, 'a'), [130, 130, 0]);
  assert.equal(p.unlocked('outfit', 'denim', p.stats('a')), false);
  await p.saveLook('a', { outfit: 'denim' });
  assert.equal(p.lookOf('a').outfit, 'classic');
  assert.equal((await p.purchase('a', 'outfit', 'denim')).status, 'bought');
  assert.equal((await p.purchase('a', 'outfit', 'denim')).status, 'owned');
  assert.equal((await p.purchase('a', 'pose', 'champion')).status, 'funds');
  assert.deepEqual(wallet(p, 'a'), [130, 80, 50]);
  await p.saveLook('a', { outfit: 'denim', avatar: true });
  const reloaded = device(app.localStorage).UNECSemesterProfile;
  assert.equal(reloaded.lookOf('a').outfit, 'denim');
  assert.deepEqual(wallet(reloaded, 'a'), [130, 80, 50]);
  assert.deepEqual(wallet(reloaded, 'b'), [0, 0, 0]);
  assert.equal((await p.purchase('b', 'mood', 'sleepless')).status, 'account');
});

test('grandfathers the previous equipped look, with balances durable against stale legacy clients', async () => {
  const app = device(), p = app.UNECSemesterProfile;
  p.setAccount({ uid: 'a' }, 'A');
  app.earn('a', 10);
  const legacyKey = 'unec_semester_look_v1:a';
  app.localStorage.setItem(legacyKey, JSON.stringify({ head: 'cap', mood: 'wink', avatar: true }));
  assert.equal(p.lookOf('a').head, 'cap');
  assert.equal(p.lookOf('a').mood, 'none');
  assert.equal((await p.purchase('a', 'head', 'cap')).status, 'owned');
  assert.equal((await p.purchase('a', 'outfit', 'denim')).status, 'bought');
  await p.saveLook('a', { outfit: 'denim' });
  app.localStorage.setItem(legacyKey, JSON.stringify({ head: 'hood' }));
  assert.equal(p.unlocked('head', 'cap', p.stats('a')), true);
  assert.deepEqual(wallet(p, 'a'), [100, 50, 50]);
  app.localStorage.setItem = () => { throw Error('quota'); };
  assert.equal((await p.purchase('a', 'mood', 'sleepless')).status, 'storage');
  assert.deepEqual(wallet(p, 'a'), [100, 50, 50]);
});

test('the avatar character can switch for free without changing the equipped cosmetics', async () => {
  const { UNECSemesterProfile: profile, UNECStudentWardrobe: wardrobe } = device();
  profile.setAccount({ uid: 'a', gender: 'female' }, 'A');
  assert.equal(profile.lookOf('a').character, 'boy');
  const look = { ...profile.lookOf('a'), head: 'glasses', avatar: true };
  assert.equal((await profile.saveLook('a', { ...look, character: 'girl' })).status, 'saved');
  assert.equal(profile.lookOf('a').character, 'girl');
  assert.equal(profile.lookOf('a').head, 'glasses');
  assert.notEqual(wardrobe.avatar(profile.lookOf('a')), wardrobe.avatar(look));
  assert.deepEqual(wallet(profile, 'a'), [0, 0, 0]);
  await profile.saveLook('a', look);
  assert.equal(profile.lookOf('a').character, 'boy');
});
