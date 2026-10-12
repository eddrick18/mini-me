import { Text, View, TextInput } from "react-native";
import { activityName, elapsed, needsReview } from "../domain/activity";
import { GameButton } from "../ui/GameButton";
import { DistanceStats } from "../features/sessions/DistanceStats";
import { formatTime as time } from "../features/sessions/format";
import { appStyles as styles } from "../ui/appStyles";
import type { ScreenProps } from "./ScreenProps";
export function FinishSessionScreen({
  active,
  now,
  busy,
  gpsBusy,
  reviewMinutes,
  setReviewMinutes,
  finish,
  go,
}: Pick<
  ScreenProps,
  | "active"
  | "now"
  | "busy"
  | "gpsBusy"
  | "reviewMinutes"
  | "setReviewMinutes"
  | "finish"
  | "go"
> & { active: NonNullable<ScreenProps["active"]> }) {
  return (
    <>
      <Text accessibilityRole="header" style={styles.title}>
        Finish this session?
      </Text>
      <Text style={styles.body}>Check the active time before saving.</Text>
      <View style={styles.card}>
        <Text style={styles.label}>
          {activityName(active.activity)} · {time(elapsed(active, now))}
        </Text>
        {active.gps && (
          <DistanceStats gps={active.gps} activeMs={elapsed(active, now)} />
        )}
        <Text style={styles.body}>
          Paused time excluded. Saving records this session once.
        </Text>
      </View>
      {needsReview(active, now) && (
        <View style={styles.card}>
          <Text style={styles.label}>Confirm the active minutes</Text>
          <Text style={styles.body}>
            Recovery or a clock change needs your review. Adjust the estimate
            before saving.
          </Text>
          <TextInput
            accessibilityLabel="Confirmed active minutes"
            keyboardType="decimal-pad"
            value={reviewMinutes}
            onChangeText={setReviewMinutes}
            style={styles.input}
          />
          <Text style={styles.small}>Enter 0 to 10,080 minutes.</Text>
        </View>
      )}
      <Text style={styles.body}>
        {active.gps
          ? "GPS distance earns 20 XP at 1 km or 30 XP at 3 km, within today’s limits. Below 1 km is saved without XP."
          : "At least 5 minutes earns 20 XP; 20 minutes earns 30 XP, within today’s limits. Short sessions are still saved."}
      </Text>
      <GameButton
        label={busy ? "Saving session…" : "Save session"}
        disabled={
          busy ||
          gpsBusy ||
          (needsReview(active, now) &&
            (!Number.isFinite(Number(reviewMinutes)) ||
              Number(reviewMinutes) < 0 ||
              Number(reviewMinutes) > 10080 ||
              reviewMinutes.trim() === ""))
        }
        onPress={() => void finish()}
      />
      <GameButton
        label="Back to session"
        secondary
        disabled={busy || gpsBusy}
        onPress={() => go("session")}
      />
    </>
  );
}
