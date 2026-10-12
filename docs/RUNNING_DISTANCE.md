# Running distance: proposed design

Status: **approved and implemented; physical-device validation pending**. Written and official platform documentation checked on 2026-10-10. Applies to the combined Walking / Running activity in Expo + React Native + TypeScript. This document proposes replacing the distance-processing policy, not changing progression or claiming the existing iPhone GPS issue is resolved.

## 1. Boundary and assumptions

Measure horizontal accumulated route length, in metres. WGS 84 latitude/longitude, timestamps in UTC epoch milliseconds, and imperfect phone location estimates are inputs. Elevation, terrain slope, map matching, automatic lap recognition, and Strava's proprietary processing are outside this design. A phone cannot recover an unobserved path uniquely from its endpoints. An accurate geodesic calculation does not establish accurate GPS tracking.

Previous implementation (replaced): `src/domain/gpsDistance.ts` used a spherical distance, an accuracy-dependent deadband of at least 8 m, a 30 s gap limit, and a rejected-jump anchor reset. That deadband can remove slow motion or cut turns; resetting the reference to a rejected spike can damage subsequent comparisons. The proposed engine must address both. Existing foreground Expo Go acquisition and native background acquisition remain separate adapters. The reported iPhone timer/GPS issue still needs a physical-device retest.

## 2. Route distance versus displacement

For ordered accepted positions P0,...,Pk in one continuous segment:

```
D_segment = Σ(i=1..k) geodesic(P[i-1], P[i])
D_total   = Σ(all continuous segments) D_segment
displacement = geodesic(first accepted session point, last accepted point)
```

The first point of a new segment establishes a reference and adds zero distance. Never deduplicate by latitude/longitude, coordinate hash, visited cell, or closeness to the start. Identical coordinates at a later timestamp can legitimately add zero for that particular edge; other edges in that lap still count. Only timestamp/sample identity removes replays. D_total never decreases or resets when the runner returns to the start. Displacement may be zero even when D_total is large. Endpoint coordinates for displacement are transient; storing displacement requires only its numeric value.

### Haversine proposal

Let φ = latitude × π/180 and λ = longitude × π/180. Normalize Δλ into [-π,π] to make the short antimeridian crossing explicit.

```
h = sin²((φ2-φ1)/2) + cos(φ1) cos(φ2) sin²(Δλ/2)
h = clamp(h, 0, 1)
c = 2 atan2(sqrt(h), sqrt(max(0, 1-h)))
d = R × c
```

Proposed R = **6,371,008.771415059 m**, the arithmetic mean ellipsoid radius (2a+b)/3, with a = 6,378,137 m, f = 1/298.257223563, b = a(1-f). These defining WGS 84 parameters are documented by [NGA](https://earth-info.nga.mil/index.php?action=wgs84&dir=wgs84). The radius is a documented modelling choice, not an assertion that Earth is spherical. Validate finite inputs before trigonometry; validate finite/nonnegative output afterward. Keep double precision totals, optionally compensated summation, and round only for display or persisted integer metres. Persist fractional carry in a versioned checkpoint to avoid repeatedly truncating each segment.

Haversine is a small constant-time calculation with no geodesic package; it approximates an ellipsoid with a sphere. The modelling error depends on latitude and direction and can be several tenths of a percent. Proposed budget: under 0.6% relative disagreement with independently computed WGS 84 geodesics in the running-distance test domain. This is a modelling test target, not GPS accuracy. A Karney-style ellipsoidal inverse calculation accounts for flattening and handles difficult near-antipodal cases, at the cost of a dependency and more arithmetic. See [GeographicLib's algorithm references](https://geographiclib.sourceforge.io/html/js/). Benchmark package size and on-device cost before selecting it. At phone sampling rates either may be inexpensive; GPS acquisition generally dominates energy use, but measure this. An ellipsoid does not fix noisy samples, missed curves, or gaps. Recommend Haversine initially, with an injectable geodesic function and an independent ellipsoidal reference in tests.

### Curves, circles, and laps

For a planar circle of radius r, one lap has circumference 2πr and n laps have n×2πr. With m equally spaced edges including the closing edge:

```
D_sampled = 2mr sin(π/m)
relative chord undercount = 1 - m sin(π/m)/π
                         ≈ π²/(6m²) for large m
```

For r=50 m, circumference is approximately 314.159265 m:

| Edges per lap m | Sampled polygon length (m) | Undercount |
|---|---:|---:|
| 8 | 306.146746 | 2.550464% |
| 16 | 312.144515 | 0.641315% |
| 32 | 313.654849 | 0.160561% |
| 64 | 314.033116 | 0.040155% |

This is a local planar model. On a sphere a geodesic-radius circle has circumference 2πR sin(r/R); spherical tests should use that model or quantify the negligible small-circle approximation explicitly. No smoothing or sparsification should erase the ordered closing edge or repeated laps. Faster sampling reduces chord undercount but can amplify accumulated noise. With measured positions x_i + ε_i, distance sums norms of (x_i-x_(i-1))+(ε_i-ε_(i-1)); even stationary positions can produce positive segment lengths. Accuracy radii are uncertainty metadata, not a deterministic error bound or an independent Gaussian variance. Do not subtract an accuracy radius from every edge.

## 3. Samples and pure engine contract

Proposed input records contain session ID, unique acquisition sequence, latitude, longitude, timestampMs, receivedAtMs, horizontalAccuracyM nullable, speedMps nullable, speedAccuracyMps nullable if the provider supplies it, headingDeg nullable, altitudeM nullable, mocked nullable, provider/error classification, and acquisition mode. Unsupported metadata is null rather than fabricated. Horizontal distance ignores altitude. Negative provider sentinel accuracy/speed becomes unknown; malformed coordinates are invalid. Heading and reported speed are supporting evidence, not distance truth.

The pure engine accepts a state, a sample or lifecycle event, and a configuration, and returns new state plus decisions. It imports no Expo, React, database, UI, clock, network, or Rive module. `receivedAtMs` and lifecycle timestamps are provided by adapters. Results include acceptance/rejection reason, segment ID, movement classification, committed distance, provisional distance, numeric displacement, qualified time, and quality counters. Engine state contains timestamp watermark, last accepted reference, reacquisition candidates, a bounded motion window, segment counters and fractional totals. Provider errors are explicit events. Statistics and UI must not fabricate running state from a stale callback.

Raw samples are immutable acquisition records. Processed samples refer to raw sequence IDs and carry validation/classification decisions; changing a threshold never mutates raw samples. Within the transient window, expose raw eligible polyline length alongside processed length for diagnostics. Neither is labelled ground truth. A stored summary includes processingVersion and config identifier so future algorithms do not silently rewrite old rewards.

## 4. Explicit processing policy

These defaults are **proposed heuristics requiring device validation**. All thresholds are configurable and carry units. They do not prove exercise occurred or guarantee route accuracy.

| Setting | Proposed default | Rationale / tradeoff |
|---|---|---|
| Acquisition request | High accuracy, 1 s Android time interval, 1 m distance interval | Better turn sampling than current 5 s/5 m; requests are not delivery guarantees and timeInterval is Android-only |
| Maximum horizontal accuracy | 25 m | Reject visibly weak fixes; may lose movement under trees/buildings |
| Future timestamp tolerance | 2 s | Small scheduling/clock skew; larger skew needs review |
| Live stale sample age | 15 s | Avoid counting cached positions as fresh movement |
| Native background batch age | 5 min | Process ordered delayed fixes individually; does not authorize bridging an internal gap |
| Maximum continuous sample gap | 10 s | Prefer explicit missing-distance gaps over straight lines across unknown turns; increases undercount if delivery is sparse |
| Maximum plausible speed | 12 m/s | Allows short fast running; does not identify transport or establish athletic truth |
| Additional hard edge ceiling | 120 m | Matches 12 m/s × 10 s; prevents overflow/jump abuse, never used to infer missing distance |
| Motion window | Up to 30 s / 96 valid samples; stationary evidence over 10 s | Retains slow-motion evidence before committing or excluding edges |
| Stationary-speed evidence | ≤0.1 m/s | Candidate stopped state; requires spatial evidence too |
| Moving-speed evidence | ≥0.35 m/s | Supports slow walking; an ambiguous band avoids rapid toggling |
| Stationary window diameter | ≤3 m | Suppress compact drift; slow short motion can still be ambiguous |
| Reacquisition | 2 quality fixes with a plausible edge within 10 s | Avoid accepting an isolated bad point as the next reference |

### Validation and ordering

1. Require finite latitude in [-90,90], longitude in [-180,180], and finite safe integer timestamps; reject impossible coordinates. Normalize a valid +180/-180 representation consistently. Invalid metadata never reaches trig functions.
2. Reject negative/nonfinite accuracy as malformed/unknown; null accuracy goes to an **unqualified** stream and adds no rewarded GPS distance by default. A future permissive mode must identify its lower confidence explicitly. Poor accuracy above 25 m similarly adds no distance. Require a new continuous segment after quality loss; retain the previous reference only for diagnostics.
3. Acquisition adapter sorts a bounded received batch by timestamp before processing. The engine rejects duplicate or older timestamps within the active session, and stale callbacks from other sessions/segments. Exact replay is idempotent; two positions with the same timestamp cannot both establish a chronological edge. Record the ordering watermark separately from the accepted reference, so a rejected sample does not become a geometric reference. Invalid timestamps do not advance the watermark. Future-invalid timestamps also cannot poison it. A delayed sample preceding a persisted pause/resume boundary is ignored.
4. Reject mocked samples for reward-qualified distance, while retaining a reason in transient diagnostics. Synthetic tests call the pure engine with explicit test metadata; do not bypass mock rejection in the live adapter.

### Reference, jumps, and segmentation

Compute candidate speed d/Δt only when Δt>0. A speed/jump rejection does **not** set the reference to the rejected coordinate. Mark a route break, retain the last good point for diagnostics only, clear the active geometric reference, and enter reacquisition. Invalid coordinates, unknown/poor accuracy, stale fixes, provider loss, a gap >10 s, pause, resume, and process restart also break continuity. The first quality candidate becomes a tentative reference, not an accepted distance edge. The second quality candidate must pass the speed/gap test relative to the tentative candidate. A speed/jump-invalid sample advances only the valid chronological watermark, never either geometric reference. On success, both establish a new segment and their within-segment edge may count through the motion classifier. The edge from the old segment to either candidate never counts. On failure, clear the tentative candidate and wait again; do not promote the failed point. This deliberately loses some real distance around a spike rather than inventing a connecting path.

Session totals survive every segment break. Track count and duration of gaps, with an explicit incomplete-distance quality indicator. One bad position followed by valid fixes cannot create two inflated edges. A same-coordinate return on another lap is still a normal chronological sample; segmentation depends on quality/time/lifecycle, not location reuse.

### Stationary drift, slow motion, and turns

Remove the current per-edge 8 m / accuracy-radius deadband. A legitimate 0.3 m or 1 m edge can contribute even when reported accuracy is 5 m. Keep all eligible chronological edges in a bounded 30 s provisional motion window, preserving their order and individual lengths rather than replacing them with the window's endpoint chord.

Proposed motion policy: classify a full 10 s window as stationary only when all available trustworthy speed evidence is ≤0.1 m/s **and** its spatial diameter is ≤3 m. An unknown speed alone does not satisfy trustworthy speed evidence. If no trustworthy speed is supplied, compact windows remain uncertain rather than automatically stationary. Moving evidence is at least two consecutive valid speed readings ≥0.35 m/s, or position-window diameter >3 m. A stationary decision consumes only the evaluated 10 s prefix, while uncertain windows retain up to 30 s; moving evidence takes priority over stationary classification when present. Speed is trustworthy for this heuristic only when finite/nonnegative and, if speed-accuracy metadata exists, its reported uncertainty is ≤0.2 m/s; absent speed uncertainty is an explicit lower-confidence assumption to evaluate on iOS. Position-only moving evidence can misclassify large stationary drift; expose that limitation.

Confirmed movement commits every eligible window edge exactly once, including short edges and curves; stationary windows discard their provisional distance. Uncertain windows are held up to 30 s, then excluded from confirmed distance with an uncertain-time counter. Slide the window by retaining one boundary reference and consuming each edge once. On Finish, commit a partial window only if it has moving evidence; the implemented boundary rule also accepts a remaining window after earlier confirmed movement when every remaining trustworthy speed is above the stopped band (0.1 m/s). This preserves slow walking without integrating speed into distance. Otherwise exclude it and label the uncertain remainder. There is up to 30 s distance-display lag; display provisional metres separately if useful, and award XP only from committed distance. Resume never commits a window crossing a pause.

A runner circling within a 3 m diameter and missing speed metadata may be indistinguishable from GPS drift; a very slow walker can lose the first uncertain metres. These are documented limitations, not secretly “corrected” values. Do not add a straightness/bearing-consistency requirement: it would reject circles or zigzags. Wide noisy stationary windows may inflate distance despite validation. Device trials must determine whether this proposed classifier is acceptable before release. Prefer an honest uncertain/incomplete statistic to claiming perfect stationary and slow-motion separation.

### Smoothing

Recommend **no coordinate smoothing in the initial implementation**. Temporal averaging can round corners, cut tight loops, delay starts/stops and cause distance undercount; aggressive noise chasing can inflate it. If later evaluated, introduce a versioned optional smoother with identical segmentation boundaries and compare raw qualified, unsmoothed processed and smoothed totals using the transient raw window or an explicitly approved local debug capture. No silent smoothing, no automatic cloud upload, and no retroactive XP recalculation.

## 5. Duration, moving time, pace, lifecycle

Keep four measures distinct:

```
wall elapsed = finish timestamp - start timestamp
active elapsed = sum of running timer intervals, excluding explicit/automatic pauses
moving time = sum of quality-qualified intervals classified moving (heuristic)
elapsed pace seconds/km = activeElapsedSeconds / (distanceM / 1000)
moving pace seconds/km = movingSeconds / (distanceM / 1000)
```

Calculate duration from timestamps, not callback count or assuming each callback is exactly one second. Monotonic time may support an in-process UI timer; persisted UTC timestamps and accumulated intervals allow restart review. A clock rollback, unusually large forward change, or unknown terminated interval requires review; never manufacture GPS movement time. Moving time excludes rejected/gap/uncertain intervals and can be less than active time. Provider speed is not integrated into distance to fill missing fixes. Pace is null when distance≤0 or the relevant duration≤0, and displayed as “—”; optionally withhold pace below 100 m as unstable. Label pace denominator explicitly. Current quests and XP remain governed by existing saved active-time and distance rules respectively, not by this new moving-time heuristic.

| Event | Expo Go foreground mode | Native background mode / shared persistence |
|---|---|---|
| Background / lock | Stop subscription, fence late callbacks, timestamp pause, clear transient coordinate window; explicit Resume | Continue only with granted background permission and an active OS task; record timestamped samples, allow ordinary batching |
| Permission dialog | Do not create a running session until access returns and app is foreground | Ask background access only for background capability; denial leaves progress intact |
| Process termination / force quit | No promise of continued collection | No uninterrupted-tracking promise; OS can stop task or kill app. On restart show recovered state and create a new segment |
| Permission revocation | Stop, save known totals, pause and show permission error | Same; OS may stop delivery first, so detect lack of signal and check permission on return/retry |
| Provider interruption / gap | Stop distance continuity, show loss and preserved totals; timer may continue while visible | Same distance policy; do not infer missing route. Display active time and GPS-qualified time separately |
| Recovery | Persisted totals retained; unknown active time reviewed; new watcher after explicit Resume | Task-registration state alone does not prove uninterrupted recording. Inspect last checkpoint/time and gap; new process starts a new distance segment even if OS task survives |
| Offline | Local GPS and local SQLite can work without network; first-fix timing may vary | No route service required. Expo Go development bundle still needs the running development server to initially load/reload |

SQLite transactions must atomically write engine checkpoint plus session totals and bind both to session/segment generation. Pause/finish first fences acquisition, drains or discards queued writes according to sample timestamp and the boundary, then commits stopped state and clears coordinate checkpoint in one transaction. Crash recovery accepts only the last committed pair. Finish is idempotent and applies XP once. Prevent stale UI reads from overwriting a newer command. Add provider error callbacks and actionable permission/status UI; avoid swallowed errors that look like a running timer.

Verified against [Expo SDK 57 Location](https://docs.expo.dev/versions/v57.0.0/sdk/location/): foreground `watchPositionAsync` does not supply background tracking; iOS background location requires a development build rather than Expo Go, suitable permissions and background mode. Android uses its location foreground service and applicable permissions. Vendor behavior when removing recent apps varies. Top-level task registration and availability restrictions are documented in [Expo SDK 57 TaskManager](https://docs.expo.dev/versions/v57.0.0/sdk/task-manager/). These restrictions remain even with a better mathematical engine.

## 6. Responsibilities and persistence

| Layer | Responsibility |
|---|---|
| Acquisition adapters | Expo permissions, provider callbacks/errors, timestamps, runtime capability and lifecycle; normalize optional metadata |
| Validation | Pure structural/quality checks and reason codes, chronological/replay rules |
| Segmentation | Pure reference/reacquisition and pause/gap transitions |
| Accumulation | Pure geodesic function, motion window, edge-once accounting and fractional totals |
| Session store | Atomic ledger/checkpoint writes, schema migration, recovery, privacy deletion, versioned summaries |
| Statistics/UI | Label GPS versus lap estimate, total versus displacement, elapsed versus moving pace, incomplete quality, and permissions |
| Progression | Existing award function on committed distance, once on Save, with daily/category caps; independent of route engine and character rendering |

Recommended saved summary: source='gps', distanceM (canonical integer), activeMs, qualifiedMovingMs, gpsQualifiedMs, gapCount, uncertainMs, processingVersion, configId, and optional numeric displacementM. Keep the existing GPS summary compatible via an explicit migration; old sessions retain their saved XP. New diagnostics do not require storing coordinates. Route capture, lap statistics and cloud upload are separate schema/consent decisions. Backup export defaults to totals and quality counters only; reject raw-route fields in ordinary backup canonicalization. Never silently change previously awarded distance or XP during import/reprocessing.

Current progression stays: 20 activity XP at 1 km, 30 at 3 km, below 1 km zero, first two rewarded Walking / Running sessions per Manila day, global 120 activity XP/day. Existing quest receipts are separate. Distance does not grant XP continuously or without Save. Extra laps cannot exceed these caps. Old time-based Running receipts remain valid.

## 7. Optional known-track mode

Offer a separate source='manual_laps' only if approved:

```
D_estimate = completedLaps × configuredLapLengthM
```

Require finite lap length >0, proposed range 10–10,000 m, integer completed laps 0–10,000 and bounded total ≤5,000,000 m. Explain that lane, track layout and chosen start/end line affect length; never assume 400 m. Display “Lap-based estimate”, configured length and completed laps. Corrections before Save are allowed; make count changes explicit. Do not add partial-lap GPS distance or GPS totals to manual totals. Keep separate source records and summaries. Default recommendation: postpone this mode; approval must decide whether it can earn distance XP under the same caps or is history-only. It is a self-report, not verification.

## 8. Privacy, retention and future cloud security

Existing approved policy: **local totals, no saved route history or cloud**. Preserve it. A pure engine can compare raw and processed samples without persisting a full route. Propose a raw ring buffer of at most 120 s or 256 samples, whichever limit is reached first; the 30 s motion window is separate processed state. This permits bounded live comparison, not post-run full-route replay. Delete coordinate buffers on pause, finish, permission loss, or session interruption. Persist only the minimal coordinate checkpoint necessary for current crash-consistent tracking; on recovery use it for diagnostics, never bridge across process termination. Clear it when recovery interrupts or completes. Coordinates have no routine console/analytics/crash-log output.

Optional full-route comparison requires a separate explicit opt-in local diagnostic capture: proposed maximum 4 h / 20,000 samples / 5 MB, deletion at finish by default or at most 24 h if user explicitly selects retained diagnostics. No capture enabled by approval of the totals-only engine. Explain route sensitivity, OS backups, lack of guaranteed database encryption, and that deleting current local records does not erase exported files or prior device backups. Export routes only through a separate explicit action. Wipe in-memory/checkpoint coordinates on session boundaries; enforce the retention sweep at launch/finish rather than trusting a timer to run while killed.

Cloud routes are deferred. If approved later: authenticate each request, derive owner from the token, default-deny RLS for other users, and keep receipts/XP non-writable by clients. Enforce validated ownership on route metadata, sample batches and storage objects. Test anonymous and cross-user direct API access, not only UI paths. TLS; secrets stay server-side. The server validates finite coordinates, order, source, timestamps, sample/byte/session ceilings and configuration version, then independently computes bounded rewards; client routes are never tamper-proof evidence.

Proposed cloud envelope limits: ≤1,000 samples and ≤256 KiB decompressed JSON per chunk; ≤20,000 samples / 5 MB / 4 h per route; at most 1 Hz stored input. Enforce both bytes and counts before expensive processing and disallow compressed request bodies initially. Enforce a durable atomic per-user limit of 10 upload chunks/min and 100/day, one processing job/user, 3 export requests/hour, and idempotent session+chunk IDs with content digest conflict checks. These are proposed application budgets, not provider defaults. Deny direct table/storage mutations that bypass admission; authenticated reads use bounded authorized pages. Gateway IP protections supplement user limits. Return 429/Retry-After; client retries network/5xx at most three times with jittered delays around 2,4,8 s, honors server cooldown within a bounded retry horizon and otherwise waits for explicit retry. No retries for validation/ownership errors, no endless offline upload loop. Account deletion and route deletion cover metadata, points, objects and queued jobs; disclose provider backup retention once a service is chosen.

## 9. Tests and acceptance criteria

**40 application tests now pass, including 15 new running-engine tests.** Synthetic mathematics and heuristic coverage is implemented; this does not establish outdoor accuracy. Use independent route generators/closed-form references, seeded noise, and two test suites: mathematical accumulation with quality/motion filtering bypassed in the test harness, and production heuristic processing. A test harness bypass must not be selectable in production acquisition.

```
absolute_error = abs(estimated - expected)
relative_error = absolute_error / expected   // only expected > 0
```

Noise-free fixtures on a sphere should be generated with spherical direct geodesics, not by inverting the engine's own implementation. Ellipsoidal comparison uses an independent reference. Analytic sums measure sampled route correctness; true circumference comparisons separately measure discretization. Proposed numerical tolerance is max(0.01 m, expected×1e-8) for spherical short-route sums. Do not apply that tolerance to sphere-versus-ellipsoid comparison or noisy outdoor routes.

| Fixture | Mathematical expectation / proposed heuristic acceptance |
|---|---|
| Stationary exact, 10 min | 0 m; numerical absolute error ≤0.001 m. Confirmed and moving totals both zero |
| Stationary noise | Seeded bounded ±0.5 m jitter with trustworthy zero-speed metadata, 10 min: confirmed distance ≤3 m absolute, moving time zero after initial window; raw polyline may be large. Also run Gaussian 3 m and correlated 10 m drift/missing-speed cases, reporting distributions and failures rather than declaring them motion-free by construction |
| Straight 1 km | Noise-free spherical sample sum equals 1,000 m within numerical tolerance. Production at 1 m/s with qualified speed evidence: within 1% excluding deliberately uncertain boundary windows |
| Circles m=8,16,32,64 | Match sampled polygon model within numeric/geometric fixture tolerance; report chord deficits against true circumference. Dense m≥32 target <0.2% discretization error for r=50 m, independently of heuristics |
| Three laps ending at start | Total triple sampled length, displacement near zero, no coordinate deduplication; qualified-speed production target within 1% of sampled reference |
| Slow 0.2 m/s walk and 3 m/s run | Math passes with sub-accuracy edges. For slow fixture lasting 120 s with accurate speed metadata (0.2 is below moving-speed threshold), position-window evidence should preserve at least 90% of expected 24 m; otherwise revise classifier before approval for release. Run missing/poor speed variants and publish uncertain losses |
| Tight square / zigzag / U-turn | Sum actual sampled edges, never window endpoint shortcut; choose ≥3 m extent or qualified speed evidence for production pass. Test a <3 m loop without speed as documented ambiguous case, not forced accuracy claim |
| Spike then valid fixes | No distance edge to/from spike or back to the old segment; new segment begins after two good candidates. Expected total is sum only within explicitly accepted segments; entire-route undercount reported separately |
| Gap >10 s / lost provider | Zero distance across gap, preserve earlier total, reacquire new segment. Duplicate coordinate after gap cannot restore missing path |
| Pause / resume | Zero paused distance/time; no bridging. Queue/race tests for callbacks before/after boundary, startup permission/background, atomic write failure and restart; no duplicated edge or XP |
| Duplicate / out-of-order | Replayed delivery leaves totals unchanged; equal-timestamp conflict and older fixes rejected, rejected future timestamps do not block later valid ones |
| Longitude ±180° | 179.999° to -179.999° at equator ≈222.39016 m with proposed radius in math suite, not Earth's circumference. Runtime same edge at 1 s intentionally fails speed/gap policy; use closely spaced crossings for production acceptance |

Test missing/null/negative accuracy, future/stale timestamps, mocked samples, null/negative speed, fractional accumulation across checkpoints, capacity eviction, policy-version migration, source separation and finish idempotency. Strengthen geometric continuity checks with many seeded route shapes. Every result records seed, configuration, retained segments, raw eligible total and confirmed total; do not tune only to one example.

Physical-device gate before practical accuracy claims: at least five measured ≥1 km routes per supported device/mode with straight paths and curves, repeated measured laps, slow walking, 10 min stationary trials, deliberate pause, lock/switch tests and weak-signal areas. Use a measured track/path or independent surveyed length; another phone app is a comparison, not ground truth. Proposed open-sky goal: ≤5% absolute relative error per completed high-quality trial, stationary drift ≤10 m over 10 min. Report signed bias, individual errors, gap time and excluded duration; blocked/poor-signal sessions remain visibly incomplete. Failures block an accuracy claim and drive a policy review, not hidden exclusions. iPhone Expo Go tests keep the screen on; native lock tests are a separate gate. Record battery percentage and runtime/device/settings over ≥30 min, alongside accuracy; percentages alone are coarse energy evidence.

## 10. Battery tradeoffs and review decisions

Recommend a configurable 1 s / 1 m high-quality profile for testing turns. It increases GPS activity, callbacks and writes versus 5 s / 5 m. Retain a future economical 5 s / 5 m profile labelled lower curve fidelity. Native batching can reduce wakeups without discarding stored intermediate samples, but chronological per-sample gap checks still apply. Persist bounded batches at most every 5 s or on pause/finish, preserving crash-consistent distance/checkpoint pairs; accept and document up to that much unsaved recent progress after a crash. Do not request background capability in Expo Go or silently keep the screen awake; an optional explicit keep-awake toggle needs separate implementation approval. Accuracy.High is a request, not a guaranteed 10 m bound. Background OS scheduling overrides preferences.

Open decisions for review:

1. Approve Haversine as default with the stated spherical modelling budget, or request ellipsoidal production calculations?
2. Approve totals-only transient raw comparison (recommended), or separately approve opt-in full-route diagnostics/retention?
3. Approve evaluating the motion-window defaults rather than presenting them as established accuracy; accept explicit uncertain-distance undercount? Tight-loop/very-slow cases may require changes after tests.
4. Include manual lap mode now or defer (recommended); if included, decide whether lap estimates earn existing capped XP.
5. Approve 1 s/1 m testing profile, 10 s gap boundary, real-device gates and the battery comparison; economical profile remains optional.

## 11. Implementation milestones after approval

| Milestone | Deliverable / gate |
|---|---|
| 1 Pure mathematics | Independent Haversine/reference injection; numerical, circle/lap and antimeridian tests pass |
| 2 Processing | Versioned validation, segmentation, motion window and reason counters; slow-motion/spike/gap/seeded-noise tests pass or defaults return for review |
| 3 Persistence | Atomic fractional checkpoint + summary migration, retention enforcement, replay/crash/pause/finish race tests; existing receipts unchanged |
| 4 Acquisition and statistics | Metadata/error adapters for Expo Go/native, timestamp timers, labelled elapsed/moving/quality/pace; permission and lifecycle checks, separate source UI only if approved |
| 5 Physical evaluation | iPhone foreground and supported native mode measured routes, stationary tests and battery trials; publish deviations and limitations before any accuracy claim |

The user approved the recommended design after review. The engine, native persistence/adapters, statistics and synthetic tests are implemented; manual laps, full-route retention and cloud remain deferred. Physical-device and battery gates remain open.




## Implementation and verification record

Implemented in src/domain/runningDistance.ts, src/data/sessionStore.native.ts, src/platform/location/background.native.ts and src/features/sessions/DistanceStats.tsx. Old deadband module and its obsolete tests were removed. Haversine longitude normalization avoids cancellation from adding large constants to small longitude differences. Summary conversion rounds at micrometre scale before integer metres/fractional carry, preventing floating-point threshold underflow; route checkpoints retain double totals. Distance remains capped at 5,000,000 m and existing XP rules are unchanged.

The engine checkpoint includes only a bounded accepted motion window (≤30 s / 96 samples), segment references and transient endpoints. It is overwritten atomically with totals, cleared at pause/finish/interruption, and cleared on process-identity change during initialization. A separate raw window is RAM-only (≤120 s / 256 samples), with immutable reads and boundary clearing. No full route or raw coordinates enter backup/history. Writes currently happen per callback/batch, not the proposed 5-second batching optimization; battery measurements must precede that optimization.

Because paused/recovered coordinates are cleared, full-session start-to-finish displacement is unavailable after resume/recovery and the UI explicitly says so. Uninterrupted sessions can save numeric displacement only. New process identity never reuses the prior geometric reference, even if the OS task remains registered. Old distance-only summaries migrate on the first new fix without rewriting old XP receipts.

Verified: TypeScript; 40 tests, including independent spherical circle/chord fixtures and WGS84 equatorial/meridional modelling comparisons; raw-window bounds; replay/gaps/spikes/slow movement/antimeridian; checkpoint JSON determinism, canonical backup validation, existing caps and feedback/session behavior; iOS Metro compilation; web export. Native SQLite transaction execution under actual GPS, permission changes, physical iPhone lifecycle, measured route accuracy and battery tests remain pending. No practical accuracy guarantee or Strava equivalence is claimed.

### iPhone timestamp compatibility correction (2026-10-10)
Expo iOS supplies fractional millisecond timestamps. The acquisition adapter now rounds finite nonnegative timestamps before passing them to the integer-millisecond engine; invalid times remain rejected. Weak-fix messages now report the rejection reason and accuracy in metres without coordinates. Regression coverage uses realistic fractional epoch timestamps. TypeScript and all 41 tests pass. Physical iPhone retest remains required; this does not establish measured-route accuracy.

