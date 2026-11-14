// Private PDF imports. The server parses original bytes, never browser-supplied answer keys.
import crypto from 'node:crypto';
import {getDoc,createDoc,patchDoc} from './firestore.js';
import {usagePath,dayKey} from './ai.js';
import {parseWrittenPdf} from './written-pdf.js';
import bank from './test-bank.cjs';
export const PDF_MAX=3*1024*1024, PDF_LIMIT=1;
const defaults={get:getDoc,create:createDoc,patch:patchDoc};
const error=(code,status=400)=>Object.assign(new Error(code),{error:code,status});
const days=now=>[dayKey(new Date(now)),dayKey(new Date(now-86400000))];
// Two fixed slots bound storage and retain yesterday's source for an exam crossing midnight.
export function privatePdfPath(uid,day){return usagePath(uid)+'/practice_sources/'+(Math.floor(Date.parse(day+'T00:00:00Z')/86400000)%2);}
export async function getPrivatePdf(uid,id,env=process.env,db=defaults,now=Date.now()){
  if(typeof id!=='string'||!id.startsWith('private:')||!days(now).includes(id.slice(8)))throw error('private_pdf_expired',410);
  const doc=await db.get(privatePdfPath(uid,id.slice(8)),env);
  if(!doc||doc.data.day!==id.slice(8))throw error('private_pdf_not_found',404);
  return doc.data;
}
function view(data){return {id:'private:'+data.day,private:true,day:data.day,file:data.file,name:data.file,subject:data.file,url:'',addedAt:data.createdAt,
  written:data.written.questions.length,mcq:data.mcq.length};}
export async function privateSource(uid,id,env,db,now){const data=await getPrivatePdf(uid,id,env,db,now);return view(data);}
export async function privatePool(uid,source,env,db,now){const data=await getPrivatePdf(uid,source.id,env,db,now);return {sha:data.sha,questions:data.written.questions};}
async function update(uid,change,env,db){
  for(let n=0;n<8;n++){
    const previous=await db.get(usagePath(uid),env),next=change(previous?.data.practiceUpload);
    try{if(previous)await db.patch(usagePath(uid),{practiceUpload:next},{ifUpdateTime:previous.updateTime},env);
      else await db.create('ai_usage',usagePath(uid).split('/')[1],{uid,practiceUpload:next},env);return next;
    }catch(e){if(!['exists','conflict'].includes(e.code))throw e;}
  }throw error('pdf_busy',409);
}
function limited(rows,max,budget){const chosen=[];let bytes=0;for(const row of rows){const size=Buffer.byteLength(JSON.stringify(row));if(chosen.length>=max||bytes+size>budget)break;chosen.push(row);bytes+=size;}return chosen;}
export async function practicePdfAction(b,uid,env=process.env,services={}){
  const db=services.db||defaults,clock=services.now||Date.now,parse=services.parse||parseWrittenPdf;
  try{
    if(!uid)throw error('login_required',401);
    const today=dayKey(new Date(clock())),path=privatePdfPath(uid,today);
    if(b.action==='practice-pdf-status'){
      const doc=await db.get(usagePath(uid),env),claim=doc?.data.practiceUpload;
      const pool=await db.get(path,env),source=pool?.data.day===today?view(pool.data):null;
      const used=claim?.day===today&&(claim.status==='ready'||claim.until>clock()||!!source)?1:0;
      return {status:200,json:{usage:{day:today,limit:PDF_LIMIT,used,remaining:1-used},source}};
    }
    if(b.action==='practice-pdf-get'){
      const data=await getPrivatePdf(uid,b.sourceId,env,db,clock());
      return {status:200,json:{source:view(data),questions:data.mcq}};
    }
    if(b.action!=='practice-pdf-upload')throw error('invalid_action');
    if(typeof b.requestId!=='string'||!/^[-a-zA-Z0-9_]{16,80}$/.test(b.requestId)||typeof b.file!=='string'||!b.file.toLowerCase().endsWith('.pdf')||b.file.length>180||/[\\/\u0000-\u001f]/.test(b.file))throw error('invalid_pdf');
    if(typeof b.pdf!=='string'||b.pdf.length>Math.ceil(PDF_MAX/3)*4||!/^[A-Za-z0-9+/]+={0,2}$/.test(b.pdf))throw error('pdf_too_large',413);
    const bytes=Buffer.from(b.pdf,'base64');if(bytes.length>PDF_MAX)throw error('pdf_too_large',413);
    if(bytes.length<20||!bytes.subarray(0,5).equals(Buffer.from('%PDF-')))throw error('invalid_pdf');
    const sha=crypto.createHash('sha256').update(bytes).digest('hex');
    const existing=await db.get(path,env);
    if(existing?.data.day===today&&existing.data.requestId===b.requestId&&existing.data.sha===sha)return {status:200,json:{source:view(existing.data)}};
    const token=crypto.randomUUID();
    await update(uid,old=>{
      if(old?.day===today){if(old.status==='ready')throw error('pdf_quota',429);if(old.until>clock())throw error('pdf_busy',409);}
      if(existing?.data.day===today)throw error('pdf_quota',429);
      return {day:today,id:b.requestId,token,status:'parsing',until:clock()+120000};
    },env,db);
    let data;
    try{
      const parsed=await parse(bytes,{includeText:true});
      const written=limited(parsed.questions,60,400000),mcq=limited(bank.parse(parsed.text||'').questions,200,200000);
      if(written.length<3&&!mcq.length)throw error('pdf_no_questions',422);
      data={day:today,requestId:b.requestId,file:b.file,sha,written:{questions:written},mcq,createdAt:new Date(clock()).toISOString()};
      const previous=await db.get(path,env);
      if(previous)await db.patch(path,data,{ifUpdateTime:previous.updateTime},env);
      else await db.create(usagePath(uid)+'/practice_sources',path.split('/').pop(),data,env);
      await update(uid,old=>{if(old?.token!==token)throw error('pdf_busy',409);return {...old,status:'ready',until:0};},env,db);
    }catch(e){
      if(!data)await update(uid,old=>old?.token===token?{...old,status:'failed',until:0}:old,env,db).catch(()=>{});
      throw e;
    }
    return {status:200,json:{source:view(data),usage:{day:today,limit:1,used:1,remaining:0}}};
  }catch(e){return {status:e.status||503,json:{error:e.error||'pdf_unavailable'}};}
}
