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
  const visibleGroups = insights.upcoming.filter(
    (group) => group.items.length,
  );

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
            <div>
              <span>What needs attention</span>
              <h3 id="needs-attention-title">Needs attention</h3>
            </div>

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

        <section
          className="upcoming-maintenance-panel"
          aria-labelledby="upcoming-maintenance-title"
        >
          <header>
            <div>
              <span>Coming up</span>
              <h3 id="upcoming-maintenance-title">
                Upcoming maintenance
              </h3>
            </div>

            <a href={maintenanceHref}>Full plan →</a>
          </header>

          {visibleGroups.length ? (
            <div className="upcoming-groups">
              {visibleGroups.map((group) => (
                <section key={group.key}>
                  <h4>
                    {group.label}
                    <b>{group.items.length}</b>
                  </h4>

                  <ul>
                    {group.items.slice(0, 3).map((item) => (
                      <li key={item.slug}>
                        <div>
                          <strong>{item.name}</strong>
                          <small>
                            {recommendationLabel(item.recommendationType)}
                          </small>
                        </div>

                        <span>{item.dueLabel}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          ) : (
            <div className="ownership-empty">
              <KeeperLogo className="ownership-empty-logo" context="auto" decorative />
              <strong>No reliable due points yet</strong>
              <p>
                Log completed work with mileage and date. Keeper will build
                the upcoming plan from those baselines.
              </p>
            </div>
          )}

          <p className="ownership-guidance-note">
            Schedules vary by vehicle and use. Keeper planning intervals are
            conservative ownership guidance; confirm VIN-specific
            requirements when needed.
          </p>
        </section>
      </div>

      <div className="ownership-secondary-grid">
        <section
          className="maintenance-timeline"
          aria-labelledby="maintenance-timeline-title"
        >
          <header>
            <div>
              <span>Ownership timeline</span>
              <h3 id="maintenance-timeline-title">
                Know what comes next
              </h3>
            </div>
          </header>

          <ol>
            <li className="today">
              <i />
              <div>
                <span>Today</span>
                <strong>
                  {currentMileage === null
                    ? "Mileage not entered"
                    : `${currentMileage.toLocaleString()} mi`}
                </strong>
              </div>
            </li>

            {insights.timeline.map((item) => (
              <li key={item.slug}>
                <i />
                <div>
                  <span>{item.category}</span>
                  <strong>{item.name}</strong>
                  <small>
                    {item.dueLabel} ·{" "}
                    {recommendationLabel(item.recommendationType)}
                  </small>
                </div>
              </li>
            ))}
          </ol>

          {!insights.timeline.length && (
            <p className="timeline-empty">
              The timeline will appear after at least one recurring service
              has a completed date or mileage baseline.
            </p>
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
