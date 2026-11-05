/* send-project.js
   "Save & send to Smartalock" on the two summary pages (floorsense-out-of-box-policy.html and
   smartalock-configuration-summary.html).

   The client's answers stay saved in their own browser (localStorage "configurationProject"). Each
   time they finish a summary page and press the button, Smartalock gets an email with two attachments:
     - the internal Tech Summary as an .html file, with its own formatting (tech-summary.html, filled
       in from the project just saved; scripts and the password gate are left out)
     - the project itself as a .json file (opens with "Project file" or the presentation builder)
   It goes through the same Cloudflare email service as the troubleshooting "Contact support" button
   (smartalock-support worker), which sends to the address set in the worker (support@smartalock.com for
   now) and accepts these attachments on messages marked kind: 'project'.

   Usage:  SendProject.send({ project, product: 'Floorsense', summaryText, page })  -> Promise<{ ok, error }>
           SendProject.download(project)   saves the project as a .json file (the fallback)            */
(function (global) {
  'use strict';
  var ENDPOINT = 'https://smartalock-support.667y4cstjb.workers.dev';   // same service as troubleshooting/support-request.js
  var SENT_TO = 'support@smartalock.com';   // shown to the client; the worker TEMPORARILY delivers to oleg@smartalock.com while testing (TO in the worker)
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var MAX_FILE = 1400000;                                                // bytes per attachment (the service allows 1.5 MB)

  function label(p, sep) {
    var r = (p && p.registration) || {};
    return [r.customer, r.site].map(function (s) { return (s || '').trim(); }).filter(Boolean).join(sep || ' · ') || 'Untitled project';
  }
  function slug(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40); }
  function fileBase(p) { var r = (p && p.registration) || {}; return [slug(r.customer), slug(r.site)].filter(Boolean).join('-') || 'project'; }
  function today() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }

  /* UTF-8 text -> base64, in chunks so large files don't overflow the call stack */
  function b64(text) {
    var bytes = new TextEncoder().encode(text), out = '';
    for (var i = 0; i < bytes.length; i += 0x8000) out += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(out);
  }

  /* The project as a .json file. If an uploaded picture makes it too big to email, the picture is left
     out of the emailed copy (it stays in the client's browser) and the email says so. */
  function projectFile(project) {
    var text = JSON.stringify(project, null, 2), dropped = 0;
    if (new TextEncoder().encode(text).length > MAX_FILE) {
      text = JSON.stringify(project, function (k, v) {
        if (typeof v === 'string' && v.length > 20000 && /^data:/.test(v)) { dropped++; return '[image left out of the email: ' + Math.round(v.length / 1365) + ' KB]'; }
        return v;
      }, 2);
    }
    return { text: text, dropped: dropped };
  }

  /* The internal Tech Summary (tech-summary.html, next to the summary pages) as a standalone HTML file.
     The page is loaded out of sight, builds itself from the project just saved in this browser, and is
     copied with its own styles. Its password gate only hides the page, so nothing is shown to the client;
     the copy leaves out the gate, all scripts and the "Project file" button. Resolves '' if it can't be read. */
  function techSummaryHtml(project) {
    return new Promise(function (resolve) {
      var frame = document.createElement('iframe'), done = false;
      frame.setAttribute('aria-hidden', 'true'); frame.tabIndex = -1;
      frame.style.cssText = 'position:fixed;left:-10000px;top:0;width:1024px;height:600px;border:0;opacity:0;pointer-events:none';
      function finish(html) { if (done) return; done = true; clearTimeout(timer); frame.remove(); resolve(html || ''); }
      var timer = setTimeout(function () { finish(''); }, 10000);
      frame.onload = function () {
        setTimeout(function () {
          try {
            var doc = frame.contentDocument;
            if (!doc || !doc.querySelector('.tsec')) { finish(''); return; }
            var root = doc.documentElement.cloneNode(true);
            root.querySelectorAll('script, #pageLockHide, #pageLockGate, .pf-btn, .pf-ov, .pf-banner, .dev-link, [class^="pf-"]').forEach(function (el) { el.remove(); });
            var body = root.querySelector('body'); if (body) body.removeAttribute('style');
            var title = root.querySelector('title');
            if (title) title.textContent = 'Tech Summary — ' + label(project) + ' — ' + today();
            finish('<!DOCTYPE html>\n' + root.outerHTML);
          } catch (e) { finish(''); }
        }, 300);
      };
      frame.src = 'tech-summary.html';
      document.body.appendChild(frame);
    });
  }

  function send(opts) {
    return techSummaryHtml(opts.project || {}).then(function (html) { return sendWith(opts, html); });
  }

  function sendWith(opts, techHtml) {
    var p = opts.project || {}, reg = p.registration || {};
    var pf = projectFile(p);
    var when = new Date();
    var base = fileBase(p), date = today();
    var attachments = [{ filename: 'smartalock-project-' + base + '.json', content: b64(pf.text) }];
    if (techHtml) attachments.unshift({ filename: 'Tech Summary - ' + label(p, ' - ').replace(/[^A-Za-z0-9 ._()-]+/g, '-') + ' - ' + date + '.html', content: b64(techHtml) });
    var lines = [
      opts.product + ' configuration saved by the client.',
      '',
      'Customer: ' + (reg.customer || 'Not given'),
      'Site: ' + (reg.site || 'Not given'),
      'Client email: ' + (reg.email || 'Not given'),
      'Saved: ' + when.toLocaleString() + ' (' + when.toISOString() + ')',
      'Project ID: ' + (p.id || 'n/a'),
      '',
      'Attached:',
      techHtml ? '- Tech Summary (.html): open it in a browser; print it to save a PDF.' : '- (The Tech Summary could not be prepared this time: open the project file below with the Tech Summary page instead.)',
      '- Project file (.json): open it with "Project file" in the Configuration Studio, or "Open file…" in the presentation builder.'
    ];
    if (pf.dropped) lines.push('  ' + pf.dropped + ' large picture(s), such as an uploaded logo, were left out of the emailed project file to keep it under the size limit.');
    if (!techHtml && (opts.summaryText || '').trim()) lines.push('', 'CLIENT SUMMARY (' + opts.product + ')', opts.summaryText.trim());

    var ctl = ('AbortController' in global) ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 30000);
    return fetch(ENDPOINT, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctl ? ctl.signal : undefined,
      body: JSON.stringify({
        kind: 'project',
        subject: 'Configuration project: ' + label(p) + ' (' + opts.product + ')',
        body: lines.join('\n').slice(0, 7500),
        replyTo: EMAIL_RE.test(reg.email || '') ? reg.email : SENT_TO,
        website: '',                                                     // the service's spam trap: always empty
        page: opts.page || (location.pathname.split('/').pop() || ''),
        attachments: attachments
      })
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { return { ok: !!(r.ok && j && j.ok), error: (j && j.error) || (r.ok ? '' : 'The email service answered ' + r.status) }; });
    }).catch(function () {
      return { ok: false, error: 'Could not reach the email service.' };
    }).then(function (res) { clearTimeout(timer); return res; });
  }

  function download(project) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' }));
    a.download = 'smartalock-project-' + fileBase(project) + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
  }

  global.SendProject = { send: send, download: download, sentTo: SENT_TO };
})(window);
