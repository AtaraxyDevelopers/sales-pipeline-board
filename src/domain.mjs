import { round, sum, ratio, days, money, metric, notice } from "./lib.mjs";
export const config = {
  slug: "sales-pipeline-board",
  title: "Sales Pipeline Board",
  description:
    "Track deal stages, next actions, and stalled opportunities in one workspace.",
  scope:
    "A local planning workspace. Review suggestions before acting; no automatic messages or financial transactions.",
  method:
    "Weighted pipeline sums open deal value × your estimated probability. Won and lost deals are excluded; the weighted total is an assumption, not booked revenue.",
  port: 4413,
  asOf: "2026-11-15",
  fields: [
    {
      key: "name",
      label: "Customer / business name",
      type: "text",
    },
    {
      key: "owner",
      label: "Owner",
      type: "text",
    },
    {
      key: "amount",
      label: "Amount",
      type: "number",
      min: 0,
      max: 100000000,
    },
    {
      key: "stage",
      label: "Stage",
      type: "select",
      options: ["new", "qualified", "proposal", "negotiation", "won", "lost"],
    },
    {
      key: "probability",
      label: "Estimated win probability (%)",
      type: "number",
      min: 0,
      max: 100,
    },
    {
      key: "updated",
      label: "Last meaningful activity",
      type: "date",
    },
    {
      key: "nextDate",
      label: "Next action date",
      type: "date",
    },
    {
      key: "nextAction",
      label: "Next action",
      type: "text",
    },
  ],
  settings: [
    {
      key: "currency",
      label: "Currency code (one currency per workspace)",
      type: "text",
      maxLength: 3,
    },
    {
      key: "staleDays",
      label: "Stalled after days",
      type: "number",
      min: 0,
      max: 365,
      integer: true,
    },
  ],
  actions: [
    {
      label: "Mark won",
      patch: {
        stage: "won",
        probability: 100,
        updated: "$date",
      },
      when: {
        stage: ["new", "qualified", "proposal", "negotiation"],
      },
    },
    {
      label: "Mark lost",
      patch: {
        stage: "lost",
        probability: 0,
        updated: "$date",
      },
      when: {
        stage: ["new", "qualified", "proposal", "negotiation"],
      },
    },
  ],
  document: false,
};

export const example = {
  schemaVersion: 1,
  project: "sales-pipeline-board",
  settings: {
    currency: "USD",
    staleDays: 7,
  },
  records: [
    {
      id: "deal-1",
      name: "Maple Studio",
      owner: "Amina",
      amount: 5000,
      stage: "proposal",
      probability: 60,
      updated: "2026-11-01",
      nextDate: "2026-11-14",
      nextAction: "Review scope together",
    },
    {
      id: "deal-2",
      name: "River Foods",
      owner: "Bilal",
      amount: 2000,
      stage: "won",
      probability: 100,
      updated: "2026-11-14",
      nextDate: "2026-11-20",
      nextAction: "Handoff to delivery",
    },
  ],
};
export function analyze(records, s, asOf) {
  const open = records.filter((r) => !["won", "lost"].includes(r.stage));
  return {
    metrics: [
      metric(
        "Open pipeline",
        money(sum(open.map((r) => r.amount))),
        s.currency,
      ),
      metric(
        "Weighted pipeline",
        money(sum(open.map((r) => (r.amount * r.probability) / 100))),
        s.currency,
      ),
      metric(
        "Won value",
        money(
          sum(records.filter((r) => r.stage === "won").map((r) => r.amount)),
        ),
        s.currency,
      ),
    ],
    notices: open
      .filter((r) => days(asOf, r.updated) > s.staleDays || r.nextDate < asOf)
      .map((r) =>
        notice(
          r.id,
          `${r.name}: ${r.nextAction} (${r.owner}); next action ${r.nextDate}.`,
          "warning",
        ),
      ),
    columns: ["Customer", "Stage", "Value", "Next action", "Due"],
    rows: records.map((r) => ({
      id: r.id,
      Customer: r.name,
      Stage: r.stage,
      Value: money(r.amount),
      "Next action": r.nextAction,
      Due: r.nextDate,
    })),
  };
}
