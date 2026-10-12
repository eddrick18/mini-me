import type { PreviewPose } from '../../features/character/controller';
import { CharacterFallback } from './CharacterFallback.web';
type Props = { pose: PreviewPose; animate: boolean; simulateFailure: boolean; onFailure: () => void };
export function CharacterView({ pose }: Props) {
  return <CharacterFallback pose={pose} />;
}
