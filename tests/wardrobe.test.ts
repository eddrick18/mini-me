import test from 'node:test';
import assert from 'node:assert/strict';
import { applyCommand, emptyLedger, readLedger, type Ledger } from '../src/domain/activity.ts';

test('legacy saves gain starter appearance without changing sessions or active timer',()=>{
 const ledger=applyCommand(emptyLedger(),{type:'start',id:'active',activity:'Music'},1000);
 const {appearance,...legacy}=ledger;
 const upgraded=readLedger(JSON.stringify(legacy));
 assert.deepEqual(upgraded.appearance,{outfit:'casual',palette:'original'});
 assert.deepEqual(upgraded.active,ledger.active);
 assert.deepEqual(upgraded.sessions,ledger.sessions);
 assert.deepEqual(readLedger(JSON.stringify(upgraded)),upgraded);
});
test('locked colors cannot be worn; level 2 colors and starter outfit persist without awarding XP',()=>{
 const source=emptyLedger();
 assert.throws(()=>applyCommand(source,{type:'appearance',value:{outfit:'casual',palette:'coral'}},1000),/level 2/);
 assert.deepEqual(source.appearance,{outfit:'casual',palette:'original'});
 let ledger:Ledger=source;
 for(let i=0;i<4;i++){
  ledger=applyCommand(ledger,{type:'start',id:String(i),activity:i<2?'Studying':'Working'},1000);
  ledger=applyCommand(ledger,{type:'finish',id:String(i),confirmedMs:1200000},1000);
 }
 const updated=applyCommand(ledger,{type:'appearance',value:{outfit:'running',palette:'coral'}},1000);
 assert.deepEqual(readLedger(JSON.stringify(updated)).appearance,{outfit:'running',palette:'coral'});
 assert.deepEqual(updated.sessions,ledger.sessions);
 assert.deepEqual(updated.active,ledger.active);
 assert.throws(()=>readLedger(JSON.stringify({...source,appearance:{outfit:'casual',palette:'green'}})),/Damaged appearance/);
 assert.throws(()=>readLedger(JSON.stringify({...source,appearance:{outfit:'invalid',palette:'original'}})),/Damaged appearance/);
});
