import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Fit, RiveView, useRive, useRiveFile, useViewModelInstance } from '@rive-app/react-native';
import { characterDisplayState, type PreviewPose } from '../../features/character/controller';
import { tokens } from '../../design/tokens';
import { CharacterFallback } from './CharacterFallback';

type Props = { pose: PreviewPose; animate: boolean; simulateFailure: boolean; onFailure: () => void };

export function CharacterView(props: Props) {
  // Static policy unmounts the runtime, so background/reduced motion does not keep a render loop alive.
  if (!props.animate || props.simulateFailure) return <CharacterFallback pose={props.pose} />;
  return <AnimatedCharacter {...props} />;
}

function AnimatedCharacter({ pose, onFailure }: Props) {
  const { riveFile, error } = useRiveFile(require('../../../assets/character/compatibility-character.riv'));
  const { instance, error: modelError } = useViewModelInstance(riveFile, { async: true });
  const { riveViewRef, setHybridRef } = useRive();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (error || modelError || riveViewRef === null) { setFailed(true); onFailure(); }
  }, [error, modelError, riveViewRef, onFailure]);

  useEffect(() => {
    if (!instance || !riveViewRef) return;
    try {
      const property = instance.numberProperty('pose');
      if (!property) throw new Error('Missing pose contract');
      property.set(characterDisplayState(pose, false, true).poseValue);
      riveViewRef.playIfNeeded();
    } catch { setFailed(true); onFailure(); }
  }, [pose, instance, riveViewRef, onFailure]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!riveFile || !instance || !riveViewRef) { setFailed(true); onFailure(); }
    }, 10000);
    return () => clearTimeout(timeout);
  }, [riveFile, instance, riveViewRef, onFailure]);

  if (failed) return <CharacterFallback pose={pose} />;
  if (!riveFile || !instance) return <View style={styles.loading} accessibilityLabel="Loading character" accessibilityRole="progressbar">
    <ActivityIndicator color={tokens.colors.primary} />
  </View>;
  return <RiveView file={riveFile} dataBind={instance} hybridRef={setHybridRef}
    artboardName="MiniMe" stateMachineName="CharacterController" fit={Fit.Contain} autoPlay frameRate={30}
    onError={() => { setFailed(true); onFailure(); }} style={styles.view} />;
}
const styles = StyleSheet.create({ view: { width: '100%', height: '100%' }, loading: { flex: 1, justifyContent: 'center', alignItems: 'center' } });


