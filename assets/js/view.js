/* --render-paste-- */

function renderPaste(p) {
  var m = langMeta(p.lang);
  document.title = p.title + ' · codekuoval';
  var box = $('view');
  box.innerHTML = '';

  var h = document.createElement('h1');
  h.className = 'vtitle';
  h.textContent = p.title;
  box.appendChild(h);

  var chips = document.createElement('div');
  chips.className = 'chips';
  [p.lang, fmtDate(p.created), p.code.length + ' karakter', p.vis === 'public' ? 'Publik' : 'Tidak terdaftar'].forEach(function (t, i) {
    var c = document.createElement('span');
    c.className = 'chip' + (i === 3 ? ' alt' : '');
    c.textContent = t;
    chips.appendChild(c);
  });
  box.appendChild(chips);

  var acts = document.createElement('div');
  acts.className = 'vacts';
  acts.innerHTML = '<button class="btn" id="bCode"><i class="fa-solid fa-copy"></i> Salin kode</button>' +
    '<button class="btn ghost" id="bLink"><i class="fa-solid fa-link"></i> Salin link</button>' +
    '<a class="btn ghost" id="bRaw" target="_blank" rel="noopener"><i class="fa-solid fa-file-lines"></i> Raw</a>' +
    '<a class="btn ghost" href="/"><i class="fa-solid fa-plus"></i> Paste baru</a>';
  box.appendChild(acts);
  $('bCode').onclick = function () { copyText(p.code, 'Kode disalin'); };
  $('bLink').onclick = function () { copyText(location.href, 'Link disalin'); };
  $('bRaw').href = '/raw/' + p.id;

  var wrap = document.createElement('div');
  wrap.className = 'codebox';
  var pre = document.createElement('pre');
  var code = document.createElement('code');
  code.className = 'hljs language-' + m.hl;
  code.textContent = p.code;
  pre.appendChild(code);
  wrap.appendChild(pre);
  box.appendChild(wrap);
  highlight(code);
}

/* --highlight-- */

function highlight(el) {
  if (window.hljs) { try { window.hljs.highlightElement(el); } catch (e) {} return; }
  window.addEventListener('load', function () {
    try { if (window.hljs) window.hljs.highlightElement(el); } catch (e) {}
  });
}

/* --not-found-- */

function showError(msg) {
  var box = $('view');
  box.innerHTML = '<div class="notfound"><i class="fa-solid fa-ghost"></i><p></p></div>';
  box.querySelector('p').textContent = msg;
}

/* --init-- */

function init() {
  makeStars();
  runLoader('Paste');
  var id = location.pathname.split('/').pop();
  api('/api/paste?id=' + encodeURIComponent(id)).then(function (r) {
    if (r.data.ok) renderPaste(r.data.paste);
    else showError(r.data.error || 'Paste tidak ditemukan');
  }, function () { showError('Server tidak tersedia'); });
}

init();
