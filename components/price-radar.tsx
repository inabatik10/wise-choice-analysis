"use client";

import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, Info, Plus, X } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AnalysisResult } from "@/lib/analysis-schema";
import { comparisonStats, type Comparison, type Currency } from "@/lib/comparison";
import { locale, type Lang, type Translation } from "@/lib/i18n";

const labels = {
  ru: {
    title: "Сравнение цены", back: "Назад к результату", current: "Проверяемый курс",
    intro: "Цена сама по себе не говорит об обмане. Сравните этот курс с похожим по программе и длительности.",
    empty: "С чем сравниваем?", emptyBody: "Добавьте цену другого курса, который вы нашли. Тогда станет видно, насколько отличается это предложение.",
    add: "Добавьте похожий курс", formHint: "Укажите полную стоимость, не ежемесячный платёж.",
    scope: "Здесь сравниваются только добавленные вами предложения в одной валюте, а не весь рынок.",
    chart: "Как соотносятся цены", count: "Курсов по этой цене или дешевле", median: "Медиана сравнения",
    chartHint: "Ступени показывают добавленные цены. Жёлтая линия отмечает проверяемый курс.",
    unknownCurrency: "В рекламе не указана валюта. Уточните её и повторите проверку, чтобы сравнивать цены.",
    excluded: "Другая валюта", added: "Курс добавлен к сравнению", removed: "Курс убран из сравнения",
    selected: "Добавленные курсы", noDifference: "Нет данных для расчёта разницы", difference: "Отличие от медианы", comparisonCount: "Курсов в сравнении",
  },
  kz: {
    title: "Бағаны салыстыру", back: "Нәтижеге оралу", current: "Тексерілетін курс",
    intro: "Бағаның өзі алдаудың белгісі емес. Бұл курсты бағдарламасы мен ұзақтығы ұқсас курспен салыстырыңыз.",
    empty: "Немен салыстырамыз?", emptyBody: "Өзіңіз тапқан басқа курстың бағасын қосыңыз. Осы ұсыныстың бағасы қаншалықты өзгеше екенін көресіз.",
    add: "Ұқсас курсты қосыңыз", formHint: "Ай сайынғы төлемді емес, толық құнын көрсетіңіз.",
    scope: "Мұнда бүкіл нарық емес, өзіңіз қосқан бір валютадағы ұсыныстар ғана салыстырылады.",
    chart: "Бағалардың арақатынасы", count: "Осы бағадан аспайтын курс саны", median: "Салыстыру медианасы",
    chartHint: "Баспалдақтар қосылған бағаларды көрсетеді. Сары сызық тексерілетін курсты белгілейді.",
    unknownCurrency: "Жарнамада валюта көрсетілмеген. Бағаларды салыстыру үшін оны нақтылап, тексеруді қайталаңыз.",
    excluded: "Басқа валюта", added: "Курс салыстыруға қосылды", removed: "Курс салыстырудан алынды",
    selected: "Қосылған курстар", noDifference: "Айырманы есептеуге дерек жоқ", difference: "Медианадан айырмасы", comparisonCount: "Салыстырылған курс саны",
  },
  en: {
    title: "Compare the price", back: "Back to result", current: "Course being checked",
    intro: "Price alone does not indicate fraud. Compare this course with one offering a similar syllabus and duration.",
    empty: "What are we comparing it with?", emptyBody: "Add the price of another course you found to see how this offer compares.",
    add: "Add a similar course", formHint: "Use the full price, not the monthly instalment.",
    scope: "This compares only the same-currency offers you add, not the entire market.",
    chart: "How the prices compare", count: "Courses at this price or below", median: "Comparison median",
    chartHint: "Steps show the prices you added. The yellow line marks the course being checked.",
    unknownCurrency: "The ad does not state a currency. Confirm it and run another check before comparing prices.",
    excluded: "Different currency", added: "Course added to the comparison", removed: "Course removed from the comparison",
    selected: "Added courses", noDifference: "Not enough data to calculate a difference", difference: "Difference from median", comparisonCount: "Courses compared",
  },
};

type SavedComparison = Comparison & { id: string };

function money(amount: number | null, currency: Currency | null, lang: Lang, t: Translation) {
  if (amount === null) return t.priceUnknown;
  const formatted = new Intl.NumberFormat(lang === "kz" ? "ru-RU" : locale[lang], { maximumFractionDigits: 2 }).format(amount);
  const symbols = { KZT: "₸", RUB: "₽", USD: "$", EUR: "€" };
  return currency ? `${formatted} ${symbols[currency]}` : `${formatted} · ${t.currencyUnknown}`;
}

export function PriceRadarView({ result, lang, t, onBack }: {
  result: AnalysisResult; lang: Lang; t: Translation; onBack?: () => void;
}) {
  const [courses, setCourses] = useState<SavedComparison[]>([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>(result.price.currency ?? "KZT");
  const [storageError, setStorageError] = useState(false);
  const [announcement, setAnnouncement] = useState<"added" | "removed" | null>(null);
  const key = `wisechoice.comparison.${result.id}`;
  const fillId = useId().replaceAll(":", "");
  const reduceMotion = useReducedMotion();
  const copy = labels[lang];

  useEffect(() => {
    setCourses([]);
    setCurrency(result.price.currency ?? "KZT");
    setStorageError(false);
    try {
      const raw: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
      if (Array.isArray(raw)) {
        const valid = raw.filter((c: Comparison) => c && typeof c.name === "string" && c.name.trim().length > 0 && c.name.length <= 120 && Number.isFinite(c.amount) && c.amount >= 0 && c.amount <= 1e12 && ["KZT", "RUB", "USD", "EUR"].includes(c.currency));
        setCourses(valid.slice(0, 20).map(c => ({ ...c, id: crypto.randomUUID() })));
      }
    } catch {
      setStorageError(true);
    }
  }, [key, result.price.currency]);

  const stats = comparisonStats(result.price, courses);
  const hasComparisons = stats.courses.length > 0;
  const sorted = stats.courses.map(course => course.amount).sort((a, b) => a - b);
  const upperBound = Math.max(result.price.amount ?? 0, ...sorted, 1) * 1.15;
  const distribution: { price: number; count: number }[] = [];
  if (sorted.length) {
    if (sorted[0] > 0) distribution.push({ price: 0, count: 0 });
    sorted.forEach((price, index) => {
      if (sorted[index + 1] !== price) distribution.push({ price, count: index + 1 });
    });
    distribution.push({ price: upperBound, count: sorted.length });
  }
  const entrance = { opacity: 1, y: 0 };
  const transition = { duration: reduceMotion ? 0 : 0.2 };

  function save(next: SavedComparison[]) {
    setCourses(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }

  return (
    <div className="space-y-5">
      <header>
        {onBack && <Button data-testid="back-to-result" variant="ghost" onClick={onBack} className="-ml-2 mb-1 h-11 px-2 text-muted-foreground"><ArrowLeft className="size-4" />{copy.back}</Button>}
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{copy.title}</h1>
      </header>

      <div data-testid="comparison-course" className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-border pb-5">
        <div className="min-w-0 flex-1"><p className="text-xs text-muted-foreground">{copy.current}</p><h2 className="mt-1 break-words text-base font-medium text-foreground">{result.title[lang]}</h2></div>
        <div className="shrink-0 text-right"><p className="text-xs text-muted-foreground">{t.priceSource}</p><p data-testid="radar-course-price" className="mt-1 text-[28px] font-semibold leading-tight tabular-nums text-foreground">{money(result.price.amount, result.price.currency, lang, t)}</p></div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.9fr)]">
        <div className="min-w-0">
          {!hasComparisons ? <div data-testid="comparison-empty">
            <p className="text-base leading-6 text-foreground">{result.price.currency === null ? copy.unknownCurrency : copy.emptyBody}</p>
            <p className="mt-3 hidden text-xs leading-5 text-muted-foreground lg:block">{copy.intro}</p>
          </div> : <motion.section initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }} animate={entrance} transition={transition} className="min-w-0">
            <div className="mb-6 flex flex-wrap gap-x-8 gap-y-4">
              <div><p className="text-sm text-muted-foreground">{copy.median}</p><p data-testid="radar-median" className="mt-1 text-[28px] font-semibold leading-tight tabular-nums text-primary">{money(stats.median, result.price.currency, lang, t)}</p></div>
              <div><p className="text-sm text-muted-foreground">{copy.difference}</p><p data-testid="radar-difference" className="mt-1 text-[28px] font-semibold leading-tight tabular-nums text-foreground">{stats.difference === null ? "—" : `${new Intl.NumberFormat(locale[lang], { maximumFractionDigits: 1, signDisplay: "always" }).format(stats.difference)}%`}</p></div>
              <div><p className="text-sm text-muted-foreground">{copy.comparisonCount}</p><p data-testid="radar-comparison-count" className="mt-1 text-[28px] font-semibold leading-tight tabular-nums text-foreground">{stats.courses.length}</p></div>
            </div>
            <h2 className="text-base font-medium text-foreground">{copy.chart}</h2>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {result.price.amount !== null && <span className="flex items-center gap-2"><span className="h-0.5 w-4 bg-chart-2" />{copy.current}</span>}
              <span className="flex items-center gap-2"><span className="w-4 border-t-2 border-dashed border-primary" />{copy.median}</span>
            </div>
            <p className="mt-4 text-sm leading-5 text-muted-foreground">{copy.count}</p>
            <div data-testid="price-chart" aria-label={copy.chart} className="mt-2 h-[280px] min-w-0 w-full overflow-hidden sm:h-[340px] lg:h-[380px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={distribution} margin={{ top: 20, right: 32, bottom: 8, left: 0 }} accessibilityLayer>
                  <defs><linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} /><stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.03} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 4" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="price" type="number" domain={[0, upperBound]} allowDataOverflow height={36} tickMargin={10} tick={{ fontSize: 13, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={{ stroke: "var(--border)" }} minTickGap={24} tickFormatter={(value: number) => new Intl.NumberFormat(lang === "kz" ? "ru-RU" : locale[lang], { notation: "compact", maximumFractionDigits: 1 }).format(value)} />
                  <YAxis domain={[0, stats.courses.length]} allowDataOverflow allowDecimals={false} width={32} tickMargin={8} tickCount={Math.max(2, Math.min(stats.courses.length + 1, 5))} tick={{ fontSize: 13, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--popover)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--popover-foreground)" }} formatter={value => [value, copy.count]} labelFormatter={value => money(Number(value), result.price.currency, lang, t)} />
                  <Area type="stepAfter" dataKey="count" stroke="var(--chart-1)" strokeWidth={2} fill={`url(#${fillId})`} isAnimationActive={false} />
                  {stats.median !== null && <ReferenceLine x={stats.median} stroke="var(--primary)" strokeDasharray="4 4" strokeWidth={1.5} />}
                  {result.price.amount !== null && <ReferenceLine x={result.price.amount} stroke="var(--chart-2)" strokeWidth={2} />}
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-sm text-muted-foreground">{t.comparisonPrice}{result.price.currency ? ` · ${result.price.currency}` : ""}</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy.chartHint}</p>
          </motion.section>}
        </div>

        <div className="min-w-0 rounded-2xl bg-card p-4 sm:p-5">
          <h2 className="font-medium text-foreground">{copy.add}</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{copy.formHint}</p>
          <form onSubmit={event => {
            event.preventDefault();
            if (!name.trim() || amount === "" || !Number.isFinite(Number(amount)) || Number(amount) < 0 || Number(amount) > 1e12 || courses.length >= 20) return;
            save([...courses, { id: crypto.randomUUID(), name: name.trim(), amount: Number(amount), currency }]);
            setName(""); setAmount(""); setAnnouncement("added");
          }} className="mt-4 grid grid-cols-2 gap-3">
            <label className="col-span-2 block min-w-0 text-xs text-foreground">{t.comparisonName}<Input value={name} maxLength={120} onChange={event => setName(event.target.value)} required className="mt-1.5 h-12" /></label>
            <label className="block min-w-0 text-xs text-foreground">{t.comparisonPrice}<Input type="number" min="0" max="1000000000000" step="0.01" inputMode="decimal" value={amount} onChange={event => setAmount(event.target.value)} required className="mt-1.5 h-12" /></label>
            <label className="block min-w-0 text-xs text-foreground">{t.comparisonCurrency}<select aria-label={t.comparisonCurrency} value={currency} onChange={event => setCurrency(event.target.value as Currency)} className="mt-1.5 h-12 w-full rounded-xl border border-border bg-background px-4 text-base">{["KZT", "RUB", "USD", "EUR"].map(code => <option key={code}>{code}</option>)}</select></label>
            <Button type="submit" disabled={courses.length >= 20} className="col-span-2 h-12"><Plus />{t.addComparison}</Button>
          </form>
          {courses.length > 0 && <div className="mt-5"><h3 className="text-xs font-medium text-muted-foreground">{copy.selected}</h3><ul className="mt-1 divide-y divide-border"><AnimatePresence initial={false}>{courses.map(course => <motion.li layout={reduceMotion ? false : "position"} key={course.id} initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }} animate={entrance} exit={{ opacity: 0, x: reduceMotion ? 0 : -8 }} transition={transition} className="flex items-center gap-2 py-3 text-sm">
            <div className="min-w-0 flex-1"><p className="break-words text-foreground">{course.name}</p><p className="mt-1 text-xs tabular-nums text-muted-foreground">{money(course.amount, course.currency, lang, t)}{course.currency !== result.price.currency && <span className="ml-2 text-[var(--risk-yellow)]">{copy.excluded}</span>}</p></div>
            <Button variant="ghost" size="icon" aria-label={`${t.removeComparison}: ${course.name}`} onClick={() => { save(courses.filter(item => item.id !== course.id)); setAnnouncement("removed"); }}><X /></Button>
          </motion.li>)}</AnimatePresence></ul></div>}
          {storageError && <p role="status" className="mt-3 text-sm text-[var(--risk-yellow)]">{t.storageError}</p>}
          <p role="status" aria-live="polite" className="sr-only">{announcement ? copy[announcement] : ""}</p>
        </div>
      </div>
      <p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground"><Info className="mt-0.5 size-3.5 shrink-0" />{copy.scope}</p>
    </div>
  );
}
