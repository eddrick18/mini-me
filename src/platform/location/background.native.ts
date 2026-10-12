import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { AppState, Platform } from 'react-native';
import { gpsSignal, recordGpsFixes, pauseForegroundGps } from '../../data/sessionStore.native';
import { isExpoGo } from '../runtime';
import { createForegroundTracker } from './foregroundTracker';
import { normalizeSample } from '../../domain/runningDistance';
const task='mini-me-walk-run-v1';
const fixes=(p:Location.LocationObject)=>normalizeSample({latitude:p.coords.latitude,longitude:p.coords.longitude,accuracy:p.coords.accuracy,timestamp:p.timestamp,mocked:p.mocked,speed:p.coords.speed,heading:p.coords.heading,altitude:p.coords.altitude});
if(!isExpoGo&&!TaskManager.isTaskDefined(task))TaskManager.defineTask<{locations:Location.LocationObject[]}>(task,async({data,error})=>{
 if(error||!data?.locations)return;
 await recordGpsFixes(data.locations.map(fixes));
});
export const gpsSupported=true;
export const gpsBackgroundSupported=!isExpoGo;
export const gpsPermissionCopy=isExpoGo?'Allow precise location when you start.':'Allow precise and background location when you start.';
export const gpsModeCopy=isExpoGo?'Expo Go · keep Mini Me open and the screen unlocked. Leaving or locking pauses GPS; tap Resume when you return.':'Keep tracking when you lock the phone or switch apps. Force-quitting may stop it.';
let subscription:Location.LocationSubscription|null=null;
let lifecycleStop=Promise.resolve();
let writeError='';
let starting=false;
let lifecycleEpoch=0;
async function waitForForeground(){
 if(AppState.currentState==='active')return;
 await new Promise<void>((resolve,reject)=>{
  const listener=AppState.addEventListener('change',state=>{if(state==='active'){clearTimeout(timeout);listener.remove();resolve();}});
  const timeout=setTimeout(()=>{listener.remove();reject(new Error('Return to Mini Me, then tap Resume to start GPS.'));},5000);
 });
}
const queue=createForegroundTracker<Location.LocationObject>(async p=>{try{await recordGpsFixes([fixes(p)]);writeError='';}catch{writeError='GPS distance could not save · pause and retry';}});
if(isExpoGo)AppState.addEventListener('change',state=>{
 if(state!=='background'||(!subscription&&!starting))return;
 lifecycleEpoch++;
 const at=Date.now();
 subscription?.remove();subscription=null;
 lifecycleStop=lifecycleStop.catch(()=>{}).then(async()=>{await queue.stop();await pauseForegroundGps(at);}).catch(()=>{writeError='GPS stopped. Reopen the app to review the session.';});
});
export async function requestGpsAccess(){
 if(!isExpoGo&&!await TaskManager.isAvailableAsync())throw new Error('Background GPS is unavailable in this build.');
 if(!await Location.hasServicesEnabledAsync())throw new Error('Turn on Location Services on your device, then try again.');
 const foreground=await Location.requestForegroundPermissionsAsync();
 if(!foreground.granted)throw new Error('Location access was not granted. Your previous progress is kept. Allow precise location in device settings, then retry.');
 if(isExpoGo){await lifecycleStop;await waitForForeground();return;}
 const background=await Location.requestBackgroundPermissionsAsync();
 if(!background.granted)throw new Error('Allow background location in device settings to track while the phone is locked, then retry.');
}
export async function startGps(){
 if(isExpoGo){
  await lifecycleStop;
  await waitForForeground();
  if(subscription)return;
  writeError='';const token=queue.begin(),epoch=lifecycleEpoch;
  starting=true;
  try{
   const next=await Location.watchPositionAsync({accuracy:Location.Accuracy.High,timeInterval:1000,distanceInterval:1},p=>{void queue.enqueue(token,p);},()=>{writeError='Location provider interrupted · pause and retry outdoors';lifecycleStop=lifecycleStop.catch(()=>{}).then(async()=>{await queue.stop();await pauseForegroundGps();}).catch(()=>{writeError='GPS stopped · reopen the app to review';});subscription?.remove();subscription=null;});
   if(AppState.currentState!=='active'||epoch!==lifecycleEpoch){next.remove();await queue.stop();await lifecycleStop;await pauseForegroundGps();throw new Error('GPS paused because Mini Me left the foreground. Tap Resume to continue.');}
   subscription=next;
  }finally{starting=false;}
  return;
 }
 if(await Location.hasStartedLocationUpdatesAsync(task))return;
 await Location.startLocationUpdatesAsync(task,{accuracy:Location.Accuracy.High,timeInterval:1000,distanceInterval:1,deferredUpdatesInterval:0,activityType:Location.LocationActivityType.Fitness,pausesUpdatesAutomatically:false,showsBackgroundLocationIndicator:true,...(Platform.OS==='android'?{foregroundService:{notificationTitle:'Mini Me · Walking / Running',notificationBody:'Recording distance. Open Mini Me to pause or finish.',notificationColor:'#6941D9',killServiceOnDestroy:false}}:{})});
}
export async function stopGps(){
 if(isExpoGo){subscription?.remove();subscription=null;await queue.stop();await lifecycleStop;return;}
 if(await Location.hasStartedLocationUpdatesAsync(task))await Location.stopLocationUpdatesAsync(task);
}
export async function gpsIsRunning(){if(isExpoGo){await lifecycleStop;return subscription!==null;}try{return await Location.hasStartedLocationUpdatesAsync(task);}catch{return false;}}
export async function gpsStatus(){if(writeError)return writeError;if(!await gpsIsRunning())return 'GPS is stopped · resume to restart tracking';return gpsSignal();}


