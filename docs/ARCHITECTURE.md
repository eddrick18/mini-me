# Architecture proposal

## Smallest recommended system

One Expo app, native Rive runtime, local SQLite database, pure TypeScript session/progression rules. React hooks/context suffice initially; no global state library, microservices, or generic framework layer. SQLite persists structured history and atomic reward records on the device. It does not create cloud backup. PostgreSQL in Supabase would store cloud data and enable cross-device ownership. Using both adds a synchronization protocol; it is not automatic.

| Option | Source of truth | Benefit | Cost |
|---|---|---|---|
| Personal offline-only, recommended | SQLite | Sessions work without internet; no accounts/backend | Device loss needs user backup; no automatic multi-device use |
| Online-only | Supabase PostgreSQL | Account backup; one cloud authority | Network required to submit; Auth/RLS/limits/backend needed |
| Offline plus cloud | PostgreSQL confirmed ledger; SQLite pending records/cache | Offline sessions plus cloud durability | Provisional progress, conflicts, retries, account partitioning |

Online-only would show an explicit offline unavailable state; do not silently promise persistent offline sessions. If that is unacceptable, select the third option deliberately.

## Compatible technology baseline

Resolved baseline: Expo 57.0.27, React Native 0.86.3, React 19.2.3, and SDK-matched Expo Router/native modules. SDK 56 was rejected after Expo Doctor identified the Hermes V1 memory regression affecting Worklets/Reanimated. SDK 57 fixes that regression; see [official changelog](https://expo.dev/changelog/sdk-57). Node 24.18.1 and JDK 17.0.12 remain in use. npm lockfile records the installed versions.

Use recommended `@rive-app/react-native` plus `react-native-nitro-modules`, not legacy `rive-react-native`. Rive's documented minimums fit the proposed baseline. Exact published runtime/Nitro patch versions and peer constraints must be resolved and pinned during the approved compatibility proof, then recorded with the generated native toolchain. Minimum support is not proof of a working combination. Native packages require an Expo development build, not Expo Go. Use Expo-managed versions through `npx expo install`; run dependency validation and a real native build.

Sources checked 2026-10-10: [Expo SDK 56 matrix](https://docs.expo.dev/versions/v56.0.0/), [current matrix](https://docs.expo.dev/versions/latest/), [Rive recommended runtime](https://rive.app/docs/runtimes/react-native/react-native), [runtime repository](https://github.com/rive-app/rive-nitro-react-native).

## Intended folders and responsibility

```text
app/                       Expo Router routes; thin screen composition
src/ui/                    Shared accessible controls and feedback
src/design/                Tokens and theme
src/features/sessions/     Session orchestration and screen models
src/features/history/      Queries and summaries
src/features/character/    Preferences, unlock selection, one controller
src/features/settings/     Privacy/export/import/settings orchestration
src/domain/sessions/       Pure transitions, durations, validation
src/domain/progression/    Pure awards, thresholds, rule versions
src/platform/lifecycle/    AppState, persisted clock checkpoints
src/platform/animation/    Native adapter and separate web fallback
src/data/                  SQLite repositories, transactions, migrations
src/validation/            Shared input/error definitions
assets/character/          Exported .riv and fallback
character/source/          Editable RML/scripts/assets; export manifest
tests/                     Meaningful domain/integration scenarios
docs/                      Decisions and evidence
```

Routes → feature services → domain rules and repositories. Domain has no React, database, or Rive imports. Repositories implement narrow operations such as completeSessionWithAward; queries stay out of screens. Controller consumes derived character state and never changes authoritative session or XP state. Errors map to friendly UI messages at feature boundaries.

If cloud is selected, add `src/auth/` for credentials/session lifecycle, `src/api/` for authenticated remote calls, `src/sync/` only for dual-store reconciliation, and `supabase/migrations/` plus trusted server functions. Notifications get a platform module only if later approved.

## Timer and lifecycle rules

Persist session start, completed active segments, pause intervals, last checkpoint, and status. While foregrounded use a monotonic elapsed clock; UI intervals merely redraw. On lock/background, persist a checkpoint and stop unnecessary rendering; the session continues conceptually using timestamps without a background JS loop. Paused sessions stay paused. On reopen, reconstruct elapsed time from timestamps minus pauses. On process termination or reboot, show an interrupted-session review with an estimated duration; do not silently award XP. User can confirm/correct or abandon.

Detect negative wall-clock deltas and disagreement with foreground monotonic time; mark duration for review, never subtract earned XP. Offline software cannot reliably distinguish real time from clock changes across restarts. Sessions over four hours request duration confirmation; the 20-minute reward tier prevents extra duration from generating unlimited XP. Lost network has no effect in local v1. Cloud mode queues only when the dual-store design is approved; otherwise completion waits for connection with recoverable UI. Reject a second simultaneous session; offer resume/finish/abandon the existing one.

## Optional dual-store synchronization specification

Each mutation has UUID, owner namespace, entity version, payload, creation time, attempts, next retry, and status. PostgreSQL is authoritative for confirmed XP; local pending XP is visibly provisional. An atomic backend transaction checks ownership, idempotency, daily budget, and rules before returning session, receipt, progress, and server version. No pending arbitrary XP is accepted.

Persist the outbox and session together. Retries use the same UUID; jittered exponential delays, maximum five attempts per foreground cycle, then pause until user retry or a later network event. Validation failures stop; expired credentials require reauthentication. Never upload anonymously or under another account. Sign-out stops uploads and partitions retained local records by owner; switching accounts loads a separate partition. Anonymous local data needs explicit import/adoption confirmation.

Finished session rewards are immutable. Edits use expected versions; stale edits require review instead of silent last-writer-wins. Tombstones win over stale activity edits. Character preferences can use server-version conflict checks and explicit user choice. Multiple devices may race to complete, but per-owner locks and unique receipts prevent duplicates. Reject a second active session in cloud mode, and explain conflicts from offline devices. Restart reloads pending work; server response loss is resolved by idempotent replay. Reconciliation displays any difference between provisional and confirmed XP without erasing confirmed levels. This optional feature requires its own approval and tests.

## Implemented first-flow storage

The current native milestone uses a versioned JSON ledger in one SQLite row with exclusive transactions, instead of the normalized proposal above. The production-normalization proposal remains future work. See [FIRST_FLOW.md](FIRST_FLOW.md) for the exact boundary and verification. The active scene uses native PNG sprite playback; Rive remains an independent compatibility proof.

## Proposed running-distance revision (awaiting approval)

[RUNNING_DISTANCE.md](RUNNING_DISTANCE.md) specifies a pure TypeScript engine independent of Expo, UI, storage and Rive, with distinct acquisition, validation, segmentation, accumulation, persistence and statistics responsibilities. It replaces the proposed distance policy only after review; current code remains unchanged. Total route length and displacement are distinct; laps reuse coordinates normally. Haversine is recommended with versioned processing and independent geodesic reference tests. Quality gaps and rejected spikes break continuity; no rejected point becomes the next accepted reference. Atomic checkpoints retain fractional totals and segment generations. Routes remain transient/local under the existing policy; route retention, manual laps and cloud sync are separate decisions. Timestamp-based elapsed and heuristic moving time remain separate from distance, pace and capped progression.

Approved running engine is now implemented in src/domain/runningDistance.ts; adapter/persistence/statistics integration is complete. Coordinates are limited to RAM diagnostics and a transient accepted-window checkpoint; summaries/backups contain totals and quality counters. See RUNNING_DISTANCE.md implementation record.
