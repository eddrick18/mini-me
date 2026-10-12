// Pure, timestamp-driven route engine. No platform, storage, UI or clock imports.
export const EARTH_RADIUS_M=6371008.771415059;
export const PROCESSING_VERSION=2;
export const CONFIG_ID='run-v2-high-1s';
export type Sample={latitude:number;longitude:number;timestamp:number;accuracy:number|null;speed?:number|null;speedAccuracy?:number|null;heading?:number|null;altitude?:number|null;mocked?:boolean};
export type Policy={accuracyM:number;gapMs:number;staleMs:number;futureMs:number;maxSpeedMps:number;maxEdgeM:number;windowMs:number;stationaryMs:number;diameterM:number;stationaryMps:number;movingMps:number;maxWindowSamples:number};
export const defaultPolicy:Policy={accuracyM:25,gapMs:10000,staleMs:15000,futureMs:2000,maxSpeedMps:12,maxEdgeM:120,windowMs:30000,stationaryMs:10000,diameterM:3,stationaryMps:.1,movingMps:.35,maxWindowSamples:96};
export type Decision='weak'|'duplicate'|'jump'|'gap'|'reacquiring'|'uncertain'|'stationary'|'moving'|'paused';
export type RouteState={version:2;startKnown:boolean;distanceM:number;movingMs:number;qualifiedMs:number;uncertainMs:number;gapCount:number;segments:number;watermark:number;anchor:Sample|null;tentative:Sample|null;first:Sample|null;last:Sample|null;window:Sample[];rawEligibleM:number;decision:Decision};
export function emptyRoute(distanceM=0):RouteState{return {version:2,startKnown:distanceM===0,distanceM,movingMs:0,qualifiedMs:0,uncertainMs:0,gapCount:0,segments:0,watermark:-1,anchor:null,tentative:null,first:null,last:null,window:[],rawEligibleM:0,decision:'reacquiring'};}
// Expo iOS timestamps are floating milliseconds. Normalize at the acquisition boundary.
export function normalizeSample(x:Sample):Sample{return {...x,timestamp:Number.isFinite(x.timestamp)&&x.timestamp>=0?Math.round(x.timestamp):x.timestamp};}
export function sampleIssue(x:Sample,receivedAt:number,p:Policy=defaultPolicy):string|null{
 if(!Number.isSafeInteger(x.timestamp)||x.timestamp<0||!Number.isFinite(receivedAt))return 'GPS timestamp invalid · retry tracking';
 if(x.timestamp>receivedAt+p.futureMs)return 'GPS timestamp ahead of phone clock · retry tracking';
 if(!Number.isFinite(x.latitude)||Math.abs(x.latitude)>90||!Number.isFinite(x.longitude)||Math.abs(x.longitude)>180)return 'GPS position invalid · retry tracking';
 if(x.mocked)return 'Simulated GPS sample ignored';
 if(x.accuracy==null||!Number.isFinite(x.accuracy)||x.accuracy<0)return 'GPS accuracy unavailable · waiting for a usable fix';
 if(x.accuracy>p.accuracyM)return `GPS accuracy ${Math.ceil(x.accuracy)} m · needs ≤${p.accuracyM} m. Check Precise Location for Expo Go.`;
 if(receivedAt-x.timestamp>p.staleMs)return 'GPS sample too old · waiting for a fresh fix';
 return null;
}
export function geodesic(a:Pick<Sample,'latitude'|'longitude'>,b:Pick<Sample,'latitude'|'longitude'>){
 const rad=Math.PI/180,p=a.latitude*rad,q=b.latitude*rad;
 let deltaLon=b.longitude-a.longitude;if(deltaLon>180)deltaLon-=360;if(deltaLon< -180)deltaLon+=360;const lon=deltaLon*rad;
 const h=Math.min(1,Math.max(0,Math.sin((q-p)/2)**2+Math.cos(p)*Math.cos(q)*Math.sin(lon/2)**2));
 return EARTH_RADIUS_M*2*Math.atan2(Math.sqrt(h),Math.sqrt(Math.max(0,1-h)));
}
const duration=(w:Sample[])=>w.length>1?w[w.length-1]!.timestamp-w[0]!.timestamp:0;
export function polyline(w:Sample[],metric=geodesic){let sum=0;for(let i=1;i<w.length;i++)sum+=metric(w[i-1]!,w[i]!);return sum;}
function movement(w:Sample[],p:Policy,metric=geodesic):'moving'|'stationary'|'uncertain'{
 let consecutive=0,known=0,stopped=true;
 for(const x of w){const reliable=typeof x.speed==='number'&&Number.isFinite(x.speed)&&x.speed>=0&&(x.speedAccuracy==null||(Number.isFinite(x.speedAccuracy)&&x.speedAccuracy>=0&&x.speedAccuracy<=.2));
  if(reliable){known++;stopped&&=x.speed!<=p.stationaryMps;consecutive=x.speed!>=p.movingMps?consecutive+1:0;if(consecutive>=2)return 'moving';}else consecutive=0;
 }
 for(let i=0;i<w.length;i++)for(let j=i+1;j<w.length;j++)if(metric(w[i]!,w[j]!)>p.diameterM)return 'moving';
 return duration(w)>=p.stationaryMs&&known===w.length&&stopped?'stationary':'uncertain';
}
function settle(s:RouteState,p:Policy,force=false,metric=geodesic){
 let kind=movement(s.window,p,metric);const ms=duration(s.window);
 // Preserve confirmed slow movement at a boundary when every remaining speed
 // reading supports motion above the stopped band. Never infer missing metres.
 if(force&&kind==='uncertain'&&s.movingMs>0&&s.window.length>=2&&s.window.every(x=>typeof x.speed==='number'&&Number.isFinite(x.speed)&&x.speed>p.stationaryMps&&(x.speedAccuracy==null||Number.isFinite(x.speedAccuracy)&&x.speedAccuracy>=0&&x.speedAccuracy<=.2)))kind='moving';
 s.decision=kind;
 if(kind==='moving'){s.distanceM=Math.min(5000000,s.distanceM+polyline(s.window,metric));s.movingMs+=ms;}
 else if(kind==='uncertain'&&(force||ms>=p.windowMs||s.window.length>=p.maxWindowSamples))s.uncertainMs+=ms;
 else if(kind!=='stationary')return;
 s.window=s.window.length?[s.window[s.window.length-1]!]:[];
}
export function breakRoute(source:RouteState,reason:Decision='paused',p:Policy=defaultPolicy,metric=geodesic){
 const s={...source,window:[...source.window]};settle(s,p,true,metric);
 if(s.anchor||s.tentative)s.gapCount++;
 s.anchor=null;s.tentative=null;s.window=[];s.decision=reason;return s;
}
export function acceptSample(source:RouteState,x:Sample,receivedAt:number,p:Policy=defaultPolicy,metric=geodesic):RouteState{
 // Reject invalid/future time without poisoning the ordering watermark.
 if(!Number.isSafeInteger(x.timestamp)||x.timestamp<0||!Number.isFinite(receivedAt)||x.timestamp>receivedAt+p.futureMs)return breakRoute(source,'weak',p,metric);
 if(x.timestamp<=source.watermark)return {...source,decision:'duplicate'};
 const s={...source,window:[...source.window],watermark:x.timestamp};
 if(!Number.isFinite(x.latitude)||Math.abs(x.latitude)>90||!Number.isFinite(x.longitude)||Math.abs(x.longitude)>180||x.mocked||x.accuracy===null||!Number.isFinite(x.accuracy)||x.accuracy<0||x.accuracy>p.accuracyM||receivedAt-x.timestamp>p.staleMs)return breakRoute(s,'weak',p,metric);
 const previous=s.anchor??s.tentative;
 if(!previous){s.tentative={...x};s.decision='reacquiring';return s;}
 const ms=x.timestamp-previous.timestamp;
 if(ms>p.gapMs){const next=breakRoute(s,'gap',p,metric);next.tentative={...x};return next;}
 const d=metric(previous,x);
 if(!Number.isFinite(d)||d<0||d>p.maxEdgeM||d/ms*1000>p.maxSpeedMps)return breakRoute(s,'jump',p,metric);
 if(!s.anchor){s.segments++;s.window=[previous];s.first??={...previous};s.tentative=null;}
 s.anchor={...x};s.last={...x};s.window.push({...x});s.rawEligibleM+=d;s.qualifiedMs+=ms;
 settle(s,p,false,metric);return s;
}
export function displacement(s:RouteState){return s.first&&s.last?geodesic(s.first,s.last):0;}
export function paceSecondsPerKm(distanceM:number,timeMs:number){return distanceM>0&&timeMs>0?timeMs/distanceM:null;}
export function finishRoute(s:RouteState,p:Policy=defaultPolicy){return breakRoute(s,'paused',p);}
export type DistanceSummary={distanceM:number;source?:'gps';processingVersion?:2;configId?:string;fractionM?:number;movingMs?:number;qualifiedMs?:number;uncertainMs?:number;gapCount?:number;displacementM?:number};
export function routeSummary(s:RouteState):DistanceSummary{const precise=Math.round(s.distanceM*1e6)/1e6;return {source:'gps',processingVersion:2,configId:CONFIG_ID,distanceM:Math.min(5000000,Math.floor(precise)),fractionM:precise-Math.floor(precise),movingMs:s.movingMs,qualifiedMs:s.qualifiedMs,uncertainMs:s.uncertainMs,gapCount:s.gapCount,...(s.startKnown&&s.first&&s.last?{displacementM:Math.floor(displacement(s))}:{})};}
export function resumeRoute(summary:DistanceSummary){const s=emptyRoute(summary.distanceM+(summary.fractionM??0));s.startKnown=summary.distanceM===0&&(summary.qualifiedMs??0)===0;s.movingMs=summary.movingMs??0;s.qualifiedMs=summary.qualifiedMs??0;s.uncertainMs=summary.uncertainMs??0;s.gapCount=summary.gapCount??0;return s;}
export function canonicalSummary(g:DistanceSummary):DistanceSummary{return g.processingVersion===2?{distanceM:g.distanceM,source:'gps',processingVersion:2,configId:CONFIG_ID,fractionM:g.fractionM??0,movingMs:g.movingMs??0,qualifiedMs:g.qualifiedMs??0,uncertainMs:g.uncertainMs??0,gapCount:g.gapCount??0,...(g.displacementM===undefined?{}:{displacementM:g.displacementM})}:{distanceM:g.distanceM};}
export function validSummary(g:DistanceSummary){return g.processingVersion===undefined||g.processingVersion===2&&g.source==='gps'&&g.configId===CONFIG_ID&&[g.movingMs,g.qualifiedMs,g.uncertainMs,g.gapCount,g.displacementM].every(n=>n===undefined||Number.isSafeInteger(n)&&n>=0&&n<=604800000)&& (g.fractionM===undefined||Number.isFinite(g.fractionM)&&g.fractionM>=0&&g.fractionM<1);}
// Checkpoints are transient and untrusted on recovery. Never reuse an older engine shape.
export function validRoute(value:unknown):value is RouteState{
 if(!value||typeof value!=='object')return false;const s=value as RouteState;
 const point=(x:Sample|null)=>x===null||!!x&&Number.isFinite(x.latitude)&&Math.abs(x.latitude)<=90&&Number.isFinite(x.longitude)&&Math.abs(x.longitude)<=180&&Number.isSafeInteger(x.timestamp)&&x.timestamp>=0&&typeof x.accuracy==='number'&&Number.isFinite(x.accuracy)&&x.accuracy>=0&&x.accuracy<=25;
 return s.version===2&&typeof s.startKnown==='boolean'&&[s.distanceM,s.rawEligibleM,s.movingMs,s.qualifiedMs,s.uncertainMs,s.gapCount,s.segments].every(n=>Number.isFinite(n)&&n>=0)&&s.distanceM<=5000000&&Number.isSafeInteger(s.watermark)&&s.watermark>=-1&&Array.isArray(s.window)&&s.window.length<=96&&s.window.every(point)&&[s.anchor,s.tentative,s.first,s.last].every(point);
}
export function createRawWindow(){let samples:Sample[]=[];return {push(x:Sample,now:number){samples=samples.filter(p=>p.timestamp>=now-120000);if(x.timestamp>=now-120000&&x.timestamp<=now+2000)samples.push({...x});samples=samples.slice(-256);},read(){return samples.map(s=>({...s}));},clear(){samples=[];}};}


