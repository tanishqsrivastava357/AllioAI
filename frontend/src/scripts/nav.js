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
  };

  navToggle.addEventListener("click", () => {
    setMenuState(!header.classList.contains("menu-open"));
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  header.querySelectorAll(".header-actions a").forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 720) {
      setMenuState(false);
    }
  });
})();
