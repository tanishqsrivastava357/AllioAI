(() => {
  "use strict";

  const proPrice = document.querySelector(".plan-price[data-monthly]");
  const proPeriod = document.querySelector(".recommended .plan-period");
  const billingButtons = document.querySelectorAll("[data-compare-billing]");
  const subscribeButton = document.querySelector("[data-subscribe-plan]");

  const setBilling = (mode) => {
    billingButtons.forEach((button) => {
      const active = button.dataset.compareBilling === mode;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    if (proPrice) proPrice.textContent = proPrice.dataset[mode];
    if (proPeriod) proPeriod.textContent = mode === "annual" ? "/yr" : "/mo";
    if (subscribeButton) subscribeButton.dataset.subscribePlan = mode;
  };

  billingButtons.forEach((button) => {
    button.addEventListener("click", () => setBilling(button.dataset.compareBilling));
  });
  setBilling("monthly");
  subscribeButton?.addEventListener("click", async () => {
    const response = await fetch("/api/billing/subscription", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: subscribeButton.dataset.subscribePlan })
    });
    const data = await response.json();
    if (!response.ok) { window.location.href = "/signin"; return; }
    if (!window.Razorpay) return;
    new window.Razorpay({ key: data.keyId, subscription_id: data.subscriptionId, name: "AllioAI", description: "AllioAI Pro" }).open();
  });

  document.querySelectorAll(".compare-table tbody td, .compare-table tfoot td").forEach((cell) => {
    const value = cell.textContent.trim();
    if (value === "Included") {
      cell.innerHTML = '<span class="feature-status included" aria-label="Included"><span class="sr-only">Included</span></span>';
    } else if (value === "—") {
      cell.innerHTML = '<span class="feature-status unavailable" aria-label="Not included">—<span class="sr-only">Not included</span></span>';
    }
  });
})();
