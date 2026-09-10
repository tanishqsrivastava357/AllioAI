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
