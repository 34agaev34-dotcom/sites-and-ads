import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, F } from '../theme';

// Слова выезжают снизу по очереди.
export const SlideUp: React.FC<{
  text: string;
  delay?: number;
  size?: number;
  color?: string;
  weight?: number;
  align?: 'left' | 'center';
}> = ({ text, delay = 0, size = 84, color = C.text, weight = 700, align = 'left' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        fontFamily: F.sans,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.08,
        letterSpacing: '-0.03em',
        color,
        textAlign: align,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        columnGap: size * 0.26,
      }}
    >
      {text.split(' ').map((w, i) => {
        const p = spring({ frame: frame - delay - i * 3, fps, config: { damping: 200, mass: 0.6 } });
        return (
          <span key={i} style={{ display: 'inline-block', overflow: 'hidden', paddingBottom: size * 0.12 }}>
            <span style={{ display: 'inline-block', transform: `translateY(${(1 - p) * 110}%)`, opacity: p }}>{w}</span>
          </span>
        );
      })}
    </div>
  );
};

// Печатная машинка с мигающей кареткой.
export const Typewriter: React.FC<{
  text: string;
  delay?: number;
  cps?: number;
  size?: number;
  color?: string;
  align?: 'left' | 'center';
}> = ({ text, delay = 0, cps = 28, size = 38, color = C.dim, align = 'left' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = Math.max(0, Math.floor(((frame - delay) / fps) * cps));
  const done = n >= text.length;
  const caretOn = !done || Math.floor(frame / 12) % 2 === 0;
  return (
    <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: size, color, textAlign: align, whiteSpace: 'pre-wrap' }}>
      {text.slice(0, n)}
      <span style={{ color: C.accent, opacity: frame < delay ? 0 : caretOn ? 1 : 0 }}>▌</span>
    </div>
  );
};

// «03 / Услуги» — моно-метка сцены.
export const Label: React.FC<{ index: number; text: string; delay?: number }> = ({ index, text, delay = 0 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame - delay, [0, 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const w = interpolate(frame - delay, [0, 14], [0, 72], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 22, opacity: o, fontFamily: F.mono, fontWeight: 700, fontSize: 30, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
      <span style={{ color: C.accent }}>{String(index).padStart(2, '0')}</span>
      <span style={{ width: w, height: 3, background: C.accent }} />
      <span style={{ color: C.text }}>{text}</span>
    </div>
  );
};
