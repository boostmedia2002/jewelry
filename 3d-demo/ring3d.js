/* ring3d.js — turns any product image into a 3D viewer.
   Usage: <script src="https://boostmedia2002.github.io/jewelry/3d-demo/ring3d.js" defer></script>
          <img src="photo.jpg" data-model="https://.../ring.glb">                       */
(function () {
  var MV = "https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js";
  function loadMV() {
    if (customElements.get("model-viewer") || document.querySelector("script[data-r3d]")) return;
    var s = document.createElement("script");
    s.type = "module"; s.src = MV; s.setAttribute("data-r3d", "1");
    document.head.appendChild(s);
  }
  var css = ".r3d-wrap{position:relative;display:inline-block;line-height:0}" +
    ".r3d-btn{position:absolute;right:10px;bottom:10px;border:0;border-radius:999px;padding:8px 14px;" +
    "font:600 13px system-ui,sans-serif;background:rgba(20,20,20,.82);color:#fff;cursor:pointer;line-height:1}" +
    ".r3d-modal{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:99999}" +
    ".r3d-box{position:relative;width:min(92vw,640px);height:min(80vh,640px);background:#fff;border-radius:16px;overflow:hidden}" +
    ".r3d-box model-viewer{width:100%;height:100%;--poster-color:transparent}" +
    ".r3d-x{position:absolute;top:10px;right:10px;z-index:2;width:36px;height:36px;border-radius:50%;border:0;background:#111;color:#fff;font-size:18px;cursor:pointer}" +
    ".r3d-ar{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);border:0;border-radius:999px;padding:10px 18px;background:#111;color:#fff;font:600 14px system-ui,sans-serif}";
  function open(src, alt, ios) {
    loadMV();
    var m = document.createElement("div");
    m.className = "r3d-modal";
    m.innerHTML = '<div class="r3d-box"><button class="r3d-x" aria-label="Close">×</button>' +
      '<model-viewer src="' + src + '"' + (ios ? ' ios-src="' + ios + '"' : '') + ' alt="' + (alt || "3D jewelry") + '" camera-controls touch-action="pan-y" ' +
      'auto-rotate shadow-intensity="0.6" exposure="1.1" environment-image="neutral" min-camera-orbit="auto auto 2%" ' +
      'ar ar-modes="scene-viewer webxr quick-look" ar-scale="fixed">' +
      '<button slot="ar-button" class="r3d-ar">View on your hand / table (AR)</button></model-viewer></div>';
    m.addEventListener("click", function (e) { if (e.target === m || e.target.className === "r3d-x") m.remove(); });
    document.body.appendChild(m);
  }
  function init() {
    var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    document.querySelectorAll("img[data-model]").forEach(function (img) {
      if (img.dataset.r3dDone) return; img.dataset.r3dDone = "1";
      var w = document.createElement("span"); w.className = "r3d-wrap";
      img.parentNode.insertBefore(w, img); w.appendChild(img);
      var b = document.createElement("button"); b.className = "r3d-btn"; b.type = "button";
      b.textContent = img.dataset.label || "360° View";
      b.onclick = function (e) { e.preventDefault(); open(img.dataset.model, img.alt, img.dataset.ios); };
      w.appendChild(b);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
