"use client";

import { Select } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";
import type { AnalysisResult } from "@/lib/analysis-schema";
import { locale, type Lang } from "@/lib/i18n";

type CheckPickerProps = {
  history: AnalysisResult[];
  result: AnalysisResult;
  lang: Lang;
  compact?: boolean;
  onSelect: (item: AnalysisResult) => void;
};

const labels: Record<Lang, string> = {
  ru: "Открыть другую проверку",
  kz: "Басқа тексеруді ашу",
  en: "Open another check",
};

export function CheckPicker({ history, result, lang, compact = false, onSelect }: CheckPickerProps) {
  const entries = history.some(item => item.id === result.id) ? history : [result, ...history];
  const date = (item: AnalysisResult) => new Intl.DateTimeFormat(locale[lang], {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(new Date(item.createdAt));

  return <Select.Root
    value={result.id}
    items={entries.map(item => ({ value: item.id, label: item.title[lang] }))}
    onValueChange={id => {
      const item = entries.find(entry => entry.id === id);
      if (item) onSelect(item);
    }}
  >
    <Select.Trigger
      data-testid="check-selector"
      aria-label={`${labels[lang]}: ${result.title[lang]}`}
      className={`group flex w-full min-w-0 items-start justify-between gap-3 rounded-md bg-transparent text-left whitespace-normal text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${compact ? "min-h-11 px-1 py-1" : "my-1 min-h-16 px-3 py-3"}`}
    >
      <span className="min-w-0 flex-1">
        <Select.Value data-testid="check-title" className={`block break-words font-medium ${compact ? "text-sm leading-5" : "text-base leading-6"}`}>{result.title[lang]}</Select.Value>
        <time dateTime={result.createdAt} className={`block text-xs font-normal tabular-nums text-muted-foreground ${compact ? "mt-0.5 leading-4" : "mt-1 leading-5"}`}>{date(result)}</time>
      </span>
      <Select.Icon className="mt-1 shrink-0 text-muted-foreground transition-transform group-data-popup-open:rotate-180"><ChevronDown className="size-4" /></Select.Icon>
    </Select.Trigger>
    <Select.Portal>
      <Select.Positioner align="start" side="bottom" sideOffset={6} alignItemWithTrigger={false} collisionPadding={16} className="z-[70] w-[var(--anchor-width)] max-w-[calc(100vw-32px)] outline-none">
        <Select.Popup data-testid="check-options" className="w-full max-w-[calc(100vw-32px)] overflow-y-auto rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-xl outline-none [max-height:var(--available-height)]">
          <Select.List>
            {entries.map(item => <Select.Item key={item.id} data-testid={`check-option-${item.id}`} value={item.id} label={item.title[lang]} className="flex min-h-16 cursor-pointer items-start gap-3 rounded-lg px-3 py-3 outline-none select-none data-highlighted:bg-muted data-selected:bg-primary/5">
              <span className="min-w-0 flex-1">
                <Select.ItemText className="block break-words text-base font-medium leading-6">{item.title[lang]}</Select.ItemText>
                <time dateTime={item.createdAt} className="mt-1 block text-xs leading-5 tabular-nums text-muted-foreground">{date(item)}</time>
              </span>
              <span className="mt-1 flex size-4 shrink-0 items-center justify-center"><Select.ItemIndicator><Check className="size-4 text-primary" /></Select.ItemIndicator></span>
            </Select.Item>)}
          </Select.List>
        </Select.Popup>
      </Select.Positioner>
    </Select.Portal>
  </Select.Root>;
}
