// Таблица сцен: тайминг и тексты на экране. Правь здесь — всё остальное подтянется.
// 30 fps, 25 сек = 750 кадров. Сумма длительностей должна быть ровно 25 сек.
// Текст для озвучки по этим же сценам — в VOICEOVER.md.

export type BlockKey = 'hero' | 'services' | 'trust' | 'form' | 'footer';
export type Device = 'desktop' | 'mobile';

export type SceneDef =
  | { kind: 'intro'; sec: number; title: string; sub: string }
  | {
      kind: 'shot';
      sec: number;
      block: BlockKey;
      devices: Device[];
      label: string;
      title: string;
      sub: string;
      // Подпись, если блока на сайте нет и взят ближайший по смыслу.
      fallback: { label: string; title: string; sub: string };
    }
  | { kind: 'summary'; sec: number; title: string; points: string[] }
  | { kind: 'cta'; sec: number; title: string; handle: string; sub: string };

export const FPS = 30;

// Что показывать в адресной строке «браузера» на десктоп-сценах.
export const SITE_LABEL = 'теймур · сайты и реклама';

export const SCENES: SceneDef[] = [
  { kind: 'intro', sec: 2.5, title: 'Разбор сайта', sub: 'сайты + реклама в одних руках' },
  {
    kind: 'shot', sec: 2.5, block: 'hero', devices: ['desktop'],
    label: 'Первый экран', title: 'Сразу ясно, что предлагают', sub: 'сайты и реклама · заявки в Telegram',
    fallback: { label: 'Первый экран', title: 'Сразу ясно, что предлагают', sub: 'сайты и реклама · заявки в Telegram' },
  },
  {
    kind: 'shot', sec: 2.5, block: 'hero', devices: ['mobile'],
    label: 'Мобильная версия', title: 'На телефоне — так же цепко', sub: '390 px, ничего не съехало',
    fallback: { label: 'Мобильная версия', title: 'На телефоне — так же цепко', sub: '390 px, ничего не съехало' },
  },
  {
    kind: 'shot', sec: 3.5, block: 'services', devices: ['desktop', 'mobile'],
    label: 'Услуги', title: '8 направлений — и всё', sub: 'нет нужного? скажет сразу',
    fallback: { label: 'Что внутри', title: 'Понятно, за что платишь', sub: 'всё списком на одном экране' },
  },
  {
    kind: 'shot', sec: 3.5, block: 'trust', devices: ['mobile', 'desktop'],
    label: 'Готовые работы', title: 'Живые сайты вместо обещаний', sub: '4 проекта — открываются по ссылке',
    fallback: { label: 'Почему мне', title: 'Доверие до первого вопроса', sub: 'опыт и результаты на виду' },
  },
  {
    kind: 'shot', sec: 3, block: 'form', devices: ['desktop'],
    label: 'Заявка', title: 'Одно поле — и ты в Telegram', sub: 'телефон или ник, без анкет',
    fallback: { label: 'Связаться', title: 'Написать — в один тап', sub: 'контакт без лишних шагов' },
  },
  {
    kind: 'shot', sec: 2, block: 'footer', devices: ['mobile'],
    label: 'Низ сайта', title: 'Внизу — огромное «ЗАЯВКИ»', sub: 'услуги · работы · связь',
    fallback: { label: 'Низ страницы', title: 'Аккуратно до последнего пикселя', sub: 'навигация и контакты' },
  },
  {
    kind: 'summary', sec: 2.5, title: 'Итого',
    points: ['понятно с первого экрана', 'работы — живыми ссылками', 'заявка сразу в Telegram'],
  },
  { kind: 'cta', sec: 3, title: 'Хочешь так же?', handle: '@prosto_vibecoding', sub: 'подписывайся — разбираю сайты' },
];

export const sceneFrames = (s: SceneDef) => Math.round(s.sec * FPS);
export const TOTAL_FRAMES = SCENES.reduce((n, s) => n + sceneFrames(s), 0);
