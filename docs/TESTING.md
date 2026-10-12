# Verification plan and evidence

## Recorded checks

2026-10-10: read user brief; listed workspace; inspected git status/history and instructions; queried tool versions/paths; listed Android SDK components and AVD; read Rive help and installed documentation; checked Rive whoami; called Figma whoami; opened official Expo/Rive/Supabase/Apple documentation. Results are in DEVELOPMENT. Planning discovery preceded implementation. Subsequent checks: TypeScript passed; two controller tests passed; web export passed; Expo Doctor passed21/21; Rive CLI validation/inspection reported zero problems; browser pose changes/fallback restoration and phone-width layout verified. Pixel_4 API36 booted. Android development APK compilation passed with Rive/Nitro; installation and cold start passed on Pixel_4 API36 x86_64. Native Rive idle rendered, and the user confirmed studying, celebration, and Prefer still poses controls all work. Native background/OS setting/performance/fault-injection checks remain; physical iPhone, SQLite, integration, and release checks have not run. VS Code CLI emitted sandbox warnings. Figma file access and Rive signed export remain unverified.

## Required tests during implementation

Domain unit tests: level boundaries, duration thresholds, daily per-category/global caps, no all-category requirement, midnight/timezone transitions, manual/backdated logs, paused/abandoned states, edit/delete preservation, rule versions. Use expected examples independent of the implementation formula where possible.

SQLite integration tests: transaction rollback, duplicate completion, concurrent tap requests, one active session, ledger/cache consistency, migration fixtures and failure recovery, validated import replacement. Lifecycle scenarios: lock/background/reopen, terminate/restart/device reboot, pause recovery, clock discontinuities, extreme elapsed time, missing network. No interval callback is evidence of elapsed duration.

If cloud selected: two-user RLS isolation, anon denial, forged owner, restricted direct APIs, private function grants/search_path, revoked tokens, concurrent reward/day-budget requests, rate-limit window boundaries and bypass attempts, account deletion scope, retry idempotency. If dual-store selected: lost responses, replay, pending edits/deletes, account switches, multi-device conflicts, confirmed/provisional UI, migration of outbox.

Manual native checks: Rive asset on emulator and physical iPhone, transitions, missing/corrupt asset fallback, reduced motion, foreground/background suspension, small/large screen, maximum text size, keyboard/safe areas, VoiceOver/TalkBack labels, repeated taps, understandable empty/error states. Measure frame pacing/memory over a 10-minute character session; set device-specific targets after proof, with no unbounded resource growth. Verify timer duration independently.

Release checks use a release-mode build without Metro and an offline cold start. Each result records command/build/device/OS, expected versus observed behavior, and unresolved issues. Never infer physical-device success from emulator success.




## Proposed running-distance evaluation

See [RUNNING_DISTANCE.md](RUNNING_DISTANCE.md) for noise-free mathematical versus heuristic suites, absolute/relative tolerances, circle/lap density fixtures, slow movement, antimeridian, spikes, gaps, replay and lifecycle race cases. No tests for this new proposal have run. Physical measured-route, stationary and battery trials are required before practical accuracy claims; existing app unit tests and an iOS Metro compile do not satisfy that gate.

Running engine implementation: 40 tests now pass; tests/running-distance.test.ts covers mathematical and heuristic fixtures and documented drift ambiguity. Physical GPS/SQLite and battery tests remain open.


2026-10-10 physical iPhone update: user confirmed Expo Go GPS/timer now work after fractional timestamp normalization. Finish screenshot: 0.07 km, active 2:11, moving 1:52, displacement 5 m, two breaks, uncertain 0:05. This confirms foreground acquisition and timing only; save/history and measured-route accuracy remain pending. Field-test protocol and results: [GPS_FIELD_TEST.md](GPS_FIELD_TEST.md).


## Companion interactions
Companion interactions: 49 tests pass and local browser behavior checked on an isolated ledger. Native Rive badge and iPhone accessibility/layout remain pending. See CHARACTER_INTERACTIONS.md.
