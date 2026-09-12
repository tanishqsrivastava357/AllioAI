const githubButton = document.querySelector(".github-signin-button");
const authStatus = document.querySelector("#auth-status");

if (githubButton && authStatus) {
  const redirect = window.localStorage.getItem("redirectAfterLogin");
  if (redirect) {
    githubButton.href = `/api/auth/github?redirect=${encodeURIComponent(redirect)}`;
  }
  githubButton.addEventListener("click", () => {
    authStatus.textContent = "Signing you in securely";
    authStatus.dataset.state = "loading";
    githubButton.setAttribute("aria-disabled", "true");
  });
}
