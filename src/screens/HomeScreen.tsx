import { Text, View } from "react-native";
import { activityName, elapsed, rewardDay } from "../domain/activity";
import { GameButton } from "../ui/GameButton";
import { formatTime as time } from "../features/sessions/format";
import { appStyles as styles } from "../ui/appStyles";
import type { ScreenProps } from "./ScreenProps";
export function HomeScreen({
  ledger,
  now,
  progress,
  today,
  active,
  busy,
  gpsBusy,
  scene,
  go,
}: Pick<
  ScreenProps,
  | "ledger"
  | "now"
  | "progress"
  | "today"
  | "active"
  | "busy"
  | "gpsBusy"
  | "scene"
  | "go"
>) {
  return (
    <>
      <Text accessibilityRole="header" style={styles.title}>
        Your little world.
      </Text>
      <Text style={styles.small}>
        {new Intl.DateTimeFormat("en-PH", {
          timeZone: "Asia/Manila",
          weekday: "long",
          day: "numeric",
          month: "long",
        }).format(now)}
      </Text>
      {scene("idle")}
      <View style={styles.card}>
        <View style={styles.summaryRow}>
          <Text style={styles.label}>Level {progress.level}</Text>
          <Text style={styles.small}>
            {progress.earned}/{progress.needed} XP
          </Text>
        </View>
        <View
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel="Level progress"
          accessibilityValue={{
            min: 0,
            max: progress.needed,
            now: progress.earned,
          }}
          style={styles.track}
        >
          <View
            style={[
              styles.fill,
              {
                width: `${Math.min(100, (progress.earned / progress.needed) * 100)}%`,
              },
            ]}
          />
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.small}>Today · {today.length} saved</Text>
          <Text style={styles.small}>
            +
            {today.reduce((sum, s) => sum + s.xp, 0) +
              ledger.questClaims
                .filter((c) => c.day === rewardDay(now))
                .reduce((sum, c) => sum + c.xp, 0)}{" "}
            XP
          </Text>
        </View>
      </View>
      {active && (
        <View style={styles.card}>
          <Text style={styles.label}>
            {activityName(active.activity)} ·{" "}
            {active.status === "interrupted" ? "needs review" : active.status}
          </Text>
          <Text style={styles.body}>
            {time(elapsed(active, now))} active time
          </Text>
        </View>
      )}
      <GameButton
        label={active ? "Return to your session" : "Start an activity"}
        disabled={busy || gpsBusy}
        onPress={() => go(active ? "session" : "picker")}
      />
    </>
  );
}
