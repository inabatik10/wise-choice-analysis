"use client";

import { Dialog } from "@base-ui/react/dialog";
import { Maximize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Lang } from "@/lib/i18n";

const copy = {
  ru: {
    image: "Выбранный скриншот",
    expand: "Развернуть изображение",
    expandShort: "На весь экран",
    remove: "Убрать скриншот",
    title: "Просмотр изображения",
    close: "Закрыть изображение",
  },
  kz: {
    image: "Таңдалған скриншот",
    expand: "Суретті үлкейту",
    expandShort: "Толық экран",
    remove: "Скриншотты алып тастау",
    title: "Суретті қарау",
    close: "Суретті жабу",
  },
  en: {
    image: "Selected screenshot",
    expand: "Expand image",
    expandShort: "Full screen",
    remove: "Remove screenshot",
    title: "Image preview",
    close: "Close image",
  },
};

export function ImagePreview({ image, lang, onRemove, disabled = false }: {
  image: { data: string; name: string };
  lang: Lang;
  onRemove: () => void;
  disabled?: boolean;
}) {
  const s = copy[lang];

  return <Dialog.Root>
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-11 shrink-0 items-center gap-1 border-b border-border pl-3">
        <p className="min-w-0 flex-1 truncate text-[13px] text-muted-foreground" title={image.name}>{image.name}</p>
        <Dialog.Trigger render={<Button type="button" variant="ghost" className="h-11 gap-2 px-3" />} aria-label={s.expand} title={s.expand} disabled={disabled}>
          <Maximize2 aria-hidden="true" />
          <span className="hidden text-[13px] sm:inline">{s.expandShort}</span>
        </Dialog.Trigger>
        <Button type="button" variant="ghost" size="icon" aria-label={s.remove} title={s.remove} disabled={disabled} onClick={onRemove}>
          <X aria-hidden="true" />
        </Button>
      </div>
      <div className="relative min-h-40 flex-1 overflow-hidden bg-muted/35 lg:min-h-0">
        <img data-testid="selected-image" src={image.data} alt={s.image} className="absolute inset-0 h-full w-full object-contain p-2" />
      </div>
    </div>
    <Dialog.Portal>
      <Dialog.Backdrop className="fixed inset-0 z-60 bg-black/70 transition-opacity duration-150 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 motion-reduce:transition-none" />
      <Dialog.Popup className="fixed inset-0 z-70 flex h-dvh w-full flex-col bg-background px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-[max(8px,env(safe-area-inset-top))] text-foreground outline-none transition-opacity duration-150 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 motion-reduce:transition-none sm:px-6 sm:pb-6">
        <Dialog.Title className="sr-only">{s.title}</Dialog.Title>
        <div className="flex min-h-11 shrink-0 items-center gap-3 border-b border-border pb-2">
          <Dialog.Description className="min-w-0 flex-1 break-all text-sm text-muted-foreground">{image.name}</Dialog.Description>
          <Dialog.Close render={<Button type="button" variant="ghost" size="icon" />} aria-label={s.close} title={s.close}>
            <X aria-hidden="true" />
          </Dialog.Close>
        </div>
        <div className="relative mt-3 min-h-0 flex-1 overflow-hidden">
          <img data-testid="expanded-image" src={image.data} alt={s.image} className="absolute inset-0 h-full w-full object-contain" />
        </div>
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>;
}
