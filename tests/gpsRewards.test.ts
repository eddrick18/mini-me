import test from 'node:test';
import assert from 'node:assert/strict';
import { applyCommand, emptyLedger, gpsBaseXp, type Ledger } from '../src/domain/activity.ts';
import { parseBackup, serializeBackup } from '../src/domain/backup.ts';
const at=Date.UTC(2026,9,10,2);
function save(distance:number,state:Ledger=emptyLedger(),id='gps'){
 let next=applyCommand(state,{type:'start',id,activity:'Running'},at);
 next.active!.gps={distanceM:distance};
 next=applyCommand(next,{type:'pause',id},at+1000);
 next=applyCommand(next,{type:'resume',id},at+2000);
 return applyCommand(next,{type:'finish',id,confirmedMs:1200000},at+3000);
}
test('GPS rewards use distance, preserve pauses, and share the category cap',()=>{
 assert.deepEqual([999,1000,2999,3000].map(gpsBaseXp),[0,20,20,30]);
 assert.equal(save(0).sessions[0]!.xp,0);
 let state=save(1000);assert.equal(state.sessions[0]!.xp,20);
 assert.equal(state.sessions[0]!.gps!.distanceM,1000);
 state=save(3000,state,'second');state=save(3000,state,'third');
 assert.deepEqual(state.sessions.map(s=>s.xp),[20,30,0]);
 assert.deepEqual(applyCommand(state,{type:'finish',id:'third'},at+4000),state);
});
test('GPS backups retain only totals, reject invalid rewards, and migrate legacy running',()=>{
 const state=save(1000);const raw=JSON.parse(serializeBackup(state,at+4000));
 raw.ledger.sessions[0].gps.latitude=14;raw.ledger.sessions[0].gps.route=[121];
 const restored=parseBackup(JSON.stringify(raw)).ledger;
 assert.deepEqual(restored.sessions[0]!.gps,{distanceM:1000});
 raw.ledger.sessions[0].xp=30;raw.summary.xp=30;
 assert.throws(()=>parseBackup(JSON.stringify(raw)),/invalid/);
 const legacy=JSON.parse(serializeBackup(state,at+4000));
 delete legacy.ledger.sessions[0].gps;legacy.ledger.sessions[0].xp=30;legacy.summary.xp=30;
 legacy.version=3;legacy.rule='mini-me-xp-v1';
 const migrated=parseBackup(JSON.stringify(legacy)).ledger;
 assert.equal(migrated.sessions[0]!.xp,30);
 assert.equal(parseBackup(serializeBackup(migrated)).ledger.sessions[0]!.xp,30);
 legacy.ledger.sessions[0].gps={distanceM:1000};
 assert.throws(()=>parseBackup(JSON.stringify(legacy)),/invalid/);
});
