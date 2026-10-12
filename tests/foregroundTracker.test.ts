import test from 'node:test';
import assert from 'node:assert/strict';
import { createForegroundTracker } from '../src/platform/location/foregroundTracker.ts';
test('stopping discards queued callbacks and drains an in-flight write before restart',async()=>{
 const seen:number[]=[];let release!:()=>void;
 const blocked=new Promise<void>(r=>release=r);
 const tracker=createForegroundTracker<number>(async n=>{if(n===1)await blocked;seen.push(n);});
 const first=tracker.begin();const inFlight=tracker.enqueue(first,1);
 await Promise.resolve();await Promise.resolve();
 const queued=tracker.enqueue(first,2);const stopped=tracker.stop();
 release();await Promise.all([inFlight,queued,stopped]);
 assert.deepEqual(seen,[1]);
 const next=tracker.begin();await tracker.enqueue(first,3);await tracker.enqueue(next,4);
 assert.deepEqual(seen,[1,4]);
});
