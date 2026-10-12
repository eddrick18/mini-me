import { Text, View } from "react-native";
import { useEffect, useState } from "react";
import { activityName, elapsed } from "../domain/activity";
import { activityPose } from "../platform/animation/SpriteScene";
import { gpsModeCopy } from "../platform/location/background";
import { GameButton } from "../ui/GameButton";
import { DistanceStats } from "../features/sessions/DistanceStats";
import {
  formatTime as time,
  formatDistance as distance,
} from "../features/sessions/format";
import { appStyles as styles } from "../ui/appStyles";
import type { ScreenProps } from "./ScreenProps";
export function ActivitySessionScreen({
  active,
  animate,
  busy,
  gpsBusy,
  scene,
  signal,
  actions,
  toggleSession,
  openFinish,
  go,
  now,
}: Pick<
  ScreenProps,
  | "active"
  | "animate"
  | "busy"
  | "gpsBusy"
  | "scene"
  | "signal"
  | "actions"
  | "toggleSession"
  | "openFinish"
  | "go"
  | "now"
> & { active: NonNullable<ScreenProps["active"]> }) {
  const [showGpsDetails, setShowGpsDetails] = useState(false);
  useEffect(() => setShowGpsDetails(false), [active.id]);
  return (
    <>
      <Text accessibilityRole="header" style={styles.title}>
        {activityName(active.activity)}
      </Text>
      <Text style={styles.body}>
        {active.status === "running"
          ? "Session in progress"
          : active.status === "interrupted"
            ? "Recovered session · review active time"
            : "Session paused · resume when you’re ready"}
      </Text>
      {scene(
        activityPose(active.activity),
        animate && active.status === "running",
      )}
      <View style={styles.card}>
        <Text style={styles.timer}>{time(elapsed(active, now))}</Text>
        <Text style={[styles.small, { textAlign: "center" }]}>
          Active time · pauses do not count
        </Text>
        {active.gps && (
          <>
            <Text style={styles.reward}>{distance(active.gps.distanceM)}</Text>
            <Text style={styles.body}>
              {active.status === "running"
                ? signal
                : "GPS paused · recorded distance is kept"}
            </Text>
          </>
        )}
        {active.status === "interrupted" ? (
          <View style={styles.card}>
            <Text style={styles.label}>Your session was recovered</Text>
            <Text style={styles.body}>
              The app closed during your session. Review the estimated active
              time before saving.
            </Text>
          </View>
        ) : (
          <>
            <GameButton
              label={
                active.status === "running" ? "Pause session" : "Resume session"
              }
              secondary
              disabled={busy || gpsBusy}
              onPress={() => void toggleSession()}
            />
          </>
        )}
        <GameButton
          label="Finish session"
          disabled={busy || gpsBusy}
          onPress={() => void openFinish()}
        />
      </View>
      <Text style={styles.small}>
        {active.gps
          ? gpsModeCopy
          : active.status === "running"
            ? "Your timer continues when you leave the app. Paused time is excluded."
            : "Your session stays paused until you resume. Recorded time is kept."}
      </Text>
      {active.gps && (
        <View style={styles.card}>
          <Text style={styles.small}>
            20 XP at 1 km · 30 XP at 3 km · within daily limits
          </Text>
          <GameButton
            label={showGpsDetails ? "Hide GPS details" : "Show GPS details"}
            secondary
            expanded={showGpsDetails}
            onPress={() => setShowGpsDetails((shown) => !shown)}
          />
          {showGpsDetails && (
            <DistanceStats gps={active.gps} activeMs={elapsed(active, now)} />
          )}
          {active.status === "running" && (
            <GameButton
              label="Retry GPS tracking"
              secondary
              disabled={busy || gpsBusy}
              onPress={() => void actions.retryGps()}
            />
          )}
        </View>
      )}
      <GameButton
        label="Back to Home"
        secondary
        disabled={busy || gpsBusy}
        onPress={() => go("home")}
      />
    </>
  );
}
