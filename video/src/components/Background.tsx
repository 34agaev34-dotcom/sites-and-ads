import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C } from '../theme';

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const gx = 50 + Math.sin(frame / 90) * 18;
  const gy = 32 + Math.cos(frame / 110) * 10;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${C.line} 2px, transparent 2px)`,
          backgroundSize: '48px 48px',
          opacity: 0.7,
        }}
      />
      <AbsoluteFill
        style={{ background: `radial-gradient(900px 700px at ${gx}% ${gy}%, rgba(46,232,138,0.10), transparent 70%)` }}
      />
      <AbsoluteFill style={{ background: 'radial-gradient(120% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.6))' }} />
    </AbsoluteFill>
  );
};

// Прогресс по сценам — тонкие сегменты сверху.
export const Progress: React.FC<{ starts: number[]; total: number }> = ({ starts, total }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', top: 64, left: 72, right: 72, display: 'flex', gap: 10 }}>
      {starts.map((s, i) => {
        const end = starts[i + 1] ?? total;
        const p = Math.min(1, Math.max(0, (frame - s) / (end - s)));
        return (
          <div key={i} style={{ flex: 1, height: 6, background: C.line, overflow: 'hidden' }}>
            <div style={{ width: `${p * 100}%`, height: '100%', background: C.accent }} />
          </div>
        );
      })}
    </div>
  );
};
