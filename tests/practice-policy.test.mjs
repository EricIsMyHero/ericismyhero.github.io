import test from 'node:test';
import assert from 'node:assert/strict';
import {getPracticePolicy} from '../ai-vercel/lib/practice-policy.js';
import {premiumPolicy} from '../ai-vercel/lib/ai.js';
test('practice allowances follow active redemption receipts, not profile flags or unused codes',async()=>{
 const now=Date.parse('2026-11-15T10:00:00Z');
 for(const [receipt,active] of [
  [{premiumLifetime:true,isPremium:true},false],
  [{status:'unused',plan:'lifetime'},false],
  [{status:'used',plan:'7d',redeemedAt:'2026-11-08T10:00:00Z'},false],
  [{status:'used',plan:'7d',redeemedAt:'2026-11-09T10:00:00Z'},true],
  [{status:'used',plan:'15d',redeemedAt:'2026-11-01T10:00:00Z'},true],
  [{status:'used',plan:'32d',redeemedAt:'2026-10-15T10:00:00Z'},true],
  [{status:'used',plan:'lifetime'},true]
 ]){
  const result=await getPracticePolicy('owner',{}, {policy:async()=>premiumPolicy([{data:receipt}],new Date(now))},now);
  assert.deepEqual(result,active?{closed:10,written:5,pdf:3,isPremium:true}:{closed:5,written:3,pdf:1,isPremium:false});
 }
});
test('unavailable redemption receipts do not silently grant a free or Premium quota',async()=>{
 await assert.rejects(getPracticePolicy('owner',{}, {policy:async()=>{throw new Error('unavailable');}}),/unavailable/);
});
