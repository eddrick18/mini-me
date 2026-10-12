import test from 'node:test';
import assert from 'node:assert/strict';
import { achievementDetails, achievementProgress, newlyUnlocked } from '../src/domain/achievements.ts';
import { emptyLedger, applyCommand, type CompletedSession, type Activity } from '../src/domain/activity.ts';
const saved=(id:string,activity:Activity,at:number):CompletedSession=>({id,activity,completedAt:at,startedAt:at,activeMs:0,xp:0,rewardDay:'2026-10-11'});
test('saved history unlocks thresholds regardless of XP; dates follow completion order',()=>{
 const sessions=[...Array.from({length:5},(_,i)=>saved(`s${i}`,'Studying',100+i)),...Array.from({length:5},(_,i)=>saved(`m${i}`,'Music',200+i)),saved('run','Running',300),saved('gym','Gym',400),saved('work','Working',500)];
 const progress=achievementProgress([...sessions].reverse());
 assert.deepEqual(progress.map(a=>[a.progress,a.unlockedAt]),[[1,300],[5,104],[5,204],[5,500]]);
 assert.deepEqual(sessions.map(s=>s.xp),Array(13).fill(0));
});
test('empty, partial and duplicate history cannot unlock early; repeated saves do not replay',()=>{
 assert.ok(achievementProgress([]).every(a=>a.progress===0&&a.unlockedAt===null));
 const studies=Array.from({length:4},(_,i)=>saved(`s${i}`,'Studying',i));
 assert.equal(achievementProgress([...studies,...studies])[1]!.progress,4);
 const fifth=saved('fifth','Studying',5),after=[...studies,fifth];
 assert.deepEqual(newlyUnlocked(studies,after).map(a=>a.id),['bookworm']);
 assert.deepEqual(newlyUnlocked(after,after),[]);
});
test('active sessions do not count; committed save may unlock multiple badges',()=>{
 let ledger=emptyLedger();ledger.sessions=['Studying','Working','Gym','Music'].map((a,i)=>saved(`${i}`,a as Activity,i));
 const started=applyCommand(ledger,{type:'start',id:'run',activity:'Running'},1000);
 assert.equal(achievementProgress(started.sessions)[0]!.unlockedAt,null);
 const finished=applyCommand(started,{type:'finish',id:'run'},2000);
 assert.deepEqual(newlyUnlocked(ledger.sessions,finished.sessions).map(a=>a.id),['firstSteps','allRounder']);
 assert.deepEqual(newlyUnlocked(finished.sessions,applyCommand(finished,{type:'finish',id:'run'},3000).sessions),[]);
});
test('details choose an untried activity, count unique saves and stop suggesting after ownership',()=>{
 const study=saved('study','Studying',10),music=saved('music','Music',20);
 const partial=achievementDetails('allRounder',[study,study,music]);
 assert.equal(partial.nextActivity,'Working');
 assert.deepEqual(partial.checklist.map(a=>a.count),[1,0,0,0,1]);
 const complete=[study,music,saved('work','Working',30),saved('gym','Gym',40),saved('run','Running',50)];
 assert.equal(achievementDetails('allRounder',complete).nextActivity,null);
 assert.equal(achievementDetails('allRounder',complete).badge.unlockedAt,50);
});
test('single-activity details never suggest a different activity or count unrelated saves',()=>{
 const unrelated=[saved('work','Working',1),saved('run','Running',2)];
 const details=achievementDetails('bookworm',unrelated);
 assert.deepEqual(details.checklist,[{activity:'Studying',count:0}]);
 assert.equal(details.nextActivity,'Studying');
 assert.equal(achievementDetails('firstSteps',unrelated).nextActivity,null);
 assert.equal(achievementDetails('rhythm',unrelated).nextActivity,'Music');
});
