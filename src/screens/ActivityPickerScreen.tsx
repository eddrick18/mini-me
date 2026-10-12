import { Text, View } from "react-native";
import { activities, activityName } from "../domain/activity";
import {
  gpsSupported,
  gpsPermissionCopy,
  gpsModeCopy,
} from "../platform/location/background";
import { GameButton } from "../ui/GameButton";
import { activityDescriptions as descriptions } from "../features/sessions/format";
import { appStyles as styles } from "../ui/appStyles";
import type { ScreenProps } from "./ScreenProps";
export function ActivityPickerScreen({
  busy,
  gpsBusy,
  startActivity,
  go,
}: Pick<ScreenProps, "busy" | "gpsBusy" | "startActivity" | "go">) {
  return (
    <>
      <Text accessibilityRole="header" style={styles.title}>
        What are you up to?
      </Text>
      <Text style={styles.body}>Every activity can grow your companion.</Text>
      {activities.map((activity, i) => (
        <View
          key={activity}
          style={[
            styles.activity,
            {
              backgroundColor: [
                "#E1D3FF",
                "#C5EFF5",
                "#FFD4BA",
                "#D9EEA8",
                "#FFD3E7",
              ][i],
            },
          ]}
        >
          <Text style={styles.label}>{activityName(activity)}</Text>
          <Text style={styles.body}>{descriptions[activity]}</Text>
          {activity === "Running" && (
            <Text style={styles.small}>
              20 XP at 1 km · 30 XP at 3 km. {gpsPermissionCopy} Only distance
              totals are saved; a temporary GPS processing checkpoint is deleted
              on pause or finish. {gpsModeCopy}
            </Text>
          )}
          <GameButton
            label={`Start ${activityName(activity).toLowerCase()}`}
            disabled={
              busy || gpsBusy || (activity === "Running" && !gpsSupported)
            }
            onPress={() => void startActivity(activity)}
          />
        </View>
      ))}
      <GameButton
        label="Back to Home"
        secondary
        disabled={busy || gpsBusy}
        onPress={() => go("home")}
      />
    </>
  );
}
