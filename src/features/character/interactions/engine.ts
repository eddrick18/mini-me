import { readingMs, selectMessage, type Message, type Trigger } from './messages.ts';
export type Eligibility={foreground:boolean;focused:boolean;visible:boolean;blocked:boolean;celebrating:boolean;spontaneous:boolean;idleAllowed:boolean;context:string;screenReader?:boolean};
export type Bubble={message:Message;trigger:Trigger;expiresAt:number;reactionUntil:number};
export type Timing={idleMinMs:number;idleMaxMs:number;tapCooldownMs:number;eventCooldownMs:number;reactionMs:number};
export const defaultTiming:Timing={idleMinMs:60000,idleMaxMs:180000,tapCooldownMs:800,eventCooldownMs:3000,reactionMs:1800};
type Clock={now:()=>number;setTimeout:(fn:()=>void,ms:number)=>unknown;clearTimeout:(id:unknown)=>void};
export function createInteractions(clock:Clock,random:()=>number,onChange:(bubble:Bubble|null)=>void,timing:Timing=defaultTiming){
 let gates:Eligibility={foreground:false,focused:false,visible:false,blocked:true,celebrating:false,spontaneous:false,idleAllowed:false,context:'idle'};
 let bubble:Bubble|null=null,idleTimer:unknown=null,expiryTimer:unknown=null,reactionTimer:unknown=null,disposed=false;
 let recent:string[]=[],lastTap=-Infinity,lastEvent=-Infinity,lastIdle=-Infinity,lastMeaningful=-Infinity;
 const idleMin=Math.max(1000,timing.idleMinMs),idleMax=Math.max(idleMin,timing.idleMaxMs);
 const allowed=()=>!disposed&&gates.foreground&&gates.focused&&gates.visible&&!gates.blocked;
 const idleAllowed=()=>allowed()&&!gates.celebrating&&gates.spontaneous&&gates.idleAllowed;
 const cancelIdle=()=>{if(idleTimer!==null)clock.clearTimeout(idleTimer);idleTimer=null;};
 const clearBubble=()=>{if(expiryTimer!==null)clock.clearTimeout(expiryTimer);if(reactionTimer!==null)clock.clearTimeout(reactionTimer);expiryTimer=reactionTimer=null;if(bubble){bubble=null;onChange(null);}};
 function schedule(){cancelIdle();if(!idleAllowed()||bubble)return;const r=Math.min(1,Math.max(0,random()));
  const ms=Math.max(idleMin+(idleMax-idleMin)*(Number.isFinite(r)?r:0),lastIdle+idleMin-clock.now(),lastMeaningful+idleMin-clock.now());
  idleTimer=clock.setTimeout(()=>{idleTimer=null;if(!idleAllowed()||bubble)return;emit('idle',gates.context);},ms);
 }
 function emit(trigger:Trigger,context:string){
  if(!allowed())return false;
  const now=clock.now();
  if(trigger==='idle'&&(!idleAllowed()||bubble||now-lastIdle<idleMin||now-lastMeaningful<idleMin))return false;
  if(trigger==='tap'&&(gates.celebrating||bubble?.trigger==='event'||now-lastTap<timing.tapCooldownMs))return false;
  if(trigger==='event'&&now-lastEvent<timing.eventCooldownMs)return false;
  clearBubble();cancelIdle();
  if(trigger==='tap'){lastTap=now;lastMeaningful=now;}else if(trigger==='event'){lastEvent=now;lastMeaningful=now;}else lastIdle=now;
  const message=selectMessage(context,trigger,recent,random);recent=[...recent,message.id].slice(-4);
  bubble={message,trigger,expiresAt:now+readingMs(message.text),reactionUntil:now+timing.reactionMs};onChange(bubble);
  reactionTimer=clock.setTimeout(()=>{reactionTimer=null;if(disposed||!bubble)return;bubble={...bubble,reactionUntil:0};onChange(bubble);},timing.reactionMs);
  if(!gates.screenReader)expiryTimer=clock.setTimeout(()=>{expiryTimer=null;clearBubble();schedule();},readingMs(message.text));return true;
 }
 return {
  configure(next:Eligibility){const changed=Object.keys(next).some(key=>next[key as keyof Eligibility]!==gates[key as keyof Eligibility]);const contextChanged=next.context!==gates.context;gates={...next};
   if(contextChanged)clearBubble();
   if(gates.screenReader&&expiryTimer!==null){clock.clearTimeout(expiryTimer);expiryTimer=null;}
   if(!allowed()||(bubble?.trigger!=='event'&&gates.celebrating)||(bubble?.trigger==='idle'&&!idleAllowed()))clearBubble();
   if(changed||idleTimer===null)schedule();
  },
  tap:()=>emit('tap',gates.context),event:(context:string)=>emit('event',context),
  dismiss(){clearBubble();schedule();},
  suspend(){gates={...gates,visible:false};cancelIdle();clearBubble();},
  dispose(){disposed=true;cancelIdle();clearBubble();},
 };
}
