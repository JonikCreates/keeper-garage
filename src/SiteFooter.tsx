import { pageHref } from "./routing";
import { KEEPER_VERSION } from "./version";

export function SiteFooter({ home = false }: { home?: boolean }) {
  return <footer className={home ? "home-footer" : "site-footer"}>
    <div className="footer-brand"><strong>KEEPER</strong><span>© 2026 Keeper</span><span>Keeper v{KEEPER_VERSION}</span></div>
    <p>Independent vehicle ownership research and workshop records. Not affiliated with or endorsed by any vehicle manufacturer.</p>
    <p>Keeper cannot inspect or diagnose a vehicle. Verify safety-critical decisions with VIN-specific manufacturer information and qualified automotive professionals.</p>
    <nav aria-label="Legal and support"><a href={pageHref("terms")}>Terms of Service</a><a href={pageHref("privacy")}>Privacy Policy</a><a href={pageHref("contact")}>Contact</a></nav>
  </footer>;
}
