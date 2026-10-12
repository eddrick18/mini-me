import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { GameButton } from '../../ui/GameButton';
import { BACKUP_LIMIT } from '../../domain/backup';
export function BackupPicker({disabled,onSelected,onError}:{disabled:boolean;onSelected:(name:string,raw:string)=>void;onError:(message:string)=>void}){
 return <GameButton secondary label="Choose backup file" disabled={disabled} onPress={()=>void(async()=>{try{const result=await DocumentPicker.getDocumentAsync({type:['application/json','text/plain'],multiple:false,copyToCacheDirectory:true});if(result.canceled)return;const asset=result.assets[0]!,file=new File(asset.uri);if((asset.size??file.size)>BACKUP_LIMIT)throw new Error('Choose a backup smaller than 5 MB.');onSelected(asset.name,await file.text());}catch(e){onError(e instanceof Error?e.message:'Could not open that file. Try again.');}})()}/>;
}
