/* --modal-- */

function openModal(build) {
  var box = $('mbox');
  box.innerHTML = '';
  build(box);
  $('modal').classList.add('show');
}

function closeModal() { $('modal').classList.remove('show'); }

function addButtons(box, items) {
  var row = document.createElement('div');
  row.className = 'mrow';
  items.forEach(function (it) {
    var b = document.createElement('button');
    b.className = 'btn ' + (it.cls || '');
    b.textContent = it.label;
    b.onclick = it.fn;
    row.appendChild(b);
  });
  box.appendChild(row);
}

function confirmBox(title, text, onOk) {
  openModal(function (box) {
    var h = document.createElement('h3');
    h.textContent = title;
    var p = document.createElement('p');
    p.textContent = text;
    box.appendChild(h);
    box.appendChild(p);
    addButtons(box, [
      { label: 'Batal', cls: 'ghost', fn: closeModal },
      { label: 'Hapus', cls: 'danger', fn: function () { closeModal(); onOk(); } }
    ]);
  });
}

function viewBox(p) {
  openModal(function (box) {
    var h = document.createElement('h3');
    h.textContent = p.title;
    var pre = document.createElement('pre');
    pre.textContent = p.code;
    box.appendChild(h);
    box.appendChild(pre);
    addButtons(box, [
      { label: 'Tutup', cls: 'ghost', fn: closeModal },
      { label: 'Salin', fn: function () { copyCode(p.code); } }
    ]);
  });
}

/* --render-overview-- */

function renderOverview() {
  var list = loadPastes();
  var bytes = list.reduce(function (n, p) { return n + p.code.length; }, 0);
  var counts = {};
  list.forEach(function (p) { counts[p.lang] = (counts[p.lang] || 0) + 1; });
  var names = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; });
  $('bigCount').textContent = list.length;
  $('slotLeft').textContent = Math.max(0, QUOTA - list.length) + ' slot tersisa';
  $('slotUsed').textContent = list.length + '/' + QUOTA;
  $('sizeTotal').textContent = (bytes / 1024).toFixed(1) + ' KB';
  $('topLang').textContent = names[0] || '-';
  $('langCount').textContent = names.length;
  setTimeout(function () { $('quotaBar').style.width = (list.length / QUOTA * 100) + '%'; }, 100);
}

/* --render-list-- */

function renderList() {
  var box = $('list');
  var q = $('search').value.trim().toLowerCase();
  var f = $('filter').value;
  var list = loadPastes().filter(function (p) {
    var okQ = !q || p.title.toLowerCase().indexOf(q) > -1 || p.id.indexOf(q) > -1;
    return okQ && (f === 'Semua' || p.lang === f);
  });
  box.innerHTML = '';
  if (!list.length) {
    var e = document.createElement('p');
    e.className = 'empty';
    e.textContent = 'Tidak ada paste.';
    box.appendChild(e);
    return;
  }
  list.forEach(function (p) {
    var m = langMeta(p.lang);
    var row = document.createElement('div');
    row.className = 'item';
    row.innerHTML = '<span class="ico ' + m.bg + '"><i class="' + m.icon + '"></i></span>' +
      '<div class="body"><div class="t"></div><div class="m"></div></div><div class="acts"></div>';
    row.querySelector('.t').textContent = p.title;
    row.querySelector('.m').textContent = p.lang + ' · ' + p.id + ' · ' + p.code.length + ' char';
    var acts = row.querySelector('.acts');
    [
      { icon: 'fa-eye', cls: '', fn: function () { viewBox(p); } },
      { icon: 'fa-copy', cls: '', fn: function () { copyCode(p.code); } },
      { icon: 'fa-trash', cls: 'del', fn: function () { confirmBox('Hapus paste?', p.title, function () { removeOne(p.id); }); } }
    ].forEach(function (a) {
      var b = document.createElement('button');
      b.className = 'sq ' + a.cls;
      b.innerHTML = '<i class="fa-solid ' + a.icon + '"></i>';
      b.onclick = a.fn;
      acts.appendChild(b);
    });
    box.appendChild(row);
  });
}

/* --actions-- */

function removeOne(id) {
  savePastes(loadPastes().filter(function (p) { return p.id !== id; }));
  toast('Paste dihapus');
  refresh();
}

function clearAll() {
  savePastes([]);
  try { localStorage.setItem(SEEDED, '1'); } catch (e) {}
  toast('Semua paste dihapus');
  refresh();
}

function refresh() {
  renderOverview();
  renderList();
}

/* --navigation-- */

function setActive(id) {
  document.querySelectorAll('.nbtn').forEach(function (b) {
    b.classList.toggle('active', b.dataset.target === id);
  });
}

function initNav() {
  document.querySelectorAll('.nbtn').forEach(function (b) {
    b.onclick = function () { setActive(b.dataset.target); $(b.dataset.target).scrollIntoView({ behavior: 'smooth' }); };
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) setActive(en.target.id); });
    }, { rootMargin: '-40% 0px -50% 0px' });
    ['home', 'manage', 'danger'].forEach(function (id) { io.observe($(id)); });
  }
}

/* --session-- */

function api(path, method, body) {
  return fetch(path, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: body ? JSON.stringify(body) : undefined
  }).then(function (r) { return r.json().then(function (d) { return { status: r.status, data: d }; }); });
}

function checkSession() {
  return api('/api/session', 'GET').then(function (r) { return !!r.data.ok; }, function () { return false; });
}

function doLogin() {
  var err = $('gerr');
  err.textContent = '';
  api('/api/login', 'POST', { username: $('gu').value.trim(), password: $('gp').value }).then(function (r) {
    if (r.data.ok) { $('gp').value = ''; start(); }
    else err.textContent = r.data.error || 'Login gagal';
  }, function () { err.textContent = 'Server login tidak tersedia'; });
}

function doLogout() {
  api('/api/logout', 'POST').then(function () { location.reload(); }, function () { location.reload(); });
}

/* --start-- */

function start() {
  document.body.classList.remove('locked');
  initNav();
  var f = $('filter');
  f.innerHTML = '';
  ['Semua'].concat(LANGS.map(function (l) { return l.name; })).forEach(function (n) {
    var o = document.createElement('option');
    o.textContent = n;
    f.appendChild(o);
  });
  f.onchange = renderList;
  $('search').oninput = renderList;
  $('clearAll').onclick = function () { confirmBox('Hapus semua?', 'Semua paste akan dihapus permanen.', clearAll); };
  $('modal').onclick = function (e) { if (e.target === $('modal')) closeModal(); };
  refresh();
}

/* --init-- */

function init() {
  makeStars();
  seedOnce();
  $('glogin').onclick = doLogin;
  $('gp').onkeydown = function (e) { if (e.key === 'Enter') doLogin(); };
  $('logout').onclick = doLogout;
  runLoader('Admin Panel');
  checkSession().then(function (ok) { if (ok) start(); });
}

init();
