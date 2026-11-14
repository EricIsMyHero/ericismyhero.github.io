const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), vm = require('node:vm');
const B = require('../scripts/test-bank.js');
const review = JSON.parse(fs.readFileSync('data/material-metadata-review.json'));
function load() {
  const c = { window: { addEventListener() {} }, document: { addEventListener() {} }, getFavorites:()=>[] };
  c.window.UNEC = { $:()=>null,$$:()=>[],esc:String,ic:()=>'',enc:encodeURIComponent,tr:s=>s,normAz:String };
  vm.createContext(c);
  for (const file of ['pdfs.js','data/material-identities.js','data/curriculum-pdf.js','scripts/curriculum-source.js','scripts/curriculum.js','scripts/ui.js','scripts/app-materials.js']) vm.runInContext(fs.readFileSync(file,'utf8'),c);
  vm.runInContext('this.catalog=data.Materiallar.subjects;this.identities=MATERIAL_IDENTITIES;this.plans=CURRICULUM_CODES;this.tests=UNECTestBank.catalog(data,BASE)',Object.assign(c,{UNECTestBank:B}));
  return c;
}
test('completed subject codes have a unique curriculum match or an explicit original PDF header', () => {
  const c=load();
  assert.equal(review.assignments.filter(row=>!row.previousCode).length,13);
  for(const row of review.assignments){
    assert.equal(c.catalog[row.subject].code,row.code,row.subject);
    if(row.evidence==='pdf-header') {
      assert(row.pdfHeaders.some(pdf=>pdf.header.includes(row.code)),row.subject);
      continue;
    }
    const matches=[];
    for(const plan of Object.values(c.plans)) for(const group of ['general','major','practice','generalElectives','majorElectives']) for(const item of plan[group]||[]) for(const option of item.subjects||[item]) if(c.canonSubjectName(option.name)===c.canonSubjectName(row.subject)) matches.push(option.code);
    assert.deepEqual([...new Set(matches)],[row.code],row.subject);
  }
});
test('corrected metadata reaches cards and aliases without changing legacy rating identities', () => {
  const c=load(),U=c.window.UNEC;
  const m=U.getIndex().find(m=>m.file==='idareetme1.pdf');
  assert.equal(m.code,'00382');
  assert(m.aliases.every(a=>a.code==='00382'));
  for(const row of review.assignments) for(const file of row.files) for(const old of c.identities['pdf/'+file]||[]){
    const resolved=U.resolveEntry({course:old.course,subject:old.subject,file});
    assert.equal(resolved.course,old.course);assert.equal(resolved.subject,old.subject);
    assert.equal(resolved.code,row.code,file);
  }
});
test('closed-answer PDFs are classified consistently by the library and practice sources', async () => {
  const c=load(),U=c.window.UNEC;
  const {CLOSED_SOURCES}=await import('../ai-vercel/lib/closed-sources.js');
  const {WRITTEN_SOURCES}=await import('../ai-vercel/lib/written-sources.js');
  for(const row of review.formatCorrections){
    assert.equal(U.getIndex().find(m=>m.file===row.file).format,'test');
    const source=c.tests[row.subject].find(p=>p.file===row.file);assert(source,row.file);
    assert(CLOSED_SOURCES.includes(source.url));assert(!WRITTEN_SOURCES.some(p=>p.file===row.file));
  }
});
test('ambiguous or different-course codes are not silently assigned by similar titles', () => {
  const c=load();
  assert.equal(c.catalog['Maliyyə risklərinin idarə edilməsi'].code,undefined);
  assert.deepEqual(Array.from(c.catalog['Maliyyə risklərinin idarə edilməsi'].codes),['00528','00966']);
  assert.equal(c.catalog['Mühəndis qrafikası'].code,undefined);
  assert.equal(c.catalog['Tətbiqi riyaziyyat'].code,'00892');
  assert.equal(c.catalog['Tətbiqi riyaziyyat'].pdfs.find(p=>p.file==='tetbiqiriyaziyyatkollek25-26.pdf').code,'00891');
  for(const row of review.unplacedSubjects) if(row.code) for(const plan of Object.values(c.plans)) for(const group of ['general','major','practice','generalElectives','majorElectives']) for(const item of plan[group]||[]) for(const option of item.subjects||[item]) assert.notEqual(option.code,row.code,row.subject);
});
test('multiple verified curriculum codes remain searchable without inventing a single PDF code', () => {
  const c=load(),U=c.window.UNEC,m=U.getIndex().find(m=>m.file==='mrie1.pdf');
  assert.equal(m.code,'');assert.deepEqual(Array.from(m.codes),['00528','00966']);
  assert(m.search.includes('00528')&&m.search.includes('00966'));
  assert(c.subjectMatchesMajor('Maliyyə risklərinin idarə edilməsi',c.catalog['Maliyyə risklərinin idarə edilməsi'],'finance',2));
  assert(c.subjectMatchesMajor('Maliyyə risklərinin idarə edilməsi',c.catalog['Maliyyə risklərinin idarə edilməsi'],'tourism',3));
  assert.deepEqual(Array.from(c.materialSubjectSemesters('Maliyyə risklərinin idarə edilməsi',c.catalog['Maliyyə risklərinin idarə edilməsi'],'finance')),[4]);
  assert.deepEqual(Array.from(c.materialSubjectSemesters('Maliyyə risklərinin idarə edilməsi',c.catalog['Maliyyə risklərinin idarə edilməsi'],'tourism')),[5]);
});
