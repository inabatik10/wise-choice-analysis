import { test } from "node:test";
import assert from "node:assert/strict";
import { readHistory, appendHistory } from "../lib/history.ts";
const result = {
  schemaVersion: 1,
  id: "one",
  createdAt: "2026-10-22T00:00:00.000Z",
  title: { ru: "Курс", kz: "Курс", en: "Course" },
  riskScore: 15,
  idp: 85,
  riskLevel: "low",
  imp: 2,
  cvf: null,
  metrics: { qQuality: 80, pPriceAnomaly: null, rRisk: 15, aAltCost: null },
  verdict: {
    ru: "Есть программа",
    kz: "Бағдарламасы бар",
    en: "Syllabus provided",
  },
  limitations: { ru: [], kz: [], en: [] },
  triggers: [],
  price: { amount: 45000, currency: "KZT" },
  source: "gemini",
} as const;

test("corrupt and incompatible browser data never crashes", () => {
  assert.deepEqual(readHistory("{broken"), []);
  assert.deepEqual(readHistory(JSON.stringify([{ id: "old", idp: 28 }])), []);
});
test("only ten valid latest unique results persist and roundtrip", () => {
  let entries = readHistory(JSON.stringify([result]));
  for (let i = 0; i < 12; i++)
    entries = appendHistory(entries, { ...entries[0], id: String(i) });
  assert.equal(entries.length, 10);
  assert.equal(entries[0].id, "11");
  assert.equal(appendHistory(entries, entries[0]).length, 10);
  assert.deepEqual(readHistory(JSON.stringify(entries)), entries);
});
