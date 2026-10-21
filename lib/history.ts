import {
  analysisResultSchema,
  type AnalysisResult,
} from "./analysis-schema.ts";
export const HISTORY_KEY = "wisechoice.history.v1";
export const LANGUAGE_KEY = "wisechoice.language";
export function readHistory(raw: string | null): AnalysisResult[] {
  try {
    const data: unknown = JSON.parse(raw ?? "[]");
    if (!Array.isArray(data)) return [];
    const valid = data.flatMap((item) => {
      const parsed = analysisResultSchema.safeParse(item);
      return parsed.success ? [parsed.data] : [];
    });
    return valid
      .filter(
        (item, index) =>
          valid.findIndex((other) => other.id === item.id) === index,
      )
      .slice(0, 10);
  } catch {
    return [];
  }
}
export function appendHistory(
  history: AnalysisResult[],
  result: AnalysisResult,
): AnalysisResult[] {
  return [result, ...history.filter((item) => item.id !== result.id)].slice(
    0,
    10,
  );
}
