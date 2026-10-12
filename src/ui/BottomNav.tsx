import { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { tokens } from '../design/tokens';
export type MainTab='home'|'quests'|'inventory'|'weekly'|'settings';
const tabs=[{id:'home',label:'Home',path:'M4 12V9H7V6H10V3H14V6H17V9H20V12H18V21H14V15H10V21H6V12Z'},{id:'quests',label:'Quests',path:'M9 3H15V6H21V12H18V18H15V21H9V18H6V12H3V6H9ZM9 9V12H6V9ZM15 9H18V12H15Z'},{id:'inventory',label:'Inventory',path:'M8 3H10V6H14V3H16V6H19V9H22V15H17V21H7V15H2V9H5V6H8Z'},{id:'weekly',label:'Progress',path:'M3 15H7V21H3ZM10 9H14V21H10ZM17 3H21V21H17Z'},{id:'settings',label:'Settings',path:'M9 2H15V5H19V9H22V15H19V19H15V22H9V19H5V15H2V9H5V5H9ZM9 9V15H15V9Z'}] as const;
function NavItem({tab,selected,disabled,motion,onPress}:{tab:typeof tabs[number];selected:boolean;disabled:boolean;motion:boolean;onPress:()=>void}){
 const lift=useRef(new Animated.Value(0)).current,scale=useRef(new Animated.Value(1)).current;
 const [hover,setHover]=useState(false),[focus,setFocus]=useState(false),[pressed,setPressed]=useState(false);
 useEffect(()=>{
  lift.stopAnimation();scale.stopAnimation();
  if(!motion||disabled){lift.setValue(0);scale.setValue(1);return;}
  const animation=Animated.parallel([Animated.spring(lift,{toValue:pressed?0:hover||focus?-4:0,useNativeDriver:Platform.OS!=='web',speed:24,bounciness:5}),Animated.spring(scale,{toValue:pressed?.96:hover||focus?1.05:1,useNativeDriver:Platform.OS!=='web',speed:24,bounciness:5})]);animation.start();return()=>animation.stop();
 },[hover,focus,pressed,motion,disabled,lift,scale]);
 return <Pressable accessibilityRole="button" accessibilityLabel={selected?`${tab.label}, current screen`:tab.label} accessibilityState={{disabled}} disabled={disabled} onPress={onPress} onHoverIn={()=>setHover(true)} onHoverOut={()=>setHover(false)} onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)} onPressIn={()=>setPressed(true)} onPressOut={()=>setPressed(false)} style={[s.item,disabled&&s.disabled]}><Animated.View style={[s.badge,(selected||hover)&&s.selected,focus&&s.focus,{transform:[{translateY:lift},{scale}]}]}><Svg width={24} height={24} viewBox="0 0 24 24" accessible={false}><Path d={tab.path} fill={selected?tokens.colors.text:tokens.colors.primary} fillRule="evenodd"/></Svg></Animated.View><Text style={[s.label,selected&&s.activeLabel]}>{tab.label}</Text><View style={[s.marker,selected&&s.activeMarker]}/></Pressable>;
}
export function BottomNav({selected,disabled,motion,onNavigate}:{selected:MainTab;disabled:boolean;motion:boolean;onNavigate:(tab:MainTab)=>void}){
 return <View style={s.dock}><View role="navigation" accessibilityLabel="Main navigation" style={s.bar}>{tabs.map(tab=><NavItem key={tab.id} tab={tab} selected={selected===tab.id} disabled={disabled} motion={motion} onPress={()=>onNavigate(tab.id)}/>)}</View></View>;
}
const c=tokens.colors,s=StyleSheet.create({dock:{backgroundColor:c.background,paddingHorizontal:10,paddingTop:8,paddingBottom:4,alignItems:'center'},bar:{width:'100%',maxWidth:500,flexDirection:'row',backgroundColor:c.surface,borderWidth:2,borderBottomWidth:5,borderColor:c.text,borderRadius:20,paddingHorizontal:4,paddingTop:8,paddingBottom:4},item:{flex:1,minHeight:68,alignItems:'center',justifyContent:'center',gap:3},badge:{width:40,height:34,alignItems:'center',justifyContent:'center',borderRadius:10,borderWidth:2,borderColor:'transparent'},selected:{backgroundColor:c.accent,borderColor:c.text},focus:{borderColor:c.primary},label:{fontSize:10,lineHeight:15,fontWeight:'700',color:c.muted},activeLabel:{color:c.text,fontWeight:'900'},marker:{width:12,height:3,borderRadius:2,backgroundColor:'transparent'},activeMarker:{backgroundColor:c.primary},disabled:{opacity:.5}});

