/* Innamo cookie consent + Google tag (AW-18578278209). The Google tag only loads after the visitor accepts. */
(function () {
  var TAG = 'AW-18578278209', KEY = 'innamo_cookie_consent';
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function loadTag() {
    if (window.__innamoTag) return; window.__innamoTag = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('consent', 'default', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted' });
    gtag('js', new Date());
    gtag('config', TAG);
    var s = document.createElement('script'); s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + TAG;
    document.head.appendChild(s);
  }
  function banner() {
    var css = document.createElement('style');
    css.textContent =
      '#innamo-cc{position:fixed;left:20px;right:20px;bottom:20px;max-width:560px;margin:0 auto;z-index:9999;' +
      'background:#2C1810;color:#F3EBDD;padding:22px 24px;box-shadow:0 10px 40px rgba(0,0,0,.25);' +
      'font-family:"EB Garamond",Georgia,serif;font-size:15px;line-height:1.6}' +
      '#innamo-cc p{margin:0 0 16px}' +
      '#innamo-cc .cc-btns{display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap}' +
      '#innamo-cc button{font-family:inherit;font-size:11px;letter-spacing:.2em;text-transform:uppercase;' +
      'padding:11px 22px;cursor:pointer;border:1px solid #F3EBDD;background:transparent;color:#F3EBDD}' +
      '#innamo-cc button.cc-yes{background:#B5603A;border-color:#B5603A;color:#fff}';
    document.head.appendChild(css);
    var d = document.createElement('div'); d.id = 'innamo-cc';
    d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Cookie preferences');
    d.innerHTML = '<p>We use a small number of cookies to understand how people find us through our ads. ' +
      'Nothing is set unless you say yes.</p><div class="cc-btns">' +
      '<button type="button" class="cc-no">Decline</button><button type="button" class="cc-yes">Accept</button></div>';
    document.body.appendChild(d);
    d.querySelector('.cc-yes').onclick = function () { set('granted'); d.remove(); loadTag(); };
    d.querySelector('.cc-no').onclick = function () { set('denied'); d.remove(); };
  }
  var c = get();
  if (c === 'granted') loadTag();
  else if (c !== 'denied') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', banner); else banner();
  }
})();
