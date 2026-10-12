import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { tokens } from '../design/tokens';

type Props = { label: string; onPress: () => void; selected?: boolean; disabled?: boolean };
export function PreviewButton({ label, onPress, selected = false, disabled = false }: Props) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected, disabled }}
      disabled={disabled} onPress={onPress} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      onHoverIn={() => setHovered(true)} onHoverOut={() => setHovered(false)}
      style={({ pressed }) => [styles.button, selected && styles.selected,
        (focused || hovered) && styles.focused, pressed && styles.pressed, disabled && styles.disabled]}>
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}{selected ? ' · selected' : ''}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: { minHeight: 48, padding: tokens.spacing.gap, borderRadius: tokens.radius,
    borderWidth: 2, borderColor: tokens.colors.border, backgroundColor: tokens.colors.surface, justifyContent: 'center' },
  selected: { backgroundColor: tokens.colors.primary, borderColor: tokens.colors.primary },
  focused: { borderColor: tokens.colors.text }, pressed: { opacity: 0.75 }, disabled: { opacity: 0.5 },
  label: { color: tokens.colors.text, fontSize: 16, fontWeight: '600', textAlign: 'center' },
  selectedLabel: { color: tokens.colors.surface },
});
