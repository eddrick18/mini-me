---
version: alpha
name: Mini Me activity companion
description: A vibrant personal activity app with a living pixel companion.
colors:
  primary: "#6941D9"
  background: "#F3EFFF"
  surface: "#FFFDF7"
  text: "#282348"
  muted: "#615B78"
  border: "#BFB1DD"
  stage: "#C5E5EA"
  accent: "#FFD35A"
typography:
  sans:
    fontFamily: "system-ui, sans-serif"
  mono:
    fontFamily: "monospace"
rounded:
  DEFAULT: "16px"
spacing:
  page: "20px"
  gap: "14px"
components:
  button: {}
  character-stage: {}
---

# Mini Me design context

2026-10-12 approved polish: Home places level and today's totals in one shared card. Session controls and a centered timer use one card ahead of optional GPS detail statistics. Runtime tokens and fixed 238 dp character stage remain canonical. Wider transparent windbreaker frames preserve body scale and foot alignment while avoiding cropped greeting limbs. This begins the previously deferred UI consistency/regression steps.

2026-10-11 companion refinement: Home idle and greetings preserve the equipped casual or windbreaker outfit and palette. Windbreaker uses connected blink/inhale and wave frames with a common foot anchor, replacing the temporary static/sway implementation. No whole-character scale changes; scene geometry and still-pose policy remain unchanged.

The native first activity flow supersedes the compatibility test bench as the root screen on 10 October 2026. The approved direction is a vibrant game interface, a taller detailed pixel companion with warm brown skin and dark wavy hair, and a quiet layered park. Historical Figma and browser proposals remain reference artifacts; they are not evidence of synchronization.

## Overview and locale

Personal offline activity tracking, English copy, Philippines dates and Asia/Manila reward days. Home, activity picker, timer, finish review, reward, history and settings share one visual language. No account or cloud service is required. Appearance customization and export/import remain future work.

## Colors and typography

Runtime palette ownership: src/design/tokens.ts. Purple controls, cream cards and golden XP accent support a muted sky/green park so the character remains the focus. Device system sans typography scales with accessibility settings; controls wrap labels. Activity text accompanies every color.

## Layout and depth

Safe-area scrolling content, maximum 500dp width, 20dp outer padding and 14dp gaps. A fixed 238dp stage preserves layout through loading and failure. Cards use 16dp corners; the stage uses 18dp. Buttons have a minimum 54dp height and a thicker lower border for a game-like raised appearance. Forms use visible labels and retain values after save failure.

## Components and behavior

GameButton owns disabled and pressed semantics. SpriteScene clips complete atlas frames with a shared baseline; it owns loading, readable failure and an explicit retry. Running equipment is automatic for the running activity. No limb layers move independently. Scenery stays behind the character and controls.

useMotionPolicy combines foreground state and OS reduced motion. The saved Prefer still poses setting freezes character and background. Pausing a session also freezes its scene. Celebration follows successful persistence and lasts at most two cycles. Navigation, unmount and background state dispose animation timers.

## Persistence and feedback

useSessions owns pending/error state and immediate repeated-input protection. SQLite commits session and XP together; the UI confirms success only afterward. Completed session IDs make retries idempotent. Pauses do not count. Interrupted sessions require duration review. Storage failures preserve existing records and allow retry; corrupt/newer data is never silently reset. History is read-only in this milestone.

## Verification and remaining work

Android build/install/startup and user-operated pause/resume/finish/history passed. SQLite inspection confirmed two unique completed sessions. The user confirmed the still-pose preference survives reopening. Browser checks passed for recovery, reviewed duration, XP, history and persistent still poses. TypeScript and seven tests pass. See docs/FIRST_FLOW.md for evidence and limitations. iPhone, screen-reader/text-size checks, forced image failure, frame pacing and release packaging remain pending. Draft sprite cycles still need animation polish. Figma synchronization and a production Rive character are not completed.


## Wardrobe evolution

The approved wardrobe now offers casual Pinoy and running starter outfits, with three clothing palettes at level 2. This intentionally supersedes the previous statement that all appearance customization was future work. Existing purple/cream/gold tokens and scrolling card/button patterns are retained. src/domain/appearance.ts owns garment palettes; SpriteScene owns the compound vector overlays and common frame geometry. Home wears the selected outfit; activities retain their pose-specific gear. Preview, locked, saving, saved and error states are explicit. See docs/WARDROBE.md for evidence and renderer limits.

Wardrobe presentation now follows the user's visual game-inventory direction: a framed three-column item grid with pixel garment thumbnails, concise names and equipped/locked markers. Search and category filters replace the long text-card list. No palette/progression/persistence rules changed. Item thumbnail ownership is GarmentIcon; catalog owns item mapping and local search. The existing scene and game control visual language is retained.

## Local backup evolution
Settings now provides export, file selection, comparison preview, explicit replacement and recovery review using the existing game cards and buttons. Invalid files and failed writes preserve current records. See docs/BACKUP.md for validation, atomic persistence and verification scope.

## Daily quest board
Home adds a framed quest board using the existing purple, cream and gold tokens. Three numbered missions become checked receipts on successful claims. Progress is based on saved activities; rewards, claimed states and errors follow the existing persistence owner. See docs/QUESTS.md.

## Finished worlds and room inventory
The user approved finished activity-specific backgrounds, then requested more visible pixel blocks. WorldBackdrop now uses six generated raster scenes with consistent depth, restrained colors and a clear center. The fixed stage and sprite baseline remain unchanged; cover fitting preserves proportions at phone widths. RoomInventory and DecorationArt extend the existing visual inventory and pixel SVG system. Saved decorations appear at fixed room edges. Runtime palette ownership remains tokens.ts. See docs/ROOMS.md and docs/WORLD-ART.md.

## Zero-XP reaction
A successfully saved zero-XP activity shows a brief connected whole-body sigh, then idle. The selected palette and still-pose preference remain respected. Positive rewards retain celebration. See docs/REACTIONS.md.

## Game feedback and weekly adventure
Weekly progress extends the purple/cream/gold game cards with a gold saved-time summary and seven labeled daily bars. Sound is opt-in; vibration has a separate persisted toggle. See docs/FEEDBACK-PROGRESS.md.

## Bottom navigation and quieter Home
The user requested less Home clutter and hover motion. BottomNav now owns a five-destination pixel-icon dock with gold selection and a restrained lift on hover/focus. Quests, Inventory and Progress own their detail screens; Home remains character-first. The existing motion policy suppresses transforms. See docs/NAVIGATION.md.

Walking / Running uses distance rewards and a native-only GPS session panel with signal, distance, permission errors and Pause/Resume. Browser Start is disabled with an explanation. See docs/GPS.md.

Expo Go shows foreground-only GPS instructions and asks only for while-using precise location. Locking/leaving pauses the session and requires explicit Resume. Native builds retain background GPS. Permission copy always matches the active runtime.


## Companion interactions
Companion speech now appears beside the character inside the scene, in a cream pixel frame with a speech pointer. This explicitly supersedes the first below-scene proposal. Existing colors remain canonical in tokens.ts; text scaling may grow the stage beyond 238 dp. See docs/CHARACTER_INTERACTIONS.md.


2026-10-11 user-directed speech refinement: compact stepped pixel balloon above the centered companion with a lower-left pixel tail. Header and close chrome removed; tap the balloon to dismiss (labeled accessible button). The scene grows to make room above the character instead of shifting the character sideways. Multiline/text scaling are retained. Idle greeting includes “Hi!” to match the reference. The deferred plan is saved in docs/PINNED_PLAN.md.


2026-10-11 correction requested by user: scene frame stays exactly 238 dp high; character scale and centered position never change for speech. Balloon is an absolute overlay beside the head, with a fixed 112 dp height and viewport-based width independent of message length. Long/scaled text scrolls inside it. This supersedes the expanding-scene balloon treatment.


Speech refinement: balloon now hugs its text within the available side space; short greetings have compact containers. Its pixel tail is drawn inside an extended positive-coordinate SVG viewport to prevent clipping, pointing left toward the character’s head. Scene remains 238 dp and character geometry remains unchanged. Long/scaled text can scroll at the height limit.

## Connected companion greetings
Casual idle greetings now use a generated complete-body wave atlas, anchored by the feet at 189 dp high. Both greeting reaction types use this wave; committed rewards retain their existing whole-body celebration. Activity poses retain their own equipment and cycles. Yellow reaction badges and the gold touch outline are removed from the production scene. WaveSprite owns the short greeting sequence, cleans up on cancellation/unmount, follows the existing motion gate, preserves clothing palettes, and falls back to the base character if the wave asset fails. Speech remains an absolute overlay in the fixed 238 dp scene.

## Activity badge collection
Progress now opens with a two-column collection of four pixel achievements, then the existing weekly adventure. AchievementBadge extends the existing SVG icon style; locked monochrome badges include an explicit lock and progress, while collected badges use gold/purple, earned dates and text status. Collection cards are informational. AchievementUnlock adds a brief badge bounce on successful qualifying session saves, using the shared motion policy and reserving its layout. Existing history unlocks silently; badges are derived from saved sessions and do not grant XP. See docs/ACHIEVEMENTS.md.

## Reliable activity sprite frames
SpriteFrames supersedes the large negative-offset atlas renderer. Scripts package exact atlas rectangles into individual PNG assets, keeping original pixel art, baseline, scale and palette paths. Four small frames remain mounted per pose and decode before animation begins; pose-plus-retry keys isolate readiness and stale callbacks. Both body poses and waving use this shared renderer. Fixed scene and speech placement are retained.

## Badge detail views
Achievement collection cards now open a Progress subpage with a larger pixel badge, earned date, progress, saved activity checklist and a contextual next step. Existing GameButton and card tokens remain canonical. All-Rounder shows all five activities; other badges show only their qualifying activity. Existing session and GPS gates are retained; Back returns to the collection and the bottom dock remains on Progress. No modal or new animation is introduced.

## Daily mood check-ins
Home companion taps now open a separate daily check-in page, keeping Home uncluttered. Four golden pixel faces use the existing selected-purple inventory language, labeled choice buttons and shared GameButton. The fixed scene and character remain unchanged. Progress owns a history subpage. Runtime colors remain tokens.ts; behavioral rules and evidence are in docs/CHECKINS.md.

2026-10-11 user-directed change: daily mood check-in screens and save command are removed. Home companion tap again uses the existing greeting engine. Progress no longer exposes mood history. Legacy mood records remain validated and preserved in local storage and backups to avoid erasing saved data. Next priority is app design/structure stability, pending scope selection.

2026-10-11 navigation/session stability: rendering moved into src/screens; navigation/routes owns page guards, selected dock and parent destinations (including Android Back). sessionActions owns the transition lock and GPS rollback/cleanup; reconcileSession and useSessions distinguish live foreground return from cold recovery and fence stale refreshes. Recovered GPS sessions require review rather than offering unsupported Resume. Existing appearance and domain rewards are preserved. Approved steps 1–2 only; steps 3–5 deferred. Contract and evidence: NAVIGATION-SESSION-STABILITY.md.

2026-10-11 character-loading step 3: RootLayout warms sprite assets without blocking startup; SpriteFrames onLoad remains the decode authority. spriteLoading and SpriteScene preserve a complete prior bank during same-scene pose changes, retain static loaded frames on failure, and use terminal generation-guarded retries for body and wave. Failure/retry is shown below the fixed 238 dp scene. Character geometry/art and saved data remain unchanged. UI polish and broader regression work (steps 4–5) remain deferred. See CHARACTER-LOADING.md.
