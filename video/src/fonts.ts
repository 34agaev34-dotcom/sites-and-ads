import { continueRender, delayRender, staticFile } from 'remotion';

const faces: [string, string, string][] = [
  ['Inter Video', 'fonts/Inter-Medium.otf', '500'],
  ['Inter Video', 'fonts/Inter-Bold.otf', '700'],
  ['Mono Video', 'fonts/DejaVuSansMono-Bold.ttf', '700'],
];

let loaded = false;
export const loadFonts = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const handle = delayRender('fonts');
  Promise.all(
    faces.map(([family, file, weight]) =>
      new FontFace(family, `url(${staticFile(file)})`, { weight }).load().then((f) => document.fonts.add(f)),
    ),
  ).then(() => continueRender(handle));
};
