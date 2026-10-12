import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { weeklyProgress } from '../../domain/weeklyProgress';
import { activityName, type Ledger } from '../../domain/activity';
import { tokens } from '../../design/tokens';
import { GameButton } from '../../ui/GameButton';
const duration=(ms:number)=>ms<60000?`${Math.floor(ms/1000)}s`:`${Math.floor(ms/60000)}m`;
const date=(at:number)=>new Intl.DateTimeFormat('en-PH',{timeZone:'Asia/Manila',month:'short',day:'numeric'}).format(at);
export function WeeklyProgress({ledger,now,onBack,onStart,onHistory,showBack=true}:{ledger:Ledger;now:number;onBack:()=>void;onStart:()=>void;onHistory?:()=>void;showBack?:boolean}){
 const [weeksAgo,setWeeksAgo]=useState(0),week=weeklyProgress(ledger,now,weeksAgo);
 const max=Math.max(60000,...week.days.map(d=>d.activeMs));
 const earliest=ledger.questClaims.reduce((n,c)=>Math.min(n,c.claimedAt),ledger.sessions.reduce((n,s)=>Math.min(n,s.completedAt),now));
 const older=week.days[0]!.at>earliest;
 return <><Text accessibilityRole="header" style={s.title}>Your weekly adventure</Text><Text style={s.body}>{date(week.days[0]!.at)} – {date(week.days[6]!.at)} · Manila</Text><View style={s.controls}><View style={s.control}><GameButton label="Previous week" secondary disabled={!older} onPress={()=>setWeeksAgo(n=>n+1)}/></View><View style={s.control}><GameButton label="Next week" secondary disabled={weeksAgo===0} onPress={()=>setWeeksAgo(n=>n-1)}/></View></View>
 <View style={s.summary}><Text style={s.kicker}>YOUR SAVED ADVENTURES</Text><Text style={s.total}>{duration(week.activeMs)}</Text><Text style={s.label}>{week.count} {week.count===1?'activity':'activities'} · {week.activityXp+week.questXp} XP</Text><Text style={s.body}>{week.activityXp} activity XP + {week.questXp} quest bonus XP</Text></View>
 <View style={s.card}><Text style={s.label}>Active time each day</Text><View style={s.chart}>{week.days.map(d=><View key={d.day} style={s.column} accessible accessibilityLabel={`${date(d.at)}: ${duration(d.activeMs)}, ${d.count} activities, ${d.activityXp+d.questXp} XP`}><Text style={s.value}>{duration(d.activeMs)}</Text><View style={s.barSlot}><View style={[s.bar,{height:d.activeMs?Math.max(4,d.activeMs/max*100):2,backgroundColor:d.activeMs?tokens.colors.primary:tokens.colors.border}]}/></View><Text style={s.day}>{new Intl.DateTimeFormat('en-PH',{timeZone:'Asia/Manila',weekday:'short'}).format(d.at)}</Text></View>)}</View><Text style={s.body}>Saved sessions only. Paused time is excluded.</Text></View>
 {week.count===0?<View style={s.card}><Text style={s.label}>A quiet week so far</Text><Text style={s.body}>No saved activities in these seven days. Rest keeps every earned level.</Text><GameButton label="Start an activity" onPress={onStart}/></View>:<View style={s.card}><Text style={s.label}>Where your time went</Text>{week.activities.map(a=><View key={a.activity} style={s.row}><Text style={s.body}>{activityName(a.activity)}</Text><Text style={s.label}>{duration(a.activeMs)}</Text></View>)}</View>}
 {onHistory&&<GameButton label="Activity history" secondary onPress={onHistory}/>}
 {showBack&&<GameButton label="Back to Home" secondary onPress={onBack}/>}</>;
}
const c=tokens.colors,s=StyleSheet.create({title:{fontSize:29,lineHeight:35,fontWeight:'900',color:c.text},body:{color:c.muted,fontSize:16,lineHeight:24},label:{color:c.text,fontSize:16,fontWeight:'800'},controls:{flexDirection:'row',gap:8},control:{flex:1},summary:{padding:18,borderWidth:3,borderBottomWidth:6,borderColor:c.text,borderRadius:16,backgroundColor:c.accent,gap:6},kicker:{color:c.text,fontWeight:'900',fontSize:12,letterSpacing:1},total:{color:c.text,fontSize:44,fontWeight:'900'},card:{padding:14,borderWidth:2,borderColor:c.border,borderRadius:16,backgroundColor:c.surface,gap:12},chart:{flexDirection:'row',gap:4},column:{flex:1,alignItems:'center',gap:6},barSlot:{height:100,width:'100%',justifyContent:'flex-end',alignItems:'center'},bar:{width:'72%',borderRadius:3},value:{color:c.text,fontSize:10,fontWeight:'800'},day:{color:c.muted,fontSize:10},row:{flexDirection:'row',justifyContent:'space-between',gap:12}});
