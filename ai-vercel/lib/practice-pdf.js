// Private imports: original bytes and browser-supplied answer pools are never stored.
import crypto from 'node:crypto';
import {getDoc,createDoc,patchDoc} from './firestore.js';
import {usagePath,dayKey} from './ai.js';
import {getPracticePolicy} from './practice-policy.js';
import {parseWrittenPdf} from './written-pdf.js';
import bank from './test-bank.cjs';
export const PDF_MAX=3*1024*1024, PDF_LIMIT=1;
const defaults={get:getDoc,create:createDoc,patch:patchDoc};
const error=(code,status=400,extra={})=>Object.assign(new Error(code),{error:code,status,...extra});
const days=now=>[dayKey(new Date(now)),dayKey(new Date(now-86400000))];
// Three slots per parity retain up to six pools. Slot zero keeps legacy paths/IDs.
export function privatePdfPath(uid,day,slot=0){return usagePath(uid)+'/practice_sources/'+(Math.floor(Date.parse(day+'T00:00:00Z')/86400000)%2)+(slot?'-'+slot:'');}
export async function getPrivatePdf(uid,id,env=process.env,db=defaults,now=Date.now()){
  const match=typeof id==='string'&&/^private:(\d{4}-\d{2}-\d{2})(?::([12]))?$/.exec(id);
  if(!match||!days(now).includes(match[1]))throw error('private_pdf_expired',410);
  const doc=await db.get(privatePdfPath(uid,match[1],Number(match[2])||0),env);
  if(!doc||doc.data.day!==match[1])throw error('private_pdf_not_found',404);
  return doc.data;
}
function view(data){return {id:'private:'+data.day+(data.slot?':'+data.slot:''),private:true,day:data.day,file:data.file,name:data.file,subject:data.file,url:'',addedAt:data.createdAt,
  written:data.written.questions.length,mcq:data.mcq.length};}
export async function privateSource(uid,id,env,db,now){return view(await getPrivatePdf(uid,id,env,db,now));}
export async function privatePool(uid,source,env,db,now){const data=await getPrivatePdf(uid,source.id,env,db,now);return {sha:data.sha,questions:data.written.questions};}
async function update(uid,change,env,db){
  for(let n=0;n<8;n++){
    const previous=await db.get(usagePath(uid),env),next=change(previous?.data.practiceUpload);
    try{if(previous)await db.patch(usagePath(uid),{practiceUpload:next},{ifUpdateTime:previous.updateTime},env);
      else await db.create('ai_usage',usagePath(uid).split('/')[1],{uid,practiceUpload:next},env);return next;
    }catch(e){if(!['exists','conflict'].includes(e.code))throw e;}
  }throw error('pdf_busy',409);
}
async function poolsFor(uid,day,env,db){
  return (await Promise.all([0,1,2].map(async slot=>{
    const doc=await db.get(privatePdfPath(uid,day,slot),env);
    return doc?.data.day===day?{...doc.data,slot}:null;
  }))).filter(Boolean).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))||b.slot-a.slot);
}
const completed=(claim,day)=>claim?.day===day?Math.max(0,Number(claim.used)||(claim.status==='ready'?1:0)):0;
async function snapshot(uid,day,limit,env,db,clock){
  const [doc,pools]=await Promise.all([db.get(usagePath(uid),env),poolsFor(uid,day,env,db)]),claim=doc?.data.practiceUpload;
  let used=Math.max(completed(claim,day),pools.length);
  if(claim?.day===day&&claim.status==='parsing'&&claim.until>clock()&&!pools.some(p=>p.requestId===claim.id))used++;
  const sources=pools.map(view);
  return {usage:{day,limit,used,remaining:Math.max(0,limit-used)},sources,source:sources[0]||null};
}
function limited(rows,max,budget){const chosen=[];let bytes=0;for(const row of rows){const size=Buffer.byteLength(JSON.stringify(row));if(chosen.length>=max||bytes+size>budget)break;chosen.push(row);bytes+=size;}return chosen;}
export async function practicePdfAction(b,uid,env=process.env,services={}){
  const db=services.db||defaults,clock=services.now||Date.now,parse=services.parse||parseWrittenPdf;
  try{
    if(!uid)throw error('login_required',401);
    if(b.action==='practice-pdf-get'){
      const data=await getPrivatePdf(uid,b.sourceId,env,db,clock());
      return {status:200,json:{source:view(data),questions:data.mcq}};
    }
    const {pdf:limit}=await getPracticePolicy(uid,env,services,clock());
    const today=dayKey(new Date(clock()));
    if(b.action==='practice-pdf-status')return {status:200,json:await snapshot(uid,today,limit,env,db,clock)};
    if(b.action!=='practice-pdf-upload')throw error('invalid_action');
    if(typeof b.requestId!=='string'||!/^[-a-zA-Z0-9_]{16,80}$/.test(b.requestId)||typeof b.file!=='string'||!b.file.toLowerCase().endsWith('.pdf')||b.file.length>180||/[\\/\u0000-\u001f]/.test(b.file))throw error('invalid_pdf');
    if(typeof b.pdf!=='string'||b.pdf.length>Math.ceil(PDF_MAX/3)*4||!/^[A-Za-z0-9+/]+={0,2}$/.test(b.pdf))throw error('pdf_too_large',413);
    const bytes=Buffer.from(b.pdf,'base64');if(bytes.length>PDF_MAX)throw error('pdf_too_large',413);
    if(bytes.length<20||!bytes.subarray(0,5).equals(Buffer.from('%PDF-')))throw error('invalid_pdf');
    const sha=crypto.createHash('sha256').update(bytes).digest('hex'),pools=await poolsFor(uid,today,env,db);
    const existing=pools.find(p=>p.requestId===b.requestId);
    if(existing){
      if(existing.sha!==sha||existing.file!==b.file)throw error('invalid_pdf');
      await update(uid,old=>old?.day===today&&old.id===b.requestId?{...old,status:'ready',until:0,used:Math.max(completed(old,today),pools.length)}:old,env,db);
      return {status:200,json:{...await snapshot(uid,today,limit,env,db,clock),source:view(existing)}};
    }
    const token=crypto.randomUUID();
    const claim=await update(uid,old=>{
      const used=Math.max(completed(old,today),pools.length);
      if(old?.day===today&&old.status==='parsing'&&old.until>clock()&&!pools.some(p=>p.requestId===old.id))throw error('pdf_busy',409);
      if(used>=limit)throw error('pdf_quota',429,{usage:{day:today,limit,used,remaining:0}});
      return {day:today,id:b.requestId,token,used,slot:used,status:'parsing',until:clock()+120000};
    },env,db);
    const path=privatePdfPath(uid,today,claim.slot);let stored=false,data;
    try{
      const parsed=await parse(bytes,{includeText:true});
      const written=limited(parsed.questions,60,400000),mcq=limited(bank.parse(parsed.text||'').questions,200,200000);
      if(written.length<3&&!mcq.length)throw error('pdf_no_questions',422);
      const active=(await db.get(usagePath(uid),env))?.data.practiceUpload;
      if(active?.token!==token||active.until<=clock())throw error('pdf_busy',409);
      data={day:today,slot:claim.slot,requestId:b.requestId,file:b.file,sha,written:{questions:written},mcq,createdAt:new Date(clock()).toISOString()};
      const previous=await db.get(path,env);
      // A new import must never overwrite a source used by an existing exam.
      if(previous?.data.day===today)throw error('pdf_busy',409);
      if(previous)await db.patch(path,data,{ifUpdateTime:previous.updateTime},env);
      else await db.create(usagePath(uid)+'/practice_sources',path.split('/').pop(),data,env);
      stored=true;
      await update(uid,old=>{if(old?.token!==token)throw error('pdf_busy',409);return {...old,used:claim.used+1,status:'ready',until:0};},env,db);
    }catch(e){
      if(!stored)await update(uid,old=>old?.token===token?{...old,status:'failed',until:0}:old,env,db).catch(()=>{});
      throw e;
    }
    return {status:200,json:{...await snapshot(uid,today,limit,env,db,clock),source:view(data)}};
  }catch(e){return {status:e.status||503,json:{error:e.error||'pdf_unavailable',...(e.usage?{usage:e.usage}:{})}};}
}
