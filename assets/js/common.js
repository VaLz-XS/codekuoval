/* --state-- */

var KEY = 'codekuoval_pastes';
var SEEDED = 'codekuoval_seeded';
var QUOTA = 20;
var memory = [];
var $ = function (id) { return document.getElementById(id); };

var LANGS = [
  { name: 'HTML', icon: 'fa-brands fa-html5', bg: 'c-g', wave: 'g' },
  { name: 'CSS', icon: 'fa-brands fa-css3-alt', bg: 'c-b', wave: 't' },
  { name: 'JavaScript', icon: 'fa-brands fa-js', bg: 'c-p', wave: 'p' },
  { name: 'Python', icon: 'fa-brands fa-python', bg: 'c-l', wave: 'v' },
  { name: 'Lainnya', icon: 'fa-solid fa-file-lines', bg: 'c-g', wave: 'g' }
];

function langMeta(name) {
  return LANGS.filter(function (l) { return l.name === name; })[0] || LANGS[4];
}

/* --storage-- */

function loadPastes() {
  try { return JSON.parse(localStorage.getItem(KEY)) || memory; } catch (e) { return memory; }
}

function savePastes(list) {
  memory = list;
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
}

function seedOnce() {
  var done = false;
  try { done = localStorage.getItem(SEEDED); } catch (e) { done = memory.length > 0; }
  if (done || loadPastes().length) return;
  savePastes([
    { id: 'a1b2c3', title: 'Hello World', lang: 'HTML', code: '<h1>Hello World</h1>' },
    { id: 'd4e5f6', title: 'Tombol Material', lang: 'CSS', code: '.btn { border-radius: 22px; }' },
    { id: 'g7h8i9', title: 'Fungsi Salin', lang: 'JavaScript', code: 'navigator.clipboard.writeText(text);' },
    { id: 'j1k2l3', title: 'Cetak Nama', lang: 'Python', code: 'print("codekuoval")' }
  ]);
  try { localStorage.setItem(SEEDED, '1'); } catch (e) {}
}

/* --toast-- */

function toast(msg) {
  var t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function () { t.classList.remove('show'); }, 1800);
}

/* --loader-- */

function makeStars() {
  var box = $('stars');
  for (var i = 0; i < 28; i++) {
    var s = document.createElement('i');
    s.className = 'star';
    s.style.top = Math.random() * 100 + '%';
    s.style.left = Math.random() * 100 + '%';
    s.style.animationDuration = (1.2 + Math.random() * 1.6) + 's';
    box.appendChild(s);
  }
}

function runLoader(name) {
  var l = $('loader');
  $('loaderPage').textContent = name;
  l.className = 'loader';
  void l.offsetWidth;
  l.classList.add('in');
  setTimeout(function () { l.classList.add('leave'); }, 1500);
  setTimeout(function () { l.classList.add('out'); }, 1900);
}

/* --wave-builder-- */

function makeWave(kind, pct) {
  var w = document.createElement('div');
  w.className = 'wave ' + kind;
  var i = document.createElement('i');
  w.appendChild(i);
  setTimeout(function () { i.style.width = Math.max(0, Math.min(100, pct)) + '%'; }, 100);
  return w;
}

/* --copy-code-- */

function copyCode(text) {
  try {
    navigator.clipboard.writeText(text).then(function () { toast('Kode disalin'); }, function () { toast('Gagal menyalin'); });
  } catch (e) { toast('Gagal menyalin'); }
}

