const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), vm = require('node:vm');
const B = require('../scripts/test-bank.js');
const batch = JSON.parse(fs.readFileSync('data/material-import-20261114.json'));
function catalogue() {
  const c = vm.createContext({});
  vm.runInContext(fs.readFileSync('pdfs.js','utf8')+';this.source={data,BASE}',c);
  const subjects=Object.values(c.source.data).flatMap(course=>Object.entries(course.subjects));
  return { c, subjects, tests:B.catalog(c.source.data,c.source.BASE) };
}
test('all 23 verified archive PDFs retain their filenames and subject codes in the catalogue', () => {
  const {subjects,tests}=catalogue();
  assert.equal(batch.materials.length,23);
  for(const row of batch.materials){
    const [name,s]=subjects.find(([name])=>name===row.subject)||[];
    assert(s,row.file);const entries=s.pdfs.filter(p=>p.file===row.file);assert.equal(entries.length,1,row.file);
    const pdf=entries[0];assert.equal(pdf.code||s.code,row.code,row.file);assert.equal(pdf.type||s.type,'test',row.file);
    assert.equal(pdf.pdfType,row.pdfType,row.file);assert.equal(pdf.addedAt,batch.addedAt,row.file);
    assert(tests[name].some(source=>source.file===row.file&&source.url.endsWith(encodeURIComponent(row.file))),row.file);
  }
  const math=subjects.find(([name])=>name==='Tətbiqi riyaziyyat')[1];
  assert.equal(math.code,'00892');assert.equal(math.pdfs.find(p=>p.file==='tetbiqiriyaziyyatkollek25-26.pdf').code,'00891');
});
test('closed and written server source lists respect the per-PDF format in mixed subjects', async () => {
  const {CLOSED_SOURCES}=await import('../ai-vercel/lib/closed-sources.js');
  const {WRITTEN_SOURCES}=await import('../ai-vercel/lib/written-sources.js');
  for(const row of batch.materials){
    assert(CLOSED_SOURCES.includes(batch.base+encodeURIComponent(row.file)),row.file);
    assert(!WRITTEN_SOURCES.some(source=>source.file===row.file),row.file);
  }
  assert(WRITTEN_SOURCES.some(source=>source.file==='beynelxalqiqt1.pdf'));
  assert(WRITTEN_SOURCES.some(source=>source.file==='statistika1.pdf'));
});
