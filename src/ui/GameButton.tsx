import { Pressable, StyleSheet, Text } from "react-native";
import { tokens } from "../design/tokens";
export function GameButton({
  label,
  onPress,
  secondary = false,
  disabled = false,
  expanded,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  expanded?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{
        disabled,
        ...(expanded === undefined ? {} : { expanded }),
      }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.label, secondary && styles.dark]}>{label}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    padding: 14,
    borderRadius: 15,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: tokens.colors.text,
    backgroundColor: tokens.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  secondary: { backgroundColor: tokens.colors.surface },
  pressed: { opacity: 0.85, transform: [{ translateY: 2 }] },
  disabled: { opacity: 0.5 },
  label: {
    color: tokens.colors.surface,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  dark: { color: tokens.colors.text },
});
