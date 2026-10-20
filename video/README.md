# Ролик-разбор сайта (Remotion)

Вертикаль 1080×1920, 25 сек, 30 fps. Тёмный фон, зелёный акцент, пиксельный робот, 9 сцен.

Сейчас в `public/shots` — сайт из этого репозитория (`../index.html`): olegi-text.ru из облачной
среды был недоступен. Чтобы переснять другой сайт — `SITE_URL=https://... npm run capture`,
затем поправь тексты в `src/scenes.ts`, `SITE_LABEL` и `VOICEOVER.md`.

Снять сайт из репозитория локально:

```bash
(cd .. && python3 -m http.server 8765) &
SITE_URL=http://localhost:8765/ npm run capture
```

## Запуск

```bash
cd video
npm install
npx playwright install chromium   # если браузера Playwright ещё нет
npm run capture                   # скрины olegi-text.ru → public/shots + src/shots-manifest.json
npm run studio                    # предпросмотр
npm run render                    # → out/olegi-text-review.mp4
```

Текст для озвучки — `VOICEOVER.md`.

## Что где

- `src/scenes.ts` — **таблица сцен**: длительность, метка, заголовок (slide-up), подзаголовок (typewriter)
  и запасные подписи на случай, если блока на сайте нет. Сумма `sec` = 25.
- `scripts/capture.mjs` — Playwright: десктоп 1440×900 и мобайл 390×844 @3x; блоки hero, услуги,
  доверие (кейсы/отзывы/о себе), форма, футер. Ищет по id/aria-label/классу/заголовку h2–h3,
  потом по ближайшим по смыслу словам; что нашёл и как — пишет в манифест и в консоль.
  Сцена с блоком, найденным «по смыслу», берёт подписи из `fallback`.
- Контакты (телефоны, e-mail, @ники, ссылки t.me/wa.me, tel:/mailto:, QR) блюрятся прямо на странице
  перед снимком. Эвристика — **посмотри скрины глазами** перед рендером.
- `src/components/PixelRobot.tsx` — маскот, сетка пикселей в массиве `BODY`: можно перерисовать под своего.
- Без скринов вместо них рисуются заглушки «нет скрина».
