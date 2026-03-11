(function () {
  var backlinks = [
    { href: "https://trading-verifie.com/", text: "Trading Vérifié" },
    { href: "https://avis-invest.com/", text: "Avis Invest" },
  ];

  function injectBacklinks() {
    var footerText = document.getElementById("text-59a6a066");
    if (!footerText) return false;

    var em = footerText.querySelector("em");
    if (!em) return false;

    if (em.querySelector("a[data-pf-backlink]")) return true;

    backlinks.forEach(function (backlink, index) {
      em.appendChild(document.createTextNode(" | "));

      var link = document.createElement("a");
      link.href = backlink.href;
      link.textContent = backlink.text;
      link.target = "_blank";
      link.rel = "noopener";
      link.style.color = "inherit";
      link.style.textDecoration = "underline";
      link.setAttribute("data-pf-backlink", String(index));
      em.appendChild(link);
    });

    return true;
  }

  if (injectBacklinks()) return;

  var attempt = 0;
  var interval = setInterval(function () {
    attempt += 1;
    if (injectBacklinks() || attempt >= 20) clearInterval(interval);
  }, 250);
})();
