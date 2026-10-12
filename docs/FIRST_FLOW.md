# First native activity flow — 10 October 2026

Implemented root route: app/index.tsx. The previous Rive compatibility proof remains at /compatibility.

## Delivered

Home with level/progress and today's summary; five activity choices; start/pause/resume/finish timer; duration review for interrupted sessions; atomic offline save and XP; bounded celebration; read-only history; persistent still poses. Complete sprite frames and layered park motion now run in React Native, including the running outfit. This rendering path uses PNG atlases, not a production Rive file.

## Storage and authority

src/domain/activity.ts owns duration, reward and level rules. src/data/sessionStore.native.ts uses Expo SQLite, WAL, schema version 1 and an exclusive read/modify/write transaction. This milestone intentionally stores a versioned JSON ledger in one app_ledger row rather than the normalized tables proposed in DATA_MODEL.md. It provides atomic completion and durable preferences for the first flow; normalization, migration fixtures, backup and large-history optimization remain future work. No existing database is wiped.

The browser adapter uses localStorage under a separate origin and key for testing; its data is independent of the emulator database. It does not verify SQLite by itself.

Rewards: 5 minutes = 20 XP; 20 minutes = 30 XP total; first two qualifying sessions per activity/day; 120 XP daily ceiling. Days use Asia/Manila. Completed IDs prevent duplicate rewards. Level thresholds are 100, 300 and 600 cumulative XP for levels 2, 3 and 4. Cosmetic milestone copy does not imply selectable outfits exist.

A monotonic foreground clock drives the timer; persisted timestamps estimate time while away. Cold-start active sessions and backward/over-four-hour intervals require review. Device clock manipulation while backgrounded is not a trusted anti-cheat boundary. Paused time is excluded.

## Recorded verification

- TypeScript check and seven tests passed, including duration thresholds, quotas/cap, permanent level thresholds, pause exclusion, idempotent completion, interruption and corrupt data rejection.
- Expo web export passed. Browser UI checks: start Running, pause fixed at 00:19, resume, finish/save 00:30 at 0 XP; start Study and reload, duration review, confirm 20 minutes, save +30 XP; history and progress survive reload; still poses survive reload.
- Android x86_64 debug Gradle build succeeded; APK installed and launched on Pixel_4 API36. Startup logs had no React Native crash.
- User confirmed native Running pause/resume/finish/save/history works. Direct SQLite inspection found schema 1, two unique completed records (Running and Working), no active session and 0 XP, appropriate for short sessions.
- SQLite reinspection confirmed both saved sessions remain and a paused Music session was retained. The user then explicitly enabled Prefer still poses and confirmed the switch remains on after reopening.
- Evidence: artifacts/first-flow-android-final.png, artifacts/first-flow-android-home.png, artifacts/first-flow-android-history.png (post-test Home), artifacts/first-flow-web-home.png and artifacts/native-ui-audit.json.

## Practical limits

This is a development build; Metro must stay running. A bundled offline release build has not been produced. iPhone 11 installation and physical-device testing remain pending. Backup/import, history editing, selectable cosmetics and account sync are not implemented. Figma synchronization remains subject to its connector access limit; no Rive authoring connection or production character rig is claimed. The existing handoff ZIP is the earlier design snapshot, not this native milestone.

Remaining checks: recovery of a running native session after termination, OS reduced motion, screen-reader/text scaling, forced image failure/retry, real-device pixel sampling, frame pacing/memory and battery behavior. The sprite pose cycles are draft animation assets.




## Wardrobe implemented

Starter outfit selection and three level-2 clothing colors now work in the wardrobe; see [WARDROBE.md](WARDROBE.md). Earlier first-flow references to all selectable cosmetics being pending are historical. Backup, skin/hair variants and accessories remain pending.
