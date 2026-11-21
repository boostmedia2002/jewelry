/* live360.js — one-time install for jewelry stores.
   The store pastes ONE line on all pages:
     <script src="https://boostmedia2002.github.io/jewelry/3d-demo/live360.js" data-store="STORE_ID" defer></script>
   We list the store's products in clients/STORE_ID.json. On a listed product page,
   a "360°" button appears on the main product photo. No other work for the store. */
(function () {
  var BASE = "https://boostmedia2002.github.io/jewelry/3d-demo/";
  var MV = "https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js";
  var me = document.currentScript;
  var store = (me && me.getAttribute("data-store")) || "demo";
  var cfg = null, product = null, btn = null, target = null, raf = 0;

  var css = "" +
    ".l360-btn{position:absolute;z-index:2147483000;display:flex;align-items:center;gap:6px;border:0;border-radius:999px;padding:9px 14px;background:rgba(17,17,17,.85);color:#fff;font:600 14px system-ui,-apple-system,Arial,sans-serif;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.2)}" +
    ".l360-modal{position:fixed;inset:0;z-index:2147483001;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center}" +
    ".l360-box{position:relative;width:min(94vw,620px);height:min(82vh,620px);background:#fff;border-radius:18px;overflow:hidden}" +
    ".l360-box model-viewer{width:100%;height:100%;--poster-color:transparent}" +
    ".l360-x{position:absolute;top:10px;right:10px;z-index:3;width:38px;height:38px;border-radius:50%;border:0;background:#111;color:#fff;font:20px/38px Arial,sans-serif;cursor:pointer;padding:0}" +
    ".l360-ar{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);border:0;border-radius:999px;padding:11px 18px;background:#111;color:#fff;font:600 14px system-ui,Arial,sans-serif}" +
    ".l360-hint{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:rgba(17,17,17,.72);color:#fff;font:500 14px system-ui,Arial,sans-serif;padding:10px 16px;border-radius:999px;pointer-events:none;transition:opacity .4s;white-space:nowrap}" +
    ".l360-hint.off{opacity:0}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  function loadViewer() {
    if (window.customElements && customElements.get("model-viewer")) return;
    if (document.querySelector("script[data-l360]")) return;
    var s = document.createElement("script"); s.type = "module"; s.src = MV; s.setAttribute("data-l360", "1");
    document.head.appendChild(s);
  }

  function findProduct() {
    var url = decodeURIComponent(location.pathname + location.search).toLowerCase();
    var list = (cfg && cfg.products) || [];
    for (var i = 0; i < list.length; i++) {
      if (url.indexOf(String(list[i].match).toLowerCase()) !== -1) return list[i];
    }
    return null;
  }

  function mainImage() {
    var best = null, bestArea = 0;
    var imgs = document.querySelectorAll("img");
    for (var i = 0; i < imgs.length; i++) {
      var r = imgs[i].getBoundingClientRect();
      if (r.width < 150 || r.height < 150) continue;
      if (r.top + window.scrollY > 1500) continue;
      var a = r.width * r.height;
      if (a > bestArea) { bestArea = a; best = imgs[i]; }
    }
    return best;
  }

  function place() {
    raf = 0;
    if (!btn) return;
    if (!target || !document.body.contains(target)) target = mainImage();
    if (!target) { btn.style.display = "none"; return; }
    var r = target.getBoundingClientRect();
    if (r.width === 0) { btn.style.display = "none"; return; }
    btn.style.display = "flex";
    btn.style.top = (r.bottom + window.scrollY - btn.offsetHeight - 12) + "px";
    btn.style.left = (r.left + window.scrollX + 12) + "px";
  }
  function schedule() { if (!raf) raf = requestAnimationFrame(place); }

  function open() {
    if (!product) return;
    loadViewer();
    var m = document.createElement("div"); m.className = "l360-modal";
    var box = document.createElement("div"); box.className = "l360-box";
    var x = document.createElement("button"); x.className = "l360-x"; x.type = "button"; x.setAttribute("aria-label", "סגירה"); x.textContent = "×";
    var mv = document.createElement("model-viewer");
    mv.setAttribute("dir", "ltr");
    mv.setAttribute("src", BASE + product.glb);
    if (product.usdz) mv.setAttribute("ios-src", BASE + product.usdz);
    ["camera-controls", "auto-rotate", "ar"].forEach(function (a) { mv.setAttribute(a, ""); });
    mv.setAttribute("camera-orbit", "0deg 75deg 115%");
    mv.setAttribute("touch-action", "pan-y"); mv.setAttribute("interaction-prompt", "none");
    mv.setAttribute("auto-rotate-delay", "2500"); mv.setAttribute("environment-image", "neutral");
    mv.setAttribute("shadow-intensity", "0.5"); mv.setAttribute("min-camera-orbit", "auto auto 2%");
    mv.setAttribute("ar-modes", "scene-viewer webxr quick-look"); mv.setAttribute("ar-scale", "fixed");
    mv.setAttribute("alt", product.name || "תכשיט בתלת מימד");
    mv.innerHTML = '<button slot="ar-button" class="l360-ar" dir="rtl">צפו בתכשיט על השולחן</button>' +
                   '<div class="l360-hint" dir="rtl">גררו לסיבוב · צבטו להגדלה</div>';
    box.appendChild(x); box.appendChild(mv); m.appendChild(box); document.body.appendChild(m);
    var hint = mv.querySelector(".l360-hint"), hide = function () { hint.classList.add("off"); };
    mv.addEventListener("camera-change", function (e) { if (e.detail && e.detail.source === "user-interaction") hide(); });
    setTimeout(hide, 4000);
    var close = function () { m.remove(); };
    x.onclick = close;
    m.addEventListener("click", function (e) { if (e.target === m) close(); });
  }

  function tick() {
    var p = findProduct();
    if (!p) {
      if (btn) { btn.remove(); btn = null; }
      product = null; target = null; return;
    }
    if (p !== product) { product = p; target = null; loadViewer(); }
    if (!btn) {
      btn = document.createElement("button"); btn.type = "button"; btn.className = "l360-btn"; btn.dir = "rtl";
      btn.innerHTML = "<span>360°</span><span>צפייה</span>";
      btn.onclick = function (e) { e.preventDefault(); e.stopPropagation(); open(); };
      document.body.appendChild(btn);
    }
    place();
  }

  fetch(BASE + "clients/" + encodeURIComponent(store) + ".json", { cache: "no-store" })
    .then(function (r) { return r.json(); })
    .then(function (c) {
      cfg = c; tick();
      setInterval(tick, 1000); /* catches page changes on sites like Wix */
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
    })
    .catch(function () {});
})();
