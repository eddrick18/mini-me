# Character-loading reliability

Scope: stability step 3 approved on 2026-10-11. Existing sprite art, scale, baseline, palette paths, scene height (238 dp), motion policy and speech geometry are preserved. UI polish and the broader regression program (steps 4–5) remain deferred.

## Ownership

RootLayout starts non-blocking image prefetch for the 36 packaged character frames. Platform adapters resolve native module assets or web asset URIs; assetWarmup deduplicates URI hints, caches successful hints, runs two logical jobs at a time, and releases stalled jobs after ten seconds. Failed hints can be tried again. Prefetch is an optimization, never evidence that rendered frames decoded successfully. Network requests already started by platform Image APIs cannot be aborted by this shared scheduler; image loading still has its own platform lifecycle.

SpriteFrames remains the complete-body rendering owner. All four frames stay mounted, and animation starts only after all four onLoad events. First-frame readiness is tracked separately for a static partial-load fallback. Clothing overlays are shown only on frames that loaded, avoiding floating clothing when an image is missing.

spriteLoading owns request generations, first-frame status, completed bank and terminal failure. Within a mounted SpriteScene, a new pose keeps the last complete bank visible and still until the new bank is ready; then it replaces the previous bank. At most two body banks and one wave bank are mounted during a transition. Across screens, prefetch warms the source assets, but native decoders and image caches still determine display latency.

## Failure and retry

Body and wave loads each have a 15-second deadline. Failure preserves a loaded previous pose, or a loaded first frame, rather than replacing it with a missing-character symbol. A text explanation and Retry character button appear below the unchanged scene. If no frame loaded, the explanation reports that accurately. Greeting failure preserves the regular companion and speech.

Retry increments the generation and remounts both body and wave banks. Previous callbacks cannot satisfy or fail the new request. Failed generations cannot recover from late success callbacks; an explicit retry is required. Wave readiness is keyed by generation, without an effect that resets cached onLoad results. Timers clean up on transition/unmount. Still/reduced/background motion gates remain unchanged; preload does not award XP or change saved records.

## Verification

sprite-loading.test.ts covers retained previous banks, stale callbacks, terminal failures, partial-load status, retry generation, deduplicated/concurrency-limited warmup, failed hint retry and a timed-out preload. Browser success paths cover activity sprites, greetings, running outfit preview, fixed phone scene geometry and existing reward poses. Real image-request failure is covered by the loading model tests, not a browser network-fault injection. Physical Expo Go cold-cache/retry behavior remains a device check.

Completed checks: TypeScript passed; 68/68 tests passed; production web export passed; strict companion UI audit returned no findings. DESIGN.md lint has no errors and five existing token schema warnings. Expo iOS bundle returned HTTP 200. Browser verified Home/greeting, Studying/Working/Gym/Music, zero-XP reward rendering, running-to-idle wardrobe transitions, and running preview at 390 × 844 without observed load failures. No browser errors were captured. Screenshot: artifacts/sprite-loading-running-preview.png. iPhone reload/activity/greeting confirmation is requested and pending; browser network-fault injection was not available.

2026-10-11 physical iPhone confirmation (user reported, Expo Go): after reload, Home/activity character appears and animates, and the Home greeting works without getting stuck loading. Normal-load device check passed. Forced load-failure/retry and cold-cache performance were not separately verified on-device. Steps 4–5 remain deferred.
