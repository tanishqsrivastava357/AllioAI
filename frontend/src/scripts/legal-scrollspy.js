const sidebarLinks = [...document.querySelectorAll(".policy-sidebar a, .legal-sidebar a")];
const trackedSections = sidebarLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

function updateActiveSection() {
  const activationLine = window.scrollY + Math.min(window.innerHeight * 0.28, 240);
  let activeSection = trackedSections[0];

  trackedSections.forEach((section) => {
    if (section.offsetTop <= activationLine) activeSection = section;
  });

  sidebarLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${activeSection.id}`;
    link.classList.toggle("active", isActive);
    if (isActive) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}

if (trackedSections.length) {
  updateActiveSection();
  window.addEventListener("scroll", updateActiveSection, { passive: true });
  window.addEventListener("resize", updateActiveSection);
}
