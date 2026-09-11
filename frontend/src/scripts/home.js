const previewPrompt = document.querySelector("#previewPrompt");
const previewPrompts = [
  "Explain stock market",
  "What is BODMAS?",
  "How to use AllioAI?",
  "Plan me a trip"
];

if (previewPrompt) {
  let promptIndex = 0;

  window.setInterval(() => {
    promptIndex = (promptIndex + 1) % previewPrompts.length;
    previewPrompt.classList.add("prompt-leaving");

    window.setTimeout(() => {
      previewPrompt.textContent = previewPrompts[promptIndex];
      previewPrompt.classList.remove("prompt-leaving");
      previewPrompt.classList.add("prompt-entering");

      window.setTimeout(() => {
        previewPrompt.classList.remove("prompt-entering");
      }, 520);
    }, 260);
  }, 2500);
}


(() => {
        const demoData = {
          chat: { question: "How can I make my next product launch unforgettable?", answer: 'Start with a clear point of view. <strong>AllioAI can turn your rough idea into a launch plan</strong>, campaign copy, and a focused checklist in minutes.', citations: ["Launch brief", "Audience notes", "3 sources"] },
          research: { question: "What are the strongest signals in this market?", answer: 'I found three themes across the latest sources. <strong>Demand is moving toward simpler, faster workflows</strong>, with trust and transparency driving adoption.', citations: ["12 sources", "Market scan", "Cited answer"] },
          images: { question: "Create a visual direction for a bold new idea.", answer: 'Here is a starting direction: <strong>high-contrast midnight tones, electric violet, and confident editorial type</strong>. Iterate until it feels like you.', citations: ["4 concepts", "Style board", "Image prompt"] }
        };
        const question = document.querySelector("#demoQuestion");
        const answer = document.querySelector("#demoAnswer");
        const citations = document.querySelector("#citations");
        const priceValue = document.querySelector(".pricing-card.popular .price-value");
        const pricePeriod = document.querySelector(".pricing-card.popular .price-period");

        const updatePrice = (billingMode) => {
          const monthlyValue = Number(priceValue.dataset.monthly || 19);
          const discountedAnnual = monthlyValue * 12 * 0.8;
          const annualValue = Math.round((discountedAnnual - 9) / 10) * 10 + 9;
          if (billingMode === "annual") {
            priceValue.textContent = "$" + annualValue;
            pricePeriod.textContent = "/yr";
          } else {
            priceValue.textContent = "$" + monthlyValue;
            pricePeriod.textContent = "/mo";
          }
        };

        document.querySelectorAll(".demo-tab").forEach((tab) => tab.addEventListener("click", () => {
          const data = demoData[tab.dataset.demo];
          document.querySelectorAll(".demo-tab").forEach((item) => { item.classList.remove("active"); item.setAttribute("aria-selected", "false"); });
          tab.classList.add("active"); tab.setAttribute("aria-selected", "true");
          question.textContent = data.question; answer.innerHTML = data.answer; citations.innerHTML = data.citations.map((item) => `<span class="citation">${item}</span>`).join("");
        }));

        document.querySelectorAll("[data-billing]").forEach((button) => button.addEventListener("click", () => {
          document.querySelectorAll("[data-billing]").forEach((item) => {
            item.classList.remove("active");
            item.setAttribute("aria-pressed", "false");
          });
          button.classList.add("active");
          button.setAttribute("aria-pressed", "true");
          updatePrice(button.dataset.billing);
        }));

        updatePrice("monthly");
        const codePreview = document.querySelector("#codePreview");
        if (codePreview) {
          let codeStep = 0;
          const codeLines = [
            '<div><span class="purple">const</span> launch = <span class="cyan">await</span> allio.<span class="green">plan</span>({</div>',
            '<div>&nbsp;&nbsp;goal: <span class="green">"ship with confidence"</span>,</div>',
            '<div>&nbsp;&nbsp;context: project.files</div>',
            '<div>});</div>'
          ];
          codePreview.innerHTML = "";
          const typeCode = () => {
            if (codeStep >= codeLines.length) return;
            codePreview.insertAdjacentHTML("beforeend", codeLines[codeStep]);
            codeStep += 1;
            window.setTimeout(typeCode, 260);
          };
          window.setTimeout(typeCode, 260);
          document.querySelectorAll("[data-code-action]").forEach((button) => button.addEventListener("click", () => {
            document.querySelectorAll("[data-code-action]").forEach((item) => item.classList.remove("active"));
            button.classList.add("active");
          }));
        }
      })();
