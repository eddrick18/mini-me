import test from 'node:test';
import assert from 'node:assert/strict';
import { applyCommand, emptyLedger, readLedger, rewardDay, totalXp } from '../src/domain/activity.ts';
import { questProgress } from '../src/domain/quests.ts';
import { parseBackup, serializeBackup } from '../src/domain/backup.ts';
const at=Date.UTC(2026,9,10,15,30),day=rewardDay(at);
function finish(state=emptyLedger(),id='first',minutes=5,now=at){return applyCommand(applyCommand(state,{type:'start',id,activity:'Music'},now),{type:'finish',id,confirmedMs:minutes*60000},now+1000);}
test('quests use saved active time; claims are eligible, idempotent and do not change activity caps',()=>{
 assert.throws(()=>applyCommand(emptyLedger(),{type:'claimQuest',id:'first',day},at),/Finish/);
 let state=finish();assert.equal(questProgress(state.sessions,day,'time'),5);
 state=applyCommand(state,{type:'claimQuest',id:'first',day},at+2000);assert.equal(totalXp(state),30);
 assert.deepEqual(applyCommand(state,{type:'claimQuest',id:'first',day},at+3000),state);
 state=finish(state,'second',15,at+4000);
 state=applyCommand(state,{type:'claimQuest',id:'time',day},at+6000);
 state=applyCommand(state,{type:'claimQuest',id:'two',day},at+7000);
 state=finish(state,'third',20,at+8000);assert.equal(state.sessions[2]!.xp,0);
 assert.equal(totalXp(state),70);assert.deepEqual(readLedger(JSON.stringify(state)),state);
 assert.deepEqual(parseBackup(serializeBackup(state,at+10000)).ledger,state);
});
test('Manila midnight rejects yesterday claims without losing rewards; legacy backups remain readable',()=>{
 const state=finish();assert.equal(rewardDay(at+3600000),'2026-10-11');
 assert.throws(()=>applyCommand(state,{type:'claimQuest',id:'first',day},at+3600000),/ended/);
 assert.equal(questProgress(state.sessions,rewardDay(at+3600000),'first'),0);
 const raw=JSON.parse(serializeBackup(state,at));raw.version=1;raw.rule='mini-me-xp-v1';delete raw.ledger.questClaims;
 assert.deepEqual(parseBackup(JSON.stringify(raw)).ledger.questClaims,[]);
});
test('invalid and unearned quest receipts cannot be imported; later sessions preserve earlier claims',()=>{
 const state=applyCommand(finish(),{type:'claimQuest',id:'first',day},at+2000);
 const duplicate={...state,questClaims:[...state.questClaims,...state.questClaims]};
 assert.throws(()=>readLedger(JSON.stringify(duplicate)),/quest/);
 assert.throws(()=>readLedger(JSON.stringify({...state,questClaims:[{...state.questClaims[0],id:'two'}]})),/quest/);
 assert.throws(()=>readLedger(JSON.stringify({...state,questClaims:[{...state.questClaims[0],xp:999}]})),/quest/);
 assert.deepEqual(readLedger(JSON.stringify(finish(state,'later',5,at+3000))).questClaims,state.questClaims);
});

test('failed quest persistence keeps the reward claimable; retry and reopen award only once',async()=>{
 const {openSessionStore}=await import('../src/data/sessionStore.web.ts');const values=new Map<string,string>();let fail=false;
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>{if(fail)throw new Error('full');values.set(k,v);}}});
 try{const store=await openSessionStore();await store.replace(finish());fail=true;await assert.rejects(()=>store.execute({type:'claimQuest',id:'first',day},at+2000),/full/);fail=false;assert.equal((await store.load()).questClaims.length,0);await store.execute({type:'claimQuest',id:'first',day},at+2000);const reopened=await openSessionStore();await reopened.execute({type:'claimQuest',id:'first',day},at+3000);assert.equal(totalXp(await reopened.load()),30);assert.equal((await reopened.load()).questClaims.length,1);}finally{Reflect.deleteProperty(globalThis,'localStorage');}
});


