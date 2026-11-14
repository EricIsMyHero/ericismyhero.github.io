import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
function fixture(){
 const code=fs.readFileSync('scripts/firebase.js','utf8');const fn=code.slice(code.indexOf('async function saveQuizResult('),code.indexOf('async function saveGpaUpdate('));
 const rows=new Map();let adds=0;
 const c=vm.createContext({currentUser:{uid:'alice'},currentProfile:null,crypto:{randomUUID:()=> 'random-id'},_db:{collection:()=>({doc:uid=>({collection:()=>({doc:id=>({get:async()=>({exists:rows.has(uid+'/'+id)}),set:async data=>rows.set(uid+'/'+id,data)}),get:async()=>({data:()=>({})})})})})},firebase:{firestore:{FieldValue:{serverTimestamp:()=> 'server-time'}}},_addXP:async()=>adds++,_incrementSolvedTests:async()=>{},_updateStreak:async()=>{},_logEvent(){},_getUserProfile:async()=>({}),renderDashboard(){}});
 vm.runInContext(fn,c);return {c,rows,get adds(){return adds;}};
}
test('MCQ results save to the starting account with an idempotent result ID',async()=>{
 const f=fixture();await f.c.saveQuizResult('ICT',8,10,2,{uid:'alice',id:'same-result-id',personal:true,source:'private:2026-11-14'});
 await f.c.saveQuizResult('ICT',8,10,2,{uid:'alice',id:'same-result-id'});
 assert.equal(f.rows.size,1);assert.equal(f.adds,1);const row=f.rows.get('alice/same-result-id');assert.equal(row.personal,true);assert.equal(row.format,'mcq');assert.equal(row.percent,80);
});
test('sign-out or switching accounts never writes a finished MCQ to the replacement account',async()=>{
 const f=fixture();f.c.currentUser={uid:'bob'};await assert.rejects(f.c.saveQuizResult('ICT',8,10,2,{uid:'alice',id:'saved'}),/login_required/);
 f.c.currentUser=null;await assert.rejects(f.c.saveQuizResult('ICT',8,10,2,{uid:'alice',id:'saved'}),/login_required/);assert.equal(f.rows.size,0);
});
