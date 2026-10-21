"use client";

import { useEffect, useState } from "react";
import { Check, FileImage, FileText, LoaderCircle } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { createExampleImage, getExamples, type ExampleImage } from "@/lib/examples";

export type ExampleSelection = {
  id: string;
  title: string;
  text: string;
  image?: ExampleImage;
};

type AnalysisExamplesProps = {
  lang: Lang;
  mode: "text" | "image";
  selectedId: string | null;
  disabled?: boolean;
  onSelect: (selection: ExampleSelection) => void;
};

const copy = {
  ru: {
    heading: "Попробуйте на примере",
    disclaimer: "Вымышленные учебные примеры. Выберите один и запустите проверку.",
    images: "Те же объявления в виде скриншотов",
    imageError: "Не удалось подготовить скриншоты. Можно попробовать текстовый пример.",
    loading: "Готовим скриншоты",
    selected: "Выбрано",
  },
  kz: {
    heading: "Мысалмен тексеріп көріңіз",
    disclaimer: "Ойдан шығарылған оқу мысалдары. Біреуін таңдап, тексеруді бастаңыз.",
    images: "Осы хабарландырулардың скриншоттары",
    imageError: "Скриншоттар дайындалмады. Мәтіндік мысалды қолданып көріңіз.",
    loading: "Скриншоттар дайындалып жатыр",
    selected: "Таңдалды",
  },
  en: {
    heading: "Try an example",
    disclaimer: "Fictional examples for learning. Choose one, then run the check.",
    images: "The same ads as screenshots",
    imageError: "Could not prepare the screenshots. You can try a text example instead.",
    loading: "Preparing screenshots",
    selected: "Selected",
  },
};

export function AnalysisExamples({ lang, mode, selectedId, disabled = false, onSelect }: AnalysisExamplesProps) {
  const examples = getExamples(lang);
  const [images, setImages] = useState<Record<string, ExampleImage>>({});
  const [imageError, setImageError] = useState(false);
  const [imageLanguage, setImageLanguage] = useState<Lang | null>(null);
  const s = copy[lang];

  useEffect(() => {
    let cancelled = false;
    setImageError(false);
    if (mode !== "image") return;
    setImageLanguage(null);
    void Promise.all(getExamples(lang).map(async example => [example.id, await createExampleImage(example)] as const))
      .then(entries => {
        if (!cancelled) {
          setImages(Object.fromEntries(entries));
          setImageLanguage(lang);
        }
      })
      .catch(() => { if (!cancelled) setImageError(true); });
    return () => { cancelled = true; };
  }, [lang, mode]);

  const imagesReady = imageLanguage === lang;
  return <section data-testid="analysis-examples" className="min-w-0">
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
      <h2 className="text-base font-medium text-foreground">{s.heading}</h2>
      {mode === "image" && <p className="text-[13px] text-muted-foreground">{s.images}</p>}
    </div>
    <div className="mt-3 divide-y divide-border">
      {examples.map(example => {
        const selected = selectedId === example.id;
        const image = imagesReady ? images[example.id] : undefined;
        return <button
          type="button"
          key={example.id}
          data-testid={`example-${example.id}`}
          aria-pressed={selected}
          aria-label={example.title}
          disabled={disabled || (mode === "image" && !image)}
          onClick={() => onSelect({ id: example.id, title: example.title, text: example.text, ...(mode === "image" ? { image } : {}) })}
          className={`group flex min-h-20 w-full min-w-0 items-center gap-3 border-l-2 py-3 pl-3 pr-2 text-left transition-colors disabled:cursor-wait disabled:opacity-60 ${selected ? "border-l-primary bg-primary/5" : "border-l-transparent hover:bg-muted/60"}`}
        >
          {mode === "image" ? <div className="flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden bg-muted">
            {image ? <img src={image.data} alt="" className="h-full w-full object-contain" /> : <FileImage aria-hidden="true" className="size-5 text-muted-foreground" />}
          </div> : <FileText aria-hidden="true" className={`size-4 shrink-0 ${selected ? "text-primary" : "text-muted-foreground"}`} />}
          <span className="min-w-0 flex-1"><span className="block text-base font-medium leading-6 text-foreground">{example.title}</span><span className="mt-1 block text-sm leading-5 text-muted-foreground">{example.description}</span></span>
          {selected && <Check className="size-4 shrink-0 text-primary" aria-label={s.selected} />}
        </button>;
      })}
    </div>
    {mode === "image" && !imagesReady && !imageError && <p role="status" className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"><LoaderCircle className="size-3.5 animate-spin" />{s.loading}</p>}
    {imageError && <p role="alert" className="mt-2 text-xs leading-5 text-destructive">{s.imageError}</p>}
    <p className="mt-2 text-[13px] leading-5 text-muted-foreground">{s.disclaimer}</p>
  </section>;
}
