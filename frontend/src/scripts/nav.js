(() => {
  "use strict";

  const header = document.querySelector(".header");
  const navToggle = document.querySelector(".nav-toggle");
  const mainNav = document.querySelector(".main-nav");

  if (!header || !navToggle || !mainNav) {
    return;
  }

  const setMenuState = (isOpen) => {
    header.classList.toggle("menu-open", isOpen);
    mainNav.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    if (isOpen) {
      const firstLink = mainNav.querySelector("a");
      if (firstLink && window.matchMedia("(max-width: 720px)").matches) firstLink.focus();
    }
  };

  navToggle.addEventListener("click", () => {
    setMenuState(!header.classList.contains("menu-open"));
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      setMenuState(false);
      navToggle.focus();
    });
  });

  header.querySelectorAll(".header-actions a").forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  navToggle.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && header.classList.contains("menu-open")) {
      setMenuState(false);
      navToggle.focus();
    }
  });

  mainNav.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && header.classList.contains("menu-open")) {
      setMenuState(false);
      navToggle.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 720) {
      setMenuState(false);
    }
  });
})();
