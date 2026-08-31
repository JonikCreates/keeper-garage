import {
  recommendationLabel,
  type OwnershipInsights,
  type OwnershipPriority,
} from "./ownershipIntelligence";
import { KeeperLogo } from "./KeeperBrand";

type OwnershipDashboardProps = {
  insights: OwnershipInsights;
  currentMileage: number | null;
  maintenanceHref: string;
};

const priorityLabels: Record<OwnershipPriority, string> = {
  critical: "Critical",
  high: "High priority",
  medium: "Medium priority",
  low: "Low priority",
  info: "Information",
};

function dollars(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function range(min: number, max: number) {
  return `${dollars(min)}–${dollars(max)}`;
}

function shortDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function nextServiceLabel(insights: OwnershipInsights) {
  const next = insights.nextService;

  if (!next) return "Log a service to establish the next due point";

  if (
    next.mileageRemaining !== null &&
    next.mileageRemaining <= 0
  ) {
    return `${next.name} is due now`;
  }

  if (
    next.daysRemaining !== null &&
    next.daysRemaining <= 0
  ) {
    return `${next.name} is due now`;
  }

  if (next.mileageRemaining !== null) {
    return `${next.name} in ${next.mileageRemaining.toLocaleString()} miles`;
  }

  return `${next.name} · ${next.dueLabel}`;
}

export function OwnershipDashboard({
  insights,
  currentMileage,
  maintenanceHref,
}: OwnershipDashboardProps) {
  const visibleAttention = insights.attention.slice(0, 4);

  const healthTone =
    insights.health.score === null
      ? "unknown"
      : insights.health.score >= 90
        ? "excellent"
        : insights.health.score >= 80
          ? "good"
          : insights.health.score >= 70
            ? "fair"
            : insights.health.score >= 60
              ? "attention"
              : "poor";

  return (
    <section
      className="ownership-command-center"
      aria-labelledby="ownership-command-title"
    >
      <header className="ownership-command-heading">
        <div className="ownership-command-title">
          <KeeperLogo className="ownership-command-logo" context="auto" decorative />
          <div>
            <span>Ownership overview</span>
            <h2 id="ownership-command-title">What matters right now</h2>
          </div>
        </div>

        <p>
          Keeper turns the mileage, schedule, service history, and concerns
          recorded for this car into a practical plan.
        </p>
      </header>

      <div className="ownership-health-layout">
        <article className={`keeper-health-score ${healthTone}`}>
          <div className="keeper-health-title">
            <span>Keeper Health</span>
            <small>{insights.health.confidence} confidence</small>
          </div>

          {insights.health.score === null ? (
            <>
              <strong className="keeper-health-unscored">—</strong>
              <h3>{insights.health.label}</h3>
            </>
          ) : (
            <>
              <strong>
                <b>{insights.health.score}</b>
                <small>/ 100</small>
              </strong>
              <h3>{insights.health.label}</h3>
            </>
          )}

          <p>{insights.health.explanation}</p>

          <ul>
            {insights.health.factors.map((factor) => (
              <li className={factor.tone} key={factor.text}>
                {factor.text}
              </li>
            ))}
          </ul>
        </article>

        <div className="ownership-at-a-glance">
          <article>
            <span>Next service</span>
            <strong>{nextServiceLabel(insights)}</strong>
            <a href={maintenanceHref}>Open maintenance →</a>
          </article>

          <article>
            <span>Recent service</span>
            <strong>
              {insights.recentService
                ? insights.recentService.name
                : "No completed service recorded"}
            </strong>

            <small>
              {insights.recentService
                ? `${shortDate(
                    insights.recentService.completedAt,
                  )} · ${insights.recentService.mileage.toLocaleString()} mi`
                : "Add history to improve Keeper Health"}
            </small>
          </article>

          <article>
            <span>Vehicle data</span>
            <strong>
              {currentMileage === null
                ? "Mileage needed"
                : `${currentMileage.toLocaleString()} miles`}
            </strong>

            <small>
              {insights.health.confidence === "strong"
                ? "History is detailed enough for stronger planning"
                : "More records will improve the plan"}
            </small>
          </article>
        </div>
      </div>

      <div className="ownership-primary-grid">
        <section
          className="needs-attention-panel"
          aria-labelledby="needs-attention-title"
        >
          <header>
            <h3 id="needs-attention-title">Needs attention</h3>

            <b>{insights.attention.length}</b>
          </header>

          {visibleAttention.length ? (
            <div className="attention-list">
              {visibleAttention.map((item) => (
                <details
                  className={`attention-item attention-collapsible ${item.priority}`}
                  key={item.slug}
                >
                  <summary className="attention-summary">
                    <div>
                      <span>{priorityLabels[item.priority]}</span>
                      <strong>{item.name}</strong>
                      <small>{recommendationLabel(item.recommendationType)}</small>
                    </div>
                  </summary>

                  <div className="attention-expanded">
                    <strong>{item.reason}</strong>
                    <p>{item.description}</p>

                    <dl>
                      <div>
                        <dt>If delayed</dt>
                        <dd>{item.consequence}</dd>
                      </div>

                      {item.dueLabel && (
                        <div>
                          <dt>Plan point</dt>
                          <dd>{item.dueLabel}</dd>
                        </div>
                      )}

                      <div>
                        <dt>Typical cost</dt>
                        <dd>
                          {item.cost
                            ? `${range(item.cost.min, item.cost.max)} estimated`
                            : "Not estimated from current data"}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </details>
              ))}
            </div>
          ) : (
            <div className="ownership-empty">
              <KeeperLogo className="ownership-empty-logo" context="auto" decorative />
              <strong>No immediate items found</strong>
              <p>
                Nothing is overdue or marked as needing repair in the records
                currently entered.
              </p>
            </div>
          )}

          {insights.attention.length > visibleAttention.length && (
            <a className="ownership-panel-link" href={maintenanceHref}>
              Review all {insights.attention.length} plan items →
            </a>
          )}
        </section>

      </div>

      <details className="ownership-method-note">
        <summary>How Keeper calculates this overview</summary>
        <p>
          Keeper Health starts at 100 and applies consistent deductions for
          overdue or approaching service, missing history baselines, and
          unresolved owner-tracked concerns. Severity and potential
          consequences affect priority. Age or mileage alone never proves poor
          condition.
        </p>
      </details>
    </section>
  );
}
