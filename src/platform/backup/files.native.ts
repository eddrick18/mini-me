import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
export async function saveBackupFile(raw:string,name:string){
 if(!await Sharing.isAvailableAsync())throw new Error('File sharing is unavailable on this device. Please try again later.');
 const file=new File(Paths.cache,name);file.create({overwrite:true});file.write(raw);
 await Sharing.shareAsync(file.uri,{mimeType:'application/json',UTI:'public.json',dialogTitle:'Save your Mini Me backup'});
 return 'Backup prepared. Choose a save location in the share sheet; keep the file somewhere safe.';
}

