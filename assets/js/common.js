/* --state-- */

var $ = function (id) { return document.getElementById(id); };

var LANGS = [
  { name: 'HTML', icon: 'fa-brands fa-html5', bg: 'c-g', wave: 'g', hl: 'xml' },
  { name: 'CSS', icon: 'fa-brands fa-css3-alt', bg: 'c-b', wave: 't', hl: 'css' },
  { name: 'JavaScript', icon: 'fa-brands fa-js', bg: 'c-p', wave: 'p', hl: 'javascript' },
  { name: 'Python', icon: 'fa-brands fa-python', bg: 'c-l', wave: 'v', hl: 'python' },
  { name: 'Lainnya', icon: 'fa-solid fa-file-lines', bg: 'c-g', wave: 'g', hl: 'plaintext' }
];

function langMeta(name) {
  return LANGS.filter(function (l) { return l.name === name; })[0] || LANGS[4];
}

/* --api-- */

function api(path, method, body) {
  return fetch(path, {
    method: method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: body ? JSON.stringify(body) : undefined
  }).then(function (r) {
    return r.json().then(function (d) { return { status: r.status, data: d }; });
  });
}

/* --format-- */

function fmtDate(ts) {
  return new Date(ts).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function pasteUrl(id) { return location.origin + '/p/' + id; }

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

function leavePage(name, url) {
  var l = $('loader');
  $('loaderPage').textContent = name;
  l.className = 'loader';
  void l.offsetWidth;
  l.classList.add('in');
  setTimeout(function () { location.href = url; }, 1000);
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

/* --copy-text-- */

function copyText(text, msg) {
  try {
    navigator.clipboard.writeText(text).then(function () { toast(msg || 'Disalin'); }, function () { toast('Gagal menyalin'); });
  } catch (e) { toast('Gagal menyalin'); }
}
