/* Haoliday common.js */
(function () {
  "use strict";

  function getLanguage() {
    try {
      const saved = localStorage.getItem("language");
      if (saved === "zh" || saved === "en") return saved;
    } catch (error) {}
    return document.documentElement.lang.toLowerCase().startsWith("zh") ? "zh" : "en";
  }

  function updateLanguageButton(language) {
    const button = document.getElementById("sidebar-language-toggle");
    if (!button) return;

    const image = button.querySelector("img");
    const targetLanguage = language === "zh" ? "en" : "zh";
    button.dataset.lang = targetLanguage;

    if (targetLanguage === "en") {
      image.src = "images/button_en.png";
      image.alt = "ENG";
      button.setAttribute("aria-label", "Switch to English");
    } else {
      image.src = "images/button_cn.png";
      image.alt = "中文";
      button.setAttribute("aria-label", "切换到中文");
    }
  }

  function applyLanguage(language) {
    const lang = language === "zh" ? "zh" : "en";
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";

    document.querySelectorAll("[data-zh][data-en]").forEach((element) => {
      const translation = element.getAttribute("data-" + lang);
      if (translation !== null) element.innerHTML = translation;
    });

    try {
      localStorage.setItem("language", lang);
    } catch (error) {}

    updateLanguageButton(lang);

    document.dispatchEvent(new CustomEvent("haoliday:languagechange", {
      detail: { language: lang }
    }));

    return lang;
  }

  function closeMobileMenu() {
    document.body.classList.remove("sidebar-open");
    const toggle = document.getElementById("sidebar-menu-toggle");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    }
  }

  function isMobileViewport() {
    return window.matchMedia("(max-width: 768px)").matches;
  }

  function eventInsideSidebarOrToggle(target) {
    const sidebar = document.getElementById("sidebar");
    const menuButton = document.getElementById("sidebar-menu-toggle");
    const insideSidebar = sidebar && sidebar.contains(target);
    const insideToggle = menuButton && menuButton.contains(target);
    return insideSidebar || insideToggle;
  }

  function initSidebarControls() {
    const toggle = document.getElementById("sidebar-menu-toggle");
    const languageButton = document.getElementById("sidebar-language-toggle");

    if (toggle && !toggle.dataset.bound) {
      toggle.dataset.bound = "true";
      toggle.addEventListener("click", () => {
        const willOpen = !document.body.classList.contains("sidebar-open");
        document.body.classList.toggle("sidebar-open", willOpen);
        toggle.setAttribute("aria-expanded", String(willOpen));
        toggle.setAttribute("aria-label", willOpen ? "Close menu" : "Open menu");
      });
    }

    if (languageButton && !languageButton.dataset.bound) {
      languageButton.dataset.bound = "true";
      languageButton.addEventListener("click", () => {
        const target = languageButton.dataset.lang === "zh" ? "zh" : "en";
        applyLanguage(target);
      });
    }

    document.querySelectorAll("#sidebar a").forEach((link) => {
      if (link.dataset.menuBound) return;
      link.dataset.menuBound = "true";
      link.addEventListener("click", closeMobileMenu);
    });

    if (!document.documentElement.dataset.sidebarOutsideBound) {
      document.documentElement.dataset.sidebarOutsideBound = "true";

      const closeIfOutside = (target) => {
        if (!isMobileViewport()) return;
        if (!document.body.classList.contains("sidebar-open")) return;
        if (!eventInsideSidebarOrToggle(target)) closeMobileMenu();
      };

      document.addEventListener("click", (event) => {
        closeIfOutside(event.target);
      });

      document.addEventListener("touchstart", (event) => {
        closeIfOutside(event.target);
      }, { passive: true });

      document.addEventListener("touchmove", (event) => {
        closeIfOutside(event.target);
      }, { passive: true });

      window.addEventListener("scroll", () => {
        if (isMobileViewport() && document.body.classList.contains("sidebar-open")) {
          closeMobileMenu();
        }
      }, { passive: true });
    }

    if (!document.documentElement.dataset.sidebarEscapeBound) {
      document.documentElement.dataset.sidebarEscapeBound = "true";
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMobileMenu();
      });
    }

    if (!document.documentElement.dataset.sidebarResizeBound) {
      document.documentElement.dataset.sidebarResizeBound = "true";
      window.addEventListener("resize", () => {
        if (!isMobileViewport()) closeMobileMenu();
      });
    }
  }

  function highlightCurrentPage() {
    const currentFile = (location.pathname.split("/").pop() || "index.html").toLowerCase();

    document.querySelectorAll("#sidebar a[href]").forEach((link) => {
      const target = (link.getAttribute("href") || "").split("?")[0].split("/").pop().toLowerCase();
      const active = target === currentFile;
      link.classList.toggle("active", active);

      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  async function loadSidebar() {
    const placeholder = document.getElementById("sidebar-placeholder");
    if (!placeholder) {
      applyLanguage(getLanguage());
      return;
    }

    try {
      const response = await fetch("sidebar.html", { cache: "no-cache" });
      if (!response.ok) throw new Error("sidebar.html: HTTP " + response.status);

      placeholder.innerHTML = await response.text();

      initSidebarControls();
      highlightCurrentPage();
      applyLanguage(getLanguage());

      document.body.classList.add("sidebar-ready");
    } catch (error) {
      console.error("[Haoliday] Failed to load sidebar:", error);
    }
  }

  window.applyLanguage = applyLanguage;
  window.initFullPageLanguage = function () {
    return applyLanguage(getLanguage());
  };
  window.haolidaySetLanguage = applyLanguage;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadSidebar, { once: true });
  } else {
    loadSidebar();
  }
})();
