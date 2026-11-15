// Only server-verified redemption receipts grant higher practice allowances.
import { getAiPolicy } from './ai.js';
export const PRACTICE_LIMITS = Object.freeze({
  free: Object.freeze({ closed: 5, written: 3, pdf: 1 }),
  premium: Object.freeze({ closed: 10, written: 5, pdf: 3 })
});
export async function getPracticePolicy(uid, env, services, now = Date.now()) {
  const policy = await (services.policy || getAiPolicy)(uid, env, new Date(now));
  const isPremium = policy?.isPremium === true;
  return { ...PRACTICE_LIMITS[isPremium ? 'premium' : 'free'], isPremium };
}
