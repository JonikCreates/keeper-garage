import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { completeAuthCallback } from "./authCallback";
import { HomePage } from "./HomePage";
import { getPageFromLocation, isAuthCallbackLocation } from "./routing";
import "./styles.css";
import "./mechanical.css";
import "./home.css";

const root = document.getElementById("root")!;

if (isAuthCallbackLocation()) {
  root.innerHTML = '<main class="auth-callback-shell" aria-live="polite"><strong>Securing your Keeper session…</strong><span>Finishing sign-in and cleaning the return link.</span></main>';
  void completeAuthCallback();
} else {
  const page = getPageFromLocation();
  createRoot(root).render(
    <StrictMode>
      {page === "home" ? <HomePage /> : <App />}
    </StrictMode>,
  );
}
