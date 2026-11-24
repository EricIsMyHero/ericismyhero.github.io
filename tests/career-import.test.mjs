import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const context = { URL };
vm.runInNewContext(readFileSync(new URL('../admin-panel/career-import.js', import.meta.url), 'utf8'), context);
const parse = value => structuredClone(context.parseCareerText(value));

test('a Telegram announcement keeps programme dates separate from its application deadline', () => {
  const description = 'Proqram İT sahəsində bakalavr tələbələri üçündür.\n\n15 fevral - 31 may 2027-ci il tarixlərini əhatə edən bu proqramda mentor dəstəyi var.';
  const imported = parse(`*📢 AZCON Holding “Rəqəmsal Körpü” Təcrübə Proqramına Qeydiyyat Başladı!*

${description}

📅 Son tarix: 27 Noyabr 2026

🔗 Qeydiyyat linki:
https://azcon.gov.az/az/internship`);
  assert.deepEqual(imported, { fields: {
    title: '“Rəqəmsal Körpü” Təcrübə Proqramı', company: 'AZCON Holding', type: 'internship',
    category: 'it', description, schedule: '15 fevral - 31 may 2027-ci il',
    deadline: '2026-11-27', applyUrl: 'https://azcon.gov.az/az/internship',
  }, warnings: [] });
});

test('structured lines support numeric dates and leave an ambiguous link for review', () => {
  const { fields, warnings } = parse(`Təşkilat: Tələbə Klubu
Başlıq: Könüllülük proqramı
Tarix və saat: 6 dekabr, 11:00
📍 Məkan: Bakı
Son müraciət: 05.12.2026

https://example.com/form
https://example.com/news`);
  assert.equal(fields.deadline, '2026-12-05');
  assert.equal(fields.location, 'Bakı');
  assert.equal(fields.schedule, '6 dekabr, 11:00');
  assert.equal(fields.type, 'volunteer');
  assert.equal(fields.applyUrl, undefined);
  assert.equal(warnings.length, 1);
});

test('invalid dates and insecure application links are kept in the text for review', () => {
  const { fields, warnings } = parse(`Təlim proqramı
Son tarix: 31 noyabr 2026
Müraciət linki: http://example.com/form`);
  assert.equal(fields.deadline, undefined);
  assert.equal(fields.applyUrl, undefined);
  assert.match(fields.description, /31 noyabr 2026/);
  assert.match(fields.description, /http:\/\/example\.com\/form/);
  assert.equal(warnings.length, 2);
});
