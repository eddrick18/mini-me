import test from 'node:test';
import assert from 'node:assert/strict';
import { EARTH_RADIUS_M as R, normalizeSample, sampleIssue, acceptSample, emptyRoute, finishRoute, geodesic, displacement, paceSecondsPerKm, routeSummary, resumeRoute, defaultPolicy, validRoute, createRawWindow, type Sample } from '../src/domain/runningDistance.ts';
import { applyCommand, emptyLedger } from '../src/domain/activity.ts';
import { serializeBackup, parseBackup } from '../src/domain/backup.ts';
const t=100000;
const fix=(x:number,y=0,seconds=0,speed:number|null=1):Sample=>({latitude:y/R*180/Math.PI,longitude:x/R*180/Math.PI,timestamp:t+seconds*1000,accuracy:5,speed});
function run(points:Sample[]){let s=emptyRoute();for(const p of points)s=acceptSample(s,p,p.timestamp);return finishRoute(s);}
function near(a:number,b:number,tol=.01){assert.ok(Math.abs(a-b)<=tol,`${a} vs ${b}, tolerance ${tol}`);}
test('stationary exact and bounded drift produce no confirmed movement; raw noise remains observable',()=>{
 const exact=run(Array.from({length:601},(_,i)=>fix(0,0,i,0)));near(exact.distanceM,0,.001);assert.equal(exact.movingMs,0);
 const noise=run(Array.from({length:601},(_,i)=>fix(Math.sin(i)*.5,Math.cos(i)*.5,i,0)));
 assert.ok(noise.rawEligibleM>100);assert.ok(noise.distanceM<=3);assert.equal(noise.movingMs,0);
});
test('one-metre and sub-accuracy slow steps count without an eight-metre deadband',()=>{
 near(run(Array.from({length:1001},(_,i)=>fix(i,0,i,1))).distanceM,1000);
 const slow=run(Array.from({length:121},(_,i)=>fix(i*.2,0,i,.2)));
 assert.ok(slow.distanceM>=21.59&&slow.distanceM<=24.01);
 near(run(Array.from({length:101},(_,i)=>fix(i*3,0,i,3))).distanceM,300);
});
// Spherical direct-geodesic generator is independent of the inverse implementation.
function circle(r:number,m:number,laps=1):Sample[]{const delta=r/R;return Array.from({length:m*laps+1},(_,i)=>{
 const bearing=2*Math.PI*i/m,lat=Math.asin(Math.sin(delta)*Math.cos(bearing)),lon=Math.atan2(Math.sin(bearing)*Math.sin(delta),Math.cos(delta));
 return {latitude:lat*180/Math.PI,longitude:lon*180/Math.PI,timestamp:t+i*1000,accuracy:2,speed:Math.min(11,2*m*r*Math.sin(Math.PI/m)/m)};
 });}
test('circles converge with sampling density; repeated laps ending at the start never reset totals',()=>{
 // Geometry-only polygon reference: accumulation independent of filter speed/gap constraints.
 for(const m of [8,16,32,64]){const points=circle(50,m);const total=points.slice(1).reduce((n,p,i)=>n+geodesic(points[i]!,p),0);near(total,2*m*50*Math.sin(Math.PI/m),.001);}
 const one=run(circle(50,64)),three=run(circle(50,64,3));near(three.distanceM,one.distanceM*3);near(displacement(three),0,.001);
 assert.ok((2*Math.PI*50-one.distanceM)/(2*Math.PI*50)<.002);
});
test('tight turns preserve intermediate corners rather than using an endpoint chord',()=>{
 const points=[fix(0,0,0,2),fix(2,0,1,2),fix(2,2,2,2),fix(0,2,3,2),fix(0,0,4,2)];
 near(run(points).distanceM,8);near(displacement(run(points)),0);
});
test('a spike never becomes a reference; valid fixes reacquire without bridging',()=>{
 let s=run([fix(0,0,0),fix(1,0,1)]);
 s=acceptSample(s,fix(10000,0,2),t+2000);assert.equal(s.decision,'reacquiring');
 s=acceptSample(s,fix(2,0,3),t+3000);assert.equal(s.decision,'jump');assert.equal(s.anchor,null);assert.equal(s.tentative,null);
 s=acceptSample(s,fix(3,0,4),t+4000);s=acceptSample(s,fix(4,0,5),t+5000);
 near(s.distanceM,2);assert.equal(s.segments,2);
});
test('long gaps, lost accuracy and pauses start new segments; totals survive',()=>{
 let s=acceptSample(emptyRoute(),fix(0,0,0),t);s=acceptSample(s,fix(1,0,1),t+1000);
 s=acceptSample(s,fix(100,0,30),t+30000);assert.equal(s.decision,'gap');near(s.distanceM,1);
 s=acceptSample(s,fix(101,0,31),t+31000);near(s.distanceM,2);
 s=acceptSample(s,{...fix(102,0,32),accuracy:null},t+32000);assert.equal(s.anchor,null);
 const resumed=resumeRoute(routeSummary(finishRoute(s)));near(resumed.distanceM,s.distanceM);
 let next=acceptSample(resumed,fix(1000,0,40),t+40000);next=acceptSample(next,fix(1001,0,41),t+41000);near(next.distanceM,3);
});
test('replay, malformed metadata and future time cannot poison later valid samples',()=>{
 let s=acceptSample(emptyRoute(),fix(0,0,0),t);s=acceptSample(s,fix(1,0,1),t+1000);
 const total=s.distanceM;s=acceptSample(s,fix(20,0,1),t+1000);near(s.distanceM,total);assert.equal(s.decision,'duplicate');
 s=acceptSample(s,fix(0,0,0),t+1000);near(s.distanceM,total);
 s=acceptSample(s,fix(999,0,999),t+1000);assert.equal(s.watermark,t+1000);
 for(const extra of [{latitude:91},{accuracy:-1},{accuracy:26},{mocked:true}])assert.equal(acceptSample(s,{...fix(2,0,2),...extra},t+2000).anchor,null);
 s=acceptSample(s,fix(2,0,2),t+2000);s=acceptSample(s,fix(3,0,3),t+3000);near(s.distanceM,2);
});
test('antimeridian uses the short arc; fractions survive resume and pace avoids division by zero',()=>{
 near(geodesic({latitude:0,longitude:179.999},{latitude:0,longitude:-179.999}),222.390160,.001);
 const s=run([fix(0,0,0),fix(.7,0,1)]);near(resumeRoute(routeSummary(s)).distanceM,.7);
 assert.equal(paceSecondsPerKm(0,1000),null);assert.equal(paceSecondsPerKm(1000,0),null);assert.equal(paceSecondsPerKm(1000,300000),300);
 assert.equal(validRoute(s),true);assert.equal(validRoute({...s,window:[{latitude:Infinity}]}),false);
 assert.equal(defaultPolicy.gapMs,10000);
});
test('metric injection is used for accumulation and raw comparison; checkpoint serialization is deterministic',()=>{
 const metric=()=>1;let state=acceptSample(emptyRoute(),fix(0,0,0),t,defaultPolicy,metric);
 state=acceptSample(state,fix(3,0,1),t+1000,defaultPolicy,metric);near(state.distanceM,1);near(state.rawEligibleM,1);
 const restored=JSON.parse(JSON.stringify(state));assert.equal(validRoute(restored),true);
 const x=fix(4,0,2);assert.deepEqual(acceptSample(state,x,x.timestamp),acceptSample(restored,x,x.timestamp));
});
test('route summary backup strips coordinates, validates metadata and preserves receipts',()=>{
 const route=run(Array.from({length:1001},(_,i)=>fix(i,0,i)));
 let ledger=applyCommand(emptyLedger(),{type:'start',id:'route',activity:'Running'},t);
 ledger.active!.gps=routeSummary(route);ledger=applyCommand(ledger,{type:'finish',id:'route',confirmedMs:1000000},t+1000000);
 const raw=JSON.parse(serializeBackup(ledger,t+1000001));raw.ledger.sessions[0].gps.route=[{latitude:14,longitude:121}];
 const restored=parseBackup(JSON.stringify(raw)).ledger;assert.equal(restored.sessions[0]!.xp,20);
 assert.deepEqual(restored.sessions[0]!.gps,ledger.sessions[0]!.gps);
 raw.ledger.sessions[0].gps.fractionM=-1;assert.throws(()=>parseBackup(JSON.stringify(raw)),/invalid/);
});
test('raw diagnostics are bounded by age/count and cleared independently from totals',()=>{
 const raw=createRawWindow();for(let i=0;i<300;i++)raw.push(fix(i,0,i),t+i*1000);
 assert.ok(raw.read().length<=121);const copy=raw.read();copy[0]!.latitude=80;assert.notEqual(raw.read()[0]!.latitude,80);
 raw.clear();assert.deepEqual(raw.read(),[]);
});
test('independent WGS84 equatorial reference bounds spherical modelling error',()=>{
 const expected=6378137*Math.PI/180*.01;const estimate=geodesic({latitude:0,longitude:0},{latitude:0,longitude:.01});
 assert.ok(Math.abs(estimate-expected)/expected<.006);
});
test('meridional ellipsoid reference stays within the modelling budget at several latitudes',()=>{
 const a=6378137,f=1/298.257223563,e2=f*(2-f);
 const curvature=(lat:number)=>a*(1-e2)/(1-e2*Math.sin(lat)**2)**1.5;
 for(const latitude of [0,15,45,80]){const p=latitude*Math.PI/180,q=(latitude+.01)*Math.PI/180;
  const reference=(q-p)/6*(curvature(p)+4*curvature((p+q)/2)+curvature(q));
  const estimate=geodesic({latitude,longitude:0},{latitude:latitude+.01,longitude:0});
  assert.ok(Math.abs(estimate-reference)/reference<.006);
 }
});
test('position-only tight loops are explicitly uncertain, and simulated noisy drift is not proof of movement',()=>{
 const small=circle(1,64).map(p=>({...p,speed:null}));const uncertain=run(small);
 assert.equal(uncertain.distanceM,0);assert.ok(uncertain.uncertainMs>0);
 const drift=run(Array.from({length:301},(_,i)=>fix(Math.sin(i*.1)*10,Math.cos(i*.1)*10,i,null)));
 assert.ok(drift.distanceM>0);assert.ok(drift.rawEligibleM>=drift.distanceM);
 // This failure mode is intentional evidence of ambiguity, not an accuracy success.
});
test('longitude boundary is traversable with plausible short steps in the production policy',()=>{
 const degree=180/Math.PI/R;const points=Array.from({length:11},(_,i)=>{
  let longitude=179.99999+i*degree;if(longitude>180)longitude-=360;
  return {...fix(0,0,i),longitude};
 });near(run(points).distanceM,10);
});


 test('iOS fractional millisecond samples normalize and count while invalid times stay invalid',()=>{
 const a=normalizeSample({...fix(0),timestamp:1791594000000.123});
 const b=normalizeSample({...fix(2),timestamp:1791594001000.456});
 assert.equal(a.timestamp,1791594000000);
 let state=acceptSample(emptyRoute(),a,a.timestamp+10);
 state=acceptSample(state,b,b.timestamp+10);near(state.distanceM,2);
 for(const timestamp of [NaN,Infinity,-.1])assert.equal(acceptSample(emptyRoute(),normalizeSample({...fix(0),timestamp}),t).decision,'weak');
 assert.match(sampleIssue({...a,accuracy:65},a.timestamp)!,/accuracy 65 m/);
 assert.match(sampleIssue({...a,accuracy:null},a.timestamp)!,/accuracy unavailable/);
 assert.equal(sampleIssue(a,a.timestamp),null);
 });
