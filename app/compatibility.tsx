import { useCallback, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { tokens } from '../src/design/tokens';
import { characterDisplayState, type PreviewPose } from '../src/features/character/controller';
import { CharacterView } from '../src/platform/animation/CharacterView';
import { useMotionPolicy } from '../src/platform/lifecycle/useMotionPolicy';
import { PreviewButton } from '../src/ui/PreviewButton';

export default function PreviewScreen() {
  const [pose, setPose] = useState<PreviewPose>('idle');
  const [preferStill, setPreferStill] = useState(false);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [assetFailed, setAssetFailed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const { foreground, systemReducedMotion } = useMotionPolicy();
  const onFailure = useCallback(() => setAssetFailed(true), []);
  const display = characterDisplayState(pose, preferStill || systemReducedMotion, foreground);
  const fallback = simulateFailure || assetFailed;
  const status = Platform.OS === 'web' ? 'Web preview · still poses'
    : fallback ? 'Character animation unavailable · still pose shown'
    : !display.animate ? 'Still pose · motion paused' : 'Native animation preview';

  return <SafeAreaView style={styles.safe}>
    <StatusBar style="dark" />
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.page}>
        <Text style={styles.eyebrow}>Mini Me · compatibility preview</Text>
        <Text accessibilityRole="header" style={styles.title}>Meet your little companion.</Text>
        <Text style={styles.body}>Try three poses. This temporary character helps us test animation before choosing your final look.</Text>
        <View style={styles.stage} accessible accessibilityLabel={`Character preview: ${pose}`}>
          <CharacterView key={retryKey} pose={pose} animate={display.animate} simulateFailure={simulateFailure} onFailure={onFailure} />
        </View>
        <Text accessibilityLiveRegion="polite" style={styles.status}>{status}{'\n'}Current pose: {pose}</Text>
        <View style={styles.controls}>
          <PreviewButton label="Idle" selected={pose === 'idle'} onPress={() => setPose('idle')} />
          <PreviewButton label="Studying" selected={pose === 'studying'} onPress={() => setPose('studying')} />
          <PreviewButton label="Celebrate" selected={pose === 'celebration'} onPress={() => setPose('celebration')} />
        </View>
        <View style={styles.setting}>
          <View style={styles.settingCopy}><Text style={styles.label}>Prefer still poses</Text>
            <Text style={styles.body}>{systemReducedMotion ? 'Your device also requests reduced motion.' : 'Keep the character still while you try the controls.'}</Text></View>
          <Switch accessibilityLabel="Prefer still poses" value={preferStill} onValueChange={setPreferStill}
            trackColor={{ true: tokens.colors.primary, false: tokens.colors.border }} />
        </View>
        <PreviewButton label={simulateFailure ? 'Restore animation' : 'Try fallback pose'}
          onPress={() => { setSimulateFailure(value => !value); setAssetFailed(false); setRetryKey(value => value + 1); }} />
        {assetFailed && <PreviewButton label="Retry animation" onPress={() => { setAssetFailed(false); setRetryKey(value => value + 1); }} />}
        <Text style={styles.note}>Preview only. These controls do not record activities or award XP. Your final character and screen design will be reviewed separately.</Text>
      </View>
    </ScrollView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: tokens.colors.background },
  content: { padding: tokens.spacing.page, alignItems: 'center' },
  page: { width: '100%', maxWidth: tokens.maxWidth, gap: tokens.spacing.gap },
  eyebrow: { fontSize: 14, fontWeight: '600', color: tokens.colors.primary },
  title: { fontSize: 30, lineHeight: 38, fontWeight: '700', color: tokens.colors.text },
  body: { fontSize: 16, lineHeight: 24, color: tokens.colors.muted },
  stage: { height: tokens.stageHeight, borderRadius: tokens.radius, backgroundColor: tokens.colors.stage, overflow: 'hidden' },
  status: { fontSize: 14, lineHeight: 22, color: tokens.colors.text, minHeight: 44 },
  controls: { gap: tokens.spacing.gap },
  setting: { flexDirection: 'row', gap: tokens.spacing.gap, alignItems: 'center', paddingVertical: tokens.spacing.gap },
  settingCopy: { flex: 1, gap: 4 },
  label: { fontSize: 16, fontWeight: '600', color: tokens.colors.text },
  note: { color: tokens.colors.muted, fontSize: 14, lineHeight: 21 },
});
