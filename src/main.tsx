import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { completeAuthCallback } from "./authCallback";
import { isAuthCallbackLocation } from "./routing";
import "./styles.css";
import "./mechanical.css";

const root = document.getElementById("root")!;

if (isAuthCallbackLocation()) {
  root.innerHTML = '<main class="auth-callback-shell" aria-live="polite"><strong>Securing your Keeper session…</strong><span>Finishing sign-in and cleaning the return link.</span></main>';
  void completeAuthCallback();
} else {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
