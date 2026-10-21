import type { Lang } from "@/lib/i18n";

export type ExampleId = "documented" | "income" | "incomplete";
export type AnalysisExample = {
  id: ExampleId;
  title: string;
  description: string;
  text: string;
  lang: Lang;
};
export type ExampleImage = { data: string; name: string };

type ExampleContent = Omit<AnalysisExample, "lang">;

const examples: Record<Lang, ExampleContent[]> = {
  ru: [
    {
      id: "documented",
      title: "Курс с программой",
      description: "Excel, практика и условия оплаты",
      text: "Курс Excel для начинающих\nПреподаватель: Айна Серік. 5 лет обучает работе в Excel.\nПрограмма: формулы и функции, сводные таблицы, диаграммы и отчёты. Подробная программа доступна до оплаты.\n8 недель, 24 занятия по 60 минут. После каждого модуля есть практическое задание с проверкой и обратной связью преподавателя.\nЦена: 45 000 ₸ за весь курс, без дополнительных платежей.\nДоговор можно прочитать до оплаты. Полный возврат предусмотрен при отказе за 7 дней до начала курса; остальные условия возврата указаны в договоре.",
    },
    {
      id: "income",
      title: "Громкие обещания",
      description: "Гарантии дохода и срочная оплата",
      text: "Миллион за неделю с нуля!\nГарантируем каждому доход 1 000 000 ₸ за 7 дней. Опыт и знания не нужны, риска нет!\nОсталось только 2 места. Оплатите в ближайшие 15 минут: 99 000 ₸ вместо 300 000 ₸. Потом будет поздно!\nВсе наши ученики уже зарабатывают, вы точно сможете так же.\nПрограмму курса и имя преподавателя раскроем только после перевода денег. Договор и возврат не предусмотрены.",
    },
    {
      id: "incomplete",
      title: "Короткое объявление",
      description: "Мало сведений о самом обучении",
      text: "Онлайн-курс по работе с таблицами\nСкоро открывается новый поток. Занятия проходят онлайн, можно учиться из дома.\nОставьте заявку, и менеджер расскажет подробности.",
    },
  ],
  kz: [
    {
      id: "documented",
      title: "Бағдарламасы бар курс",
      description: "Excel, тәжірибе және төлем шарттары",
      text: "Жаңадан бастаушыларға арналған Excel курсы\nОқытушы: Айна Серік. Excel бағдарламасын қолдануды 5 жылдан бері үйретеді.\nБағдарлама: формулалар мен функциялар, жиынтық кестелер, диаграммалар және есептер. Толық бағдарламамен төлемге дейін танысуға болады.\n8 апта, әрқайсысы 60 минуттан 24 сабақ. Әр модульден кейін оқытушы тексеріп, кері байланыс беретін практикалық тапсырма бар.\nБағасы: толық курсқа 45 000 ₸, қосымша төлем жоқ.\nКелісімшартты төлемге дейін оқуға болады. Курс басталуына 7 күн қалғанда бас тартсаңыз, ақша толық қайтарылады. Өзге қайтару шарттары келісімшартта көрсетілген.",
    },
    {
      id: "income",
      title: "Үлкен уәделер",
      description: "Табыс кепілдігі және шұғыл төлем",
      text: "Бір аптада нөлден миллион!\nӘр адамға 7 күнде 1 000 000 ₸ табысқа кепілдік береміз. Тәжірибе де, білім де қажет емес, еш тәуекел жоқ!\nТек 2 орын қалды. Келесі 15 минутта төлеңіз: 300 000 ₸ орнына 99 000 ₸. Кейін кеш болады!\nБарлық оқушымыз табыс тауып жүр, сіз де міндетті түрде табасыз.\nКурс бағдарламасы мен оқытушының атын ақша аударғаннан кейін ғана айтамыз. Келісімшарт пен ақшаны қайтару қарастырылмаған.",
    },
    {
      id: "incomplete",
      title: "Қысқа хабарландыру",
      description: "Оқу туралы мәлімет аз",
      text: "Кестелермен жұмыс істеуге арналған онлайн-курс\nЖақында жаңа топ ашылады. Сабақтар онлайн өтеді, үйден оқуға болады.\nӨтінім қалдырыңыз, менеджер толық ақпарат береді.",
    },
  ],
  en: [
    {
      id: "documented",
      title: "Course with a syllabus",
      description: "Excel, practice and payment terms",
      text: "Excel for beginners\nInstructor: Aina Serik, who has taught Excel for 5 years.\nSyllabus: formulas and functions, pivot tables, charts and reports. The full syllabus is available before payment.\n8 weeks, with 24 lessons of 60 minutes each. Every module includes a practical assignment reviewed by the instructor with individual feedback.\nPrice: 45 000 ₸ for the complete course, with no extra payments.\nThe contract is available before payment. Cancellations at least 7 days before the course starts receive a full refund. The contract explains the other refund terms.",
    },
    {
      id: "income",
      title: "Big promises",
      description: "Guaranteed income and urgent payment",
      text: "From zero to a million in a week!\nWe guarantee everyone an income of 1 000 000 ₸ in 7 days. No experience or knowledge needed. No risk!\nOnly 2 places left. Pay in the next 15 minutes: 99 000 ₸ instead of 300 000 ₸. After that, it will be too late!\nAll our students already make money. You will definitely achieve the same.\nWe reveal the syllabus and the instructor's name only after you transfer the money. No contract or refunds are provided.",
    },
    {
      id: "incomplete",
      title: "A short announcement",
      description: "Little information about the teaching",
      text: "Online course on working with spreadsheets\nA new cohort opens soon. Lessons take place online, so you can learn from home.\nLeave your details and a manager will explain more.",
    },
  ],
};

export function getExamples(lang: Lang): AnalysisExample[] {
  return examples[lang].map(example => ({ ...example, lang }));
}

const imageCopy: Record<Lang, { source: string; footer: string }> = {
  ru: { source: "Реклама онлайн-курса", footer: "Учебный пример. Все сведения вымышлены." },
  kz: { source: "Онлайн-курс жарнамасы", footer: "Оқу мысалы. Барлық мәлімет ойдан шығарылған." },
  en: { source: "Online course ad", footer: "Learning example. All details are fictional." },
};

function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && context.measureText(next).width > maxWidth) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** Render the same fictional ad as a readable PNG, entirely in the browser. */
export async function createExampleImage(example: AnalysisExample): Promise<ExampleImage> {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable");
  const width = 960;
  const padding = 64;
  const textWidth = width - padding * 2;
  const [title, ...paragraphs] = example.text.split("\n");
  const fontFamily = 'Arial, "Helvetica Neue", sans-serif';
  context.font = `700 44px ${fontFamily}`;
  const titleLines = wrapText(context, title, textWidth);
  context.font = `30px ${fontFamily}`;
  const bodyLines = paragraphs.map(paragraph => wrapText(context, paragraph, textWidth));
  const titleHeight = titleLines.length * 56;
  const bodyHeight = bodyLines.reduce((height, lines) => height + lines.length * 44 + 22, 0);
  canvas.width = width;
  canvas.height = Math.ceil(146 + titleHeight + 32 + bodyHeight + 102);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, canvas.height);
  context.fillStyle = "#14b8a6";
  context.fillRect(0, 0, width, 14);
  context.textBaseline = "top";
  context.font = `600 22px ${fontFamily}`;
  context.fillStyle = "#0f766e";
  context.fillText(imageCopy[example.lang].source, padding, 62);
  context.font = `700 44px ${fontFamily}`;
  context.fillStyle = "#101827";
  let y = 124;
  for (const line of titleLines) {
    context.fillText(line, padding, y);
    y += 56;
  }
  y += 32;
  context.font = `30px ${fontFamily}`;
  context.fillStyle = "#253245";
  for (const paragraph of bodyLines) {
    for (const line of paragraph) {
      context.fillText(line, padding, y);
      y += 44;
    }
    y += 22;
  }
  context.fillStyle = "#dce7e8";
  context.fillRect(padding, canvas.height - 94, textWidth, 2);
  context.font = `20px ${fontFamily}`;
  context.fillStyle = "#566375";
  context.fillText(imageCopy[example.lang].footer, padding, canvas.height - 65);
  return { data: canvas.toDataURL("image/png"), name: `wise-choice-${example.id}-${example.lang}.png` };
}
