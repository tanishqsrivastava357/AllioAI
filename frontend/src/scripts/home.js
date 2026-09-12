const previewPrompt = document.querySelector("#previewPrompt");
const demoLabel = document.querySelector("#demoLabel");
const demoResponse = document.querySelector("#demoResponse");
const demoCitations = document.querySelector("#demoCitations");
const demoTabs = document.querySelectorAll(".demo-tab");
const demoContent = {
  chat: {
    prompt: "Explain stock market",
    label: "What can I help you with?",
    response: "Clear answers, useful context, and a next step.",
    chips: ["Context-aware", "Fast response"]
  },
  research: {
    prompt: "Compare renewable energy trends",
    label: "Research with sources",
    response: "A concise synthesis with the evidence behind it.",
    chips: ["Citations", "Multi-source"]
  },
  images: {
    prompt: "Create a midnight city concept",
    label: "Turn ideas into visuals",
    response: "Explore a visual direction, then refine it in seconds.",
    chips: ["Creative", "Iterate"]
  }
};

const setDemo = (name) => {
  const content = demoContent[name];
  if (!content) return;
  previewPrompt.textContent = content.prompt;
  demoLabel.textContent = content.label;
  demoResponse.textContent = content.response;
  demoCitations.replaceChildren(...content.chips.map((chip) => {
    const element = document.createElement("span");
    element.textContent = chip;
    return element;
  }));
  demoTabs.forEach((tab) => {
    const selected = tab.dataset.demo === name;
    tab.classList.toggle("is-active", selected);
    tab.setAttribute("aria-selected", String(selected));
  });
};

demoTabs.forEach((tab) => tab.addEventListener("click", () => setDemo(tab.dataset.demo)));
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
        let installPromptEvent;
        const installButton = document.querySelector("[data-install-app]");
        const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches ||
          window.navigator.standalone === true;
        const markInstalled = () => {
          if (!installButton) return;
          installButton.textContent = "App installed";
          installButton.disabled = true;
          installButton.setAttribute("aria-label", "AllioAI app is already installed");
        };

        window.addEventListener("beforeinstallprompt", (event) => {
          event.preventDefault();
          installPromptEvent = event;
          if (installButton) installButton.hidden = false;
        });

        window.addEventListener("appinstalled", () => {
          installPromptEvent = null;
          markInstalled();
        });

        if (installButton) {
          installButton.hidden = false;
          if (isStandalone()) {
            markInstalled();
          }
          installButton.addEventListener("click", async () => {
            if (isStandalone()) {
              markInstalled();
              return;
            }

            if (installPromptEvent) {
              installPromptEvent.prompt();
              const { outcome } = await installPromptEvent.userChoice;
              installPromptEvent = null;
              if (outcome === "accepted") markInstalled();
              return;
            }

            installButton.textContent = "Use your browser menu to install";
          });
        }

        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.register("sw.js").catch((error) => {
            console.error("AllioAI PWA registration failed.", error);
          });
        }

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
          const monthlyValue = Number(priceValue.dataset.monthly || 9);
          const annualValue = Number(priceValue.dataset.annual || 89);
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
