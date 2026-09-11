const authStatus = document.getElementById("auth-status");

function showAuthStatus(message, isError = false) {
  if (!authStatus) return;
  authStatus.textContent = message;
  authStatus.dataset.state = isError ? "error" : "ready";
}

async function handleGoogleSignIn(response) {
  showAuthStatus("Signing you in securely...");
  try {
    const result = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ credential: response.credential })
    });
    const data = await result.json();
    if (!result.ok) throw new Error(data.error || "Google sign-in failed.");
    const destination = window.localStorage.getItem("redirectAfterLogin");
    window.localStorage.removeItem("redirectAfterLogin");
    window.location.href = destination || "/app";
  } catch (error) {
    console.error(error);
    showAuthStatus(error.message, true);
  }
}

function renderGoogleButton() {
  const clientId = window.ALLIOAI_CONFIG && window.ALLIOAI_CONFIG.googleClientId;
  if (!clientId || clientId.startsWith("REPLACE_")) {
    showAuthStatus("Add your Google Client ID in scripts/google-config.js.");
    return;
  }
  if (!window.google || !window.google.accounts) {
    showAuthStatus("Google Sign-In could not load. Check your internet connection.", true);
    return;
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: handleGoogleSignIn
  });
  window.google.accounts.id.renderButton(
    document.getElementById("google-signin-button"),
    { theme: "filled_black", size: "large", shape: "pill", width: 320 }
  );
  showAuthStatus("Google sign-in is ready.");
}

window.addEventListener("load", renderGoogleButton);
