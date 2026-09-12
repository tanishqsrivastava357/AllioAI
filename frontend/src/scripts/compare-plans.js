(() => {
  "use strict";

  const proPrice = document.querySelector(".plan-price[data-monthly]");
  const proPeriod = document.querySelector(".recommended .plan-period");
  const billingButtons = document.querySelectorAll("[data-compare-billing]");
  const subscribeButtons = document.querySelectorAll("[data-subscribe-plan]");

  const setBilling = (mode) => {
    billingButtons.forEach((button) => {
      const active = button.dataset.compareBilling === mode;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    if (proPrice) proPrice.textContent = proPrice.dataset[mode];
    if (proPeriod) proPeriod.textContent = mode === "annual" ? "/yr" : "/mo";
    subscribeButtons.forEach((button) => {
      button.dataset.subscribePlan = mode;
      button.href = `/signin?redirect=${encodeURIComponent(`/compare-plans?checkout=${mode}`)}`;
    });
  };

  billingButtons.forEach((button) => {
    button.addEventListener("click", () => setBilling(button.dataset.compareBilling));
  });
  setBilling("monthly");
  const startCheckout = async (button) => {
    const plan = button.dataset.subscribePlan;
    if (plan !== "monthly" && plan !== "annual") return;
    const originalText = button.textContent;
    subscribeButtons.forEach((item) => { item.setAttribute("aria-disabled", "true"); });
    button.textContent = "Loading...";
    try {
      const response = await fetch("/api/billing/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ plan })
      });
      const data = await response.json();
      if (response.status === 401) {
        window.localStorage.setItem("redirectAfterLogin", `/compare-plans?checkout=${plan}`);
        window.location.href = "/signin";
        return;
      }
      if (!response.ok) throw new Error(data.error || "Unable to start checkout.");
      if (!window.Razorpay) throw new Error("Payment checkout is unavailable. Please refresh and try again.");
      new window.Razorpay({
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: "AllioAI",
        description: `AllioAI Pro ${data.plan === "annual" ? "Annual" : "Monthly"}`
      }).open();
    } catch (error) {
      window.alert(error.message || "Unable to start checkout.");
    } finally {
      subscribeButtons.forEach((item) => { item.removeAttribute("aria-disabled"); });
      button.textContent = originalText;
    }
  };
  subscribeButtons.forEach((button) => button.addEventListener("click", (event) => {
    event.preventDefault();
    startCheckout(button);
  }));
  const checkoutPlan = new URLSearchParams(window.location.search).get("checkout");
  if (checkoutPlan === "monthly" || checkoutPlan === "annual") {
    setBilling(checkoutPlan);
    if (subscribeButtons[0]) window.setTimeout(() => startCheckout(subscribeButtons[0]), 250);
  }

  document.querySelectorAll(".compare-table tbody td, .compare-table tfoot td").forEach((cell) => {
    const value = cell.textContent.trim();
    if (value === "Included") {
      cell.innerHTML = '<span class="feature-status included" aria-label="Included"><span class="sr-only">Included</span></span>';
    } else if (value === "—") {
      cell.innerHTML = '<span class="feature-status unavailable" aria-label="Not included">—<span class="sr-only">Not included</span></span>';
    }
  });
})();
