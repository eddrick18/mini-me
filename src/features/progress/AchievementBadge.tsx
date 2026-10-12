import Svg, { Path, Rect } from 'react-native-svg';
import type { AchievementId } from '../../domain/achievements';
import { tokens } from '../../design/tokens';

const drawings:Record<AchievementId,string>={
 firstSteps:'M9 8h5v3h3v3h4v3h5v5H8v-3H5v-5h4z M8 24h19v3H8z',
 bookworm:'M5 8h9l2 2 2-2h9v17h-9l-2 2-2-2H5z M8 12h5v2H8z M19 12h5v2h-5z M8 17h5v2H8z M19 17h5v2h-5z',
 rhythm:'M12 6h14v15h-3V11h-8v13h-3z M6 22h9v5H6z M18 19h8v5h-8z',
 allRounder:'M13 4h6v7h7v6h-7v7h-6v-7H6v-6h7z M10 25h12v4H10z',
};
export function AchievementBadge({id,locked=false,size=64}:{id:AchievementId;locked?:boolean;size?:number}){
 const c=tokens.colors;
 return <Svg accessible={false} width={size} height={size} viewBox="0 0 32 36">
  <Path d="M8 1h16v3h5v25h-5v3H8v-3H3V4h5z" fill={locked?c.selected:c.accent} stroke={c.text} strokeWidth={2}/>
  <Path d={drawings[id]} fill={locked?c.border:c.primary} fillRule="evenodd"/>
  {!locked&&<><Rect x={6} y={4} width={3} height={3} fill={c.surface}/><Path d="M8 33h6v3H8z M18 33h6v3h-6z" fill={c.primary}/></>}
  {locked&&<><Path d="M23 23v-3h5v3" fill="none" stroke={c.text} strokeWidth={2}/><Rect x={21} y={23} width={9} height={8} fill={c.text}/><Rect x={25} y={25} width={2} height={3} fill={c.surface}/></>}
 </Svg>;
}
