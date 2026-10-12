import { useEffect, useRef } from 'react';
import { BACKUP_LIMIT } from '../../domain/backup';
import { tokens } from '../../design/tokens';
export function BackupPicker({disabled,onSelected,onError}:{disabled:boolean;onSelected:(name:string,raw:string)=>void;onError:(message:string)=>void}){
 const input=useRef<HTMLInputElement>(null),sequence=useRef(0);useEffect(()=>()=>{sequence.current++;},[]);
 return <div style={{display:'flex',flexDirection:'column',gap:8}}><label htmlFor="mini-me-backup-file" style={{color:tokens.colors.text,fontSize:15,fontWeight:700}}>Choose backup file</label><input ref={input} id="mini-me-backup-file" type="file" accept=".json,application/json,text/plain" disabled={disabled} style={{minHeight:48,padding:10,border:`2px solid ${tokens.colors.border}`,borderRadius:12,background:tokens.colors.surface,maxWidth:'100%',boxSizing:'border-box',color:tokens.colors.text}} onChange={event=>{const token=++sequence.current,file=event.currentTarget.files?.[0];event.currentTarget.value='';if(!file)return;if(file.size>BACKUP_LIMIT){onError('Choose a backup smaller than 5 MB.');return;}void file.text().then(raw=>{if(token===sequence.current)onSelected(file.name,raw);}).catch(()=>{if(token===sequence.current)onError('Could not read this file. Try again.');});}}/></div>;
}

