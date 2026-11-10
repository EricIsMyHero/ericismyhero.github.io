// ── Config ─────────────────────────────────────────────────────
const API = "https://ericismyhero-github-io.vercel.app/api/admin-data";

// ── State ──────────────────────────────────────────────────────
let adminKey = "";
let currentTab = "overview";
let cache = {};

let session = 0,
  loginBusy = false;
const pending = new Set();
const ERRORS = {
  unauthorized: "Admin kodu yanlışdır və ya sessiya bitib.",
  data_unavailable: "Məlumat yüklənmədi. Yenidən cəhd et.",
  service_not_configured: "Admin xidməti konfiqurasiya edilməyib.",
  invalid_plan_or_count: "Plan və ya kod sayı yanlışdır.",
  generation_incomplete:
    "Kodların yalnız bir hissəsi yaradıldı. Aşağıdakı kodları saxla.",
  invalid_section: "Bölmə tapılmadı.",
};
async function request(url, payload, key = adminKey) {
  const generation = session,
    ctrl = new AbortController();
  pending.add(ctrl);
  const timeout = setTimeout(() => ctrl.abort(), 45000);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Key": key },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    const data = await response
      .json()
      .catch(() => ({ error: "invalid_response" }));
    if (generation !== session) throw new Error("Sessiya bağlanıb.");
    if (!response.ok || data.error) {
      if (response.status === 401 && adminKey) doLogout(true);
      const error = new Error(
        ERRORS[data.error] ||
          PUSH_ERRORS[data.error] ||
          data.error ||
          "HTTP " + response.status,
      );
      error.data = data;
      throw error;
    }
    return data;
  } catch (error) {
    if (error.name === "AbortError")
      throw new Error("Sorğu dayandırıldı və ya vaxt limiti bitdi.");
    throw error;
  } finally {
    clearTimeout(timeout);
    pending.delete(ctrl);
  }
}
async function doLogin() {
  if (loginBusy) return;
  const input = document.getElementById("admin-key-input"),
    key = input.value.trim();
  if (!key) return;
  loginBusy = true;
  document.getElementById("login-submit").disabled = true;
  const err = document.getElementById("login-error");
  err.textContent = "Yoxlanılır…";
  try {
    const result = await apiFetch("all", key);
    adminKey = key;
    input.value = "";
    input.type = "password";
    document.getElementById("login-screen").hidden = true;
    document.getElementById("app").hidden = false;
    cache.overview = result;
    await showTab("overview");
    err.textContent = "";
  } catch (error) {
    err.textContent = error.message;
  } finally {
    loginBusy = false;
    document.getElementById("login-submit").disabled = false;
  }
}
function doLogout(force = false) {
  if (
    !force &&
    pushBusy &&
    !confirm(
      "Bildiriş göndərişi davam edir. Sessiyanı bağlasan, qalan cihazlara çatdırılma dayana bilər. Çıxılsın?",
    )
  )
    return;
  session++;
  pending.forEach((c) => c.abort());
  pending.clear();
  adminKey = "";
  cache = {};
  _allUsers = [];
  _allChats = [];
  _allRequests = [];
  _rqOpen = null;
  _rqTotals = null;
  pushBusy = false;
  _premiumCodes = [];
  for (const key of Object.keys(filteredRows)) delete filteredRows[key];
  for (const key of Object.keys(pages)) delete pages[key];
  document.getElementById("admin-key-input").value = "";
  document.getElementById("login-error").textContent = "";
  document.getElementById("login-screen").hidden = false;
  document.getElementById("app").hidden = true;
  document.querySelectorAll(".tab-panel").forEach((p) => {
    if (p.id === "panel-workspace") {
      p.shadowRoot?.replaceChildren();
      p.replaceChildren();
    } else
      p.querySelectorAll(
        '[id$="-content"],#push-log,#push-stats,#premium-gen-grid',
      ).forEach((el) => el.replaceChildren());
  });
  document
    .querySelectorAll("#app input,#app textarea")
    .forEach((el) => (el.value = ""));
  document
    .querySelectorAll("#app select")
    .forEach((el) => (el.selectedIndex = 0));
  document.getElementById("push-result").textContent = "";
  document.getElementById("push-email").style.display = "none";
  pushPreview();
  document.body.classList.remove("nav-open");
  document.getElementById("nav-scrim").hidden = true;
  document.getElementById("admin-key-input").focus();
}
async function apiFetch(section, key, extra = {}) {
  return request(API, { section, ...extra }, key || adminKey);
}
function dataStatus(data) {
  document.getElementById("export-btn").disabled = false;
  const partial = Object.values(data.meta || {}).some((m) => m.limited),
    notice = document.getElementById("data-notice");
  notice.hidden = !partial;
  notice.textContent = partial
    ? "Oxuma limitinə çatılıb. Saylar yüklənən qeydlərə aiddir; tam baza sayı kimi istifadə etmə."
    : "";
  document.getElementById("sync-status").textContent =
    "Son yeniləmə: " + fmtDateTime(data.fetchedAt || new Date().toISOString());
}

// ── Tab navigation ─────────────────────────────────────────────
const TAB_TITLES = {
  overview: "Ümumi baxış",
  workspace: "İş sahəsi",
  users: "İstifadəçilər",
  chats: "Fənn çatları",
  requests: "Material istəkləri",
  pdfs: "Material statistikası",
  premium: "Premium Kodlar",
  push: "Bildirişlər",
};

async function showTab(tab) {
  if (!Object.hasOwn(TAB_TITLES, tab) || !adminKey) return;
  currentTab = tab;
  document.body.classList.remove("nav-open");
  document.getElementById("nav-scrim").hidden = true;
  document.getElementById("nav-toggle").setAttribute("aria-expanded", "false");
  document.getElementById("export-btn").hidden = ![
    "users",
    "requests",
    "pdfs",
    "premium",
  ].includes(tab);
  document.getElementById("page-description").textContent =
    DESCRIPTIONS[tab] || "";
  if (tab === "workspace") {
    document.getElementById("data-notice").hidden = true;
    document.getElementById("sync-status").textContent =
      "Tapşırıqlar bu brauzerdə saxlanılır.";
  }
  document
    .querySelectorAll(".nav-item")
    .forEach((b) => b.classList.remove("active"));
  document
    .querySelectorAll(".tab-panel")
    .forEach((p) => p.classList.remove("active"));
  document.getElementById("nav-" + tab).classList.add("active");
  document.getElementById("panel-" + tab).classList.add("active");
  document.getElementById("page-title").textContent = TAB_TITLES[tab];

  if (tab === "workspace") {
    window.mountAdminWorkspace(document.getElementById("panel-workspace"));
    return;
  }
  if (cache[tab]) {
    dataStatus(cache[tab]);
    renderTab(tab, cache[tab]);
    return;
  }
  await loadTab(tab);
}

async function loadTab(tab) {
  if (tab === "push") return loadPush();
  if (tab === "requests") return loadRequestsTab();
  document.getElementById("sync-status").textContent = "Yüklənir…";
  document.getElementById("export-btn").disabled = true;
  const section = tab === "overview" ? "all" : tab;
  document.getElementById(tab + "-content").innerHTML =
    '<div class="loading"><div class="spinner"></div>Yüklənir...</div>';
  try {
    const data = await apiFetch(section);
    if (data.error) throw new Error(data.error);
    cache[tab] = data;
    if (currentTab === tab) dataStatus(data);
    renderTab(tab, data);
  } catch (e) {
    document.getElementById(tab + "-content").innerHTML =
      `<div class="loading" style="color:var(--red)">Xəta: ${esc(e.message)}</div>`;
  }
}

function refreshCurrent() {
  if (currentTab === "workspace") return;
  delete cache[currentTab];
  if (currentTab === "requests" && _rqOpen) return openRequestDetail(_rqOpen);
  loadTab(currentTab);
}

function renderTab(tab, data) {
  if (tab === "overview") renderOverview(data);
  if (tab === "users") renderUsers(data.users);
  if (tab === "chats") renderChats(data.chats);
  if (tab === "requests") renderRequests(data);
  if (tab === "pdfs") renderPdfs(data);
  if (tab === "premium") renderPremium(data.premiumCodes);
}

// ── OVERVIEW ───────────────────────────────────────────────────
function renderOverview(data) {
  const s = data.summary || {};
  const html = `
    <div class="summary-grid">
      <div class="summary-card">
        <div class="summary-val accent">${s.totalUsers || 0}</div>
        <div class="summary-lbl">Ümumi istifadəçi</div>
      </div>
      <div class="summary-card">
        <div class="summary-val green">${s.activeToday || 0}</div>
        <div class="summary-lbl">Bu gün giriş edən</div>
      </div>
      <div class="summary-card">
        <div class="summary-val yellow">${s.totalRequests || 0}</div>
        <div class="summary-lbl">Material istəkləri</div>
      </div>
      <div class="summary-card">
        <div class="summary-val red">${s.openRequests || 0}</div>
        <div class="summary-lbl">Açıq istəklər</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Ən çox açılan PDF-lər (son 500 açılış)</div>
      ${renderBarChart(data.pdfOpens || [], 8)}
    </div>

    <div class="section">
      <div class="section-title">Ən aktiv istifadəçilər (XP sırası)</div>
      ${renderTopUsersTable(data.topUsers || [])}
    </div>

    <div class="section">
      <div class="section-title">Son material istəkləri</div>
      ${renderRequestsTable((data.requests || []).slice(0, 8))}
    </div>
  `;
  document.getElementById("overview-content").innerHTML = html;
}

function renderBarChart(items, limit) {
  if (!items.length) return '<div class="loading">Məlumat yoxdur.</div>';
  const top = items.slice(0, limit);
  const max = top[0]?.count || 1;
  return `<div class="bar-chart">${top
    .map(
      (item) => `
    <div class="bar-row">
      <div class="bar-name" title="${esc(item.name)}">${esc(item.name)}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.round((item.count / max) * 100)}%"></div></div>
      <div class="bar-count">${item.count}</div>
    </div>`,
    )
    .join("")}</div>`;
}

function renderTopUsersTable(users) {
  if (!users.length) return '<div class="loading">İstifadəçi yoxdur.</div>';
  return `<div class="table-wrap"><table>
    <thead><tr>
      <th>#</th><th>Ad</th><th>Email</th><th>Fakültə</th><th>XP</th><th>Streak</th><th>Testlər</th><th>Son giriş</th>
    </tr></thead>
    <tbody>${users
      .slice(0, 10)
      .map(
        (u, i) => `
      <tr>
        <td class="td-muted">${i + 1}</td>
        <td class="td-bold">${esc(u.name)}</td>
        <td class="td-muted">${esc(u.email)}</td>
        <td class="td-muted">${esc(u.faculty || "—")}</td>
        <td><span class="badge badge-blue">${u.xp} XP</span></td>
        <td><span class="badge ${u.streak > 5 ? "badge-green" : "badge-gray"}">${u.streak} <svg class="msi" aria-hidden="true"><use href="#icon-local_fire_department"/></svg></span></td>
        <td class="td-muted">${u.totalTests || 0}</td>
        <td class="td-muted">${fmtDate(u.lastLogin)}</td>
      </tr>`,
      )
      .join("")}
    </tbody></table></div>`;
}

// ── USERS ──────────────────────────────────────────────────────
let _allUsers = [];

function renderUsers(users) {
  _allUsers = users || [];
  filterUsers();
}

function filterUsers() {
  const q = document.getElementById("users-search").value.toLowerCase();
  const filtered = _allUsers.filter((u) =>
    (u.name + u.email + u.faculty + u.major).toLowerCase().includes(q),
  );
  const sort = document.getElementById("users-sort").value;
  filtered.sort((a, b) =>
    sort === "name"
      ? a.name.localeCompare(b.name, "az")
      : sort === "xp"
        ? b.xp - a.xp
        : (Date.parse(b[sort]) || 0) - (Date.parse(a[sort]) || 0),
  );
  document.getElementById("users-content").innerHTML = paginate(
    "users",
    filtered,
    buildUsersTable,
  );
}

function buildUsersTable(users) {
  if (!users.length) return '<div class="loading">İstifadəçi tapılmadı.</div>';
  return `<div class="table-wrap"><table>
    <thead><tr>
      <th>Ad</th><th>Email</th><th>Fakültə / İxtisas</th><th>Kurs</th>
      <th>XP</th><th>Streak</th><th>Testlər</th><th>Qeydiyyat</th><th>Son giriş</th>
    </tr></thead>
    <tbody>${users
      .map(
        (u) => `
      <tr>
        <td class="td-bold">${esc(u.name)}</td>
        <td class="td-muted">${esc(u.email)}</td>
        <td class="td-muted">${esc(u.faculty || "—")} / ${esc(u.major || "—")}</td>
        <td class="td-muted">${esc(u.year || "—")}</td>
        <td><span class="badge badge-blue">${u.xp} XP</span></td>
        <td><span class="badge ${u.streak > 5 ? "badge-green" : "badge-gray"}">${u.streak} <svg class="msi" aria-hidden="true"><use href="#icon-local_fire_department"/></svg></span></td>
        <td class="td-muted">${u.totalTests || 0}</td>
        <td class="td-muted">${fmtDate(u.createdAt)}</td>
        <td class="td-muted">${fmtDate(u.lastLogin)}</td>
      </tr>`,
      )
      .join("")}
    </tbody></table></div>`;
}

// ── CHATS ──────────────────────────────────────────────────────
let _allChats = [];

function renderChats(chats) {
  _allChats = chats || [];
  filterChats();
}

function filterChats() {
  const q = document.getElementById("chats-search").value.toLowerCase();
  const filtered = _allChats
    .map((group) => ({
      ...group,
      messages: group.messages.filter((m) =>
        (m.text + m.userName + m.userEmail).toLowerCase().includes(q),
      ),
    }))
    .filter((g) => g.messages.length > 0);
  document.getElementById("chats-content").innerHTML = buildChatsHtml(filtered);
}

function buildChatsHtml(chats) {
  if (!chats.length) return '<div class="loading">Chat tapılmadı.</div>';
  return chats
    .map(
      (group, gi) => `
    <div class="chat-subject-group">
      <button type="button" class="chat-subject-header" data-chat-group="${gi}" aria-expanded="false">
        <span><svg class="msi" aria-hidden="true"><use href="#icon-chat_bubble"/></svg> ${esc(group.subject)}</span>
        <span class="badge badge-blue">${group.count} mesaj</span>
      </button>
      <div class="chat-msg-list" id="chatgroup-${gi}">
        ${group.messages
          .map(
            (m) => `
          <div class="chat-msg ${m.deleted ? "deleted" : ""}">
            <div class="chat-avatar">${esc((m.userName || "?")[0].toUpperCase())}</div>
            <div class="chat-msg-body">
              <div class="chat-msg-meta">
                <strong>${esc(m.userName)}</strong>
                · ${esc(m.userEmail)}
                · ${fmtDate(m.ts)}
                ${m.deleted ? '· <span style="color:var(--red)">Silindi</span>' : ""}
              </div>
              <div class="chat-msg-text">${esc(m.text)}</div>
            </div>
          </div>`,
          )
          .join("")}
      </div>
    </div>`,
    )
    .join("");
}

function toggleChatGroup(gi) {
  const el = document.getElementById("chatgroup-" + gi);
  el.classList.toggle("open");
  document
    .querySelector(`[data-chat-group="${gi}"]`)
    ?.setAttribute("aria-expanded", String(el.classList.contains("open")));
}

// ── REQUESTS ───────────────────────────────────────────────────
// Siyahı və təfərrüat serverdən (push funksiyası) gəlir: cavab sayı, fayllar, bildiriş nəticələri
let _allRequests = [];
let _rqTotals = null;
let _rqOpen = null; // açıq istəyin id-si (null — siyahı)

async function loadRequestsTab() {
  const el = document.getElementById("requests-content");
  el.innerHTML =
    '<div class="loading"><div class="spinner"></div>Yüklənir...</div>';
  try {
    const d = await pushApi({ action: "admin-requests" });
    if ((d.requests || []).length >= 500)
      d.meta = { requests: { limited: true } };
    cache.requests = d;
    if (currentTab === "requests") dataStatus(d);
    renderRequests(d);
  } catch (e) {
    el.innerHTML = `<div class="loading" style="color:var(--red)">Xəta: ${esc(e.message)}</div>`;
  }
}

function renderRequests(data) {
  _allRequests = (data && data.requests) || [];
  _rqTotals = (data && data.totals) || null;
  _rqOpen = null;
  document.getElementById("requests-top").style.display = "";
  filterRequests();
}

function filterRequests() {
  if (_rqOpen) return;
  const q = document.getElementById("requests-search").value.toLowerCase();
  const status = document.getElementById("requests-status").value;
  const filtered = _allRequests.filter(
    (r) =>
      (status === "all" || r.status === status) &&
      (r.text + " " + r.name + " " + r.subject + " " + r.course)
        .toLowerCase()
        .includes(q),
  );
  document.getElementById("requests-content").innerHTML = paginate(
    "requests",
    filtered,
    (rows) => buildRequestsTable(rows, true),
  );
}

function buildRequestsTable(requests, filtered) {
  const totals =
    !filtered && _rqTotals
      ? `
    <div class="summary-grid">
      <div class="summary-card"><div class="summary-val accent">${_rqTotals.requests}</div><div class="summary-lbl">İstək</div></div>
      <div class="summary-card"><div class="summary-val yellow">${_rqTotals.open}</div><div class="summary-lbl">Açıq</div></div>
      <div class="summary-card"><div class="summary-val green">${_rqTotals.messages}</div><div class="summary-lbl">Cavab (mesaj)</div></div>
    </div>`
      : "";
  if (!requests.length)
    return totals + '<div class="loading">İstək tapılmadı.</div>';
  return (
    totals +
    `<div class="table-wrap"><table>
    <thead><tr>
      <th>İstək</th><th>İstifadəçi</th><th>Cavab</th><th>Upvote</th><th>Status</th><th>Son fəaliyyət</th><th></th>
    </tr></thead>
    <tbody>${requests
      .map(
        (r) => `
      <tr>
        <td class="td-bold"><button class="rq-link" data-open-request="${esc(r.id)}">${esc(r.text.length > 90 ? r.text.slice(0, 90) + "…" : r.text)}</button>
          ${r.course || r.subject ? `<br><small class="td-muted">${esc([r.course, r.subject].filter(Boolean).join(" · "))}</small>` : ""}</td>
        <td class="td-muted">${esc(r.name)}</td>
        <td><span class="badge ${r.msgCount ? "badge-green" : "badge-gray"}">${r.msgCount}</span></td>
        <td><span class="badge badge-blue">▲ ${r.upvotes}</span></td>
        <td><span class="badge ${r.status === "fulfilled" ? "badge-green" : "badge-yellow"}">${r.status === "closed" ? "Bağlanıb" : r.status === "fulfilled" ? "Tapıldı" : "Açıq"}</span></td>
        <td class="td-muted">${fmtDateTime(r.lastMessageAt || r.createdAt)}</td>
        <td><button class="rq-btn" data-open-request="${esc(r.id)}"><svg class="msi" aria-hidden="true"><use href="#icon-forum"/></svg>Bax</button></td>
      </tr>`,
      )
      .join("")}
    </tbody></table></div>`
  );
}

// Ümumi baxışdakı qısa siyahı (admin-data cavabı: userName, userEmail, upvotes, found)
function renderRequestsTable(requests) {
  if (!requests.length) return '<div class="loading">İstək tapılmadı.</div>';
  return `<div class="table-wrap"><table>
    <thead><tr>
      <th>İstək</th><th>İstifadəçi</th><th>Upvote</th><th>Status</th><th>Tarix</th>
    </tr></thead>
    <tbody>${requests
      .map(
        (r) => `
      <tr>
        <td class="td-bold">${esc(r.text)}</td>
        <td class="td-muted">${esc(r.userName)} <br><small>${esc(r.userEmail)}</small></td>
        <td><span class="badge badge-blue">▲ ${r.upvotes}</span></td>
        <td><span class="badge ${r.found ? "badge-green" : "badge-yellow"}">${r.status === "closed" ? "Bağlanıb" : r.found ? "Tapıldı" : "Açıq"}</span></td>
        <td class="td-muted">${fmtDate(r.createdAt)}</td>
      </tr>`,
      )
      .join("")}
    </tbody></table></div>`;
}

function rqFilesHtml(atts) {
  const list = (atts || []).filter(
    (a) => a && /^https:\/\//i.test(a.url || ""),
  );
  if (!list.length) return "";
  return `<div class="rq-files">${list.map((a) => `<a class="rq-file" href="${esc(a.url)}" target="_blank" rel="noopener noreferrer"><svg class="msi" aria-hidden="true"><use href="#icon-attach_file"/></svg>${esc(a.name || "fayl")} <small>${esc(fmtSize(a.size))}</small></a>`).join("")}</div>`;
}

// Bir mesaj üçün kimlərə bildiriş getdi və nəticəsi nə oldu
function rqNotifsHtml(list) {
  if (!list.length)
    return `<div class="rq-notifs"><div class="rq-notifs-title">Bildirişlər</div><div class="rq-empty-note">Bu mesaj üçün bildiriş göndərilməyib (alıcı yoxdur və ya istək sahibi özü yazıb və cavab verən yoxdur).</div></div>`;
  return `<div class="rq-notifs"><div class="rq-notifs-title">Bildirişlər (${list.length})</div>${list
    .map((n) => {
      const errs = Object.entries(n.errors || {})
        .map(([k, v]) => `${esc(k)}: ${esc(v)}`)
        .join(", ");
      let st;
      if (!n.devices)
        st = '<span class="badge badge-gray">Aktiv cihaz yoxdur</span>';
      else if (n.sent && !n.failed)
        st = `<span class="badge badge-green">Çatdı ${n.sent}/${n.devices}</span>`;
      else if (n.sent)
        st = `<span class="badge badge-yellow">Qismən ${n.sent}/${n.devices}</span>`;
      else st = `<span class="badge badge-red">Çatmadı 0/${n.devices}</span>`;
      return `<div class="rq-notif">
        <svg class="msi" aria-hidden="true"><use href="#icon-notifications"/></svg>
        <span class="to">${esc(n.toName || "—")}</span><small>${esc(n.toEmail || "")}</small>
        <span class="badge ${n.recipientRole === "owner" ? "badge-blue" : "badge-gray"}">${n.recipientRole === "owner" ? "istək sahibi" : "əvvəl yazan"}</span>
        ${st}
        ${n.removed ? `<span class="badge badge-gray">köhnə token silindi: ${n.removed}</span>` : ""}
        <small>${fmtDateTime(n.createdAt)}</small>
        ${errs ? `<div class="why">Xəta: ${errs}</div>` : ""}
        ${n.title || n.body ? `<div class="td-muted" style="flex-basis:100%">“${esc(n.title)}” — ${esc(n.body)}</div>` : ""}
      </div>`;
    })
    .join("")}</div>`;
}

async function openRequestDetail(id) {
  _rqOpen = id;
  document.getElementById("requests-top").style.display = "none";
  const el = document.getElementById("requests-content");
  el.innerHTML =
    '<div class="loading"><div class="spinner"></div>Yüklənir...</div>';
  try {
    const d = await pushApi({ action: "admin-request", requestId: id });
    if (_rqOpen !== id || currentTab !== "requests") return;
    const r = d.request;
    const byMsg = {};
    const orphan = [];
    for (const n of d.notifications || []) {
      if (n.messageId && d.messages.some((m) => m.id === n.messageId))
        (byMsg[n.messageId] = byMsg[n.messageId] || []).push(n);
      else orphan.push(n);
    }
    el.innerHTML = `
      <div class="rq-top"><button class="rq-btn" data-close-request><svg class="msi" aria-hidden="true"><use href="#icon-arrow_back"/></svg>Siyahıya qayıt</button>
        <button class="rq-btn" data-open-request="${esc(r.id)}"><svg class="msi" aria-hidden="true"><use href="#icon-refresh"/></svg>Yenilə</button></div>
      <div class="rq-card">
        <div class="rq-card-head">
          <span class="rq-who">${esc(r.name || "—")}<small>${esc(r.email)}</small></span>
          <span class="badge badge-blue">istək sahibi</span>
          <span class="badge ${r.status === "fulfilled" ? "badge-green" : "badge-yellow"}">${r.status === "closed" ? "Bağlanıb" : r.status === "fulfilled" ? "Tapıldı" : "Açıq"}</span>
          <span class="grow"></span>
          <span class="td-muted">${fmtDateTime(r.createdAt)}</span>
          <button class="rq-btn danger" data-delete-request="${esc(r.id)}"><svg class="msi" aria-hidden="true"><use href="#icon-delete"/></svg>İstəyi sil</button>
        </div>
        <div class="rq-text">${esc(r.text)}</div>
        <div class="rq-meta">
          ${r.course ? `<span class="badge badge-gray">${esc(r.course)}</span>` : ""}${r.subject ? `<span class="badge badge-gray">${esc(r.subject)}</span>` : ""}
          <span class="badge badge-blue">▲ ${r.upvotes}</span><span class="badge badge-gray">${d.messages.length} mesaj</span>
        </div>
      </div>
      <div class="rq-h">Yazışma (${d.messages.length})</div>
      ${
        d.messages.length
          ? d.messages
              .map(
                (m) => `
        <div class="rq-card">
          <div class="rq-card-head">
            <span class="rq-who">${esc(m.name || "—")}<small>${esc(m.email)}</small></span>
            <span class="badge ${m.role === "owner" ? "badge-blue" : "badge-gray"}">${m.role === "owner" ? "istək sahibi" : "cavab verən"}</span>
            <span class="grow"></span>
            <span class="td-muted">${fmtDateTime(m.createdAt)}</span>
            <button class="rq-btn danger" data-delete-message="${esc(m.id)}" data-request="${esc(r.id)}"><svg class="msi" aria-hidden="true"><use href="#icon-delete"/></svg>Sil</button>
          </div>
          ${m.text ? `<div class="rq-text">${esc(m.text)}</div>` : ""}
          ${rqFilesHtml(m.attachments)}
          ${rqNotifsHtml(byMsg[m.id] || [])}
        </div>`,
              )
              .join("")
          : '<div class="loading">Hələ cavab yoxdur.</div>'
      }
      ${orphan.length ? `<div class="rq-h">Silinmiş mesajlar üçün göndərilənlər</div><div class="rq-card">${rqNotifsHtml(orphan)}</div>` : ""}`;
  } catch (e) {
    if (_rqOpen !== id || currentTab !== "requests") return;
    el.innerHTML = `<div class="rq-top"><button class="rq-btn" data-close-request><svg class="msi" aria-hidden="true"><use href="#icon-arrow_back"/></svg>Siyahıya qayıt</button></div>
      <div class="loading" style="color:var(--red)">Xəta: ${esc(e.message)}</div>`;
  }
}

function closeRequestDetail() {
  _rqOpen = null;
  if (cache.requests) renderRequests(cache.requests);
  else loadRequestsTab();
}

async function adminDeleteMessage(reqId, msgId) {
  if (
    !confirm(
      "Bu mesaj (və əlavə faylları) silinsin? Geri qaytarmaq mümkün deyil.",
    )
  )
    return;
  try {
    await pushApi({
      action: "admin-msg-delete",
      requestId: reqId,
      messageId: msgId,
    });
    delete cache.requests;
    delete cache.overview;
    await openRequestDetail(reqId);
  } catch (e) {
    alert("Xəta: " + e.message);
  }
}

async function adminDeleteRequest(reqId) {
  if (
    !confirm(
      "Bu istək, bütün cavablar və faylları silinsin? Geri qaytarmaq mümkün deyil.",
    )
  )
    return;
  try {
    await pushApi({ action: "admin-req-delete", requestId: reqId });
    delete cache.requests;
    delete cache.overview;
    _rqOpen = null;
    await loadRequestsTab();
  } catch (e) {
    alert("Xəta: " + e.message);
  }
}

// ── PDFS ───────────────────────────────────────────────────────
function renderPdfs(data) {
  const opens = data.pdfOpens || [];
  const ratings = data.pdfRatings || [];
  const html = `
    <div class="section">
      <div class="section-title">Ən çox açılan PDF-lər</div>
      ${renderBarChart(opens, 20)}
    </div>
    <div class="section">
      <div class="section-title">PDF reytinqləri (səs sayına görə)</div>
      ${
        ratings.length
          ? `<div class="table-wrap"><table>
        <thead><tr><th>PDF ID</th><th>Ortalama reytinq</th><th>Səs sayı</th></tr></thead>
        <tbody>${ratings
          .map(
            (r) => `
          <tr>
            <td class="td-bold">${esc(r.id)}</td>
            <td><span class="badge badge-yellow">${Number(r.avgRating).toFixed(1)} <svg class="msi" aria-hidden="true"><use href="#icon-star"/></svg></span></td>
            <td class="td-muted">${r.totalVotes} səs</td>
          </tr>`,
          )
          .join("")}
        </tbody></table></div>`
          : '<div class="loading">Reytinq yoxdur.</div>'
      }
    </div>
  `;
  document.getElementById("pdfs-content").innerHTML = html;
}

// ── PREMIUM KODLAR ────────────────────────────────────────────
let _premiumCodes = [];
const PREMIUM_PLAN_INFO = {
  "7d": { name: "7 günlük", price: "2.49₼" },
  "15d": { name: "15 günlük", price: "4.99₼" },
  "32d": { name: "32 günlük", price: "9.99₼" },
  lifetime: { name: "Ömürlük", price: "19.99₼" },
};

function renderPremium(codes) {
  codes = codes || [];
  _premiumCodes = codes;
  document.getElementById("premium-gen-grid").innerHTML = Object.entries(
    PREMIUM_PLAN_INFO,
  )
    .map(
      ([plan, info]) => `
      <div class="premium-plan-card">
        <div class="premium-plan-name">${info.name}</div>
        <div class="premium-plan-price">${info.price}</div>
        <input type="number" id="premium-count-${plan}" value="1" min="1" max="50">
        <button data-generate="${plan}">
          <svg class="msi" aria-hidden="true"><use href="#icon-add_circle"/></svg>Kod yarat
        </button>
        <div class="premium-plan-result" id="premium-result-${plan}"></div>
      </div>
    `,
    )
    .join("");

  filterPremium(codes);
}

let premiumBusy = false;
async function generatePremiumCode(plan) {
  if (premiumBusy) return;
  premiumBusy = true;
  const result = document.getElementById(`premium-result-${plan}`);
  const buttons = document.querySelectorAll("[data-generate]");
  buttons.forEach((b) => (b.disabled = true));
  try {
    const count = Number(
      document.getElementById(`premium-count-${plan}`).value,
    );
    if (!Number.isInteger(count) || count < 1 || count > 50)
      throw new Error("Kod sayı 1–50 aralığında olmalıdır.");
    result.textContent = "Yaradılır…";
    const data = await apiFetch("premium", null, {
      action: "generate",
      plan,
      count,
    });
    result.innerHTML = data.codes.map((c) => `<code>${esc(c)}</code>`).join("");
    delete cache.premium;
    try {
      const fresh = await apiFetch("premium");
      cache.premium = fresh;
      _premiumCodes = fresh.premiumCodes || [];
      filterPremium();
    } catch {}
  } catch (error) {
    result.textContent = error.message;
    for (const code of error.data?.codes || []) {
      const el = document.createElement("code");
      el.textContent = code;
      result.append(el);
    }
    delete cache.premium;
  } finally {
    premiumBusy = false;
    buttons.forEach((b) => (b.disabled = false));
  }
}

function filterPremium(codes = _premiumCodes) {
  const q = document.getElementById("premium-search").value.toLowerCase(),
    status = document.getElementById("premium-status").value;
  const rows = codes.filter(
    (c) =>
      (status === "all" || c.status === status) &&
      [c.code, c.plan, c.redeemedByUid].join(" ").toLowerCase().includes(q),
  );
  document.getElementById("premium-content").innerHTML = paginate(
    "premium",
    rows,
    buildPremiumTable,
  );
}

function buildPremiumTable(codes) {
  if (!codes.length) return '<div class="loading">Hələ kod yaradılmayıb.</div>';
  return `<div class="table-wrap"><table>
    <thead><tr>
      <th>Kod</th><th>Plan</th><th>Status</th><th>Yaradılıb</th><th>İstifadə olunub</th>
    </tr></thead>
    <tbody>${codes
      .map(
        (c) => `
      <tr>
        <td class="td-bold">${esc(c.code)}</td>
        <td class="td-muted">${(PREMIUM_PLAN_INFO[c.plan] || {}).name || esc(c.plan)}</td>
        <td><span class="badge ${c.status === "used" ? "badge-gray" : "badge-green"}">${c.status === "used" ? "İstifadə olunub" : "Boşdur"}</span></td>
        <td class="td-muted">${fmtDate(c.createdAt)}</td>
        <td class="td-muted">${c.redeemedAt ? fmtDate(c.redeemedAt) : "—"}</td>
      </tr>`,
      )
      .join("")}
    </tbody></table></div>`;
}

// ── PUSH BİLDİRİŞLƏR ──────────────────────────────────────────
const PUSH_API = API.replace("/admin-data", "/push");
const PUSH_ERRORS = {
  unauthorized: "Admin kodu yanlışdır.",
  push_disabled:
    "Push aktiv deyil: Vercel-də FIREBASE_VAPID_KEY və FIREBASE_SERVICE_ACCOUNT təyin edilməlidir.",
  title_and_body_required: "Başlıq və mətn boş ola bilməz.",
  invalid_url:
    'Link yanlışdır: "#/marşrut", "/yol" və ya unecstudentshub.com / t.me linki olmalıdır.',
  invalid_audience: "Auditoriya yanlışdır.",
  invalid_cursor: "Davam kursoru yanlışdır — göndərişi yenidən başlat.",
  user_not_found: "Bu email ilə istifadəçi tapılmadı.",
  request_not_found: "İstək tapılmadı (silinmiş ola bilər).",
  message_not_found: "Mesaj tapılmadı (silinmiş ola bilər).",
};
let pushBusy = false;

async function pushApi(payload) {
  return request(PUSH_API, payload);
}

async function loadPush() {
  const el = document.getElementById("push-stats");
  el.innerHTML =
    '<div class="loading"><div class="spinner"></div>Yüklənir...</div>';
  try {
    const d = await pushApi({ action: "stats" });
    el.innerHTML = `
      <div class="summary-card"><div class="summary-val accent">${d.total}</div><div class="summary-lbl">Abunəçi cihaz</div></div>
      <div class="summary-card"><div class="summary-val green">${d.loggedIn}</div><div class="summary-lbl">Hesabla bağlı</div></div>
      <div class="summary-card"><div class="summary-val">${d.az}</div><div class="summary-lbl">Azərbaycan dili</div></div>
      <div class="summary-card"><div class="summary-val">${d.en}</div><div class="summary-lbl">English</div></div>`;
  } catch (e) {
    el.innerHTML = `<div class="loading" style="color:var(--red)">${esc(e.message)}</div>`;
  }
  pushPreview();
  loadPushLog();
}

// Son göndərişlər: əl ilə göndərilənlər + istək cavablarına görə avtomatik gedənlər
async function loadPushLog() {
  const el = document.getElementById("push-log");
  try {
    const d = await pushApi({ action: "admin-push-log", limit: 60 });
    const items = d.items || [];
    if (!items.length) {
      el.innerHTML = '<div class="loading">Hələ göndəriş yoxdur.</div>';
      return;
    }
    el.innerHTML = `<div class="table-wrap"><table>
      <thead><tr><th>Tarix</th><th>Növ</th><th>Bildiriş</th><th>Kimə</th><th>Nəticə</th></tr></thead>
      <tbody>${items
        .map((i) => {
          const auto = i.kind === "request-message";
          const res = i.total
            ? `<span class="badge ${i.sent && !i.failed ? "badge-green" : i.sent ? "badge-yellow" : "badge-red"}">${i.sent}/${i.total}</span>`
            : '<span class="badge badge-gray">cihaz yox</span>';
          const extra = [
            i.failed ? "uğursuz " + i.failed : "",
            i.removed ? "silindi " + i.removed : "",
          ]
            .filter(Boolean)
            .join(", ");
          const errs = Object.entries(i.errors || {})
            .map(([k, v]) => k + ": " + v)
            .join(", ");
          return `<tr>
          <td class="td-muted">${fmtDateTime(i.createdAt)}</td>
          <td><span class="badge ${auto ? "badge-blue" : "badge-gray"}">${auto ? "İstək cavabı" : "Əl ilə"}</span></td>
          <td><span class="td-bold">${esc(i.title)}</span><br><small class="td-muted">${esc(i.body)}</small></td>
          <td class="td-muted">${
            auto
              ? `${esc(i.fromName || "—")} → <b>${esc(i.toName || "—")}</b>${i.requestId ? `<br><button class="rq-link" data-log-request="${esc(i.requestId)}">İstəyə bax</button>` : ""}`
              : esc(
                  {
                    all: "Hamı",
                    az: "Azərbaycan dili",
                    en: "English",
                    user: "Konkret istifadəçi",
                  }[i.audience] ||
                    i.audience ||
                    "—",
                )
          }</td>
          <td>${res}${extra ? `<br><small class="td-muted">${esc(extra)}</small>` : ""}${errs ? `<br><small style="color:var(--red)">${esc(errs)}</small>` : ""}</td>
        </tr>`;
        })
        .join("")}</tbody></table></div>`;
  } catch (e) {
    el.innerHTML = `<div class="loading" style="color:var(--red)">${esc(e.message)}</div>`;
  }
}

async function openRequestFromLog(id) {
  await showTab("requests");
  openRequestDetail(id);
}

function pushPreview() {
  const t = document.getElementById("push-title").value;
  const b = document.getElementById("push-body").value;
  document.getElementById("push-title-count").textContent = t.length + "/80";
  document.getElementById("push-body-count").textContent = b.length + "/240";
  document.getElementById("push-prev-title").textContent =
    t.trim() || "UNEC Students Hub";
  document.getElementById("push-prev-body").textContent =
    b.trim() || "Mətn burada görünəcək";
}

function pushAudienceChanged() {
  const user = document.getElementById("push-audience").value === "user";
  document.getElementById("push-email").style.display = user ? "block" : "none";
}

function pushSetBusy(on) {
  pushBusy = on;
  document.getElementById("push-send-btn").disabled = on;
  document.getElementById("push-count-btn").disabled = on;
  document
    .querySelectorAll(
      "#panel-push input,#panel-push textarea,#panel-push select",
    )
    .forEach((el) => (el.disabled = on));
}

function pushResult(text, kind) {
  const out = document.getElementById("push-result");
  out.textContent = text;
  out.className = "push-result" + (kind ? " " + kind : "");
}

// dryRun=true → yalnız alıcı sayını göstərir; false → sayı göstərir, təsdiq alır və göndərir
async function pushSend(dryRun) {
  if (pushBusy) return;
  const payload = {
    action: "send",
    title: document.getElementById("push-title").value.trim(),
    body: document.getElementById("push-body").value.trim(),
    url: document.getElementById("push-url").value.trim(),
    audience: document.getElementById("push-audience").value,
    email: document.getElementById("push-email").value.trim(),
  };
  if (!payload.title || !payload.body)
    return pushResult("Başlıq və mətn boş ola bilməz.", "err");
  if (payload.audience === "user" && !payload.email)
    return pushResult("İstifadəçinin email ünvanını yaz.", "err");

  pushSetBusy(true);
  pushResult("Yoxlanılır...");
  const agg = { sent: 0, failed: 0, removed: 0, errors: {} };
  let after = null,
    last = {};
  try {
    const dry = await pushApi({ ...payload, dryRun: true });
    if (dryRun) return pushResult(`Bu bildiriş ${dry.total} cihaza gedəcək.`);
    if (!dry.total)
      return pushResult(
        "Alıcı yoxdur: bu auditoriyada abunəçi cihaz tapılmadı.",
        "err",
      );
    if (
      !confirm(
        `"${payload.title}"\n\nBu bildiriş ${dry.total} cihaza göndərilsin? Geri qaytarmaq mümkün deyil.`,
      )
    )
      return pushResult("Ləğv edildi.");

    // Server bir sorğuda ~8 san. işləyir; çox cihaz varsa `cursor` qaytarır və biz qalanlara davam edirik (təkrar getmir).
    for (let round = 0; round < 500; round++) {
      pushResult(
        `Göndərilir... ${agg.sent + agg.failed + agg.removed} / ${dry.total}  (pəncərəni bağlama)`,
      );
      last = await pushApi({ ...payload, dryRun: false, after });
      agg.sent += last.sent;
      agg.failed += last.failed;
      agg.removed += last.removed;
      for (const [k, v] of Object.entries(last.errors || {}))
        agg.errors[k] = (agg.errors[k] || 0) + v;
      after = last.cursor || null;
      if (!after || !last.attempted) break;
    }
    const done = agg.sent + agg.failed + agg.removed;
    const lines = [`Göndərildi: ${agg.sent} / ${dry.total}`];
    if (agg.removed) lines.push(`Köhnəlmiş token silindi: ${agg.removed}`);
    if (agg.failed)
      lines.push(
        `Uğursuz: ${agg.failed} (${Object.entries(agg.errors)
          .map(([k, v]) => k + ": " + v)
          .join(", ")})`,
      );
    if (agg.errors.PERMISSION_DENIED)
      lines.push(
        "İcazə xətası: Firebase Cloud Messaging API (V1) aktivdirmi və service account-un FCM icazəsi varmı? (PUSH-SETUP.md, 2-ci bölmə)",
      );
    if (last.stopped || after)
      lines.push(
        `Diqqət: göndəriş dayandırıldı, ${Math.max(0, dry.total - done)} cihaza çatılmadı. Eyni bildirişi təkrar göndərmə — artıq alanlara da gedər.`,
      );
    pushResult(
      lines.join("\n"),
      agg.sent > 0 && !last.stopped && !after ? "ok" : "err",
    );
    loadPush();
  } catch (e) {
    const done = agg.sent + agg.failed + agg.removed;
    pushResult(
      "Xəta: " +
        e.message +
        (done
          ? `\nXətadan əvvəl ${done} cihaza göndərilmişdi — eyni bildirişi təkrar göndərmə.`
          : ""),
      "err",
    );
  } finally {
    pushSetBusy(false);
  }
}

// ── Helpers ────────────────────────────────────────────────────
function esc(str) {
  return String(str ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}

function fmtDateTime(iso) {
  if (!iso || !Number.isFinite(Date.parse(iso))) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: "Asia/Baku",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtSize(b) {
  if (!(b > 0)) return "";
  return b >= 1048576
    ? (b / 1048576).toFixed(1).replace(/\.0$/, "") + " MB"
    : Math.max(1, Math.round(b / 1024)) + " KB";
}

function fmtDate(iso) {
  return fmtDateTime(iso).split(",")[0];
}

const DESCRIPTIONS = {
  overview: "Göstəricilər və son fəaliyyət",
  workspace: "Postlar, buraxılışlar və texniki işlərin koordinasiyası",
  users: "Hesablar və tədris məlumatları",
  requests: "Yazışmalar, fayllar və bildiriş nəticələri",
  chats: "Fənlər üzrə müzakirələr",
  pdfs: "Material açılışları və reytinqlər",
  premium: "Kod yaratma və istifadə tarixçəsi",
  push: "Göndəriş və çatdırılma tarixçəsi",
};
const pages = {},
  filteredRows = {};
function paginate(key, items, render) {
  filteredRows[key] = items;
  const size = 25,
    max = Math.max(1, Math.ceil(items.length / size));
  pages[key] = Math.min(pages[key] || 1, max);
  const start = (pages[key] - 1) * size;
  return (
    render(items.slice(start, start + size)) +
    `<div class="pagination"><span>${items.length ? start + 1 : 0}–${Math.min(start + size, items.length)} / ${items.length}</span><button type="button" data-page="${key}" data-direction="-1" ${pages[key] === 1 ? "disabled" : ""}>Əvvəlki</button><span>${pages[key]} / ${max}</span><button type="button" data-page="${key}" data-direction="1" ${pages[key] === max ? "disabled" : ""}>Növbəti</button></div>`
  );
}
function csvCell(value) {
  const text = String(value ?? "");
  return (
    '"' +
    (/^(?:\s*[=+\-@]|[\t\r])/.test(text) ? "'" : "") +
    text.replace(/"/g, '""') +
    '"'
  );
}
function exportCsv() {
  const data = cache[currentTab],
    rows =
      filteredRows[currentTab] ||
      (currentTab === "pdfs"
        ? data?.pdfRatings
        : currentTab === "premium"
          ? data?.premiumCodes
          : []);
  if (!rows?.length) return alert("İxrac üçün qeyd yoxdur.");
  const keys = Object.keys(rows[0]).filter(
    (k) => !["messages", "attachments"].includes(k),
  );
  const csv =
    "\uFEFF" +
    [
      keys,
      ...rows.map((row) =>
        keys.map((k) =>
          typeof row[k] === "object" ? JSON.stringify(row[k]) : row[k],
        ),
      ),
    ]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n");
  const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    ),
    a = document.createElement("a");
  a.href = url;
  a.download = `unec-admin-${currentTab}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function toggleNav(open) {
  document.body.classList.toggle("nav-open", open);
  document.getElementById("nav-scrim").hidden = !open;
  document
    .getElementById("nav-toggle")
    .setAttribute("aria-expanded", String(open));
  if (open) document.querySelector(".nav-item.active").focus();
  else document.getElementById("nav-toggle").focus();
}
function applyAdminTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.getElementById("theme-btn").textContent =
    theme === "light" ? "Tünd görünüş" : "Açıq görünüş";
  try {
    localStorage.setItem("unec_admin_theme", theme);
  } catch {}
}
try {
  applyAdminTheme(
    localStorage.getItem("unec_admin_theme") === "light" ? "light" : "dark",
  );
} catch {
  applyAdminTheme("dark");
}
document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  doLogin();
});
document.getElementById("toggle-key").addEventListener("click", (e) => {
  const input = document.getElementById("admin-key-input"),
    show = input.type === "password";
  input.type = show ? "text" : "password";
  e.target.textContent = show ? "Gizlət" : "Göstər";
  e.target.setAttribute("aria-pressed", String(show));
});
document
  .getElementById("nav-toggle")
  .addEventListener("click", () =>
    toggleNav(!document.body.classList.contains("nav-open")),
  );
document
  .getElementById("nav-scrim")
  .addEventListener("click", () => toggleNav(false));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && document.body.classList.contains("nav-open"))
    toggleNav(false);
});
document
  .getElementById("logout-btn")
  .addEventListener("click", () => doLogout());
document
  .getElementById("theme-btn")
  .addEventListener("click", () =>
    applyAdminTheme(
      document.documentElement.dataset.theme === "light" ? "dark" : "light",
    ),
  );
document
  .getElementById("refresh-btn")
  .addEventListener("click", refreshCurrent);
document.getElementById("export-btn").addEventListener("click", exportCsv);
for (const key of ["users", "requests", "chats"])
  document.getElementById(key + "-search").addEventListener("input", () => {
    pages[key] = 1;
    ({ users: filterUsers, requests: filterRequests, chats: filterChats })[
      key
    ]();
  });
document.getElementById("requests-status").addEventListener("change", () => {
  pages.requests = 1;
  filterRequests();
});
document.getElementById("users-sort").addEventListener("change", () => {
  pages.users = 1;
  filterUsers();
});
for (const id of ["push-title", "push-body"])
  document.getElementById(id).addEventListener("input", pushPreview);
document
  .getElementById("push-audience")
  .addEventListener("change", pushAudienceChanged);
document
  .getElementById("push-count-btn")
  .addEventListener("click", () => pushSend(true));
document
  .getElementById("push-send-btn")
  .addEventListener("click", () => pushSend(false));
document.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.tab) {
    showTab(b.dataset.tab);
    return;
  }
  if (b.dataset.page) {
    pages[b.dataset.page] =
      (pages[b.dataset.page] || 1) + Number(b.dataset.direction);
    if (b.dataset.page === "users") filterUsers();
    else if (b.dataset.page === "requests") filterRequests();
    else if (b.dataset.page === "premium") filterPremium();
    return;
  }
  if (b.dataset.chatGroup) toggleChatGroup(b.dataset.chatGroup);
  if (b.hasAttribute("data-close-request")) closeRequestDetail();
  if (b.dataset.openRequest) openRequestDetail(b.dataset.openRequest);
  if (b.dataset.logRequest) openRequestFromLog(b.dataset.logRequest);
  if (b.dataset.deleteRequest) adminDeleteRequest(b.dataset.deleteRequest);
  if (b.dataset.deleteMessage)
    adminDeleteMessage(b.dataset.request, b.dataset.deleteMessage);
  if (b.dataset.generate) generatePremiumCode(b.dataset.generate);
});
window.addEventListener("beforeunload", (e) => {
  if (pushBusy || premiumBusy) {
    e.preventDefault();
    e.returnValue = "";
  }
});

document.getElementById("premium-search").addEventListener("input", () => {
  pages.premium = 1;
  filterPremium();
});
document.getElementById("premium-status").addEventListener("change", () => {
  pages.premium = 1;
  filterPremium();
});
