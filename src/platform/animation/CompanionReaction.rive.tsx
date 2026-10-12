import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Fit, RiveView, useRive, useRiveFile, useViewModelInstance } from '@rive-app/react-native';
import { reactionDisplayState, type CompanionReaction as Reaction } from '../../features/character/controller';
import { ReactionBadge } from './ReactionBadge';
import { tokens } from '../../design/tokens';
export function CompanionReaction({reaction}:{reaction:Reaction}){
 const {riveFile,error}=useRiveFile(require('../../../assets/character/companion-reactions.riv'));
 const {instance,error:modelError}=useViewModelInstance(riveFile,{async:true});
 const {riveViewRef,setHybridRef}=useRive();const [failed,setFailed]=useState(false);
 useEffect(()=>{if(error||modelError||riveViewRef===null)setFailed(true);},[error,modelError,riveViewRef]);
 useEffect(()=>{if(!instance||!riveViewRef)return;try{const property=instance.numberProperty('reaction');if(!property)throw new Error('Missing reaction contract');property.set(reactionDisplayState(reaction,true,['wave','sparkle']).reactionValue);riveViewRef.playIfNeeded();}catch{setFailed(true);}},[instance,riveViewRef,reaction]);
 if(failed||!riveFile||!instance)return <ReactionBadge reaction={reaction}/>;
 return <View pointerEvents="none" accessible={false} style={{width:56,height:56,borderWidth:2,borderColor:tokens.colors.text,backgroundColor:tokens.colors.accent,borderRadius:8,overflow:'hidden'}}><RiveView file={riveFile} dataBind={instance} hybridRef={setHybridRef} artboardName="CompanionReactions" stateMachineName="ReactionController" fit={Fit.Contain} autoPlay frameRate={30} onError={()=>setFailed(true)} style={{width:52,height:52}}/></View>;
}
