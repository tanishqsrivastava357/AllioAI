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
    header.classList.remove("header-hidden");
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

  let lastScrollY = window.scrollY;
  let ticking = false;

  const updateHeaderVisibility = () => {
    const currentScrollY = window.scrollY;
    const isCompactLayout = window.innerWidth <= 960;
    const shouldHide = isCompactLayout &&
      currentScrollY > 96 &&
      currentScrollY > lastScrollY &&
      !header.classList.contains("menu-open");

    header.classList.toggle("header-hidden", shouldHide);
    if (currentScrollY <= 24 || currentScrollY < lastScrollY) {
      header.classList.remove("header-hidden");
    }

    lastScrollY = currentScrollY;
    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(updateHeaderVisibility);
      ticking = true;
    }
  }, { passive: true });
})();
