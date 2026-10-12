# Daily quests

The approved quest board extends the previous no-goals scope. Three fixed quests reset at midnight in Asia/Manila: one saved activity of at least five active minutes; twenty saved active minutes across any activities; two saved activities of at least five minutes each. All activity categories count equally. Only completed, saved sessions count; paused/active time does not count until saved. Existing sessions from today can qualify.

Each quest grants ten XP after an explicit claim, once per day and quest ID. The activity reward cap remains 120 XP/day; quest bonuses add up to 30 XP/day separately (150 maximum combined). Claimed bonuses contribute to levels and clothing unlocks. Past claimed XP is retained; unclaimed rewards expire with the day. No streak penalties, category rotation, reminders or surveillance.

src/domain/quests.ts owns the catalog/progress/receipt validation. applyCommand owns eligibility and idempotency. useSessions and the existing store commit claims atomically before success feedback. Failed writes keep rewards claimable. Clock changes cannot be trusted in an offline app; future-dated completions do not qualify until their recorded instant, and changing the date during a claim rejects stale days. Existing interruption/duration review still applies.

QuestBoard uses the established purple, cream and gold tokens and GameButton. Progress bars expose text equivalents; ready, claimed, incomplete and saving states are distinct. Home reports activity XP and claimed quest bonus separately. No new animation bypasses reduced-motion preferences.

Ledger version 1 receives an additive empty questClaims array for legacy saves. Backups now export format version 2 to preserve receipts and total XP; version 1 backups remain readable, while old app builds reject version 2 instead of silently dropping rewards. Import validates unique earned receipts, claim-day keys, timestamps and fixed ten-XP amounts. Recovery copies include receipts.

Verification: TypeScript and 17 tests pass. Browser claims all three rewards, raises total from 120 to 150 XP, and keeps claimed states after reload. Tests cover unfinished eligibility, repeated claims, midnight boundaries, old backups, malformed receipts, later sessions, failed writes and retry after reopening. Native and physical iPhone interactions require device checks. Figma and Rive were not synchronized by this change.

Android startup inspection confirms the updated Home loads and preserves two saved activities plus the paused Music session. Quest-board layout and native claim interaction await the user check. The actual browser export/import preview was verified with three quest receipts and 150 total XP.
