export const KEEPER_LOGO_ASSETS = {
  onLight: "/branding/keeper-mark-black.png",
  onDark: "/branding/keeper-mark-white.png",
  accentOnDark: "/branding/keeper-mark-white-orange.png",
  monochromeOnDark: "/branding/keeper-mark-white-black.png",
} as const;

type KeeperLogoContext = "auto" | "on-light" | "on-dark" | "hero";

type KeeperLogoProps = {
  className?: string;
  context?: KeeperLogoContext;
  decorative?: boolean;
};

export function KeeperLogo({ className = "", context = "auto", decorative = false }: KeeperLogoProps) {
  const image = (src: string, tone: string) => (
    <img src={src} alt="" aria-hidden="true" data-logo-tone={tone} />
  );

  return (
    <span
      className={`keeper-logo keeper-logo-${context} ${className}`.trim()}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : "Keeper"}
      aria-hidden={decorative ? "true" : undefined}
    >
      {context === "on-light" && image(KEEPER_LOGO_ASSETS.onLight, "on-light")}
      {context === "on-dark" && image(KEEPER_LOGO_ASSETS.onDark, "on-dark")}
      {context === "auto" && <>
        {image(KEEPER_LOGO_ASSETS.onLight, "on-light")}
        {image(KEEPER_LOGO_ASSETS.onDark, "on-dark")}
      </>}
      {context === "hero" && <>
        {image(KEEPER_LOGO_ASSETS.onLight, "on-light")}
        {image(KEEPER_LOGO_ASSETS.accentOnDark, "accent-on-dark")}
      </>}
    </span>
  );
}

type KeeperBrandProps = {
  href: string;
  context?: KeeperLogoContext;
  tagline?: string;
};

export function KeeperBrand({ href, context = "on-dark", tagline = "Owner's workshop log" }: KeeperBrandProps) {
  return (
    <a className="brand-lockup" href={href} aria-label="Keeper home">
      <KeeperLogo context={context} decorative />
      <span>KEEPER</span>
      <small>{tagline}</small>
    </a>
  );
}
