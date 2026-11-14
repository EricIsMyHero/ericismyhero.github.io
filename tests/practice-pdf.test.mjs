import test from 'node:test';import assert from 'node:assert/strict';
import {practicePdfAction,privatePdfPath,PDF_MAX}from '../ai-vercel/lib/practice-pdf.js';
import {writtenAction}from '../ai-vercel/lib/written-exams.js';
import {usagePath}from '../ai-vercel/lib/ai.js';
function fixture(){
 let version=0,now=Date.parse('2026-11-14T12:00:00Z'),parses=0;const docs=new Map();
 const db={get:async p=>structuredClone(docs.get(p)),create:async(c,id,data)=>{const p=c+'/'+id;if(docs.has(p))throw Object.assign(new Error(),{code:'exists'});docs.set(p,{data:structuredClone(data),updateTime:String(++version)});},patch:async(p,data,o)=>{const doc=docs.get(p);if(o.ifUpdateTime!==doc?.updateTime)throw Object.assign(new Error(),{code:'conflict'});docs.set(p,{data:{...doc.data,...structuredClone(data)},updateTime:String(++version)});}};
 const questions=Array.from({length:6},(_,i)=>({id:'question'+i,number:i+1,page:i+1,title:'Explain this topic '+i,reference:('The reference describes the main facts about this topic in detail. ').repeat(8)}));
 const services={db,now:()=>now,parse:async()=>{parses++;return {questions,text:'1. Choose the correct option\nA) Wrong answer\nB) Correct answer ✓'};},grade:async q=>({score:9,feedback:'Accurate.',quote:q.reference.slice(0,60)})};
 const env={GROQ_API_KEY:'fixture'},body={file:'my-notes.pdf',requestId:'upload-request-00001',pdf:Buffer.from('%PDF-1.4 fixture bytes only').toString('base64')};
 const call=(action,b={},uid='alice')=>practicePdfAction({action:'practice-pdf-'+action,...b},uid,env,services);
 const written=(action,b={},uid='alice')=>writtenAction({action:'written-'+action,...b},uid,env,services);
 return {docs,db,services,env,body,call,written,questions,advance:n=>now+=n,setTime:t=>now=Date.parse(t),get parses(){return parses;}};
}
test('private imports require login, validate original PDF bytes and cannot accept a forged answer pool',async()=>{
 const f=fixture();assert.equal((await f.call('upload',f.body,'')).status,401);assert.equal((await f.call('upload',{...f.body,pdf:Buffer.from('not a PDF file').toString('base64'),questions:f.questions})).status,400);
 assert.equal((await f.call('upload',{...f.body,file:'../notes.pdf'})).status,400);
 assert.equal((await f.call('upload',{...f.body,pdf:'A'.repeat(Math.ceil(PDF_MAX/3)*4+4)})).status,413);assert.equal(f.parses,0);
});
test('one successful PDF per account per Baku day; retries do not consume a second slot',async()=>{
 const f=fixture(),r=await f.call('upload',f.body);assert.equal(r.status,200);assert.equal(r.json.source.mcq,1);assert.equal(r.json.source.written,6);
 assert(!JSON.stringify(r.json).includes('The reference'));assert.equal((await f.call('upload',f.body)).status,200);assert.equal(f.parses,1);
 const second=await f.call('upload',{...f.body,requestId:'second-upload-00001'});assert.equal(second.status,429);assert.equal(f.parses,1);
 const status=await f.call('status');assert.equal(status.json.usage.remaining,0);
 assert.equal((await f.call('upload',f.body,'bob')).status,200);
 f.setTime('2026-11-14T20:00:00Z');assert.equal((await f.call('status')).json.usage.remaining,1);assert.equal((await f.call('upload',{...f.body,requestId:'tomorrow-upload-001'})).status,200);
});
test('concurrent uploads cannot spend the daily slot twice or overwrite the winning source',async()=>{
 const f=fixture();const r=await Promise.all(Array.from({length:10},(_,i)=>f.call('upload',{...f.body,requestId:'concurrent-upload-'+i})));
 assert.equal(r.filter(r=>r.status===200).length,1);assert.equal(f.parses,1);assert.equal((await f.call('status')).json.usage.used,1);
});
test('a PDF with no usable questions does not consume the daily upload',async()=>{
 const f=fixture();f.services.parse=async()=>({questions:[],text:'a lecture with no questions'});
 assert.equal((await f.call('upload',f.body)).status,422);assert.equal((await f.call('status')).json.usage.used,0);
 f.services.parse=async()=>({questions:f.questions,text:''});assert.equal((await f.call('upload',f.body)).status,200);
});
test('private source access is owner-bound and resumes yesterday’s exam after midnight',async()=>{
 const f=fixture();const upload=await f.call('upload',f.body),id=upload.json.source.id;
 assert.equal((await f.call('get',{sourceId:id},'bob')).status,404);assert.equal((await f.call('get',{sourceId:id})).json.questions.length,1);
 const start=await f.written('start',{mode:'semester',sourceId:id,requestId:'private-exam-00001'});assert.equal(start.status,200);assert.equal(start.json.exam.questions.length,5);assert.equal(start.json.exam.source.private,true);assert(!JSON.stringify(start.json).includes('The reference'));
 f.setTime('2026-11-14T20:01:00Z');assert.equal((await f.call('get',{sourceId:id})).status,200);
 f.setTime('2026-11-15T20:01:00Z');assert.equal((await f.call('get',{sourceId:id})).status,410);
});
test('written imports are graded from the stored server reference and saved idempotently to Dashboard',async()=>{
 const f=fixture();const source=(await f.call('upload',f.body)).json.source;
 let exam=(await f.written('start',{mode:'midterm',sourceId:source.id,requestId:'graded-private-exam01'})).json.exam;
 const pointer={examId:exam.id,day:exam.day};await f.written('finish',{...pointer,index:0,rev:1,answer:'My response',reference:'forged text',score:30});
 let result;for(let i=0;i<3;i++)result=await f.written('grade',pointer);
 assert.equal(result.json.exam.total,9);assert.equal(result.json.dashboardSaved,true);
 const path='users/alice/quiz_results/written-'+exam.id,summary=f.docs.get(path).data;
 assert.equal(summary.score,9);assert.equal(summary.total,30);assert.equal(summary.personal,true);assert.equal(summary.format,'written');assert(summary.timestamp instanceof Date);
 await f.written('grade',pointer);assert.equal([...f.docs.keys()].filter(p=>p.startsWith('users/alice/quiz_results/')).length,1);
 // Raw PDF bytes are not persisted in any document.
 assert(!JSON.stringify([...f.docs.values()]).includes(f.body.pdf));
});
test('a failed Dashboard write is retryable without another exam or another AI grade',async()=>{
 const f=fixture();const id=(await f.call('upload',f.body)).json.source.id;let exam=(await f.written('start',{mode:'midterm',sourceId:id,requestId:'dashboard-retry-exam'})).json.exam;const p={examId:exam.id,day:exam.day};await f.written('finish',{...p,index:0,rev:1,answer:''});
 const create=f.db.create;let fail=true;f.db.create=async(c,id,data)=>{if(c.startsWith('users/')&&fail)throw new Error('network');return create(c,id,data);};
 for(let i=0;i<2;i++)assert.equal((await f.written('grade',p)).status,200);
 const failed=await f.written('grade',p);assert.equal(failed.status,503);assert.equal(failed.json.exam.status,'graded');fail=false;
 const retry=await f.written('grade',p);assert.equal(retry.status,200);assert.equal(retry.json.dashboardSaved,true);assert.equal(retry.json.usage.used,1);
});
test('two alternating private storage slots bound retained extracted data',async()=>{
 const f=fixture();for(let day=14;day<20;day++){f.setTime(`2026-11-${day}T12:00:00Z`);assert.equal((await f.call('upload',{...f.body,requestId:'daily-upload-'+String(day).padStart(5,'0')})).status,200);}
 assert.equal([...f.docs.keys()].filter(p=>p.includes('/practice_sources/')).length,2);
 assert.notEqual(privatePdfPath('alice','2026-11-14'),privatePdfPath('bob','2026-11-14'));assert(f.docs.has(usagePath('alice')));
});
test('actual private PDF bytes are parsed server-side into marked MCQ questions',async()=>{
 const f=fixture();delete f.services.parse;
 const rows=['1. Choose the correct option','A) Incorrect choice','B) Correct choice','Cavab: B'];
 const content=rows.map((line,i)=>`BT /F1 12 Tf 50 ${740-i*22} Td (${line.replace(/[()\\]/g,'\\$&')}) Tj ET\n`).join('');
 const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',`<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}endstream`];
 let pdf='%PDF-1.4\n';const offsets=[];for(const[i,o]of objects.entries()){offsets.push(Buffer.byteLength(pdf));pdf+=`${i+1} 0 obj\n${o}\nendobj\n`;}
 const xref=Buffer.byteLength(pdf);pdf+=`xref\n0 6\n0000000000 65535 f \n${offsets.map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
 const upload=await f.call('upload',{...f.body,pdf:Buffer.from(pdf).toString('base64')});assert.equal(upload.status,200);assert.equal(upload.json.source.mcq,1);
 const loaded=await f.call('get',{sourceId:upload.json.source.id});assert.equal(loaded.json.questions[0].answer,1);assert.equal(loaded.json.questions[0].question,'Choose the correct option');
});
test('account export includes only the authenticated owner’s private imported sources',async()=>{
 const {accountAction}=await import('../ai-vercel/lib/account.js');const f=fixture();await f.call('upload',f.body);let requested='';
 const db={getDoc:async p=>f.db.get(p),listCollections:async()=>[],listDocs:async p=>{requested=p;return {docs:[...f.docs].filter(([key])=>key.startsWith(p+'/')).map(([path,d])=>({path,data:d.data}))};}};
 const r=await accountAction('account-export',{idToken:'fixture'},{},{verify:async()=>({uid:'alice'}),db});assert.equal(r.status,200);assert.equal(requested,usagePath('alice')+'/practice_sources');assert.equal(r.json.privatePdfSources.length,1);assert.equal(r.json.privatePdfSources[0].file,'my-notes.pdf');
});
