import { Text, View } from "react-native";
import { activityName } from "../domain/activity";
import { GameButton } from "../ui/GameButton";
import { DistanceStats } from "../features/sessions/DistanceStats";
import {
  formatTime as time,
  formatDistance as distance,
} from "../features/sessions/format";
import { appStyles as styles } from "../ui/appStyles";
import type { ScreenProps } from "./ScreenProps";
export function ActivityHistoryScreen({
  ledger,
  go,
}: Pick<ScreenProps, "ledger" | "go">) {
  return (
    <>
      <Text accessibilityRole="header" style={styles.title}>
        Your activity history
      </Text>
      <Text style={styles.body}>Saved on this device · Asia/Manila</Text>
      {ledger.sessions.length === 0 ? (
        <Text style={styles.body}>
          No saved activities yet. Start when you’re ready.
        </Text>
      ) : (
        [...ledger.sessions].reverse().map((s) => (
          <View key={s.id} style={styles.card}>
            <Text style={styles.label}>
              {activityName(s.activity)} · {time(s.activeMs)}
              {s.gps ? ` · ${distance(s.gps.distanceM)}` : ""}
            </Text>
            {s.gps && <DistanceStats gps={s.gps} activeMs={s.activeMs} />}
            <Text style={styles.body}>
              {new Intl.DateTimeFormat("en-PH", {
                timeZone: "Asia/Manila",
                dateStyle: "medium",
                timeStyle: "short",
              }).format(s.completedAt)}{" "}
              · +{s.xp} XP
            </Text>
          </View>
        ))
      )}
      <GameButton
        label="Back to Progress"
        secondary
        onPress={() => go("weekly")}
      />
    </>
  );
}
