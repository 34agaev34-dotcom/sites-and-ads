// Снимает olegi-text.ru через Playwright: десктоп 1440x900 и мобайл 390x844@3x.
// Блоки: hero, services, trust, form, footer. Если блока нет — берёт ближайший
// по смыслу и пишет это в манифест, чтобы видео поправило подписи сцен.
// Контакты (телефоны, почта, @ники, QR) блюрятся до снимка.
//
//   npm run capture                       # https://olegi-text.ru
//   SITE_URL=http://localhost:8080 npm run capture
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE_URL = process.env.SITE_URL ?? 'https://olegi-text.ru';
const OUT = path.join(root, 'public', 'shots');

const DEVICES = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  mobile: {
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  },
};

// Ключевые слова: сначала «прямые», потом ближайшие по смыслу (fallback).
const BLOCKS = {
  services: {
    primary: /услуг|что (я )?делаю|чем (могу )?помо|что предлага|services/i,
    fallback: /тариф|цен|прайс|стоимост|пакет|формат|направлени|возможност/i,
  },
  trust: {
    primary: /кейс|отзыв|о себе|обо мне|портфолио|works|cases|reviews|about/i,
    fallback: /работ|результат|клиент|почему|доверя|опыт|гарант|цифр|автор|кто я/i,
  },
  form: {
    primary: /заявк|оставьте|обсудить проект|бриф|lead|order/i,
    fallback: /связ|контакт|напиш|консультац|начать|давайте|вопрос/i,
  },
};

const FREEZE_CSS = `
  *,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;
    transition:none!important;scroll-behavior:auto!important;caret-color:transparent!important}
  [class*="cookie" i],[id*="cookie" i],[class*="preloader" i],[id*="preloader" i],
  [class*="jivo" i],[id*="jivo" i],[class*="widget-chat" i]{display:none!important}
`;

async function prepare(page) {
  await page.goto(SITE_URL, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.addStyleTag({ content: FREEZE_CSS });
  // Прокрутка до конца и обратно — чтобы сработали lazy-load и reveal-анимации.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.6;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(600);
  // Принудительно показываем всё, что прячется до скролла.
  await page.addStyleTag({
    content: `[class*="reveal" i],[class*="fade" i],[data-aos],[class*="animate" i]{opacity:1!important;transform:none!important;visibility:visible!important}`,
  });
  return blurContacts(page);
}

async function blurContacts(page) {
  return page.evaluate(() => {
    const PHONE = /(?:\+7|8)[\s\-()]*\d{3}[\s\-()]*\d{3}[\s\-]*\d{2}[\s\-]*\d{2}/;
    const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/;
    const HANDLE = /(^|\s)@[A-Za-z0-9_]{4,}/;
    const LINK = /(t\.me|wa\.me|vk\.com|instagram\.com)\/[\w.]+/i;
    const isContact = (s) => PHONE.test(s) || EMAIL.test(s) || HANDLE.test(s) || LINK.test(s);
    const blur = (el) => {
      el.style.setProperty('filter', 'blur(9px)', 'important');
      el.setAttribute('data-blurred', '');
    };
    let count = 0;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const hits = [];
    while (walker.nextNode()) {
      const n = walker.currentNode;
      if (n.textContent && isContact(n.textContent)) hits.push(n);
    }
    for (const n of hits) {
      const span = document.createElement('span');
      span.style.display = 'inline-block';
      n.parentNode.replaceChild(span, n);
      span.appendChild(n);
      blur(span);
      count++;
    }
    for (const a of document.querySelectorAll('a[href^="tel:"],a[href^="mailto:"]')) {
      if (!a.hasAttribute('data-blurred')) { blur(a); count++; }
    }
    for (const el of document.querySelectorAll('input,textarea')) {
      if (isContact(el.value || '')) { blur(el); count++; }
    }
    for (const img of document.querySelectorAll('img,svg,canvas')) {
      const hint = `${img.getAttribute('src') ?? ''} ${img.getAttribute('alt') ?? ''} ${img.getAttribute('class') ?? ''}`;
      if (/qr/i.test(hint)) { blur(img); count++; }
    }
    return count;
  });
}

// Возвращает { y, heading, matchedBy } для блока или null.
async function locate(page, key, taken) {
  if (key === 'hero') return { y: 0, heading: 'Первый экран', matchedBy: 'primary' };
  if (key === 'footer') {
    // Всегда самый низ страницы: форма часто живёт в верхней части футера.
    return page.evaluate(() => ({
      y: Math.max(0, document.documentElement.scrollHeight - window.innerHeight),
      heading: document.querySelector('footer, [class*="footer" i]') ? 'Футер' : 'Низ страницы',
      matchedBy: document.querySelector('footer, [class*="footer" i]') ? 'primary' : 'fallback',
    }));
  }
  const { primary, fallback } = BLOCKS[key];
  return page.evaluate(
    ({ key, primary, fallback, taken }) => {
      const top = (el) => el.getBoundingClientRect().top + scrollY;
      const sections = [...document.querySelectorAll('section, footer, [class*="section" i]')]
        .filter((s) => s.getBoundingClientRect().height > 120 && top(s) > 200 && !taken.includes(Math.round(top(s))));
      const headingOf = (s) =>
        (s.querySelector('h2,h3')?.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 60);
      // Только короткие сигналы: id, aria-label, класс и заголовок — не весь текст секции.
      const signal = (s) => `${s.id} ${s.getAttribute('aria-label') ?? ''} ${s.className} ${headingOf(s)}`;
      const pick = (re) => sections.find((s) => re.test(signal(s)));
      let el = null;
      let matchedBy = 'primary';
      if (key === 'form') {
        // Настоящая форма с полями важнее любых слов.
        const visible = (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
        const fields = (f) => [...f.querySelectorAll('input:not([type=hidden]),textarea')].filter(visible).length;
        const forms = [...document.querySelectorAll('form')].filter((f) => visible(f) && fields(f) > 0 && top(f) > 200);
        const form = forms.sort((a, b) => fields(b) - fields(a))[0];
        el = form ? (form.closest('section, footer') ?? form) : null;
      }
      el ??= pick(new RegExp(primary, 'i'));
      if (!el) { el = pick(new RegExp(fallback, 'i')); matchedBy = 'fallback'; }
      if (!el) return null;
      return { y: Math.max(0, top(el) - 24), heading: headingOf(el) || el.getAttribute('aria-label') || null, matchedBy, key: Math.round(top(el)) };
    },
    { key, primary: primary.source, fallback: fallback.source, taken },
  );
}

const browser = await chromium.launch(
  process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {},
);
const manifest = { url: SITE_URL, capturedAt: new Date().toISOString(), blurred: {}, shots: {} };

for (const [device, opts] of Object.entries(DEVICES)) {
  const ctx = await browser.newContext({ ...opts, locale: 'ru-RU', reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  manifest.blurred[device] = await prepare(page);
  await mkdir(path.join(OUT, device), { recursive: true });

  const taken = [];
  for (const key of ['hero', 'services', 'trust', 'form', 'footer']) {
    const found = await locate(page, key, taken);
    if (found?.key !== undefined) taken.push(found.key);
    const entry = (manifest.shots[key] ??= {});
    if (!found) {
      entry[device] = null;
      console.warn(`[${device}] ${key}: блок не найден`);
      continue;
    }
    await page.evaluate((y) => window.scrollTo(0, y), found.y);
    await page.waitForTimeout(500);
    // Повторный блюр: lazy-контент мог дорисоваться после скролла.
    await blurContacts(page);
    const file = `shots/${device}/${key}.png`;
    await page.screenshot({ path: path.join(root, 'public', file) });
    entry[device] = { file, heading: found.heading, matchedBy: found.matchedBy };
    console.log(`[${device}] ${key}: ${found.matchedBy} — «${found.heading ?? '—'}»`);
  }
  await ctx.close();
}
await browser.close();

await writeFile(path.join(root, 'src', 'shots-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Готово. Заблюрено контактов: ${JSON.stringify(manifest.blurred)}`);
console.log('Проверь public/shots/* глазами — блюр эвристический.');
