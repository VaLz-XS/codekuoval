/* --state-- */

var data = { total: 0, pub: 0, items: [] };

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

/* --render-overview-- */

function renderOverview() {
  var items = data.items;
  var bytes = items.reduce(function (n, p) { return n + p.size; }, 0);
  var counts = {};
  items.forEach(function (p) { counts[p.lang] = (counts[p.lang] || 0) + 1; });
  var names = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; });
  $('bigCount').textContent = data.total;
  $('slotLeft').textContent = data.pub + ' publik';
  $('slotUsed').textContent = (data.total - data.pub) + ' tidak terdaftar';
  $('sizeTotal').textContent = (bytes / 1024).toFixed(1) + ' KB';
  $('topLang').textContent = names[0] || '-';
  $('langCount').textContent = names.length;
  setTimeout(function () { $('quotaBar').style.width = (data.total ? data.pub / data.total * 100 : 0) + '%'; }, 100);
}

/* --render-list-- */

function renderList() {
  var box = $('list');
  var q = $('search').value.trim().toLowerCase();
  var f = $('filter').value;
  var list = data.items.filter(function (p) {
    var okQ = !q || p.title.toLowerCase().indexOf(q) > -1 || p.id.toLowerCase().indexOf(q) > -1;
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
    row.querySelector('.m').textContent = p.lang + ' · ' + (p.vis === 'public' ? 'publik' : 'tak terdaftar') + ' · ' + p.id;
    var acts = row.querySelector('.acts');

    var view = document.createElement('a');
    view.className = 'sq';
    view.href = '/p/' + p.id;
    view.target = '_blank';
    view.rel = 'noopener';
    view.innerHTML = '<i class="fa-solid fa-eye"></i>';
    acts.appendChild(view);

    var cp = document.createElement('button');
    cp.className = 'sq';
    cp.innerHTML = '<i class="fa-solid fa-link"></i>';
    cp.onclick = function () { copyText(pasteUrl(p.id), 'Link disalin'); };
    acts.appendChild(cp);

    var del = document.createElement('button');
    del.className = 'sq del';
    del.innerHTML = '<i class="fa-solid fa-trash"></i>';
    del.onclick = function () { confirmBox('Hapus paste?', p.title, function () { act({ action: 'delete', id: p.id }, 'Paste dihapus'); }); };
    acts.appendChild(del);

    box.appendChild(row);
  });
}

/* --load-data-- */

function refresh() {
  api('/api/admin').then(function (r) {
    if (r.status === 401) { location.reload(); return; }
    if (r.data.ok) data = r.data;
    else toast(r.data.error || 'Gagal memuat');
    renderOverview();
    renderList();
  }, function () { toast('Server tidak tersedia'); });
}

function act(body, msg) {
  api('/api/admin', 'POST', body).then(function (r) {
    if (r.data.ok) { toast(msg); refresh(); }
    else toast(r.data.error || 'Gagal');
  }, function () { toast('Server tidak tersedia'); });
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

function checkSession() {
  return api('/api/session').then(function (r) { return !!r.data.ok; }, function () { return false; });
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
  $('clearAll').onclick = function () { confirmBox('Hapus semua?', 'Semua paste akan dihapus permanen.', function () { act({ action: 'clear' }, 'Semua paste dihapus'); }); };
  $('modal').onclick = function (e) { if (e.target === $('modal')) closeModal(); };
  refresh();
}

/* --init-- */

function init() {
  makeStars();
  $('glogin').onclick = doLogin;
  $('gp').onkeydown = function (e) { if (e.key === 'Enter') doLogin(); };
  $('logout').onclick = doLogout;
  runLoader('Admin Panel');
  checkSession().then(function (ok) { if (ok) start(); });
}

init();
