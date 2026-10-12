import { isExpoGo } from '../runtime';
import { ReactionBadge } from './ReactionBadge';
import type { ComponentType } from 'react';
import type { CompanionReaction as Reaction } from '../../features/character/controller';
// Keep the unsupported custom native module out of Expo Go execution.
export const CompanionReaction:ComponentType<{reaction:Reaction}>=isExpoGo?ReactionBadge:require('./CompanionReaction.rive').CompanionReaction;
