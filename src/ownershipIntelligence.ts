export type OwnershipPriority = "critical" | "high" | "medium" | "low" | "info";
export type OwnershipStatusTone = "overdue" | "soon" | "unrecorded" | "current";
export type RecommendationType = "manufacturer" | "keeper" | "preventative" | "inspection" | "owner";
export type OwnershipItemKind = "baseline" | "known_issue" | "custom" | "custom_issue";

export type OwnershipRecordInput = {
  name: string;
  completedAt: string;
  mileage: number;
  costCents: number | null;
};

export type OwnershipItemInput = {
  slug: string;
  name: string;
  category: string;
  severity: "critical" | "important" | "routine";
  kind: OwnershipItemKind;
  statusTone: OwnershipStatusTone;
  recommendationType: RecommendationType;
  description: string | null;
  mileageInterval: number | null;
  timeIntervalMonths: number | null;
  latestRecord: { completedAt: string; mileage: number } | null;
  issueStatus: "watching" | "needs_repair" | "repaired" | null;
  knownIssueUrgency: "urgent" | "watch" | null;
};

export type CostEstimate = {
  min: number;
  max: number;
  label: string;
  note: string;
};

export type PriorityAssessment = {
  priority: OwnershipPriority;
  safety: number;
  damageRisk: number;
  urgency: number;
  costOfDelay: number;
  driveGuidance: "stop" | "limit" | "inspect" | "monitor" | "none";
};

export type AttentionItem = {
  slug: string;
  name: string;
  category: string;
  priority: OwnershipPriority;
  reason: string;
  description: string;
  consequence: string;
  dueLabel: string | null;
  recommendationType: RecommendationType;
  cost: CostEstimate | null;
  assessment: PriorityAssessment;
};

export type UpcomingItem = {
  slug: string;
  name: string;
  category: string;
  dueMileage: number | null;
  dueDate: string | null;
  mileageRemaining: number | null;
  daysRemaining: number | null;
  dueLabel: string;
  recommendationType: RecommendationType;
  cost: CostEstimate | null;
};

export type UpcomingGroup = {
  key: "due_now" | "next_5000" | "next_10000" | "later";
  label: string;
  items: UpcomingItem[];
};

export type HealthScore = {
  score: number | null;
  label: "Excellent" | "Good" | "Fair" | "Needs Attention" | "Poor" | "More data needed";
  confidence: "limited" | "developing" | "strong";
  explanation: string;
  factors: Array<{ tone: "positive" | "negative" | "neutral"; text: string }>;
};

export type OwnershipCostForecast = {
  horizonLabel: string;
  scheduled: { min: number; max: number; items: Array<{ name: string; estimate: CostEstimate }> } | null;
  potential: { min: number; max: number; items: Array<{ name: string; estimate: CostEstimate }> } | null;
};

export type OwnershipInsights = {
  health: HealthScore;
  attention: AttentionItem[];
  upcoming: UpcomingGroup[];
  timeline: UpcomingItem[];
  costs: OwnershipCostForecast;
  recentService: OwnershipRecordInput | null;
  nextService: UpcomingItem | null;
};

type CostRule = {
  match: RegExp;
  min: number;
  max: number;
  label: string;
  note: string;
};

// REVIEW DECISION: these are broad U.S. shop-planning ranges, stored outside UI components so
// future vehicle/region-specific pricing can replace them without changing presentation code.
const maintenanceCostRules: CostRule[] = [
  { match: /oil.*filter|engine oil/i, min: 80, max: 160, label: "Oil service", note: "Typical independent-shop range" },
  { match: /brake fluid/i, min: 110, max: 200, label: "Brake-fluid service", note: "Typical independent-shop range" },
  { match: /cabin.*filter|microfilter/i, min: 60, max: 150, label: "Cabin-filter service", note: "Parts and labor vary by access" },
  { match: /engine air filter|air filter/i, min: 60, max: 140, label: "Engine air-filter service", note: "Typical parts-and-labor range" },
  { match: /spark plug/i, min: 220, max: 600, label: "Spark-plug service", note: "Engine layout and plug count affect labor" },
  { match: /transmission.*fluid|fluid.*transmission|gearbox/i, min: 350, max: 950, label: "Transmission service", note: "Fluid, filter, and fill procedure vary" },
  { match: /transfer.case/i, min: 180, max: 380, label: "Transfer-case service", note: "Typical independent-shop range" },
  { match: /differential/i, min: 160, max: 340, label: "Differential service", note: "Per differential; fluid specification varies" },
  { match: /coolant/i, min: 180, max: 420, label: "Coolant service", note: "Does not include leak repair" },
  { match: /belt|tensioner|pulley/i, min: 180, max: 650, label: "Belt-drive service", note: "Depends on which wear parts are replaced" },
  { match: /fuel filter/i, min: 140, max: 360, label: "Fuel-filter service", note: "Access and fuel-system layout vary" },
  { match: /tire rotation/i, min: 30, max: 80, label: "Tire rotation", note: "Often bundled with another service" },
  { match: /brake.*inspect|inspection/i, min: 0, max: 180, label: "Inspection", note: "Some shops credit inspection toward repair" },
];

const repairCostRules: CostRule[] = [
  { match: /timing.chain|oil.pump.drive/i, min: 2_000, max: 4_500, label: "Timing-drive repair", note: "Potential repair only; diagnosis and engine condition matter" },
  { match: /water pump|thermostat/i, min: 800, max: 1_700, label: "Cooling-system repair", note: "Potential repair only; parts and access vary" },
  { match: /control.arm|suspension|bushing|top.mount|damper/i, min: 600, max: 1_800, label: "Suspension repair", note: "Potential repair only; scope and alignment vary" },
  { match: /oil.leak|valve.cover|filter.housing|rear.main/i, min: 400, max: 1_900, label: "Oil-leak repair", note: "Potential repair only; the leak source must be confirmed" },
  { match: /fuel.pump|hpfp|injector/i, min: 700, max: 2_400, label: "Fuel-system repair", note: "Potential repair only; diagnosis and part count vary" },
  { match: /turbo|wastegate/i, min: 1_500, max: 5_000, label: "Turbo-system repair", note: "Potential repair only; diagnosis and repair scope vary" },
  { match: /rust|corrosion|frame.rail|sill/i, min: 800, max: 5_000, label: "Corrosion repair", note: "Potential repair only; structural scope can vary widely" },
  { match: /clutch|release.bearing/i, min: 900, max: 2_200, label: "Clutch-system repair", note: "Potential repair only; related wear parts may change scope" },
  { match: /transmission|pdk|gearbox/i, min: 1_200, max: 5_000, label: "Transmission repair", note: "Potential repair only; specialist diagnosis is essential" },
];

const recommendationLabels: Record<RecommendationType, string> = {
  manufacturer: "Manufacturer recommended",
  keeper: "Keeper planning interval",
  preventative: "Preventative maintenance",
  inspection: "Inspect / verify",
  owner: "Owner-tracked item",
};

const priorityRank: Record<OwnershipPriority, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
const severityPenalty = { critical: 7, important: 5, routine: 3 } as const;
const safetyTerms = /brake|steer|tire|wheel|fuel|airbag|high.voltage|structural|frame|visibility/i;
const damageTerms = /engine|cooling|timing|oil|transmission|driveline|differential|turbo|overheat|rust|corrosion/i;
const comfortTerms = /cabin|interior|upholstery|audio|cup.holder|cosmetic/i;
const dayMs = 86_400_000;

export function recommendationLabel(type: RecommendationType) {
  return recommendationLabels[type];
}

function findCost(rules: CostRule[], value: string): CostEstimate | null {
  const rule = rules.find((candidate) => candidate.match.test(value));
  return rule ? { min: rule.min, max: rule.max, label: rule.label, note: rule.note } : null;
}

function addMonths(value: Date, months: number) {
  const next = new Date(value.getTime());
  next.setUTCMonth(next.getUTCMonth() + months);
  return next;
}

function formatMonth(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

function dueDetails(item: OwnershipItemInput, currentMileage: number | null, now: number) {
  if (!item.latestRecord || (!item.mileageInterval && !item.timeIntervalMonths)) return null;
  const dueMileage = item.mileageInterval ? item.latestRecord.mileage + item.mileageInterval : null;
  const completedDate = new Date(`${item.latestRecord.completedAt}T00:00:00Z`);
  const dueDateValue = item.timeIntervalMonths ? addMonths(completedDate, item.timeIntervalMonths) : null;
  const dueDate = dueDateValue?.toISOString() ?? null;
  const mileageRemaining = dueMileage !== null && currentMileage !== null ? dueMileage - currentMileage : null;
  const daysRemaining = dueDateValue ? Math.ceil((dueDateValue.getTime() - now) / dayMs) : null;
  const details = [
    dueMileage !== null ? `${dueMileage.toLocaleString()} mi` : null,
    dueDate ? formatMonth(dueDate) : null,
  ].filter(Boolean);
  return { dueMileage, dueDate, mileageRemaining, daysRemaining, dueLabel: details.join(" / ") };
}

function remainingLabel(due: ReturnType<typeof dueDetails>) {
  if (!due) return null;
  const parts: string[] = [];
  if (due.mileageRemaining !== null) {
    parts.push(due.mileageRemaining <= 0
      ? `${Math.abs(due.mileageRemaining).toLocaleString()} miles overdue`
      : `due in ${due.mileageRemaining.toLocaleString()} miles`);
  }
  if (due.daysRemaining !== null) {
    const months = Math.max(1, Math.round(Math.abs(due.daysRemaining) / 30));
    parts.push(due.daysRemaining <= 0 ? `${months} month${months === 1 ? "" : "s"} overdue` : `about ${months} month${months === 1 ? "" : "s"}`);
  }
  return parts.join(" · ") || due.dueLabel;
}

function consequenceFor(item: OwnershipItemInput) {
  const value = `${item.category} ${item.name}`;
  if (/brake/i.test(value)) return "Delaying brake work can reduce braking consistency and allow related wear to become more expensive.";
  if (/cooling|coolant|water pump|thermostat/i.test(value)) return "Cooling problems can lead to overheating and expensive engine damage if warning signs are ignored.";
  if (/oil|timing|engine/i.test(value)) return "Delaying engine-critical work can increase wear or turn a manageable service into a larger repair.";
  if (/tire|wheel|steer|suspension/i.test(value)) return "Wear can affect control, tire life, and nearby suspension parts.";
  if (/transmission|driveline|differential|transfer.case/i.test(value)) return "Old fluid or unresolved faults can increase wear in expensive driveline components.";
  if (/fuel/i.test(value)) return "Fuel-system faults can cause poor running, stalling, or a no-start condition.";
  if (comfortTerms.test(value)) return "This is mainly a comfort or appearance concern, so mechanical consequences are usually limited.";
  return "Delaying it may increase wear or make the eventual work more involved; condition should guide the decision.";
}

export function assessPriority(item: OwnershipItemInput): PriorityAssessment {
  const value = `${item.category} ${item.name} ${item.description ?? ""}`;
  let safety = safetyTerms.test(value) ? 3 : item.severity === "critical" ? 2 : item.severity === "important" ? 1 : 0;
  const damageRisk = damageTerms.test(value) ? 3 : item.severity === "critical" ? 2 : item.severity === "important" ? 1 : 0;
  let urgency = item.statusTone === "overdue" ? 3 : item.statusTone === "soon" ? 2 : item.statusTone === "unrecorded" ? 1 : 0;
  if (item.issueStatus === "needs_repair") urgency = 3;
  if (item.issueStatus === "watching") urgency = Math.max(urgency, 1);
  if (item.knownIssueUrgency === "urgent") {
    safety = Math.max(safety, 3);
    urgency = 3;
  }
  const costOfDelay = comfortTerms.test(value) ? 0 : damageRisk === 3 ? 3 : damageRisk === 2 ? 2 : urgency >= 2 ? 1 : 0;
  const total = safety + damageRisk + urgency + costOfDelay;
  let priority: OwnershipPriority = total >= 10 && (safety === 3 || damageRisk === 3)
    ? "critical"
    : total >= 7
      ? "high"
      : total >= 4
        ? "medium"
        : total >= 2
          ? "low"
          : "info";

  // Missing records and watch-list research matter, but neither proves that a fault is present.
  if (item.statusTone === "unrecorded" && priorityRank[priority] < priorityRank.medium) priority = "medium";
  if (item.issueStatus === "watching" && item.knownIssueUrgency !== "urgent" && priorityRank[priority] < priorityRank.medium) priority = "medium";

  const driveGuidance = item.knownIssueUrgency === "urgent" && item.issueStatus === "needs_repair"
    ? "stop"
    : priority === "critical"
      ? "limit"
      : priority === "high"
        ? "inspect"
        : item.issueStatus === "watching"
          ? "monitor"
          : "none";
  return { priority, safety, damageRisk, urgency, costOfDelay, driveGuidance };
}

function attentionReason(item: OwnershipItemInput, due: ReturnType<typeof dueDetails>) {
  if (item.issueStatus === "needs_repair") return "You marked this concern as needing repair.";
  if (item.issueStatus === "watching") return "This researched concern is on your watch list; Keeper is not diagnosing it.";
  if (item.statusTone === "overdue") return remainingLabel(due) ?? "Past its time or mileage plan.";
  if (item.statusTone === "soon") return remainingLabel(due) ?? "Approaching its time or mileage plan.";
  return "No completed service is recorded, so Keeper cannot place the next due point yet.";
}

function toUpcoming(item: OwnershipItemInput, currentMileage: number | null, now: number): UpcomingItem | null {
  const due = dueDetails(item, currentMileage, now);
  if (!due) return null;
  return {
    slug: item.slug,
    name: item.name,
    category: item.category,
    ...due,
    recommendationType: item.recommendationType,
    cost: findCost(maintenanceCostRules, `${item.slug} ${item.name} ${item.category}`),
  };
}

function dueSort(left: UpcomingItem, right: UpcomingItem) {
  const leftOverdue = (left.mileageRemaining !== null && left.mileageRemaining <= 0) || (left.daysRemaining !== null && left.daysRemaining <= 0);
  const rightOverdue = (right.mileageRemaining !== null && right.mileageRemaining <= 0) || (right.daysRemaining !== null && right.daysRemaining <= 0);
  if (leftOverdue !== rightOverdue) return leftOverdue ? -1 : 1;
  const leftDistance = Math.min(left.mileageRemaining ?? Number.POSITIVE_INFINITY, (left.daysRemaining ?? Number.POSITIVE_INFINITY) * 27.4);
  const rightDistance = Math.min(right.mileageRemaining ?? Number.POSITIVE_INFINITY, (right.daysRemaining ?? Number.POSITIVE_INFINITY) * 27.4);
  return leftDistance - rightDistance || left.name.localeCompare(right.name);
}

function upcomingGroup(item: UpcomingItem): UpcomingGroup["key"] {
  if ((item.mileageRemaining !== null && item.mileageRemaining <= 0) || (item.daysRemaining !== null && item.daysRemaining <= 0)) return "due_now";
  if ((item.mileageRemaining !== null && item.mileageRemaining <= 5_000) || (item.daysRemaining !== null && item.daysRemaining <= 180)) return "next_5000";
  if ((item.mileageRemaining !== null && item.mileageRemaining <= 10_000) || (item.daysRemaining !== null && item.daysRemaining <= 365)) return "next_10000";
  return "later";
}

function healthLabel(score: number): HealthScore["label"] {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Good";
  if (score >= 70) return "Fair";
  if (score >= 60) return "Needs Attention";
  return "Poor";
}

function buildHealth(items: OwnershipItemInput[], currentMileage: number | null, records: OwnershipRecordInput[], now: number): HealthScore {
  const confidence: HealthScore["confidence"] = records.length >= 5 ? "strong" : records.length >= 2 ? "developing" : "limited";
  if (currentMileage === null || records.length === 0) {
    const missing = [currentMileage === null ? "current mileage" : null, records.length === 0 ? "at least one service record" : null].filter(Boolean).join(" and ");
    return {
      score: null,
      label: "More data needed",
      confidence,
      explanation: `Add ${missing} before Keeper shows a numeric health score.`,
      factors: [
        { tone: "neutral", text: currentMileage === null ? "Current mileage has not been entered" : "Current mileage is available" },
        { tone: records.length ? "positive" : "neutral", text: records.length ? `${records.length} service record${records.length === 1 ? " is" : "s are"} available` : "No completed service history is recorded" },
      ],
    };
  }

  const overdue = items.filter((item) => item.statusTone === "overdue");
  const soon = items.filter((item) => item.statusTone === "soon" && !item.issueStatus);
  const unrecorded = items.filter((item) => item.statusTone === "unrecorded");
  const activeIssues = items.filter((item) => (item.kind === "known_issue" || item.kind === "custom_issue") && item.issueStatus !== "repaired");
  const overduePenalty = overdue.reduce((sum, item) => sum + severityPenalty[item.severity], 0);
  const soonPenalty = soon.reduce((sum, item) => sum + severityPenalty[item.severity] * .35, 0);
  const baselinePenalty = Math.min(4, unrecorded.length * .5);
  const issuePenalty = Math.min(8, activeIssues.reduce((sum, item) => sum + (item.issueStatus === "needs_repair" ? severityPenalty[item.severity] : item.severity === "critical" ? 2 : item.severity === "important" ? 1 : .5), 0));
  const score = Math.max(0, Math.min(100, Math.round(100 - overduePenalty - soonPenalty - baselinePenalty - issuePenalty)));
  const factors: HealthScore["factors"] = [];
  if (overdue.length) factors.push({ tone: "negative", text: `${overdue.length} service item${overdue.length === 1 ? " is" : "s are"} overdue` });
  if (soon.length) factors.push({ tone: "negative", text: `${soon.length} item${soon.length === 1 ? " is" : "s are"} approaching its plan` });
  if (unrecorded.length) factors.push({ tone: "neutral", text: `${unrecorded.length} maintenance baseline${unrecorded.length === 1 ? " is" : "s are"} not recorded` });
  if (activeIssues.length) factors.push({ tone: "neutral", text: `${activeIssues.length} owner-tracked concern${activeIssues.length === 1 ? "" : "s"}; watch items are not diagnoses` });
  const recent = records.some((record) => now - new Date(`${record.completedAt}T00:00:00Z`).getTime() <= 365 * dayMs);
  if (recent) factors.push({ tone: "positive", text: "Recent completed maintenance is recorded" });
  if (!overdue.length) factors.push({ tone: "positive", text: "No recorded service is currently overdue" });
  return {
    score,
    label: healthLabel(score),
    confidence,
    explanation: confidence === "strong"
      ? "Based on current mileage, service timing, history coverage, and owner-tracked concerns."
      : "A useful planning estimate; more completed records will improve confidence.",
    factors: factors.slice(0, 5),
  };
}

function sumForecast(items: Array<{ name: string; estimate: CostEstimate }>) {
  return items.reduce((total, item) => ({ min: total.min + item.estimate.min, max: total.max + item.estimate.max }), { min: 0, max: 0 });
}

export function createOwnershipInsights(input: {
  items: OwnershipItemInput[];
  currentMileage: number | null;
  records: OwnershipRecordInput[];
  now?: number;
}): OwnershipInsights {
  const now = input.now ?? Date.now();
  const upcomingItems = input.items
    .filter((item) => item.kind === "baseline" || item.kind === "custom")
    .map((item) => toUpcoming(item, input.currentMileage, now))
    .filter((item): item is UpcomingItem => Boolean(item))
    .sort(dueSort);

  const labels: Record<UpcomingGroup["key"], string> = {
    due_now: "Due now",
    next_5000: "Next 5,000 miles",
    next_10000: "Next 10,000 miles",
    later: "Later",
  };
  const upcoming = (Object.keys(labels) as UpcomingGroup["key"][]).map((key) => ({
    key,
    label: labels[key],
    items: upcomingItems.filter((item) => upcomingGroup(item) === key),
  }));

  const attention = input.items
    .filter((item) => item.statusTone === "overdue" || item.statusTone === "soon" || item.statusTone === "unrecorded" || (item.issueStatus && item.issueStatus !== "repaired"))
    .map((item): AttentionItem => {
      const due = dueDetails(item, input.currentMileage, now);
      const assessment = assessPriority(item);
      const repair = item.kind === "known_issue" || item.kind === "custom_issue";
      return {
        slug: item.slug,
        name: item.name,
        category: item.category,
        priority: assessment.priority,
        reason: attentionReason(item, due),
        description: item.description ?? "Keeper is using the maintenance plan and history currently recorded for this vehicle.",
        consequence: consequenceFor(item),
        dueLabel: due?.dueLabel ?? null,
        recommendationType: item.recommendationType,
        cost: item.statusTone === "unrecorded"
          ? null
          : findCost(repair ? repairCostRules : maintenanceCostRules, `${item.slug} ${item.name} ${item.category}`),
        assessment,
      };
    })
    .sort((left, right) => priorityRank[left.priority] - priorityRank[right.priority] || left.name.localeCompare(right.name));

  const scheduledForecastItems = upcomingItems
    .filter((item) => upcomingGroup(item) !== "later" && item.cost)
    .map((item) => ({ name: item.name, estimate: item.cost! }));
  const potentialForecastItems = input.items
    .filter((item) => (item.kind === "known_issue" || item.kind === "custom_issue") && item.issueStatus !== "repaired")
    .flatMap((item) => {
      const estimate = findCost(repairCostRules, `${item.slug} ${item.name} ${item.category}`);
      return estimate ? [{ name: item.name, estimate }] : [];
    })
    .slice(0, 3);
  const scheduledTotal = sumForecast(scheduledForecastItems);
  const potentialTotal = sumForecast(potentialForecastItems);
  const recentService = [...input.records].sort(
    (left, right) => right.completedAt.localeCompare(left.completedAt) || right.mileage - left.mileage,
  )[0] ?? null;

  return {
    health: buildHealth(input.items, input.currentMileage, input.records, now),
    attention,
    upcoming,
    timeline: upcomingItems.slice(0, 6),
    costs: {
      horizonLabel: "Next 12 months or 10,000 miles",
      scheduled: scheduledForecastItems.length ? { ...scheduledTotal, items: scheduledForecastItems } : null,
      potential: potentialForecastItems.length ? { ...potentialTotal, items: potentialForecastItems } : null,
    },
    recentService,
    nextService: upcomingItems[0] ?? null,
  };
}
