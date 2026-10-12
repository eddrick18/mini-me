import test from 'node:test';
import assert from 'node:assert/strict';
import { applyCommand, emptyLedger, readLedger, totalXp } from '../src/domain/activity.ts';
import { defaultRoom } from '../src/domain/room.ts';
import { parseBackup, serializeBackup } from '../src/domain/backup.ts';
test('legacy saves gain an empty room; equipped starter decorations preserve activity and quest data',()=>{
 const legacy=emptyLedger();const raw=JSON.parse(JSON.stringify(legacy));delete raw.room;
 assert.deepEqual(readLedger(JSON.stringify(raw)).room,defaultRoom());
 const state=applyCommand(legacy,{type:'room',value:{desk:'desk-oak',plant:'plant-leaf',poster:'poster-sunset'}},1000);
 assert.equal(totalXp(state),0);assert.deepEqual(state.sessions,legacy.sessions);assert.deepEqual(state.questClaims,legacy.questClaims);
 assert.deepEqual(legacy.room,defaultRoom());assert.deepEqual(readLedger(JSON.stringify(state)),state);
 assert.deepEqual(parseBackup(serializeBackup(state,2000)).ledger,state);
});
test('locked and incorrect-slot room items are rejected in commands and backups',()=>{
 const state=emptyLedger();assert.throws(()=>applyCommand(state,{type:'room',value:{desk:'desk-ube',plant:null,poster:null}},1000),/owned/);
 assert.throws(()=>applyCommand(state,{type:'room',value:{desk:'plant-leaf',plant:null,poster:null}},1000),/owned/);
 const invalid={...state,room:{desk:null,plant:'plant-bloom',poster:null}};
 assert.throws(()=>readLedger(JSON.stringify(invalid)),/room/);
 assert.deepEqual(state.room,defaultRoom());
});
test('higher-level decorations equip through earned XP; old backups migrate safely',()=>{
 const state=emptyLedger();for(let i=0;i<10;i++){const at=Date.UTC(2026,8,i+1,3);state.sessions.push({id:`session-${i}`,activity:'Studying',startedAt:at,completedAt:at+1200000,activeMs:1200000,xp:30,rewardDay:`2026-09-${String(i+1).padStart(2,'0')}`});}
 const equipped=applyCommand(state,{type:'room',value:{desk:'desk-ube',plant:'plant-bloom',poster:'poster-stars'}},Date.UTC(2026,9,10));
 assert.deepEqual(parseBackup(serializeBackup(equipped)).ledger.room,equipped.room);
 const old=JSON.parse(serializeBackup(state));old.version=2;old.rule='mini-me-xp-v1';delete old.ledger.room;assert.deepEqual(parseBackup(JSON.stringify(old)).ledger.room,defaultRoom());
});

