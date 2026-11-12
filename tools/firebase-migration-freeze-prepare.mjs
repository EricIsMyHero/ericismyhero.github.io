// Prepare rollback files locally. Does not deploy rules or change API keys.
import fs from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import { decodeText } from './firebase-migration-check.mjs';

export function prepareFreeze(source, config, rules) {
  if (!source || config?.projectId !== source || config.maintenance || typeof config.apiKey !== 'string' || config.apiKey.length < 20) throw new Error('The live configuration must still point to the active source project.');
  if (!/service\s+cloud\.firestore/.test(rules) || !rules.trim()) throw new Error('Save the original source Firestore rules first.');
  return {
    'firestore.source-before-freeze.rules': rules,
    'firebase-source-web-config.json': JSON.stringify(config, null, 2) + '\n',
    'firestore.migration-freeze.rules': "rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} { allow read, write: if false; }\n  }\n}\n",
    'firebase.freeze.json': JSON.stringify({ firestore: { rules: 'firestore.migration-freeze.rules' } }, null, 2) + '\n',
    'firebase.rollback.json': JSON.stringify({ firestore: { rules: 'firestore.source-before-freeze.rules' } }, null, 2) + '\n'
  };
}

async function main() {
  const { values } = parseArgs({ options: { source: { type: 'string' }, rules: { type: 'string', default: 'firestore.rules' } } });
  const response = await fetch('https://ericismyhero-github-io.vercel.app/api/firebase-config', { cache: 'no-store', signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error('Cannot read the live source configuration.');
  const config = await response.json();
  const files = prepareFreeze(values.source, config, decodeText(await fs.readFile(values.rules)));
  for (const [name, content] of Object.entries(files)) {
    try { await fs.writeFile(name, content, { flag: 'wx', mode: 0o600 }); }
    catch (error) { if (error.code !== 'EEXIST' || await fs.readFile(name, 'utf8') !== content) throw error; }
  }
  console.log('Rollback preparation complete. Source: ' + values.source);
  console.log('Source API key ending: ' + config.apiKey.slice(-8));
  console.log('No Firebase rules, API keys or Vercel settings changed. Do not activate the pause yet.');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(error => { console.error(error.message); process.exitCode = 1; });
