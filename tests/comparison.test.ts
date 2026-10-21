import { test } from "node:test";
import assert from "node:assert/strict";
import { comparisonStats } from "../lib/comparison.ts";
test("comparison uses same currency only and excludes product price from median", () => {
  const stats = comparisonStats({ amount: 45000, currency: "KZT" }, [
    { name: "A", amount: 20000, currency: "KZT" },
    { name: "B", amount: 40000, currency: "KZT" },
    { name: "C", amount: 1, currency: "USD" },
  ]);
  assert.equal(stats.median, 30000);
  assert.equal(stats.difference, 50);
  assert.equal(stats.courses.length, 2);
});
test("missing prices and a zero median never invent a percentage", () => {
  assert.equal(
    comparisonStats({ amount: null, currency: null }, []).difference,
    null,
  );
  assert.equal(
    comparisonStats({ amount: 300, currency: "KZT" }, [
      { name: "Free", amount: 0, currency: "KZT" },
    ]).difference,
    null,
  );
});
