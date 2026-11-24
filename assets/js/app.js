/* --render-stats-- */

function renderStats() {
  var list = loadPastes();
  var bytes = list.reduce(function (n, p) { return n + p.code.length; }, 0);
  $('bigCount').textContent = list.length;
  $('slotLeft').textContent = Math.max(0, QUOTA - list.length) + ' slot tersisa';
  $('slotUsed').textContent = list.length + '/' + QUOTA;
  $('sizeTotal').textContent = (bytes / 1024).toFixed(1) + ' KB';
  setTimeout(function () { $('quotaBar').style.width = (list.length / QUOTA * 100) + '%'; }, 100);
}

/* --render-languages-- */

function renderLangs() {
  var box = $('langList');
  var list = loadPastes();
  box.innerHTML = '';
  LANGS.forEach(function (l) {
    var count = list.filter(function (p) { return p.lang === l.name; }).length;
    var row = document.createElement('div');
    row.className = 'item';
    row.innerHTML = '<span class="ico ' + l.bg + '"><i class="' + l.icon + '"></i></span>' +
      '<div class="body"><div class="line"><span class="t"></span><span class="v"></span></div>' +
      '<div class="m"></div></div>';
    row.querySelector('.t').textContent = l.name;
    row.querySelector('.v').textContent = count + ' paste';
    row.querySelector('.m').textContent = list.length ? Math.round(count / list.length * 100) + '% dari total' : 'Belum ada';
    row.querySelector('.body').appendChild(makeWave(l.wave, list.length ? count / list.length * 100 : 0));
    box.appendChild(row);
  });
}

/* --render-list-- */

function renderList() {
  var box = $('list');
  var q = $('search').value.trim().toLowerCase();
  var list = loadPastes().filter(function (p) {
    return !q || p.title.toLowerCase().indexOf(q) > -1 || p.lang.toLowerCase().indexOf(q) > -1;
  });
  box.innerHTML = '';
  if (!list.length) {
    var e = document.createElement('p');
    e.className = 'empty';
    e.textContent = q ? 'Tidak ada hasil.' : 'Belum ada paste. Buat yang pertama!';
    box.appendChild(e);
    return;
  }
  list.forEach(function (p) {
    var m = langMeta(p.lang);
    var row = document.createElement('div');
    row.className = 'item';
    row.innerHTML = '<span class="ico ' + m.bg + '"><i class="' + m.icon + '"></i></span>' +
      '<div class="body"><div class="t"></div><div class="m"></div></div>';
    row.querySelector('.t').textContent = p.title;
    row.querySelector('.m').textContent = p.lang + ' · ' + p.id;
    var btn = document.createElement('button');
    btn.className = 'icon-btn';
    btn.innerHTML = '<i class="fa-solid fa-copy"></i>';
    btn.onclick = function () { copyCode(p.code); };
    row.appendChild(btn);
    box.appendChild(row);
  });
}

function showSkeleton() {
  $('list').innerHTML = '<div class="sk"></div><div class="sk"></div><div class="sk"></div>';
  setTimeout(renderList, 800);
}

/* --create-paste-- */

function createPaste() {
  var code = $('code').value.trim();
  var list = loadPastes();
  if (!code) { toast('Kode masih kosong'); return; }
  if (list.length >= QUOTA) { toast('Kuota penuh'); return; }
  list.unshift({
    id: Math.random().toString(36).slice(2, 8),
    title: $('title').value.trim() || 'Tanpa judul',
    lang: $('lang').value,
    code: code
  });
  savePastes(list);
  $('code').value = '';
  $('title').value = '';
  toast('Paste disimpan');
  refresh();
  goTo('recent');
}

/* --refresh-- */

function refresh() {
  renderStats();
  renderLangs();
  renderList();
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
        var list = loadPastes();
        if (list.length) copyCode(list[0].code); else toast('Belum ada paste');
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
  seedOnce();
  $('save').onclick = createPaste;
  $('search').oninput = renderList;
  renderStats();
  renderLangs();
  showSkeleton();
  runLoader('Beranda');
}

init();
