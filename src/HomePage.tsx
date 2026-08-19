import { useEffect, useState } from "react";
import { pageHref } from "./routing";

type Theme = "dark" | "light";

const benefits = [
  {
    number: "01",
    title: "Maintenance that fits the car",
    body: "Filter service guidance by generation, year, engine, drivetrain, and transmission instead of relying on one-size-fits-all schedules.",
  },
  {
    number: "02",
    title: "Known issues, kept in context",
    body: "Separate urgent warning signs from recurring owner patterns, with supporting sources and applicability matched to the vehicle you selected.",
  },
  {
    number: "03",
    title: "An ownership record that stays useful",
    body: "Keep completed work, mileage, fluids, costs, and tracked repairs together so the next decision starts with your own history.",
  },
];

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
        {theme === "dark" ? "Light" : "Dark"}
      </button>
    </header>

    <main className="home-main">
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="home-kicker">Vehicle ownership, organized</p>
          <h1>Know your car.<br />Maintain it better.</h1>
          <p className="home-lede">Keeper turns maintenance research, known issues, and your own service history into one workshop log built around the exact car you drive.</p>
          <div className="home-actions">
            <a className="button button-primary" href={pageHref("garage")}>Open My Garage</a>
            <a className="button button-quiet" href={pageHref("maintenance")}>Try the Demo</a>
          </div>
          <div className="home-proof" aria-label="Keeper capabilities">
            <span>Exact vehicle matching</span>
            <span>Maintenance planning</span>
            <span>Ownership records</span>
          </div>
        </div>

        <aside className="home-work-order" aria-label="Keeper overview">
          <header><span>KEEPER / WORK ORDER</span><b>01</b></header>
          <div className="home-work-order-title">
            <small>Your garage at a glance</small>
            <strong>One place for what matters next.</strong>
          </div>
          <dl>
            <div><dt>Vehicle</dt><dd>Exact configuration</dd></div>
            <div><dt>Maintenance</dt><dd>Due / done / next</dd></div>
            <div><dt>Known issues</dt><dd>Matched research</dd></div>
            <div><dt>Records</dt><dd>Mileage · cost · fluids</dd></div>
          </dl>
          <footer><span>Built for owners, not dashboards.</span><i /></footer>
        </aside>
      </section>

      <section className="home-benefits" aria-labelledby="home-benefits-title">
        <header>
          <div><p className="home-kicker">Why Keeper</p><h2 id="home-benefits-title">Less guessing. Better ownership.</h2></div>
          <p>Keeper is designed to help you move from “what should I do?” to a clear next action without burying the useful information in a generic vehicle database.</p>
        </header>
        <div className="home-benefit-grid">
          {benefits.map((benefit) => <article key={benefit.number}>
            <span>{benefit.number}</span>
            <h3>{benefit.title}</h3>
            <p>{benefit.body}</p>
          </article>)}
        </div>
      </section>

      <section className="home-cta">
        <div><p className="home-kicker">Ready when the car is</p><h2>Start with your garage.</h2></div>
        <div><p>Choose the exact vehicle, then let Keeper narrow maintenance and issue research around it.</p><a className="button button-primary" href={pageHref("garage")}>Open Keeper Garage</a></div>
      </section>
    </main>

    <footer className="home-footer"><strong>KEEPER</strong><p>Independent vehicle ownership research and workshop records. Verify safety-critical decisions with VIN-specific manufacturer information and qualified repair professionals.</p><nav><a href={pageHref("terms")}>Terms</a><a href={pageHref("privacy")}>Privacy</a><a href={pageHref("contact")}>Contact</a></nav></footer>
  </div>;
}
