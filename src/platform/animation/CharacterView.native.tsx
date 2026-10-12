import type { ComponentType } from 'react';
import type { PreviewPose } from '../../features/character/controller';
import { isExpoGo } from '../runtime';
import { CharacterView as StillCharacter } from './CharacterView.web';
type Props={pose:PreviewPose;animate:boolean;simulateFailure:boolean;onFailure:()=>void};
// Expo Go cannot load the custom Rive native module. Keep the old proof isolated.
export const CharacterView:ComponentType<Props>=isExpoGo?StillCharacter:require('./CharacterView.rive').CharacterView;
