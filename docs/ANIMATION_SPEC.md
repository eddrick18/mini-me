# Mini Me animation specification

Status: implemented in the local browser design review; pending native integration. The current character is a whole-frame pixel sprite. It is not a Rive export. Documentation updated 10 October 2026.

## Current assets and ownership

| Asset / owner | Purpose |
|---|---|
| `assets/character/taller-pixel/atlas.png` | Original transparent 948 × 1659 character atlas; seven rows of four frames |
| `assets/character/taller-pixel/frames.json` | Measured display rectangles; do not assume equal cells |
| `assets/character/taller-pixel/running-outfit.png` | Transparent 2172 × 724 four-frame running outfit strip |
| `assets/character/taller-pixel/running-frames.json` | Running strip rectangles |
| `design-review/taller-sprite.js` | Whole-frame playback and lifecycle policy |
| `design-review/motion.js` | Review activity state selection, still-pose settings, visibility and intersection observation |
| `design-review/world.css` | Layered park, path, tree, bench, ground shadow, stones and reward tint |
| `design-review/motion.css` | Cloud and leaf motion; earlier SVG rig rules retained as historical prototype code |

Each atlas is generated bitmap artwork, with generation prompts recorded beside it. No layered artist source is available. Current source images remain unmodified. The build embeds the atlases in the standalone review; no external image service is required at playback time.

## State and timing contract

| State | Appearance / action | Current timing | End behavior |
|---|---|---|---|
| idle | NBA shirt, shorts, flip-flops; blink / subtle pose change | Frames 0/1/2/3 for 2600/120/1600/120 ms | Loop after 4440 ms |
| studying | Seated, open book | 650 ms per frame | Loop |
| working | Seated, laptop | 350 ms per frame | Loop |
| gym | Standing, dumbbells | 300 ms per frame | Loop |
| running | Teal windbreaker, gray shorts, sneakers, headphones | 140 ms per frame | Loop |
| music | Casual outfit and headphones | 420 ms per frame | Loop |
| celebrating | Smile, raised arms / hop | 160 ms per frame, two cycles | Return to idle after 1280 ms of active playback |
| paused session | Frame zero of the selected activity | No character playback | Resume selected activity when requested |
| fallback fixture | Idle frame zero | No character playback | Fixture only; real bitmap decode fallback still required |

Frames are displayed at a common ground baseline, centered inside a 220 × 210 stage slot. The main atlas uses scale 0.78; the running strip uses 189/597 to compensate for its larger source resolution. Frame rectangles are alpha-derived crop bounds. Generated poses and loops still need production cleanup for consistent silhouettes, pixel grids and cadence. The running strip is a prototype pose sequence, not a polished biomechanical run cycle.

## Transitions and data boundaries

Home → idle. Starting an activity → that activity. Pause → still activity pose. Resume → activity loop. Successful save fixture → celebration → idle. Navigating to another review screen rebuilds playback and cancels the prior animation callback. Appearance selectors are disabled until matching variants exist.

Browser timers and saved records are sample fixtures. Playback never completes a session, calculates XP, writes a reward receipt, or grants an unlock. Production must trigger celebration only after the authoritative session/reward transaction commits. Use an event ID to avoid replaying a saved reward on reopen.

## Motion and lifecycle

OS reduced motion, Prefer still poses, or Pause animations selects frame zero and disables ambient CSS loops. Prefer still poses is review-memory state, not persisted across reload. Page-hidden and offscreen scenes stop elapsed playback; ambient CSS loops pause. The browser animation callback still exists while offscreen and must be replaced by an explicit scheduled-frame stop in the native adapter. A paused session freezes the character while gentle background motion remains permitted unless still poses are enabled.

The native app must stop scheduling/rendering when backgrounded or when the scene is outside the active screen, release resources on unmount, and resume without a large elapsed-time jump. The session clock is independent of rendering and must use persisted timestamps/checkpoints, not animation frames.

## Verification and remaining work

Browser evidence includes seven sprite states, advancing frames, fixed frame-zero pause, complete connected bodies, no visible SVG rigs, stable stage geometry, and finite celebration returning to idle. Latest screenshots are in `artifacts/current-design-screens/` when the handoff capture is generated. Physical iPhone, native sprite rendering, OS preference tests, bitmap loading recovery, event deduplication, memory and frame-budget measurements remain pending.

## Rive inventory

The current native adapter loads `assets/character/compatibility-character.riv`, artboard `MiniMe`, state machine `CharacterController`, numeric view-model property `pose`: idle 0, studying 1, celebration 2. That asset is the earlier compatibility character. Local pixel draft RML/RIV files also exist but are not loaded by this adapter. The CLI is installed; the last account check reported Not logged in. The current taller atlas, running outfit and park have not been authored or uploaded to Rive.

For this sprite direction, a native atlas renderer is the proposed implementation path. Retain Rive as a separately verified compatibility option. Do not rename an atlas to `.riv`, claim Rive editing from browser playback, or make native shipping conditional on an account login without an actual technical requirement.
