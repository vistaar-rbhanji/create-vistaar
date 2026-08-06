(function () {
  function enhance(pre) {
    if (pre.closest(".pre-wrap")) return;
    var wrap = document.createElement("div");
    wrap.className = "pre-wrap";
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy-btn";
    btn.textContent = "Copy";
    wrap.appendChild(btn);

    btn.addEventListener("click", function () {
      var text = pre.innerText.replace(/\n$/, "");
      function done() {
        btn.textContent = "Copied ✓";
        btn.setAttribute("data-copied", "true");
        setTimeout(function () {
          btn.textContent = "Copy";
          btn.removeAttribute("data-copied");
        }, 1400);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () {
          fallbackCopy(text, done);
        });
      } else {
        fallbackCopy(text, done);
      }
    });
  }

  function fallbackCopy(text, done) {
    var ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      done();
    } catch (_) {}
    document.body.removeChild(ta);
  }

  function init() {
    document.querySelectorAll("pre > code, pre").forEach(function (node) {
      var pre = node.tagName === "PRE" ? node : node.parentElement;
      if (pre && pre.tagName === "PRE") enhance(pre);
    });
  }

  document.addEventListener("DOMContentLoaded", init);
  window.VistaarClipboard = { init: init };
})();
