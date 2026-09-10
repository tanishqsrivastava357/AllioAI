const githubButton = document.querySelector(".github-signin-button");
const authStatus = document.querySelector("#auth-status");

if (githubButton && authStatus) {
  githubButton.addEventListener("click", () => {
    authStatus.textContent = "Signing you in securely";
    authStatus.dataset.state = "loading";
    githubButton.setAttribute("aria-disabled", "true");
  });
}
