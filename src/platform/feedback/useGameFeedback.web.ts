import { useEffect, useRef } from 'react';
import type { FeedbackPreferences } from '../../domain/activity';
import type { FeedbackCue } from './types';
const sources={xp:require('../../../assets/audio/xp.wav'),sigh:require('../../../assets/audio/sigh.wav'),quest:require('../../../assets/audio/quest.wav'),level:require('../../../assets/audio/level.wav')};
export function useGameFeedback(preferences:FeedbackPreferences|undefined,foreground:boolean){
 const players=useRef<Partial<Record<keyof typeof sources,HTMLAudioElement>>>({}),current=useRef({preferences,foreground}),last=useRef(0);current.current={preferences,foreground};
 useEffect(()=>{if(!foreground||!preferences?.sound)Object.values(players.current).forEach(p=>p.pause());},[foreground,preferences?.sound]);
 useEffect(()=>()=>{Object.values(players.current).forEach(p=>{p.pause();p.src='';});},[]);
 return (cue:FeedbackCue)=>{
  try{
  if(!current.current.foreground||Date.now()-last.current<150)return;last.current=Date.now();
  if(current.current.preferences?.haptics&&typeof navigator.vibrate==='function')navigator.vibrate(cue==='equip'||cue==='sigh'?12:[15,30,15]);
  if(!current.current.preferences?.sound||cue==='equip')return;
  Object.values(players.current).forEach(p=>p.pause());
  const source=sources[cue],url=typeof source==='string'?source:source.uri;
  const player=players.current[cue]??new Audio(url);players.current[cue]=player;player.volume=.45;player.currentTime=0;void player.play().catch(()=>{});
  }catch{/* Device feedback must never prevent a saved action from completing. */}
 };
}
