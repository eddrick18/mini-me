import { StyleSheet, Text, View } from 'react-native';
import { achievementDetails, type AchievementId } from '../../domain/achievements';
import { activityName, type Activity, type CompletedSession } from '../../domain/activity';
import { tokens } from '../../design/tokens';
import { GameButton } from '../../ui/GameButton';
import { AchievementBadge } from './AchievementBadge';

export function AchievementDetail({id,sessions,activeActivity,busy,gpsAvailable,gpsExplanation,onStart,onResume,onBack}:{id:AchievementId;sessions:readonly CompletedSession[];activeActivity:Activity|null;busy:boolean;gpsAvailable:boolean;gpsExplanation:string;onStart:(activity:Activity)=>void;onResume:()=>void;onBack:()=>void}){
 const {badge,checklist,nextActivity}=achievementDetails(id,sessions),locked=badge.unlockedAt===null;
 return <><GameButton label="Back to badge collection" secondary disabled={busy} onPress={onBack}/>
  <Text accessibilityRole="header" style={s.title}>{badge.name}</Text>
  <View style={s.hero}><AchievementBadge id={id} locked={locked} size={112}/><Text style={s.status}>{locked?'A keepsake to work toward':'✓ In your collection'}</Text>
   {!locked&&<Text style={s.body}>Earned {new Intl.DateTimeFormat('en-PH',{timeZone:'Asia/Manila',dateStyle:'long'}).format(badge.unlockedAt!)}</Text>}
  </View>
  <View style={s.card}><Text style={s.label}>{badge.description}</Text><Text style={s.body}>{badge.progress} / {badge.target} {id==='allRounder'?'activities tried':'sessions saved'}</Text>
   <View accessible accessibilityRole="progressbar" accessibilityLabel={`${badge.name} progress`} accessibilityValue={{min:0,max:badge.target,now:badge.progress}} style={s.track}><View style={[s.fill,{width:`${badge.progress/badge.target*100}%`}]}/></View>
   <Text style={s.body}>Short sessions and sessions without XP count once they’re saved. An activity in progress counts after you finish and save it.</Text>
  </View>
  <View style={s.card}><Text accessibilityRole="header" style={s.label}>{id==='allRounder'?'Your activity checklist':'Activities that count'}</Text>
   {checklist.map(a=><View key={a.activity} style={s.row}><Text style={s.label}>{a.count>0?'✓':'○'} {activityName(a.activity)}</Text><Text style={s.body}>{a.count>0?`${a.count} saved`:'Not tried yet'}</Text></View>)}
  </View>
  {nextActivity&&<View style={s.card}><Text style={s.label}>Your next step</Text>
   {activeActivity?<><Text style={s.body}>You already have a {activityName(activeActivity)} session. Return to it and finish or save it before starting another.</Text><GameButton label="Return to your session" disabled={busy} onPress={onResume}/></>:<><Text style={s.body}>{id==='allRounder'?`Try ${activityName(nextActivity)} and save the session.`:`Save ${badge.target-badge.progress} more ${badge.target-badge.progress===1?'session':'sessions'} to collect this badge.`}</Text>
    {nextActivity==='Running'&&<Text style={s.body}>{gpsExplanation}</Text>}
    <GameButton label={`Start ${activityName(nextActivity).toLowerCase()}`} disabled={busy||(nextActivity==='Running'&&!gpsAvailable)} onPress={()=>onStart(nextActivity)}/>
   </>}
  </View>}
  {!locked&&<Text style={s.body}>You’ve earned this keepsake. It’s based on your saved activity history and doesn’t add XP.</Text>}
 </>;
}
const c=tokens.colors,s=StyleSheet.create({title:{fontSize:29,lineHeight:35,fontWeight:'900',color:c.text},hero:{alignItems:'center',gap:12,padding:20,borderWidth:3,borderBottomWidth:6,borderRadius:16,borderColor:c.text,backgroundColor:c.surface},status:{fontSize:16,lineHeight:24,fontWeight:'900',color:c.primary,textAlign:'center'},body:{fontSize:16,lineHeight:24,color:c.muted},label:{fontSize:16,lineHeight:24,fontWeight:'800',color:c.text},card:{padding:14,gap:12,borderRadius:16,borderWidth:2,borderColor:c.border,backgroundColor:c.surface},track:{height:12,borderWidth:1,borderColor:c.border,borderRadius:4,overflow:'hidden',backgroundColor:c.selected},fill:{height:'100%',backgroundColor:c.primary},row:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',gap:6,paddingVertical:4}});
