(function () {
  var INDEX = [
    { title: "Home", href: "index.html", section: "Pages", keywords: "vistaar home hero scaffold cli" },
    { title: "Getting Started", href: "getting-started.html", section: "Pages", keywords: "quick start first project requirements" },
    { title: "What is Vistaar", href: "getting-started.html#what-is-vistaar", section: "Getting Started", keywords: "overview why use" },
    { title: "Requirements", href: "getting-started.html#requirements", section: "Getting Started", keywords: "node git" },
    { title: "Quick Start", href: "getting-started.html#quick-start", section: "Getting Started", keywords: "npx create-vistaar first project" },
    { title: "Installation", href: "installation.html", section: "Pages", keywords: "npx npm global local update uninstall" },
    { title: "Using npx", href: "installation.html#npx", section: "Installation", keywords: "npx create-vistaar" },
    { title: "Global install", href: "installation.html#global", section: "Installation", keywords: "npm install -g" },
    { title: "CLI Reference", href: "cli.html", section: "Pages", keywords: "create-vistaar vistaar doctor add generate update" },
    { title: "create-vistaar", href: "cli.html#create-vistaar", section: "CLI", keywords: "scaffold create project" },
    { title: "vistaar doctor", href: "cli.html#doctor", section: "CLI", keywords: "diagnose health check" },
    { title: "vistaar add", href: "cli.html#add", section: "CLI", keywords: "modules coming soon auth rbac" },
    { title: "vistaar generate", href: "cli.html#generate", section: "CLI", keywords: "crud coming soon" },
    { title: "vistaar update", href: "cli.html#update", section: "CLI", keywords: "upgrade coming soon" },
    { title: "Roadmap", href: "roadmap.html", section: "Pages", keywords: "features upcoming future marketplace" },
    { title: "FAQ", href: "faq.html", section: "Pages", keywords: "free javascript typescript docker contribute" },
    { title: "Is Vistaar free?", href: "faq.html#free", section: "FAQ", keywords: "license open source" },
    { title: "JavaScript support", href: "faq.html#javascript", section: "FAQ", keywords: "js language" },
    { title: "TypeScript support", href: "faq.html#typescript", section: "FAQ", keywords: "ts language" },
    { title: "Frontend-only apps", href: "faq.html#frontend-only", section: "FAQ", keywords: "backend none" },
    { title: "Docker support", href: "faq.html#docker", section: "FAQ", keywords: "compose containers" },
    { title: "Contributing", href: "faq.html#contribute", section: "FAQ", keywords: "contribute github" }
  ];

  function normalize(s) {
    return (s || "").toLowerCase();
  }

  function search(query) {
    var q = normalize(query).trim();
    if (!q) return [];
    return INDEX.filter(function (item) {
      var hay = normalize(item.title + " " + item.section + " " + item.keywords);
      return hay.indexOf(q) !== -1;
    }).slice(0, 8);
  }

  function render(results, panel) {
    if (!results.length) {
      panel.innerHTML = '<div class="search-empty meta">No matches</div>';
      panel.setAttribute("data-open", "true");
      return;
    }
    panel.innerHTML = results
      .map(function (r) {
        return (
          '<a href="' +
          r.href +
          '"><strong>' +
          r.title +
          '</strong><span class="meta">' +
          r.section +
          "</span></a>"
        );
      })
      .join("");
    panel.setAttribute("data-open", "true");
  }

  function init() {
    var input = document.getElementById("site-search");
    var panel = document.getElementById("search-results");
    if (!input || !panel) return;

    input.addEventListener("input", function () {
      var results = search(input.value);
      if (!input.value.trim()) {
        panel.setAttribute("data-open", "false");
        panel.innerHTML = "";
        return;
      }
      render(results, panel);
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        panel.setAttribute("data-open", "false");
        input.blur();
      }
    });

    document.addEventListener("click", function (e) {
      if (!e.target.closest(".search-wrap")) {
        panel.setAttribute("data-open", "false");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);
  window.VistaarSearch = { search: search, index: INDEX };
})();
