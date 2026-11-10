/* site-footer.js
   Adds the Agile Workspace copyright / contact footer to the bottom of every page of the site.
   Include just before </body> with a path relative to the page, e.g.
     <script src="site-footer.js"></script>            (site root)
     <script src="../site-footer.js"></script>         (troubleshooting/, presentation-builder/, configuration-studio/)
     <script src="../../site-footer.js"></script>      (configuration-studio/pages/)
   To change the text, edit DETAILS below: every page picks it up. The footer takes its text colour from the
   page, so it reads on both the light pages and the dark (night) theme. */
(function () {
  'use strict';
  if (window.__siteFooter) return;
  window.__siteFooter = true;

  var YEAR_FROM = 2016;
  var DETAILS = {
    company: 'Agile Workspace Limited',
    address: 'Ground Floor, 31 Boston Road, Grafton, Auckland 1023, New Zealand',
    sites: [['smartalock.com', 'https://smartalock.com'], ['floorsen.se', 'https://floorsen.se/']],
    sales: 'sales@smartalock.com',
    support: 'support@smartalock.com',
    phone: ['+64 9 320 0140', '+6493200140']
  };

  var css =
    '.awl-foot{box-sizing:border-box;clear:both;width:100%;margin:40px 0 0;padding:22px 16px 28px;' +
      'border-top:1px solid rgba(128,128,128,.25);font:400 12px/1.65 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;' +
      'text-align:center;color:inherit;background:transparent;position:relative;z-index:1}' +
    '.awl-foot .awl-in{max-width:900px;margin:0 auto;opacity:.72}' +
    '.awl-foot p{margin:0 0 4px}' +
    '.awl-foot b{font-weight:600}' +
    '.awl-foot a{color:inherit;text-decoration:underline;text-decoration-color:rgba(128,128,128,.55);text-underline-offset:2px}' +
    '.awl-foot a:hover{text-decoration-color:currentColor}' +
    '.awl-foot .awl-sep{margin:0 7px;opacity:.6}' +
    '.awl-foot .awl-copy{margin-top:8px}' +
    '@media print{.awl-foot{margin-top:16px;padding:10px 0 0;font-size:9px}.awl-foot .awl-in{opacity:1}}';

  function a(t, h) { return '<a href="' + h + '"' + (/^https?:/.test(h) ? ' target="_blank" rel="noopener"' : '') + '>' + t + '</a>'; }
  var SEP = '<span class="awl-sep" aria-hidden="true">&middot;</span>';

  function build() {
    if (document.querySelector('.awl-foot')) return;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var d = DETAILS, now = new Date().getFullYear();
    var support = d.support;   /* support@smartalock.com, our main support contact, on every page */
    var f = document.createElement('footer');
    f.className = 'awl-foot'; f.setAttribute('role', 'contentinfo');
    f.innerHTML = '<div class="awl-in">' +
      '<p>' + d.sites.map(function (s) { return a(s[0], s[1]); }).join(SEP) + SEP +
        'Sales: ' + a(d.sales, 'mailto:' + d.sales) + SEP +
        'Support: ' + a(support, 'mailto:' + support) + SEP +
        a(d.phone[0], 'tel:' + d.phone[1]) + '</p>' +
      '<p class="awl-copy">&copy; ' + YEAR_FROM + (now > YEAR_FROM ? '&ndash;' + now : '') + ' ' + d.company + '. All Rights Reserved.</p>' +
      '</div>';
    document.body.appendChild(f);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
