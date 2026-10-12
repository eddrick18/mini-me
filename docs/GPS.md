# Walking / Running GPS

Implemented October 10, 2026. Walking and running share the internal Running category, daily reward quota, running outfit and park scene.

New sessions earn 0 XP below 1 km, 20 XP from 1 km, and 30 XP from 3 km. Rewards commit only on Save, within the existing two rewarded sessions per category and 120 activity XP per Manila day. Editing reviewed minutes does not create distance. Older Running records retain their time-based XP.

The native app requests foreground and background location only when Start or Resume is tapped. Android uses a visible foreground-service notification. The task is defined at module scope and uses expo-location and expo-task-manager. Screen locking and switching apps are supported; force-quitting, revoked permissions, device power management and lost GPS may stop updates. Expo Go and Safari previews cannot test this background feature; Expo Go can now use the foreground mode below. iOS needs a separately provisioned native development build.

Pause and Finish persist a stopped session before stopping the service. Late callbacks cannot add distance to a paused or finished ledger. SQLite commits distance and the latest checkpoint together. Reopening preserves a running GPS session when the native task is registered; otherwise it requires time review. Live totals refresh every three seconds while the app is visible.

Saved sessions and version 4 backups contain only integer distance totals. No route history is stored or exported. One temporary coordinate checkpoint is overwritten during tracking and deleted on pause, finish or interruption. Data stays local. Versions 1–3 backups remain readable with the previous XP rule identifier.

The distance filter rejects mocked positions, accuracy worse than 25 m, stale samples, jumps above 200 m and speeds above 8 m/s. It does not bridge gaps longer than 30 seconds. An accuracy-aware deadband reduces stationary jitter; this may undercount short movements. This is not a fraud-proof tracker.

Verified: TypeScript, 26 domain/storage tests, web export, browser unsupported-state UI, Android native build/install/startup. Pending: real-device distance accuracy, OS permission denial/retry, screen-locked tracking, GPS pause/resume and saved totals through native SQLite. Do not infer outdoor tracking reliability from emulator startup or unit tests.

Device check: Start Walking / Running, allow precise and background location, go outdoors, lock the phone briefly, reopen and inspect increasing distance. Pause and check that distance stops; Resume should continue without bridging the paused movement. Finish and Save, then reopen history and check the total. Under 1 km earns no activity XP.

Platform reference: [Expo SDK 57 Location](https://docs.expo.dev/versions/v57.0.0/sdk/location/).

## Expo Go foreground mode
Expo Go now uses watchPositionAsync and requests foreground location only. App backgrounding removes the watcher, fences queued callbacks, drains an in-flight write, and pauses the stored session at the background event time. Resume is explicit and starts a fresh checkpoint. Native development builds retain background tracking. The old Rive compatibility route uses still poses inside Expo Go; the production pixel scene is unchanged. Start with npm run start:go on port 8082, using the same Wi-Fi and exp://10.0.0.39:8082. The Safari port 4181 is a separate web preview. Expo Go storage is separate from the native Mini Me and Safari installations; use backup export/import when transferring records. TypeScript, 27 tests, web export and iOS Metro bundle verified; physical iPhone startup and location/lifecycle still require user confirmation.


Expo Go startup fix: permission-related background events only auto-pause when this tracker owns an active or starting watcher. Permission return waits for the app to become active before creating/resuming a session. Recovered GPS sessions offer Resume while retaining time-review requirements. TypeScript and 27 tests pass; user-reported device issue still awaiting confirmation after reload.

Proposed replacement policy: [RUNNING_DISTANCE.md](RUNNING_DISTANCE.md). Design only, awaiting approval; the implementation described above has not been replaced.

Running processing v2 replaces the earlier 8 m deadband and 30 s gap rule. Uses 1 s/1 m requested acquisition, 10 s gap segmentation, 30 s bounded motion evidence, timestamped moving/qualified/uncertain time, fractional carry and coordinate-free summaries. See RUNNING_DISTANCE.md for limitations and completed/pending verification.


2026-10-10 physical iPhone update: user confirmed Expo Go GPS/timer now work after fractional timestamp normalization. Finish screenshot: 0.07 km, active 2:11, moving 1:52, displacement 5 m, two breaks, uncertain 0:05. This confirms foreground acquisition and timing only; save/history and measured-route accuracy remain pending. Field-test protocol and results: [GPS_FIELD_TEST.md](GPS_FIELD_TEST.md).
