"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ShieldCheck,
  Menu,
  Sun,
  Moon,
  FileText,
  FileImage,
  Gauge,
  ChartNoAxesColumn,
  Search,
  History,
  BookOpen,
  ArrowRight,
  Upload,
  X,
  Trash2,
  LoaderCircle,
  Check,
  Info,
} from "lucide-react";
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from "motion/react";
import { Dialog } from "@animate-ui/react/primitives/base-ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  analysisResultSchema,
  type AnalysisResult,
} from "@/lib/analysis-schema";
import { translations, locale, type Lang, type Translation } from "@/lib/i18n";
import { learning } from "@/lib/learning";
import {
  appendHistory,
  readHistory,
  HISTORY_KEY,
  LANGUAGE_KEY,
} from "@/lib/history";
import { type Currency } from "@/lib/comparison";
import { AnalysisResultView } from "@/components/analysis-result";
import { PriceRadarView } from "@/components/price-radar";
import { AnalysisExamples, type ExampleSelection } from "@/components/analysis-examples";
import { getExamples } from "@/lib/examples";
import { ImagePreview } from "@/components/image-preview";
import { CheckPicker } from "@/components/check-picker";
import { estimateCVF } from "@/lib/analyzer";

type Page = "dashboard" | "analysis" | "radar" | "history" | "learning";
const navigation = [
  { id: "dashboard", icon: Search },
  { id: "history", icon: History },
  { id: "learning", icon: BookOpen },
] as const;
const languageOptions = [
  { id: "ru", name: "Русский", short: "RU" },
  { id: "kz", name: "Қазақша", short: "KZ" },
  { id: "en", name: "English", short: "EN" },
] as const;
const riskColors = {
  low: "var(--risk-green)",
  moderate: "var(--risk-yellow)",
  high: "var(--risk-red)",
  insufficient: "#a5afc2",
};
const errorCodes: Record<string, keyof Translation["errors"]> = {
  INVALID_INPUT: "INVALID_REQUEST",
  URL_ONLY: "INVALID_REQUEST",
  NOT_CONFIGURED: "MISSING_API_KEY",
  PROVIDER_CONFIGURATION: "UPSTREAM_ERROR",
  PROVIDER_UNAVAILABLE: "UPSTREAM_ERROR",
  CONTENT_BLOCKED: "INVALID_MODEL_RESPONSE",
  TIMEOUT: "UPSTREAM_TIMEOUT",
};

const cvfHistoryNote: Record<Lang, string> = {
  ru: "* Предварительный CVF: неизвестные P и A приняты за 0. Цена и альтернативы не учтены.",
  kz: "* Алдын ала CVF: белгісіз P және A 0 деп алынды. Баға мен баламалар ескерілмеді.",
  en: "* Preliminary CVF: missing P and A are assumed to be 0. Price and alternatives are excluded.",
};

function historyCVF(item: AnalysisResult, lang: Lang) {
  const value = item.cvf ?? estimateCVF(item.metrics).value;
  if (value === null) return "—";
  return `${new Intl.NumberFormat(locale[lang], { maximumFractionDigits: 2 }).format(value)}${item.cvf === null ? "*" : ""}`;
}

const dashboardCopy = {
  ru: {
    workspaceTitle: "Проверка рекламы курса", workspaceIntro: "Добавьте текст или скриншот, чтобы проверить обещания в рекламе.",
    switchCheck: "Открыть другую проверку", inputMethod: "Что проверяем", textMode: "Текст", imageMode: "Скриншот", chooseExample: "Выбрать пример", selectedExample: "Пример", clearInput: "Очистить текст", lightTheme: "Светлая тема", darkTheme: "Тёмная тема", checkText: "Проверить текст", checkImage: "Проверить скриншот", screenshotBody: "Загрузите рекламу курса или выберите учебный пример.", selectedImage: "Скриншот для проверки",
    recent: "Недавние проверки", all: "Вся история", date: "Дата", actions: "Действия",
    learning: "Как это работает", nav: "Основная навигация", newCheck: "Новая проверка", menu: "Меню", openMenu: "Открыть меню", closeMenu: "Закрыть меню", selected: "Открытая проверка", compare: "Сравнение цены",
    brief: "Перед оплатой курса", guide: "Что проверяет Wise Choice",
    evidenceTitle: "Обещания и давление", evidenceBody: "Находит спорные фразы в рекламе и объясняет, почему на них стоит обратить внимание.",
    priceTitle: "Стоимость обучения", priceBody: "Извлекает цену из рекламы. После проверки можно сравнить её с похожими курсами.",
    limit: "Оценка касается рекламы. Качество обучения и надёжность продавца нужно проверить отдельно.",
    project: "Научный проект по экономике · НИШ, Актобе", saved: "Сохранено в этом браузере",
  },
  kz: {
    workspaceTitle: "Курс жарнамасын тексеру", workspaceIntro: "Жарнамадағы уәделерді тексеру үшін мәтін не скриншот қосыңыз.",
    switchCheck: "Басқа тексеруді ашу", inputMethod: "Нені тексереміз", textMode: "Мәтін", imageMode: "Скриншот", chooseExample: "Мысалды таңдау", selectedExample: "Мысал", clearInput: "Мәтінді тазалау", lightTheme: "Ашық тақырып", darkTheme: "Қараңғы тақырып", checkText: "Мәтінді тексеру", checkImage: "Скриншотты тексеру", screenshotBody: "Курс жарнамасын жүктеңіз немесе мысалды таңдаңыз.", selectedImage: "Тексеруге арналған скриншот",
    recent: "Соңғы тексерулер", all: "Барлық тарих", date: "Күні", actions: "Әрекеттер",
    learning: "Қалай жұмыс істейді", nav: "Негізгі навигация", newCheck: "Жаңа тексеру", menu: "Мәзір", openMenu: "Мәзірді ашу", closeMenu: "Мәзірді жабу", selected: "Ашық тексеру", compare: "Бағаны салыстыру",
    brief: "Курсқа төлем жасамас бұрын", guide: "Wise Choice нені тексереді",
    evidenceTitle: "Уәделер мен қысым", evidenceBody: "Жарнамадағы күмәнді тіркестерді тауып, оларға неге назар аудару керегін түсіндіреді.",
    priceTitle: "Оқу құны", priceBody: "Жарнамадан курс бағасын табады. Тексеруден кейін оны ұқсас курстармен салыстыруға болады.",
    limit: "Баға жарнамаға қатысты беріледі. Оқу сапасы мен сатушының сенімділігін бөлек тексеру қажет.",
    project: "Экономика бойынша ғылыми жоба · НЗМ, Ақтөбе", saved: "Осы браузерде сақталған",
  },
  en: {
    workspaceTitle: "Check a course ad", workspaceIntro: "Add the ad text or a screenshot to check its claims.",
    switchCheck: "Open another check", inputMethod: "What to check", textMode: "Text", imageMode: "Screenshot", chooseExample: "Choose an example", selectedExample: "Example", clearInput: "Clear text", lightTheme: "Light theme", darkTheme: "Dark theme", checkText: "Check text", checkImage: "Check screenshot", screenshotBody: "Upload a course ad or choose an example.", selectedImage: "Screenshot to check",
    recent: "Recent checks", all: "View history", date: "Date", actions: "Actions",
    learning: "How it works", nav: "Main navigation", newCheck: "New check", menu: "Menu", openMenu: "Open menu", closeMenu: "Close menu", selected: "Open check", compare: "Price comparison",
    brief: "Before you pay for a course", guide: "What Wise Choice checks",
    evidenceTitle: "Promises and pressure", evidenceBody: "Finds questionable phrases in an ad and explains why they deserve a closer look.",
    priceTitle: "The cost of learning", priceBody: "Extracts the advertised price. After the check, you can compare it with similar courses.",
    limit: "The score describes the ad. You still need to check the teaching quality and the seller's credibility.",
    project: "Economics research project · NIS, Aktobe", saved: "Saved in this browser",
  },
};

function money(
  amount: number | null,
  currency: Currency | null,
  lang: Lang,
  t: Translation,
) {
  if (amount === null) return t.priceUnknown;
  const numberLocale = lang === "kz" ? "ru-RU" : locale[lang];
  const formatted = new Intl.NumberFormat(numberLocale, {
    maximumFractionDigits: 2,
  }).format(amount);
  const symbols: Record<Currency, string> = {
    KZT: "₸",
    RUB: "₽",
    USD: "$",
    EUR: "€",
  };
  return currency
    ? `${formatted} ${symbols[currency]}`
    : `${formatted} · ${t.currencyUnknown}`;
}
function SectionTitle({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-5">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h1>
      {description && (
        <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">
          {description}
        </p>
      )}
    </header>
  );
}
function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <Card className={`wise-panel gap-0 p-5 sm:p-6 ${className}`}>{children}</Card>;
}

export default function WiseChoice() {
  const [lang, setLang] = useState<Lang>("ru");
  const [page, setPage] = useState<Page>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [inputMode, setInputMode] = useState<"text" | "image">("text");
  const [selectedExamples, setSelectedExamples] = useState<{text: string | null; image: string | null}>({ text: null, image: null });
  const [text, setText] = useState("");
  const [image, setImage] = useState<{ data: string; name: string } | null>(
    null,
  );
  const [imageLoading, setImageLoading] = useState(false);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const historyRef = useRef<AnalysisResult[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storageError, setStorageError] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const examplesRef = useRef<HTMLElement>(null);
  const t = translations[lang];
  const copy = dashboardCopy[lang];
  const reducedMotion = useReducedMotion();
  const contextResult = page === "analysis" || page === "radar" ? result : null;
  const hasInput = inputMode === "text" ? !!text.trim() : !!image;
  const activeExample = getExamples(lang).find(example => example.id === selectedExamples[inputMode]);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("wisechoice.theme");
      if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);
      const savedLang = localStorage.getItem(LANGUAGE_KEY);
      if (savedLang === "ru" || savedLang === "kz" || savedLang === "en")
        setLang(savedLang);
      const saved = readHistory(localStorage.getItem(HISTORY_KEY));
      setHistory(saved);
      historyRef.current = saved;
      setResult(saved[0] ?? null);
    } catch {
      setStorageError(true);
    }
    setReady(true);
    return () => requestRef.current?.abort();
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang === "kz" ? "kk" : lang;
    document.title = `Wise Choice | ${translations[lang].tagline}`;
    if (ready)
      try {
        localStorage.setItem(LANGUAGE_KEY, lang);
      } catch {
        setStorageError(true);
      }
  }, [lang, ready]);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    if (ready) try { localStorage.setItem("wisechoice.theme", theme); } catch { setStorageError(true); }
  }, [theme, ready]);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => { if (desktop.matches) setMenuOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);
  function selectExample(selection: ExampleSelection) {
    setError(null);
    if (inputMode === "image" && selection.image) {
      setImage(selection.image); setText("");
      setSelectedExamples({ text: null, image: selection.id });
    } else {
      setText(selection.text); setImage(null);
      setSelectedExamples({ text: selection.id, image: null });
    }
    if (window.innerWidth < 1024) window.scrollTo({ top: 0, behavior: reducedMotion ? "instant" : "smooth" });
  }
  function navigate(next: Page) {
    setMenuOpen(false);
    setPage(next);
    mainRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function saveHistory(next: AnalysisResult[]) {
    const previous = historyRef.current;
    historyRef.current = next;
    setHistory(next);
    try {
      for (const entry of previous) {
        if (!next.some((item) => item.id === entry.id))
          localStorage.removeItem(`wisechoice.comparison.${entry.id}`);
      }
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }
  async function upload(file?: File) {
    if (!file) return;
    setError(null);
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      setError("imageError");
      return;
    }
    setImageLoading(true);
    try {
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setImage({ data, name: file.name });
      setInputMode("image");
      setSelectedExamples(previous => ({ ...previous, image: null }));
    } catch {
      setError("imageError");
    } finally {
      setImageLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }
  async function analyze() {
    if (busy || !hasInput) return;
    const controller = new AbortController();
    requestRef.current = controller;
    setBusy(true);
    setError(null);
    const timeout = setTimeout(() => controller.abort("timeout"), 100000);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputMode === "text" ? text : "",
          imageBase64: inputMode === "image" ? image?.data : undefined,
          language: lang,
        }),
        signal: controller.signal,
      });
      const body = await response.json();
      if (!response.ok) {
        setError(body.error?.code ?? "UNKNOWN");
        return;
      }
      const parsed = analysisResultSchema.safeParse(body);
      if (!parsed.success) {
        setError("invalidResponse");
        return;
      }
      setResult(parsed.data);
      saveHistory(appendHistory(historyRef.current, parsed.data));
      navigate("analysis");
    } catch {
      if (controller.signal.aborted) {
        if (controller.signal.reason === "timeout")
          setError("UPSTREAM_TIMEOUT");
      } else setError("networkError");
    } finally {
      clearTimeout(timeout);
      setBusy(false);
      requestRef.current = null;
    }
  }
  function translatedError(code: string | null): string | null {
    if (!code) return null;
    const direct = t[code as keyof Translation];
    if (typeof direct === "string") return direct;
    return (
      t.errors[errorCodes[code] ?? (code as keyof Translation["errors"])] ??
      t.errors.UNKNOWN
    );
  }
  const errorText = translatedError(error);
  function navItems(ids: readonly string[] = navigation.map(item => item.id)) {
    return navigation.filter(item => ids.includes(item.id)).map(({ id, icon: Icon }) => {
      const active = id === page;
      return <button key={id} data-testid={`nav-${id}`} aria-current={active ? "page" : undefined}
        onClick={() => navigate(id)} className={`relative flex min-h-12 w-full items-center gap-3 rounded-md px-3 text-left text-sm transition-colors ${active ? "bg-muted/60 text-foreground" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"}`}>
        <Icon className="size-5 shrink-0" /><span>{id === "learning" ? copy.learning : t.nav[id]}</span>
      </button>;
    });
  }
  function sidebarContent() {
    return <>
      <nav aria-label={copy.nav} className="space-y-1">
        {navItems(["dashboard"])}
        {result && <div className="my-4 border-y border-border py-4">
          {[{ id: "analysis", label: t.nav.analysis, icon: Gauge }, { id: "radar", label: copy.compare, icon: ChartNoAxesColumn }].map(({ id, label, icon: Icon }) => <button key={id} data-testid={`sidebar-${id}`} aria-current={page === id ? "page" : undefined} onClick={() => navigate(id as Page)} className={`flex min-h-12 w-full items-center gap-3 rounded-md px-3 text-left text-sm transition-colors ${page === id ? "bg-muted/60 text-foreground" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"}`}><Icon className="size-5 shrink-0" /><span>{label}</span></button>)}
        </div>}
        {navItems(["history", "learning"])}
      </nav>
      <div className="mt-auto px-3 pt-8 text-[13px] leading-5 text-muted-foreground">
        <p>{t.analysisCount}</p><p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{history.length}<span className="ml-1.5 text-sm font-normal text-muted-foreground">/ 10</span></p>
        <p className="mt-4 border-t border-border pt-4 text-xs leading-5">{copy.project}</p>
      </div>
    </>;
  }
  function openResult(item: AnalysisResult) { setResult(item); navigate("analysis"); }
  function deleteResult(item: AnalysisResult) {
    saveHistory(history.filter(entry => entry.id !== item.id));
    if (result?.id === item.id) setResult(null);
  }
  function date(item: AnalysisResult) {
    return new Intl.DateTimeFormat(locale[lang], { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(item.createdAt));
  }
  const empty = (
    <div data-testid="empty-result">
      <Panel>
        <Search className="mb-5 size-8 text-primary" />
        <h2 className="text-xl font-semibold">{t.noResult}</h2>
        <p className="mt-3 text-muted-foreground">{t.noResultHint}</p>
        <Button
          onClick={() => navigate("dashboard")}
          className="mt-6 min-h-11 self-start"
        >
          {t.startAnalysis}
          <ArrowRight />
        </Button>
      </Panel>
    </div>
  );

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <a
        href="#main"
        className="sr-only z-50 focus:not-sr-only focus:fixed focus:bg-card focus:p-4"
      >
        {t.skipContent}
      </a>
      <MotionConfig reducedMotion="user">
        <aside data-testid="desktop-sidebar" className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col overflow-y-auto border-r border-border bg-sidebar px-4 py-6 lg:flex">
          <button onClick={() => navigate("dashboard")} className="mb-9 shrink-0 px-2 text-left" aria-label="Wise Choice"><Brand tagline={t.tagline} /></button>
          {sidebarContent()}
        </aside>
        <div className="lg:ml-60">
          <header data-testid="workspace-header" className="sticky top-0 z-30 border-b border-border bg-sidebar/95 backdrop-blur-md">
            <div className="mx-auto grid min-h-18 max-w-[1160px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-1 px-2.5 sm:gap-x-2 sm:px-6">
              <div className="flex min-w-0 items-center gap-1 lg:hidden">
                <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
                  <Dialog.Trigger data-testid="menu-open" aria-label={copy.openMenu} className="flex size-11 shrink-0 items-center justify-center rounded-full text-foreground transition-colors duration-200 hover:bg-foreground/5"><Menu className="size-5" /></Dialog.Trigger>
                  <Dialog.Portal>
                    <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[3px]" transition={{ duration: reducedMotion ? 0 : 0.25 }} />
                    <Dialog.Popup data-testid="mobile-menu" data-side="bottom" transition={{ duration: reducedMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }} exitTransition={{ duration: reducedMotion ? 0 : 0.18 }} className="fixed inset-0 z-50 flex h-dvh w-full max-w-none flex-col overflow-y-auto bg-sidebar px-6 pb-[max(24px,env(safe-area-inset-bottom))] pt-[max(20px,env(safe-area-inset-top))] outline-none">
                      <Dialog.Title className="sr-only">{copy.menu}</Dialog.Title>
                      <Dialog.Description className="sr-only">{copy.nav}</Dialog.Description>
                      <div className="mb-7 flex items-center justify-between gap-2 pl-2"><Brand tagline={t.tagline} /><Dialog.Close aria-label={copy.closeMenu} className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 hover:bg-foreground/5"><X className="size-5" /></Dialog.Close></div>
                      {sidebarContent()}
                    </Dialog.Popup>
                  </Dialog.Portal>
                </Dialog.Root>
                <button onClick={() => navigate("dashboard")} className="min-w-0 py-3 text-left" aria-label="Wise Choice"><Brand tagline={t.tagline} /></button>
              </div>
              {contextResult ? <div data-testid="active-check" className="order-3 col-span-2 mx-auto w-full min-w-0 max-w-[calc(100vw-32px)] border-t border-border py-1.5 lg:order-none lg:col-span-1 lg:mx-0 lg:border-0 lg:py-2">
                <p className="px-1 text-xs leading-4 text-muted-foreground">{copy.selected}</p>
                <CheckPicker history={history} result={contextResult} lang={lang} compact onSelect={openResult} />
              </div> : <p className="hidden text-sm text-muted-foreground lg:block">{page === "learning" ? copy.learning : t.nav[page]}</p>}
              <div className="flex min-h-18 shrink-0 items-center justify-self-end gap-0 sm:gap-1">
                <Button data-testid="theme-toggle" variant="ghost" size="icon" aria-label={theme === "dark" ? copy.lightTheme : copy.darkTheme} title={theme === "dark" ? copy.lightTheme : copy.darkTheme} aria-pressed={theme === "light"} onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="size-11 text-muted-foreground">{theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}</Button>
              <div role="group" aria-label={t.language} className="flex shrink-0 gap-0 sm:gap-0.5">
                {languageOptions.map(option => <Button key={option.id} variant="ghost" aria-label={option.name} aria-pressed={lang === option.id} onClick={() => setLang(option.id)} className={`h-11 min-w-11 rounded-none border-0 border-b-2 px-2 text-xs ${lang === option.id ? "border-b-primary text-foreground" : "border-b-transparent text-muted-foreground"}`}>{option.short}</Button>)}
              </div>
              </div>
            </div>
          </header>
        <main
          id="main"
          tabIndex={-1}
          ref={mainRef}
          className={`mx-auto min-h-[calc(100dvh-160px)] max-w-[1160px] px-4 sm:px-6 ${page === "dashboard" ? "py-4 sm:py-5" : "py-6 sm:py-8"}`}
        >
          {storageError && (
            <p
              role="status"
              className="mb-5 rounded-lg border border-amber-400/30 p-3 text-sm text-amber-700 dark:text-amber-200"
            >
              {t.storageError}
            </p>
          )}
          {errorText && (
            <div
              role="alert"
              className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
            >
              <p>{errorText}</p>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t.cancel}
                onClick={() => setError(null)}
              >
                <X />
              </Button>
            </div>
          )}
          <AnimatePresence mode="wait" initial={false}>
          <motion.div key={page} initial={{ opacity: 0, y: reducedMotion ? 0 : 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.16 }}>
          {page === "dashboard" && (
            <>
              <header className="mb-4"><h1 className="text-2xl font-semibold tracking-tight">{copy.workspaceTitle}</h1><p className="mt-1 text-sm leading-6 text-muted-foreground sm:text-base">{copy.workspaceIntro}</p></header>
              <div data-testid="analysis-workspace" className="grid items-stretch gap-6 lg:h-[calc(100dvh-210px)] lg:min-h-[390px] lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)]">
                <form ref={formRef} onSubmit={event => { event.preventDefault(); void analyze(); }} className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card">
                  <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-border px-4 py-3">
                    <div role="group" aria-label={copy.inputMethod} className="flex gap-4">
                      {[{ id: "text", label: copy.textMode, icon: FileText }, { id: "image", label: copy.imageMode, icon: FileImage }].map(({ id, label, icon: Icon }) => <button key={id} type="button" data-testid={`input-mode-${id}`} aria-pressed={inputMode === id} disabled={busy} onClick={() => setInputMode(id as "text" | "image")} className={`flex min-h-11 items-center gap-2 border-b px-1 text-sm font-medium transition-colors ${inputMode === id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}><Icon className="size-4" />{label}</button>)}
                    </div>
                    <div className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto">
                      <Button type="submit" data-testid="analyze" disabled={!ready || busy || imageLoading || !hasInput} className="h-12 flex-1 px-5 sm:flex-none">
                        {busy ? t.analyzing : inputMode === "text" ? copy.checkText : copy.checkImage}{busy ? <LoaderCircle className="animate-spin" /> : <ArrowRight />}
                      </Button>
                      {busy && <Button type="button" variant="outline" className="h-12 px-4" onClick={() => requestRef.current?.abort()}>{t.cancel}</Button>}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 py-3">
                    <label htmlFor={inputMode === "text" ? "offer-text" : "image-upload"} className="text-sm font-medium">{inputMode === "text" ? t.inputLabel : copy.selectedImage}</label>
                    <button type="button" onClick={() => examplesRef.current?.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth", block: "start" })} className="min-h-11 text-[13px] text-primary lg:hidden">{copy.chooseExample}<ArrowRight className="ml-1 inline size-3" /></button>
                    {activeExample && <p data-testid="selected-source" className="flex items-center gap-1.5 text-[13px] text-primary"><Check className="size-3.5 shrink-0" />{copy.selectedExample}: {activeExample.title}</p>}
                  </div>
                  <input ref={fileRef} id="image-upload" type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={busy} onChange={event => void upload(event.target.files?.[0])} />
                  <div className="h-[320px] min-h-0 px-4 pb-3 lg:h-auto lg:flex-1">
                    {inputMode === "text" ? <Textarea id="offer-text" data-testid="offer-text" value={text} disabled={busy} onChange={event => { setText(event.target.value); setSelectedExamples(previous => ({ ...previous, text: null })); }} maxLength={20000} placeholder={t.inputPlaceholder} className="h-full min-h-0 resize-none border-input bg-background text-base! leading-7" /> : image ? <ImagePreview image={image} lang={lang} disabled={busy} onRemove={() => { setImage(null); setSelectedExamples(previous => ({ ...previous, image: null })); }} /> : <button type="button" onClick={() => fileRef.current?.click()} disabled={busy || imageLoading} className="flex h-full min-h-40 w-full flex-col items-center justify-center gap-3 rounded-xl border border-input bg-background px-5 text-center transition-colors duration-200 hover:border-primary/60"><Upload className="size-7 text-primary" /><span className="text-sm font-medium">{t.upload}</span><span className="max-w-64 text-[13px] leading-5 text-muted-foreground">{copy.screenshotBody}</span></button>}
                  </div>
                  <div className="shrink-0 border-t border-border px-4 py-3">
                    {inputMode === "text" ? <div className="mb-1 flex items-center justify-between gap-3 text-xs text-muted-foreground"><button type="button" disabled={busy || !text} onClick={() => { setText(""); setSelectedExamples(previous => ({ ...previous, text: null })); }} className="min-h-11 text-[13px] hover:text-foreground disabled:opacity-40">{copy.clearInput}</button><span className="tabular-nums">{text.length.toLocaleString(locale[lang])} / 20 000</span></div> : <p className="mb-1 text-[13px] leading-5 text-muted-foreground">{t.imageHint}</p>}
                    <p className="text-[13px] leading-5 text-muted-foreground">{t.privacy}</p>
                  </div>
                  {busy && <p role="status" aria-live="polite" className="sr-only">{t.analyzing}</p>}
                </form>
                <aside ref={examplesRef} className="min-w-0 scroll-mt-5 lg:min-h-0 lg:overflow-y-auto lg:border-l lg:border-border lg:pl-6">
                  <AnalysisExamples lang={lang} mode={inputMode} selectedId={selectedExamples[inputMode]} disabled={busy} onSelect={selectExample} />
                  <button onClick={() => navigate("learning")} className="mt-2 flex min-h-11 items-center gap-2 text-[13px] text-primary">{copy.guide}<ArrowRight className="size-3.5" /></button>
                </aside>
              </div>
              {history.length > 0 && <section className="mt-7">
                <div className="mb-2 flex items-center justify-between gap-3"><h2 className="text-base font-semibold">{copy.recent}</h2><Button variant="link" onClick={() => navigate("history")} className="min-h-11 px-0 text-xs text-muted-foreground">{copy.all}<ArrowRight /></Button></div>
                <div className="divide-y divide-white/8 border-y border-border">{history.slice(0, 3).map((item, index) => <button key={item.id} data-testid={index === 0 ? "nav-analysis" : undefined} aria-label={`${t.openResult}: ${item.title[lang]}`} onClick={() => openResult(item)} className="flex min-h-20 w-full items-center gap-4 py-3 text-left transition-colors hover:bg-foreground/[0.03]">
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{item.title[lang]}</p><p className="mt-1 text-xs text-muted-foreground">{money(item.price.amount, item.price.currency, lang, t)}<span className="mx-2 text-muted-foreground/60">·</span>{date(item)}</p></div>
                  <span className="text-right text-sm font-medium tabular-nums" style={{ color: riskColors[item.riskLevel] }}>IDP {item.idp ?? "—"}<span className="mt-1 hidden text-xs font-normal sm:block">{t.risk[item.riskLevel]}</span></span><ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                </button>)}</div>
              </section>}
            </>
          )}
          {page === "analysis" &&
            (result ? <AnalysisResultView result={result} lang={lang} t={t} onComparePrice={() => navigate("radar")} onNewAnalysis={() => navigate("dashboard")} /> : empty)}
          {page === "radar" &&
            (result ? (
              <PriceRadarView key={result.id} result={result} lang={lang} t={t} onBack={() => navigate("analysis")} />
            ) : (
              empty
            ))}
          {page === "history" && (
            <>
              <SectionTitle
                title={t.historyTitle}
                description={t.historyIntro}
              />
              {history.length === 0 ? (
                <div data-testid="empty-history">
                  <Panel>
                    <History className="mb-4 size-7 text-primary" />
                    <p>{t.emptyHistory}</p>
                    <Button
                      className="mt-5 self-start"
                      onClick={() => navigate("dashboard")}
                    >
                      {t.startAnalysis}
                    </Button>
                  </Panel>
                </div>
              ) : (
                <>
                  <div data-testid="history-mobile" className="divide-y divide-white/8 border-y border-border sm:hidden">
                    {history.map(item => <article key={item.id} className="flex gap-2 py-4">
                      <button aria-label={`${t.openResult}: ${item.title[lang]}`} onClick={() => openResult(item)} className="min-w-0 flex-1 text-left">
                        <div className="flex items-start justify-between gap-3"><p className="text-sm font-medium">{item.title[lang]}</p><span className="shrink-0 text-sm font-semibold tabular-nums" style={{ color: riskColors[item.riskLevel] }}>IDP {item.idp ?? "—"}</span></div>
                        <p className="mt-1.5 text-xs text-muted-foreground">{money(item.price.amount, item.price.currency, lang, t)} · {date(item)}</p>
                        <p className="mt-2 text-xs tabular-nums text-muted-foreground">IMP {new Intl.NumberFormat(locale[lang]).format(item.imp)} / 10 <span className="mx-2 text-muted-foreground/60">·</span> CVF {historyCVF(item, lang)}</p>
                      </button>
                      <Button variant="ghost" size="icon" className="size-11 shrink-0 text-muted-foreground" aria-label={`${t.deleteResult}: ${item.title[lang]}`} onClick={() => deleteResult(item)}><Trash2 className="size-4" /></Button>
                    </article>)}
                  </div>
                  <div className="hidden min-w-0 overflow-hidden sm:block">
                    <table className="w-full table-fixed text-left text-sm">
                      <caption className="sr-only">{t.historyTitle}</caption>
                      <thead className="text-xs text-muted-foreground"><tr>{[t.comparisonName, t.price, "CVF", "IMP", "IDP", copy.date, copy.actions].map((label, index) => <th key={label} scope="col" className={`py-3 pr-3 font-normal ${index === 0 ? "w-[30%] text-left" : index === 6 ? "w-12 text-right" : "text-right"}`}>{label}</th>)}</tr></thead>
                      <tbody className="divide-y divide-white/8 border-y border-border">{history.map(item => <tr key={item.id} className="transition-colors hover:bg-foreground/[0.03]">
                        <td className="py-4 pr-3"><button className="line-clamp-2 text-left font-medium hover:text-primary" aria-label={`${t.openResult}: ${item.title[lang]}`} onClick={() => openResult(item)}>{item.title[lang]}</button></td>
                        <td className="py-4 pr-3 text-right text-xs tabular-nums text-muted-foreground">{money(item.price.amount, item.price.currency, lang, t)}</td>
                        <td className="py-4 pr-3 text-right tabular-nums">{historyCVF(item, lang)}</td><td className="py-4 pr-3 text-right tabular-nums">{new Intl.NumberFormat(locale[lang]).format(item.imp)}</td>
                        <td className="py-4 pr-3 text-right font-semibold tabular-nums" style={{ color: riskColors[item.riskLevel] }}>{item.idp ?? "—"}</td><td className="py-4 pr-3 text-right text-xs text-muted-foreground">{date(item)}</td>
                        <td className="py-4 text-right"><Button variant="ghost" size="icon" className="size-11 text-muted-foreground" aria-label={`${t.deleteResult}: ${item.title[lang]}`} onClick={() => deleteResult(item)}><Trash2 className="size-4" /></Button></td>
                      </tr>)}</tbody>
                    </table>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">{copy.saved} · {history.length} / 10</p>
                  {history.some(item => item.cvf === null && estimateCVF(item.metrics).value !== null) && <p data-testid="history-cvf-assumptions" className="mt-2 text-xs leading-5 text-muted-foreground">{cvfHistoryNote[lang]}</p>}
                </>
              )}
            </>
          )}
          {page === "learning" && <Learning lang={lang} t={t} />}
          </motion.div>
          </AnimatePresence>
        </main>
      <footer className="mx-auto max-w-[1160px] px-4 pb-6 sm:px-6"><p className="border-t border-border pt-4 text-xs leading-5 text-muted-foreground">{copy.project}</p></footer>
        </div>
      </MotionConfig>
    </div>
  );
}

function Brand({ tagline }: { tagline: string }) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-teal-500 text-white sm:size-9"><ShieldCheck className="size-5" /></div>
      <div>
        <p className="whitespace-nowrap text-sm font-semibold tracking-tight sm:text-base">Wise Choice</p>
        <p className="mt-0.5 text-xs text-primary">{tagline}</p>
      </div>
    </div>
  );
}

function Learning({ lang, t }: { lang: Lang; t: Translation }) {
  const content = learning[lang];
  const [answers, setAnswers] = useState<Record<number, number>>({});
  return (
    <>
      <SectionTitle title={content.title} description={content.intro} />
      <div className="grid gap-4 sm:grid-cols-2">
        {content.cards.map((card, index) => (
          <Panel key={index}>
            <BookOpen className="mb-4 size-5 text-primary" />
            <h2 className="font-medium">{card.title}</h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              {card.body}
            </p>
          </Panel>
        ))}
      </div>
      <div className="mt-7 space-y-4">
        {content.quiz.map((quiz, index) => (
          <Panel key={index}>
            <h2 className="font-medium">{quiz.question}</h2>
            <div className="mt-4 space-y-2">
              {quiz.options.map((option, i) => (
                <Button
                  key={i}
                  variant="outline"
                  aria-pressed={answers[index] === i}
                  onClick={() => setAnswers({ ...answers, [index]: i })}
                  className={`h-auto min-h-12 w-full justify-start whitespace-normal rounded-xl px-4 py-3 text-left leading-6 ${answers[index] === i ? "border-primary bg-primary/10" : ""}`}
                >
                  {answers[index] !== undefined && quiz.correct === i && (
                    <Check className="text-primary" />
                  )}
                  {option}
                </Button>
              ))}
            </div>
            {answers[index] !== undefined && (
              <p role="status" className="mt-4 text-sm leading-6 text-primary">
                {quiz.explanation}
              </p>
            )}
          </Panel>
        ))}
      </div>
      <p className="mt-6 text-xs leading-5 text-muted-foreground">
        {t.methodNote}
      </p>
    </>
  );
}
