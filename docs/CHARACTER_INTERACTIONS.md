# Companion interactions

2026-10-11 outfit-specific frames: windbreaker Home idle now alternates open-eye and blink/inhale whole-body frames, replacing the temporary rotating-sprite sway. Tap greetings use two windbreaker wave poses and return to the same standing frame. Casual outfits retain their existing idle and full-body wave; both outfit families use the equipped palette. No independently animated limbs, scale changes or jogging poses on Home. The stage remains 238 dp and the bodies share a 189 dp height/foot baseline. Still poses, reduced motion and foreground eligibility keep responses text-only.

Wave decode readiness/failure and retry now include outfit in their generation key. A newly selected outfit cannot reuse readiness from the previous wave bank; stale callbacks are ignored. Body/wave assets remain mounted until decoded and share the existing retry/fallback behavior. The export script retains the new banks when regenerated.

Asset provenance: built-in imagegen edited running-idle.png into a transparent 2x2 sheet, with open-eye standing, blink/inhale, and two greeting poses; prompt required identical identity, clothing, head scale and planted feet, no background, labels or running. A follow-up removed exterior glow. Source: assets/character/taller-pixel/windbreaker-interactions.png. scripts/package-windbreaker.py extracts four whole-body PNGs with a common foot baseline without repainting source pixels and reads clothing overlay geometry. Final assets: individual/windbreaker-0.png through windbreaker-3.png and windbreaker-clothing-paths.json.

Verification: TypeScript, 68 existing tests, web export and iOS bundle (HTTP 200) passed. Browser 390x844 showed standing windbreaker, connected waving with speech, and text-only still-pose greeting; phone playback remains to be checked. Evidence: artifacts/windbreaker-greeting.png. Broad UI polish/regression steps remain deferred.

Implemented locally, 2026-10-10. User approved the relaxed-buddy voice and explicitly requested the bubble beside the character inside the scene.

## Personality and treatment

Short, warm, low-pressure English lines. No guilt, shame, streak demands, inferred emotions, surveillance claims or invented achievements. Example tap lines: “What are we getting into today?”, “One page at a time”, “Making progress, at your pace”, and “This is a good moment.” A committed exercise session may say “That deserves a stretch”; a verified session level increase may say “Look how far we’ve come!” No audio, TTS, AI, external service or notifications.

A cream pixel-framed bubble sits to the character’s right with a left-facing speech pointer. It uses existing text/primary/surface colors from src/design/tokens.ts. The character shifts within the scene while the bubble is visible; its activity pose and animation state remain unchanged. At standard text size the stage remains 238 dp; it grows when the bubble needs additional reading space. The bubble is not positioned over session actions or the bottom dock. Width follows scene width, capped at 180 dp. Close is a labeled 44 dp target. A separate wave/sparkle badge is optional.

## Priority and interruption policy

1. Important actions, errors, navigation, forms, finish review and settings: no companion interaction; any current bubble and scheduled idle timer are cancelled.
2. A successfully saved session or verified session level increase: replaces tap/idle messages. Event text cannot be replaced by taps while visible; the body celebration/sigh also blocks taps. Events only occur in the visible reward scene, not when an imported record or old reward is reopened.
3. Direct taps: immediate message when eligible, replace lower-priority/current tap messages after a local 800 ms cooldown. A press outline provides immediate visual feedback. This is local interaction throttling, not a backend security limit.
4. Spontaneous speech: quiet Home only, with no active session and no higher-priority message. No spontaneous speech during an activity, navigation, forms or dialogs.
5. Base activity: continues independently of temporary badge/text. Taps do not call session commands, award XP, reset timers or finish sessions.

No message queue. At most one bubble and one idle deadline. Context changes, scrolling the character out of view, blur, background and unmount cancel pending work and visible messages. Returning starts a fresh idle wait; it does not replay missed messages.

## Timing and eligibility

Default spontaneous timing is uniformly randomized 60–180 seconds. This is conservative: less frequent chatter preserves focus, but the companion may feel quieter. Engine Timing is configurable in code; there is no timing editor in v1. Separate tap cooldown: 800 ms; event cooldown: 3 s; idle minimum: 60 s since the last idle or meaningful interaction. Badge duration: 1.8 s. Text duration: max(7 s, 3.5 s + 450 ms per word), capped at 20 s for this short library. Messages remain until explicit dismissal while a screen reader is enabled.

Foreground + Home/session/reward focus + at least 119 dp of the scene visible + no busy/error state are necessary. Idle additionally requires its enabled setting, quiet Home, no active session, no celebration and no bubble. Eligibility is checked again when the timer fires. The scheduler has injected clock and randomness for deterministic tests. The feature has no background timers or catch-up behavior.

## Architecture and library

- features/character/interactions/messages.ts: stable localization-ready IDs, bundled text, contexts, trigger kinds and optional reaction; selection excludes four recent IDs when alternatives exist and otherwise selects the least recent eligible line. Unknown contexts have a bundled neutral fallback.
- interactions/engine.ts: pure eligibility, priorities, independent cooldowns, timing, replacement and cleanup.
- interactions/useCompanion.ts: React lifecycle and screen-reader adapter.
- interactions/SpeechBubble.tsx: accessible React Native text/dismissal.
- features/character/controller.ts: existing display controller extended with reaction values and capability fallback policy.
- platform/animation/CompanionReaction.*: native Rive badge plus Expo Go/web fallback.
- SpriteScene: shared production scene, hit target, bubble placement and optional reaction. It retains existing complete-body atlases; no detached limb manipulation.

## Actual Rive contract and limits

Inspected existing character/source/scene.rml and Rive CLI inspection: MiniMe / CharacterController / CharacterState.pose = idle 0, studying 1, celebration 2. There is no full-body wave property or animation. Production detailed pixel artwork is a PNG atlas, not that compatibility proof. Replacing the production character with the old proof would change the approved identity.

New locally authored asset: assets/character/companion-reactions.riv; source character/interactions/scene.rml. Artboard CompanionReactions, state machine ReactionController, view model ReactionState, numeric reaction = rest 0 / wave 1 / sparkle 2. Wave rotates a pixel hand badge; sparkle scales a pixel star badge. These are separate visual reactions, not full-body waving or facial expression artwork. Rive/native failures show a static matching badge. Expo Go/web use the static badge because Expo Go cannot execute the custom Rive module. Reduced motion/still preference or reactions disabled use text only. Missing full-body wave/facial assets remain explicitly open work.

Rive CLI verify/export passed with zero errors/warnings, 1,527-byte asset. CLI headless wave screenshot rendered. Native on-device execution of this new Rive badge remains unverified. No Rive account upload was performed.

## Settings and accessibility

Occasional companion messages and Companion reactions persist via the existing companion command in the canonical offline ledger and SQLite/localStorage stores. Legacy saves add defaults (both enabled) without altering sessions/XP. Backups preserve both fields through the existing version-4 canonical whitelist; invalid settings reject safely. Prefer still poses and OS reduced motion supersede reaction motion. Disabling spontaneous messages retains taps and committed-event text.

Companion hit target has button role, accessible label/hint and disabled state. Messages are readable multiline text, selectable, with no font-scale cap. Idle messages have no live-region announcement. Web direct/event messages use a polite live region; native relevant messages use queued accessibility announcements once per new bubble, not again when its badge expires. Physical VoiceOver/TalkBack and large native text-size checks remain pending. Layout grows for large text rather than clipping it to a short fixed bubble.

## Figma coordination

Retains local DESIGN.md palette, GameButton/settings patterns and the earlier Mini Me design direction. Existing file: https://www.figma.com/design/1rcTOHudvyrmdTRhuxo1xG. Metadata access was attempted and rejected by the Starter MCP tool-call limit. This revision is not synced to Figma; no paid service was introduced. Local preview and screenshot are the review artifact.

## Verification

49 tests passed, including eight deterministic interaction tests: tap throttle/replacement/non-repetition, idle timing, foreground/focus/visibility/block cancellation and no catch-up, settings/task gating, completion/level priority, screen-reader hold and disposal, missing Rive/reduced motion/fallback, and additive migration/backup/session/XP invariants. TypeScript, web export and iOS Metro HTTP 200 passed.

Existing isolated local preview at 127.0.0.1:4182 was used for synthetic checks; user records on 4180 and iPhone were not changed. Browser verified idle speech, direct tap, keyboard Enter, studying/paused contextual messages, advancing timer, one bubble under repeated taps, finish review clearing messages, saved-session event with taps disabled, zero extra XP from interactions, and settings retained after reload. Actual browser viewport remained 870×764 despite a requested mobile viewport override, so a 390 px viewport pass is not claimed. Physical iPhone positioning, large text, screen readers and native Rive rendering remain pending.

Scoped frontend static audit passed with zero findings for the new shared character/animation owners using artifacts/companion-audit-config.json. This is not a full-app or runtime accessibility audit. Rebuild badge assets with npm run character:verify.

Final checks: DESIGN.md lint completed with zero errors and five existing token-reference warnings; scoped static audit has zero findings. Wave and sparkle both rendered through the Rive CLI. Final web export and iOS Metro bundle (HTTP 200) passed. Review screenshot: artifacts/companion-speech-preview.png.



2026-10-11 user-directed speech refinement: compact stepped pixel balloon above the centered companion with a lower-left pixel tail. Header and close chrome removed; tap the balloon to dismiss (labeled accessible button). The scene grows to make room above the character instead of shifting the character sideways. Multiline/text scaling are retained. Idle greeting includes “Hi!” to match the reference. The deferred plan is saved in docs/PINNED_PLAN.md.

Pixel-balloon verification (2026-10-11): 49 tests and TypeScript pass; web export completed; iOS Metro returned HTTP 200. Local preview showed both multiline speech and the compact Hi! balloon; tapping the balloon dismissed it. Screenshot: artifacts/pixel-speech-balloon.png. Native phone layout and large-text testing remain pending.



2026-10-11 correction requested by user: scene frame stays exactly 238 dp high; character scale and centered position never change for speech. Balloon is an absolute overlay beside the head, with a fixed 112 dp height and viewport-based width independent of message length. Long/scaled text scrolls inside it. This supersedes the expanding-scene balloon treatment.

Fixed-layout verification: browser before/after tap measurements were identical: scene 500 × 238 px, companion hit target 220 × 210 px at the same coordinates. Different message text retained a 146 × 112 px balloon in that viewport. TypeScript and web export passed. Review screenshot: artifacts/fixed-companion-bubble.png.



Speech refinement: balloon now hugs its text within the available side space; short greetings have compact containers. Its pixel tail is drawn inside an extended positive-coordinate SVG viewport to prevent clipping, pointing left toward the character’s head. Scene remains 238 dp and character geometry remains unchanged. Long/scaled text can scroll at the height limit.

## Whole-body greeting revision — 2026-10-11
The production scene no longer displays the yellow hand/sparkle boxes. Casual idle greetings play a connected four-frame wave through an eight-step sequence, then restore the base idle pose. WaveSprite uses uniform rectangles anchored at the feet, 189 dp height, and the selected clothing palette. Activity-specific poses retain their existing equipment and cycles; a dedicated wave for those outfits is not yet drawn. Still-pose/reduced-motion/background/cancellation suppress or dispose this overlay; image failures retain the original body. Touch no longer draws a yellow outline. This supersedes the earlier production badge behavior; local Rive badge files remain compatibility assets.
Asset: assets/character/taller-pixel/wave.png, generated with the built-in image tool using the existing atlas as the reference. Prompt: four full-body aligned wave frames, same warm brown Filipino companion, dark wavy hair, navy NBA shirt, gray shorts and flip flops, transparent background, connected shoulder/arm, resting-to-raised palm-to-two wave positions, no decorative icons. Source pixels are unchanged; build-wave-frames.py reads alpha for foot-anchored rectangles and build-clothing-paths.py derives palette geometry.

Verification: 49 domain/interaction tests and TypeScript passed. Scoped premium UI audit has zero findings; DESIGN.md lint has zero errors with five existing schema token-reference warnings. Browser preview verified frame progression into smiling/waving, restoration to idle, no pressed border, unchanged 238 dp stage and 220 × 210 dp hit target, text-only still mode, and a 390 × 844 phone viewport. Expo Go iOS bundle returned HTTP 200; actual iPhone playback remains a user check. Screenshot: artifacts/companion-wave-preview.png.

Phone disappearance correction: removed the separate 1px preload and per-tap mounting. WaveSprite now stays mounted in a full-size non-collapsible native clipping view. Its actual Image onLoad controls readiness; the idle body remains visible until that renderer is ready, and image errors restore idle. Tap IDs restart the wave sequence without remounting its image. Phone confirmation is pending.

Character loading correction: removed the source effect that reset readiness after cached image callbacks. Readiness/failure now belongs to a source-and-attempt key, with stale callbacks ignored. Retry remounts that image with a new attempt. A 15-second timeout gives a readable connection error and Retry rather than indefinite loading. Expo server responded during diagnosis; phone symptom was Loading your companion.

Loading correction verification: TypeScript and web export passed; scoped character audit reported zero findings. Expo Go iOS bundle and atlas PNG returned HTTP 200 (atlas 1,462,716 bytes). Browser cached reload twice and tap-to-wave passed. Evidence: artifacts/character-loading-fix.png. The user must reload Expo Go to confirm this correction on iPhone.

Activity loading correction: fixed a literal image-key string so pose/retry changes now have real instance keys. Production body and wave rendering now use SpriteFrames with four individual, already-cropped PNGs per pose; all four decode before the animation starts, then stay mounted with visibility switching. Removed large negative atlas offsets. scripts/export-sprite-frames.py exports 36 consumed frame files and verifies exact source pixel equality; source atlas art, sizes, palettes and XP rules are unchanged. Browser and iOS asset delivery checks follow; physical phone confirmation remains required.

Verification of individual frames: TypeScript, all 52 tests and web export passed; scoped character audit has zero findings. Exact crop/source pixel equality passed for all packaged frames. iOS bundle and first-frame asset delivery for Study, Work, Gym, Run, Music, Sad and Wave returned HTTP 200. Browser screenshots confirmed Study, Work, Gym and Music, then return to Home/tap-wave; no console errors. Four short activity sessions were saved only in the isolated preview. Running browser start remains disabled, so its physical GPS scene still requires phone confirmation. Evidence: artifacts/studying-frame-fix.png, working-frame-fix.png, gym-frame-fix.png, music-frame-fix.png.
