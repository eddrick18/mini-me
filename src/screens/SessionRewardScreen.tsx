import { Text, View } from "react-native";
import { activityName } from "../domain/activity";
import { GameButton } from "../ui/GameButton";
import { AchievementUnlock } from "../features/progress/AchievementCollection";
import {
  formatTime as time,
  formatDistance as distance,
} from "../features/sessions/format";
import { appStyles as styles } from "../ui/appStyles";
import type { ScreenProps } from "./ScreenProps";
export function SessionRewardScreen({
  reward,
  scene,
  celebrate,
  unlockedBadges,
  animate,
  progress,
  finishReward,
  go,
}: Pick<
  ScreenProps,
  | "reward"
  | "scene"
  | "celebrate"
  | "unlockedBadges"
  | "animate"
  | "progress"
  | "finishReward"
  | "go"
>) {
  return (
    <>
      <Text accessibilityRole="header" style={styles.title}>
        {reward.xp
          ? "A little progress. Well done."
          : "Activity saved. Nice work."}
      </Text>
      <Text style={styles.body}>
        {activityName(reward.activity)} · {time(reward.activeMs)} saved
        {reward.gps ? ` · ${distance(reward.gps.distanceM)}` : ""}
      </Text>
      {scene(celebrate ? (reward.xp > 0 ? "celebrating" : "sad") : "idle")}
      <Text accessibilityLiveRegion="polite" style={styles.reward}>
        +{reward.xp} XP
      </Text>
      {unlockedBadges.length > 0 && (
        <AchievementUnlock badges={unlockedBadges} motion={animate} />
      )}
      <View style={styles.card}>
        <Text style={styles.label}>
          Level {progress.level} · {progress.earned}/{progress.needed} XP
        </Text>
        <Text style={styles.body}>
          {reward.xp
            ? "Your progress is saved on this device."
            : reward.gps && reward.gps.distanceM < 1000
              ? "GPS sessions below 1 km are recorded without XP."
              : !reward.gps && reward.activeMs < 300000
                ? "Sessions under five minutes are recorded without XP."
                : "Today’s reward limit is reached. Your activity still counts."}
        </Text>
      </View>
      {progress.level >= 2 && (
        <View style={styles.card}>
          <Text style={styles.label}>Clothing palette milestone earned</Text>
          <Text style={styles.body}>
            Your level is permanent. Your clothing colors are ready in the
            wardrobe.
          </Text>
        </View>
      )}
      <GameButton label="Back to Home" onPress={finishReward} />
      <GameButton
        label="View activity history"
        secondary
        onPress={() => go("history")}
      />
      {unlockedBadges.length > 0 && (
        <GameButton
          label="View badge collection"
          secondary
          onPress={() => go("weekly")}
        />
      )}
    </>
  );
}
