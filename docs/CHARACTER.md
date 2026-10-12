# Character and Rive plan

Current source of truth: ANIMATION_SPEC.md documents the taller whole-frame browser sprite, running outfit, park, and exact timing. NATIVE_ANIMATION_INTEGRATION.md records the proposed native adapter. Earlier Rive/SVG milestones below are historical compatibility work, not the current sprite export. No current design has been synced to Rive.

Pixel art was selected on 2026-10-10. Final proportions, hair/clothing options, and likeness remain awaiting review. The current rounded compatibility asset is temporary. Begin with idle, studying, and celebration for compatibility/first-flow work; expand to working, gym, running, and music later. Proposed transitions: activity changes blend through idle; paused session uses calm idle; completed session plays a short celebration and settles. Reduced motion uses a static expressive pose and text feedback.

CLI verified at `C:\Users\PREDATOR\.rive\bin\rive.exe`: version 1.5.1, help and installed docs read, `whoami` reports Not logged in. Native editor control is not assumed. Installed documentation supports local RML/script authoring, verify, inspect, screenshots, unsigned .riv output, and signed local output. Account push, pull, library publication, or web publication are separate actions requiring explicit authorization. Login requires user setup when signed export is needed.

Important compatibility risk: local CLI viewer accepts unsigned scripts; consumer runtimes may not. Prefer a script-free state-machine asset for the first proof. Verify the actual CLI-produced asset in the native runtime; CLI success alone is insufficient. Read format/workflow/data/state-machine topics before authoring. Signed local builds can contact Rive's compile service, so disclose this before requesting authorization if scripts become necessary.

## Proposed contract v1

| Property/event | Values | Owner |
|---|---|---|
| activity | idle, studying, working, gym, running, music | App domain → controller |
| sessionStatus | none, running, paused, review, completed | App domain |
| appearance | validated skinToneId, hairId, outfitId, accessoryId | Preferences + owned unlocks |
| celebration | session-completed, level-up, unlock; unique event ID | Committed app event |
| reducedMotion | boolean | OS preference or user override |

Use named view-model properties if supported by the verified asset/runtime; otherwise document exact state-machine input mappings. Controller is the only translator. Runtime callbacks signal display completion, never XP awards. Persist event IDs to avoid repeated celebrations on reopening; coalesce simultaneous unlock/level events. Fallback image plus activity/level text is always available.

Pause rendering off-screen/backgrounded, release resources on unmount, avoid continuous particles and unnecessary per-frame app updates. Native Android compatibility rendering has been inspected, and the user confirmed studying, celebration, and still-pose controls. Corrupt-asset fallback was visually verified. Physical iPhone, native background behavior, OS reduced-motion, and performance checks remain pending.

Version editable source under `character/source/`; exports under `assets/character/`. Manifest records asset hash, contract version, CLI 1.5.1, pinned runtime/Nitro versions, native runtime versions, supported features, and required signing. Keep editable source; do not treat .riv as the only source.

An animated SVG scene is now implemented in the local game design review, including all five activity poses, idle, pause, celebration, and ambient backgrounds. See GAME_DESIGN.md for the review-only state controller and motion policy. This does not replace the native compatibility Rive asset.
