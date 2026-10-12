import test from 'node:test';
import assert from 'node:assert/strict';
import { applyCommand, emptyLedger, readLedger } from '../src/domain/activity.ts';
import { weeklyProgress } from '../src/domain/weeklyProgress.ts';
import { parseBackup, serializeBackup } from '../src/domain/backup.ts';
const at=Date.parse('2026-10-10T00:01:00+08:00');
test('seven-day summary uses Manila boundaries, includes zero-XP time and separates quest rewards',()=>{
 let ledger=emptyLedger();
 for(const [id,time,duration] of [['old',at-7*86400000,300000],['yesterday',at-120000,300000],['today',at,4000]] as const){ledger=applyCommand(ledger,{type:'start',id,activity:'Studying'},time);ledger=applyCommand(ledger,{type:'finish',id,confirmedMs:duration},time);}
 ledger=applyCommand(ledger,{type:'claimQuest',id:'first',day:'2026-10-09'},at-120000);
 const week=weeklyProgress(ledger,at);
 assert.equal(week.days[0]?.day,'2026-10-04');assert.equal(week.days[6]?.day,'2026-10-10');
 assert.equal(week.count,2);assert.equal(week.activeMs,304000);assert.equal(week.activityXp,20);assert.equal(week.questXp,10);
 assert.equal(week.days[5]?.questXp,10);assert.equal(week.days[6]?.activityXp,0);
 assert.equal(weeklyProgress(ledger,at,1).count,1);assert.equal(ledger.sessions.length,3);
});
test('feedback preferences migrate, persist through backup and reject corrupt values without changing progress',()=>{
 const initial=emptyLedger(),legacy=JSON.parse(JSON.stringify(initial));delete legacy.feedback;
 assert.deepEqual(readLedger(JSON.stringify(legacy)).feedback,{sound:false,haptics:true});
 const state=applyCommand(initial,{type:'feedback',value:{sound:true,haptics:false}},at);
 assert.deepEqual(parseBackup(serializeBackup(state,at)).ledger.feedback,state.feedback);
 assert.deepEqual(initial.feedback,{sound:false,haptics:true});assert.deepEqual(state.sessions,initial.sessions);
 assert.throws(()=>readLedger(JSON.stringify({...state,feedback:{sound:'yes',haptics:true}})),/feedback/);
});

