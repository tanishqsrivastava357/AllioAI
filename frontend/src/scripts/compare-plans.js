const compareBar = document.querySelector(".compare-plan-bar");
const compareTableSection = document.querySelector(".compare-table-section");
const compareTableWrap = document.querySelector(".compare-table-wrap");
const compareBarScroll = document.querySelector(".compare-plan-bar-scroll");
const siteHeader = document.querySelector(".header");

if (compareBar && compareTableSection && compareTableWrap && compareBarScroll && siteHeader) {
  const updateCompareBar = () => {
    const headerHeight = siteHeader.getBoundingClientRect().height;
    compareBar.style.setProperty("--compare-bar-top", `${headerHeight}px`);
    const tableRect = compareTableSection.getBoundingClientRect();
    const isVisible = tableRect.top <= headerHeight && tableRect.bottom > headerHeight;
    compareBar.classList.toggle("is-visible", isVisible);
    compareBar.setAttribute("aria-hidden", String(!isVisible));
  };

  compareTableWrap.addEventListener("scroll", () => {
    compareBarScroll.scrollLeft = compareTableWrap.scrollLeft;
  }, { passive: true });
  compareBarScroll.addEventListener("scroll", () => {
    compareTableWrap.scrollLeft = compareBarScroll.scrollLeft;
  }, { passive: true });
  window.addEventListener("scroll", updateCompareBar, { passive: true });
  window.addEventListener("resize", updateCompareBar);
  updateCompareBar();
}
