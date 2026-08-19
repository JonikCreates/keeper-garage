import { useEffect, useState } from "react";
import { pageHref } from "./routing";

type Theme = "dark" | "light";

const highlights = [
  ["Exact vehicle matching", "Generation, year, engine, drivetrain, and transmission."],
  ["Maintenance planning", "See what is due, what is done, and what should come next."],
  ["Known issues & records", "Keep matched research and your ownership history in one place."],
] as const;

export function HomePage() {
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

    <header className="home-topbar">
      <a className="home-brand" href={pageHref("home")}><strong>KEEPER</strong><small>Owner&apos;s workshop log</small></a>
      <nav aria-label="Primary navigation">
        <a className="active" aria-current="page" href={pageHref("home")}>Home</a>
        <a href={pageHref("garage")}>Garage</a>
        <a href={pageHref("maintenance")}>Maintenance</a>
        <a href={pageHref("issues")}>Known Issues</a>
        <a href={pageHref("profile")}>Profile</a>
      </nav>
      <button className="home-theme-toggle" type="button" onClick={() => setTheme((value) => value === "dark" ? "light" : "dark")} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
        {theme === "dark" ? "Light mode" : "Dark mode"}
      </button>
    </header>

    <main className="home-main">
      <section className="home-hero">
        <p className="home-kicker">Vehicle ownership, organized</p>
        <h1>Know your car.<br />Maintain it better.</h1>
        <p className="home-lede">Keeper brings maintenance planning, known-issue research, and your service history together around the exact vehicle you own.</p>
        <div className="home-actions">
          <a className="button button-primary" href={pageHref("garage")}>Open My Garage</a>
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
