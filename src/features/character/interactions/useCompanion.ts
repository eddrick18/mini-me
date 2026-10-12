import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import { createInteractions, type Bubble, type Eligibility } from './engine';
export function useCompanion(gates:Eligibility,event:{id:string;context:string}|null){
 const [bubble,setBubble]=useState<Bubble|null>(null),[screenReader,setScreenReader]=useState(false);
 gates={...gates,screenReader};
 const engine=useRef<ReturnType<typeof createInteractions>|null>(null),latest=useRef(gates),seen=useRef<string|null>(null);
 latest.current=gates;
 useEffect(()=>{let alive=true;const listener=AccessibilityInfo.addEventListener('screenReaderChanged',setScreenReader);void AccessibilityInfo.isScreenReaderEnabled().then(value=>{if(alive)setScreenReader(value);}).catch(()=>{});return()=>{alive=false;listener.remove();};},[]);
 useEffect(()=>{
  let alive=true,lastAnnouncement='';
  const controller=createInteractions({now:Date.now,setTimeout:(fn,ms)=>setTimeout(fn,ms),clearTimeout:id=>clearTimeout(id as ReturnType<typeof setTimeout>)},Math.random,value=>{if(!alive)return;setBubble(value);if(Platform.OS!=='web'&&value&&value.trigger!=='idle'){const key=value.message.id+':'+value.expiresAt;if(key!==lastAnnouncement){lastAnnouncement=key;AccessibilityInfo.announceForAccessibilityWithOptions(value.message.text,{queue:true});}}});
  engine.current=controller;controller.configure(latest.current);
  return()=>{alive=false;controller.dispose();engine.current=null;};
 },[]);
 useEffect(()=>{const controller=engine.current;if(!controller)return;controller.configure(gates);
  if(event&&event.id!==seen.current&&gates.foreground&&gates.focused&&gates.visible&&!gates.blocked){seen.current=event.id;controller.event(event.context);}
 },[gates.foreground,gates.focused,gates.visible,gates.blocked,gates.celebrating,gates.spontaneous,gates.idleAllowed,gates.context,screenReader,event?.id]);
 return {bubble,tap:()=>engine.current?.tap(),dismiss:()=>engine.current?.dismiss(),suspend:()=>engine.current?.suspend()};
}
