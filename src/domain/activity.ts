import { validCheckins, type Checkin } from './checkins.ts';
import { canonicalSummary, validSummary, type DistanceSummary } from './runningDistance.ts';
import { defaultRoom, isRoom, type RoomLayout } from './room.ts';
import { quests, questProgress, validClaims, type QuestClaim, type QuestId } from './quests.ts';
import { defaultAppearance, isAppearance, palettes, type Appearance } from './appearance.ts';
export const activities = ['Studying', 'Working', 'Gym', 'Running', 'Music'] as const;
export type Activity = typeof activities[number];
export const activityName=(activity:Activity)=>activity==='Running'?'Walking / Running':activity;
export type GpsSummary=DistanceSummary;
export const gpsBaseXp=(distanceM:number)=>distanceM>=3000?30:distanceM>=1000?20:0;
export const validGps=(gps:unknown,activity:Activity):gps is GpsSummary=>!!gps&&typeof gps==='object'&&activity==='Running'&&Number.isSafeInteger((gps as GpsSummary).distanceM)&&(gps as GpsSummary).distanceM>=0&&(gps as GpsSummary).distanceM<=5000000&&validSummary(gps as GpsSummary);
export type ActiveSession = { id: string; activity: Activity; status: 'running' | 'paused' | 'interrupted'; startedAt: number; segmentAt: number | null; activeMs: number; clockReview: boolean; gps?:GpsSummary };
export type CompletedSession = { id: string; activity: Activity; startedAt: number; completedAt: number; activeMs: number; xp: number; rewardDay: string; gps?:GpsSummary };
export type FeedbackPreferences = { sound: boolean; haptics: boolean };
export const defaultFeedback = (): FeedbackPreferences => ({ sound:false, haptics:true });
export type CompanionPreferences={spontaneous:boolean;reactions:boolean};
export const defaultCompanion=():CompanionPreferences=>({spontaneous:true,reactions:true});
export type Ledger = { version: 1; checkins:Checkin[]; active: ActiveSession | null; sessions: CompletedSession[]; preferStill: boolean; appearance: Appearance; questClaims: QuestClaim[]; room: RoomLayout; feedback: FeedbackPreferences; companion:CompanionPreferences };
export type Command = {type:'companion';value:CompanionPreferences} | { type:'feedback'; value:FeedbackPreferences } | { type: 'room'; value: RoomLayout } | { type: 'claimQuest'; id: QuestId; day: string } | { type: 'start'; id: string; activity: Activity } | { type: 'pause' | 'resume' | 'interrupt'; id: string } | { type: 'finish'; id: string; confirmedMs?: number } | { type: 'still'; value: boolean } | { type: 'appearance'; value: Appearance };
export const emptyLedger = (): Ledger => ({ version: 1, checkins:[], active: null, sessions: [], preferStill: false, appearance: defaultAppearance(), questClaims: [], room: defaultRoom(), feedback:defaultFeedback(), companion:defaultCompanion() });
export function rewardDay(now: number) { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now); }
export function elapsed(session: ActiveSession, now: number) { return session.activeMs + (session.segmentAt === null ? 0 : Math.max(0, now - session.segmentAt)); }
export function needsReview(session: ActiveSession, now: number) { return session.clockReview || session.status === 'interrupted' || (session.segmentAt !== null && now < session.segmentAt) || elapsed(session, now) > 4 * 60 * 60 * 1000; }
export function totalXp(ledger: Ledger) { return ledger.sessions.reduce((sum, s) => sum + s.xp, 0) + (ledger.questClaims??[]).reduce((sum,c)=>sum+c.xp,0); }
export function levelProgress(xp: number) { const level = Math.floor((1 + Math.sqrt(1 + 4 * xp / 50)) / 2); const floor = 50 * (level - 1) * level, ceiling = 50 * level * (level + 1); return { level, earned: xp - floor, needed: ceiling - floor, next: ceiling }; }
export function award(activeMs: number, activity: Activity, sessions: CompletedSession[], day: string,gps?:GpsSummary) { const base = gps?gpsBaseXp(gps.distanceM):activeMs >= 1_200_000 ? 30 : activeMs >= 300_000 ? 20 : 0; const today = sessions.filter(s => s.rewardDay === day); if (today.filter(s => s.activity === activity && s.xp > 0).length >= 2) return 0; return Math.max(0, Math.min(base, 120 - today.reduce((sum, s) => sum + s.xp, 0))); }
export function applyCommand(source: Ledger, command: Command, now: number): Ledger {
 if (!Number.isFinite(now)) throw new Error('Invalid session time.');
 const state: Ledger = { ...source, sessions: [...source.sessions], active: source.active ? { ...source.active } : null };
 if(command.type==='companion'){if(typeof command.value?.spontaneous!=='boolean'||typeof command.value?.reactions!=='boolean')throw new Error('Choose valid companion preferences.');state.companion={spontaneous:command.value.spontaneous,reactions:command.value.reactions};return state;}
 if(command.type==='feedback'){if(typeof command.value?.sound!=='boolean'||typeof command.value?.haptics!=='boolean')throw new Error('Choose valid sound and vibration preferences.');state.feedback={sound:command.value.sound,haptics:command.value.haptics};return state;}
 if(command.type==='claimQuest'){
  const q=quests.find(q=>q.id===command.id);if(!q||command.day!==rewardDay(now))throw new Error('This quest day has ended. Review today’s quests.');
  if((state.questClaims??[]).some(c=>c.id===q.id&&c.day===command.day))return state;
  if(questProgress(state.sessions.filter(s=>s.completedAt<=now),command.day,q.id)<q.target)throw new Error('Finish and save activities to complete this quest.');
  state.questClaims=[...(state.questClaims??[]),{id:q.id,day:command.day,claimedAt:now,xp:10}];return state;
 }
 if(command.type==='room'){if(!isRoom(command.value,levelProgress(totalXp(state)).level))throw new Error('Choose owned decorations for each room slot.');state.room={...command.value};return state;}
 if (command.type === 'still') { state.preferStill = command.value; return state; }
 if (command.type === 'appearance') {
  if (!isAppearance(command.value)) throw new Error('Choose a valid outfit and clothing color.');
  if (levelProgress(totalXp(state)).level < palettes[command.value.palette].level) throw new Error('Reach level 2 to wear this clothing color.');
  state.appearance = { ...command.value }; return state;
 }
 if (command.type === 'start') {
  if (state.active) throw new Error('Finish or resume your current session first.');
  if (!activities.includes(command.activity) || !command.id || state.sessions.some(s => s.id === command.id)) throw new Error('Invalid new session.');
  state.active = { id: command.id, activity: command.activity, startedAt: now, segmentAt: now, status: 'running', activeMs: 0, clockReview: false,...(command.activity==='Running'?{gps:{distanceM:0}}:{}) }; return state;
 }
 if (command.type === 'finish' && state.sessions.some(s => s.id === command.id)) return state;
 const active = state.active; if (!active || active.id !== command.id) throw new Error('This session is no longer active.');
 if (command.type === 'pause' || command.type === 'interrupt') {
  active.clockReview ||= active.segmentAt !== null && now < active.segmentAt;
  active.activeMs = elapsed(active, now); active.segmentAt = null; active.status = command.type === 'interrupt' ? 'interrupted' : 'paused'; return state;
 }
 if (command.type === 'resume') { if (active.status === 'interrupted') throw new Error('Review the recovered session before saving.'); if (active.status === 'paused') { active.status = 'running'; active.segmentAt = now; } return state; }
 if (command.type === 'finish') {
  if (needsReview(active, now) && command.confirmedMs === undefined) throw new Error('Confirm the active time before saving.');
  const activeMs = command.confirmedMs ?? elapsed(active, now);
  if (!Number.isSafeInteger(activeMs) || activeMs < 0 || activeMs > 7 * 24 * 60 * 60 * 1000) throw new Error('Enter a valid duration of up to seven days.');
  const day = rewardDay(now); const xp = award(activeMs, active.activity, state.sessions, day,active.gps);
  state.sessions.push({ id: active.id, activity: active.activity, startedAt: active.startedAt, completedAt: now, activeMs, xp, rewardDay: day,...(active.gps?{gps:canonicalSummary(active.gps)}:{}) }); state.active = null; return state;
 }
 return state;
}
export function readLedger(raw: string): Ledger {
 const value: unknown = JSON.parse(raw);
 if (!value || typeof value !== 'object') throw new Error('Local records could not be read.');
 const s = value as Ledger;
 const validNumber = (n: unknown) => typeof n === 'number' && Number.isSafeInteger(n) && n >= 0;
 if (s.version !== 1 || typeof s.preferStill !== 'boolean' || !Array.isArray(s.sessions) || s.sessions.some(x => !x || typeof x.id !== 'string' || !activities.includes(x.activity) || !validNumber(x.activeMs) || !validNumber(x.startedAt) || !validNumber(x.completedAt) || !validNumber(x.xp) || x.xp > 30 || typeof x.rewardDay !== 'string')) throw new Error('Unsupported or damaged local records. Your data was not changed.');
 if (new Set(s.sessions.map(x => x.id)).size !== s.sessions.length) throw new Error('Duplicate local records. Your data was not changed.');
 if(s.sessions.some(x=>x.gps!==undefined&&!validGps(x.gps,x.activity))||(s.active?.gps!==undefined&&!validGps(s.active.gps,s.active.activity)))throw new Error('Damaged GPS totals. Your data was not changed.');
 if (s.active !== null && (!s.active || typeof s.active.id !== 'string' || !activities.includes(s.active.activity) || !['running','paused','interrupted'].includes(s.active.status) || !validNumber(s.active.activeMs) || !validNumber(s.active.startedAt) || !(s.active.segmentAt === null || validNumber(s.active.segmentAt)) || typeof s.active.clockReview !== 'boolean' || (s.active.status === 'running') !== (s.active.segmentAt !== null) || s.sessions.some(x=>x.id===s.active?.id))) throw new Error('Damaged active session. Your data was not changed.');
 const questClaims=s.questClaims===undefined?[]:s.questClaims;
 if(!validClaims(questClaims,s.sessions)||questClaims.some(c=>rewardDay(c.claimedAt)!==c.day))throw new Error('Damaged quest rewards. Your data was not changed.');
 const checkins=s.checkins===undefined?[]:s.checkins;
 if(!validCheckins(checkins,rewardDay))throw new Error('Damaged check-in records. Your data was not changed.');
 const normalized={...s,questClaims,checkins:checkins.map(c=>({day:c.day,mood:c.mood,updatedAt:c.updatedAt}))};
 const appearance = s.appearance === undefined ? defaultAppearance() : s.appearance;
 if (!isAppearance(appearance) || levelProgress(totalXp(normalized)).level < palettes[appearance.palette].level) throw new Error('Damaged appearance settings. Your data was not changed.');
 const room=s.room===undefined?defaultRoom():s.room;
 if(!isRoom(room,levelProgress(totalXp(normalized)).level))throw new Error('Damaged room settings. Your data was not changed.');
 const feedback=s.feedback===undefined?defaultFeedback():s.feedback;
 if(typeof feedback?.sound!=='boolean'||typeof feedback?.haptics!=='boolean')throw new Error('Damaged feedback settings. Your data was not changed.');
 const companion=s.companion===undefined?defaultCompanion():s.companion;
 if(typeof companion?.spontaneous!=='boolean'||typeof companion?.reactions!=='boolean')throw new Error('Damaged companion settings. Your data was not changed.');
 return { ...normalized, companion:{spontaneous:companion.spontaneous,reactions:companion.reactions}, feedback:{sound:feedback.sound,haptics:feedback.haptics}, room:{desk:room.desk,plant:room.plant,poster:room.poster}, appearance: { ...appearance } };
}



