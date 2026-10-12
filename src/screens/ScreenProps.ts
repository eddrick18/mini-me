import type { ReactNode } from "react";
import type {
  Activity,
  ActiveSession,
  CompletedSession,
  Ledger,
  levelProgress,
} from "../domain/activity";
import type { Page } from "../navigation/routes";
import type { SpritePose } from "../platform/animation/SpriteScene";
import type { useSessions } from "../features/sessions/useSessions";
import type { useGameFeedback } from "../platform/feedback/useGameFeedback";
import type { createSessionActions } from "../features/sessions/sessionActions";
import type { AchievementProgress } from "../domain/achievements";
type Store = ReturnType<typeof useSessions>;
// Screens receive only their own Pick. Writes stay with session/store owners.
export type ScreenProps = {
  ledger: Ledger;
  now: number;
  progress: ReturnType<typeof levelProgress>;
  today: CompletedSession[];
  active: ActiveSession | null;
  busy: boolean;
  gpsBusy: boolean;
  animate: boolean;
  systemReducedMotion: boolean;
  scene: (pose: SpritePose, moving?: boolean) => ReactNode;
  go: (page: Page) => void;
  startActivity: (activity: Activity) => Promise<void>;
  toggleSession: () => Promise<void>;
  openFinish: () => Promise<void>;
  finish: () => Promise<void>;
  signal: string;
  actions: ReturnType<typeof createSessionActions>;
  reviewMinutes: string;
  setReviewMinutes: (value: string) => void;
  reward: CompletedSession;
  celebrate: boolean;
  unlockedBadges: AchievementProgress[];
  finishReward: () => void;
  execute: Store["execute"];
  replace: Store["replace"];
  recovery: Store["recovery"];
  feedback: ReturnType<typeof useGameFeedback>;
};
