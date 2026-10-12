export type Context='idle'|'studying'|'working'|'gym'|'running'|'music'|'paused'|'return'|'completed'|'exerciseComplete'|'levelUp';
export type Trigger='tap'|'idle'|'event';
export type Reaction='wave'|'sparkle';
export type Message={id:string;text:string;contexts:readonly Context[];triggers:readonly Trigger[];reaction?:Reaction};
// Stable IDs are localization keys. Text is bundled; never generated from private data.
export const messages:readonly Message[]=[
 {id:'idle.hello',text:'Hi!',contexts:['idle'],triggers:['tap','idle'],reaction:'wave'},
 {id:'idle.easy',text:'No rush. We can start small.',contexts:['idle'],triggers:['tap','idle'],reaction:'sparkle'},
 {id:'idle.here',text:'Hey, good to see you!',contexts:['idle'],triggers:['tap','idle'],reaction:'wave'},
 {id:'study.page',text:'One page at a time.',contexts:['studying'],triggers:['tap'],reaction:'sparkle'},
 {id:'study.space',text:'A little space to focus.',contexts:['studying'],triggers:['tap'],reaction:'wave'},
 {id:'work.progress',text:'Making progress, at your pace.',contexts:['working'],triggers:['tap'],reaction:'sparkle'},
 {id:'work.step',text:'One thing at a time.',contexts:['working'],triggers:['tap'],reaction:'wave'},
 {id:'gym.breathe',text:'A breath between sets.',contexts:['gym'],triggers:['tap'],reaction:'wave'},
 {id:'gym.pace',text:'Your pace is a good pace.',contexts:['gym'],triggers:['tap'],reaction:'sparkle'},
 {id:'run.steps',text:'Enjoy these steps.',contexts:['running'],triggers:['tap'],reaction:'wave'},
 {id:'run.look',text:'One step, then another.',contexts:['running'],triggers:['tap'],reaction:'sparkle'},
 {id:'music.moment',text:'This is a good moment.',contexts:['music'],triggers:['tap'],reaction:'sparkle'},
 {id:'music.enjoy',text:'Let’s enjoy the music.',contexts:['music'],triggers:['tap'],reaction:'wave'},
 {id:'paused.rest',text:'We can pick this up when you’re ready.',contexts:['paused'],triggers:['tap'],reaction:'wave'},
 {id:'paused.easy',text:'Take your time.',contexts:['paused'],triggers:['tap'],reaction:'sparkle'},
 {id:'return.hello',text:'Good to see you.',contexts:['return'],triggers:['event'],reaction:'wave'},
 {id:'saved.done',text:'A little moment, saved.',contexts:['completed'],triggers:['event'],reaction:'sparkle'},
 {id:'saved.exercise',text:'That deserves a stretch.',contexts:['exerciseComplete'],triggers:['event'],reaction:'sparkle'},
 {id:'level.grow',text:'Look how far we’ve come!',contexts:['levelUp'],triggers:['event'],reaction:'sparkle'},
 {id:'fallback.hello',text:'Hey, good to see you.',contexts:[],triggers:['tap','idle','event'],reaction:'wave'},
];
export function selectMessage(context:string,trigger:Trigger,recent:readonly string[],random:()=>number=Math.random):Message{
 const pool=messages.filter(m=>m.contexts.includes(context as Context)&&m.triggers.includes(trigger));
 if(!pool.length)return messages[messages.length-1]!;
 const fresh=pool.filter(m=>!recent.includes(m.id));
 const choices=fresh.length?fresh:[...pool].sort((a,b)=>recent.indexOf(a.id)-recent.indexOf(b.id)).slice(0,1);
 const r=random();return choices[Math.min(choices.length-1,Math.max(0,Math.floor((Number.isFinite(r)?r:0)*choices.length)))]!;
}
export const readingMs=(text:string)=>Math.max(7000,Math.min(20000,3500+text.split(/\s+/).length*450));
