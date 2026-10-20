import { useCurrentFrame } from 'remotion';
import { C } from '../theme';

// Пиксельный робот-маскот. W — корпус, D — экран лица, E — глаза, M — рот, A — акцент.
const BODY = [
  '......A......',
  '......W......',
  '..WWWWWWWWW..',
  '.WDDDDDDDDDW.',
  '.WDEEDDDEEDW.',
  '.WDEEDDDEEDW.',
  '.WDDDDDDDDDW.',
  '.WDDMMMMMDDW.',
  '.WDDDDDDDDDW.',
  '..WWWWWWWWW..',
  '....WWWWW....',
  '..WWWWWWWWW..',
  'W.WDDAADDDW.W',
  'W.WDDDDDDDW.W',
  '..WWWWWWWWW..',
  '...WW...WW...',
];

const COLORS: Record<string, string> = {
  W: '#dfe6e2',
  D: '#141917',
  E: C.accent,
  M: C.accent,
  A: C.accent,
};

type Props = { size?: number; wave?: boolean; talk?: boolean };

export const PixelRobot: React.FC<Props> = ({ size = 260, wave = false, talk = false }) => {
  const frame = useCurrentFrame();
  const px = size / BODY[0].length;
  const blink = frame % 75 > 70;
  const mouthOpen = talk && Math.floor(frame / 4) % 2 === 0;
  const waveUp = wave && Math.floor(frame / 8) % 2 === 0;
  const bob = Math.round(Math.sin(frame / 9) * 1.5) * px * 0.5;
  const antennaOn = Math.floor(frame / 15) % 2 === 0;

  const rects: JSX.Element[] = [];
  BODY.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === '.') return;
      // Правая рука машет: переносим её на две клетки вверх.
      if (waveUp && x === 12 && (y === 12 || y === 13)) return;
      let fill = COLORS[ch];
      if (ch === 'E' && blink && y === 4) fill = COLORS.D;
      if (ch === 'E' && blink && y === 5) fill = C.accent;
      if (ch === 'M' && mouthOpen && (x === 4 || x === 8)) fill = COLORS.D;
      if (ch === 'A' && y === 0 && !antennaOn) fill = '#1d6b45';
      rects.push(<rect key={`${x}-${y}`} x={x * px} y={y * px} width={px + 0.5} height={px + 0.5} fill={fill} />);
    });
  });
  if (waveUp) {
    rects.push(<rect key="w1" x={12 * px} y={10 * px} width={px + 0.5} height={px + 0.5} fill={COLORS.W} />);
    rects.push(<rect key="w2" x={12 * px} y={11 * px} width={px + 0.5} height={px + 0.5} fill={COLORS.W} />);
  }

  return (
    <svg
      width={size}
      height={px * BODY.length}
      style={{ transform: `translateY(${bob}px)`, shapeRendering: 'crispEdges', overflow: 'visible' }}
    >
      {/* Пиксельная тень-свечение */}
      <rect x={2 * px} y={(BODY.length + 0.6) * px} width={9 * px} height={px * 0.6} fill={C.accentDim} />
      {rects}
    </svg>
  );
};
