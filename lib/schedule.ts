export type MaintenanceRow = {
  id: number;
  slug: string;
  name: string;
  category: string;
  description: string;
  severity: string;
  oemMileageInterval: number | null;
  oemTimeMonths: number | null;
  communityMileageInterval: number | null;
  communityTimeMonths: number | null;
  oemSummary: string;
  communitySummary: string;
};

export type ServiceRecord = {
  id: number;
  maintenanceItemId: number;
  maintenanceName: string;
  maintenanceSlug: string;
  serviceDate: string;
  mileage: number;
  cost: number | null;
  shop: string | null;
  notes: string | null;
  fluid: string | null;
  fluidQuantity: string | null;
  partsUsed: string | null;
};

export type ScheduledItem = MaintenanceRow & {
  lastService: ServiceRecord | null;
  nextDueMileage: number | null;
  nextDueDate: string | null;
  milesRemaining: number | null;
  daysRemaining: number | null;
  status: "overdue" | "due-soon" | "up-to-date" | "untracked";
  statusLabel: string;
};

function addMonths(dateValue: string, months: number) {
  const date = new Date(`${dateValue}T12:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + months);
  return date;
}

export function buildSchedule(
  items: MaintenanceRow[],
  records: ServiceRecord[],
  currentMileage: number,
) {
  const now = new Date();
  const schedule: ScheduledItem[] = items.map((item) => {
    const lastService =
      records.find((record) => record.maintenanceItemId === item.id) ?? null;
    if (!lastService) {
      return {
        ...item,
        lastService,
        nextDueMileage: null,
        nextDueDate: null,
        milesRemaining: null,
        daysRemaining: null,
        status: "untracked" as const,
        statusLabel: "Add baseline",
      };
    }

    const nextDueMileage = item.communityMileageInterval
      ? lastService.mileage + item.communityMileageInterval
      : null;
    const dueDate = item.communityTimeMonths
      ? addMonths(lastService.serviceDate, item.communityTimeMonths)
      : null;
    const milesRemaining = nextDueMileage
      ? nextDueMileage - currentMileage
      : null;
    const daysRemaining = dueDate
      ? Math.ceil((dueDate.getTime() - now.getTime()) / 86_400_000)
      : null;
    const isOverdue =
      (milesRemaining !== null && milesRemaining < 0) ||
      (daysRemaining !== null && daysRemaining < 0);
    const isDueSoon =
      (milesRemaining !== null && milesRemaining >= 0 && milesRemaining <= 1000) ||
      (daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 45);
    const status = isOverdue
      ? ("overdue" as const)
      : isDueSoon
        ? ("due-soon" as const)
        : ("up-to-date" as const);

    return {
      ...item,
      lastService,
      nextDueMileage,
      nextDueDate: dueDate?.toISOString().slice(0, 10) ?? null,
      milesRemaining,
      daysRemaining,
      status,
      statusLabel:
        status === "overdue"
          ? "Overdue"
          : status === "due-soon"
            ? "Due soon"
            : "On track",
    };
  });

  const tracked = schedule.filter((item) => item.status !== "untracked");
  const weighted = tracked.reduce((total, item) => {
    if (item.status === "overdue") return total;
    if (item.status === "due-soon") return total + 0.55;
    return total + 1;
  }, 0);
  const healthScore = tracked.length
    ? Math.round((weighted / tracked.length) * 100)
    : 0;

  return {
    schedule,
    healthScore,
    counts: {
      overdue: schedule.filter((item) => item.status === "overdue").length,
      dueSoon: schedule.filter((item) => item.status === "due-soon").length,
      onTrack: schedule.filter((item) => item.status === "up-to-date").length,
      untracked: schedule.filter((item) => item.status === "untracked").length,
    },
  };
}
