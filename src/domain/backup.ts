import { canonicalSummary } from './runningDistance.ts';
import { elapsed, readLedger, rewardDay, totalXp, levelProgress, gpsBaseXp, type Ledger } from './activity.ts';
export const BACKUP_LIMIT=5*1024*1024;
export const BACKUP_RULE='mini-me-xp-v2';
export type Backup={format:'mini-me-backup';version:1|2|3|4;rule:typeof BACKUP_RULE|'mini-me-xp-v1';timezone:'Asia/Manila';exportedAt:number;summary:{sessions:number;xp:number};ledger:Ledger};
const bad=()=>new Error('This backup is invalid or uses unsupported rules. Your records were not changed.');
export function byteLength(text:string){let bytes=0;for(let i=0;i<text.length;i++){const n=text.charCodeAt(i);if(n<128)bytes++;else if(n<2048)bytes+=2;else if(n>=0xd800&&n<=0xdbff&&i+1<text.length&&text.charCodeAt(i+1)>=0xdc00&&text.charCodeAt(i+1)<=0xdfff){bytes+=4;i++;}else bytes+=3;}return bytes;}
export function validateBackupLedger(value:unknown):Ledger{
 let state:Ledger;try{state=readLedger(JSON.stringify(value));}catch{throw bad();}
 if(state.sessions.length>20000)throw bad();
 const dayTotals=new Map<string,number>(),categories=new Map<string,number>();
 const id=(value:string)=>/^[A-Za-z0-9_-]{1,128}$/.test(value);
 for(const s of state.sessions){
  if(!id(s.id)||s.completedAt>8640000000000000||s.activeMs>604800000||s.rewardDay!==rewardDay(s.completedAt))throw bad();
  const base=s.gps?gpsBaseXp(s.gps.distanceM):s.activeMs>=1200000?30:s.activeMs>=300000?20:0;
  if(s.xp>base)throw bad();
  const day=(dayTotals.get(s.rewardDay)??0)+s.xp;dayTotals.set(s.rewardDay,day);if(day>120)throw bad();
  const key=`${s.rewardDay}:${s.activity}`;if(s.xp>0){const count=(categories.get(key)??0)+1;categories.set(key,count);if(count>2)throw bad();}
 }
 if(state.active&&(!id(state.active.id)||state.active.startedAt>8640000000000000||state.active.activeMs>604800000||(state.active.segmentAt!==null&&(state.active.segmentAt<state.active.startedAt||state.active.segmentAt>8640000000000000))))throw bad();
 // Canonical copies omit unknown fields and never execute imported content.
 return {version:1,checkins:state.checkins.map(c=>({...c})),companion:{...state.companion},feedback:{...state.feedback},room:{desk:state.room.desk,plant:state.room.plant,poster:state.room.poster},questClaims:state.questClaims.map(c=>({...c})),preferStill:state.preferStill,appearance:{...state.appearance},sessions:state.sessions.map(s=>({id:s.id,activity:s.activity,startedAt:s.startedAt,completedAt:s.completedAt,activeMs:s.activeMs,xp:s.xp,rewardDay:s.rewardDay,...(s.gps?{gps:canonicalSummary(s.gps)}:{})})),active:state.active?{id:state.active.id,activity:state.active.activity,status:state.active.status,startedAt:state.active.startedAt,segmentAt:state.active.segmentAt,activeMs:state.active.activeMs,clockReview:state.active.clockReview,...(state.active.gps?{gps:canonicalSummary(state.active.gps)}:{})}:null};
}
export function serializeBackup(ledger:Ledger,now=Date.now()):string{
 const snapshot=validateBackupLedger(ledger);
 if(snapshot.active?.status==='running'){snapshot.active={...snapshot.active,activeMs:elapsed(snapshot.active,now),segmentAt:null,status:'interrupted',clockReview:true};}
 validateBackupLedger(snapshot);
 const backup:Backup={format:'mini-me-backup',version:4,rule:BACKUP_RULE,timezone:'Asia/Manila',exportedAt:now,summary:{sessions:snapshot.sessions.length,xp:totalXp(snapshot)},ledger:snapshot};
 const raw=JSON.stringify(backup,null,2);if(byteLength(raw)>BACKUP_LIMIT)throw new Error('Your backup exceeds the 5 MB limit. Your records were not changed.');return raw;
}
export function parseBackup(raw:string):Backup{
 if(raw.length>BACKUP_LIMIT||byteLength(raw)>BACKUP_LIMIT)throw new Error('Choose a backup smaller than 5 MB. Your records were not changed.');
 let value:Backup;try{value=JSON.parse(raw.replace(/^\uFEFF/,''));}catch{throw new Error('Choose a valid Mini Me JSON backup. Your records were not changed.');}
 if(!value||value.format!=='mini-me-backup'||(value.version!==1&&value.version!==2&&value.version!==3&&value.version!==4)||(value.version===4?value.rule!==BACKUP_RULE:value.rule!=='mini-me-xp-v1')||value.timezone!=='Asia/Manila'||!Number.isSafeInteger(value.exportedAt)||value.exportedAt<0||value.exportedAt>8640000000000000)throw bad();
 if(value.version===1&&value.ledger?.questClaims?.length)throw bad();
 if(value.version<3&&value.ledger?.room&&Object.values(value.ledger.room).some(Boolean))throw bad();
 if(value.version<4&&(value.ledger?.active?.gps!==undefined||value.ledger?.sessions?.some(s=>s.gps!==undefined)))throw bad();
 const ledger=validateBackupLedger(value.ledger);
 if(value.summary?.sessions!==ledger.sessions.length||value.summary?.xp!==totalXp(ledger))throw bad();
 if(ledger.active?.status==='running')throw bad();
 return {...value,ledger};
}
export const backupSummary=(ledger:Ledger)=>({sessions:ledger.sessions.length,xp:totalXp(ledger),level:levelProgress(totalXp(ledger)).level,checkins:ledger.checkins.length});




