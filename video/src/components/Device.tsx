import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import type { Shot } from '../manifest';
import { SITE_LABEL } from '../scenes';
import { C, F } from '../theme';

// Скрин с медленным «наездом» камеры; без скрина — честная заглушка.
const ShotImage: React.FC<{ shot: Shot; w: number; h: number; drift: number }> = ({ shot, w, h, drift }) => {
  const frame = useCurrentFrame();
  const scale = 1 + frame * 0.0006;
  const y = -Math.min(drift, frame * 0.35);
  if (!shot) {
    return (
      <div
        style={{
          width: w, height: h, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: C.bg2, color: C.dim, fontFamily: F.mono, fontWeight: 700, fontSize: 26,
          textAlign: 'center', padding: 24, border: `3px dashed ${C.line}`, boxSizing: 'border-box',
        }}
      >
        нет скрина{'\n'}npm run capture
      </div>
    );
  }
  return (
    <div style={{ width: w, height: h, overflow: 'hidden', background: '#fff' }}>
      <Img
        src={staticFile(shot.file)}
        style={{ width: w, transform: `translateY(${y}px) scale(${scale})`, transformOrigin: '50% 0%' }}
      />
    </div>
  );
};

const useEnter = (delay: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 18, mass: 0.8 } });
};

// 1440x900 → 960x600 в окне браузера.
export const Browser: React.FC<{ shot: Shot; width?: number; delay?: number; url?: string }> = ({
  shot, width = 960, delay = 0, url = SITE_LABEL,
}) => {
  const p = useEnter(delay);
  const h = Math.round((width * 900) / 1440);
  return (
    <div
      style={{
        width, borderRadius: 18, overflow: 'hidden', background: C.bg2,
        border: `2px solid ${C.line}`, boxShadow: `0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px ${C.accentDim}`,
        transform: `translateY(${interpolate(p, [0, 1], [140, 0])}px)`, opacity: p,
      }}
    >
      <div style={{ height: 52, display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px' }}>
        {['#3a423e', '#3a423e', C.accent].map((c, i) => (
          <span key={i} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />
        ))}
        <span
          style={{
            marginLeft: 16, flex: 1, height: 30, borderRadius: 8, background: C.bg, color: C.dim,
            fontFamily: F.mono, fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', paddingLeft: 14,
          }}
        >
          {url}
        </span>
      </div>
      <ShotImage shot={shot} w={width} h={h} drift={0} />
    </div>
  );
};

// 390x844@3 → телефон шириной 440.
export const Phone: React.FC<{ shot: Shot; width?: number; delay?: number; height?: number }> = ({
  shot, width = 440, delay = 0, height,
}) => {
  const p = useEnter(delay);
  const full = Math.round((width * 844) / 390);
  // Экран не выше самого скрина, иначе снизу белая полоса.
  const h = Math.min(height ?? full, full);
  return (
    <div
      style={{
        padding: 14, borderRadius: 64, background: '#1a201d', border: `2px solid ${C.line}`,
        boxShadow: `0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px ${C.accentDim}`,
        transform: `translateY(${interpolate(p, [0, 1], [160, 0])}px)`, opacity: p,
      }}
    >
      <div style={{ borderRadius: 50, overflow: 'hidden', position: 'relative' }}>
        <ShotImage shot={shot} w={width} h={h} drift={Math.max(0, full - h)} />
        <div
          style={{
            position: 'absolute', top: 12, left: '50%', width: 120, height: 34, marginLeft: -60,
            borderRadius: 20, background: '#000',
          }}
        />
      </div>
    </div>
  );
};
