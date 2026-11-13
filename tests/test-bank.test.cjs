const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const B = require('../scripts/test-bank.js');

const marked = `00016_Az_Q26_Əyani_Yekun imtahan testinin sualları Fənn: İKT
1. Python-da nəticə hansı əmrlə göstərilir?
• output(x)
√ print(x)
• write(x)
2. Dəyişən adı necə başlamalıdır?
• Rəqəmlə
√ Hərflə
• Boşluqla`;

test('catalogue automatically includes every test PDF, deduplicates aliases and excludes written subjects', () => {
  const data = { First: { subjects: { ICT: { type: 'test', pdfs: [{ file: 'old.pdf' }, { file: 'new.pdf', addedAt: '2026-11-13' }] }, Written: { type: 'yazili', pdfs: [{ file: 'written.pdf' }] } } }, Second: { subjects: { ICT: { type: 'test', pdfs: [{ file: 'old.pdf' }] } } } };
  let catalog = B.catalog(data, 'https://example.invalid/');
  assert.deepEqual(Object.keys(catalog), ['ICT']);
  assert.deepEqual(catalog.ICT.map(p => p.file), ['new.pdf', 'old.pdf']);
  data.First.subjects.ICT.pdfs.push({ file: 'ən yeni.pdf' });
  catalog = B.catalog(data, 'https://example.invalid/');
  assert.equal(catalog.ICT.length, 3);
  assert.ok(catalog.ICT[2].url.endsWith(encodeURIComponent('ən yeni.pdf')));
});
test('UNEC bullet/check format preserves the marked answer and question numbers', () => {
  const result = B.parse(marked);
  assert.equal(result.questions.length, 2);
  assert.equal(result.questions[0].options[result.questions[0].answer], 'print(x)');
  assert.equal(result.questions[1].number, 2);
});
test('page boundaries, repeated headers, detached markers and multiline options do not change answers', () => {
  const text = `1. Hansı izah doğrudur?\n•\nYanlış izah\n√\nDüzgün izahın\n\f\n00001_Az_Q26_Əyani_Yekun imtahan testinin sualları\ndavamı\n•\nDigər izah\n2. İkinci səhifənin sualı?\n√ Birinci\n• İkinci`;
  const result = B.parse(text);
  assert.equal(result.questions.length, 2);
  assert.equal(result.questions[0].options[1], 'Düzgün izahın davamı');
  assert.equal(result.questions[0].answer, 1);
  assert.equal(result.questions[1].page, 2);
});
test('lettered options require an explicit answer, rather than guessing option A', () => {
  const r = B.parse(`1) Correct word?\nA) One\nB) Two\nC) Three\nAnswer: B\n2. No answer here?\nA) One\nB) Two`);
  assert.equal(r.questions.length, 1);
  assert.equal(r.questions[0].answer, 1);
  assert.equal(r.stats.unmarked, 1);
});
test('ambiguous answers, empty or duplicate options and invalid answer labels are excluded', () => {
  for (const text of ['√ One\n√ Two', '• One\n• Two', '√ Same\n• Same', 'A) One\nB) Two\nAnswer: C', 'A) One\nC) Two\nAnswer: A']) {
    assert.equal(B.parse('1. Which answer?\n' + text).questions.length, 0);
  }
});
test('numbered lists in a stem remain part of the question', () => {
  const r = B.parse(`1. Uyğun variantı tapın:\n1. İstehsal\n2. Xidmət\n3. Ticarət\n• 1, 2\n√ 1, 2, 3\n• Yalnız 3\n2. Növbəti sual?\n√ Bəli\n• Xeyr`);
  assert.equal(r.questions.length, 2);
  assert.ok(r.questions[0].question.includes('2. Xidmət'));
});
test('merging reconciles shuffled options, retains both sources and excludes contradictory answers', () => {
  const first = B.parse(marked).questions[0];
  const second = { ...first, options: [...first.options].reverse(), answer: first.options.length - 1 - first.answer };
  const files = [{ source: { file: 'a.pdf' }, questions: [first] }, { source: { file: 'b.pdf' }, questions: [second] }];
  let merged = B.merge(files);
  assert.equal(merged.questions.length, 1); assert.equal(merged.duplicates, 1);
  assert.deepEqual(merged.questions[0].sources.map(s => s.file), ['a.pdf', 'b.pdf']);
  files.push({ source: { file: 'c.pdf' }, questions: [{ ...first, answer: 0 }] });
  merged = B.merge(files);
  assert.equal(merged.questions.length, 0); assert.equal(merged.conflicts, 1);
});
test('the live catalogue exposes all electronic-test PDFs without a separate subject list', () => {
  const context = vm.createContext({});
  vm.runInContext(fs.readFileSync('pdfs.js', 'utf8') + ';this.catalog=UNECTestBank.catalog(data,BASE)', Object.assign(context, { UNECTestBank: B }));
  vm.runInContext('this.sourceData=data', context);
  for (const course of Object.values(context.sourceData)) for (const [name, subject] of Object.entries(course.subjects)) {
    if (subject.type === 'test') for (const pdf of subject.pdfs) assert.ok(context.catalog[name].some(p => p.file === pdf.file), name + ': ' + pdf.file);
  }
  assert.ok(Object.keys(context.catalog).length > 0);
});
function selectionFixture() {
  const c = vm.createContext({ console: { warn() {} }, setTimeout, clearTimeout, UNECTestBank: B, renderTestSubjects() {}, calls: {}, sample: marked,
    data: { Year: { subjects: { ICT: { type: 'test', pdfs: [{ file: 'Q26.pdf', addedAt: '2026-01-01' }, { file: 'Q25.pdf', addedAt: '2026-02-01' }] }, Other: { type: 'test', pdfs: [{ file: 'Q25.pdf', addedAt: '2026-02-01' }] } } } }, BASE: 'https://example.invalid/' });
  c.window = c;
  vm.runInContext(fs.readFileSync('scripts/pdf-loader.js', 'utf8'), c);
  vm.runInContext(`extractPdfText=async url=>{calls[url]=(calls[url]||0)+1;return sample};UNECTests.init()`, c);
  return c;
}
test('defaults to the latest upload, loads only that PDF and reuses each PDF cache when switching', async () => {
  const c = selectionFixture();
  const latest = 'https://example.invalid/pdf/Q25.pdf', older = 'https://example.invalid/pdf/Q26.pdf';
  let result = await c.UNECTests.load('ICT');
  assert.equal(result.files.length, 1); assert.equal(result.files[0].source.url, latest);
  assert.equal(c.calls[latest], 1); assert.equal(c.calls[older], undefined);
  result = await c.UNECTests.load('ICT', { sourceUrl: older });
  assert.equal(result.files.length, 1); assert.ok(result.questions.every(q => q.sources.every(s => s.url === older)));
  result = await c.UNECTests.load('ICT');
  assert.ok(result.questions.every(q => q.sources.every(s => s.url === latest)));
  await Promise.all([c.UNECTests.load('Other'), c.UNECTests.load('Other')]);
  assert.equal(c.calls[latest], 1); assert.equal(c.calls[older], 1);
  await c.UNECTests.load('ICT', { refresh: true });
  assert.equal(c.calls[latest], 2); assert.equal(c.calls[older], 1);
});
test('a failed or empty newest PDF never silently falls back to an older PDF', async () => {
  const c = selectionFixture();
  vm.runInContext(`extractPdfText=async url=>{calls[url]=(calls[url]||0)+1;if(!globalThis.recovered)throw new Error('offline');return globalThis.empty?'':sample}`, c);
  let result = await c.UNECTests.load('ICT');
  assert.equal(result.failed, 1); assert.equal(result.questions.length, 0);
  assert.equal(c.calls['https://example.invalid/pdf/Q26.pdf'], undefined);
  c.recovered = true;
  result = await c.UNECTests.load('ICT');
  assert.equal(result.failed, 0); assert.equal(result.questions.length, 2);
  c.empty = true;
  result = await c.UNECTests.load('ICT', { refresh: true });
  assert.equal(result.failed, 0); assert.equal(result.questions.length, 0);
  assert.equal(c.calls['https://example.invalid/pdf/Q26.pdf'], undefined);
  await assert.rejects(c.UNECTests.load('ICT', { sourceUrl: 'https://unlisted.invalid/other.pdf' }), /invalid_test_source/);
});
test('a slow response from an older selection cannot overwrite the newly selected PDF pool', async () => {
  const c = selectionFixture();
  vm.runInContext(`globalThis.oldStarted=new Promise(r=>globalThis.markStarted=r);extractPdfText=async url=>{if(url.endsWith('Q26.pdf')){markStarted();await new Promise(r=>globalThis.releaseOld=r)}return sample}`, c);
  const old = c.UNECTests.load('ICT', { sourceUrl: 'https://example.invalid/pdf/Q26.pdf' });
  await c.oldStarted;
  await c.UNECTests.load('ICT');
  c.releaseOld(); await old;
  assert.ok(c.QUESTION_BANK.ICT.every(q => q.sources.every(s => s.file === 'Q25.pdf')));
  assert.equal(c.UNECTests.status('ICT').result.files[0].source.file, 'Q25.pdf');
});

test('missing image formulas and punctuation-only stems never become scored questions', () => {
  for (const stem of [' ,..', 'Hesablayın: ' + B.IMAGE]) assert.equal(B.parse('1. ' + stem + '\n√ 0.4\n• 0.5').questions.length, 0);
  assert.equal(B.parse('1. Cavabı tapın?\n√ ' + B.IMAGE + '\n• 0.5').questions.length, 0);
});

test('rapid subject changes never exceed two PDF extractions across the whole application', async () => {
  const data = { Year: { subjects: Object.fromEntries(['A','B','C'].map(name => [name, { type: 'test', pdfs: [{ file: name+'1.pdf' },{ file: name+'2.pdf' }] }])) } };
  const c = vm.createContext({ console, setTimeout, clearTimeout, UNECTestBank: B, renderTestSubjects() {}, data, BASE: 'https://example.invalid/', sample: marked }); c.window = c;
  vm.runInContext(fs.readFileSync('scripts/pdf-loader.js', 'utf8'), c);
  vm.runInContext(`globalThis.active=0;globalThis.peak=0;extractPdfText=async()=>{active++;peak=Math.max(peak,active);await new Promise(r=>setTimeout(r,5));active--;return sample};UNECTests.init()`, c);
  const results = await Promise.all(['A','B','C'].map(name => c.UNECTests.load(name)));
  assert.equal(c.peak, 2); assert.ok(results.every(r => r.questions.length === 2));
});
test('PDF extraction excludes a question with an embedded formula image while keeping the adjacent text question', async () => {
  const c = vm.createContext({ console, setTimeout, clearTimeout, UNECTestBank: B }); c.window = c;
  vm.runInContext(fs.readFileSync('scripts/pdf-loader.js','utf8'), c);
  const item = (str,y) => ({str,transform:[1,0,0,10,40,y],width:str.length*4,height:10});
  let cleanups=0;
  c.pdfjsLib={ OPS:{save:1,transform:2,paintImageXObject:3,restore:4} };
  c.pdf={numPages:1,getPage:async()=>({getViewport:()=>({width:600}),cleanup:()=>{cleanups++},getTextContent:async()=>({items:[item('1. Read this formula?',750),item('√ 1',690),item('• 2',670),item('2. Visible question?',640),item('√ Yes',620),item('• No',600)]}),getOperatorList:async()=>({fnArray:[1,2,3,4],argsArray:[null,[30,0,0,20,100,710],['image'],null]})})};
  const text=await vm.runInContext('_pdfToText(pdf,true)',c);
  const result=B.parse(text);
  assert.equal(result.questions.length,1);assert.equal(result.questions[0].question,'Visible question?');assert.equal(cleanups,1);
});
