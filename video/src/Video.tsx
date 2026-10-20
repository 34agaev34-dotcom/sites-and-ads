import { AbsoluteFill, Sequence } from 'remotion';
import { Background, Progress } from './components/Background';
import { loadFonts } from './fonts';
import { CtaScene, IntroScene, ShotScene, SummaryScene } from './scenes/Scenes';
import { SCENES, TOTAL_FRAMES, sceneFrames } from './scenes';

loadFonts();

const starts = SCENES.reduce<number[]>((acc, s, i) => [...acc, i === 0 ? 0 : acc[i - 1] + sceneFrames(SCENES[i - 1])], []);

export const Video: React.FC = () => {
  let shotIndex = 0;
  return (
    <AbsoluteFill>
      <Background />
      {SCENES.map((scene, i) => {
        const d = sceneFrames(scene);
        return (
          <Sequence key={i} from={starts[i]} durationInFrames={d}>
            {scene.kind === 'intro' && <IntroScene scene={scene} duration={d} />}
            {scene.kind === 'shot' && <ShotScene scene={scene} index={++shotIndex} duration={d} />}
            {scene.kind === 'summary' && <SummaryScene scene={scene} duration={d} />}
            {scene.kind === 'cta' && <CtaScene scene={scene} duration={d} />}
          </Sequence>
        );
      })}
      <Progress starts={starts} total={TOTAL_FRAMES} />
    </AbsoluteFill>
  );
};
