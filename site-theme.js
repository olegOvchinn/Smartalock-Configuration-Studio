/* site-theme.js: the troubleshooting wizards' Night / Bright look for every page of the site.
   Load it in <head> (it sets the theme before the page paints):  <script src="../site-theme.js"></script>
   with the stylesheet next to it:                                  <link rel="stylesheet" href="../site-theme.css">
   - The choice is shared with the Troubleshooting Hub and the tools page: localStorage "stw_theme" = "dark" | "light".
     Nothing saved = Day (light).
   - Adds the neon backdrop (glow + moving floor grid) and a day/night switch. Pages that already have their own
     switch (#themeToggle) keep it. A page can say where the switch goes with an element carrying data-theme-slot. */
(function () {
  'use strict';
  var KEY = 'stw_theme', root = document.documentElement;
  function saved() { try { var t = localStorage.getItem(KEY); return t === 'light' || t === 'dark' ? t : null; } catch (e) { return null; } }
  function apply(t) {
    root.setAttribute('data-theme', t);
    root.classList.toggle('st-night', t === 'dark');
    var b = document.body;
    if (b && b.dataset.neonPage) b.classList.toggle('neon', t === 'dark');     // troubleshooting wizard pages
    var sw = document.getElementById('stThemeSwitch');
    if (sw) { sw.setAttribute('aria-checked', String(t === 'dark')); sw.title = t === 'dark' ? 'Switch to day mode' : 'Switch to night mode'; }
  }
  apply(saved() || 'light');   // Day (light) unless Night was chosen
  window.siteTheme = {
    get: function () { return root.getAttribute('data-theme'); },
    set: function (t) { try { localStorage.setItem(KEY, t); } catch (e) {} apply(t); }
  };

  /* Page titles get the hub's heading style: thin text with the last word bold in the cyan-to-violet gradient
     ("What needs <b>fixing?</b>"). Only big headings that don't already highlight a word are changed. */
  function highlightTitles() {
    document.querySelectorAll('h1').forEach(function (h) {
      if (h.querySelector('b, strong, .st-hl') || h.closest('[data-no-title-style]')) return;
      var fs = parseFloat(getComputedStyle(h).fontSize) || 0;
      if (fs < 30 || h.offsetParent === null) return;
      var walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT), last = null, n;
      while ((n = walker.nextNode())) if (n.nodeValue.trim()) last = n;
      if (!last || h.textContent.trim().split(/\s+/).length < 2) return;
      var m = last.nodeValue.match(/^([\s\S]*?)(\S+)(\s*)$/); if (!m) return;
      var b = document.createElement('b'); b.className = 'st-hl'; b.textContent = m[2];
      var frag = document.createDocumentFragment();
      if (m[1]) frag.appendChild(document.createTextNode(m[1]));
      frag.appendChild(b);
      if (m[3]) frag.appendChild(document.createTextNode(m[3]));
      last.parentNode.replaceChild(frag, last);
      h.classList.add('st-title');
    });
  }

  function build() {
    if (window.__siteThemeBuilt) return; window.__siteThemeBuilt = true;
    highlightTitles();
    if (!document.querySelector('.st-scene, .neon-scene, .scene')) {
      var sc = document.createElement('div'); sc.className = 'st-scene'; sc.setAttribute('aria-hidden', 'true');
      sc.innerHTML = '<div class="st-floor"></div>';
      document.body.insertBefore(sc, document.body.firstChild);
    }
    if (document.getElementById('themeToggle') || document.body.hasAttribute('data-no-theme-switch')) return;
    var sw = document.createElement('button');
    sw.type = 'button'; sw.id = 'stThemeSwitch'; sw.className = 'st-switch'; sw.setAttribute('role', 'switch'); sw.setAttribute('aria-label', 'Night mode');
    sw.innerHTML = '<span class="st-knob" aria-hidden="true"></span>' +
      '<svg class="st-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/></svg>' +
      '<svg class="st-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>';
    sw.addEventListener('click', function () { window.siteTheme.set(window.siteTheme.get() === 'dark' ? 'light' : 'dark'); });
    var slot = document.querySelector('[data-theme-slot]');
    if (slot) { sw.classList.add('st-inline'); slot.appendChild(sw); }
    else {
      sw.classList.add('st-float'); document.body.appendChild(sw);
      /* sit just left of the "Project file" button when the page has one */
      var place = function () {
        var pf = document.querySelector('.pf-btn');
        if (pf && pf.offsetParent !== null) {
          var r = pf.getBoundingClientRect(), fixed = getComputedStyle(pf).position === 'fixed';
          sw.style.position = 'fixed';   /* always pinned to the top of the window, even when the button scrolls away */
          sw.style.top = (r.top + (fixed ? 0 : window.scrollY) + (r.height - 32) / 2) + 'px';
          sw.style.right = (document.documentElement.clientWidth - r.left + 10) + 'px';
        } else { sw.style.position = 'fixed'; sw.style.top = '12px'; sw.style.right = '14px'; }
      };
      place(); setTimeout(place, 300); setTimeout(place, 1200); window.addEventListener('resize', place);
    }
    apply(window.siteTheme.get());
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
