import { Composition } from 'remotion';
import { FPS, TOTAL_FRAMES } from './scenes';
import { Video } from './Video';

export const Root: React.FC = () => (
  <Composition id="OlegiTextReview" component={Video} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} />
);
