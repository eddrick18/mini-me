import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { tokens } from '../../design/tokens';
import type { CompanionReaction } from '../../features/character/controller';
export function ReactionBadge({reaction}:{reaction:CompanionReaction}){
 return <View pointerEvents="none" accessible={false} style={{width:56,height:56,borderWidth:2,borderColor:tokens.colors.text,backgroundColor:tokens.colors.accent,borderRadius:8,alignItems:'center',justifyContent:'center'}}><Svg width={36} height={36} viewBox="0 0 24 24"><Path fill={tokens.colors.text} d={reaction==='wave'?'M8 2h3v9h1V1h3v10h1V3h3v11h2v5h-3v3H8v-3H5v-5H2v-4h3v2h3z':'M10 1h4v6h3v3h6v4h-6v3h-3v6h-4v-6H7v-3H1v-4h6V7h3z'}/></Svg></View>;
}
