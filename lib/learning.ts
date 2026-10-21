type LearningContent = {
  title: string;
  intro: string;
  cards: { title: string; body: string }[];
  quiz: {
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  }[];
};

export const learning: Record<"ru" | "kz" | "en", LearningContent> = {
  ru: {
    title: "Как оценить предложение",
    intro:
      "Реклама показывает часть картины. Перед оплатой проверьте, что именно вы покупаете.",
    cards: [
      {
        title: "Спешка мешает сравнивать",
        body: 'Таймер или фраза "осталось два места" подталкивают к быстрому решению. Это маркетинговое давление, а не доказательство обмана. Сохраните предложение и проверьте условия без спешки.',
      },
      {
        title: "Ищите содержание за обещаниями",
        body: "Попросите программу и пример занятия. Уточните, кто проверяет задания. Обещание высокого дохода не заменяет описание навыков, которым вас будут учить.",
      },
      {
        title: "Сравнивайте похожие курсы",
        body: "Учитывайте объём занятий и формат обратной связи. Записанные уроки и индивидуальные занятия могут стоить по-разному. Без сопоставимых предложений нельзя надёжно определить, завышена ли цена.",
      },
      {
        title: "Отсутствие данных оставляет вопросы",
        body: "Если в рекламе нет условий возврата, это ещё не значит, что возврат невозможен. Запросите условия у продавца. Оценка Wise Choice относится к присланному материалу и не подтверждает добросовестность автора.",
      },
    ],
    quiz: [
      {
        question:
          'У курса есть программа и скидка "только сегодня". Что можно заключить?',
        options: [
          "Курс точно мошеннический",
          "Реклама торопит с решением; качество курса нужно проверить отдельно",
          "Наличие программы гарантирует качество",
        ],
        correct: 1,
        explanation:
          "Дедлайн может усиливать давление. Сам по себе он не доказывает обман, а программа ещё не подтверждает качество преподавания.",
      },
      {
        question:
          "В рекламе указана цена, но нет похожих курсов для сравнения. Какой вывод корректен?",
        options: [
          "Рыночная цена пока неизвестна",
          "Нужно придумать среднюю цену",
          "Любой дорогой курс подозрителен",
        ],
        correct: 0,
        explanation:
          "Для сравнения нужны актуальные предложения с похожим содержанием и форматом. До этого можно показать цену курса, но не достоверную рыночную медиану.",
      },
    ],
  },
  kz: {
    title: "Ұсынысты қалай бағалауға болады",
    intro:
      "Жарнама толық ақпарат бермейді. Ақша төлемес бұрын нақты не сатып алатыныңызды анықтаңыз.",
    cards: [
      {
        title: "Асығыстық салыстыруға кедергі келтіреді",
        body: 'Таймер немесе "екі орын қалды" деген сөз тез шешім қабылдауға итермелейді. Бұл маркетингтік қысым, бірақ алаяқтықтың дәлелі емес. Ұсынысты сақтап, шарттарын асықпай тексеріңіз.',
      },
      {
        title: "Уәдеге емес, оқу мазмұнына қараңыз",
        body: "Оқу бағдарламасы мен сабақ үлгісін сұраңыз. Тапсырмаларды кім тексеретінін біліңіз. Жоғары табыс туралы уәде курста қандай дағдылар үйретілетінін түсіндірмейді.",
      },
      {
        title: "Мазмұны ұқсас курстарды салыстырыңыз",
        body: "Сабақ көлемі мен кері байланыс түрін ескеріңіз. Дайын бейнесабақ пен жеке сабақтың бағасы әртүрлі болуы мүмкін. Ұқсас ұсыныстарсыз бағаның негізсіз жоғары екенін анықтау қиын.",
      },
      {
        title: "Ақпарат жетіспесе, нақтылап сұраңыз",
        body: "Жарнамада ақшаны қайтару шарттары жазылмаса, бұл ақшаны қайтару мүмкін емес дегенді білдірмейді. Шарттарды сатушыдан сұраңыз. Wise Choice тек жіберілген материалды бағалайды және автордың адалдығына кепілдік бермейді.",
      },
    ],
    quiz: [
      {
        question:
          'Курстың оқу бағдарламасы бар, ал жеңілдік "тек бүгін" деп көрсетілген. Қандай қорытынды жасауға болады?',
        options: [
          "Бұл міндетті түрде алаяқтық",
          "Жарнама асықтырады; курс сапасын бөлек тексеру керек",
          "Бағдарламаның болуы сапаға кепілдік береді",
        ],
        correct: 1,
        explanation:
          "Мерзім қысымды күшейтуі мүмкін. Бірақ оның өзі алаяқтықты дәлелдемейді, ал оқу бағдарламасы сабақтың сапасын растамайды.",
      },
      {
        question:
          "Жарнамада баға бар, бірақ салыстыруға ұқсас курстар жоқ. Қай тұжырым дұрыс?",
        options: [
          "Нарықтағы баға әзірге белгісіз",
          "Орташа бағаны ойдан шығару керек",
          "Қымбат курстың бәрі күмәнді",
        ],
        correct: 0,
        explanation:
          "Салыстыру үшін мазмұны мен оқу форматы ұқсас өзекті ұсыныстар керек. Онсыз курс бағасын көрсетуге болады, бірақ нарық медианасын сенімді есептеу мүмкін емес.",
      },
    ],
  },
  en: {
    title: "How to assess an offer",
    intro:
      "An ad only tells part of the story. Before paying, check what you will actually get.",
    cards: [
      {
        title: "Urgency makes comparison harder",
        body: 'A countdown or "only two places left" pushes you to decide quickly. This is marketing pressure, not proof of fraud. Save the offer and review its terms without rushing.',
      },
      {
        title: "Look beyond the promise",
        body: "Ask for the syllabus and a sample lesson. Find out who reviews assignments. A promise of high earnings does not explain which skills the course will teach.",
      },
      {
        title: "Compare similar courses",
        body: "Consider the amount of teaching and the feedback provided. Recorded lessons and individual tuition may have different prices. Without comparable offers, you cannot reliably tell whether a price is inflated.",
      },
      {
        title: "Missing details leave questions open",
        body: "If an ad does not mention refunds, that does not mean refunds are unavailable. Ask the seller for the terms. Wise Choice assesses the material you submit; its score does not verify the seller's trustworthiness.",
      },
    ],
    quiz: [
      {
        question:
          'A course has a syllabus and a "today only" discount. What can you conclude?',
        options: [
          "The course is definitely a scam",
          "The ad creates urgency; course quality needs a separate check",
          "Having a syllabus guarantees quality",
        ],
        correct: 1,
        explanation:
          "A deadline can increase pressure. It does not prove fraud, and a syllabus alone does not establish teaching quality.",
      },
      {
        question:
          "An ad gives a price, but you have no similar courses to compare. Which conclusion is justified?",
        options: [
          "The market price is not yet known",
          "You should make up an average price",
          "Every expensive course is suspicious",
        ],
        correct: 0,
        explanation:
          "A comparison needs current offers with similar content and teaching formats. Until then, you can show the course price, but not a reliable market median.",
      },
    ],
  },
};
