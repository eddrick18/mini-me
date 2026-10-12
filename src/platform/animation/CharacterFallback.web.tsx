import type { PreviewPose } from '../../features/character/controller';
const poses: Record<PreviewPose, { uri: string }> = {
  idle: require('../../../assets/character/idle.png'),
  studying: require('../../../assets/character/studying.png'),
  celebration: require('../../../assets/character/celebration.png'),
};
export function CharacterFallback({ pose }: { pose: PreviewPose }) {
  return <img src={poses[pose].uri} alt={`Character ${pose} pose`}
    style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }} />;
}
