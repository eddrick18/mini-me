// Legacy check-in validation retained to preserve existing local records and backups.
export const moods=['happy','okay','tired','stressed'] as const;
export type Mood=typeof moods[number];
export type Checkin={day:string;mood:Mood;updatedAt:number};
export const isMood=(value:unknown):value is Mood=>moods.includes(value as Mood);
export function validCheckins(value:unknown,dayAt:(at:number)=>string):value is Checkin[]{
 if(!Array.isArray(value)||value.length>10000)return false;
 const days=new Set<string>();
 return value.every(c=>{if(!c||typeof c.day!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(c.day)||!isMood(c.mood)||!Number.isSafeInteger(c.updatedAt)||c.updatedAt<0||c.updatedAt>8640000000000000||days.has(c.day)||dayAt(c.updatedAt)!==c.day)return false;days.add(c.day);return true;});
}
