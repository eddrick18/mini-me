import test from 'node:test';
import assert from 'node:assert/strict';
import { createInteractions, type Bubble, type Eligibility } from '../src/features/character/interactions/engine.ts';
import { selectMessage, readingMs } from '../src/features/character/interactions/messages.ts';
import { reactionDisplayState } from '../src/features/character/controller.ts';
import { emptyLedger, applyCommand, readLedger, elapsed, totalXp } from '../src/domain/activity.ts';
import { parseBackup, serializeBackup } from '../src/domain/backup.ts';
function fixture(){let now=0,sequence=0;const timers=new Map<number,{at:number;fn:()=>void}>();let bubble:Bubble|null=null;
 const clock={now:()=>now,setTimeout:(fn:()=>void,ms:number)=>{const id=++sequence;timers.set(id,{at:now+ms,fn});return id;},clearTimeout:(id:unknown)=>{timers.delete(id as number);}};
 const engine=createInteractions(clock,()=>0,b=>{bubble=b;});
 const gates:Eligibility={foreground:true,focused:true,visible:true,blocked:false,celebrating:false,spontaneous:true,idleAllowed:true,context:'idle'};engine.configure(gates);
 const advance=(ms:number)=>{const end=now+ms;while(true){const next=[...timers.entries()].filter(([,v])=>v.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;now=next[1].at;timers.delete(next[0]);next[1].fn();}now=end;};
 return {engine,gates,advance,bubble:()=>bubble,timers};
}
test('direct tap is immediate, locally throttled, replaces rather than stacks and avoids repeats',()=>{
 const f=fixture();assert.equal(f.engine.tap(),true);const first=f.bubble()!.message.id;assert.equal(f.engine.tap(),false);assert.equal(f.bubble()!.message.id,first);
 f.advance(800);assert.equal(f.engine.tap(),true);assert.notEqual(f.bubble()!.message.id,first);assert.equal(f.timers.size,2);
 f.advance(20000);assert.equal(f.bubble(),null);assert.equal(f.timers.size,1);
});
test('idle is quiet for 60 seconds; direct feedback interrupts it with its own cooldown',()=>{
 const f=fixture();f.advance(59999);assert.equal(f.bubble(),null);f.advance(1);assert.equal(f.bubble()!.trigger,'idle');assert.equal(f.engine.tap(),true);assert.equal(f.bubble()!.trigger,'tap');
 f.engine.dismiss();f.advance(59999);assert.equal(f.bubble(),null);f.advance(1);assert.equal(f.bubble()!.trigger,'idle');
});
test('background, navigation, offscreen and blocking actions cancel timers and never catch up',()=>{
 for(const key of ['foreground','focused','visible','blocked'] as const){const f=fixture();f.engine.tap();f.engine.configure({...f.gates,[key]:key==='blocked'});assert.equal(f.timers.size,0);assert.equal(f.bubble(),null);f.advance(300000);f.engine.configure(f.gates);assert.equal(f.bubble(),null);f.advance(59999);assert.equal(f.bubble(),null);f.advance(1);assert.equal(f.bubble()!.trigger,'idle');}
});
test('disabled spontaneous speech and active-task gate suppress idle while preserving taps',()=>{
 for(const key of ['spontaneous','idleAllowed'] as const){const f=fixture();f.engine.configure({...f.gates,[key]:false,context:'studying'});f.advance(300000);assert.equal(f.bubble(),null);assert.equal(f.engine.tap(),true);assert.match(f.bubble()!.message.id,/study/);}
});
test('completion and level events interrupt taps; taps cannot replace the event or celebration',()=>{
 const f=fixture();f.engine.tap();f.engine.configure({...f.gates,celebrating:true,idleAllowed:false});assert.equal(f.bubble(),null);assert.equal(f.engine.tap(),false);
 assert.equal(f.engine.event('levelUp'),true);assert.equal(f.bubble()!.message.id,'level.grow');f.engine.configure({...f.gates,idleAllowed:false});assert.equal(f.engine.tap(),false);assert.equal(f.engine.event('completed'),false);
 f.advance(20000);assert.equal(f.engine.tap(),true);
});
test('dismissal, screen-reader reading time, reaction timeout and disposal clean up',()=>{
 const f=fixture();f.engine.configure({...f.gates,screenReader:true});f.engine.tap();f.advance(1800);assert.equal(f.bubble()!.reactionUntil,0);f.advance(30000);assert.ok(f.bubble());f.engine.dismiss();assert.equal(f.bubble(),null);f.engine.dispose();assert.equal(f.timers.size,0);f.advance(300000);assert.equal(f.engine.tap(),false);
});
test('unknown contexts use bundled fallback; missing Rive and reduced motion are safe',()=>{
 assert.equal(selectMessage('unknown','tap',[],()=>.5).id,'fallback.hello');
 assert.equal(reactionDisplayState('wave',true,[]).mode,'static');assert.equal(reactionDisplayState('wave',false,['wave']).mode,'text');assert.equal(reactionDisplayState('wave',true,['wave']).reactionValue,1);
 assert.ok(readingMs('A much longer message with enough words to give the reader additional time to read everything here.')>readingMs('Hi.'));
});
test('companion settings migrate, persist and round-trip without changing timer, session or XP',()=>{
 const legacy=emptyLedger();delete (legacy as Partial<typeof legacy>).companion;const migrated=readLedger(JSON.stringify(legacy));assert.deepEqual(migrated.companion,{spontaneous:true,reactions:true});
 const active=applyCommand(migrated,{type:'start',id:'study-test',activity:'Studying'},1000),before=JSON.stringify(active.active);
 const changed=applyCommand(active,{type:'companion',value:{spontaneous:false,reactions:false}},3000);
 assert.equal(JSON.stringify(changed.active),before);assert.equal(elapsed(changed.active!,3000),2000);assert.equal(totalXp(changed),0);
 const f=fixture();for(let i=0;i<10;i++){f.engine.tap();f.advance(1000);}assert.equal(JSON.stringify(changed.active),before);assert.equal(totalXp(changed),0);
 const restored=parseBackup(serializeBackup(changed,3000)).ledger;assert.deepEqual(restored.companion,changed.companion);
 assert.throws(()=>readLedger(JSON.stringify({...migrated,companion:{spontaneous:'yes',reactions:true}})));
});
