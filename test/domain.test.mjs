import test from "node:test";
import assert from "node:assert/strict";
import { config, example, analyze } from "../src/domain.mjs";
import { validateState } from "../src/lib.mjs";
test("Documented sample results match independently specified expectations", () => {
  const report = analyze(example.records, example.settings, config.asOf);
  for (const [label, value] of [
    ["Open pipeline", "5000.00"],
    ["Weighted pipeline", "3000.00"],
    ["Won value", "2000.00"],
  ])
    assert.equal(
      report.metrics.find((m) => m.label === label).value,
      value,
      label,
    );
});
test("Business edge cases", () => {
  (function edge(records, s, analyze) {
    assert.equal(
      analyze([{ ...records[0], stage: "lost" }], s, "2026-11-15").metrics[0]
        .value,
      "0.00",
    );
  })(example.records, example.settings, analyze, validateState);
});
