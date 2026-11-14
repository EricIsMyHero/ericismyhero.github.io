const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), vm = require('node:vm');
const B = require('../scripts/test-bank.js');
const fixture = JSON.parse(fs.readFileSync('tests/fixtures/pdf-radio-vectors.json'));
function context() {
  const c = { pdfjsLib: { OPS: fixture.OPS }, UNECTestBank: B, console, setTimeout, clearTimeout };
  c.window = c; vm.createContext(c);
  vm.runInContext(fs.readFileSync('scripts/pdf-loader.js','utf8'), c);
  return c;
}
test('real exported radio controls preserve which option is selected', () => {
  const c = context(), markers = c._pdfRadioMarkers(fixture.list);
  assert.deepEqual(Array.from(markers, row=>row.str), ['•','•','•','•','√','•']);
});
test('plain dots and unselected radio controls never invent a correct answer', () => {
  const c = context();
  const unselected = structuredClone(fixture.list);
  for(let i=0;i<unselected.fnArray.length;i++) if(unselected.fnArray[i]===fixture.OPS.setFillRGBColor && unselected.argsArray[i].every(x=>x===0)) unselected.argsArray[i]=[255,255,255];
  assert(c._pdfRadioMarkers(unselected).every(row=>row.str==='•'));
  const noBorder = structuredClone(fixture.list);
  for(let i=0;i<noBorder.fnArray.length;i++) if(noBorder.fnArray[i]===fixture.OPS.setFillRGBColor && noBorder.argsArray[i].every(x=>x===128)) noBorder.argsArray[i]=[17,17,17];
  assert.equal(c._pdfRadioMarkers(noBorder).length, 0);
});
test('radio question numbering and numeric options survive extraction while fractional page footers do not', async () => {
  const c = context(), markers = c._pdfRadioMarkers(fixture.list);
  const text = (str,x,y) => ({str,width:str.length*4,height:10,transform:[1,0,0,10,x,y]});
  const items = [text('1 Which option is correct?',28,markers[0].transform[5]+20),
    ...markers.map((m,i)=>text(i===5?'1/24':'Choice '+i,42,m.transform[5])), text('1/24',290,20)];
  const page = { getViewport:()=>({width:595}), cleanup(){}, getTextContent:async()=>({items}), getOperatorList:async()=>fixture.list };
  const result = B.parse(await c._pdfToText({numPages:1,getPage:async()=>page},true));
  assert.equal(result.questions.length,1);
  assert.equal(result.questions[0].answer,4);
  assert.equal(result.questions[0].question,'Which option is correct?');
  assert.equal(result.questions[0].options.at(-1),'1/24');
});
