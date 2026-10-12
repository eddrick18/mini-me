import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SpriteFrames } from './SpriteFrames';
import { spriteImages } from './spriteImages';
import frames from '../../../assets/character/taller-pixel/wave-frames.json';
import clothing from '../../../assets/character/taller-pixel/clothing-paths.json';
import { type Palette } from '../../domain/appearance';
import type { Outfit } from '../../domain/appearance';
import windbreakerPaths from '../../../assets/character/taller-pixel/windbreaker-clothing-paths.json';

const sequence=[0,1,2,3,2,3,1,0];

/** Complete-body frames share a feet anchor; no independently moving limb layers. */
export function WaveSprite({palette,outfit='casual',active,reactionId,onReady,onError}:{palette:Palette;outfit?:Outfit;active:boolean;reactionId:number|string|undefined;onReady:()=>void;onError:()=>void}){
 const [step,setStep]=useState(0);
 useEffect(()=>{setStep(0);if(!active)return;let index=0;const timer=setInterval(()=>{index++;setStep(Math.min(index,sequence.length-1));if(index>=sequence.length-1)clearInterval(timer);},220);return()=>clearInterval(timer);},[active,reactionId]);
 const running=outfit==='running';
 const rects=running?Array.from({length:4},()=>({width:160,height:240})):frames.states.wave;
 const paths=running?[windbreakerPaths[0]!,windbreakerPaths[2]!,windbreakerPaths[3]!,windbreakerPaths[2]!]:clothing.casual.wave;
 const index=sequence[step]!,rect=rects[index]!,scale=189/rect.height;
 return <View collapsable={false} testID={active?`companion-wave-frame-${index}`:'companion-wave-ready'} accessible={false} pointerEvents="none" style={{width:rect.width*scale,height:189,overflow:'hidden'}}>
  <SpriteFrames sources={running?spriteImages.runningWave:spriteImages.wave} rects={rects} paths={paths} index={index} scale={scale} palette={palette} onReady={onReady} onError={onError}/>
 </View>;
}
