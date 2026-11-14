const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function load(){const c=vm.createContext({window:{addEventListener(){}},document:{addEventListener(){}},BASE:'/',EXTRAS_BASE:'/extra/',PDF_TYPES:{},getSubjectCode:s=>s.code||'',getFavorites:()=>[]});c.window.UNEC={$:()=>null,$$:()=>[],esc:String,ic:()=>'',enc:encodeURIComponent,tr:s=>s,normAz:String};for(const f of ['pdfs.js','data/material-identities.js','scripts/app-materials.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);vm.runInContext('this.catalog=data;this.extras=extrasData;this.identities=MATERIAL_IDENTITIES',c);return c;}
test('editable catalogue has no course containers; subjects, PDF entries and extras use Azerbaijani A–Z order',()=>{const c=load();assert.deepEqual(Object.keys(c.catalog),['Materiallar']);assert.deepEqual(Object.keys(c.extras),['Materiallar']);const keys=Object.keys(c.catalog.Materiallar.subjects);assert.deepEqual(keys,[...keys].sort((a,b)=>a.localeCompare(b,'az')));for(const s of Object.values(c.catalog.Materiallar.subjects)){assert(!('semester'in s));const pdfs=Array.from(s.pdfs,p=>({name:p.name,file:p.file}));assert.deepEqual(pdfs,[...pdfs].sort((a,b)=>a.name.localeCompare(b.name,'az')||a.file.localeCompare(b.file,'az')));}const extras=Array.from(c.extras.Materiallar,p=>({name:p.name,file:p.file}));assert.deepEqual(extras,[...extras].sort((a,b)=>a.name.localeCompare(b.name,'az')||a.file.localeCompare(b.file,'az')));});
test('all 136 assets retain every old detail-link identity after flattening',()=>{const c=load(),U=c.window.UNEC;assert.equal(U.getIndex().length,136);for(const[key,rows]of Object.entries(c.identities))for(const old of rows){const m=U.resolveEntry({course:old.course,subject:old.subject,file:key.split('/').pop(),extra:key.startsWith('pdf-extra/')});assert(m,key);assert.equal(m.course,old.course,key);if(old.subject)assert.equal(m.subject,old.subject,key);}for(const m of U.getIndex()){const old=c.identities[m.favKey]?.[0];if(old)assert.equal(m.course,old.course);}});

test('subject discussions keep their original course identity independently of A–Z file order',()=>{const c=load();for(const[name,s]of Object.entries(c.window.UNEC.getSubjectCatalog())){const old=Object.values(c.identities).flat().find(row=>row.subject===name);if(old)assert.equal(s.legacyCourse,old.course,name);}});
test('semester placement follows the selected major and prioritizes names over reused language codes',()=>{
 const c=load();c.CURRICULUM_DATA={finance:{semester1:[{name:'Shared',code:'100'},{name:'Xarici dildə işgüzar və akademik kommunikasiya-1',code:'200'}],semester2:[{name:'Xarici dildə işgüzar və akademik kommunikasiya-2',code:'200'}]},economics:{semester3:[{name:'Shared',code:'100'}]}};
 vm.runInContext(fs.readFileSync('scripts/ui.js','utf8'),c);
 assert.deepEqual(Array.from(c.materialSubjectSemesters('Shared',{code:'100'},'finance')),[1]);
 assert.deepEqual(Array.from(c.materialSubjectSemesters('Shared',{code:'100'},'economics')),[3]);
 assert.deepEqual(Array.from(c.materialSubjectSemesters('Xarici dildə işgüzar və akademik kommunikasiya A1',{code:'200'},'finance')),[1]);
 assert.deepEqual(Array.from(c.materialSubjectSemesters('Xarici dildə işgüzar və akademik kommunikasiya A2',{code:'200'},'finance')),[2]);
 assert.deepEqual(Array.from(c.materialSubjectSemesters('Unknown',{code:'999'},'finance')),[]);
});
test('semester placement includes elective subject codes and subjects spanning two semesters',()=>{
 const c=load();c.CURRICULUM_DATA={finance:{semester1:[{name:'Repeated',code:'100'}],semester2:[{name:'Repeated',code:'100'}]}};c.CURRICULUM_CODES={finance:{majorElectives:[{semester:4,subjects:[{name:'Elective',code:'300'}]}]}};
 vm.runInContext(fs.readFileSync('scripts/ui.js','utf8'),c);
 assert.deepEqual(Array.from(c.materialSubjectSemesters('Repeated',{code:'100'},'finance')),[1,2]);
 assert.deepEqual(Array.from(c.materialSubjectSemesters('Elective',{code:'300'},'finance')),[4]);
});
