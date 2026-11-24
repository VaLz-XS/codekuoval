/* --state-- */

var data = { total: 0, pub: 0, items: [] };

/* --render-stats-- */

function renderStats() {
  $('bigCount').textContent = data.total;
  $('slotLeft').textContent = data.pub + ' publik';
  $('slotUsed').textContent = (data.total - data.pub) + ' tidak terdaftar';
  setTimeout(function () { $('quotaBar').style.width = (data.total ? data.pub / data.total * 100 : 0) + '%'; }, 100);
}

/* --render-languages-- */

function renderLangs() {
  var box = $('langList');
  var list = data.items;
  box.innerHTML = '';
  LANGS.forEach(function (l) {
    var count = list.filter(function (p) { return p.lang === l.name; }).length;
    var pct = list.length ? Math.round(count / list.length * 100) : 0;
    var row = document.createElement('div');
    row.className = 'item';
    row.innerHTML = '<span class="ico ' + l.bg + '"><i class="' + l.icon + '"></i></span>' +
      '<div class="body"><div class="line"><span class="t"></span><span class="v"></span></div><div class="m"></div></div>';
    row.querySelector('.t').textContent = l.name;
    row.querySelector('.v').textContent = count + ' paste';
    row.querySelector('.m').textContent = list.length ? pct + '% dari paste terbaru' : 'Belum ada';
    row.querySelector('.body').appendChild(makeWave(l.wave, pct));
    box.appendChild(row);
  });
}

/* --render-list-- */

function renderList() {
  var box = $('list');
  var q = $('search').value.trim().toLowerCase();
  var list = data.items.filter(function (p) {
    return !q || p.title.toLowerCase().indexOf(q) > -1 || p.lang.toLowerCase().indexOf(q) > -1;
  });
  box.innerHTML = '';
  if (!list.length) {
    var e = document.createElement('p');
    e.className = 'empty';
    e.textContent = q ? 'Tidak ada hasil.' : 'Belum ada paste publik. Buat yang pertama!';
    box.appendChild(e);
    return;
  }
  list.forEach(function (p) {
    var m = langMeta(p.lang);
    var row = document.createElement('a');
    row.className = 'item link-item';
    row.href = '/p/' + p.id;
    row.innerHTML = '<span class="ico ' + m.bg + '"><i class="' + m.icon + '"></i></span>' +
      '<div class="body"><div class="t"></div><div class="m"></div></div>';
    row.querySelector('.t').textContent = p.title;
    row.querySelector('.m').textContent = p.lang + ' · ' + fmtDate(p.created);
    var btn = document.createElement('button');
    btn.className = 'icon-btn';
    btn.setAttribute('aria-label', 'Salin link');
    btn.innerHTML = '<i class="fa-solid fa-link"></i>';
    btn.onclick = function (e) { e.preventDefault(); e.stopPropagation(); copyText(pasteUrl(p.id), 'Link disalin'); };
    row.appendChild(btn);
    box.appendChild(row);
  });
}

/* --load-data-- */

function showSkeleton() {
  $('list').innerHTML = '<div class="sk"></div><div class="sk"></div><div class="sk"></div>';
}

function loadData() {
  showSkeleton();
  api('/api/recent').then(function (r) {
    if (r.data.ok) data = r.data;
    else toast(r.data.error || 'Gagal memuat');
    renderStats();
    renderLangs();
    renderList();
  }, function () {
    toast('Server tidak tersedia');
    renderList();
  });
}

/* --create-paste-- */

function createPaste() {
  var code = $('code').value;
  if (!code.trim()) { toast('Kode masih kosong'); return; }
  var btn = $('save');
  btn.disabled = true;
  api('/api/paste', 'POST', {
    title: $('title').value,
    lang: $('lang').value,
    vis: $('vis').value,
    code: code
  }).then(function (r) {
    if (r.data.ok) leavePage('Paste', '/p/' + r.data.id);
    else { btn.disabled = false; toast(r.data.error || 'Gagal menyimpan'); }
  }, function () { btn.disabled = false; toast('Server tidak tersedia'); });
}

/* --navigation-- */

function goTo(target) {
  if (target === 'search') {
    $('recent').scrollIntoView({ behavior: 'smooth' });
    setTimeout(function () { $('search').focus(); }, 500);
    return;
  }
  $(target).scrollIntoView({ behavior: 'smooth' });
}

function setActive(id) {
  document.querySelectorAll('.nbtn').forEach(function (b) {
    b.classList.toggle('active', b.dataset.target === id);
  });
}

function initNav() {
  document.querySelectorAll('.nbtn').forEach(function (b) {
    b.onclick = function () { setActive(b.dataset.target); goTo(b.dataset.target); };
  });
  document.querySelectorAll('.act').forEach(function (b) {
    b.onclick = function () {
      var a = b.dataset.act;
      if (a === 'copy') {
        if (data.items.length) copyText(pasteUrl(data.items[0].id), 'Link terbaru disalin');
        else toast('Belum ada paste');
      } else { goTo(a); }
    };
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) setActive(en.target.id); });
    }, { rootMargin: '-40% 0px -50% 0px' });
    ['home', 'langs', 'create', 'recent'].forEach(function (id) { io.observe($(id)); });
  }
}

/* --init-- */

function init() {
  makeStars();
  initNav();
  $('save').onclick = createPaste;
  $('search').oninput = renderList;
  runLoader('Beranda');
  loadData();
}

init();
