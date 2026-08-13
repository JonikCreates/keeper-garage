"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Snapshot = {
  vehicle: { currentMileage: number } | null;
  schedule: Array<{ slug: string; status: string; statusLabel: string; nextDueMileage: number | null; nextDueDate: string | null; milesRemaining: number | null; lastService: null | { serviceDate: string; mileage: number } }>;
};

const miles = new Intl.NumberFormat("en-US");
const dates = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

export default function VehicleItemSnapshot({ slug }: { slug: string }) {
  const [data, setData] = useState<Snapshot | null>(null);
  useEffect(() => { fetch("/api/dashboard", { cache: "no-store" }).then((response) => response.json() as Promise<Snapshot>).then(setData).catch(() => setData(null)); }, []);
  const item = data?.schedule.find((candidate) => candidate.slug === slug);
  if (!data?.vehicle || !item) return <div className="snapshot-loading">Loading your vehicle context…</div>;
  return (
    <section className="vehicle-snapshot">
      <div className="snapshot-title"><p className="eyebrow">Your vehicle</p><h2>Where you stand</h2><span className={`status-badge ${item.status}`}>{item.statusLabel}</span></div>
      <div className="snapshot-metrics">
        <div><span>Current</span><strong>{miles.format(data.vehicle.currentMileage)}</strong><small>miles</small></div>
        <div><span>Last completed</span><strong>{item.lastService ? miles.format(item.lastService.mileage) : "—"}</strong><small>{item.lastService ? dates.format(new Date(`${item.lastService.serviceDate}T12:00:00Z`)) : "No record"}</small></div>
        <div><span>Next baseline</span><strong>{item.nextDueMileage ? miles.format(item.nextDueMileage) : "By time"}</strong><small>{item.nextDueDate ? dates.format(new Date(`${item.nextDueDate}T12:00:00Z`)) : "No fixed date"}</small></div>
        <div><span>Mileage position</span><strong>{item.milesRemaining === null ? "—" : miles.format(Math.abs(item.milesRemaining))}</strong><small>{item.milesRemaining === null ? "time / condition based" : item.milesRemaining < 0 ? "miles past baseline" : "miles remaining"}</small></div>
      </div>
      <Link href="/#plan" className="button button-primary">Record or review service</Link>
    </section>
  );
}
