import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { completeAuthCallback } from "./authCallback";
import { HomePage } from "./HomePage";
import { getPageFromLocation, isAuthCallbackLocation, pageHref } from "./routing";
import "./styles.css";
import "./mechanical.css";
import "./home.css";
import "./footer.css";

function PersistentHomeNavigation() {
  useEffect(() => {
    const syncNavigation = () => {
      const nav = document.querySelector<HTMLElement>(".topbar nav");
      if (nav && !nav.querySelector('[data-keeper-home-link="true"]')) {
        const home = document.createElement("a");
        home.href = pageHref("home");
        home.textContent = "Home";
        home.dataset.keeperHomeLink = "true";
        nav.prepend(home);
      }

      const brand = document.querySelector<HTMLAnchorElement>(".topbar .brand-lockup");
      if (brand) brand.href = pageHref("home");
    };

    syncNavigation();
    const observer = new MutationObserver(syncNavigation);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}

const root = document.getElementById("root")!;

if (isAuthCallbackLocation()) {
  root.innerHTML = '<main class="auth-callback-shell" aria-live="polite"><strong>Securing your Keeper session…</strong><span>Finishing sign-in and cleaning the return link.</span></main>';
  void completeAuthCallback();
} else {
  const page = getPageFromLocation();
  createRoot(root).render(
    <StrictMode>
      {page === "home" ? <HomePage /> : <><PersistentHomeNavigation /><App /></>}
    </StrictMode>,
  );
}
