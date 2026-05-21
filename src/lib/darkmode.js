// src/lib/darkmode.js — Polyglot Translate v0.2.0 Dark Mode Controller

const DARKMODE_KEY = "polyglot-theme";

const darkMode = {
  get currentTheme() {
    return document.documentElement.getAttribute("data-theme");
  },

  init() {
    const saved = localStorage.getItem(DARKMODE_KEY);
    if (saved) {
      document.documentElement.setAttribute("data-theme", saved);
      return;
    }
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = prefersDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", initial);
  },

  initFromConfig(darkModeConfig) {
    switch (darkModeConfig) {
      case "yes":
        document.documentElement.setAttribute("data-theme", "dark");
        break;
      case "no":
        document.documentElement.setAttribute("data-theme", "light");
        localStorage.removeItem(DARKMODE_KEY);
        break;
      case "auto":
      default:
        localStorage.removeItem(DARKMODE_KEY);
        const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
        break;
    }
  },

  toggle() {
    const current = this.currentTheme;
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(DARKMODE_KEY, next);
    return next;
  },

  set(theme) {
    if (theme !== "light" && theme !== "dark") return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(DARKMODE_KEY, theme);
  },
};

darkMode.init();

if (window.matchMedia) {
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (!localStorage.getItem(DARKMODE_KEY)) {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
    }
  });
}
