import test from 'node:test';
import assert from 'node:assert/strict';
import { applyCommand, emptyLedger, type Ledger } from '../src/domain/activity.ts';
import { BACKUP_LIMIT, byteLength, parseBackup, serializeBackup } from '../src/domain/backup.ts';
import { openSessionStore } from '../src/data/sessionStore.web.ts';
const at=Date.UTC(2026,9,10,7);
function completed():Ledger{let ledger=applyCommand(emptyLedger(),{type:'start',id:'one',activity:'Studying'},at);return applyCommand(ledger,{type:'finish',id:'one',confirmedMs:1200000},at+1000);}
test('backup round trip preserves progress/preferences and snapshots running time without modifying source',()=>{
 const state=applyCommand(completed(),{type:'still',value:true},at+2000);
 const active=applyCommand(state,{type:'start',id:'two',activity:'Running'},at+3000);
 const restored=parseBackup(serializeBackup(active,at+8000));
 assert.equal(restored.ledger.active?.status,'interrupted');assert.equal(restored.ledger.active?.activeMs,5000);
 assert.equal(restored.ledger.preferStill,true);assert.deepEqual(restored.ledger.sessions,active.sessions);
 assert.equal(active.active?.status,'running');assert.equal(active.active?.activeMs,0);
 assert.equal(restored.summary.xp,30);
 assert.throws(()=>serializeBackup(active,at+3000+604800001),/invalid/);
});
test('malformed, oversized, incompatible and inconsistent backups are rejected',()=>{
 const raw=serializeBackup(completed(),at),backup=JSON.parse(raw);
 assert.throws(()=>parseBackup('not JSON'),/valid Mini Me/);
 assert.throws(()=>parseBackup(' '.repeat(BACKUP_LIMIT+1)),/5 MB/);
 assert.equal(byteLength('aé😀'),7);
 for(const value of [{...backup,version:99},{...backup,rule:'wrong'},{...backup,timezone:'UTC'},{...backup,summary:{sessions:1,xp:99}}])assert.throws(()=>parseBackup(JSON.stringify(value)),/invalid/);
 const duplicate={...backup,ledger:{...backup.ledger,sessions:[...backup.ledger.sessions,...backup.ledger.sessions]}};
 assert.throws(()=>parseBackup(JSON.stringify(duplicate)),/invalid/);
 const invalidDay={...backup,ledger:{...backup.ledger,sessions:[{...backup.ledger.sessions[0],rewardDay:'invalid'}]}};
 assert.throws(()=>parseBackup(JSON.stringify(invalidDay)),/invalid/);
 const invalidDuration={...backup,ledger:{...backup.ledger,sessions:[{...backup.ledger.sessions[0],activeMs:1000}]}};
 assert.throws(()=>parseBackup(JSON.stringify(invalidDuration)),/invalid/);
});
test('reward caps and locked appearances cannot bypass import validation',()=>{
 const backup=JSON.parse(serializeBackup(completed(),at));
 backup.ledger.sessions=Array.from({length:3},(_,i)=>({...backup.ledger.sessions[0],id:`copy-${i}`}));backup.summary={sessions:3,xp:90};
 assert.throws(()=>parseBackup(JSON.stringify(backup)),/invalid/);
 const locked=JSON.parse(serializeBackup(emptyLedger(),at));locked.ledger.appearance.palette='purple';
 assert.throws(()=>parseBackup(JSON.stringify(locked)),/invalid/);
});
test('browser replacement/recovery are one atomic write; failure and active-session guard preserve records',async()=>{
 const values=new Map<string,string>();let fail=false;
 const storage={getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{if(fail)throw new Error('storage full');values.set(key,value);}};
 Object.defineProperty(globalThis,'localStorage',{value:storage,configurable:true});
 try{
  const store=await openSessionStore(),candidate=completed();
  await store.execute({type:'still',value:true},at);const original=await store.load();
  fail=true;await assert.rejects(()=>store.replace(candidate),/storage full/);fail=false;
  assert.deepEqual(await store.load(),original);assert.equal(await store.recovery(),null);
  await store.replace(candidate);assert.deepEqual(await store.recovery(),original);assert.deepEqual(await store.load(),candidate);
  await store.replace((await store.recovery())!);assert.deepEqual(await store.load(),original);assert.deepEqual(await store.recovery(),candidate);
  await store.execute({type:'start',id:'active',activity:'Music'},at);
  const active=await store.load();await assert.rejects(()=>store.replace(candidate),/Finish/);assert.deepEqual(await store.load(),active);
  const saved=JSON.parse(values.get('mini-me-first-flow-v1')!);saved.recovery={version:999};values.set('mini-me-first-flow-v1',JSON.stringify(saved));
  assert.deepEqual(await store.load(),active);await assert.rejects(()=>store.recovery(),/invalid/);
 }finally{Reflect.deleteProperty(globalThis,'localStorage');}
});
