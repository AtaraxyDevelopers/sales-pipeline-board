import assert from "node:assert/strict";
import { config, example, analyze } from "../src/domain.mjs";
import { validateState } from "../src/lib.mjs";
// Record the proposal as won with a confirmed deal value.
// This changes a copy of fictional data; no files or external services are changed.
const workspace = structuredClone(example);
Object.assign(workspace.records[0], { stage: "won", probability: 100 });
const valid = validateState(workspace, config);
const report = analyze(valid.records, valid.settings, config.asOf);
const actual = report.metrics.find(
  (metric) => metric.label === "Won value",
).value;
assert.equal(actual, "7000.00");
console.log("Won value: " + actual);
