# Dependency-aware milestone proposal

The user approved the recommended scope and compatibility milestone on 2026-10-10. Pixel art is selected; final character and full screens remain review checkpoints. Security, validation, privacy and documentation accompany each feature; final hardening verifies existing controls.

| Milestone | Outcome/scope and dependencies | Acceptance + automated/manual verification | Documentation + user task |
|---|---|---|---|
| 0 Discovery | Workspace/tool/integration inventory | Commands and official sources recorded; SDK gaps/file permissions openly unresolved | DEVELOPMENT, TESTING, PROGRESS; review findings |
| 1 Scope approval | Choose persistence, supported device OS, progression and backup policy; depends 0 | Decisions explicit; architecture matches selected behavior; review examples | PRODUCT, ARCHITECTURE, DECISIONS; user approval |
| 2a Visual direction | Side-by-side pixel/cozy direction and main flow; depends 1 | User selects direction; intended Figma file access verified; no full screens before direction approval | DESIGN; user supplies file or approves new file |
| 2b Native Rive proof | Minimal Expo development build and tiny idle/activity/celebration asset; depends 1 | Dependency checks/build pass; render/input/fallback/background/reduced-motion demo on emulator; physical iPhone test required to close milestone | CHARACTER, DEVELOPMENT, TESTING; SDK/signing setup, user character review |
| 3 Foundation | Approved flow/tokens/components, routing, stable character slot; depends 2a/2b | Typecheck; native navigation and accessibility inspection; loading/empty/error states reviewed against Figma | DESIGN, ARCHITECTURE; user reviews interaction prototype/screens |
| 4 One durable activity flow | Studying picker/timer/manual log/history, SQLite v1, recovery; depends 3 | Domain + DB checks; one active session, lock/relaunch/reboot recovery, finish idempotency demonstrated | PRODUCT, DATA_MODEL, TESTING; user first-flow review |
| 5 Progression/rewards | Approved ledger/caps/level and first visible unlocks; depends 4 | Boundary/duplicate/concurrency tests; level-up and edit/delete behavior demonstrated; no guilt mechanics | PRODUCT, CHARACTER, DATA_MODEL; user reward pacing review |
| 6 Full personal v1 | Remaining activities, appearance options, export/import/reset/settings; depends 5 | Asset transitions verified; import/migration tests; backup restore and accessible settings manually demonstrated | CHARACTER, SECURITY, DEVELOPMENT, TESTING; user customization/backup review |
| 7 Optional accounts/cloud | Only if selected; Auth, RLS, transactional rewards and durable limits before enabling endpoints | Auth/recovery/sign-out, two-user isolation, direct-path denial, concurrency/limit tests; no arbitrary XP writes | SECURITY, DATA_MODEL, DECISIONS; user provider/SMTP account setup |
| 8 Optional sync | Only if both databases selected; depends 7 | Outbox restart/replay, account partition, conflict and provisional reconciliation tests; offline multi-device demonstration | ARCHITECTURE, DATA_MODEL, TESTING; user sync-behavior review |
| 9 Release readiness | Hardening/accessibility/performance/release build; depends 6 and any selected 7/8 | Physical iPhone proof, production-mode cold start, recovery, privacy and performance checks recorded; no unresolved release blockers | RELEASE, TESTING, PROGRESS; user readiness review; publication separately authorized |

Recommended path skips 7/8. If online-only is selected, move Auth/RLS/server completion from 7 into foundation/first flow; never ship a cloud feature waiting for later security. If dual-store is selected, add account partitioning/outbox with first persistence and postpone confirmed rewards until server reconciliation exists.

First implementation after approval is 2b: the small native compatibility proof and Windows preview, alongside approved visual exploration. It deliberately precedes detailed character animation. No production publishing, account-file upload, paid build, or destructive migration is implied by plan approval.

## Proposed running-distance milestones (not started)

[RUNNING_DISTANCE.md](RUNNING_DISTANCE.md) is awaiting user approval. After approval: (1) pure geodesic math and independent fixtures; (2) segmentation/motion filtering and adversarial/noise tests; (3) atomic checkpoint, fractional totals, migration and retention; (4) Expo Go/native acquisition, timer/statistics and lifecycle integration; (5) measured-device routes and battery evaluation. Gate every stage on its documented acceptance criteria. Manual lap mode, stored routes and cloud upload are separate scope decisions. Existing iPhone GPS/timer issue remains pending physical confirmation; the proposal does not mark it fixed.

Running milestones 1–4 are implemented with 40 passing tests and bundle verification. Milestone 5 physical-route, lifecycle and battery evaluation is pending. Native SQLite GPS integration needs actual-device verification.
