// All practice requires an account; imports and result retries are bound to that account.
(function(){
  'use strict';
  const $=id=>document.getElementById(id),tr=(az,en)=>lang==='en'?en:az,esc=s=>UNEC.esc(s);
  let uid='',epoch=0,source=null,usage=null,busy=false,message='',pending=null;
  const endpoint='https://ericismyhero-github-io.vercel.app/api/ask';
  const account=()=>typeof getCurrentUser==='function'?getCurrentUser():null;
  const errors={pdf_quota:['Bu gün 1 PDF yükləmə limitindən istifadə etmisən.','You have used today’s 1 PDF upload.'],pdf_busy:['PDF hazırda işlənir. Bir az sonra yenidən yoxla.','A PDF is being processed. Check again shortly.'],pdf_too_large:['PDF maksimum 3 MB olmalıdır.','The PDF must be no larger than 3 MB.'],invalid_pdf:['Düzgün PDF faylı seç.','Choose a valid PDF file.'],pdf_no_questions:['Uyğun suallar tapılmadı. Test üçün düzgün cavablar işarələnməli, yazılı üçün izahlı cavablar olmalıdır. Şəkilli test səhifələri və skanlar dəstəklənmir. Limit istifadə olunmadı.','No usable questions found. MCQ needs marked correct answers; written practice needs reference explanations. Image-containing MCQ pages and scans are unsupported. Your daily slot was not used.']};
  async function api(action,data={}){
    const user=account(),generation=epoch;if(!user||user.uid!==uid)throw new Error('login_required');
    const idToken=await user.getIdToken();if(generation!==epoch)throw new Error('auth_changed');
    const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(55000),body:JSON.stringify({action:'practice-pdf-'+action,...data,idToken})});
    const result=await response.json();if(generation!==epoch||account()?.uid!==uid)throw new Error('auth_changed');
    if(!response.ok)throw Object.assign(new Error(result.error),result);return result;
  }
  function gate(){
    if(!$('test-authenticated-content'))return;
    $('test-authenticated-content').hidden=!uid;$('test-auth-gate').hidden=!!uid;
    $('test-auth-gate').innerHTML=`<div class="wp-card"><h2>${tr('Sınağa başlamaq üçün daxil ol','Sign in to practice')}</h2><p>${tr('Test və yazılı sınaq nəticələrin Dashboard-da saxlanılacaq.','Your multiple-choice and written results will be saved to your Dashboard.')}</p><button type="button" class="btn btn--primary" onclick="openAuthModal('login')">${tr('Daxil ol','Sign in')}</button></div>`;
  }
  function render(){
    gate();const root=$('test-personal-pdf');if(!root)return;
    root.innerHTML=`<details class="wp-card" ${source||message?'open':''}><summary>${tr('Öz PDF-imdən sınaq','Practice with my PDF')} · ${tr('gündə 1 fayl','1 file per day')}</summary><p class="wp-muted">${tr('Fayl yalnız hesabına aid olacaq. Orijinal PDF saxlanılmır; oxunan suallar və izahlar saxlanılır. Maksimum 3 MB. Limit Bakı vaxtı ilə yenilənir. Yazılı sınaqlarda gündəlik 3 sınaq limiti də keçərlidir.','The file is private to your account. Original PDF bytes are not stored; extracted questions and explanations are stored. Maximum 3 MB. The limit resets at midnight in Baku. Written practice also uses the existing 3-exam daily limit.')}</p>${usage?`<p>${tr('Bu gün yüklənib','Uploaded today')}: ${usage.used} / 1</p>`:''}<label for="personal-pdf-file">${tr('PDF seç','Choose PDF')}</label><input id="personal-pdf-file" type="file" accept="application/pdf,.pdf" ${busy||usage?.remaining===0?'disabled':''}><div class="wp-actions"><button data-upload type="button" class="btn btn--secondary" ${busy?'disabled':''}>${tr('Limiti və faylı yenilə','Refresh upload status')}</button></div><p id="personal-pdf-message" role="status">${esc(message)}</p>${source?`<h3>${esc(source.file)}</h3><p>${tr('Test sualları','MCQ questions')}: ${source.mcq} · ${tr('Yazılı suallar','Written questions')}: ${source.written}</p><div class="wp-actions">${source.mcq?`<button data-personal-mode="mcq" type="button" class="btn btn--primary" ${busy?'disabled':''}>${tr('Bu PDF ilə test','Multiple-choice practice')}</button>`:''}${source.written>=3?`<button data-personal-mode="written" type="button" class="btn btn--primary" ${busy?'disabled':''}>${tr('Bu PDF ilə yazılı sınaq','Written practice')}</button>`:''}</div>`:''}</details>`;
    root.querySelector('[data-upload]')?.addEventListener('click',refresh);
    $('personal-pdf-file')?.addEventListener('change',upload);
    root.querySelectorAll('[data-personal-mode]').forEach(b=>b.onclick=()=>use(b.dataset.personalMode));
  }
  async function refresh(){
    if(!uid||busy)return;const generation=epoch;busy=true;render();
    try{const data=await api('status');source=data.source;usage=data.usage;message='';window.dispatchEvent(new CustomEvent('unec:privatepdf'));}
    catch(e){if(generation===epoch)message=tr('Xidmətə qoşulmaq mümkün olmadı. Yenilə.','The service is unavailable. Retry.');}
    finally{if(generation===epoch){busy=false;render();}}
  }
  async function upload(){
    const file=$('personal-pdf-file')?.files?.[0];if(!file||busy)return;
    if(file.size>3*1024*1024){message=tr(...errors.pdf_too_large);render();return;}
    if(!/\.pdf$/i.test(file.name)){message=tr(...errors.invalid_pdf);render();return;}
    const generation=epoch;busy=true;message=tr('PDF oxunur…','Reading PDF…');render();
    try{
      const buffer=await file.arrayBuffer();if(generation!==epoch)return;
      let binary='';const bytes=new Uint8Array(buffer);for(let i=0;i<bytes.length;i+=16384)binary+=String.fromCharCode(...bytes.subarray(i,i+16384));
      // A retry of the same file uses the same ID if the server response was lost.
      if(!pending||pending.file!==file.name||pending.size!==file.size||pending.modified!==file.lastModified)pending={file:file.name,size:file.size,modified:file.lastModified,id:crypto.randomUUID()};
      const result=await api('upload',{file:file.name,pdf:btoa(binary),requestId:pending.id});source=result.source;usage=result.usage||{used:1,remaining:0};message=tr('PDF hazırdır. Aşağıdan sınaq növünü seç.','PDF ready. Choose a practice format below.');window.dispatchEvent(new CustomEvent('unec:privatepdf'));
    }catch(e){if(generation===epoch)message=errors[e.error]?tr(...errors[e.error]):tr('PDF yüklənmədi. Yenilə; uğurlu yükləmə varsa oradan davam edə bilərsən.','Upload failed. Refresh; a completed upload can be resumed there.');}
    finally{if(generation===epoch){busy=false;render();}}
  }
  async function use(kind){
    if(!source||busy)return;
    if(kind==='written'){WrittenPractice.choosePrivate(source);return;}
    const generation=epoch;busy=true;render();
    try{const result=await api('get',{sourceId:source.id});WrittenPractice.setMode('mcq');const subject=UNECTests.installPrivate(result.source,result.questions);await selectSubject(subject,null,false,source.id);}
    catch(e){if(generation===epoch)message=tr('Suallar yüklənmədi. Yenidən yoxla.','Could not load questions. Retry.');}
    finally{if(generation===epoch){busy=false;render();}}
  }
  function resultMessage(value){let el=$('test-save-status');if(!el){el=document.createElement('p');el.id='test-save-status';el.setAttribute('role','status');$('resultStats')?.after(el);}if(el)el.textContent=value;}
  const queueKey=owner=>'practice-results:'+owner;
  function queued(owner){try{return JSON.parse(sessionStorage.getItem(queueKey(owner)))||[];}catch{return [];}}
  function store(owner,rows){try{sessionStorage.setItem(queueKey(owner),JSON.stringify(rows));}catch{}}
  let saving=false;
  async function flush(){
    if(saving||!uid)return;const owner=uid,generation=epoch;saving=true;
    try{for(const row of queued(owner)){
      if(generation!==epoch||account()?.uid!==owner)break;
      const xp=await saveQuizResult(row.subject,row.score,row.total,row.mistakes,row);
      if(xp&&generation===epoch&&typeof showXpToast==='function')showXpToast(xp,t('dashXpQuizDone'));
      store(owner,queued(owner).filter(r=>r.id!==row.id));
      if(generation===epoch)resultMessage(tr('Nəticə Dashboard-da saxlanıldı.','Result saved to Dashboard.'));
    }}catch{if(generation===epoch)resultMessage(tr('Nəticə hələ saxlanılmayıb. Bağlantı bərpa olunanda yenidən cəhd ediləcək.','Result not yet saved. It will retry when connectivity returns.'));}
    finally{saving=false;if(uid&&uid!==owner)flush();}
  }
  function auth(){
    const next=account()?.uid||'';
    if(next!==uid){uid=next;epoch++;source=null;usage=null;busy=false;message='';pending=null;UNECTests.clearPrivate();if(typeof testState!=='undefined'){if(testState.currentQuiz.length)resetTest();testState.selectedSubject=null;testState.selectedFile=null;testState.subjectLoading=false;testState.subjectRequest++;if($('testConfigSection'))$('testConfigSection').style.display='none';if($('testLoadState'))$('testLoadState').hidden=true;}render();if(uid){refresh();flush();}}
    gate();
  }
  window.TestAccess={sources:()=>source,record(row){if(row.uid!==uid)return;const rows=queued(uid);if(!rows.some(r=>r.id===row.id))store(uid,[...rows,row]);resultMessage(tr('Nəticə saxlanılır…','Saving result…'));flush();}};
  document.addEventListener('DOMContentLoaded',auth);window.addEventListener('unec:authchange',auth);window.addEventListener('unec:routechange',gate);window.addEventListener('unec:langchange',render);window.addEventListener('online',flush);
})();
