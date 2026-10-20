// Таблица сцен: тайминг и тексты на экране. Правь здесь — всё остальное подтянется.
// 30 fps, 25 сек = 750 кадров. Сумма длительностей должна быть ровно 25 сек.
//
// ЧЕРНОВИК: в задаче таблица не была вставлена, тексты ниже — заглушка по брифу.
// Замени title/sub на тексты из своей таблицы.

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

export const SCENES: SceneDef[] = [
  { kind: 'intro', sec: 2.5, title: 'Сайт за ~3 дня', sub: 'olegi-text.ru · собран в Claude Code' },
  {
    kind: 'shot', sec: 2.5, block: 'hero', devices: ['desktop'],
    label: 'Первый экран', title: 'Сразу ясно, что и для кого', sub: 'оффер · кнопка · без шума',
    fallback: { label: 'Первый экран', title: 'Сразу ясно, что и для кого', sub: 'оффер · кнопка · без шума' },
  },
  {
    kind: 'shot', sec: 2.5, block: 'hero', devices: ['mobile'],
    label: 'Мобильная версия', title: 'На телефоне — не хуже', sub: '390 px, всё читается',
    fallback: { label: 'Мобильная версия', title: 'На телефоне — не хуже', sub: '390 px, всё читается' },
  },
  {
    kind: 'shot', sec: 3.5, block: 'services', devices: ['desktop', 'mobile'],
    label: 'Услуги', title: 'Коротко и по делу', sub: 'каждая услуга — в одну строку',
    fallback: { label: 'Что внутри', title: 'Понятно, за что платишь', sub: 'форматы и цены на виду' },
  },
  {
    kind: 'shot', sec: 3.5, block: 'trust', devices: ['mobile', 'desktop'],
    label: 'Кейсы и отзывы', title: 'Доверие до первого вопроса', sub: 'живые примеры работ',
    fallback: { label: 'Почему мне', title: 'Доверие до первого вопроса', sub: 'опыт и результаты на виду' },
  },
  {
    kind: 'shot', sec: 3, block: 'form', devices: ['desktop'],
    label: 'Заявка', title: 'Пара полей — и готово', sub: 'заявка без лишних шагов',
    fallback: { label: 'Связаться', title: 'Написать — в один тап', sub: 'контакт без лишних шагов' },
  },
  {
    kind: 'shot', sec: 2, block: 'footer', devices: ['mobile'],
    label: 'Футер', title: 'Даже подвал аккуратный', sub: 'навигация и контакты',
    fallback: { label: 'Низ страницы', title: 'Аккуратно до последнего пикселя', sub: 'навигация и контакты' },
  },
  {
    kind: 'summary', sec: 2.5, title: 'Итого',
    points: ['~3 дня от идеи до сайта', 'десктоп + мобайл', 'собрано в Claude Code'],
  },
  { kind: 'cta', sec: 3, title: 'Хочешь так же?', handle: '@prosto_vibecoding', sub: 'подписывайся — разбираю сайты' },
];

export const sceneFrames = (s: SceneDef) => Math.round(s.sec * FPS);
export const TOTAL_FRAMES = SCENES.reduce((n, s) => n + sceneFrames(s), 0);
