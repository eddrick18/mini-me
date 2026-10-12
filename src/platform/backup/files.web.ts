export async function saveBackupFile(raw:string,name:string){
 const url=URL.createObjectURL(new Blob([raw],{type:'application/json'}));
 const link=document.createElement('a');link.href=url;link.download=name;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
 return 'Backup download requested. Keep the JSON file somewhere safe.';
}
