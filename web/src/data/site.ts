export type Difficulty = "easy" | "medium" | "hard";

export type Route = {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  difficultyLabel: string;
  duration: string;
  distance: string;
  price: number;
  priceNote?: string;
  audience: string;
  description: string;
  progressOrder: number;
  image: string;
  imageAlt: string;
};

export type FleetItem = {
  id: string;
  name: string;
  role: string;
  color: string;
  count: number;
  seats: number;
  drive: string;
  image: string;
  imageAlt: string;
};

export type GallerySeedItem = {
  id: string;
  title: string;
  category: "atv" | "routes" | "nature" | "night" | "manor";
  src: string;
  alt: string;
};

export const NAV = [
  { href: "/marshruty", label: "Маршруты" },
  { href: "/tehnika", label: "Техника" },
  { href: "/tarify", label: "Тарифы" },
  { href: "/nochnoj-kvest", label: "Ночной квест" },
  { href: "/usadba", label: "Усадьба" },
  { href: "/galereya", label: "Галерея" },
  { href: "/faq", label: "FAQ" },
] as const;

export const SITE = {
  name: "Вольница",
  tagline: "Территория свободы",
  phone: "+7 (843) 560-10-32",
  email: "5trestkazan@mail.ru",
  hours: "10:00–22:00 ежедневно",
  location: "КФХ / усадьба «Берегиня», ~25 мин от Казани",
  /** YouTube id ролика; пусто = модал «скоро» */
  videoYoutubeId: "",
  whatsapp: "https://wa.me/78435601032",
  telegram: "https://t.me/share/url?url=https://volnitsa.ru",
  logo: "/images/brand/logo-volnitsa-runa-transparent.png",
  logoAlt: "Вольница — территория свободы",
  logoFull: "/images/brand/logo-volnitsa-runa-transparent.png",
  logoFullAlt:
    "Логотип Вольница: руна и ели, надпись «Вольница — территория свободы»",
  /** Компактный знак без текста (иконки, фавикон) */
  logoMark: "/images/brand/logo-volnitsa-znak.png",
  logoMarkAlt: "Знак Вольница",
};

export const IMAGES = {
  heroHome: {
    src: "/images/hero/kvadrocikl-gryaz-usadba-les.jpg",
    alt: "Всадник на чёрном квадроцикле в грязи на лесной тропе, на фоне освещённая усадьба",
  },
  heroRoutes: {
    src: "/images/routes/ekspediciya-gryaz-krutoj-podem.jpg",
    alt: "Два райдера на квадроциклах поднимаются по крутой грязевой тропе в лесу на закате",
  },
  heroFleet: {
    src: "/images/hero/ryad-kvadrociklov-u-usadby.jpg",
    alt: "Ряд грязных квадроциклов на каменистой тропе перед освещённой деревянной усадьбой",
  },
  heroTariffs: {
    src: "/images/routes/pamyatnik-obelisk-lesnaya-tropa.jpg",
    alt: "Вид с квадроцикла на лесную тропу к каменному обелиску на закате",
  },
  heroNight: {
    src: "/images/hero/nochnoj-kvest-farami-luna.jpg",
    alt: "Трое райдеров на квадроциклах ночью по грязной лесной тропе под полной луной",
  },
  heroManor: {
    src: "/images/hero/usadba-bereginya-ozero-vecher.jpg",
    alt: "Трёхэтажная деревянная усадьба у озера в сосновом лесу вечером с тёплой подсветкой",
  },
  heroFaq: {
    src: "/images/hero/gruppa-kvadrociklov-zakat-gory.jpg",
    alt: "Группа из четырёх райдеров на квадроциклах по горной лесной тропе на закате",
  },
  campfire: {
    src: "/images/gallery/kostyor-noch-kvadrocikly.jpg",
    alt: "Двое мужчин у костра в лесу ночью, позади два квадроцикла с включённым светом",
  },
} as const;

export const ROUTES: Route[] = [
  {
    id: "1",
    slug: "zelenoe-ozero",
    title: "Зелёное озеро",
    difficulty: "easy",
    difficultyLabel: "Лёгкий",
    duration: "45–60 мин",
    distance: "9–11 км",
    price: 5500,
    audience: "Новички, семьи, пары",
    description:
      "Вводный маршрут к озеру: спокойный темп, природа и первые впечатления от Вольницы.",
    progressOrder: 1,
    image: "/images/routes/ozero-sosny-zakat.jpg",
    imageAlt:
      "Спокойное озеро у подножия соснового склона на закате, тропа и сосны на переднем плане",
  },
  {
    id: "2",
    slug: "pamyatnik",
    title: "Памятник",
    difficulty: "medium",
    difficultyLabel: "Средний",
    duration: "1–1,5 ч",
    distance: "13–15 км",
    price: 7500,
    audience: "После базового опыта",
    description:
      "Больше километраж и рельеф. Ключевая точка — памятник и остановки на единой карте.",
    progressOrder: 2,
    image: "/images/routes/pamyatnik-obelisk-lesnaya-tropa.jpg",
    imageAlt:
      "Вид с квадроцикла по грязной лесной тропе к каменному обелиску-памятнику",
  },
  {
    id: "3",
    slug: "rodnik",
    title: "Родник",
    difficulty: "medium",
    difficultyLabel: "Средний+",
    duration: "1–2 ч",
    distance: "15–22 км",
    price: 10000,
    audience: "Уверенные водители",
    description:
      "Насыщенный маршрут к роднику: грязевые участки, смотровые и возврат на базу.",
    progressOrder: 3,
    image: "/images/routes/rodnik-moh-solnechnye-luchi.jpg",
    imageAlt:
      "Квадроцикл на каменистой лесной тропе у мшистых камней, солнечные лучи сквозь кроны",
  },
  {
    id: "4",
    slug: "ekspediciya",
    title: "Экспедиция",
    difficulty: "hard",
    difficultyLabel: "Сложный",
    duration: "уточняется",
    distance: "уточняется",
    price: 12000,
    audience: "Уровень «Вольный»",
    description:
      "Самая насыщенная дневная программа. Время и километраж — после финальных замеров.",
    progressOrder: 4,
    image: "/images/routes/ekspediciya-gryaz-krutoj-podem.jpg",
    imageAlt:
      "Два квадроцикла поднимаются по крутой грязевой тропе в хвойном лесу на закате",
  },
];

export const NIGHT_QUEST = {
  title: "Ночной квест",
  subtitle: "Приключение начинается с заката",
  price: 15000,
  priceNote: "ориентир за двоих",
  duration: "уточняется",
  distance: "уточняется",
  level: "Средний",
  group: "от 2 человек",
  description:
    "Флагманский ночной выезд: фары в тёмном лесу, таинственные локации и остановка у костра.",
  features: [
    "Мощный свет фар",
    "Таинственные локации",
    "Остановка у костра",
    "Незабываемые эмоции",
  ],
  awaits: [
    {
      title: "Ночные тропы",
      text: "Маршрут под светом фар и луны.",
      image: "/images/hero/nochnoj-kvest-farami-luna.jpg",
      imageAlt: "Квадроциклы ночью на лесной тропе с фарами",
    },
    {
      title: "Смотровые",
      text: "Паузы с видом на ночной лес.",
      image: "/images/gallery/sosna-prud-ryaska.jpg",
      imageAlt: "Вид на природу у воды",
    },
    {
      title: "Костёр",
      text: "Тёплая остановка в середине пути.",
      image: "/images/gallery/kostyor-noch-kvadrocikly.jpg",
      imageAlt: "Костёр у квадроциклов ночью",
    },
    {
      title: "Драйв",
      text: "Адреналин без лишней суеты.",
      image: "/images/routes/ekspediciya-gryaz-krutoj-podem.jpg",
      imageAlt: "Драйв на квадроциклах по грязевой тропе",
    },
  ],
};

export const FLEET: FleetItem[] = [
  {
    id: "1",
    name: "Капитан",
    role: "Грязь / сложные программы",
    color: "Чёрный",
    count: 1,
    seats: 2,
    drive: "4×4",
    image: "/images/fleet/chernyj-kvadrocikl-gryaz-zakat.jpg",
    imageAlt: "Чёрный квадроцикл в грязи на закате с включёнными фарами у леса",
  },
  {
    id: "2",
    name: "AODES 520L",
    role: "Грязь",
    color: "Красный",
    count: 1,
    seats: 2,
    drive: "4×4",
    image: "/images/fleet/krasnyj-kvadrocikl-lesnaya-tropa.jpg",
    imageAlt: "Красный квадроцикл на грязной лесной тропе в золотом свете",
  },
  {
    id: "3",
    name: "CFORCE 525L",
    role: "Грязь",
    color: "Оранжевый",
    count: 1,
    seats: 2,
    drive: "4×4",
    image: "/images/fleet/oranzhevyj-utv-les.jpg",
    imageAlt: "Оранжево-чёрный UTV на грязной тропе в тёмном лесу",
  },
  {
    id: "4",
    name: "CFORCE 520L",
    role: "Грязь / универсальный",
    color: "Чёрный",
    count: 1,
    seats: 2,
    drive: "4×4",
    image: "/images/fleet/chernyj-kvadrocikl-gryaz-zakat.jpg",
    imageAlt: "Чёрный квадроцикл в грязи на закате с включёнными фарами у леса",
  },
  {
    id: "5",
    name: "Hammer 200L",
    role: "Прогулочный",
    color: "Серый",
    count: 2,
    seats: 2,
    drive: "4×4",
    image: "/images/fleet/oranzhevyj-utv-les.jpg",
    imageAlt: "Оранжево-чёрный UTV на грязной тропе в тёмном лесу",
  },
  {
    id: "6",
    name: "Hammer 300L",
    role: "Прогулочный",
    color: "Синий",
    count: 2,
    seats: 2,
    drive: "4×4",
    image: "/images/fleet/krasnyj-kvadrocikl-lesnaya-tropa.jpg",
    imageAlt: "Красный квадроцикл на грязной лесной тропе в золотом свете",
  },
];

/** Живые фото с базы — fallback для галереи, пока CMS пуста */
export const GALLERY_SEED: GallerySeedItem[] = [
  {
    id: "seed-1",
    title: "Два квадроцикла у пруда",
    category: "atv",
    src: "/images/gallery/dva-kvadrocikla-u-pruda.jpg",
    alt: "Чёрный и красный квадроциклы на травяном склоне у пруда с лесом на фоне",
  },
  {
    id: "seed-2",
    title: "Райдеры у пруда",
    category: "atv",
    src: "/images/gallery/muzhchiny-kvadrocikly-u-pruda.jpg",
    alt: "Двое мужчин с квадроциклами на берегу пруда на фоне зелёного леса",
  },
  {
    id: "seed-3",
    title: "Красный квадроцикл в траве",
    category: "atv",
    src: "/images/gallery/krasnyj-kvadrocikl-vysokaya-trava.jpg",
    alt: "Человек на красном квадроцикле едет через высокую траву к лесу",
  },
  {
    id: "seed-4",
    title: "Лесная тропа",
    category: "routes",
    src: "/images/gallery/tropa-berezy-listva.jpg",
    alt: "Узкая лесная тропа среди берёз и листвы в солнечный день",
  },
  {
    id: "seed-5",
    title: "Пруд с ряской",
    category: "nature",
    src: "/images/gallery/prud-ryaska-otrazhenie-lesa.jpg",
    alt: "Тихий пруд с зелёной ряской, отражением леса и ясным голубым небом",
  },
  {
    id: "seed-6",
    title: "Сосна у пруда",
    category: "nature",
    src: "/images/gallery/sosna-prud-ryaska.jpg",
    alt: "Молодая сосна на переднем плане и пруд с ряской на фоне лесистых холмов",
  },
  {
    id: "seed-7",
    title: "Пикник в соснах",
    category: "nature",
    src: "/images/gallery/les-piknik-stol-sosny.jpg",
    alt: "Солнечная лесная поляна с соснами, берёзами и деревянным столом для пикника",
  },
  {
    id: "seed-8",
    title: "Скамейка в лесу",
    category: "manor",
    src: "/images/gallery/les-skamejka-skvorechniki.jpg",
    alt: "Рустикальная деревянная скамейка в сосново-берёзовом лесу со скворечниками",
  },
  {
    id: "seed-9",
    title: "Поляна сосен и берёз",
    category: "nature",
    src: "/images/gallery/poliana-sosny-berezy.jpg",
    alt: "Солнечная поляна в лесу: высокие сосны, белые стволы берёз и деревянная лавка",
  },
  {
    id: "seed-10",
    title: "Костёр у квадроциклов",
    category: "night",
    src: "/images/gallery/kostyor-noch-kvadrocikly.jpg",
    alt: "Двое мужчин у костра в лесу ночью, позади два квадроцикла с включённым светом",
  },
];

export const FAQ_ITEMS = [
  {
    q: "Нужны ли права на квадроцикл?",
    a: "Для сопровождённых маршрутов с инструктором отдельная категория прав обычно не требуется. Точные условия подскажут при бронировании.",
    icon: "id" as const,
  },
  {
    q: "С какого возраста можно кататься?",
    a: "Водитель — с возраста, установленного правилами базы; пассажир — по согласованию. Детей берём только с соблюдением безопасности и экипировки.",
    icon: "users" as const,
  },
  {
    q: "Нужен ли опыт вождения?",
    a: "Нет. Первый маршрут — «Зелёное озеро» — рассчитан на новичков. Перед выездом проводим инструктаж.",
    icon: "grad" as const,
  },
  {
    q: "Что входит в тариф?",
    a: "Маршрут с инструктором, техника, базовый комплект экипировки и топливо в рамках программы. Уточняйте состав выбранного тарифа.",
    icon: "list" as const,
  },
  {
    q: "Какая экипировка выдаётся?",
    a: "Шлем, очки, перчатки и защита по наличию размеров. Рекомендуем закрытую обувь и удобную одежду.",
    icon: "helmet" as const,
  },
  {
    q: "Что если дождь?",
    a: "Лёгкий дождь — не отмена. При опасной погоде перенесём выезд. Свяжитесь с нами заранее.",
    icon: "cloud" as const,
  },
  {
    q: "Можно ли с пассажиром?",
    a: "На двухместной технике — да, по согласованию. Цена указана за клиентский квадроцикл.",
    icon: "users" as const,
  },
  {
    q: "Есть ли залог?",
    a: "Условия залога сообщаем при подтверждении брони. Фиксируем состояние техники до и после выезда.",
    icon: "wallet" as const,
  },
  {
    q: "Как отменить или перенести бронь?",
    a: "Напишите или позвоните как можно раньше. Перенос согласуем по свободным слотам.",
    icon: "calendar" as const,
  },
  {
    q: "Как проходят ночные выезды?",
    a: "Отдельная программа с закатом. Подробности — на странице «Ночной квест» и при бронировании.",
    icon: "moon" as const,
  },
  {
    q: "Что если техника сломается?",
    a: "На маршруте — сопровождение инструктора. При неисправности организуем замену или возврат на базу.",
    icon: "wrench" as const,
  },
];

export const GALLERY_CATEGORIES = [
  { id: "all", label: "Все фото" },
  { id: "atv", label: "Квадроциклы" },
  { id: "routes", label: "Маршруты" },
  { id: "nature", label: "Природа" },
  { id: "night", label: "Ночные" },
  { id: "manor", label: "Усадьба" },
] as const;

export function formatPrice(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}
