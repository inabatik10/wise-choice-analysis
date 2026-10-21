"use client";

import { estimateCVF } from "@/lib/analyzer";

import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion } from "motion/react";
import { Accordion } from "@animate-ui/react/primitives/base-ui/accordion";
import { Tabs } from "@animate-ui/react/primitives/base-ui/tabs";
import { ArrowLeft, ArrowUpRight, Check, ChevronDown, Info } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AnalysisResult } from "@/lib/analysis-schema";
import { locale, type Lang, type Translation } from "@/lib/i18n";

const copy = {
  ru: {
    scale: "Выше IDP, меньше признаков риска", evidence: "Что заметили в рекламе", evidenceIntro: "Это фразы из присланного материала и объяснение, как они влияют на решение о покупке.", quoted: "Фраза из рекламы", empty: "Явных приёмов давления не найдено", emptyHint: "Это не проверка продавца. Программу и условия курса всё равно стоит изучить до оплаты.", pressure: "Давление рекламы", pressureNote: "Скидка или ограниченный срок сами по себе не доказывают обман.", price: "Цена из этой рекламы", compare: "Сравнить цену", comparisonHint: "Сопоставьте с похожими курсами. Высокая цена сама по себе не означает обман.", next: "Перед оплатой", steps: ["Сверьте программу и опыт преподавателя.", "Прочитайте договор и условия возврата."], method: "Методика расчёта", methodHint: "Формулы, показатели и ограничения модели", model: "Gemini извлекает признаки из рекламы. Баллы рассчитываются по авторской учебной модели, а не по независимой проверке продавца.", value: "Ценность курса", pressureTab: "Маркетинговое давление", trust: "Доверие модели", bayes: "Байес", prior: "До анализа", after: "После анализа", trustNote: "Начальная оценка 50 меняется по найденным признакам. Это эвристика проекта, не статистически проверенная вероятность.", unavailable: "Для P и A нужны данные о сопоставимых курсах. Без них CVF не вычисляется.", oldTrust: "В этой сохранённой проверке доверие не рассчитывалось. Оно появится после новой проверки.", missing: "Недостаточно данных", lowPressure: "Слабое давление", mediumPressure: "Умеренное давление", highPressure: "Сильное давление", newCheck: "Новая проверка", limitations: "Ограничения результата", basis: "Баллы по сведениям из рекламы", summary: "Учебная оценка признаков, не доказательство мошенничества.",
    explanations: {
      anchoring: "Старая цена задаёт точку отсчёта и делает скидку привлекательнее. Сравните итоговую цену с аналогичными курсами.",
      socialProof: "Отзывы и число учеников предлагают довериться чужому выбору. Проверьте независимые отзывы, а не только подборку продавца.",
      halo: "Авторитет или популярность человека переносятся на курс. Уточните его опыт именно в теме обучения.",
      fomo: "Ограниченный срок подталкивает решить быстрее. Проверьте, реальный ли это дедлайн, и оставьте себе время на сравнение.",
      scarcity: "Ограниченное число мест создаёт ощущение дефицита. Уточните, почему мест мало и когда будет следующий набор.",
      lossAversion: "Предложение подчёркивает, что вы потеряете, если не купите. Оцените пользу курса отдельно от страха упустить выгоду.",
    },
  },
  kz: {
    scale: "IDP жоғары болса, тәуекел белгілері аз", evidence: "Жарнамадан не байқадық", evidenceIntro: "Төменде жіберілген материалдағы сөздер және олардың сатып алу шешіміне әсері түсіндірілген.", quoted: "Жарнамадағы сөздер", empty: "Айқын қысым тәсілдері табылмады", emptyHint: "Бұл сатушыны тексеру емес. Төлемге дейін бағдарлама мен курс шарттарын қарап шығыңыз.", pressure: "Жарнама қысымы", pressureNote: "Жеңілдік немесе қысқа мерзім өздігінен алдауды дәлелдемейді.", price: "Осы жарнамадағы баға", compare: "Бағаны салыстыру", comparisonHint: "Ұқсас курстармен салыстырыңыз. Жоғары баға өздігінен алдауды білдірмейді.", next: "Төлемге дейін", steps: ["Бағдарлама мен оқытушы тәжірибесін тексеріңіз.", "Келісімшарт пен ақшаны қайтару шарттарын оқыңыз."], method: "Есептеу әдістемесі", methodHint: "Формулалар, көрсеткіштер және модель шектеулері", model: "Gemini жарнамадан белгілерді анықтайды. Балдар сатушыны тәуелсіз тексеру арқылы емес, авторлық оқу моделімен есептеледі.", value: "Курс құндылығы", pressureTab: "Маркетингтік қысым", trust: "Модель сенімі", bayes: "Байес", prior: "Талдауға дейін", after: "Талдаудан кейін", trustNote: "Бастапқы 50 балл табылған белгілерге қарай өзгереді. Бұл жобаның эвристикасы, статистикалық расталған ықтималдық емес.", unavailable: "P және A үшін ұқсас курстар туралы дерек қажет. Оларсыз CVF есептелмейді.", oldTrust: "Бұл сақталған тексеруде сенім есептелмеген. Ол жаңа тексеруден кейін көрсетіледі.", missing: "Дерек жеткіліксіз", lowPressure: "Әлсіз қысым", mediumPressure: "Орташа қысым", highPressure: "Күшті қысым", newCheck: "Жаңа тексеру", limitations: "Нәтиженің шектеулері", basis: "Жарнама мәліметтері бойынша балдар", summary: "Белгілердің оқу бағасы, алаяқтықтың дәлелі емес.",
    explanations: {
      anchoring: "Бұрынғы баға жеңілдікті тартымды етіп көрсетеді. Соңғы бағаны ұқсас курстармен салыстырыңыз.",
      socialProof: "Пікірлер мен оқушылар саны өзгенің таңдауына сенуге шақырады. Сатушы таңдаған пікірлерден бөлек тәуелсіз пікірлерді қараңыз.",
      halo: "Адамның беделі немесе танымалдығы курсқа сенім тудырады. Оның оқытатын саладағы тәжірибесін нақтылаңыз.",
      fomo: "Шектеулі мерзім тез шешім қабылдауға итермелейді. Мерзімнің шынайылығын тексеріп, салыстыруға уақыт қалдырыңыз.",
      scarcity: "Орын санының аздығы тапшылық сезімін тудырады. Неліктен орын аз екенін және келесі қабылдау қашан болатынын сұраңыз.",
      lossAversion: "Ұсыныс сатып алмасаңыз не жоғалтатыныңызға назар аударады. Курс пайдасын мүмкіндіктен айырылу қорқынышынан бөлек бағалаңыз.",
    },
  },
  en: {
    scale: "Higher IDP means fewer warning signs", evidence: "What we noticed in the ad", evidenceIntro: "These quotes come from the material you submitted. Each explanation shows how the wording may influence a purchase.", quoted: "Words from the ad", empty: "No clear pressure techniques found", emptyHint: "This does not verify the seller. Check the syllabus and course terms before paying.", pressure: "Advertising pressure", pressureNote: "A discount or deadline alone does not prove deception.", price: "Price in this ad", compare: "Compare price", comparisonHint: "Compare with similar courses. A high price alone does not imply deception.", next: "Before you pay", steps: ["Check the syllabus and the teacher's relevant experience.", "Read the contract and refund terms."], method: "How the score is calculated", methodHint: "Formulas, metrics and model limitations", model: "Gemini extracts signals from the ad. Scores use the author's educational model, not independent verification of the seller.", value: "Course value", pressureTab: "Marketing pressure", trust: "Model trust", bayes: "Bayes", prior: "Before analysis", after: "After analysis", trustNote: "The starting score of 50 changes with the signals found. This is a project heuristic, not a statistically validated probability.", unavailable: "P and A need comparable-course data. Without it, CVF cannot be calculated.", oldTrust: "Trust was not calculated for this saved result. Run a new check to see it.", missing: "Not enough data", lowPressure: "Low pressure", mediumPressure: "Moderate pressure", highPressure: "High pressure", newCheck: "New check", limitations: "Result limitations", basis: "Scores based on information in the ad", summary: "An educational assessment of signals, not proof of fraud.",
    explanations: {
      anchoring: "The previous price sets a reference point and makes the discount seem attractive. Compare the final price with similar courses.",
      socialProof: "Reviews and student counts encourage you to trust other people's choices. Look for independent reviews beyond the seller's selection.",
      halo: "A person's authority or popularity is transferred to the course. Check their experience in the subject they teach.",
      fomo: "A deadline encourages a faster decision. Check whether it is a real deadline and leave time to compare your options.",
      scarcity: "A limited number of places creates a sense of scarcity. Ask why places are limited and when enrolment will reopen.",
      lossAversion: "The offer stresses what you could lose by not buying. Judge the course's value separately from the fear of missing out.",
    },
  },
};

const colors = { red: "#ef4444", orange: "#f97316", yellow: "#eab308", green: "#22c55e", teal: "#2dd4bf", muted: "#99a8b7" };
const reportLabels = {
  ru: { conclusion: "Вывод по рекламе", value: "Ценность", pressure: "Давление", trust: "Доверие", checked: "Проверено", found: "Найдено приёмов" },
  kz: { conclusion: "Жарнама бойынша қорытынды", value: "Құндылық", pressure: "Қысым", trust: "Сенім", checked: "Тексерілді", found: "Табылған тәсілдер" },
  en: { conclusion: "What the ad tells us", value: "Value", pressure: "Pressure", trust: "Trust", checked: "Checked", found: "Techniques found" },
};
function scoreColor(score: number | null) {
  return score === null ? "var(--muted-foreground)" : score < 33 ? "var(--risk-red)" : score < 55 ? "var(--risk-orange)" : score < 78 ? "var(--risk-yellow)" : "var(--risk-green)";
}

function IdpGauge({ score, lang }: { score: number | null; lang: Lang }) {
  const reducedMotion = useReducedMotion();
  const progress = useMotionValue(0);
  const [displayProgress, setDisplayProgress] = useState(0);
  useMotionValueEvent(progress, "change", setDisplayProgress);
  useEffect(() => {
    if (score === null) return;
    if (reducedMotion) { progress.set(score); return; }
    progress.set(0);
    const animation = animate(progress, score, { duration: 1.35, ease: [0.22, 1, 0.36, 1] });
    return () => animation.stop();
  }, [score, progress, reducedMotion]);
  const polar = (value: number, radius = 120) => {
    const radians = (-180 + value * 1.8) * Math.PI / 180;
    return { x: 150 + radius * Math.cos(radians), y: 150 + radius * Math.sin(radians) };
  };
  const zones = [[0, 33, colors.red], [33, 55, colors.orange], [55, 78, colors.yellow], [78, 100, colors.green]] as const;
  return <div data-testid="idp-gauge" data-reduced-motion={reducedMotion ? "true" : "false"} className="w-full max-w-[420px] text-center">
    <svg viewBox="0 0 300 205" className="w-full" role="img" aria-label={`IDP: ${score ?? copy[lang].missing}. ${copy[lang].scale}`}>
      <path d="M 30 150 A 120 120 0 0 1 270 150" stroke="var(--border)" strokeWidth="18" fill="none" />
      {zones.map(([from, to, color]) => {
        const start = polar(from + 0.45), end = polar(to - 0.45);
        return <path key={from} data-testid="idp-segment" d={`M ${start.x} ${start.y} A 120 120 0 0 1 ${end.x} ${end.y}`} fill="none" stroke={color} strokeWidth="18" opacity={score === null ? 0.3 : 1} />;
      })}
      {[0, 25, 50, 75, 100].map(value => {
        const from = polar(value, 100), to = polar(value, 92), text = polar(value, 72);
        return <g key={value}><line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="var(--muted-foreground)" strokeWidth="2" /><text x={text.x} y={text.y + 5} textAnchor="middle" fill="var(--muted-foreground)" fontSize="20">{value}</text></g>;
      })}
      {score !== null && <>
        <g data-testid="idp-needle" transform={`rotate(${-180 + displayProgress * 1.8} 150 150)`}>
          <path d="M 143 146 L 254 150 L 143 154 Z" fill="var(--foreground)" />
        </g>
        <circle cx="150" cy="150" r="8" fill="var(--card)" stroke="var(--foreground)" strokeWidth="3" />
      </>}
      <text x="150" y="199" textAnchor="middle" fill={scoreColor(score)} fontSize="44" fontWeight="650" data-testid="idp-score">{score === null ? "—" : Math.round(displayProgress)}</text>
    </svg>
    <p className="mt-1 text-sm text-muted-foreground">IDP / 100</p>
  </div>;
}

function PressureRing({ value }: { value: number }) {
  const reducedMotion = useReducedMotion();
  const circumference = 2 * Math.PI * 40;
  return <div data-testid="imp-ring" className="relative size-48 shrink-0 sm:size-56">
    <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden="true">
      <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" strokeWidth="7" />
      <motion.circle cx="50" cy="50" r="40" fill="none" stroke="var(--primary)" strokeWidth="7" strokeLinecap="round" strokeDasharray={circumference} initial={{ strokeDashoffset: reducedMotion ? circumference * (1 - value / 10) : circumference }} animate={{ strokeDashoffset: circumference * (1 - value / 10) }} transition={{ duration: reducedMotion ? 0 : 0.65 }} />
    </svg>
    <div className="absolute inset-0 flex items-center justify-center text-[32px] font-semibold tabular-nums text-primary">{value}<span className="ml-1 text-sm font-normal text-muted-foreground">/10</span></div>
  </div>;
}

export function AnalysisResultView({ result, lang, t, onComparePrice, onNewAnalysis }: {
  result: AnalysisResult; lang: Lang; t: Translation;
  onComparePrice?: () => void; onNewAnalysis?: () => void;
}) {
  const s = copy[lang];
  const cvfCopy = {
    ru: { preliminary: "Предварительный CVF", assumption: "* P и A приняты за 0: нет сравнительных данных. Этот расчёт не учитывает цену и альтернативы.", incomplete: "Для расчёта нужны сведения Q и R. Подстановки нулей для P и A недостаточно." },
    kz: { preliminary: "Алдын ала CVF", assumption: "* P және A 0 деп алынды: салыстыру деректері жоқ. Бұл есеп баға мен баламаларды ескермейді.", incomplete: "Есептеу үшін Q және R деректері қажет. P және A орнына нөл қою жеткіліксіз." },
    en: { preliminary: "Preliminary CVF", assumption: "* P and A are assumed to be 0: comparison data is missing. This calculation excludes price and alternatives.", incomplete: "Q and R are needed for the calculation. Zero assumptions for P and A are not enough." },
  }[lang];
  const cvfEstimate = estimateCVF(result.metrics);
  const cvfValue = result.cvf ?? cvfEstimate.value;
  const isEstimate = result.cvf === null && cvfValue !== null && cvfEstimate.assumedZero.length > 0;
  const labels = reportLabels[lang];
  const number = (value: number) => new Intl.NumberFormat(lang === "kz" ? "ru-RU" : locale[lang], { maximumFractionDigits: 2 }).format(value);
  const symbols = { KZT: "₸", RUB: "₽", USD: "$", EUR: "€" };
  const price = result.price.amount === null ? t.priceUnknown : `${number(result.price.amount)} ${result.price.currency ? symbols[result.price.currency] : t.currencyUnknown}`;
  const trust = result.bayesianTrust ?? null;
  const metrics = [{ key: "qQuality", symbol: "Q", color: "var(--primary)" }, { key: "pPriceAnomaly", symbol: "P", color: "var(--risk-orange)" }, { key: "rRisk", symbol: "R", color: "var(--risk-red)" }, { key: "aAltCost", symbol: "A", color: "var(--risk-yellow)" }] as const;
  const pressureLabel = result.imp >= 7 ? s.highPressure : result.imp >= 4 ? s.mediumPressure : s.lowPressure;
  const checkedAt = new Intl.DateTimeFormat(locale[lang], { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(result.createdAt));
  return <div className="mx-auto max-w-5xl space-y-5">
    <header className="flex items-start justify-between gap-3">
      <div className="min-w-0"><h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{result.title[lang]}</h1><p className="mt-1 text-xs text-muted-foreground">{labels.checked} <time data-testid="analysis-date" dateTime={result.createdAt}>{checkedAt}</time></p></div>
      {onNewAnalysis && <button type="button" aria-label={s.newCheck} onClick={onNewAnalysis} className="flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-primary"><ArrowLeft className="size-4" /><span className="hidden sm:inline">{s.newCheck}</span></button>}
    </header>

    <section data-testid="analysis-summary" className="grid gap-4 lg:grid-cols-[minmax(394px,0.9fr)_minmax(0,1.1fr)]">
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card px-4 py-6 text-center">
        <IdpGauge key={result.id} score={result.idp} lang={lang} />
        <div className="min-w-0 max-w-[400px]">
          <h2 className="text-xl font-semibold sm:text-2xl" style={{ color: scoreColor(result.idp) }}>{t.risk[result.riskLevel]}</h2>
          <p className="mt-2 text-sm leading-5 text-muted-foreground">{s.scale}</p>
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div><h2 className="text-lg font-semibold text-foreground">{labels.conclusion}</h2><p className="mt-3 text-base leading-6 text-foreground">{result.verdict[lang]}</p></div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm"><span className="text-muted-foreground">{s.pressure}</span><span className="font-medium text-foreground">{pressureLabel}<span className="ml-2 tabular-nums text-primary">{number(result.imp)} / 10</span></span></div>
        <section><h2 className="text-base font-medium text-foreground">{s.next}</h2><ul className="mt-3 space-y-3">{s.steps.map(step => <li key={step} className="flex gap-2 text-base leading-6 text-muted-foreground"><Check className="mt-1 size-4 shrink-0 text-primary" />{step}</li>)}</ul></section>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
          <div className="min-w-0"><h3 className="text-xs text-muted-foreground">{s.price}</h3><p data-testid="course-price" className="mt-1 text-2xl font-semibold tabular-nums text-foreground sm:text-3xl">{price}</p></div>
          {onComparePrice && <button type="button" data-testid="nav-radar" onClick={onComparePrice} className="flex h-12 shrink-0 items-center justify-between gap-3 rounded-full border border-primary/30 bg-transparent px-5 text-[15px] font-medium text-primary transition-colors hover:bg-primary/10">{s.compare}<ArrowUpRight className="size-4" /></button>}
        </div>
      </div>
    </section>

      <section data-testid="analysis-evidence" className="min-w-0">
        <div className="mb-4"><h2 className="text-lg font-semibold text-foreground">{s.evidence}</h2><p className="mt-2 text-base leading-6 text-muted-foreground">{s.evidenceIntro}</p></div>
        <div className="divide-y divide-border border-y border-border">
          {result.triggers.length ? result.triggers.map(trigger => <article key={trigger.id} className="grid gap-3 py-5 md:grid-cols-[200px_minmax(0,1fr)] md:gap-6">
            <h3 className="text-base font-medium leading-6 text-foreground">{t.triggers[trigger.id]}</h3>
            <div className="max-w-[75ch]">
              <blockquote className="text-base leading-6 text-foreground">{trigger.quote}</blockquote>
              <p className="mt-2 text-base leading-6 text-muted-foreground">{s.explanations[trigger.id]}</p>
            </div>
          </article>) : <div className="py-5"><p className="flex items-center gap-2 text-base font-medium text-primary"><Check className="size-4" />{s.empty}</p><p className="mt-3 text-base leading-6 text-muted-foreground">{s.emptyHint}</p></div>}
        </div>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">{t.originalQuote}. {s.pressureNote}</p>
      </section>


    <Accordion.Root defaultValue={["methodology"]} data-testid="methodology-section" className="border-t border-border">
      <Accordion.Item value="methodology">
        <Accordion.Header><Accordion.Trigger data-testid="methodology-toggle" className="group flex min-h-16 w-full items-center justify-between gap-4 py-5 text-left"><span><span className="block text-base font-medium text-foreground">{s.method} <span className="ml-1 text-sm font-normal text-muted-foreground">· CVF / IMP / {s.bayes}</span></span><span className="mt-1 block text-xs text-muted-foreground">{s.methodHint}</span></span><ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[panel-open]:rotate-180" /></Accordion.Trigger></Accordion.Header>
        <Accordion.Panel>
          <div className="pb-5">
            <Tabs.Root defaultValue="cvf">
              <Tabs.List className="relative isolate flex gap-6 border-b border-border sm:gap-8">
                {[{ id: "cvf", label: "CVF", meaning: labels.value }, { id: "imp", label: "IMP", meaning: labels.pressure }, { id: "bayes", label: s.bayes, meaning: labels.trust }].map(tab => <Tabs.Tab key={tab.id} data-testid={`method-tab-${tab.id}`} value={tab.id} className="min-h-12 flex-1 border-b-2 border-transparent bg-transparent px-0 py-3 text-sm font-normal text-muted-foreground outline-none hover:text-foreground data-active:border-primary data-active:font-semibold data-active:text-primary focus-visible:ring-2 focus-visible:ring-ring sm:flex-none"><span className="hidden sm:inline">{tab.meaning} · </span>{tab.label}</Tabs.Tab>)}
              </Tabs.List>
              {/* Base UI owns visibility; Animate UI keeps the moving tab indicator. */}
              <Tabs.Panel value="cvf" render={<div />} className="pt-6">
                <h3 className="text-lg font-medium text-foreground">{s.value}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">CVF = (0.266Q − 0.246P − 0.227R − 0.261A) / 100</p>
                <div className="mt-5 grid gap-5 sm:grid-cols-2 sm:gap-8">{metrics.filter(({ key }) => result.metrics[key] !== null).map(({ key, symbol, color }) => <div key={key} data-testid={`metric-${key}`}>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-sm leading-6 text-foreground sm:text-base"><span className="mr-2 font-semibold" style={{ color }}>{symbol}</span>{t.metrics[key]}</span>
                    <span className="shrink-0 text-sm leading-6 tabular-nums text-foreground sm:text-base">{number(result.metrics[key]!)}/100</span>
                  </div>
                  <div data-testid="metric-bar" className="mt-3 h-3 overflow-hidden bg-muted"><motion.div className="h-full" style={{ backgroundColor: color, width: `${result.metrics[key]}%` }} /></div>
                </div>)}</div>
                {metrics.some(({ key }) => result.metrics[key] === null) && <div className="mt-5 space-y-2">{metrics.filter(({ key }) => result.metrics[key] === null).map(({ key, symbol, color }) => <p key={key} data-testid={`metric-${key}`} className="text-sm leading-6 text-muted-foreground"><span className="mr-2 font-semibold" style={{ color }}>{symbol}</span>{t.metrics[key]}: <span>{key === "pPriceAnomaly" || key === "aAltCost" ? "0* / 100" : t.unknown}</span></p>)}</div>}
                <p data-testid="cvf-value" className="mt-4 text-lg text-foreground">{isEstimate ? cvfCopy.preliminary : "CVF"}: <span className="font-medium text-primary">{cvfValue === null ? t.unknown : number(cvfValue)}</span></p>
                <p data-testid="cvf-assumptions" className="mt-2 max-w-[75ch] text-base leading-6 text-muted-foreground">{isEstimate ? cvfCopy.assumption : cvfValue === null ? cvfCopy.incomplete : s.basis}</p>
              </Tabs.Panel>
              <Tabs.Panel value="imp" render={<div />} className="pt-6">
                <h3 className="text-lg font-medium text-foreground">{s.pressureTab}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">IMP = min(10, 9.5 × Σ αᵢ(1 + 0.34 × Iᵢ))</p>
                <div className="mx-auto mt-4 flex max-w-xl flex-col items-center gap-4 text-center"><PressureRing value={result.imp} /><div data-testid="imp-description" className="w-full"><p className="text-lg font-medium text-foreground">{pressureLabel}</p><p className="mt-2 text-base leading-6 text-muted-foreground">{labels.found}: <span className="tabular-nums text-foreground">{result.triggers.length}</span></p>{result.triggers.length > 0 && <p className="mt-1 text-base leading-6 text-muted-foreground">{result.triggers.map(trigger => t.triggers[trigger.id]).join(", ")}</p>}</div></div>
              </Tabs.Panel>
              <Tabs.Panel value="bayes" render={<div />} className="pt-6">
                <div data-testid="bayes-panel"><h3 className="text-lg font-medium text-foreground">{s.trust}{trust !== null && <span className="ml-2 text-primary">{number(trust)} / 100</span>}</h3><p className="mt-2 text-base leading-6 text-muted-foreground">{s.trustNote}</p>
                  {trust === null ? <p className="mt-4 text-base leading-6 text-muted-foreground">{s.oldTrust}</p> : <div data-testid="bayes-chart" className="mt-5 h-[280px] min-w-0 w-full sm:h-[360px]" role="img" aria-label={`${s.trust}: 50 → ${trust}`}>
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}><LineChart data={[{ step: s.prior, value: 50 }, { step: s.after, value: trust }]} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} /><XAxis dataKey="step" interval={0} padding={{ left: 28, right: 40 }} height={44} tickMargin={12} tick={{ fontSize: 13, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} /><YAxis domain={[0, 100]} width={36} tickMargin={8} tick={{ fontSize: 13, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} /><Tooltip contentStyle={{ backgroundColor: "var(--card)", color: "var(--foreground)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 14 }} /><Line type="linear" dataKey="value" name={s.trust} stroke="var(--primary)" strokeWidth={3} dot={{ r: 5, fill: "var(--card)", strokeWidth: 2 }} isAnimationActive={false} /></LineChart></ResponsiveContainer>
                  </div>}
                </div>
              </Tabs.Panel>
            </Tabs.Root>
            <Accordion.Root className="mt-4 border-t border-border pt-1"><Accordion.Item value="limitations"><Accordion.Header><Accordion.Trigger data-testid="limitations-toggle" className="group flex min-h-11 w-full items-center justify-between gap-3 text-left text-xs text-muted-foreground hover:text-foreground"><span className="flex items-center gap-2"><Info className="size-3.5" />{s.limitations}</span><ChevronDown className="size-3.5 shrink-0 transition-transform group-data-[panel-open]:rotate-180" /></Accordion.Trigger></Accordion.Header><Accordion.Panel><p className="mb-2 text-xs leading-5 text-muted-foreground">{s.model}</p><ul className="list-disc space-y-1.5 pb-2 pl-4 text-xs leading-5 text-muted-foreground">{result.limitations[lang].map((line, index) => <li key={index}>{line}</li>)}</ul></Accordion.Panel></Accordion.Item></Accordion.Root>
          </div>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
    <p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground"><Info className="mt-0.5 size-3.5 shrink-0" />{s.summary}</p>
  </div>;
}
