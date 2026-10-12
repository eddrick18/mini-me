import { applyCommand, emptyLedger, readLedger, type Command, type Ledger } from '../domain/activity.ts';
import { validateBackupLedger } from '../domain/backup.ts';
export type SessionStore = { load(): Promise<Ledger>; execute(command:Command,now?:number):Promise<Ledger>; replace(ledger:Ledger):Promise<Ledger>; recovery():Promise<Ledger|null> };
// Both current and recovery ledgers share one atomic localStorage write.
export async function openSessionStore():Promise<SessionStore>{
 const key='mini-me-first-flow-v1';
 const read=()=>{const raw=localStorage.getItem(key);if(!raw)return{ledger:emptyLedger(),recovery:null as Ledger|null};const value=JSON.parse(raw);if(value.format==='mini-me-browser-store'&&value.version!==1)throw new Error('These browser records need a newer app. Your data was not changed.');return value.format==='mini-me-browser-store'?{ledger:readLedger(JSON.stringify(value.ledger)),recovery:value.recovery??null}:{ledger:readLedger(raw),recovery:null as Ledger|null};};
 const write=(ledger:Ledger,recovery:Ledger|null)=>localStorage.setItem(key,JSON.stringify({format:'mini-me-browser-store',version:1,ledger,recovery}));
 read();return{load:async()=>read().ledger,recovery:async()=>{const previous=read().recovery;return previous?validateBackupLedger(previous):null;},
  async execute(command,now=Date.now()){const current=read(),result=applyCommand(current.ledger,command,now);write(result,current.recovery);return result;},
  async replace(candidate){const result=validateBackupLedger(candidate),current=read();if(current.ledger.active)throw new Error('Finish your current session before importing a backup.');if(result.active?.status==='running')throw new Error('Review this backup’s active session before importing.');write(result,current.ledger);return result;}
 };
}


