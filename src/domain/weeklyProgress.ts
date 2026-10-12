import { activities, rewardDay, type Ledger } from './activity.ts';
const dayMs=86400000;
export function weeklyProgress(ledger:Ledger,now:number,weeksAgo=0){
 const today=rewardDay(now),anchor=Date.parse(`${today}T00:00:00+08:00`)-Math.max(0,Math.floor(weeksAgo))*7*dayMs;
 const days=Array.from({length:7},(_,i)=>{
  const at=anchor-(6-i)*dayMs,day=rewardDay(at),sessions=ledger.sessions.filter(s=>s.rewardDay===day);
  return {day,at,count:sessions.length,activeMs:sessions.reduce((n,s)=>n+s.activeMs,0),activityXp:sessions.reduce((n,s)=>n+s.xp,0),questXp:ledger.questClaims.filter(c=>c.day===day).reduce((n,c)=>n+c.xp,0)};
 });
 const selected=new Set(days.map(d=>d.day));
 return {days,count:days.reduce((n,d)=>n+d.count,0),activeMs:days.reduce((n,d)=>n+d.activeMs,0),activityXp:days.reduce((n,d)=>n+d.activityXp,0),questXp:days.reduce((n,d)=>n+d.questXp,0),activities:activities.map(activity=>({activity,activeMs:ledger.sessions.filter(s=>selected.has(s.rewardDay)&&s.activity===activity).reduce((n,s)=>n+s.activeMs,0)}))};
}
