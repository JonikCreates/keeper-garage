import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import VehicleItemSnapshot from "@/app/components/VehicleItemSnapshot";
import { getCatalogItem, MAINTENANCE_CATALOG } from "@/lib/catalog";

export function generateStaticParams() {
  return MAINTENANCE_CATALOG.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = getCatalogItem(slug);
  if (!item) return {};
  return {
    title: item.name,
    description: `${item.name} guidance for the BMW E90 335i N54, with OEM and community recommendations kept separate.`,
  };
}

function KeeperMark() {
  return <span className="keeper-mark" aria-hidden="true"><i /><i /><i /></span>;
}

export default async function MaintenanceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getCatalogItem(slug);
  if (!item) notFound();

  return (
    <main className="detail-shell">
      <header className="detail-topbar">
        <Link href="/" className="brand-lockup"><KeeperMark /><span>KEEPER</span></Link>
        <Link href="/#schedule" className="back-link">← Back to maintenance plan</Link>
        <span className="platform-pill">E90 · N54</span>
      </header>

      <article className="detail-page">
        <header className="detail-hero">
          <div>
            <p className="eyebrow">{item.category} · Maintenance detail</p>
            <h1>{item.name}</h1>
            <p>{item.description}</p>
          </div>
          <div className="detail-index"><span>Dataset</span><strong>01 / 01</strong><small>BMW 335i · N54</small></div>
        </header>

        <VehicleItemSnapshot slug={item.slug} />

        <section className="recommendation-grid">
          <article className="recommendation-card oem-card">
            <header><span className="source-tag oem">BMW / OEM</span><strong>{item.oem.label}</strong></header>
            <h2>Factory position</h2>
            <p>{item.oem.summary}</p>
            <footer>Controlling guidance: the car&apos;s CBS display, VIN-specific service information, and current BMW literature.</footer>
          </article>
          <article className="recommendation-card community-card">
            <header><span className="source-tag community">COMMUNITY</span><strong>{item.community.label}</strong></header>
            <h2>Enthusiast baseline</h2>
            <p>{item.community.summary}</p>
            <footer>This is a conservative planning baseline assembled from independent sources—not an OEM requirement.</footer>
          </article>
        </section>

        <section className="detail-grid">
          <div className="parts-panel">
            <div className="detail-section-heading"><p className="eyebrow">Parts & supplies</p><h2>Plan the job</h2><span>Always verify by VIN</span></div>
            <div className="parts-table">
              <div className="parts-head"><span>Item</span><span>Part number</span><span>Fitment note</span></div>
              {item.parts.map((part) => (
                <div key={part.name}>
                  <strong>{part.purchaseUrl ? <a href={part.purchaseUrl} target="_blank" rel="noreferrer">{part.name} ↗</a> : part.name}</strong>
                  <code>{part.partNumber ?? "Verify specification"}</code>
                  <p>{part.note}</p>
                </div>
              ))}
            </div>
          </div>
          <aside className="diy-panel">
            <p className="eyebrow">Workshop notes</p>
            <h2>Before you begin</h2>
            <ol>{item.diy.map((note, index) => <li key={note}><span>{String(index + 1).padStart(2, "0")}</span><p>{note}</p></li>)}</ol>
            <div className="safety-note"><strong>Safety first</strong><p>Use current service procedures, proper lifting equipment, and qualified help where the work affects braking, steering, fuel, or high-temperature systems.</p></div>
          </aside>
        </section>

        <section className="sources-section">
          <div className="detail-section-heading"><p className="eyebrow">Evidence trail</p><h2>Sources used</h2><span>{item.sources.length} linked references</span></div>
          <div className="source-list">
            {item.sources.map((source, index) => (
              <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>
                <span className="source-number">{String(index + 1).padStart(2, "0")}</span>
                <div><span className={`source-tag ${source.type === "OEM" ? "oem" : source.type === "Community consensus" ? "community" : "individual"}`}>{source.type}</span><h3>{source.title}</h3><p>{source.publisher}</p><small>{source.note}</small></div>
                <b>↗</b>
              </a>
            ))}
          </div>
          <div className="reliability-note"><strong>How Keeper handles reliability</strong><p>OEM material, recurring community consensus, and individual experience remain visibly labeled. When sources disagree, the disagreement should be shown—not silently averaged away.</p></div>
        </section>

        <footer className="detail-footer"><div><KeeperMark /><strong>KEEPER</strong></div><p>Verify all fluids, parts, capacities, and procedures against current information for the exact VIN before service.</p><Link href="/#schedule">Return to your plan →</Link></footer>
      </article>
    </main>
  );
}
