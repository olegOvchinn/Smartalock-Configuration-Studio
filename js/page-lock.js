/* page-lock.js — simple password gate for an internal page.
   Include as the FIRST script in <head>:  <script src="../js/page-lock.js"></script>
   The page stays hidden until the password is entered; the unlock lasts for the
   browser tab session. To change the password, replace HASH with the SHA-256 of
   "smartalock-tech-summary|<new password>".
   NOTE: this is a deterrent, not real security — see the hub/readme notes. */
(function () {
  var HASH = 'cc17b64c9e8141a670fb1fe76ab9e82236f3848d3c10258f0c40e43aba456c0e';
  var SALT = 'smartalock-tech-summary|';
  var KEY = 'techSummaryUnlocked';

  try { if (sessionStorage.getItem(KEY) === HASH) return; } catch (e) {}

  // compact SHA-256 (works on file:// and http:// too, no crypto.subtle needed)
  function sha256(str) {
    var bytes = unescape(encodeURIComponent(str)), i, j, l = bytes.length, w = [], H = [
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    var K = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
    for (i = 0; i < (((l + 8) >> 6) + 1) * 16; i++) w[i] = 0;
    for (i = 0; i < l; i++) w[i >> 2] |= bytes.charCodeAt(i) << (24 - (i % 4) * 8);
    w[l >> 2] |= 0x80 << (24 - (l % 4) * 8);
    w[(((l + 8) >> 6) + 1) * 16 - 1] = l * 8;
    function r(x, n) { return (x >>> n) | (x << (32 - n)); }
    for (j = 0; j < w.length; j += 16) {
      var a = H.slice(), x = w.slice(j, j + 16), t;
      for (i = 0; i < 64; i++) {
        if (i >= 16) {
          var s0 = r(x[i - 15], 7) ^ r(x[i - 15], 18) ^ (x[i - 15] >>> 3);
          var s1 = r(x[i - 2], 17) ^ r(x[i - 2], 19) ^ (x[i - 2] >>> 10);
          x[i] = (x[i - 16] + s0 + x[i - 7] + s1) | 0;
        }
        var S1 = r(a[4], 6) ^ r(a[4], 11) ^ r(a[4], 25), ch = (a[4] & a[5]) ^ (~a[4] & a[6]);
        var t1 = (a[7] + S1 + ch + K[i] + x[i]) | 0;
        var S0 = r(a[0], 2) ^ r(a[0], 13) ^ r(a[0], 22), mj = (a[0] & a[1]) ^ (a[0] & a[2]) ^ (a[1] & a[2]);
        var t2 = (S0 + mj) | 0;
        a = [(t1 + t2) | 0, a[0], a[1], a[2], (a[3] + t1) | 0, a[4], a[5], a[6]];
      }
      for (i = 0; i < 8; i++) H[i] = (H[i] + a[i]) | 0;
    }
    var out = '';
    for (i = 0; i < 8; i++) out += ('00000000' + (H[i] >>> 0).toString(16)).slice(-8);
    return out;
  }

  // hide the page straight away, before it paints
  var hide = document.createElement('style');
  hide.id = 'pageLockHide';
  hide.textContent = 'body{visibility:hidden!important}';
  document.head.appendChild(hide);

  function show() {
    var gate = document.getElementById('pageLockGate');
    if (gate) gate.remove();
    var h = document.getElementById('pageLockHide');
    if (h) h.remove();
  }

  function build() {
    var gate = document.createElement('div');
    gate.id = 'pageLockGate';
    gate.setAttribute('style',
      'visibility:visible;position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;' +
      'justify-content:center;background:#f5f5f7;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;');
    gate.innerHTML =
      '<form id="pageLockForm" style="background:#fff;border:1px solid #e3e3e8;border-radius:16px;padding:32px;' +
      'width:min(360px,calc(100vw - 32px));box-shadow:0 8px 30px rgba(0,0,0,.08);color:#1d1d1f">' +
      '<h1 style="font-size:20px;margin:0 0 6px;font-weight:600">Tech summary</h1>' +
      '<p style="margin:0 0 18px;font-size:14px;color:#6e6e73">This page is for internal use. Enter the password to continue.</p>' +
      '<label for="pageLockPw" style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">Password</label>' +
      '<input id="pageLockPw" type="password" autocomplete="off" autofocus style="width:100%;box-sizing:border-box;' +
      'font:inherit;font-size:16px;padding:10px 12px;border:1px solid #c7c7cc;border-radius:10px;background:#fff;color:#1d1d1f">' +
      '<p id="pageLockErr" role="alert" style="min-height:18px;margin:8px 0 0;font-size:13px;color:#c0392b"></p>' +
      '<button type="submit" style="margin-top:8px;width:100%;font:inherit;font-weight:600;font-size:15px;padding:11px;' +
      'border:0;border-radius:10px;background:#0a6cff;color:#fff;cursor:pointer">Unlock</button>' +
      '</form>';
    document.body.appendChild(gate);
    var pw = document.getElementById('pageLockPw');
    pw.focus();
    document.getElementById('pageLockForm').addEventListener('submit', function (e) {
      e.preventDefault();
      if (sha256(SALT + pw.value) === HASH) {
        try { sessionStorage.setItem(KEY, HASH); } catch (x) {}
        show();
      } else {
        document.getElementById('pageLockErr').textContent = 'Incorrect password.';
        pw.value = ''; pw.focus();
      }
    });
  }

  if (document.body) build();
  else document.addEventListener('DOMContentLoaded', build);
})();
