/* Written practice: private, server-timed exams. No grading keys or reference answers in the browser. */
(function () {
  'use strict';
  const endpoint = 'https://ericismyhero-github-io.vercel.app/api/ask';
  const $ = id => document.getElementById(id), esc = s => window.UNEC.esc(s);
  const text = (az, en) => typeof lang !== 'undefined' && lang === 'en' ? en : az;
  let uid = '', epoch = 0, exam = null, usage = null, enabled = false, busy = false, loaded = false;
  let subject = '', source = '', mode = 'midterm', offset = 0, rev = 0, dirty = false, lastAttempt = 0;
  let pending = null, retryTimer = null, message = '', dashboardSaved=false;
  const user = () => typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  const visible = () => window.UNEC?.route?.tab === 'tests' && window.UNEC.route.query?.mode === 'written';
  const storage = {
    get(key) { try { return JSON.parse(sessionStorage.getItem(key)); } catch { return null; } },
    set(key, value) { try { sessionStorage.setItem(key, JSON.stringify(value)); } catch {} },
    del(key) { try { sessionStorage.removeItem(key); } catch {} }
  };
  const pointerKey = () => 'written-pointer:' + uid;
  const draftKey = (index = exam?.current) => 'written-draft:' + uid + ':' + exam?.id + ':' + index;
  function clearDrafts(owner) {
    try { for (const k of Object.keys(sessionStorage)) if (k.startsWith('written-draft:' + owner + ':')) sessionStorage.removeItem(k); } catch {}
  }
  function notice(value) { message = value; if ($('wp-message')) $('wp-message').textContent = value; }
  const errors = {
    written_quota: ['Bu gün üçün 3 sınaq limitinə çatmısan. Limit Bakı vaxtı ilə gecə yarısı yenilənir.', 'You have used all 3 exams today. The limit resets at midnight in Baku.'],
    source_not_ready: ['Bu PDF-də kifayət qədər sual və izahlı cavab tanınmadı. Başqa PDF seç. Skan edilmiş və yalnız suallardan ibarət fayllar uyğun deyil.', 'Not enough questions with reference answers were found. Choose another PDF. Scans and question-only files are not supported.'],
    source_changed: ['PDF dəyişib və əvvəlki mənbəni yoxlamaq mümkün deyil. Cavabların saxlanılıb; bu sınağı ləğv edə bilərsən.', 'The PDF changed and its original reference cannot be verified. Your answers are saved; you can abandon this exam.'],
    question_expired: ['Sualın vaxtı bitdi. Son saxlanmış cavab kilidləndi.', 'Time expired. The last saved answer was locked.'],
    stale_answer: ['Başqa pəncərədə daha yeni cavab saxlanıb. Ən son cavab yükləndi.', 'A newer answer was saved in another window. The latest answer was loaded.'],
    login_required: ['Yazılı sınaq üçün hesabına daxil ol.', 'Sign in to start written practice.'],
    provider_busy: ['AI xidmətinin kvotası dolub. Cavabların saxlanılıb; yoxlamanı bir az sonra davam etdir.', 'The AI service is rate limited. Your answers are saved; resume grading shortly.'],
    exam_busy: ['Sınaq başqa sorğuda işlənir. Bir az sonra davam et.', 'Another request is processing this exam. Resume shortly.'],
    exam_active: ['Davam edən sınağın yükləndi. Əvvəl onu bitir və ya ləğv et.', 'Your unfinished exam was loaded. Finish or abandon it first.']
  };
  function errorText(code) { return errors[code] ? text(...errors[code]) : text('Xidmətə qoşulmaq mümkün olmadı. Cavabın bu pəncərədə saxlanılıb. Yenidən cəhd et.', 'The service is unavailable. Your draft is saved in this window. Try again.'); }
  function setBusy(value) {
    busy = value; $('test-written-pane')?.setAttribute('aria-busy',String(value));
    document.querySelectorAll('#test-written-pane button,#test-written-pane select').forEach(el => { el.disabled = value || el.dataset.unavailable === 'true'; });
  }
  async function api(action, fields = {}) {
    const owner = uid, generation = epoch, account = user();
    if (!account || account.uid !== owner) throw Object.assign(new Error('login_required'), { code: 'login_required' });
    const token = await account.getIdToken();
    if (generation !== epoch) throw new Error('auth_changed');
    const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(55000), body: JSON.stringify({ action: 'written-' + action, ...fields, idToken: token }) });
    const data = await response.json();
    if (generation !== epoch || user()?.uid !== owner) throw new Error('auth_changed');
    return { ok: response.ok, status: response.status, ...data };
  }
  function stash() {
    if (!exam || exam.status !== 'active' || !$('wp-answer')) return;
    storage.set(draftKey(), { answer: $('wp-answer').value, rev });
  }
  function apply(data, preserve = false) {
    if (data.usage) usage = data.usage;
    if ('enabled' in data) enabled = data.enabled;
    if (!('exam' in data)) return;
    const previous = exam, localRev = rev, localAnswer = $('wp-answer')?.value;
    exam = data.exam?.status==='abandoned'?null:data.exam;
    if(previous?.id!==exam?.id)dashboardSaved=false;
    if(data.dashboardSaved)dashboardSaved=true;
    if (exam) {
      offset = exam.serverNow - Date.now(); rev = exam.rev;
      storage.set(pointerKey(), { examId: exam.id, day: exam.day });
      if (preserve && previous?.id === exam.id && previous.current === exam.current && localRev > exam.rev) {
        exam.questions[exam.current].answer = localAnswer; rev = localRev; dirty = true;
      } else dirty = false;
    } else storage.del(pointerKey());
  }
  function sources() {
    const catalog = window.UNEC?.getSubjectCatalog?.() || {};
    const rows=Object.entries(catalog).map(([name, value]) => ({ name, pdfs: (value.pdfs || []).filter(p => (p.type || value.type) === 'yazili').sort((a,b) => String(b.addedAt || '').localeCompare(String(a.addedAt || ''))) })).filter(s => s.pdfs.length).sort((a,b) => a.name.localeCompare(b.name, 'az'));
    const own=window.TestAccess?.sources();if(own?.written>=3)rows.unshift({name:text('Şəxsi PDF','My PDF'),pdfs:[{...own,file:own.id}]});return rows;
  }
  function options(rows, selected, value, label) { return rows.map(row => `<option value="${esc(value(row))}" ${value(row) === selected ? 'selected' : ''}>${esc(label(row))}</option>`).join(''); }
  const button = (action, title, primary = false, unavailable = false) => `<button type="button" class="btn btn--${primary ? 'primary' : 'secondary'}" data-wp="${action}" ${unavailable ? 'disabled data-unavailable="true"' : ''}>${esc(title)}</button>`;
  function render() {
    const root = $('test-written-pane'); if (!root) return;
    $('wp-tab-mcq').textContent = text('Qapalı', 'Multiple choice'); $('wp-tab-written').textContent = text('Yazılı · AI', 'Written · AI');
    let body = '';
    const quota = usage ? `${text('Bu gün', 'Today')}: ${usage.used} / ${usage.limit} · ${text('Qalıb', 'Remaining')}: ${usage.remaining}` : '';
    if (!uid) body = `<div class="wp-card"><h2>${text('Yazılı sınaq', 'Written practice')}</h2><p>${text('Midterm: 3 sual, 30 bal. Semestr: 5 sual, 50 bal. Hər suala 20 dəqiqə.', 'Midterm: 3 questions, 30 points. Semester: 5 questions, 50 points. 20 minutes per question.')}</p>${button('login', text('Daxil ol', 'Sign in'), true)}</div>`;
    else if (!loaded) body = `<p role="status">${text('Sınaqlar yoxlanılır…', 'Loading your exams…')}</p>${button('refresh', text('Yenidən yoxla', 'Retry'))}`;
    else if (!exam) {
      const rows = sources(); if (!rows.some(s => s.name === subject)) subject = rows[0]?.name || '';
      const pdfs = rows.find(s => s.name === subject)?.pdfs || [];
      if (!pdfs.some(p => p.file === source)) source = pdfs[0]?.file || '';
      body = `<div class="wp-card"><h2>${text('Yazılı sınaq', 'Written practice')} <span class="badge badge--orange">beta</span></h2><p>${text('Elektron-yazılı PDF-dən təsadüfi suallar. Cavabların həmin PDF-dəki izahlarla AI tərəfindən müqayisə olunur.', 'Random questions from a written-format PDF. AI compares your answers with the explanations in that PDF.')}</p><p class="wp-muted">${text('Bu, məşq üçündür; bal rəsmi qiymət deyil. Yoxlama zamanı cavabların və PDF-dən uyğun izah AI xidmətinə göndərilir. Şəxsi məlumat yazma.', 'This is practice; the score is not an official grade. Grading sends your answers and relevant PDF reference text to the AI service. Do not include personal information.')}</p>
      <label for="wp-subject">${text('Fənn', 'Subject')}</label><select id="wp-subject">${options(rows, subject, s=>s.name, s=>s.name)}</select>
      <label for="wp-source">${text('Sual mənbəyi', 'Question source')}</label><select id="wp-source">${options(pdfs, source, p=>p.file, p=>p.private?p.name:p.name + ' · ' + p.file)}</select><small class="wp-muted">${text('Ən yeni PDF əvvəl seçilir. Mətn, nömrələnmiş suallar və izahlı cavablar olmalıdır.', 'The newest PDF is selected first. It must contain text, numbered questions and reference answers.')}</small>
      <div class="wp-modes" role="group" aria-label="${text('Sınaq rejimi', 'Exam mode')}">${['midterm','semester'].map(m=>`<button type="button" data-mode="${m}" aria-pressed="${mode===m}"><strong>${m==='midterm'?'Midterm':text('Semestr','Semester')}</strong><span>${m==='midterm'?'3':'5'} ${text('sual','questions')} · ${m==='midterm'?'30':'50'} ${text('bal','points')}</span><small>${m==='midterm'?'60':'100'} ${text('dəqiqə','minutes')}</small></button>`).join('')}</div>
      <p>${text('Hər suala 20 dəqiqə. Növbəti suala keçdikdə cavab kilidlənir. Səhifəni bağlamaq vaxtı dayandırmır. Başlanmış və ləğv edilmiş sınaqlar ortaq gündəlik 3 sınaq limitinə daxildir.', '20 minutes per question. Moving on locks your answer. Closing the page does not pause the timer. Started and abandoned exams count toward the shared daily limit of 3.')}</p><p class="wp-muted">${text('Pulsuz AI xidmətinin ümumi kvotası dolduqda yoxlamada fasilə ola bilər.', 'Grading may pause when the free AI service reaches its shared quota.')}</p>
      ${!enabled ? `<p>${text('AI xidməti hazırda aktiv deyil.', 'The AI service is currently unavailable.')}</p>` : ''}<div class="wp-actions">${button('start',text('Sınağa başla','Start practice'),true,!enabled||!source||!usage?.remaining)}</div></div>`;
    } else if (exam.status === 'active') {
      const q = exam.questions[exam.current], draft = storage.get(draftKey());
      let answer = q.answer;
      if (draft && draft.rev >= exam.rev && typeof draft.answer === 'string') { answer = draft.answer.slice(0, exam.answerMax); rev = draft.rev; dirty = draft.rev > exam.rev; }
      body = `<div class="wp-top"><strong>${text('Sual','Question')} ${exam.current+1} / ${exam.questions.length} · 10 ${text('bal','points')}</strong><span class="wp-clock" id="wp-clock" role="timer"></span></div><progress max="${exam.questions.length}" value="${exam.current+1}" aria-label="${text('İrəliləyiş','Progress')}"></progress><div class="wp-card"><p class="wp-muted">${esc(exam.source.name)}</p><h2 id="wp-question">${esc(q.title)}</h2><label for="wp-answer">${text('Cavabın','Your answer')}</label><textarea id="wp-answer" maxlength="${exam.answerMax}" aria-describedby="wp-save wp-count" aria-labelledby="wp-question">${esc(answer)}</textarea><div class="wp-top wp-muted"><span id="wp-save" role="status">${text('Cavab hər dəqiqə və sahədən çıxdıqda saxlanılır.','Saved every minute and when you leave the answer field.')}</span><span id="wp-count">${answer.length} / ${exam.answerMax}</span></div><div class="wp-actions">${button('next',exam.current+1===exam.questions.length?text('Bitir və AI ilə yoxla','Finish and grade with AI'):text('Saxla və növbəti suala keç','Save and next question'),true)}${exam.current+1<exam.questions.length?button('finish',text('İndi bitir və AI ilə yoxla','Finish now and grade with AI')):''}${button('save',text('Cavabı saxla','Save answer'))}</div><p class="wp-muted">${text('Vaxt bitdikdə son saxlanmış cavab kilidlənir. İnternet bağlantısını açıq saxla.','When time expires, the last saved answer is locked. Keep your internet connection active.')}</p></div><div class="wp-actions">${button('abandon',text('Sınağı ləğv et','Abandon exam'))}</div>`;
    } else if (exam.status === 'graded') {
      body = `<div class="wp-card"><h2>${text('Sınaq nəticəsi','Practice results')}</h2><p class="wp-score">${exam.total===null?text('Yoxlama natamamdır','Evaluation incomplete'):esc(exam.total)+' / '+exam.maxScore}</p><p>${text('AI qiymətləndirməsi məşq üçündür və səhv ola bilər. Rəsmi qiymət deyil.','AI grading is for practice and may be incorrect. It is not an official grade.')}</p>${exam.total===null?`<p>${text('Ən azı bir cavab üçün etibarlı bal hesablana bilmədi. Yekun bal göstərilmir.','At least one answer could not be reliably graded. No total is shown.')}</p>`:''}<p>${dashboardSaved?text('Nəticə Dashboard-da saxlanıldı.','Result saved to Dashboard.'):text('Nəticəni Dashboard-a saxlamaq üçün yenidən cəhd et.','Retry saving this result to Dashboard.')}</p>${!dashboardSaved?button('grade',text('Dashboard-a saxla','Save to Dashboard')):''}${button('new',text('Yeni sınaq','New practice'),true)}</div>`;
      body += exam.questions.map((q,i)=>`<article class="wp-card"><p class="wp-muted">${text('Sual','Question')} ${i+1}</p><h3>${esc(q.title)}</h3><strong>${q.result?.score===null?text('Qiymətləndirilmədi','Not graded'):esc(q.result?.score)+' / 10'}</strong><p>${esc(q.result?.feedback)}</p>${q.result?.missing?.length?`<ul>${q.result.missing.map(s=>`<li>${esc(s)}</li>`).join('')}</ul>`:''}<details><summary>${text('Cavabın və mənbə','Your answer and source')}</summary><div class="wp-answer">${esc(q.answer||text('Cavab yazılmayıb.','No answer submitted.'))}</div>${q.result?.quote?`<blockquote>${esc(q.result.quote)}</blockquote>`:''}${exam.source.private?`<span class="wp-source">${esc(exam.source.file)} · ${text('səhifə','page')} ${Number(q.page)||1}</span>`:`<a class="wp-source" href="${esc(exam.source.url)}#page=${Number(q.page)||1}" target="_blank" rel="noopener">${esc(exam.source.file)} · ${text('səhifə','page')} ${Number(q.page)||1}</a>`}</details></article>`).join('');
    } else {
      body = `<div class="wp-card"><h2>${text('Cavablar yoxlanılır','Grading your answers')}</h2><p>${exam.graded} / ${exam.questions.length}</p><progress max="${exam.questions.length}" value="${exam.graded}" aria-label="${text('Yoxlama','Grading')}"></progress><p>${text('Hər sual ayrıca yoxlanılır. Bu səhifəni bağlasan, sonra eyni sınağın yoxlamasına davam edə bilərsən.','Questions are graded individually. You can close this page and resume grading the same exam later.')}</p><p id="wp-retry" role="status"></p><div class="wp-actions">${button('grade',text('Yoxlamanı davam etdir','Resume grading'),true)}${button('abandon',text('Sınağı ləğv et','Abandon exam'))}</div></div>`;
    }
    root.innerHTML = `<p class="wp-muted">${esc(quota)}</p><div id="wp-message" class="wp-message" role="status">${esc(message)}</div>` + body;
    root.onclick = event => { const target=event.target.closest('[data-wp],[data-mode]'); if(!target||target.disabled)return; if(target.dataset.mode){mode=target.dataset.mode;pending=null;render();}else act(target.dataset.wp); };
    $('wp-subject')?.addEventListener('change',e=>{subject=e.target.value;source='';pending=null;render();});
    $('wp-source')?.addEventListener('change',e=>{source=e.target.value;pending=null;});
    $('wp-answer')?.addEventListener('input',()=>{ rev++;dirty=true;stash();$('wp-count').textContent=$('wp-answer').value.length+' / '+exam.answerMax; });
    $('wp-answer')?.addEventListener('blur',()=>{stash();setTimeout(()=>{if(dirty&&!busy&&exam?.status==='active')act('save');},200);});
    setBusy(busy); tick();
  }
  async function refresh() {
    if (!uid || busy) return; stash(); const generation=epoch; setBusy(true);
    try {
      let data=await api('status',storage.get(pointerKey())||{});
      if([404,410].includes(data.status)){storage.del(pointerKey());data=await api('status');}
      if(data.ok){apply(data);loaded=true;notice('');render();if(exam&&['ready','grading'].includes(exam.status))queueGrade(100);}
      else{if(data.exam){apply(data);loaded=true;render();}notice(errorText(data.error));}
    } catch(e){if(generation===epoch)notice(errorText(e.code));}
    finally {if(generation===epoch){setBusy(false);if(!loaded)render();}}
  }
  function answerFields(){return {examId:exam.id,day:exam.day,index:exam.current,rev,answer:$('wp-answer')?.value||exam.questions[exam.current]?.answer||''};}
  function queueGrade(ms){clearTimeout(retryTimer);const generation=epoch;retryTimer=setTimeout(()=>{if(epoch===generation&&visible()&&!busy)act('grade');},ms);}
  async function act(action) {
    if(action==='login'){openAuthModal('login');return;}
    if(action==='refresh'){refresh();return;}
    if(action==='new'){exam=null;pending=null;storage.del(pointerKey());notice('');render();return;}
    if(busy||!uid)return;
    if(action==='abandon'&&!confirm(text('Sınaq ləğv edilsin? Gündəlik limitdən geri qaytarılmır.','Abandon this exam? It still counts toward today’s limit.')))return;
    if(action==='finish'&&!confirm(text('Sınağı indi bitirək? Yazılmamış cavablar 0 bal olacaq.','Finish now? Unanswered questions receive 0 points.')))return;
    stash(); const generation=epoch, sentRev=rev; let fields={};
    if(action==='start'){pending||={requestId:crypto.randomUUID(),sourceId:source,mode,lang:typeof lang!=='undefined'?lang:'az'};fields=pending;}
    else if(['save','next','finish'].includes(action))fields=answerFields();
    else if(exam)fields={examId:exam.id,day:exam.day};else return;
    clearTimeout(retryTimer);setBusy(true);
    if(action==='start')notice(text('PDF oxunur və suallar hazırlanır…','Reading the PDF and preparing questions…'));
    if(action==='grade')notice(text('AI cavabı yoxlayır…','AI is grading an answer…'));
    try {
      const data=await api(action,fields);
      const old=exam;apply(data,action==='save'&&data.ok);
      if(old?.status==='active'&&exam&&(old.current!==exam.current||exam.status!=='active'))storage.del('written-draft:'+uid+':'+old.id+':'+old.current);
      if(data.ok){
        notice('');if(action==='start')pending=null;
        if(action==='save'&&exam?.status==='active'&&old?.current===exam.current){
          if(rev===sentRev)dirty=false;
          if($('wp-save'))$('wp-save').textContent=dirty?text('Yeni dəyişikliklər saxlanılacaq.','New changes will be saved.'):text('Cavab saxlanıldı.','Answer saved.');
        }else render();
        if(exam&&['ready','grading'].includes(exam.status))queueGrade(350);
      } else {
        if(['question_expired','stale_answer'].includes(data.error)&&old)storage.del('written-draft:'+uid+':'+old.id+':'+old.current);
        notice(errorText(data.error));if(data.exam||(data.usage&&!exam))render();
        const seconds=Number(data.retryAfter)||0;
        if(action==='grade'&&[429,409,503,502].includes(data.status)&&seconds>0&&seconds<=90){
          notice(errorText(data.error)+' '+text('Növbəti cəhd','Next attempt')+': '+seconds+' '+text('saniyə.','seconds.'));queueGrade(seconds*1000+500);
        }
      }
    } catch(e){if(generation===epoch)notice(errorText(e.code));}
    finally {if(generation===epoch)setBusy(false);}
  }
  function tick(){
    if(!visible()||!exam||exam.status!=='active'||!$('wp-clock'))return;
    const left=Math.max(0,Math.ceil((exam.deadline-(Date.now()+offset))/1000));
    $('wp-clock').textContent=String(Math.floor(left/60)).padStart(2,'0')+':'+String(left%60).padStart(2,'0');
    $('wp-clock').classList.toggle('is-low',left<=60);if($('wp-answer'))$('wp-answer').readOnly=left===0;
    if(left===0&&!busy&&Date.now()-lastAttempt>5000){lastAttempt=Date.now();act('next');}
  }
  function route(){
    const written=visible();if(!$('test-mcq-pane'))return;
    $('wp-tab-mcq').textContent=text('Qapalı','Multiple choice');$('wp-tab-written').textContent=text('Yazılı · AI','Written · AI');
    $('test-mcq-pane').hidden=written;$('test-written-pane').hidden=!written;
    $('wp-tab-mcq').setAttribute('aria-pressed',String(!written));$('wp-tab-written').setAttribute('aria-pressed',String(written));
    if(written){render();if(uid&&!loaded)refresh();else if(exam&&['ready','grading'].includes(exam.status))queueGrade(100);}
    else{stash();clearTimeout(retryTimer);}
  }
  function auth(){
    const next=user()?.uid||'';if(next===uid){route();return;}
    stash();if(uid)clearDrafts(uid);uid=next;epoch++;exam=null;usage=null;enabled=false;loaded=false;busy=false;dirty=false;pending=null;message='';clearTimeout(retryTimer);route();
  }
  window.WrittenPractice={choosePrivate(value){subject=text('Şəxsi PDF','My PDF');source=value.id;pending=null;this.setMode('written');render();},setMode(value){
    if(value==='written'&&typeof testState!=='undefined'&&testState.currentQuiz.length&&!testState.result){if(!confirm(t('testExitConfirm')))return;resetTest();}
    stash();window.UNEC.go('/tests'+(value==='written'?'?mode=written':''));
  },refresh};
  window.addEventListener('unec:routechange',route);window.addEventListener('unec:authchange',auth);
  window.addEventListener('unec:langchange',()=>{stash();render();});
  document.addEventListener('DOMContentLoaded',()=>{auth();route();});
  window.addEventListener('unec:privatepdf',()=>{if(visible()&&!exam)render();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stash();if(dirty&&!busy&&exam?.status==='active')act('save');}else if(visible()&&!busy&&uid)refresh();});
  window.addEventListener('pagehide',stash);
  setInterval(tick,1000);setInterval(()=>{if(visible()&&dirty&&!busy&&exam?.status==='active')act('save');},60000);
})();
