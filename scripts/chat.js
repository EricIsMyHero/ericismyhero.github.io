// ============================================================
// CHAT.JS  —  Fənn üzrə şərh / müzakirə sistemi
// Firestore: subject_chats/{courseSlug__subjectSlug}/messages
// ============================================================

let _chatUnsub        = null;
let _chatCurrentDocId = null;
let _activeChatTag    = null;

const CHAT_TAGS = [
  { key: 'final',    icon: 'push_pin',    label: 'Finalda düşdü' },
  { key: 'midterm',  icon: 'attach_file', label: 'Kollekviumda düşdü' },
  { key: 'old',      icon: 'repeat',      label: 'Köhnə suallardır' },
  { key: 'wantmore', icon: 'menu_book',   label: 'Yeni PDF istəyirəm' }
];

// ── Köməkçilər ────────────────────────────────────────────────
function _chatSlug(str) {
  return (str || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9əğıöşüç\-]/gi, '')
    .slice(0, 60);
}

function _chatDocId(courseName, subjectName) {
  return `${_chatSlug(courseName)}__${_chatSlug(subjectName)}`;
}

function _chatEscape(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function _chatTimeAgo(date) {
  if (!date) return '';
  const sec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (sec < 60)   return 'indicə';
  const min = Math.floor(sec / 60);
  if (min < 60)   return `${min} dəq əvvəl`;
  const hr = Math.floor(min / 60);
  if (hr < 24)    return `${hr} saat əvvəl`;
  const day = Math.floor(hr / 24);
  if (day < 7)    return `${day} gün əvvəl`;
  return date.toLocaleDateString('az-AZ');
}

// ── Açılış — fənn səhifəsi açılanda çağırılır ───────────────
function renderSubjectChat(courseName, subjectName, pdfFiles) {
  const container = document.getElementById('subject-chat');
  if (!container) return;

  unsubscribeSubjectChat();

  const docId = _chatDocId(courseName, subjectName);
  _chatCurrentDocId = docId;

  container.innerHTML = `
    <div class="material-leaderboard" id="material-leaderboard"></div>
    <div class="chat-header">
      <span class="chat-title"><span class="material-symbols-outlined msi">chat_bubble</span>Fənn müzakirəsi</span>
      <span class="chat-sub">Bu fənnin materialları haqqında fikrini yaz</span>
    </div>
    <div class="chat-messages" id="chat-messages">
      <div class="chat-loading">Yüklənir...</div>
    </div>
    <div class="chat-input-area" id="chat-input-area"></div>
  `;

  if (typeof renderMaterialLeaderboard === 'function') {
    renderMaterialLeaderboard(courseName, subjectName, pdfFiles || []);
  }

  refreshChatAuthState();
  _attachChatListener(docId);
}

function unsubscribeSubjectChat() {
  if (_chatUnsub) { _chatUnsub(); _chatUnsub = null; }
  _chatCurrentDocId = null;
}

// ── Giriş vəziyyətinə görə input sahəsi ─────────────────────
function refreshChatAuthState() {
  const area = document.getElementById('chat-input-area');
  if (!area) return;

  if (typeof isLoggedIn !== 'function' || !isLoggedIn()) {
    area.innerHTML = `
      <button class="chat-login-btn" onclick="openAuthModal('login')">
        Yazmaq üçün daxil ol
      </button>
    `;
    return;
  }

  area.innerHTML = `
    <div class="chat-tags" id="chat-tags"></div>
    <div class="chat-input-row">
      <input type="text" id="chat-input" maxlength="280" placeholder="Şərh yaz..." autocomplete="off">
      <button class="chat-send-btn" id="chat-send-btn" onclick="sendChatMessage()">Göndər</button>
    </div>
  `;

  const tagsWrap = document.getElementById('chat-tags');
  CHAT_TAGS.forEach(t => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chat-tag-btn';
    btn.innerHTML = `<span class="material-symbols-outlined msi">${t.icon}</span>${t.label}`;
    btn.onclick = () => _toggleChatTag(btn, t.key);
    tagsWrap.appendChild(btn);
  });

  const input = document.getElementById('chat-input');
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendChatMessage();
  });
}

function _toggleChatTag(btn, key) {
  const wasActive = btn.classList.contains('active');
  document.querySelectorAll('.chat-tag-btn').forEach(b => b.classList.remove('active'));
  if (wasActive) {
    _activeChatTag = null;
  } else {
    btn.classList.add('active');
    _activeChatTag = key;
  }
}

// ── Firestore dinləyici ──────────────────────────────────────
function _attachChatListener(docId) {
  const db   = typeof getDb === 'function' ? getDb() : null;
  const list = document.getElementById('chat-messages');
  if (!db) {
    if (list) list.innerHTML = `<div class="chat-empty">Şərhlər yüklənə bilmədi.</div>`;
    return;
  }

  const ref = db.collection('subject_chats').doc(docId)
                .collection('messages')
                .orderBy('createdAt', 'asc')
                .limit(200);

  _chatUnsub = ref.onSnapshot(snap => {
    if (_chatCurrentDocId !== docId) return; // istifadəçi başqa fənnə keçib
    const msgs = [];
    snap.forEach(doc => msgs.push({ id: doc.id, ...doc.data() }));
    _renderChatMessages(msgs);
  }, err => {
    console.warn('[chat] dinləyici xətası:', err);
    if (list) list.innerHTML = `<div class="chat-empty">Şərhlər yüklənə bilmədi.</div>`;
  });
}

function _renderChatMessages(msgs) {
  const list = document.getElementById('chat-messages');
  if (!list) return;

  if (msgs.length === 0) {
    list.innerHTML = `<div class="chat-empty">Hələ şərh yoxdur. İlk fikri sən yaz!</div>`;
    return;
  }

  const uid    = (typeof getCurrentUser === 'function' && getCurrentUser()) ? getCurrentUser().uid : null;
  const tagMap = Object.fromEntries(CHAT_TAGS.map(t => [t.key, t]));

  list.innerHTML = msgs.map(m => {
    const isMine  = !!(m.uid && uid && m.uid === uid);
    const initial = (m.name || '?').charAt(0).toUpperCase();
    const time    = m.createdAt?.toDate ? _chatTimeAgo(m.createdAt.toDate()) : '';
    const tagBadge = m.tag && tagMap[m.tag]
      ? `<span class="chat-msg-tag"><span class="material-symbols-outlined msi msi--tight">${tagMap[m.tag].icon}</span> ${tagMap[m.tag].label}</span>` : '';

    return `
      <div class="chat-msg ${isMine ? 'chat-msg-mine' : ''}">
        <span class="chat-avatar">${_chatEscape(initial)}</span>
        <div class="chat-msg-body">
          <div class="chat-msg-top">
            <span class="chat-msg-name">${_chatEscape(m.name || 'Tələbə')}</span>
            <span class="chat-msg-time">${time}</span>
          </div>
          ${tagBadge}
          <div class="chat-msg-text">${_chatEscape(m.text || '')}</div>
        </div>
        ${isMine ? `<button class="chat-msg-del" onclick="deleteChatMessage('${m.id}')" title="Sil">✕</button>` : ''}
      </div>
    `;
  }).join('');

  list.scrollTop = list.scrollHeight;
}

// ── Göndərmə / silmə ──────────────────────────────────────────
async function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const btn   = document.getElementById('chat-send-btn');
  if (!input) return;

  const text = input.value.trim();
  if (!text) { input.focus(); return; }

  const db   = typeof getDb === 'function' ? getDb() : null;
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (!db || !user || !_chatCurrentDocId) return;

  const profile = typeof getProfile === 'function' ? getProfile() : null;
  const name = profile?.name || user.displayName || user.email?.split('@')[0] || 'Tələbə';

  if (btn) btn.disabled = true;

  try {
    await db.collection('subject_chats').doc(_chatCurrentDocId)
            .collection('messages').add({
      uid:       user.uid,
      name,
      text:      text.slice(0, 280),
      tag:       _activeChatTag,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    input.value = '';
    document.querySelectorAll('.chat-tag-btn').forEach(b => b.classList.remove('active'));
    _activeChatTag = null;
    if (typeof badgeOnComment === 'function') badgeOnComment();
  } catch (e) {
    console.warn('[chat] göndərmə xətası:', e);
  } finally {
    if (btn) btn.disabled = false;
    input.focus();
  }
}

async function deleteChatMessage(msgId) {
  const db = typeof getDb === 'function' ? getDb() : null;
  if (!db || !_chatCurrentDocId) return;
  if (!confirm('Bu şərhi silmək istəyirsən?')) return;

  try {
    await db.collection('subject_chats').doc(_chatCurrentDocId)
            .collection('messages').doc(msgId).delete();
  } catch (e) {
    console.warn('[chat] silmə xətası:', e);
  }
}
