import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { loadCompass } from '../tools/compass-build.mjs';

test('mobile catalog matches the published materials, plans and Compass sources', () => {
  const read = file => fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8');
  const catalog = JSON.parse(read('data/mobile-catalog.json'));
  const source = { window: { addEventListener() {} } };
  vm.createContext(source);
  vm.runInContext(read('pdfs.js') + '\nthis.result = { data, extrasData, BASE, EXTRAS_BASE, PDF_TYPES };', source);
  vm.runInContext(read('scripts/curriculum.js') + '\nthis.plans = { CURRICULUM_DATA, CURRICULUM_CODES };', source);
  vm.runInContext(read('data/material-identities.js') + '\nthis.identities = MATERIAL_IDENTITIES;', source);
  assert.equal(catalog.version, 1);
  for (const key of ['data', 'extrasData', 'BASE', 'EXTRAS_BASE', 'PDF_TYPES']) {
    assert.deepEqual(catalog.materials[key], JSON.parse(JSON.stringify(source.result[key])));
  }
  assert.deepEqual(catalog.materials.MATERIAL_IDENTITIES, JSON.parse(JSON.stringify(source.identities)));
  assert.deepEqual(catalog.curriculum, JSON.parse(JSON.stringify(source.plans)));
  assert.deepEqual(catalog.compass, loadCompass(new URL('..', import.meta.url).pathname));
});
