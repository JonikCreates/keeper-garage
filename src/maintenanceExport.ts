import type { MaintenanceRecordRow, VehicleRow } from "./supabase";

export type ExportVehicle = Pick<VehicleRow, "brand" | "model" | "model_year" | "trim" | "engine_code" | "transmission">;

const UNKNOWN_WORK = "completed service — details not recorded";

// REVIEW DECISION: aggregate integer cents and format only at the UI/export boundary so saved totals stay exact.
export function maintenanceTotalCents(records: MaintenanceRecordRow[]) {
  return records.reduce((total, record) => total + (record.cost_cents ?? 0), 0);
}

export function formatUsdCents(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value / 100);
}

function recordCost(record: MaintenanceRecordRow) {
  return record.cost_cents === null ? "-" : formatUsdCents(record.cost_cents);
}

export function completedExportRecords(records: MaintenanceRecordRow[]) {
  return records
    .filter((record) => {
      const work = record.work_performed.trim().toLowerCase();
      return work.length > 0 && work !== UNKNOWN_WORK && !work.includes("not recorded");
    })
    .sort((left, right) => right.completed_at.localeCompare(left.completed_at)
      || right.mileage - left.mileage
      || right.created_at.localeCompare(left.created_at));
}

export function maintenanceExportFilename(vehicle: ExportVehicle, extension: "pdf" | "png") {
  const base = `${vehicle.model_year}-${vehicle.brand}-${vehicle.trim}-Maintenance-History`
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base || "Keeper-Garage-Maintenance-History"}.${extension}`;
}

function vehicleTitle(vehicle: ExportVehicle) {
  return `${vehicle.model_year} ${vehicle.brand} ${vehicle.trim}`;
}

function vehicleDetails(vehicle: ExportVehicle) {
  const chassis = vehicle.model.match(/\(([^)]+)\)/)?.[1];
  return [chassis, vehicle.engine_code, vehicle.transmission].filter(Boolean).join("  |  ");
}

function reportDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" })
    .format(new Date(`${value}T00:00:00Z`));
}

function printableReportText(value: string) {
  return value.replace(/[‐‑‒–—―]/g, "-").replace(/[·•]/g, "|");
}

function recordExportText(record: MaintenanceRecordRow) {
  const fluid = [
    record.fluid_brand,
    record.fluid_product,
    record.fluid_viscosity ?? record.fluid_type,
    record.fluid_specification,
  ].filter(Boolean).join(" | ");

  const quantity =
    record.fluid_quantity !== null
      ? `${record.fluid_quantity} ${record.fluid_unit ?? "units"}`
      : "";

  const filter = record.filter_product
    ? `Filter: ${record.filter_product}`
    : "";

  const details = [
    record.work_performed.trim(),
    fluid,
    quantity,
    filter,
    record.notes,
  ].filter(Boolean).join(" - ");

  return printableReportText(
    details
      ? `${record.maintenance_name} - ${details}`
      : record.maintenance_name
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export async function createMaintenancePdf(vehicle: ExportVehicle, sourceRecords: MaintenanceRecordRow[]) {
  const records = completedExportRecords(sourceRecords);
  const { jsPDF } = await import("jspdf");
  const document = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter", compress: true });
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 48;
  const contentWidth = pageWidth - margin * 2;
  const workWidth = 210;
  const dateX = 304;
  const mileageX = 446;
  const costX = pageWidth - margin - 10;
  const totalSpent = maintenanceTotalCents(records);

  function drawHeader(continued: boolean) {
    document.setTextColor(20, 91, 151);
    document.setFont("helvetica", "bold");
    document.setFontSize(10);
    document.text("KEEPER GARAGE", margin, 52);
    document.setDrawColor(20, 91, 151);
    document.setLineWidth(2);
    document.line(margin, 62, pageWidth - margin, 62);
    document.setTextColor(20, 30, 42);
    document.setFontSize(22);
    document.text(vehicleTitle(vehicle), margin, 94);
    document.setFont("helvetica", "normal");
    document.setFontSize(10);
    document.setTextColor(78, 89, 103);
    const details = vehicleDetails(vehicle);
    if (details) document.text(details, margin, 112);
    document.setFont("helvetica", "bold");
    document.setFontSize(12);
    document.setTextColor(20, 30, 42);
    document.text(continued ? "Maintenance & Service History - continued" : "Maintenance & Service History", margin, 136);
    document.setFont("helvetica", "normal");
    document.setFontSize(9);
    document.setTextColor(78, 89, 103);
    document.text(`${records.length} completed record${records.length === 1 ? "" : "s"}  |  ${formatUsdCents(totalSpent)} total spent`, pageWidth - margin, 153, { align: "right" });
  }

  function drawTableHeader(y: number) {
    document.setFillColor(238, 243, 248);
    document.rect(margin, y, contentWidth, 26, "F");
    document.setFont("helvetica", "bold");
    document.setFontSize(8);
    document.setTextColor(61, 76, 92);
    document.text("SERVICE / WORK PERFORMED", margin + 10, y + 17);
    document.text("DATE", dateX, y + 17);
    document.text("MILEAGE", mileageX, y + 17, { align: "right" });
    document.text("COST", costX, y + 17, { align: "right" });
    return y + 26;
  }

  drawHeader(false);
  let y = drawTableHeader(166);
  records.forEach((record, index) => {
    const workLines = document.splitTextToSize(recordExportText(record), workWidth) as string[];
    const rowHeight = Math.max(38, workLines.length * 12 + 18);
    if (y + rowHeight > pageHeight - 54) {
      document.addPage();
      drawHeader(true);
      y = drawTableHeader(166);
    }
    if (index % 2 === 1) {
      document.setFillColor(249, 251, 253);
      document.rect(margin, y, contentWidth, rowHeight, "F");
    }
    document.setDrawColor(219, 226, 233);
    document.setLineWidth(.5);
    document.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);
    document.setFont("helvetica", "normal");
    document.setFontSize(9.5);
    document.setTextColor(27, 37, 48);
    document.text(workLines, margin + 10, y + 16, { lineHeightFactor: 1.25 });
    document.setFontSize(9);
    document.setTextColor(68, 80, 93);
    document.text(reportDate(record.completed_at), dateX, y + 16);
    document.text(`${record.mileage.toLocaleString("en-US")} mi`, mileageX, y + 16, { align: "right" });
    document.text(recordCost(record), costX, y + 16, { align: "right" });
    y += rowHeight;
  });

  const totalPages = document.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    document.setPage(page);
    document.setFont("helvetica", "normal");
    document.setFontSize(8);
    document.setTextColor(110, 120, 132);
    document.text("Account-holder entered records | Keeper does not independently verify service completion", margin, pageHeight - 28);
    document.text(`Page ${page} of ${totalPages}`, pageWidth - margin, pageHeight - 28, { align: "right" });
  }
  return document.output("blob");
}

function wrappedCanvasLines(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (context.measureText(next).width <= maxWidth || !line) line = next;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function createMaintenancePng(vehicle: ExportVehicle, sourceRecords: MaintenanceRecordRow[]) {
  const records = completedExportRecords(sourceRecords);
  const width = 1_200;
  const scale = 2;
  const margin = 72;
  const canvas = document.createElement("canvas");
  const measuring = canvas.getContext("2d");
  if (!measuring) throw new Error("This browser cannot create the export image.");
  measuring.font = "600 22px Arial";
  const rowLines = records.map((record) => wrappedCanvasLines(measuring, recordExportText(record), width - margin * 2));
  const rowHeights = rowLines.map((lines) => Math.max(86, lines.length * 28 + 54));
  const logicalHeight = 310 + rowHeights.reduce((total, height) => total + height, 0) + 78;
  canvas.width = width * scale;
  canvas.height = logicalHeight * scale;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser cannot create the export image.");
  context.scale(scale, scale);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, logicalHeight);
  context.fillStyle = "#145b97";
  context.font = "700 18px Arial";
  context.fillText("KEEPER GARAGE", margin, 64);
  context.fillRect(margin, 82, width - margin * 2, 4);
  context.fillStyle = "#141e2a";
  context.font = "700 42px Arial";
  context.fillText(vehicleTitle(vehicle), margin, 145);
  const details = vehicleDetails(vehicle);
  if (details) {
    context.fillStyle = "#4e5967";
    context.font = "400 19px Arial";
    context.fillText(details, margin, 180);
  }
  context.fillStyle = "#141e2a";
  context.font = "700 24px Arial";
  context.fillText("Maintenance & Service History", margin, 228);
  context.fillStyle = "#4e5967";
  context.font = "400 17px Arial";
  context.fillText(`${records.length} completed service record${records.length === 1 ? "" : "s"}  |  ${formatUsdCents(maintenanceTotalCents(records))} total spent`, margin, 258);

  let y = 294;
  records.forEach((record, index) => {
    const height = rowHeights[index];
    if (index % 2 === 0) {
      context.fillStyle = "#f4f7fa";
      context.fillRect(margin, y, width - margin * 2, height);
    }
    context.fillStyle = "#141e2a";
    context.font = "600 22px Arial";
    rowLines[index].forEach((line, lineIndex) => context.fillText(line, margin + 20, y + 34 + lineIndex * 28));
    context.fillStyle = "#4e5967";
    context.font = "400 18px Arial";
    context.fillText(`${reportDate(record.completed_at)}  |  ${record.mileage.toLocaleString("en-US")} mi  |  ${recordCost(record)}`, margin + 20, y + height - 20);
    context.strokeStyle = "#dbe2e9";
    context.beginPath();
    context.moveTo(margin, y + height);
    context.lineTo(width - margin, y + height);
    context.stroke();
    y += height;
  });
  context.fillStyle = "#6e7884";
  context.font = "400 15px Arial";
  context.fillText("Keeper Garage - completed work only | Account-holder entered records; service completion is not independently verified.", margin, logicalHeight - 34);

  return new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("The image export could not be created.")), "image/png"));
}

export async function downloadMaintenanceHistory(format: "pdf" | "png", vehicle: ExportVehicle, records: MaintenanceRecordRow[]) {
  const blob = format === "pdf"
    ? await createMaintenancePdf(vehicle, records)
    : await createMaintenancePng(vehicle, records);
  downloadBlob(blob, maintenanceExportFilename(vehicle, format));
}
