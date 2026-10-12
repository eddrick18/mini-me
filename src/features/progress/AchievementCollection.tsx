import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { achievementProgress, type AchievementId, type AchievementProgress } from '../../domain/achievements';
import type { CompletedSession } from '../../domain/activity';
import { tokens } from '../../design/tokens';
import { AchievementBadge } from './AchievementBadge';

const date=(at:number)=>new Intl.DateTimeFormat('en-PH',{timeZone:'Asia/Manila',month:'short',day:'numeric',year:'numeric'}).format(at);
export function AchievementCollection({sessions,onSelect,disabled=false}:{sessions:readonly CompletedSession[];onSelect:(id:AchievementId)=>void;disabled?:boolean}){
 const [hovered,setHovered]=useState<AchievementId|null>(null),[focused,setFocused]=useState<AchievementId|null>(null);
 const collection=achievementProgress(sessions),owned=collection.filter(a=>a.unlockedAt!==null).length;
 return <View style={s.collection}><Text accessibilityRole="header" style={s.title}>Your badge collection</Text>
  <Text style={s.body}>{owned} / {collection.length} collected · all-time adventures</Text>
  <Text style={s.body}>Every saved session counts, including those without XP.</Text>
  <View style={s.grid}>{collection.map(a=>{const locked=a.unlockedAt===null;return <Pressable key={a.id} accessibilityRole="button" accessibilityLabel={`View ${a.name} achievement. ${locked?'Locked':'Collected'}, ${a.progress} of ${a.target}.`} accessibilityState={{disabled}} disabled={disabled} onPress={()=>onSelect(a.id)} onHoverIn={()=>setHovered(a.id)} onHoverOut={()=>setHovered(null)} onFocus={()=>setFocused(a.id)} onBlur={()=>setFocused(null)} style={({pressed})=>[s.tile,!locked&&s.owned,(pressed||hovered===a.id)&&{backgroundColor:c.selected},focused===a.id&&{borderColor:c.primary},disabled&&{opacity:.5}]}>
   <View style={s.icon}><AchievementBadge id={a.id} locked={locked}/></View>
   <Text style={s.name}>{a.name}</Text><Text style={s.description}>{a.description}</Text>
   <Text style={s.status}>{locked?'Locked':'✓ Collected'} · {a.progress} / {a.target}</Text>
   <View accessible accessibilityRole="progressbar" accessibilityLabel={`${a.name} progress`} accessibilityValue={{min:0,max:a.target,now:a.progress}} style={s.track}><View style={[s.fill,{width:`${a.progress/a.target*100}%`}]}/></View>
   {!locked&&<Text style={s.date}>Earned {date(a.unlockedAt!)}</Text>}
   <Text style={s.status}>View details ›</Text>
  </Pressable>;})}</View>
  <Text style={s.description}>Badges are keepsakes. They don’t change your XP or daily limits.</Text>
 </View>;
}
export function AchievementUnlock({badges,motion}:{badges:readonly AchievementProgress[];motion:boolean}){
 const lift=useRef(new Animated.Value(0)).current;
 useEffect(()=>{lift.setValue(0);if(!motion)return;const bounce=Animated.sequence([0,1,2].map(()=>Animated.sequence([Animated.timing(lift,{toValue:-6,duration:220,useNativeDriver:true}),Animated.timing(lift,{toValue:0,duration:220,useNativeDriver:true})])));bounce.start();return()=>{bounce.stop();lift.setValue(0);};},[lift,motion]);
 return <View style={s.unlock}><Text accessibilityRole="header" accessibilityLiveRegion="polite" accessibilityLabel={`New badges collected: ${badges.map(a=>a.name).join(', ')}`} style={s.name}>{badges.length===1?'New badge collected!':'New badges collected!'}</Text>
  {badges.map(a=><View key={a.id} style={s.unlockRow}><Animated.View style={{transform:[{translateY:lift}]}}><AchievementBadge id={a.id} size={52}/></Animated.View><View style={{flex:1,gap:4}}><Text style={s.name}>{a.name}</Text><Text style={s.description}>{a.description}</Text></View></View>)}
  <Text style={s.description}>Find your keepsakes in Progress.</Text>
 </View>;
}
const c=tokens.colors,s=StyleSheet.create({collection:{gap:12},title:{fontSize:26,lineHeight:32,fontWeight:'900',color:c.text},body:{fontSize:16,lineHeight:24,color:c.muted},grid:{flexDirection:'row',flexWrap:'wrap',gap:10},tile:{flexGrow:1,flexBasis:'46%',minWidth:130,padding:12,gap:8,borderWidth:2,borderColor:c.border,borderRadius:14,backgroundColor:c.surface},owned:{borderColor:c.text,borderBottomWidth:5},icon:{alignItems:'center',padding:4},name:{fontSize:16,lineHeight:22,fontWeight:'900',color:c.text},description:{fontSize:13,lineHeight:19,color:c.muted},status:{fontSize:12,lineHeight:18,fontWeight:'800',color:c.primary},date:{fontSize:11,lineHeight:16,color:c.muted},track:{height:8,borderRadius:3,overflow:'hidden',backgroundColor:c.selected},fill:{height:'100%',backgroundColor:c.primary},unlock:{padding:16,gap:12,borderWidth:3,borderBottomWidth:6,borderColor:c.text,borderRadius:16,backgroundColor:c.accent},unlockRow:{flexDirection:'row',alignItems:'center',gap:12,paddingTop:6}});
