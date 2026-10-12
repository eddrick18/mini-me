import { Text, View, StyleSheet } from 'react-native';
import type { GpsSummary } from '../../domain/activity';
import { paceSecondsPerKm } from '../../domain/runningDistance';
import { tokens } from '../../design/tokens';
function duration(ms:number){const seconds=Math.floor(ms/1000);return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;}
function pace(distance:number,ms:number){const value=paceSecondsPerKm(distance,ms);return distance<100||value===null?'—':`${duration(value*1000)} / km`;}
export function DistanceStats({gps,activeMs}:{gps:GpsSummary;activeMs:number}){
 if(gps.processingVersion!==2)return null;
 return <View style={s.box}><Text style={s.label}>GPS route distance · {(gps.distanceM/1000).toFixed(2)} km</Text>
  <Text style={s.text}>Active time {duration(activeMs)} · active pace {pace(gps.distanceM,activeMs)}</Text>
  <Text style={s.text}>Estimated moving time {duration(gps.movingMs??0)} · moving pace {pace(gps.distanceM,gps.movingMs??0)}</Text>
  <Text style={s.text}>{gps.displacementM===undefined?'Start-to-finish displacement unavailable after resume/recovery':`Start-to-finish displacement ${gps.displacementM} m`}</Text>
  <Text style={s.text}>{gps.gapCount??0} route breaks · {duration(gps.uncertainMs??0)} uncertain time excluded</Text>
  <Text style={s.note}>Short movements may take up to 30 seconds to confirm. Missing route sections are not filled in.</Text>
 </View>;
}
const s=StyleSheet.create({box:{gap:6},label:{fontWeight:'800',fontSize:14,color:tokens.colors.text},text:{fontSize:13,lineHeight:19,color:tokens.colors.muted},note:{fontSize:12,lineHeight:18,color:tokens.colors.primary}});
