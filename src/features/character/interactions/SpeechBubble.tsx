import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { tokens } from '../../../design/tokens';
import type { Bubble } from './engine';
export function SpeechBubble({bubble,onDismiss,width}:{bubble:Bubble|null;onDismiss:()=>void;width:number}){
 const [size,setSize]=useState<{width:number;height:number}|null>(null);
 if(!bubble)return null;
 const w=size?.width??0,h=size?.height??0,t=Math.min(26,Math.max(20,h/2));
 // Tail lives within an extended SVG viewport, so its tip cannot be clipped.
 const outline=`M30 2 H${w+6} V6 H${w+12} V12 H${w+16} V${h-12} H${w+12} V${h-6} H${w+6} V${h-2} H30 V${h-6} H24 V${h-12} H20 V${t+10} H12 V${t+6} H4 V${t} H12 V${t-6} H20 V12 H24 V6 H30 Z`;
 return <View style={{maxWidth:width,alignSelf:'flex-start',opacity:size?1:0}}>
 {size&&<Svg pointerEvents="none" accessible={false} width={w+18} height={h} style={{position:'absolute',left:-18,top:0}}><Path d={outline} fill={c.surface} stroke={c.text} strokeWidth={3} strokeLinejoin="miter"/></Svg>}
 <Pressable onLayout={event=>{const {width,height}=event.nativeEvent.layout;setSize(previous=>previous?.width===width&&previous.height===height?previous:{width,height});}} accessibilityRole="button" accessibilityLabel={`Companion says: ${bubble.message.text} Tap to dismiss.`} accessibilityHint="Dismisses this speech bubble" onPress={onDismiss} style={({pressed})=>[styles.balloon,{maxWidth:width},pressed&&{opacity:.75}]}>
  <ScrollView style={styles.reading} showsVerticalScrollIndicator nestedScrollEnabled><Text accessibilityLiveRegion={bubble.trigger==='idle'||Platform.OS!=='web'?'none':'polite'} style={styles.text}>{bubble.message.text}</Text></ScrollView>
 </Pressable></View>;
}
const c=tokens.colors;
const styles=StyleSheet.create({balloon:{minHeight:40,paddingHorizontal:10,paddingVertical:9,alignSelf:'flex-start'},reading:{maxHeight:140,flexGrow:0},text:{fontSize:15,lineHeight:20,fontWeight:'900',textAlign:'center',color:c.text}});
