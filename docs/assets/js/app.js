(function () {
  function setCurrentNav() {
    var path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    if (!path || path === "") path = "index.html";
    document.querySelectorAll("[data-nav]").forEach(function (link) {
      var href = (link.getAttribute("href") || "").toLowerCase();
      if (href === path || (path === "" && href === "index.html")) {
        link.setAttribute("aria-current", "page");
      }
    });
  }

  function initAccordion() {
    document.querySelectorAll(".accordion-item").forEach(function (item) {
      var trigger = item.querySelector(".accordion-trigger");
      if (!trigger) return;
      trigger.addEventListener("click", function () {
        var open = item.getAttribute("data-open") === "true";
        var next = open ? "false" : "true";
        item.setAttribute("data-open", next);
        trigger.setAttribute("aria-expanded", next);
      });
    });

    if (location.hash) {
      var target = document.querySelector(location.hash);
      if (target && target.classList.contains("accordion-item")) {
        target.setAttribute("data-open", "true");
      }
    }
  }

  function initMobileNav() {
    var toggle = document.getElementById("mobile-nav-toggle");
    var searchToggle = document.getElementById("search-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        document.body.classList.toggle("sidebar-open");
      });
    }
    if (searchToggle) {
      searchToggle.addEventListener("click", function () {
        document.body.classList.toggle("search-open");
        var input = document.getElementById("site-search");
        if (input) input.focus();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    setCurrentNav();
    initAccordion();
    initMobileNav();
  });
})();
