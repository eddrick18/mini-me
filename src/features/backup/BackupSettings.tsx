import { roomLabel } from '../../domain/room';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Ledger } from '../../domain/activity';
import { backupSummary, parseBackup, serializeBackup } from '../../domain/backup';
import { saveBackupFile } from '../../platform/backup/files';
import { BackupPicker } from '../../platform/backup/BackupPicker';
import { GameButton } from '../../ui/GameButton';
import { tokens } from '../../design/tokens';

type Preview={ledger:Ledger;name:string;date:number|null;recovery:boolean};
export function BackupSettings({ledger,busy,onRestore,onRecovery}:{ledger:Ledger;busy:boolean;onRestore:(candidate:Ledger)=>Promise<Ledger|null>;onRecovery:()=>Promise<Ledger|null>}){
 const [preview,setPreview]=useState<Preview|null>(null),[pending,setPending]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
 const lock=useRef(false),alive=useRef(true);useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
 const disabled=busy||pending,current=backupSummary(ledger),incoming=preview?backupSummary(preview.ledger):null;
 const action=async(work:()=>Promise<void>)=>{if(lock.current||busy)return;lock.current=true;setPending(true);setError('');setMessage('');try{await work();}catch(e){if(alive.current)setError(e instanceof Error?e.message:'The backup action failed. Please try again.');}finally{lock.current=false;if(alive.current)setPending(false);}};
 const selected=(name:string,raw:string)=>{if(lock.current||busy)return;setMessage('');setError('');try{const backup=parseBackup(raw);setPreview({ledger:backup.ledger,name:name.slice(0,120),date:backup.exportedAt,recovery:false});}catch(e){setPreview(null);setError(e instanceof Error?e.message:'This backup could not be read.');}};
 return <View style={styles.card}>
  <Text accessibilityRole="header" style={styles.title}>Keep your progress safe</Text>
  <Text style={styles.body}>Back up activities, mood check-ins, XP, your outfit, room, sound, vibration, companion and still-pose preferences.</Text>
  <Text style={styles.small}>Files contain your personal activity and mood history and are not encrypted. You choose where to save them.</Text>
  <GameButton label={pending?'Preparing…':'Export backup'} disabled={disabled} onPress={()=>void action(async()=>{const raw=serializeBackup(ledger),name=`mini-me-backup-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;const result=await saveBackupFile(raw,name);if(alive.current)setMessage(result);})}/>
  <BackupPicker disabled={disabled} onSelected={selected} onError={value=>{setPreview(null);setError(value);}}/>
  <Text style={styles.small}>Mini Me JSON backups · up to 5 MB. Import replaces records; it does not merge them.</Text>
  {ledger.active&&<Text style={styles.warning}>Finish your current session before importing. You can still export a backup.</Text>}
  {preview&&incoming&&<View style={styles.review}>
   <Text accessibilityRole="header" style={styles.label}>Review {preview.recovery?'recovery copy':'backup'}</Text>
   <Text style={styles.body}>{preview.name}</Text>
   {preview.date!==null&&<Text style={styles.small}>Exported {new Intl.DateTimeFormat('en-PH',{timeZone:'Asia/Manila',dateStyle:'medium',timeStyle:'short'}).format(preview.date)}</Text>}
   <Text style={styles.body}>Current: {current.sessions} activities · {current.xp} XP · level {current.level} · {current.checkins} check-ins</Text>
   <Text style={styles.label}>Backup: {incoming.sessions} activities · {incoming.xp} XP · level {incoming.level} · {incoming.checkins} check-ins</Text>
   <Text style={styles.body}>Outfit: {preview.ledger.appearance.outfit} · {preview.ledger.appearance.palette}</Text><Text style={styles.body}>Room: {roomLabel(preview.ledger.room)}</Text>
   {preview.ledger.active&&<Text style={styles.warning}>This file includes a {preview.ledger.active.status} {preview.ledger.active.activity.toLowerCase()} session.</Text>}
   <Text style={styles.warning}>Restoring replaces your current activities, mood check-ins, progress and preferences. A recovery copy of your current records will be saved first.</Text>
   <GameButton label="Cancel import" secondary disabled={disabled} onPress={()=>setPreview(null)}/>
   <GameButton label={busy?'Restoring…':preview.recovery?'Restore previous records':'Replace records with backup'} disabled={disabled||Boolean(ledger.active)} onPress={()=>void action(async()=>{const restored=await onRestore(preview.ledger);if(!restored)throw new Error('Restore did not complete. Your current records were kept. Please retry.');if(alive.current){setPreview(null);setMessage('Backup restored. Your previous records are available in the recovery copy.');}})}/>
  </View>}
  <GameButton label="Review recovery copy" secondary disabled={disabled||Boolean(ledger.active)} onPress={()=>void action(async()=>{const previous=await onRecovery();if(!alive.current)return;if(!previous){setMessage('No recovery copy yet. One is saved automatically when you import a backup.');return;}setPreview({ledger:previous,name:'Records saved before the last import',date:null,recovery:true});})}/>
  <Text style={styles.small}>One recovery copy stays on this device until the next import. Uninstalling can remove it; keep an exported file too.</Text>
  {error!==''&&<Text accessibilityRole="alert" accessibilityLiveRegion="assertive" style={styles.warning}>{error}</Text>}
  {message!==''&&<Text accessibilityLiveRegion="polite" style={styles.notice}>{message}</Text>}
 </View>;
}
const c=tokens.colors;const styles=StyleSheet.create({card:{padding:14,borderRadius:16,borderWidth:2,borderColor:c.border,backgroundColor:c.surface,gap:12},title:{fontSize:20,fontWeight:'900',color:c.text},label:{fontSize:16,fontWeight:'800',color:c.text},body:{fontSize:15,lineHeight:23,color:c.muted},small:{fontSize:12,lineHeight:19,color:c.muted},warning:{fontSize:14,lineHeight:22,color:c.error},review:{padding:12,borderWidth:2,borderColor:c.error,borderRadius:12,backgroundColor:'#FFF2E9',gap:10},notice:{fontSize:14,lineHeight:22,color:c.primary,fontWeight:'700'}});


