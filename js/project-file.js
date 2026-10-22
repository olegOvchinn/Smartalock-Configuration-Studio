/* project-file.js
   "Save project file / Open project file" for the Configuration Studio demo.

   Every page keeps the client's answers in this browser (localStorage key "configurationProject"). This
   script lets a client save that project to a .json file on their computer and open it again later, in any
   browser or on any computer, with no server involved. It also lets Smartalock open a client's file to view
   it (for example on pages/tech-summary.html).

   It adds a small "Project file" button to the page header, a confirmation dialog when opening a file, and
   (on the registration page, when nothing has been started) a short "Already started?" banner.
   It never changes a page's own code: it only reads and writes the same localStorage key the pages use,
   then reloads the page so the page re-reads it.

   Add to a page, just before </body>:   <script src="../js/project-file.js"></script>
   (use "js/project-file.js" from the project root). The file format is the plain project object described
   in backend-developer-brief.md section 3, so the same files will load into a real backend later. */
(function () {
  'use strict';
  if (window.__projectFileLoaded) return;
  window.__projectFileLoaded = true;

  var KEY = 'configurationProject';
  var SAVED_KEY = 'configurationProjectFileSaved';   /* project.updated value at the last file save */
  var TOAST_KEY = 'configurationProjectFileToast';
  var MAX_BYTES = 4 * 1024 * 1024;

  function $(s, r) { return (r || document).querySelector(s); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  /* ---------- storage ---------- */
  function read() {
    try { var t = localStorage.getItem(KEY); return t ? JSON.parse(t) : null; } catch (e) { return null; }
  }
  function hasContent(p) {
    if (!p || typeof p !== 'object') return false;
    var r = p.registration || {};
    for (var k in r) if (r[k]) return true;
    var a = (p.smartalock && p.smartalock.wizard) || {}, b = (p.floorsense && p.floorsense.wizard) || {};
    return Object.keys(a).length > 0 || Object.keys(b).length > 0;
  }
  function label(p) {
    var r = (p && p.registration) || {};
    var bits = [r.customer, r.site].filter(Boolean);
    return bits.length ? bits.join(' · ') : 'Untitled project';
  }
  function fmt(iso) {
    if (!iso) return '';
    var d = new Date(iso); if (isNaN(d)) return '';
    try { return d.toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch (e) { return d.toISOString().slice(0, 16).replace('T', ' '); }
  }
  function slug(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40); }
  function isProject(o) {
    return o && typeof o === 'object' && !Array.isArray(o) &&
      ['registration', 'smartalock', 'floorsense'].some(function (k) { return o[k] && typeof o[k] === 'object' && !Array.isArray(o[k]); });
  }

  /* ---------- styles ---------- */
  var css =
    '.pf-btn{position:absolute;top:14px;right:max(20px,env(safe-area-inset-right));z-index:60;display:inline-flex;align-items:center;gap:7px;padding:7px 13px;border-radius:980px;border:1px solid var(--line,#D2D2D7);background:#fff;color:var(--accent,#0071E3);font:600 12.5px/1 var(--font-text,Inter,-apple-system,Helvetica,Arial,sans-serif);cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,.06)}' +
    '.pf-btn.pf-float{position:fixed;top:12px;right:14px}' +
    '.pf-btn:hover,.pf-btn:focus-visible{border-color:var(--accent,#0071E3);background:var(--accent-wash,#E8F1FC);outline:none}' +
    '.pf-btn svg{width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}' +
    '.pf-dot{width:8px;height:8px;border-radius:50%;background:#FF9F0A;display:none}' +
    '.pf-btn.pf-dirty .pf-dot{display:inline-block}' +
    '@media (max-width:560px){.pf-btn span.pf-txt{display:none}.pf-btn{padding:8px 10px}}' +
    '.pf-ov{position:fixed;inset:0;z-index:10000;background:rgba(20,24,30,.45);display:flex;align-items:center;justify-content:center;padding:16px}' +
    '.pf-ov[hidden]{display:none}' +
    '.pf-dlg{background:#fff;color:var(--ink,#1D1D1F);width:100%;max-width:460px;border-radius:18px;box-shadow:0 24px 60px rgba(0,0,0,.28);padding:22px 24px 20px;font-family:var(--font-text,Inter,-apple-system,Helvetica,Arial,sans-serif)}' +
    '.pf-head{display:flex;align-items:center;justify-content:space-between;gap:12px}' +
    '.pf-head h2{margin:0;font-size:19px;font-weight:600;letter-spacing:-.01em}' +
    '.pf-x{border:0;background:none;font-size:26px;line-height:1;cursor:pointer;color:var(--ink-soft,#6E6E73);padding:2px 8px;border-radius:8px}' +
    '.pf-x:hover{background:var(--paper-soft,#F5F5F7)}' +
    '.pf-p{margin:8px 0 12px;font-size:13.5px;line-height:1.55;color:var(--ink-soft,#6E6E73)}' +
    '.pf-now{margin:0 0 14px;padding:10px 12px;border-radius:12px;background:var(--paper-soft,#F5F5F7);font-size:13px;line-height:1.5}' +
    '.pf-now b{font-weight:600}' +
    '.pf-now .pf-warn{display:block;margin-top:3px;color:#93650A}' +
    '.pf-actions{display:flex;flex-direction:column;gap:9px}' +
    '.pf-act{font:inherit;font-weight:600;font-size:14px;border-radius:14px;cursor:pointer;padding:12px 16px;border:1px solid var(--line,#D2D2D7);background:#fff;color:var(--accent,#0071E3);text-align:left;display:flex;flex-direction:column;gap:2px}' +
    '.pf-act small{font-weight:400;font-size:12.5px;color:var(--ink-soft,#6E6E73)}' +
    '.pf-act:hover,.pf-act:focus-visible{border-color:var(--accent,#0071E3);background:var(--accent-wash,#E8F1FC);outline:none}' +
    '.pf-act.pf-primary{background:var(--accent,#0071E3);border-color:var(--accent,#0071E3);color:#fff}' +
    '.pf-act.pf-primary small{color:rgba(255,255,255,.85)}' +
    '.pf-act.pf-primary:hover{background:var(--accent-deep,#0058B0)}' +
    '.pf-msg{min-height:18px;margin-top:10px;font-size:12.5px;line-height:1.5;color:var(--ink-soft,#6E6E73)}' +
    '.pf-msg.pf-err{color:#C0271B}' +
    '.pf-row{display:flex;gap:10px;justify-content:flex-end;margin-top:16px;flex-wrap:wrap}' +
    '.pf-row .pf-act{flex:1 1 150px;align-items:center;text-align:center}' +
    '.pf-banner{max-width:900px;margin:14px auto 0;padding:11px 16px;border-radius:14px;background:var(--accent-wash,#E8F1FC);color:var(--accent-deep,#0058B0);font:500 13.5px/1.5 var(--font-text,Inter,-apple-system,Helvetica,Arial,sans-serif);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}' +
    '.pf-banner button{font:inherit;font-weight:600;border:0;background:#fff;color:var(--accent,#0071E3);border-radius:980px;padding:7px 14px;cursor:pointer;border:1px solid var(--line,#D2D2D7)}' +
    '.pf-banner button:hover{border-color:var(--accent,#0071E3)}' +
    '.pf-toast{position:fixed;left:50%;bottom:84px;transform:translateX(-50%);z-index:10001;background:#1D1D1F;color:#fff;font:500 13.5px/1.4 var(--font-text,Inter,-apple-system,Helvetica,Arial,sans-serif);padding:11px 18px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.3);max-width:calc(100vw - 32px)}' +
    '.pf-hidden{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}' +
    '@media print{.pf-btn,.pf-banner,.pf-ov,.pf-toast{display:none!important}}';

  var ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4"/><path d="M8 20v-6h8v6"/></svg>';

  var els = {}, lastFocus = null, pending = null;

  function build() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'pf-btn'; btn.id = 'pfBtn';
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.innerHTML = ICON + '<span class="pf-txt">Project file</span><i class="pf-dot" aria-hidden="true"></i>';
    var host = $('.top-frame');
    if (host) host.appendChild(btn); else { btn.className += ' pf-float'; document.body.appendChild(btn); }
    els.btn = btn;

    var ov = document.createElement('div'); ov.className = 'pf-ov'; ov.hidden = true;
    ov.innerHTML = '<div class="pf-dlg" role="dialog" aria-modal="true" aria-labelledby="pfTitle"></div>' +
      '<input type="file" class="pf-hidden" id="pfFile" accept=".json,application/json" tabindex="-1" aria-hidden="true">';
    document.body.appendChild(ov);
    els.ov = ov; els.dlg = $('.pf-dlg', ov); els.file = $('#pfFile', ov);

    btn.addEventListener('click', openMenu);
    ov.addEventListener('mousedown', function (e) { if (e.target === ov) closeDlg(); });
    document.addEventListener('keydown', function (e) {
      if (ov.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); closeDlg(); }
      if (e.key === 'Tab') {
        var f = [].filter.call(els.dlg.querySelectorAll('button'), function (n) { return !n.disabled; });
        if (!f.length) return;
        var a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    });
    els.file.addEventListener('change', function () { var f = els.file.files && els.file.files[0]; els.file.value = ''; if (f) readFile(f); });
    refreshDirty(); setInterval(refreshDirty, 4000);
    window.addEventListener('storage', refreshDirty);
  }

  function isDirty() {
    var p = read(); if (!hasContent(p)) return false;
    var saved; try { saved = localStorage.getItem(SAVED_KEY); } catch (e) { saved = null; }
    return saved !== String(p.updated || '');
  }
  function refreshDirty() { if (els.btn) els.btn.classList.toggle('pf-dirty', isDirty()); }

  /* ---------- dialogs ---------- */
  function show(html, focusSel) {
    lastFocus = lastFocus || document.activeElement;
    els.dlg.innerHTML = html; els.ov.hidden = false;
    var f = focusSel && $(focusSel, els.dlg); if (f) f.focus();
    var x = $('.pf-x', els.dlg); if (x) x.addEventListener('click', closeDlg);
  }
  function closeDlg() {
    els.ov.hidden = true; pending = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    lastFocus = null;
  }

  function openMenu() {
    var p = read(), has = hasContent(p), dirty = isDirty();
    show(
      '<div class="pf-head"><h2 id="pfTitle">Project file</h2><button type="button" class="pf-x" aria-label="Close">&times;</button></div>' +
      '<p class="pf-p">Your answers are kept in this browser. Save them to a file to keep a copy, carry on from another computer or browser, or send them to Smartalock. Open the file later to pick up where you left off.</p>' +
      '<div class="pf-now">' + (has ? '<b>Current project:</b> ' + esc(label(p)) + (p.updated ? '<br>Last changed ' + esc(fmt(p.updated)) : '') +
        (dirty ? '<span class="pf-warn">Changes since you last saved a file.</span>' : '') : 'No project started in this browser yet.') + '</div>' +
      '<div class="pf-actions">' +
        '<button type="button" class="pf-act pf-primary" id="pfSave"' + (has ? '' : ' disabled style="opacity:.55;cursor:not-allowed"') + '>Save project file<small>Downloads a .json file to this computer</small></button>' +
        '<button type="button" class="pf-act" id="pfOpen">Open a saved project file<small>Choose a .json file you saved earlier</small></button>' +
      '</div><div class="pf-msg" id="pfMsg" role="status" aria-live="polite">' + (has ? '' : 'Fill in Project Registration first, then there will be something to save.') + '</div>',
      '#pfOpen');
    $('#pfSave', els.dlg).addEventListener('click', function () { if (has) saveFile(); });
    $('#pfOpen', els.dlg).addEventListener('click', function () { els.file.value = ''; els.file.click(); });
  }

  function msg(t, err) { var m = $('#pfMsg', els.dlg); if (m) { m.textContent = t; m.className = 'pf-msg' + (err ? ' pf-err' : ''); } }

  /* ---------- save ---------- */
  function saveFile() {
    var p = read();
    if (!hasContent(p)) { msg('Nothing to save yet.', true); return; }
    var name = [slug(p.registration && p.registration.customer), slug(p.registration && p.registration.site)].filter(Boolean).join('-') || 'project';
    var d = new Date(), ds = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
    var fileName = 'smartalock-' + name + '-' + ds + '.json';
    var blob = new Blob([JSON.stringify(p, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = fileName; document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 3000);
    try { localStorage.setItem(SAVED_KEY, String(p.updated || '')); } catch (e) { /* ignore */ }
    refreshDirty();
    msg('Saved as ' + fileName + '. Check your Downloads folder.');
  }

  /* ---------- open ---------- */
  function readFile(file) {
    if (file.size > MAX_BYTES) { return openMenu(), msg('That file is too large to be a project file.', true); }
    var fr = new FileReader();
    fr.onerror = function () { openMenu(); msg('Could not read that file.', true); };
    fr.onload = function () {
      var o; try { o = JSON.parse(String(fr.result)); } catch (e) { o = null; }
      if (o && o.project && isProject(o.project)) o = o.project;   /* tolerate a wrapped export */
      if (!isProject(o)) { openMenu(); msg('That does not look like a Smartalock project file.', true); return; }
      confirmOpen(o, file.name);
    };
    fr.readAsText(file);
  }
  function confirmOpen(o, fileName) {
    var cur = read(), has = hasContent(cur), same = has && cur.id && o.id && String(cur.id) === String(o.id);
    pending = o;
    show(
      '<div class="pf-head"><h2 id="pfTitle">Open this project?</h2><button type="button" class="pf-x" aria-label="Close">&times;</button></div>' +
      '<div class="pf-now" style="margin-top:12px"><b>' + esc(label(o)) + '</b><br>' + (o.updated ? 'Saved ' + esc(fmt(o.updated)) + '<br>' : '') + '<span style="color:var(--ink-soft,#6E6E73)">' + esc(fileName) + '</span></div>' +
      (has ? '<p class="pf-p">This replaces the project currently in this browser (<b>' + esc(label(cur)) + '</b>' + (same ? ', an older or newer copy of the same project' : '') + '). ' +
        (isDirty() ? '<b>It has changes you have not saved to a file.</b> Save them first if you want to keep them.' : 'Save it to a file first if you want to keep it.') + '</p>' : '<p class="pf-p">The project will open in this browser and the page will reload.</p>') +
      '<div class="pf-row"><button type="button" class="pf-act" id="pfCancel">Cancel</button><button type="button" class="pf-act pf-primary" id="pfGo">' + (has ? 'Replace and open' : 'Open project') + '</button></div>' +
      '<div class="pf-msg" id="pfMsg" role="status" aria-live="polite"></div>', has ? '#pfCancel' : '#pfGo');
    $('#pfCancel', els.dlg).addEventListener('click', closeDlg);
    $('#pfGo', els.dlg).addEventListener('click', function () { applyOpen(fileName); });
  }
  function applyOpen(fileName) {
    var o = pending; if (!o) return;
    if (!o.id) o.id = Date.now().toString();
    if (!o.created) o.created = new Date().toISOString();
    if (!o.updated) o.updated = o.created;
    try {
      localStorage.setItem(KEY, JSON.stringify(o));
      localStorage.setItem(SAVED_KEY, String(o.updated));
      try { sessionStorage.setItem(TOAST_KEY, 'Opened project: ' + label(o)); } catch (e) { /* ignore */ }
    } catch (e) { msg('This browser would not let the project be stored (private browsing or storage full).', true); return; }
    location.reload();
  }

  /* ---------- toast + registration banner ---------- */
  function toast(t) {
    var d = document.createElement('div'); d.className = 'pf-toast'; d.setAttribute('role', 'status'); d.textContent = t;
    document.body.appendChild(d); setTimeout(function () { d.style.transition = 'opacity .4s'; d.style.opacity = '0'; }, 3200); setTimeout(function () { d.remove(); }, 3700);
  }
  function banner() {
    if (!/smartalock-registration\.html$/.test(location.pathname) || hasContent(read())) return;
    var host = $('.panel-topbar'); if (!host) return;
    var b = document.createElement('div'); b.className = 'pf-banner';
    b.innerHTML = '<span>Already started? Open the project file you saved earlier to carry on.</span><button type="button">Open project file</button>';
    var after = $('.top-frame', host); (after && after.nextSibling) ? host.insertBefore(b, after.nextSibling) : host.appendChild(b);
    $('button', b).addEventListener('click', function () { lastFocus = $('button', b); els.file.value = ''; els.file.click(); });
  }

  function init() {
    build(); banner();
    try { var t = sessionStorage.getItem(TOAST_KEY); if (t) { sessionStorage.removeItem(TOAST_KEY); toast(t); } } catch (e) { /* ignore */ }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  window.ProjectFile = { open: openMenu, save: saveFile };
})();
