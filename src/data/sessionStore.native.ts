import * as SQLite from 'expo-sqlite';
import { applyCommand, emptyLedger, readLedger, type Command, type Ledger } from '../domain/activity';
import { validateBackupLedger } from '../domain/backup';
import { sampleIssue, acceptSample, resumeRoute, routeSummary, finishRoute, validRoute, createRawWindow, type Sample, type RouteState } from '../domain/runningDistance';
const runtimeId=Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
const rawWindow=createRawWindow();
export type SessionStore = { load(): Promise<Ledger>; execute(command: Command, now?: number): Promise<Ledger>; replace(ledger:Ledger):Promise<Ledger>; recovery():Promise<Ledger|null> };
async function flushRoute(tx:SQLite.SQLiteDatabase,state:Ledger){
 if(!state.active?.gps)return;
 const row=await tx.getFirstAsync<{body:string}>('SELECT body FROM gps_checkpoint WHERE id=1');if(!row)return;
 try{const c=JSON.parse(row.body);if(c.sessionId===state.active.id&&c.segmentAt===state.active.segmentAt&&validRoute(c.track))state.active.gps=routeSummary(finishRoute(c.track));}catch{/* Preserve committed totals if a transient checkpoint is damaged. */}
}
export async function openSessionStore(): Promise<SessionStore> {
 const db=await SQLite.openDatabaseAsync('mini-me-sessions.db');
 const version=await db.getFirstAsync<{user_version:number}>('PRAGMA user_version');
 if((version?.user_version??0)>1)throw new Error('This data needs a newer app. Your records were not changed.');
 await db.execAsync('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
 await db.withExclusiveTransactionAsync(async tx=>{
  await tx.execAsync('CREATE TABLE IF NOT EXISTS app_ledger (id INTEGER PRIMARY KEY CHECK(id=1), body TEXT NOT NULL); CREATE TABLE IF NOT EXISTS backup_recovery (id INTEGER PRIMARY KEY CHECK(id=1), body TEXT NOT NULL); CREATE TABLE IF NOT EXISTS gps_checkpoint (id INTEGER PRIMARY KEY CHECK(id=1), body TEXT NOT NULL); PRAGMA user_version=1;');
  await tx.runAsync('INSERT OR IGNORE INTO app_ledger(id,body) VALUES(1,?)',JSON.stringify(emptyLedger()));
  const c=await tx.getFirstAsync<{body:string}>('SELECT body FROM gps_checkpoint WHERE id=1');
  if(c){let current=false;try{current=JSON.parse(c.body).runtimeId===runtimeId;}catch{/* Clear only stale transient coordinates. */}if(!current)await tx.runAsync('DELETE FROM gps_checkpoint');}
 });
 const load=async()=>{const row=await db.getFirstAsync<{body:string}>('SELECT body FROM app_ledger WHERE id=1');if(!row)throw new Error('Local records are unavailable.');return readLedger(row.body);};
 return {load,
  async recovery(){const row=await db.getFirstAsync<{body:string}>('SELECT body FROM backup_recovery WHERE id=1');return row?validateBackupLedger(JSON.parse(row.body)):null;},
  async replace(candidate){
   rawWindow.clear();
   const result=validateBackupLedger(candidate);
   if(result.active?.status==='running')throw new Error('Review this backup’s active session before importing.');
   await db.withExclusiveTransactionAsync(async tx=>{
    const row=await tx.getFirstAsync<{body:string}>('SELECT body FROM app_ledger WHERE id=1');if(!row)throw new Error('Local records are unavailable.');
    const previous=readLedger(row.body);if(previous.active)throw new Error('Finish your current session before importing a backup.');
    await tx.runAsync('INSERT INTO backup_recovery(id,body) VALUES(1,?) ON CONFLICT(id) DO UPDATE SET body=excluded.body',JSON.stringify(previous));
    await tx.runAsync('UPDATE app_ledger SET body=? WHERE id=1',JSON.stringify(result));
    await tx.runAsync('DELETE FROM gps_checkpoint');
   });return result;
  },
  async execute(command,now=Date.now()){let result:Ledger|undefined;await db.withExclusiveTransactionAsync(async tx=>{const row=await tx.getFirstAsync<{body:string}>('SELECT body FROM app_ledger WHERE id=1');if(!row)throw new Error('Local records are unavailable.');const source=readLedger(row.body);if(['pause','interrupt','finish'].includes(command.type))await flushRoute(tx,source);result=applyCommand(source,command,now);await tx.runAsync('UPDATE app_ledger SET body=? WHERE id=1',JSON.stringify(result));if(['start','pause','resume','interrupt','finish'].includes(command.type)){rawWindow.clear();await tx.runAsync('DELETE FROM gps_checkpoint');}});if(!result)throw new Error('Could not save this change.');return result;}
 };
}
// GPS writes share the ledger transaction, so pause/finish and incoming fixes cannot race.
export async function recordGpsFixes(fixes:Sample[],now=Date.now()){
 const db=await SQLite.openDatabaseAsync('mini-me-sessions.db');
 try{await db.withExclusiveTransactionAsync(async tx=>{
  const row=await tx.getFirstAsync<{body:string}>('SELECT body FROM app_ledger WHERE id=1');if(!row)return;
  const ledger=readLedger(row.body),active=ledger.active;
  if(!active?.gps||active.status!=='running'||active.segmentAt===null){rawWindow.clear();await tx.runAsync('DELETE FROM gps_checkpoint');return;}
  const stored=await tx.getFirstAsync<{body:string}>('SELECT body FROM gps_checkpoint WHERE id=1');
  let checkpoint: {sessionId:string;segmentAt:number;runtimeId:string;track:RouteState;status:string;detail?:string|null;updatedAt:number}|null=null;
  if(stored)try{checkpoint=JSON.parse(stored.body);}catch{/* Reset only the transient checkpoint. */}
  const reusable=checkpoint?.sessionId===active.id&&checkpoint.segmentAt===active.segmentAt&&checkpoint.runtimeId===runtimeId&&validRoute(checkpoint.track)&&checkpoint.track.distanceM+0.000001>=active.gps.distanceM;
  if(!reusable)checkpoint=null;
  let track=checkpoint?checkpoint.track:resumeRoute(active.gps);
  let status=checkpoint?.status??'weak',detail=checkpoint?.detail??null,updatedAt=checkpoint?.updatedAt??0;
  for(const fix of [...fixes].sort((a,b)=>a.timestamp-b.timestamp)){
   if(fix.timestamp<active.segmentAt)continue;
   // Accept chronological batches delivered within five minutes, but never bridge missing samples.
   const receivedNow=now-fix.timestamp>300000||fix.timestamp>now+2000?now:fix.timestamp;
   rawWindow.push(fix,now);track=acceptSample(track,fix,receivedNow);status=track.decision;detail=status==='weak'?sampleIssue(fix,receivedNow):null;if(fix.timestamp<=now+2000)updatedAt=Math.max(updatedAt,Math.min(now,fix.timestamp));
  }
  active.gps=routeSummary(track);
  await tx.runAsync('UPDATE app_ledger SET body=? WHERE id=1',JSON.stringify(ledger));
  await tx.runAsync('INSERT INTO gps_checkpoint(id,body) VALUES(1,?) ON CONFLICT(id) DO UPDATE SET body=excluded.body',JSON.stringify({sessionId:active.id,segmentAt:active.segmentAt,runtimeId,track,status,detail,updatedAt}));
 });}finally{await db.closeAsync();}
}
export async function gpsSignal(){
 const db=await SQLite.openDatabaseAsync('mini-me-sessions.db');
 try{const row=await db.getFirstAsync<{body:string}>('SELECT body FROM gps_checkpoint WHERE id=1');if(!row)return 'Waiting for a clear GPS signal';const checkpoint=JSON.parse(row.body) as {status:string;detail?:string|null;updatedAt:number};return Date.now()-checkpoint.updatedAt>10000?'GPS signal lost · distance is paused':checkpoint.status==='weak'?(checkpoint.detail??'GPS fix rejected · tap Retry GPS tracking'):checkpoint.status==='jump'?'GPS jump ignored · reacquiring':checkpoint.status==='uncertain'?'GPS movement uncertain · short steps are being checked':checkpoint.status==='stationary'?'GPS ready · no movement detected':checkpoint.status==='reacquiring'||checkpoint.status==='gap'?'Reacquiring GPS · missing route is not counted':'GPS tracking · distance saved locally';}finally{await db.closeAsync();}
}
export async function pauseForegroundGps(now=Date.now()){
 const db=await SQLite.openDatabaseAsync('mini-me-sessions.db');
 try{await db.withExclusiveTransactionAsync(async tx=>{
  const row=await tx.getFirstAsync<{body:string}>('SELECT body FROM app_ledger WHERE id=1');if(!row)return;
  const state=readLedger(row.body);
  if(state.active?.gps&&state.active.status==='running'){
   await flushRoute(tx,state);
   rawWindow.clear();
   const paused=applyCommand(state,{type:'pause',id:state.active.id},now);
   await tx.runAsync('UPDATE app_ledger SET body=? WHERE id=1',JSON.stringify(paused));
   await tx.runAsync('DELETE FROM gps_checkpoint');
  }
 });}finally{await db.closeAsync();}
}





