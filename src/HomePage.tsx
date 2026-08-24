import { useEffect, useState } from "react";
import { pageHref } from "./routing";
import { KeeperBrand, KeeperLogo } from "./KeeperBrand";

type Theme = "dark" | "light";

import { useKeeperAuth } from "./useKeeperAuth";

const highlights = [
  ["Exact vehicle matching", "Generation, year, engine, drivetrain, and transmission."],
  ["Maintenance planning", "See what is due, what is done, and what should come next."],
  ["Known issues & records", "Keep matched research and your ownership history in one place."],
] as const;

function MParallelWheel() {
  return <svg className="theme-wheel" viewBox="0 0 64 64" aria-hidden="true">
    <circle className="wheel-tire" cx="32" cy="32" r="29" />
    <circle className="wheel-rim" cx="32" cy="32" r="23" />
    <g className="wheel-spokes">
      {Array.from({ length: 5 }, (_, index) => <g key={index} transform={`rotate(${index * 72} 32 32)`}>
        <path d="M28.3 28.3 20 12.5 25.4 10 31.1 27.2Z" />
        <path d="M35.7 28.3 44 12.5 38.6 10 32.9 27.2Z" />
      </g>)}
    </g>
    <circle className="wheel-hub" cx="32" cy="32" r="7" />
    <circle className="wheel-cap" cx="32" cy="32" r="3" />
    {Array.from({ length: 5 }, (_, index) => <circle key={index} className="wheel-lug" cx="32" cy="26.6" r="1" transform={`rotate(${index * 72} 32 32)`} />)}
  </svg>;
}

function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  const next = theme === "dark" ? "light" : "dark";
  return <button className="theme-toggle" type="button" onClick={onToggle} aria-label={`Switch to ${next} mode`} title={`Switch to ${next} mode`} aria-pressed={theme === "dark"}>
    <span className="theme-icon" aria-hidden="true">☾</span>
    <span className="theme-wheel-travel"><MParallelWheel /></span>
    <span className="theme-icon" aria-hidden="true">☀</span>
    <span className="sr-only">{theme} mode</span>
  </button>;
}

export function HomePage() {
  const auth = useKeeperAuth();
  const [theme, setTheme] = useState<Theme>(() => localStorage.getItem("keeper-theme") === "dark" ? "dark" : "light");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#121416" : "#0d2b46");
    localStorage.setItem("keeper-theme", theme);
    document.title = "Keeper Auto — Know your car";
  }, [theme]);

  return <div className="home-shell">
    <section className="forum-banner home-forum-banner" aria-label="Keeper workshop archive">
      <div><span>Keeper Workshop Archive</span><strong>Owner-built maintenance intelligence</strong></div>
      <p><span>Maintenance</span><i /><span>Known issues</span><i /><span>Ownership records</span></p>
    </section>

    <header className="topbar">
      <KeeperBrand href={pageHref("home")} />
      <nav aria-label="Primary navigation">
        <a className="active" aria-current="page" href={pageHref("home")}>Home</a>
        <a href={pageHref("garage")}>Garage</a>
        <a href={pageHref("maintenance")}>Maintenance</a>
        <a href={pageHref("issues")}>Known Issues</a>
        <a href={pageHref("profile")}>Profile</a>
      </nav>
      <div className="topbar-actions"><ThemeToggle theme={theme} onToggle={() => setTheme((value) => value === "dark" ? "light" : "dark")} /></div>
    </header>

    <main className="home-main">
      <section className="home-hero">
        <KeeperLogo className="home-hero-logo" context="hero" />
        <p className="home-kicker">Vehicle ownership, organized</p>
        <h1><span>Know your car.</span><span>Maintain it better.</span></h1>
        <p className="home-lede">Keeper brings maintenance planning, known-issue research, and your service history together around the exact vehicle you own.</p>
        <div className="home-actions">
          <a
            className="button button-primary"
            href={auth.access.kind === "account" ? pageHref("garage") : `${pageHref("profile")}?account`}
          >
            Open My Garage
          </a>
          <a className="button button-quiet" href={pageHref("maintenance")}>Try the Demo</a>
        </div>
      </section>

      <section className="home-highlights" aria-label="What Keeper does">
        {highlights.map(([title, body], index) => <article key={title}>
          <span>0{index + 1}</span>
          <div><h2>{title}</h2><p>{body}</p></div>
        </article>)}
      </section>
    </main>

    <footer className="home-footer"><strong>KEEPER</strong><p>Independent vehicle ownership research and workshop records. Verify safety-critical decisions with VIN-specific manufacturer information and qualified repair professionals.</p><nav><a href={pageHref("terms")}>Terms</a><a href={pageHref("privacy")}>Privacy</a><a href={pageHref("contact")}>Contact</a></nav></footer>
  </div>;
}
