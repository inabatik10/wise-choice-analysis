import type { AnalysisResult, ExtractedEvidence } from "./analysis-schema.ts";

const weights = {
  anchoring: 0.273,
  socialProof: 0.239,
  halo: 0.239,
  fomo: 0.137,
  scarcity: 0.077,
  lossAversion: 0.034,
};
const normalize = (value: string) =>
  value.normalize("NFKC").replace(/\s+/g, " ").trim().toLowerCase();

/** Author's educational model, using quoted semantic signals from Gemini.
 * v2.2 retains the coefficients, repairs the IDP boundary and gives explicit
 * scam evidence priority over educational claims in IDP, R and trust.
 * Neither IDP nor the historical "Bayesian trust" label is a calibrated probability.
 */
export function calculateAnalysis(
  raw: ExtractedEvidence,
  text: string,
  hasImage: boolean,
): AnalysisResult {
  const contains = (quote: string) =>
    hasImage || normalize(text).includes(normalize(quote));
  const academicScore = new Set(
    raw.academicSignals.filter((signal) => contains(signal.quote)).map((signal) => signal.category),
  ).size * 20;
  const classifiedScamCount = new Set(
    raw.scamSignals.filter((signal) => contains(signal.quote)).map((signal) => signal.category),
  ).size;
  const riskEvidence = raw.riskEvidence
    .filter((e) => contains(e.quote))
    .filter(
      (e, i, all) =>
        all.findIndex(
          (other) => normalize(other.quote) === normalize(e.quote),
        ) === i,
    );
  // High-severity quoted evidence is sufficient even if extraction omitted its
  // separate category. Do not count the same warning twice across both fields.
  const hardScamCount = Math.max(classifiedScamCount, riskEvidence.some(e => e.severity === "high") ? 1 : 0);
  const triggers = raw.triggers
    .filter((t) => contains(t.quote) && t.intensity > 0)
    .filter((t, i, all) => all.findIndex((other) => other.id === t.id) === i);
  const imp = Math.min(
    10,
    Math.round(
      triggers.reduce(
        (sum, t) => sum + weights[t.id] * (1 + 0.34 * t.intensity),
        0,
      ) * 95,
    ) / 10,
  );
  const detectedCount = triggers.length;
  const sufficient = academicScore > 0 || hardScamCount > 0 || detectedCount > 0 || riskEvidence.length > 0;

  // Ordinary marketing does not override a syllabus; explicit scam claims do.
  let idp: number | null = null;
  let bayesianTrust: number | null = null;
  if (sufficient) {
    if (hardScamCount > 0) {
      idp = Math.max(14, Math.min(32, 40 - hardScamCount * 10 - imp * 1.5));
    } else if (academicScore >= 40) {
      const neutralBaseline = 75 - imp * 4.2;
      idp = Math.max(58, Math.min(88, Math.max(neutralBaseline, academicScore + 25 - imp * 3.5)));
    } else {
      idp = Math.max(35, Math.min(78, 65 - imp * 4.2 + (academicScore > 0 ? 10 : 0)));
    }
    idp = Math.round(idp);
    bayesianTrust = 50;
    if (hardScamCount > 0) {
      bayesianTrust = Math.max(12, 35 - hardScamCount * 10);
    } else if (academicScore >= 40) {
      bayesianTrust = Math.min(92, 60 + academicScore * 0.35);
    } else if (detectedCount >= 3) {
      bayesianTrust = 40;
    }
  }
  const riskScore = idp === null ? null : 100 - idp;
  const riskLevel = idp === null ? "insufficient" : idp >= 78 ? "low" : idp >= 55 ? "moderate" : "high";
  const metrics = {
    qQuality: sufficient ? Math.max(10, Math.min(95, academicScore + 20 - hardScamCount * 25)) : null,
    // No comparison dataset exists. Do not restore the original fixed market median or alternative cost.
    pPriceAnomaly: null,
    rRisk: sufficient ? Math.min(95, Math.max(15, hardScamCount * 30 + detectedCount * 8 - (hardScamCount === 0 && academicScore > 40 ? 30 : 0))) : null,
    aAltCost: null,
  };
  const cvf = calculateCVF(metrics);
  let price = { ...raw.price };
  if (!hasImage && price.amount !== null) {
    const numbers = text.match(/\d+(?:[\s\u00a0.,]\d+)*/g) ?? [];
    const found =
      (price.amount === 0 && /бесплатн|тегін|\bfree\b/i.test(text)) ||
      numbers.some((value) => {
        const compact = value.replace(/\s/g, "");
        return (
          Number(compact.replace(/[,\.]/g, "")) === price.amount ||
          Number(compact.replace(",", ".")) === price.amount
        );
      });
    if (!found) price = { amount: null, currency: null };
  }
  if (price.amount === null) price.currency = null;

  const verdicts = {
    insufficient: {
      ru: "Недостаточно сведений для оценки риска. Запросите программу, условия оплаты и возврата. Это не означает, что курс мошеннический.",
      kz: "Тәуекелді бағалауға мәлімет жеткіліксіз. Оқу бағдарламасын, төлем және ақшаны қайтару шарттарын сұраңыз. Бұл курстың алаяқтық екенін білдірмейді.",
      en: "There is not enough information to assess risk. Ask for the syllabus, payment terms and refund policy. This does not mean the course is fraudulent.",
    },
    low: {
      ru: "В предоставленном материале мало явных признаков риска. Маркетинговые приёмы оцениваются отдельно. Сведения о курсе ещё нужно проверить.",
      kz: "Берілген материалда тәуекелдің айқын белгілері аз. Маркетинг тәсілдері бөлек бағаланады. Курс туралы мәліметтерді әлі де тексеру қажет.",
      en: "The supplied material contains few explicit warning signs. Marketing pressure is assessed separately. Course claims still need independent verification.",
    },
    moderate: hardScamCount > 0 || riskEvidence.length > 0 ? {
      ru: "В материале есть утверждения, которые требуют проверки до оплаты. Изучите выделенные цитаты и уточните условия у организатора.",
      kz: "Материалда төлем жасамас бұрын тексеруді қажет ететін тұжырымдар бар. Белгіленген дәйексөздерді қарап, ұйымдастырушыдан шарттарды нақтылаңыз.",
      en: "Some claims need checking before payment. Review the quoted evidence and ask the provider to clarify the terms.",
    } : detectedCount > 0 ? {
      ru: "Модель учитывает маркетинговые приёмы и сведения об обучении. Этот балл сам по себе не указывает на обман. Перед оплатой изучите программу и условия курса.",
      kz: "Модель маркетинг тәсілдері мен оқу туралы мәліметтерді ескереді. Бұл балл өздігінен алдауды білдірмейді. Төлем жасамас бұрын бағдарлама мен курс шарттарын оқыңыз.",
      en: "The model weighs marketing techniques against educational details. This score alone does not indicate deception. Review the syllabus and course terms before paying.",
    } : {
      ru: "Оценка опирается на ограниченные сведения об обучении. Явных опасных обещаний не найдено. Для решения о покупке запросите подробную программу и условия курса.",
      kz: "Бағалау оқу туралы шектеулі мәліметке негізделген. Айқын қауіпті уәделер табылмады. Сатып алу туралы шешім қабылдау үшін толық бағдарлама мен курс шарттарын сұраңыз.",
      en: "The assessment uses limited educational detail. No explicit dangerous promises were found. Ask for the full syllabus and course terms before deciding to buy.",
    },
    high: hardScamCount > 0 ? {
      ru: "Обнаружены серьёзные признаки риска в обещаниях или условиях. Не полагайтесь на рекламу при оплате: запросите проверяемые подтверждения. Это оценка признаков, а не доказательство мошенничества.",
      kz: "Уәделерде немесе шарттарда елеулі тәуекел белгілері табылды. Төлем кезінде жарнамаға ғана сенбеңіз, тексеруге болатын дәлелдерді сұраңыз. Бұл алаяқтықтың дәлелі емес, белгілерді бағалау.",
      en: "The claims or terms contain serious warning signs. Request verifiable evidence before paying. This is an assessment of signals, not proof of fraud.",
    } : {
      ru: "Высокая оценка риска связана с маркетинговым давлением и небольшим объёмом сведений об обучении. Это не доказывает обман. Изучите выделенные цитаты и запросите подробную программу перед оплатой.",
      kz: "Жоғары тәуекел балы маркетинг қысымы мен оқу туралы мәліметтің аздығына байланысты. Бұл алдауды дәлелдемейді. Төлем жасамас бұрын белгіленген дәйексөздерді қарап, толық бағдарламаны сұраңыз.",
      en: "The high risk score reflects marketing pressure and limited educational detail. It does not prove deception. Review the quoted evidence and request the full syllabus before paying.",
    },
  };
  const limitations = {
    ru: [
      "Оценка основана только на присланном материале, без независимой проверки продавца.",
      "Сравнительных данных для P и A нет. Предварительный CVF в интерфейсе принимает их за 0; полный CVF не рассчитан. Q и R получены по модели проекта.",
      "Байесовское доверие здесь является эвристическим баллом авторской модели, а не проверенной вероятностью.",
    ],
    kz: [
      "Бағалау тек жіберілген материалға негізделген. Сатушы тәуелсіз тексерілген жоқ.",
      "P және A үшін салыстыру деректері жоқ. Интерфейстегі алдын ала CVF оларды 0 деп алады; толық CVF есептелмеді. Q және R жоба моделімен есептелді.",
      "Мұндағы Байес сенімі авторлық модельдің эвристикалық балы, тексерілген ықтималдық емес.",
    ],
    en: [
      "This assessment uses only the supplied material. The provider has not been independently verified.",
      "No comparison data is available for P and A. The interface shows a preliminary CVF assuming zero for both; the full CVF was not calculated. Q and R use the project model.",
      "Bayesian trust is a heuristic score from the author’s model, not a calibrated probability.",
    ],
  };
  if (riskEvidence.length) {
    limitations.ru.push(
      ...riskEvidence.map((e) => `Проверьте утверждение: «${e.quote}»`),
    );
    limitations.kz.push(
      ...riskEvidence.map((e) => `Мына тұжырымды тексеріңіз: «${e.quote}»`),
    );
    limitations.en.push(
      ...riskEvidence.map((e) => `Check this claim: "${e.quote}"`),
    );
  }
  return {
    schemaVersion: 1,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    title: raw.title,
    riskScore,
    idp,
    bayesianTrust,
    calculationVersion: "author-v2.2",
    metricBasis: {
      qQuality: metrics.qQuality === null ? null : "formula",
      pPriceAnomaly: null,
      rRisk: metrics.rRisk === null ? null : "formula",
      aAltCost: null,
    },
    riskLevel,
    imp,
    cvf,
    metrics,
    verdict: verdicts[riskLevel],
    limitations,
    triggers,
    price,
    source: "gemini",
  };
}

export function calculateCVF(
  metrics: AnalysisResult["metrics"],
): number | null {
  const { qQuality: q, pPriceAnomaly: p, rRisk: r, aAltCost: a } = metrics;
  if (q === null || p === null || r === null || a === null) return null;
  return Math.round(0.266 * q - 0.246 * p - 0.227 * r - 0.261 * a) / 100;
}

/** A labeled upper-bound scenario, not measured market data. Missing Q/R still
 * prevents a value. Never mutate evidence or persist assumptions as facts. */
export function estimateCVF(metrics: AnalysisResult["metrics"]) {
  const assumedZero = (["pPriceAnomaly", "aAltCost"] as const).filter(key => metrics[key] === null);
  return {
    value: calculateCVF({ ...metrics, pPriceAnomaly: metrics.pPriceAnomaly ?? 0, aAltCost: metrics.aAltCost ?? 0 }),
    assumedZero,
  };
}
