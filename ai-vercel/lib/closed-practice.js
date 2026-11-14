// Daily start reservations for formative multiple-choice practice, separate from AI/import quotas.
import {getDoc,createDoc,patchDoc} from './firestore.js';
import {dayKey,usagePath} from './ai.js';
import {getPrivatePdf} from './practice-pdf.js';
import {CLOSED_SOURCES} from './closed-sources.js';
export const CLOSED_LIMIT=5;
const defaults={get:getDoc,create:createDoc,patch:patchDoc};
const error=(code,status=400,extra={})=>Object.assign(new Error(code),{error:code,status,...extra});
function stateOf(doc,day){const old=doc?.data.closedPractice;return old?.day===day?structuredClone(old):{day,starts:[]};}
function view(state){return {day:state.day,used:state.starts.length,limit:CLOSED_LIMIT,remaining:Math.max(0,CLOSED_LIMIT-state.starts.length)};}
export async function closedAction(b,uid,env=process.env,services={}){
 const db=services.db||defaults,now=services.now||Date.now;
 try{
  if(!uid)throw error('login_required',401);
  const path=usagePath(uid);
  if(b.action==='closed-status'){
   const doc=await db.get(path,env),state=stateOf(doc,dayKey(new Date(now())));
   return {status:200,json:{usage:view(state)}};
  }
  if(b.action!=='closed-start')throw error('invalid_action');
  if(typeof b.requestId!=='string'||!/^[-a-zA-Z0-9_]{16,80}$/.test(b.requestId)||typeof b.sourceId!=='string'||!Number.isInteger(b.count)||b.count<1||b.count>50)throw error('invalid_start');
  if(b.sourceId.startsWith('private:')){
   const source=await getPrivatePdf(uid,b.sourceId,env,db,now());if(b.count>source.mcq.length)throw error('invalid_count');
  }else if(!(services.sources||CLOSED_SOURCES).includes(b.sourceId))throw error('invalid_source');
  for(let attempt=0;attempt<8;attempt++){
   const previous=await db.get(path,env),day=dayKey(new Date(now())),state=stateOf(previous,day);
   const same=state.starts.find(s=>s.id===b.requestId);
   if(same){if(same.sourceId!==b.sourceId||same.count!==b.count)throw error('invalid_start',409);return {status:200,json:{id:same.id,usage:view(state)}};}
   if(state.starts.length>=CLOSED_LIMIT)throw error('closed_quota',429,{usage:view(state)});
   const start={id:b.requestId,sourceId:b.sourceId,count:b.count,startedAt:now()};state.starts.push(start);
   try{
    if(previous)await db.patch(path,{closedPractice:state},{ifUpdateTime:previous.updateTime},env);
    else await db.create('ai_usage',path.split('/')[1],{uid,closedPractice:state},env);
    return {status:200,json:{id:start.id,usage:view(state)}};
   }catch(e){if(!['exists','conflict'].includes(e.code))throw e;}
  }
  throw error('closed_busy',409);
 }catch(e){return {status:e.status||503,json:{error:e.error||'closed_unavailable',...(e.usage?{usage:e.usage}:{})}};}
}
