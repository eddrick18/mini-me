import { activities, type Activity, type CompletedSession } from './activity.ts';

export const achievements=[
 {id:'firstSteps',name:'First Steps',description:'Save your first Walking / Running session.',target:1,activity:'Running'},
 {id:'bookworm',name:'Bookworm',description:'Save 5 study sessions.',target:5,activity:'Studying'},
 {id:'rhythm',name:'Finding Your Rhythm',description:'Save 5 music sessions.',target:5,activity:'Music'},
 {id:'allRounder',name:'All-Rounder',description:'Save a session in every activity.',target:activities.length,activity:null},
] as const;
export type AchievementId=typeof achievements[number]['id'];
export type AchievementProgress={id:AchievementId;name:string;description:string;target:number;progress:number;unlockedAt:number|null};

/** Saved history is the source of truth; active sessions and XP do not determine badges. */
export function achievementProgress(sessions:readonly CompletedSession[]):AchievementProgress[]{
 const unique=[...new Map(sessions.map(s=>[s.id,s])).values()].sort((a,b)=>a.completedAt-b.completedAt||a.id.localeCompare(b.id));
 return achievements.map(def=>{
  let count=0,unlockedAt:number|null=null;const seen=new Set<Activity>();
  for(const session of unique){
   if(def.activity){if(session.activity===def.activity)count++;}
   else {seen.add(session.activity);count=seen.size;}
   if(unlockedAt===null&&count>=def.target)unlockedAt=session.completedAt;
  }
  return {...def,progress:Math.min(count,def.target),unlockedAt};
 });
}
export function newlyUnlocked(before:readonly CompletedSession[],after:readonly CompletedSession[]){
 const owned=new Set(achievementProgress(before).filter(a=>a.unlockedAt!==null).map(a=>a.id));
 return achievementProgress(after).filter(a=>a.unlockedAt!==null&&!owned.has(a.id));
}
export function achievementDetails(id:AchievementId,sessions:readonly CompletedSession[]){
 const definition=achievements.find(a=>a.id===id)!;
 const badge=achievementProgress(sessions).find(a=>a.id===id)!;
 const unique=[...new Map(sessions.map(s=>[s.id,s])).values()];
 const relevant:readonly Activity[]=definition.activity?[definition.activity]:activities;
 const checklist=relevant.map(activity=>({activity,count:unique.filter(s=>s.activity===activity).length}));
 const nextActivity:Activity|null=badge.unlockedAt!==null?null:definition.activity??checklist.find(a=>a.count===0)?.activity??null;
 return {badge,checklist,nextActivity};
}
