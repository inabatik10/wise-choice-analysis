import { z } from "zod";

export const languages = ["ru", "kz", "en"] as const;
export type Language = (typeof languages)[number];
export const triggerIds = [
  "anchoring",
  "socialProof",
  "halo",
  "fomo",
  "scarcity",
  "lossAversion",
] as const;
export const academicCategories = [
  "curriculum", "practice", "duration", "credentials", "instructor",
] as const;
export const scamCategories = [
  "income", "guaranteedOutcome", "pseudoscience", "unsafePayment", "secretScheme",
] as const;
const translatedText = z.object({
  ru: z.string().min(1).max(1200),
  kz: z.string().min(1).max(1200),
  en: z.string().min(1).max(1200),
});
const metric = z.number().min(0).max(100).nullable();
const priceSchema = z.object({
  amount: z.number().min(0).max(1e12).nullable(),
  currency: z.enum(["KZT", "RUB", "USD", "EUR"]).nullable(),
});
const triggerSchema = z.object({
  id: z.enum(triggerIds),
  intensity: z.number().min(0).max(1),
  quote: z.string().min(1).max(1000),
});

export const analysisResultSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().min(1).max(100),
  createdAt: z.string().datetime(),
  title: translatedText,
  riskScore: metric,
  idp: metric,
  riskLevel: z.enum(["low", "moderate", "high", "insufficient"]),
  imp: z.number().min(0).max(10),
  cvf: z.number().min(-1).max(1).nullable(),
  // Optional so previously saved results remain readable, without invented recalculations.
  bayesianTrust: metric.optional(),
  calculationVersion: z.enum(["author-v2.1", "author-v2.2"]).optional(),
  metricBasis: z.object({
    qQuality: z.literal("formula").nullable(),
    pPriceAnomaly: z.literal("comparison").nullable(),
    rRisk: z.literal("formula").nullable(),
    aAltCost: z.literal("comparison").nullable(),
  }).optional(),
  metrics: z.object({
    qQuality: metric,
    pPriceAnomaly: metric,
    rRisk: metric,
    aAltCost: metric,
  }),
  verdict: translatedText,
  limitations: z.object({
    ru: z.array(z.string().max(1200)).max(12),
    kz: z.array(z.string().max(1200)).max(12),
    en: z.array(z.string().max(1200)).max(12),
  }),
  triggers: z.array(triggerSchema).max(6),
  price: priceSchema,
  source: z.literal("gemini"),
});
export type AnalysisResult = z.infer<typeof analysisResultSchema>;

/** Gemini extracts evidence, never the final risk score or invented market prices. */
export const extractionSchema = z.object({
  title: translatedText,
  qQuality: metric,
  pPriceAnomaly: metric,
  aAltCost: metric,
  qualityEvidence: z.array(z.string().min(1).max(1000)).max(8),
  academicSignals: z.array(z.object({
    category: z.enum(academicCategories),
    quote: z.string().min(1).max(1000),
  })).max(8),
  scamSignals: z.array(z.object({
    category: z.enum(scamCategories),
    quote: z.string().min(1).max(1000),
  })).max(8),
  riskEvidence: z
    .array(
      z.object({
        severity: z.enum(["moderate", "high"]),
        quote: z.string().min(1).max(1000),
      }),
    )
    .max(8),
  triggers: z.array(triggerSchema).max(6),
  price: priceSchema,
});
export type ExtractedEvidence = z.infer<typeof extractionSchema>;
