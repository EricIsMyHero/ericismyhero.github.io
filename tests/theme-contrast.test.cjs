const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function luminance(color) {
  const rgb = color.startsWith('#')
    ? (color.length === 4 ? [...color.slice(1)].map(digit => digit.repeat(2)) : color.slice(1).match(/../g)).map(channel => parseInt(channel, 16))
    : color.match(/\d+/g).map(Number);
  return rgb.reduce((total, value, index) => {
    const channel = value / 255;
    const linear = channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    return total + linear * [0.2126, 0.7152, 0.0722][index];
  }, 0);
}

function contrast(text, background) {
  const colors = [luminance(text), luminance(background)].sort((a, b) => b - a);
  return (colors[0] + 0.05) / (colors[1] + 0.05);
}

test('all selectable palettes keep filled controls and secondary text readable', () => {
  const values = new Map();
  const document = {
    addEventListener() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    body: { setAttribute() {} },
    documentElement: { style: { setProperty: (key, value) => values.set(key, value) } },
  };
  const context = vm.createContext({ document, localStorage: { setItem() {} } });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../scripts/data-utils.js'), 'utf8'), context);
  const names = vm.runInContext('Object.keys(themes)', context);
  assert.ok(names.includes('midnight'));
  for (const name of names) {
    context.applyTheme(name);
    for (const background of ['--accent', '--color-primary-hover']) {
      assert.ok(contrast(values.get('--color-on-primary'), values.get(background)) >= 4.5, `${name} ${background}`);
    }
    for (const nameOfText of ['--accent2', '--muted']) {
      for (const background of ['--bg', '--surface', '--surface2']) {
        assert.ok(contrast(values.get(nameOfText), values.get(background)) >= 4.5, `${name} ${nameOfText} on ${background}`);
      }
    }
  }
});
