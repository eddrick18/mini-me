// Serializes fixes and fences callbacks after stop/restart.
export function createForegroundTracker<T>(write:(fix:T)=>Promise<void>){
 let generation=0,tail=Promise.resolve();
 return {
  begin(){return ++generation;},
  enqueue(token:number,fix:T){
   tail=tail.catch(()=>{}).then(async()=>{if(token===generation)await write(fix);});
   return tail;
  },
  async stop(){generation++;await tail.catch(()=>{});},
 };
}
