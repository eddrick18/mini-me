import test from 'node:test';
import assert from 'node:assert/strict';
import { applyCommand, emptyLedger, readLedger, totalXp } from '../src/domain/activity.ts';
import { parseBackup, serializeBackup } from '../src/domain/backup.ts';
const at=Date.UTC(2026,9,10,15,59);
test('retired check-in history survives activity commands and backup round trips',()=>{
 const saved=readLedger(JSON.stringify({...emptyLedger(),checkins:[{day:'2026-10-10',mood:'stressed',updatedAt:at}]}));
 const active=applyCommand(saved,{type:'start',id:'study',activity:'Studying'},at);
 assert.deepEqual(active.checkins,saved.checkins);assert.equal(totalXp(active),0);
 assert.deepEqual(parseBackup(serializeBackup(saved,at+1000)).ledger.checkins,saved.checkins);
});
test('legacy records without check-ins load and malformed archived history is rejected',()=>{
 const legacy:any=emptyLedger();delete legacy.checkins;assert.deepEqual(readLedger(JSON.stringify(legacy)).checkins,[]);
 const entry={day:'2026-10-10',mood:'happy',updatedAt:at};
 for(const checkins of [[entry,entry],[{...entry,mood:'unknown'}],[{...entry,day:'2026-10-11'}]])assert.throws(()=>readLedger(JSON.stringify({...emptyLedger(),checkins})),/check-in/);
});
