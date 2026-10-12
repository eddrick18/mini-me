import Svg, { Path, Rect, Text as SvgText } from 'react-native-svg';
import { palettes, type Appearance } from '../../domain/appearance';
export function GarmentIcon({appearance}:{appearance:Appearance}){
 const jacket=appearance.outfit==='running';
 const colors=appearance.palette==='original'&&jacket?['#125259','#168F94','#33B4B1']:palettes[appearance.palette].colors;
 return <Svg width="100%" height={76} viewBox="0 0 64 64" accessible={false}>
  <Path d="M22 10H28V14H36V10H42V14H48V18H52V24H56V34H46V52H18V34H8V24H12V18H16V14H22Z" fill={colors[1]} stroke="#282348" strokeWidth={3} strokeLinejoin="miter"/>
  <Path d="M18 28H23V48H41V52H18ZM8 30H18V34H8ZM46 30H56V34H46Z" fill={colors[0]}/>
  <Path d="M16 18H22V22H16ZM23 18H27V22H23ZM38 18H42V22H38Z" fill={colors[2]}/>
  {jacket?<><Path d="M26 14L32 22L38 14M32 22V51" fill="none" stroke="#282348" strokeWidth={3}/><Rect x={20} y={34} width={7} height={13} fill="#233B59"/><Rect x={37} y={34} width={7} height={13} fill="#233B59"/><Rect x={31} y={25} width={2} height={4} fill="#FFFDF7"/></>:<SvgText x={32} y={34} textAnchor="middle" fill="#FFFDF7" fontSize={10} fontWeight="900">NBA</SvgText>}
 </Svg>;
}

