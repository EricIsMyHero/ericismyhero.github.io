// Loopback-only sign-in test. Serves no files from the private migration folder.
import http from 'node:http';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';

export function validateWebConfig(input, project) {
  if (!project || input?.projectId !== project || input.private_key || input.private_key_id || input.type === 'service_account') throw new Error('Use the destination WEB app configuration, never a service-account key.');
  if (typeof input.apiKey !== 'string' || input.apiKey.length < 20 || typeof input.appId !== 'string' || !input.appId || input.authDomain !== project + '.firebaseapp.com') throw new Error('The destination web configuration is incomplete or uses a custom auth domain; review it before testing.');
  return Object.fromEntries(['apiKey', 'authDomain', 'projectId', 'appId', 'messagingSenderId', 'storageBucket'].filter(key => typeof input[key] === 'string').map(key => [key, input[key]]));
}

function page(nonce) {
  return `<!doctype html><html lang="az"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Firebase keçid yoxlaması</title><style>body{font:17px system-ui;max-width:640px;margin:40px auto;padding:20px;color:#10243b;background:#f5f8fc}label,input,button{display:block}input{box-sizing:border-box;width:100%;padding:12px;margin:8px 0 20px}button{padding:12px 18px;margin:14px 0;cursor:pointer}pre{white-space:pre-wrap;background:white;padding:18px;border:1px solid #b9c9da}small{line-height:1.6}</style>
<h1>Yeni Firebase layihəsinə giriş sınağı</h1>
<p>Yalnız köhnə saytda artıq mövcud olan hesablarla yoxla. Saytın əsas bağlantısı dəyişmir.</p>
<p id="project"></p><button id="google" disabled>Google ilə yoxla</button>
<form id="password-form"><label for="email">Köhnə hesabın e-poçtu</label><input id="email" type="email" autocomplete="username" required>
<label for="password">Həmin hesabın mövcud parolu</label><input id="password" type="password" autocomplete="current-password" required>
<button id="password-submit" disabled>Köhnə parolla yoxla</button></form>
<pre id="result" role="status">Hazırlanır…</pre>
<small>Parol və giriş tokenləri bu lokal serverə göndərilmir. Firebase SDK onları birbaşa Google xidmətləri ilə işləyir. Sınaq səhifəsi profil sənədlərini dəyişdirmir və sessiyanı yalnız yaddaşda saxlayır. Sonda hesabdan çıxır.</small>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
<script nonce="${nonce}">
const result=document.getElementById('result'),google=document.getElementById('google'),submit=document.getElementById('password-submit');
let auth,db,ready=false;
function buttons(busy){google.disabled=busy||!ready;submit.disabled=busy||!ready;}
function showError(error){result.textContent='Xəta: '+(error.code||'test-unavailable')+'. Domenləri, giriş üsullarını və bağlantını yoxla.';}
async function verify(credential,method){
  const user=credential.user;
  const check=await fetch('/check-uid',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({uid:user.uid})});
  if(!check.ok)throw {code:'local-uid-check-failed'};
  const known=await check.json();
  if(!known.known){result.textContent='Bu hesab ehtiyat nüsxədə yoxdur. Köçürülmüş hesabla yenidən yoxla. Google girişi yeni hesab yaratmış ola bilər; nəticəni bildir, hesabları əl ilə silmə.';return;}
  const profile=await db.collection('users').doc(user.uid).get({source:'server'});
  const progress=await db.collection('users').doc(user.uid).collection('progress').doc('main').get({source:'server'});
  result.textContent=['Giriş üsulu: '+method,'Köçürülmüş UID: uyğun gəlir','Profil oxunuşu: '+(profile.exists?'uğurludur':'sənəd yoxdur'),'Statistika oxunuşu: '+(progress.exists?'uğurludur':'sənəd yoxdur'),profile.exists?'PASS — giriş və profil icazəsi işləyir.':'Giriş işləyir, amma profil sənədini ayrıca yoxlamaq lazımdır.'].join(String.fromCharCode(10));
}
async function finish(){document.getElementById('password').value='';if(auth)await auth.signOut();buttons(false);}
google.onclick=async()=>{buttons(true);result.textContent='Google girişi gözlənilir…';try{const provider=new firebase.auth.GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});await verify(await auth.signInWithPopup(provider),'Google');}catch(error){showError(error);}finally{await finish();}};
document.getElementById('password-form').onsubmit=async event=>{event.preventDefault();if(!ready)return;buttons(true);const email=document.getElementById('email').value.trim(),password=document.getElementById('password').value;document.getElementById('password').value='';result.textContent='Köhnə parolla giriş yoxlanılır…';try{await verify(await auth.signInWithEmailAndPassword(email,password),'E-poçt və mövcud parol');}catch(error){showError(error);}finally{await finish();}};
(async()=>{try{const response=await fetch('/config.json');if(!response.ok)throw {code:'config-unavailable'};const config=await response.json();firebase.initializeApp(config);auth=firebase.auth();db=firebase.firestore();await auth.setPersistence(firebase.auth.Auth.Persistence.NONE);document.getElementById('project').textContent='Yoxlanan layihə: '+config.projectId;ready=true;buttons(false);result.textContent='Hazırdır. Google ilə və ayrıca mövcud parollu hesabla yoxla.';}catch(error){showError(error);}})();
</script></html>`;
}

export function createLoginTestServer(config, allowedUids) {
  return http.createServer(async (req, res) => {
    const port = req.socket.localPort;
    const hosts = new Set(['localhost:' + port, '127.0.0.1:' + port]);
    const send = (code, body, type = 'application/json') => { res.writeHead(code, { 'Content-Type': type + '; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' }); res.end(typeof body === 'string' ? body : JSON.stringify(body)); };
    if (!hosts.has(req.headers.host)) return send(403, { error: 'invalid_host' });
    try {
      if (req.method === 'GET' && req.url === '/') {
        const nonce = crypto.randomBytes(18).toString('base64');
        res.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'nonce-" + nonce + "' https://www.gstatic.com https://apis.google.com; style-src 'unsafe-inline'; connect-src 'self' https://*.googleapis.com https://*.firebaseapp.com https://www.gstatic.com; frame-src https://*.firebaseapp.com https://accounts.google.com; img-src data: https://www.gstatic.com; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
        return send(200, page(nonce), 'text/html');
      }
      if (req.method === 'GET' && req.url === '/config.json') return send(200, config);
      if (req.method === 'POST' && req.url === '/check-uid') {
        if (req.headers.origin !== 'http://' + req.headers.host) return send(403, { error: 'invalid_origin' });
        let text = '';
        for await (const chunk of req) { text += chunk; if (Buffer.byteLength(text) > 1024) return send(413, { error: 'too_large' }); }
        let body; try { body = JSON.parse(text); } catch (_) { return send(400, { error: 'invalid_json' }); }
        if (typeof body.uid !== 'string' || body.uid.length > 128 || Object.keys(body).some(key => key !== 'uid')) return send(400, { error: 'uid_only' });
        return send(200, { known: allowedUids.has(body.uid) });
      }
      return send(404, { error: 'not_found' });
    } catch (_) { if (!res.headersSent) send(500, { error: 'local_test_failed' }); else res.end(); }
  });
}

async function main() {
  const { values } = parseArgs({ options: { project: { type: 'string' }, config: { type: 'string', default: 'firebase-web-config.json' }, auth: { type: 'string', default: 'auth-backup.json' }, port: { type: 'string', default: '8765' } } });
  const read = async path => JSON.parse((await fs.readFile(path, 'utf8')).replace(/^\uFEFF/, ''));
  const config = validateWebConfig(await read(values.config), values.project);
  const backup = await read(values.auth);
  if (!Array.isArray(backup.users) || !backup.users.length || backup.users.some(user => typeof user.localId !== 'string')) throw new Error('Use the original Authentication export to verify existing UIDs.');
  const port = Number(values.port); if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Choose a port from 1024 to 65535.');
  const server = createLoginTestServer(config, new Set(backup.users.map(user => user.localId)));
  server.on('error', error => { console.error('Local test server failed: ' + error.code); process.exitCode = 1; });
  server.listen(port, '127.0.0.1', () => { console.log('Open http://localhost:' + port + ' in Chrome.'); console.log('Testing project: ' + config.projectId); console.log('Use existing migrated accounts only. Keep this window open; Ctrl+C stops the server.'); });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(error => { console.error(error.message); process.exitCode = 1; });
