import { useEffect, useRef } from 'react';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import type { FeedbackPreferences } from '../../domain/activity';
import type { FeedbackCue } from './types';
export function useGameFeedback(preferences:FeedbackPreferences|undefined,foreground:boolean){
 const xp=useAudioPlayer(require('../../../assets/audio/xp.wav')),sigh=useAudioPlayer(require('../../../assets/audio/sigh.wav')),quest=useAudioPlayer(require('../../../assets/audio/quest.wav')),level=useAudioPlayer(require('../../../assets/audio/level.wav'));
 const current=useRef({preferences,foreground});current.current={preferences,foreground};
 const generation=useRef(0),last=useRef(0);
 useEffect(()=>{void setAudioModeAsync({playsInSilentMode:false,shouldPlayInBackground:false,interruptionMode:'mixWithOthers'}).catch(()=>{});},[]);
 useEffect(()=>{generation.current++;if(!foreground||!preferences?.sound){for(const player of [xp,sigh,quest,level])player.pause();}},[foreground,preferences?.sound,xp,sigh,quest,level]);
 return (cue:FeedbackCue)=>{
  try{
  if(!current.current.foreground||Date.now()-last.current<150)return;last.current=Date.now();
  if(current.current.preferences?.haptics)void (cue==='equip'?Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light):cue==='sigh'?Haptics.selectionAsync():Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)).catch(()=>{});
  if(!current.current.preferences?.sound||cue==='equip')return;
  const players={xp,sigh,quest,level},player=players[cue],token=++generation.current;
  for(const item of Object.values(players))item.pause();
  player.volume=.45;
  void player.seekTo(0).then(()=>{if(token===generation.current&&current.current.foreground&&current.current.preferences?.sound)player.play();}).catch(()=>{});
  }catch{/* Device feedback must never prevent a saved action from completing. */}
 };
}
