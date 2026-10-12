# Current design handoff

Updated 10 October 2026. The current source of truth for visual review is `design-review/index.html`, rebuilt by `scripts/build-design-review.mjs`. It is a local sample-data review, not a production app or published site.

## Delivery status

| Destination | Current state |
|---|---|
| Local review | Latest vibrant UI, taller whole-frame character, running outfit and balanced park |
| Figma file `1rcTOHudvyrmdTRhuxo1xG` | Earlier foundations/components and seven main-flow screens; latest revision is not synced |
| Figma sync attempt | Still blocked by the Figma MCP Starter tool limit after Codex usage became available again |
| Native Rive adapter | Earlier three-state compatibility character; no taller sprite/park migration |
| Rive account | Last check Not logged in; no current artwork uploaded |
| Native sprite adapter | Proposed in NATIVE_ANIMATION_INTEGRATION.md; not implemented |

## Package contents

The design handoff archive contains current design/animation documentation, source CSS/JavaScript, standalone review HTML, original transparent atlases, measured frame manifests, and current screen screenshots. Screenshots are reference evidence only. They must not be imported as flattened replacements for editable Figma UI. Generated sprites are bitmap assets; buttons, text, forms, layout and background primitives must remain editable when rebuilt in Figma.

## Figma migration when access is available

Use the existing file and its saved local components; preserve the earlier review as historical. Discover current node IDs and font availability before mutation. Update primitive/semantic color tokens to game.css, text hierarchy to the reviewed game typography, shared controls to the raised button/activity/nav treatment, and the scene component to the layered park. The browser uses installed font fallbacks; confirm the available Figma family/style rather than silently substituting.

Import the isolated atlas artwork as content image assets, with correct frame crop transforms. Maintain separate idle, activity, paused and celebration scene snapshots; include the running outfit. Do not use a complete phone screenshot as a frame fill. Rebuild the seven saved screens around the new shared components, then create the remaining 39 screen fixtures from `docs/figma-screen-specs.json` and the current rendered review. Preserve disabled appearance controls and pending variants explanations.

Reconnect prototype navigation and confirm that reward examples remain sample data. Verify editable text/component hierarchy, token bindings, screen dimensions, scrolling bodies, fixed footer actions, minimum control targets, labels and recovery states. Take Figma screenshots for actual visual validation. Record all created/mutated node IDs in a new ledger. Only mark the revision synced after both structural and screenshot verification.

Old `design-review/figma-jobs/` files reflect the earlier blue design. They are stale and excluded from the current handoff archive; do not execute them unchanged. `scripts/figma-screen-builder.js` requires style/scene migration before reuse.

## Documentation map

- GAME_DESIGN.md: current direction, progression of visual revisions and evidence.
- ANIMATION_SPEC.md: implemented browser states, timings, source ownership and limitations.
- NATIVE_ANIMATION_INTEGRATION.md: proposed adapter, data boundaries, lifecycle and validation.
- assets/character/taller-pixel/README.md: generated asset provenance and exact prompts.
- handoff/manifest.json: packaged assets, hashes and explicit destination status.

No Figma or Rive update is claimed by the existence of this package.

The current archive includes 17 current full-page screen references covering the main flow, manual logging, history, customization, settings, backup and running. The standalone review contains all 46 screen fixtures. Screenshot capture is representative, not a complete 46-screen visual audit.
