export type Lang = "ru" | "kz" | "en";

export const locale: Record<Lang, string> = {
  ru: "ru-RU",
  kz: "kk-KZ",
  en: "en-US",
};

const ru = {
  tagline: "Умный выбор",
  skipContent: "Перейти к содержимому",
  language: "Язык интерфейса",
  heading: "Что скрывает реклама курса?",
  intro:
    "Проверьте обещания и приёмы убеждения, прежде чем платить за обучение.",
  inputLabel: "Текст рекламы",
  inputPlaceholder: "Вставьте текст объявления или описание курса...",
  analyze: "Проверить предложение",
  analyzing: "Анализируем предложение...",
  upload: "Добавить скриншот",
  imageHint:
    "JPEG, PNG или WebP, до 2 МБ. Текст на изображении должен быть читаемым.",
  removeImage: "Убрать скриншот",
  example: "Попробовать пример",
  exampleText:
    "Курс Excel для начинающих. 8 недель, 24 занятия с практикой и проверкой домашних заданий. Программа и сведения о преподавателе доступны до оплаты. Цена 45 000 ₸. До пятницы действует скидка 15%. Условия возврата указаны в договоре.",
  privacy:
    "Для анализа текст и скриншот отправляются в Gemini. Не добавляйте личные данные.",
  methodNote:
    "Учебный проект. Оценка показывает признаки риска в рекламе, а не доказывает мошенничество.",
  resultTitle: "Результат проверки",
  noResult: "Пока нет результата",
  noResultHint:
    "Добавьте текст рекламы или скриншот, чтобы проверить предложение.",
  startAnalysis: "Перейти к проверке",
  riskCaption: "Чем выше IDP, тем меньше признаков риска по модели",
  riskUnknown: "Для оценки риска недостаточно данных",
  pressure: "Маркетинговое давление",
  pressureHint:
    "Скидка или таймер могут подталкивать к покупке. Сами по себе они не доказывают обман.",
  price: "Цена курса",
  priceUnknown: "Цена не указана",
  currencyUnknown: "Валюта не указана",
  verdict: "Что показал анализ",
  evidence: "Приёмы в рекламе",
  noTriggers:
    "В этом материале не найдены поддерживаемые признаки маркетингового давления.",
  limitations: "Что ещё нужно проверить",
  methodology: "Как рассчитана оценка",
  methodologyBody:
    "Gemini выделяет признаки и цитаты из рекламы. IDP, IMP и показатели Q и R рассчитываются по модели проекта. Чем выше IDP, тем меньше признаков риска. Предварительный CVF принимает P и A за 0, если сравнительных данных нет. Полный CVF требует этих данных. Оценка доверия использует эвристику проекта, а не проверенную вероятность. Сведения из рекламы не проверяются независимо.",
  qualityHint:
    "Оцениваются сведения в рекламе, а не фактическое качество обучения.",
  radarTitle: "Ценовой радар",
  radarIntro: "Сравните цену курса с похожими предложениями, которые вы нашли.",
  noMarketData:
    "Рыночной выборки пока нет. Добавьте сопоставимые курсы, чтобы сравнить цены.",
  comparisonTitle: "Курсы для сравнения",
  comparisonHint:
    "Выбирайте курсы с похожей программой и длительностью. Сравниваются только цены в той же валюте. Эти данные добавляете вы; это не обзор всего рынка.",
  comparisonName: "Название курса",
  comparisonPrice: "Цена",
  comparisonCurrency: "Валюта",
  addComparison: "Добавить курс",
  removeComparison: "Убрать из сравнения",
  median: "Медиана выбранных курсов",
  priceDifference: "Отличие от медианы",
  comparisonCount: "Курсов в сравнении",
  historyTitle: "История проверок",
  historyIntro: "Последние 10 проверок хранятся только в этом браузере.",
  emptyHistory: "Здесь появятся ваши проверки",
  openResult: "Открыть результат",
  deleteResult: "Удалить проверку",
  clearHistory: "Очистить историю",
  storageError:
    "Не удалось сохранить данные в браузере. Текущий результат остаётся доступным.",
  imageError: "Выберите JPEG, PNG или WebP размером до 2 МБ.",
  networkError:
    "Не удалось связаться с сервером. Проверьте подключение и попробуйте ещё раз.",
  invalidResponse: "Сервер вернул неполный результат. Попробуйте ещё раз.",
  retry: "Повторить",
  cancel: "Отмена",
  sourceLabel: "Анализ текста и изображения: Gemini",
  originalQuote: "Цитата на языке оригинала",
  back: "Назад",
  unknown: "Нет данных",
  historySaved: "Проверка сохранена в этом браузере",
  priceSource: "Цена из предоставленной рекламы",
  analysisCount: "Сохранено проверок",
  nav: {
    dashboard: "Проверка",
    analysis: "Результат",
    triggers: "Приёмы",
    radar: "Радар цен",
    history: "История",
    learning: "Как проверять",
  },
  risk: {
    low: "Низкий риск",
    moderate: "Умеренный риск",
    high: "Высокий риск",
    insufficient: "Недостаточно данных",
  },
  triggers: {
    anchoring: "Ценовой якорь",
    socialProof: "Социальное доказательство",
    halo: "Эффект авторитета",
    fomo: "Искусственная спешка",
    scarcity: "Ограниченность мест",
    lossAversion: "Страх упустить выгоду",
  },
  metrics: {
    qQuality: "Сведения о качестве",
    pPriceAnomaly: "Признаки завышенной цены",
    rRisk: "Признаки риска",
    aAltCost: "Наличие альтернатив",
  },
  errors: {
    INVALID_REQUEST:
      "Добавьте текст рекламы или скриншот и повторите проверку.",
    INVALID_IMAGE:
      "Не удалось прочитать изображение. Выберите JPEG, PNG или WebP.",
    INPUT_TOO_LARGE:
      "Материал слишком большой. Сократите текст или уменьшите изображение.",
    MISSING_API_KEY:
      "Сервис анализа ещё не настроен. На сервере отсутствует ключ Gemini.",
    UPSTREAM_ERROR: "Gemini не выполнила запрос. Попробуйте позже.",
    UPSTREAM_TIMEOUT: "Анализ занял слишком много времени. Попробуйте ещё раз.",
    INVALID_MODEL_RESPONSE:
      "Не удалось получить полный результат анализа. Попробуйте ещё раз.",
    RATE_LIMITED: "Достигнут лимит запросов. Подождите и попробуйте ещё раз.",
    UNKNOWN: "Не удалось выполнить проверку. Попробуйте ещё раз.",
  },
};

export type Translation = typeof ru;

const kz: Translation = {
  tagline: "Ақылды таңдау",
  skipContent: "Мазмұнға өту",
  language: "Интерфейс тілі",
  heading: "Курс жарнамасы нені жасырады?",
  intro:
    "Оқуға ақша төлемес бұрын жарнамадағы уәделер мен сендіру тәсілдерін тексеріңіз.",
  inputLabel: "Жарнама мәтіні",
  inputPlaceholder: "Жарнама мәтінін немесе курс сипаттамасын енгізіңіз...",
  analyze: "Ұсынысты тексеру",
  analyzing: "Ұсыныс талданып жатыр...",
  upload: "Скриншот қосу",
  imageHint:
    "JPEG, PNG немесе WebP, 2 МБ-қа дейін. Суреттегі мәтін анық көрінуі керек.",
  removeImage: "Скриншотты алып тастау",
  example: "Мысалды тексеру",
  exampleText:
    "Жаңадан бастаушыларға арналған Excel курсы. 8 апта, тәжірибелік тапсырмалар мен үй жұмысын тексеруді қамтитын 24 сабақ. Бағдарлама мен оқытушы туралы мәліметті төлем жасамай тұрып көруге болады. Бағасы 45 000 ₸. Жұмаға дейін 15% жеңілдік бар. Ақшаны қайтару шарттары келісімшартта көрсетілген.",
  privacy:
    "Талдау үшін мәтін мен скриншот Gemini-ге жіберіледі. Жеке деректерді қоспаңыз.",
  methodNote:
    "Оқу жобасы. Баға жарнамадағы тәуекел белгілерін көрсетеді, алаяқтықты дәлелдемейді.",
  resultTitle: "Тексеру нәтижесі",
  noResult: "Әзірге нәтиже жоқ",
  noResultHint:
    "Ұсынысты тексеру үшін жарнама мәтінін немесе скриншотын қосыңыз.",
  startAnalysis: "Тексеруге өту",
  riskCaption: "IDP жоғары болған сайын модельдегі тәуекел белгілері азаяды",
  riskUnknown: "Тәуекелді бағалауға дерек жеткіліксіз",
  pressure: "Маркетингтік қысым",
  pressureHint:
    "Жеңілдік немесе таймер сатып алуға асықтыруы мүмкін. Бірақ олардың өзі алдаудың дәлелі емес.",
  price: "Курс бағасы",
  priceUnknown: "Бағасы көрсетілмеген",
  currencyUnknown: "Валюта көрсетілмеген",
  verdict: "Талдау қорытындысы",
  evidence: "Жарнамадағы тәсілдер",
  noTriggers:
    "Бұл материалдан жүйе анықтай алатын маркетингтік қысым белгілері табылмады.",
  limitations: "Тағы нені тексеру керек",
  methodology: "Баға қалай есептеледі",
  methodologyBody:
    "Gemini жарнамадан белгілер мен дәйексөздерді анықтайды. IDP, IMP, Q және R жоба моделімен есептеледі. IDP жоғары болса, тәуекел белгілері аз. Салыстыру деректері жоқ болса, алдын ала CVF P және A мәндерін 0 деп алады. Толық CVF үшін бұл деректер қажет. Сенім бағасы тексерілген ықтималдық емес, жобаның эвристикасы. Жарнамадағы мәліметтер тәуелсіз тексеруден өтпейді.",
  qualityHint:
    "Оқудың нақты сапасы емес, жарнамада берілген мәліметтер бағаланады.",
  radarTitle: "Баға радары",
  radarIntro: "Курс бағасын өзіңіз тапқан ұқсас ұсыныстармен салыстырыңыз.",
  noMarketData:
    "Нарықтағы бағалар туралы дерек әлі жоқ. Салыстыру үшін ұқсас курстарды қосыңыз.",
  comparisonTitle: "Салыстырылатын курстар",
  comparisonHint:
    "Бағдарламасы мен ұзақтығы ұқсас курстарды таңдаңыз. Тек бір валютадағы бағалар салыстырылады. Бұл деректерді өзіңіз қосасыз; олар бүкіл нарықты қамтымайды.",
  comparisonName: "Курс атауы",
  comparisonPrice: "Бағасы",
  comparisonCurrency: "Валюта",
  addComparison: "Курс қосу",
  removeComparison: "Салыстырудан алып тастау",
  median: "Таңдалған курстар бағасының медианасы",
  priceDifference: "Медианадан айырмасы",
  comparisonCount: "Салыстырылған курс саны",
  historyTitle: "Тексеру тарихы",
  historyIntro: "Соңғы 10 тексеру тек осы браузерде сақталады.",
  emptyHistory: "Тексерулеріңіз осы жерде көрсетіледі",
  openResult: "Нәтижені ашу",
  deleteResult: "Тексеруді жою",
  clearHistory: "Тарихты тазалау",
  storageError:
    "Деректерді браузерде сақтау мүмкін болмады. Қазіргі нәтижені әлі де көре аласыз.",
  imageError:
    "Көлемі 2 МБ-тан аспайтын JPEG, PNG немесе WebP суретін таңдаңыз.",
  networkError:
    "Сервермен байланысу мүмкін болмады. Интернет байланысын тексеріп, қайталап көріңіз.",
  invalidResponse: "Сервер толық нәтиже қайтармады. Қайталап көріңіз.",
  retry: "Қайталау",
  cancel: "Бас тарту",
  sourceLabel: "Мәтін мен суретті талдау: Gemini",
  originalQuote: "Дәйексөз түпнұсқа тілінде",
  back: "Артқа",
  unknown: "Дерек жоқ",
  historySaved: "Тексеру осы браузерде сақталды",
  priceSource: "Берілген жарнамадағы баға",
  analysisCount: "Сақталған тексерулер",
  nav: {
    dashboard: "Тексеру",
    analysis: "Нәтиже",
    triggers: "Тәсілдер",
    radar: "Баға радары",
    history: "Тарих",
    learning: "Тексеруді үйрену",
  },
  risk: {
    low: "Төмен тәуекел",
    moderate: "Орташа тәуекел",
    high: "Жоғары тәуекел",
    insufficient: "Дерек жеткіліксіз",
  },
  triggers: {
    anchoring: "Бастапқы бағамен салыстыру",
    socialProof: "Көпшіліктің таңдауына сүйену",
    halo: "Бедел арқылы сендіру",
    fomo: "Асықтыру",
    scarcity: "Орын санының шектеулілігі",
    lossAversion: "Пайдадан айырылып қалу қорқынышы",
  },
  metrics: {
    qQuality: "Сапа туралы мәліметтер",
    pPriceAnomaly: "Бағаның артықтығын көрсететін белгілер",
    rRisk: "Тәуекел белгілері",
    aAltCost: "Баламалардың болуы",
  },
  errors: {
    INVALID_REQUEST:
      "Жарнама мәтінін немесе скриншотын қосып, қайта тексеріңіз.",
    INVALID_IMAGE:
      "Суретті оқу мүмкін болмады. JPEG, PNG немесе WebP таңдаңыз.",
    INPUT_TOO_LARGE:
      "Материал тым үлкен. Мәтінді қысқартыңыз немесе сурет көлемін азайтыңыз.",
    MISSING_API_KEY:
      "Талдау қызметі әлі бапталмаған. Серверде Gemini кілті жоқ.",
    UPSTREAM_ERROR:
      "Gemini сұрауды орындай алмады. Кейінірек қайталап көріңіз.",
    UPSTREAM_TIMEOUT: "Талдау тым ұзаққа созылды. Қайталап көріңіз.",
    INVALID_MODEL_RESPONSE:
      "Талдаудың толық нәтижесін алу мүмкін болмады. Қайталап көріңіз.",
    RATE_LIMITED: "Сұраулар шегіне жеттіңіз. Біраз күтіп, қайталап көріңіз.",
    UNKNOWN: "Тексеру орындалмады. Қайталап көріңіз.",
  },
};

const en: Translation = {
  tagline: "Choose with confidence",
  skipContent: "Skip to content",
  language: "Interface language",
  heading: "What is the course ad leaving out?",
  intro:
    "Check the promises and persuasion tactics before paying for a course.",
  inputLabel: "Advertisement text",
  inputPlaceholder: "Paste the advertisement or course description...",
  analyze: "Check this offer",
  analyzing: "Analyzing the offer...",
  upload: "Add a screenshot",
  imageHint: "JPEG, PNG or WebP, up to 2 MB. Make sure the text is readable.",
  removeImage: "Remove screenshot",
  example: "Try an example",
  exampleText:
    "Excel for beginners. 8 weeks with 24 lessons, practical assignments and homework feedback. The syllabus and teacher's background are available before payment. Price: 45,000 KZT. A 15% discount applies until Friday. Refund terms are included in the contract.",
  privacy:
    "The text and screenshot are sent to Gemini for analysis. Do not include personal information.",
  methodNote:
    "An educational project. The score describes risk signals in an ad, not proof of fraud.",
  resultTitle: "Analysis result",
  noResult: "No result yet",
  noResultHint: "Add advertisement text or a screenshot to check an offer.",
  startAnalysis: "Check an offer",
  riskCaption: "A higher IDP means fewer risk signals in the model",
  riskUnknown: "Not enough information to assess risk",
  pressure: "Marketing pressure",
  pressureHint:
    "A discount or countdown can push you to buy. Neither proves that an offer is fraudulent.",
  price: "Course price",
  priceUnknown: "No price stated",
  currencyUnknown: "No currency stated",
  verdict: "What the analysis found",
  evidence: "Persuasion tactics",
  noTriggers:
    "No supported marketing pressure signals were found in this material.",
  limitations: "What to check next",
  methodology: "How the score is calculated",
  methodologyBody:
    "Gemini extracts signals and quotes from the advert. IDP, IMP, Q and R use the project model. A higher IDP means fewer risk signals. Preliminary CVF assumes zero for P and A when comparison data is missing. Full CVF requires that data. Trust uses the project's heuristic, not a validated probability. Advertising claims are not independently verified.",
  qualityHint:
    "This assesses information in the ad, not the actual quality of teaching.",
  radarTitle: "Price radar",
  radarIntro: "Compare the course price with similar offers you have found.",
  noMarketData:
    "No market sample yet. Add comparable courses to compare their prices.",
  comparisonTitle: "Courses to compare",
  comparisonHint:
    "Choose courses with similar content and duration. Only prices in the same currency are compared. You provide this data; it does not represent the whole market.",
  comparisonName: "Course name",
  comparisonPrice: "Price",
  comparisonCurrency: "Currency",
  addComparison: "Add course",
  removeComparison: "Remove from comparison",
  median: "Median of selected courses",
  priceDifference: "Difference from median",
  comparisonCount: "Courses compared",
  historyTitle: "Analysis history",
  historyIntro: "Your last 10 analyses are stored only in this browser.",
  emptyHistory: "Your analyses will appear here",
  openResult: "Open result",
  deleteResult: "Delete analysis",
  clearHistory: "Clear history",
  storageError:
    "Could not save data in this browser. Your current result is still available.",
  imageError: "Choose a JPEG, PNG or WebP image no larger than 2 MB.",
  networkError:
    "Could not reach the server. Check your connection and try again.",
  invalidResponse:
    "The server returned an incomplete result. Please try again.",
  retry: "Try again",
  cancel: "Cancel",
  sourceLabel: "Text and image analysis: Gemini",
  originalQuote: "Quote in its original language",
  back: "Back",
  unknown: "No data",
  historySaved: "Analysis saved in this browser",
  priceSource: "Price from the supplied advertisement",
  analysisCount: "Saved analyses",
  nav: {
    dashboard: "Check",
    analysis: "Result",
    triggers: "Tactics",
    radar: "Price radar",
    history: "History",
    learning: "Learn to check",
  },
  risk: {
    low: "Low risk",
    moderate: "Moderate risk",
    high: "High risk",
    insufficient: "Not enough information",
  },
  triggers: {
    anchoring: "Price anchoring",
    socialProof: "Social proof",
    halo: "Borrowed authority",
    fomo: "Artificial urgency",
    scarcity: "Limited availability",
    lossAversion: "Fear of missing a benefit",
  },
  metrics: {
    qQuality: "Quality information",
    pPriceAnomaly: "Overpricing signals",
    rRisk: "Risk signals",
    aAltCost: "Available alternatives",
  },
  errors: {
    INVALID_REQUEST: "Add advertisement text or a screenshot and try again.",
    INVALID_IMAGE: "Could not read the image. Choose a JPEG, PNG or WebP file.",
    INPUT_TOO_LARGE:
      "The material is too large. Shorten the text or reduce the image size.",
    MISSING_API_KEY:
      "Analysis is not configured yet. The server is missing its Gemini key.",
    UPSTREAM_ERROR:
      "Gemini could not complete the request. Please try again later.",
    UPSTREAM_TIMEOUT: "The analysis took too long. Please try again.",
    INVALID_MODEL_RESPONSE:
      "Could not get a complete analysis result. Please try again.",
    RATE_LIMITED:
      "The request limit has been reached. Wait a little and try again.",
    UNKNOWN: "Could not complete the analysis. Please try again.",
  },
};

export const translations: Record<Lang, Translation> = { ru, kz, en };
