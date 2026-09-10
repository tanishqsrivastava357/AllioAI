const compareBar = document.querySelector(".compare-plan-bar");
const compareTableSection = document.querySelector(".compare-table-section");
const compareTableWrap = document.querySelector(".compare-table-wrap");
const compareBarScroll = document.querySelector(".compare-plan-bar-scroll");
const compareBarInner = document.querySelector(".compare-plan-bar-inner");
const siteHeader = document.querySelector(".header");

if (compareBar && compareTableSection && compareTableWrap && compareBarScroll && compareBarInner && siteHeader) {
  const updateCompareBar = () => {
    const headerHeight = siteHeader.getBoundingClientRect().height;
    compareBar.style.setProperty("--compare-bar-top", `${headerHeight}px`);
    const table = compareTableWrap.querySelector(".compare-table");
    const tableHeaders = table ? [...table.querySelectorAll("thead th")] : [];
    if (table && tableHeaders.length === 4) {
      compareBarInner.style.gridTemplateColumns = tableHeaders
        .map((header) => `${header.getBoundingClientRect().width}px`)
        .join(" ");
      compareBarInner.style.width = `${table.getBoundingClientRect().width}px`;
      const tableWrapStyles = getComputedStyle(compareTableWrap);
      const tableOrigin = compareTableWrap.getBoundingClientRect().left +
        Number.parseFloat(tableWrapStyles.borderLeftWidth || "0");
      compareBarInner.style.marginLeft = `${Math.max(0, tableOrigin)}px`;
    }
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
