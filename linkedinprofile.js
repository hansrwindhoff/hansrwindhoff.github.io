(function (c) {
  c.LIRenderAll = function () {
    function t(a) {
      return Array.prototype.slice
        .call(a.attributes)
        .filter(function (a) {
          return -1 !== a.name.lastIndexOf("data-key-", 0);
        })
        .map(function (a) {
          return (
            encodeURIComponent(a.name.replace("data-", "").toLowerCase()) +
            "\x3d" +
            encodeURIComponent(a.value)
          );
        });
    }
    function u(a) {
      var d = a.getAttribute("data-size"),
        b = a.getAttribute("data-locale"),
        e = a.getAttribute("data-type"),
        v = a.getAttribute("data-theme"),
        h = a.getAttribute("data-vanity"),
        g = a.getAttribute("data-version"),
        f = a.getAttribute("data-ei"),
        l = a.getAttribute("data-entity"),
        m = a.getAttribute("data-iscreate"),
        k = Math.round(1e6 * Math.random());
      f = f ? "https://badges.linkedin-ei" : "https://badges.linkedin";
      f =
        "undefined" !== typeof c &&
        /linkedin(-ei)?.cn$/.test((c.location && c.location.hostname) || "")
          ? f + ".cn/"
          : f + ".com/";
      b = [
        "locale\x3d" + encodeURIComponent(b),
        "badgetype\x3d" + encodeURIComponent(e),
        "badgetheme\x3d" + encodeURIComponent(v),
        "uid\x3d" + encodeURIComponent(k),
        "version\x3d" + encodeURIComponent(g),
      ];
      "v2" === g
        ? ((f += "view"),
          b.push("badgesize\x3d" + encodeURIComponent(d)),
          b.push("entity\x3d" + encodeURIComponent(l)),
          (b = b.concat(t(a))))
        : ((f += "profile"),
          b.push("maxsize\x3d" + encodeURIComponent(d)),
          b.push("trk\x3d" + encodeURIComponent("profile-badge")),
          b.push("vanityname\x3d" + encodeURIComponent(h)));
      m && b.push("fromCreate\x3dtrue");
      d = f + "?" + b.join("\x26");
      a.setAttribute("data-uid", k);
      a = document.createElement("script");
      a.src = d;
      p.push(a);
      document.body.appendChild(a);
    }
    function q(a, d) {
      if (
        "SCRIPT" !== a.tagName ||
        r[a.src] ||
        (d && (!d || a.getAttribute("data-isartdeco")))
      )
        for (var b = 0, e = a.childNodes; b < e.length; ) q(e[b++], d);
      else a.parentNode.replaceChild(w(a), a), (r[a.src] = !0);
      return a;
    }
    function w(a) {
      for (
        var d = document.createElement("script"), b = a.attributes.length - 1;
        0 <= b;
        b--
      )
        d.setAttribute(a.attributes[b].name, a.attributes[b].value);
      return d;
    }
    function x() {
      if ((k >= n && 0 < n) || k >= h.length)
        delete c.LIBadgeCallback,
          p.map(function (a) {
            document.body.removeChild(a);
          });
    }
    var k = 0,
      n = 0,
      p = [],
      r = {},
      h = Array.prototype.slice.call(
        document.querySelectorAll(".LI-profile-badge, .LI-entity-badge")
      ),
      g,
      l,
      m,
      s;
    g = 0;
    for (l = h.length; g < l; g++)
      (m = h[g]),
        (s = m.getAttribute("data-rendered")),
        s || (n++, m.setAttribute("data-rendered", !0), u(m));
    c.LIBadgeCallback = function (a, d) {
      k++;
      var b, e, c, g;
      b = 0;
      for (l = h.length; b < l; b++)
        (e = h[b]),
          (g = e.getAttribute("data-iscreate")),
          (c = parseInt(e.getAttribute("data-uid"), 10)),
          c === d &&
            ((c = document.createElement("div")),
            (c.innerHTML = a),
            e.appendChild(c),
            q(e, g));
      x();
    };
  };
  "complete" === document.readyState
    ? c.LIRenderAll()
    : c.addEventListener("load", c.LIRenderAll, !1);
})(window);
