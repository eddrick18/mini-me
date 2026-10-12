import { Text, View, Switch } from "react-native";
import { tokens } from "../design/tokens";
import { GameButton } from "../ui/GameButton";
import { BackupSettings } from "../features/backup/BackupSettings";
import { appStyles as styles } from "../ui/appStyles";
import type { ScreenProps } from "./ScreenProps";
export function SettingsScreen({
  ledger,
  busy,
  gpsBusy,
  systemReducedMotion,
  execute,
  feedback,
  replace,
  recovery,
}: Pick<
  ScreenProps,
  | "ledger"
  | "busy"
  | "gpsBusy"
  | "systemReducedMotion"
  | "execute"
  | "feedback"
  | "replace"
  | "recovery"
>) {
  return (
    <>
      <Text accessibilityRole="header" style={styles.title}>
        Your app, your pace.
      </Text>
      <Text style={styles.body}>Personal · works offline</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Prefer still poses</Text>
        <Text style={styles.body}>
          {systemReducedMotion
            ? "Your device also requests reduced motion."
            : "Keep the character and background still."}
        </Text>
        <Switch
          accessibilityLabel="Prefer still poses"
          disabled={busy || gpsBusy}
          value={ledger.preferStill}
          onValueChange={(value) => void execute({ type: "still", value })}
          trackColor={{
            true: tokens.colors.primary,
            false: tokens.colors.border,
          }}
        />
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Sound effects</Text>
        <Text style={styles.body}>
          Short game sounds for XP, quests, level ups and a gentle sigh. Your
          music can keep playing.
        </Text>
        <Switch
          accessibilityLabel="Sound effects"
          disabled={busy || gpsBusy}
          value={ledger.feedback.sound}
          onValueChange={(sound) =>
            void execute({
              type: "feedback",
              value: { ...ledger.feedback, sound },
            })
          }
          trackColor={{
            true: tokens.colors.primary,
            false: tokens.colors.border,
          }}
        />
        <GameButton
          label="Test sound"
          secondary
          disabled={busy || !ledger.feedback.sound}
          onPress={() => feedback("xp")}
        />
        <Text style={styles.small}>
          Device silent mode and browser playback rules may keep sounds quiet.
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Vibration feedback</Text>
        <Text style={styles.body}>
          Light taps when rewards arrive or you equip clothes and room
          decorations.
        </Text>
        <Switch
          accessibilityLabel="Vibration feedback"
          disabled={busy || gpsBusy}
          value={ledger.feedback.haptics}
          onValueChange={(haptics) =>
            void execute({
              type: "feedback",
              value: { ...ledger.feedback, haptics },
            })
          }
          trackColor={{
            true: tokens.colors.primary,
            false: tokens.colors.border,
          }}
        />
        <GameButton
          label="Test vibration"
          secondary
          disabled={busy || !ledger.feedback.haptics}
          onPress={() => feedback("equip")}
        />
        <Text style={styles.small}>
          Available on supported devices. iPhone browser previews do not
          vibrate.
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Occasional companion messages</Text>
        <Text style={styles.body}>
          A quiet hello every 1–3 minutes while Home is visible and no session
          is active. Tap responses stay available.
        </Text>
        <Switch
          accessibilityLabel="Occasional companion messages"
          disabled={busy || gpsBusy}
          value={ledger.companion.spontaneous}
          onValueChange={(spontaneous) =>
            void execute({
              type: "companion",
              value: { ...ledger.companion, spontaneous },
            })
          }
          trackColor={{
            true: tokens.colors.primary,
            false: tokens.colors.border,
          }}
        />
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Companion reactions</Text>
        <Text style={styles.body}>
          Let your companion wave in the equipped outfit. Activity poses keep
          their own movements. Still poses and device reduced motion keep
          responses text-only.
        </Text>
        <Switch
          accessibilityLabel="Companion reactions"
          disabled={busy || gpsBusy}
          value={ledger.companion.reactions}
          onValueChange={(reactions) =>
            void execute({
              type: "companion",
              value: { ...ledger.companion, reactions },
            })
          }
          trackColor={{
            true: tokens.colors.primary,
            false: tokens.colors.border,
          }}
        />
      </View>
      <BackupSettings
        ledger={ledger}
        busy={busy}
        onRestore={replace}
        onRecovery={recovery}
      />
      <View style={styles.card}>
        <Text style={styles.label}>Stored on this device</Text>
        <Text style={styles.body}>
          Sessions, XP and motion preferences are saved locally. Uninstalling
          the app can remove them.
        </Text>
      </View>
      <Text style={styles.body}>
        Reward days use Asia/Manila. No streak penalties or lost levels.
      </Text>
    </>
  );
}
