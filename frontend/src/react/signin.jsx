import React from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider, useGoogleLogin, useGoogleOneTapLogin } from "@react-oauth/google";

function OneTapSignIn({ onSuccess, onError }) {
  useGoogleOneTapLogin({
    onSuccess,
    onError,
    use_fedcm_for_prompt: false
  });

  return null;
}

function PopupSignIn({ onSuccess, onError }) {
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => onSuccess(tokenResponse.access_token),
    onError
  });

  return React.createElement(
    "button",
    { type: "button", className: "google-fallback-button", onClick: () => login() },
    React.createElement(
      "span",
      { className: "google-button-content" },
      React.createElement(
        "svg",
        {
          className: "google-button-logo",
          viewBox: "0 0 24 24",
          "aria-hidden": "true"
        },
        React.createElement("path", {
          fill: "#4285F4",
          d: "M21.35 12.27c0-.78-.07-1.53-.22-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.2 2.91-7.42Z"
        }),
        React.createElement("path", {
          fill: "#34A853",
          d: "M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.28v2.53A9.75 9.75 0 0 0 12 21.75Z"
        }),
        React.createElement("path", {
          fill: "#FBBC05",
          d: "M6.53 13.83A5.86 5.86 0 0 1 6.22 12c0-.64.11-1.26.31-1.83V7.64H3.28A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.03 4.36l3.25-2.53Z"
        }),
        React.createElement("path", {
          fill: "#EA4335",
          d: "M12 6.14c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.84 3.22 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.72 5.39l3.25 2.53C7.3 7.86 9.46 6.14 12 6.14Z"
        })
      ),
      React.createElement("span", null, "Sign in with Google")
    )
  );
}

function SignInButton() {
  const clientId = window.ALLIOAI_CONFIG && window.ALLIOAI_CONFIG.googleClientId;
  const statusElement = document.getElementById("auth-status");

  const setStatus = (message, isError = false) => {
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.dataset.state = isError ? "error" : (message.includes("Signing") ? "loading" : "ready");
    }
  };
  const redirectAfterSignIn = () => {
    const destination = window.localStorage.getItem("redirectAfterLogin");
    window.localStorage.removeItem("redirectAfterLogin");
    const safeDestination = typeof destination === "string" &&
      /^\/?(?:[A-Za-z0-9._-]+\/)*[A-Za-z0-9._-]+(?:[?#].*)?$/.test(destination)
      ? destination.replace(/^\//, "")
      : "app.html";
    window.location.href = safeDestination;
  };

  if (!clientId || clientId.startsWith("REPLACE_")) {
    setStatus("Add your Google Client ID in scripts/google-config.js.", true);
    return React.createElement("p", null);
  }

  const onSuccess = async (credentialResponse) => {
    setStatus("Signing you in securely...");
    try {
      const result = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      const data = await result.json();
      if (!result.ok) throw new Error(data.error || "Google sign-in failed.");
      redirectAfterSignIn();
    } catch (error) {
      console.error(error);
      setStatus(error.message, true);
    }
  };

  const onError = () => setStatus("Google sign-in failed. Please try again.", true);
  const onPopupSuccess = async (accessToken) => {
    setStatus("Signing you in securely...");
    try {
      const result = await fetch("/api/auth/google/access-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ accessToken })
      });
      const data = await result.json();
      if (!result.ok) throw new Error(data.error || "Google sign-in failed.");
      redirectAfterSignIn();
    } catch (error) {
      console.error(error);
      setStatus(error.message, true);
    }
  };

  return React.createElement(
    GoogleOAuthProvider,
    { clientId },
    React.createElement(
      React.Fragment,
      null,
      React.createElement(OneTapSignIn, { onSuccess, onError }),
      React.createElement(PopupSignIn, {
        onSuccess: onPopupSuccess,
        onError
      })
    )
  );
}

const mount = document.getElementById("google-signin-button");
if (mount) createRoot(mount).render(React.createElement(SignInButton));
