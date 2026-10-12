import { Image, StyleSheet, View } from 'react-native';
import type { PreviewPose } from '../../features/character/controller';

const poses = {
  idle: require('../../../assets/character/idle.png'),
  studying: require('../../../assets/character/studying.png'),
  celebration: require('../../../assets/character/celebration.png'),
};
export function CharacterFallback({ pose }: { pose: PreviewPose }) {
  return <View style={styles.container} accessible accessibilityLabel={`Character ${pose} pose`}>
    <Image source={poses[pose]} resizeMode="contain" style={styles.image} accessible={false} />
  </View>;
}
const styles = StyleSheet.create({ container: { flex: 1 }, image: { width: '100%', height: '100%' } });
