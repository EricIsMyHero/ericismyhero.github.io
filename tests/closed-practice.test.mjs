import test from 'node:test';import assert from 'node:assert/strict';
import {closedAction,CLOSED_LIMIT}from '../ai-vercel/lib/closed-practice.js';
import {privatePdfPath}from '../ai-vercel/lib/practice-pdf.js';
import {usagePath}from '../ai-vercel/lib/ai.js';
import ask from '../ai-vercel/api/ask.js';
function fixture(){
 let version=0,time=Date.parse('2026-11-14T10:00:00Z');const docs=new Map();
 const db={get:async p=>structuredClone(docs.get(p)),create:async(c,id,data)=>{const p=c+'/'+id;if(docs.has(p))throw Object.assign(new Error(),{code:'exists'});docs.set(p,{data:structuredClone(data),updateTime:String(++version)});},patch:async(p,data,o)=>{const old=docs.get(p);if(old?.updateTime!==o.ifUpdateTime)throw Object.assign(new Error(),{code:'conflict'});docs.set(p,{data:{...old.data,...structuredClone(data)},updateTime:String(++version)});}};
 const source='https://example.test/pdf/ict.pdf',services={db,now:()=>time,sources:[source]};
 const call=(action,b={},uid='alice')=>closedAction({action:'closed-'+action,...b},uid,{},services);
 const start=(i,uid='alice',extra={})=>call('start',{sourceId:source,count:10,requestId:'closed-exam-'+String(i).padStart(8,'0'),...extra},uid);
 return {docs,db,services,source,call,start,setTime:t=>time=Date.parse(t)};
}
test('five started closed exams per UID; retries, exit flags and reloads cannot bypass the quota',async()=>{
 const f=fixture();for(let i=0;i<5;i++){const r=await f.start(i);assert.equal(r.status,200);assert.equal(r.json.usage.used,i+1);}
 assert.equal((await f.start(6)).status,429);assert.equal((await f.start(6,'alice',{cancel:true,limit:100,used:0})).status,429);
 const retry=await f.start(0);assert.equal(retry.status,200);assert.equal(retry.json.usage.used,CLOSED_LIMIT);
 assert.equal((await f.call('status')).json.usage.remaining,0);assert.equal((await f.start(0,'bob')).json.usage.remaining,4);
});
test('concurrent starts cannot spend the last slot twice',async()=>{
 const f=fixture();for(let i=0;i<4;i++)await f.start(i);
 const replies=await Promise.all(Array.from({length:12},(_,i)=>f.start(10+i)));
 assert.equal(replies.filter(r=>r.status===200).length,1);assert.equal(replies.filter(r=>r.status===429).length,11);
});
test('the allowance resets at Baku midnight using only server time',async()=>{
 const f=fixture();f.setTime('2026-11-14T19:59:59Z');for(let i=0;i<5;i++)await f.start(i);
 assert.equal((await f.start(6,'alice',{day:'2026-11-15',serverNow:9999999999999})).status,429);
 f.setTime('2026-11-14T20:00:00Z');assert.equal((await f.call('status')).json.usage.remaining,5);
 const r=await f.start(6);assert.equal(r.json.usage.day,'2026-11-15');assert.equal(r.json.usage.used,1);
});
test('unknown sources, invalid counts and reused IDs with changed settings do not consume new starts',async()=>{
 const f=fixture();assert.equal((await f.start(0,'alice',{sourceId:'https://attacker.test/pdf.pdf'})).status,400);
 for(const count of [0,51,-1,'10',1.5,null])assert.equal((await f.start(0,'alice',{count})).status,400);
 assert.equal((await f.call('status')).json.usage.used,0);
 await f.start(0);assert.equal((await f.start(0,'alice',{count:20})).status,409);assert.equal((await f.call('status')).json.usage.used,1);
});
test('private PDF starts share the same limit and cannot use another owner’s import',async()=>{
 const f=fixture(),day='2026-11-14';await f.db.create(usagePath('alice')+'/practice_sources',privatePdfPath('alice',day).split('/').pop(),{day,mcq:Array(6).fill({})});
 const sourceId='private:'+day;
 assert.equal((await f.start(0,'bob',{sourceId,count:5})).status,404);assert.equal((await f.start(0,'alice',{sourceId,count:7})).status,400);
 const first=await f.start(0,'alice',{sourceId,count:5});assert.equal(first.status,200);assert.equal(first.json.usage.used,1);
 for(let i=1;i<5;i++)await f.start(i);assert.equal((await f.start(6,'alice',{sourceId,count:5})).status,429);
});
test('lost responses can be retried without spending a second slot; other quota fields remain intact',async()=>{
 const f=fixture();await f.db.create('ai_usage',usagePath('alice').split('/')[1],{written:{days:{}},practiceUpload:{day:'2026-11-14',status:'ready'},count:3});
 const patch=f.db.patch;let fail=true;f.db.patch=async(...args)=>{await patch(...args);if(fail){fail=false;throw new Error('response lost');}};
 assert.equal((await f.start(0)).status,503);const retry=await f.start(0);assert.equal(retry.status,200);assert.equal(retry.json.usage.used,1);
 const row=f.docs.get(usagePath('alice')).data;assert.equal(row.count,3);assert.equal(row.practiceUpload.status,'ready');assert.deepEqual(row.written,{days:{}});
});
test('closed start/status require authentication at both action and HTTP boundaries',async()=>{
 const f=fixture();assert.equal((await f.call('status',{},'')).status,401);
 const res={setHeader(){},status(n){this.code=n;return this;},json(data){this.data=data;return this;},end(){}};
 await ask({method:'POST',headers:{},body:{action:'closed-start',uid:'victim'}},res);assert.equal(res.code,401);
});
