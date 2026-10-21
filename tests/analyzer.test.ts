import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateAnalysis, calculateCVF } from "../lib/analyzer.ts";
import { analysisResultSchema, extractionSchema, type ExtractedEvidence } from "../lib/analysis-schema.ts";

const text = "Программа курса: Excel, формулы и таблицы. 20 практических занятий за 6 недель. Договор и возврат в течение 14 дней. Только сегодня скидка 20%. Цена 45000 тенге.";
const extraction: ExtractedEvidence = {
  title: { ru: "Курс Excel", kz: "Excel курсы", en: "Excel course" },
  qQuality: 80,
  pPriceAnomaly: 25,
  aAltCost: 55,
  qualityEvidence: ["Программа курса: Excel, формулы и таблицы", "20 практических занятий за 6 недель", "Договор и возврат в течение 14 дней"],
  academicSignals: [
    { category: "curriculum", quote: "Программа курса: Excel, формулы и таблицы" },
    { category: "practice", quote: "20 практических занятий" },
    { category: "duration", quote: "6 недель" },
    { category: "credentials", quote: "Договор и возврат в течение 14 дней" },
  ],
  scamSignals: [],
  riskEvidence: [],
  triggers: [{ id: "fomo", intensity: 0.8, quote: "Только сегодня" }],
  price: { amount: 45000, currency: "KZT" },
};

function analyze(input = extraction, source = text, hasImage = false) {
  return calculateAnalysis(extractionSchema.parse(input), source, hasImage);
}

test("documented course retains the author's IDP, IMP and trust calibration despite a discount", () => {
  const result = analyze();
  assert.equal(result.imp, 1.7);
  assert.equal(result.idp, 88);
  assert.equal(result.riskScore, 12);
  assert.equal(result.riskLevel, "low");
  assert.equal(result.bayesianTrust, 88);
  assert.equal(result.metrics.qQuality, 95);
  assert.equal(result.metrics.rRisk, 15);
  assert.equal(result.price.amount, 45000);
  assert.equal(result.calculationVersion, "author-v2.2");
  assert.equal(analysisResultSchema.safeParse(result).success, true);
});

test("CVF retains original coefficients but requires supported comparison data", () => {
  const result = analyze();
  assert.equal(result.cvf, null);
  assert.equal(result.metrics.pPriceAnomaly, null);
  assert.equal(result.metrics.aAltCost, null);
  assert.equal(result.metricBasis?.pPriceAnomaly, null);
  assert.equal(result.metricBasis?.aAltCost, null);
  assert.equal(calculateCVF({ qQuality: 95, pPriceAnomaly: 25, rRisk: 15, aAltCost: 55 }), 0.01);
  assert.equal(result.metricBasis?.qQuality, "formula");
  assert.equal(result.metricBasis?.rRisk, "formula");
  assert.equal(calculateCVF({ qQuality: 0, pPriceAnomaly: 0, rRisk: 0, aAltCost: 0 }), 0);
});

test("missing evidence remains unknown and never receives original placeholder prices", () => {
  const result = analyze({ ...extraction, academicSignals: [], qualityEvidence: [], qQuality: null, pPriceAnomaly: null, aAltCost: null, triggers: [], price: { amount: null, currency: null } }, "Курс английского");
  assert.equal(result.idp, null);
  assert.equal(result.riskScore, null);
  assert.equal(result.riskLevel, "insufficient");
  assert.equal(result.bayesianTrust, null);
  assert.equal(result.cvf, null);
  assert.equal(result.price.amount, null);
  assert.deepEqual(result.metrics, { qQuality: null, pPriceAnomaly: null, rRisk: null, aAltCost: null });
});

test("distinct hard-scam signals use original critical branch; hallucinated quotes are discarded", () => {
  const result = analyze({
    ...extraction,
    academicSignals: [], qualityEvidence: [],
    scamSignals: [
      { category: "income", quote: "Миллион за неделю" },
      { category: "guaranteedOutcome", quote: "100% гарантия дохода без работы" },
    ],
    riskEvidence: [{ severity: "high", quote: "Миллион за неделю" }],
    triggers: [{ id: "fomo", intensity: 1, quote: "несуществующая цитата" }],
  }, "Миллион за неделю. 100% гарантия дохода без работы.");
  assert.equal(result.idp, 20);
  assert.equal(result.bayesianTrust, 15);
  assert.equal(result.riskLevel, "high");
  assert.equal(result.riskScore, 80);
  assert.deepEqual(result.triggers, []);
});

test("academic categories count once and invented categories cannot inflate the score", () => {
  const result = analyze({
    ...extraction,
    academicSignals: [
      { category: "curriculum", quote: "Программа курса: Excel, формулы и таблицы" },
      { category: "curriculum", quote: "Excel, формулы и таблицы" },
      { category: "instructor", quote: "Преподаватель PhD" },
    ],
    triggers: [],
  });
  assert.equal(result.idp, 75);
  assert.equal(result.metrics.qQuality, 40);
  assert.equal(result.bayesianTrust, 50);
  assert.equal(result.riskLevel, "moderate");
});

test("unavailable model estimates leave CVF unknown instead of fabricating a market comparison", () => {
  const result = analyze({ ...extraction, pPriceAnomaly: null, aAltCost: null });
  assert.equal(result.cvf, null);
  assert.equal(result.metrics.pPriceAnomaly, null);
  assert.equal(result.metrics.aAltCost, null);
  assert.equal(result.metricBasis?.pPriceAnomaly, null);
});

test("all verdicts and missing-data limitations exist in three languages", () => {
  const result = analyze();
  for (const lang of ["ru", "kz", "en"] as const) {
    assert.ok(result.verdict[lang].length > 10);
    assert.ok(result.limitations[lang].length >= 2);
  }
  assert.match(result.limitations.en.join(" "), /comparison/i);
});

test("fabricated price is rejected and a free course keeps zero", () => {
  assert.equal(analyze({ ...extraction, price: { amount: 999999, currency: "KZT" } }).price.amount, null);
  const free = analyze({ ...extraction, price: { amount: 0, currency: null } }, `Бесплатно. ${text}`);
  assert.equal(free.price.amount, 0);
  assert.equal(free.price.currency, null);
});

test("hallucinated risk evidence cannot change a documented course's IDP", () => {
  const result = analyze({ ...extraction, scamSignals: [{ category: "income", quote: "guaranteed millions" }], riskEvidence: [{ severity: "high", quote: "guaranteed millions" }] });
  assert.equal(result.idp, 88);
  assert.equal(result.riskLevel, "low");
});

test("invalid numeric model estimates are rejected", () => {
  assert.equal(extractionSchema.safeParse({ ...extraction, pPriceAnomaly: 101 }).success, false);
  assert.equal(extractionSchema.safeParse({ ...extraction, aAltCost: Number.NaN }).success, false);
});

test("marketing-only high risk is explained as pressure without alleging deceptive promises", () => {
  const source = "Вместо 50000 сегодня 25000. Уже 1000 учеников. Известный блогер рекомендует. Только сегодня. Осталось 2 места. Не упусти возможность.";
  const result = analyze({
    ...extraction,
    academicSignals: [], qualityEvidence: [], qQuality: null,
    triggers: [
      { id: "anchoring", intensity: 1, quote: "Вместо 50000 сегодня 25000" },
      { id: "socialProof", intensity: 1, quote: "Уже 1000 учеников" },
      { id: "halo", intensity: 1, quote: "Известный блогер рекомендует" },
      { id: "fomo", intensity: 1, quote: "Только сегодня" },
      { id: "scarcity", intensity: 1, quote: "Осталось 2 места" },
      { id: "lossAversion", intensity: 1, quote: "Не упусти возможность" },
    ],
  }, source);
  assert.equal(result.idp, 35);
  assert.equal(result.riskLevel, "high");
  assert.match(result.verdict.en, /marketing pressure/i);
  assert.doesNotMatch(result.verdict.en, /claims or terms contain serious warning signs/i);
  assert.match(result.verdict.ru, /маркетинг/i);
  assert.match(result.verdict.kz, /маркетинг/i);
});

test("neutral moderate result does not imply the advert contains problematic claims", () => {
  const result = analyze({
    ...extraction,
    academicSignals: [{ category: "curriculum", quote: "Программа курса: Excel, формулы и таблицы" }],
    triggers: [],
  });
  assert.equal(result.idp, 75);
  assert.equal(result.riskLevel, "moderate");
  assert.match(result.verdict.en, /limited educational detail/i);
  assert.doesNotMatch(result.verdict.en, /some claims need checking/i);
});

test("adding supported educational information never reduces IDP", () => {
  const one = analyze({ ...extraction, academicSignals: extraction.academicSignals.slice(0, 1), triggers: [] });
  const two = analyze({ ...extraction, academicSignals: extraction.academicSignals.slice(0, 2), triggers: [] });
  assert.ok(two.idp! >= one.idp!, `${one.idp} dropped to ${two.idp}`);
  assert.ok(two.metrics.qQuality! >= one.metrics.qQuality!);
});

test("explicit scam signals take priority over educational claims in IDP and trust", () => {
  const source = `${text} Гарантия миллиона без работы. Секретная схема лёгких денег.`;
  for (const scamSignals of [
    [{ category: "guaranteedOutcome" as const, quote: "Гарантия миллиона без работы" }],
    [{ category: "guaranteedOutcome" as const, quote: "Гарантия миллиона без работы" }, { category: "secretScheme" as const, quote: "Секретная схема лёгких денег" }],
  ]) {
    const result = analyze({ ...extraction, scamSignals, triggers: [] }, source);
    assert.equal(result.riskLevel, "high");
    assert.ok(result.idp! <= 32);
    assert.ok(result.bayesianTrust! <= 35);
    assert.ok(result.metrics.rRisk! >= scamSignals.length * 30);
  }
});

test("quoted high-risk evidence cannot disappear when its scam category is absent", () => {
  const source = `${text} Пришлите номер карты и код из СМС.`;
  const result = analyze({ ...extraction, scamSignals: [], riskEvidence: [{ severity: "high", quote: "Пришлите номер карты и код из СМС" }], triggers: [] }, source);
  assert.equal(result.riskLevel, "high");
  assert.ok(result.idp! <= 32);
  assert.ok(result.bayesianTrust! <= 35);
  const moderate = analyze({ ...extraction, academicSignals: [], scamSignals: [], triggers: [], riskEvidence: [{ severity: "moderate", quote: "Дополнительные платежи будут сообщены после оплаты" }] }, "Дополнительные платежи будут сообщены после оплаты");
  assert.notEqual(moderate.riskLevel, "insufficient");
  assert.equal(moderate.riskLevel, "moderate");
});

test("zero substitution for unavailable price inputs is explicit and never mutates measured evidence", async () => {
  const { estimateCVF } = await import("../lib/analyzer.ts");
  const metrics = { qQuality: 95, pPriceAnomaly: null, rRisk: 15, aAltCost: null };
  const estimate = estimateCVF(metrics);
  assert.equal(estimate.value, 0.22);
  assert.deepEqual(estimate.assumedZero, ["pPriceAnomaly", "aAltCost"]);
  assert.equal(metrics.pPriceAnomaly, null);
  assert.equal(calculateCVF(metrics), null);
  assert.equal(estimateCVF({ qQuality: 10, pPriceAnomaly: null, rRisk: 95, aAltCost: null }).value, -0.19);
  assert.equal(estimateCVF({ qQuality: null, pPriceAnomaly: null, rRisk: null, aAltCost: null }).value, null);
});
