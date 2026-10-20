import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Browser, Phone } from '../components/Device';
import { PixelRobot } from '../components/PixelRobot';
import { Label, SlideUp, Typewriter } from '../components/Text';
import { getShot } from '../manifest';
import type { SceneDef } from '../scenes';
import { C, F } from '../theme';

// Мягкий вход/выход сцены.
const Frame: React.FC<{ duration: number; children: React.ReactNode }> = ({ duration, children }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 6, duration - 6, duration], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

const Copy: React.FC<{ index: number; label: string; title: string; sub: string }> = ({ index, label, title, sub }) => (
  <div style={{ position: 'absolute', top: 170, left: 72, right: 72, display: 'flex', flexDirection: 'column', gap: 34 }}>
    <Label index={index} text={label} />
    <SlideUp text={title} delay={4} size={92} />
    <Typewriter text={sub} delay={16} />
  </div>
);

const CornerRobot: React.FC = () => (
  <div style={{ position: 'absolute', left: 64, bottom: 90 }}>
    <PixelRobot size={130} talk />
  </div>
);

type Shot = Extract<SceneDef, { kind: 'shot' }>;

export const ShotScene: React.FC<{ scene: Shot; index: number; duration: number }> = ({ scene, index, duration }) => {
  const shots = scene.devices.map((d) => getShot(scene.block, d));
  // Блока нет или взят ближайший по смыслу — подписи из fallback.
  const useFallback = shots.some((s) => s?.matchedBy === 'fallback' || s === null);
  const copy = useFallback ? scene.fallback : scene;
  const [first, second] = scene.devices;

  return (
    <Frame duration={duration}>
      <Copy index={index} label={copy.label} title={copy.title} sub={copy.sub} />
      <AbsoluteFill style={{ top: 640, alignItems: 'center' }}>
        {scene.devices.length === 1 && first === 'desktop' && (
          <div style={{ marginTop: 120 }}><Browser shot={shots[0]} delay={6} /></div>
        )}
        {scene.devices.length === 1 && first === 'mobile' && <Phone shot={shots[0]} width={490} delay={6} />}
        {scene.devices.length === 2 && (
          <div style={{ position: 'relative', width: 960, height: 1200 }}>
            <div style={{ position: 'absolute', left: first === 'desktop' ? 0 : 60, top: first === 'desktop' ? 40 : 140 }}>
              {first === 'desktop' ? <Browser shot={shots[0]} width={900} delay={6} /> : <Browser shot={shots[1]} width={900} delay={14} />}
            </div>
            <div style={{ position: 'absolute', right: first === 'desktop' ? 0 : 'auto', left: first === 'desktop' ? 'auto' : 0, top: first === 'desktop' ? 260 : 0 }}>
              {second === 'mobile' ? <Phone shot={shots[1]} width={360} height={720} delay={14} /> : <Phone shot={shots[0]} width={360} height={720} delay={6} />}
            </div>
          </div>
        )}
      </AbsoluteFill>
      <CornerRobot />
    </Frame>
  );
};

export const IntroScene: React.FC<{ scene: Extract<SceneDef, { kind: 'intro' }>; duration: number }> = ({ scene, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 12, mass: 0.7 } });
  return (
    <Frame duration={duration}>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', gap: 70, flexDirection: 'column' }}>
        <div style={{ transform: `scale(${pop})` }}>
          <PixelRobot size={360} wave />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 34, alignItems: 'center', padding: '0 72px' }}>
          <SlideUp text={scene.title} delay={8} size={120} align="center" />
          <Typewriter text={scene.sub} delay={20} size={36} align="center" />
        </div>
      </AbsoluteFill>
    </Frame>
  );
};

export const SummaryScene: React.FC<{ scene: Extract<SceneDef, { kind: 'summary' }>; duration: number }> = ({ scene, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Frame duration={duration}>
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 90px', gap: 60 }}>
        <SlideUp text={scene.title} size={130} color={C.accent} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {scene.points.map((pt, i) => {
            const p = spring({ frame: frame - 10 - i * 8, fps, config: { damping: 200 } });
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 30, opacity: p, transform: `translateY(${(1 - p) * 60}px)` }}>
                <span style={{ width: 54, height: 54, background: C.accent, color: C.bg, fontFamily: F.mono, fontWeight: 700, fontSize: 38, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>
                <span style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 62, color: C.text, letterSpacing: '-0.02em' }}>{pt}</span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <div style={{ position: 'absolute', right: 80, bottom: 120 }}>
        <PixelRobot size={200} talk />
      </div>
    </Frame>
  );
};

export const CtaScene: React.FC<{ scene: Extract<SceneDef, { kind: 'cta' }>; duration: number }> = ({ scene, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pill = spring({ frame: frame - 14, fps, config: { damping: 14 } });
  return (
    <Frame duration={duration + 6}>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 64 }}>
        <PixelRobot size={320} wave />
        <SlideUp text={scene.title} delay={4} size={110} align="center" />
        <div
          style={{
            transform: `scale(${pill})`, background: C.accent, color: C.bg, padding: '26px 48px',
            fontFamily: F.mono, fontWeight: 700, fontSize: 64, letterSpacing: '-0.01em',
            boxShadow: `0 0 80px rgba(46,232,138,0.35)`,
          }}
        >
          {scene.handle}
        </div>
        <Typewriter text={scene.sub} delay={26} size={34} align="center" />
      </AbsoluteFill>
    </Frame>
  );
};
