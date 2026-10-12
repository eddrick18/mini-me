# Mini Me screen proposal

Status: complete local clickable design proposal awaiting review. Seven main-flow screens and shared assets are saved in Figma. Its Starter MCP call limit blocked the remaining 39 screens, prototype links, and screenshot validation. This is not approved production UI.

Scope: Home, five-activity selection, timed and manually logged sessions, completion and unlocks, history list/detail/edit/delete, basic appearance, settings/privacy/backup/reset. Include loading, empty, paused, interrupted, saving, validation, save-error, animation-fallback, reward-cap and destructive-confirmation states. Build reusable button, field, activity row, navigation item, toggle, and character-stage components only as needed by these screens.

Acceptance: editable Figma layers, shared variables and text styles, minimum 48-point touch actions, readable labels and progress without animation, coherent offline recovery, prototype links for the main and alternate flows, inspected screenshots, and a saved node ledger. Prototype numbers are sample data and do not award real XP.

Discovery: no relevant Code Connect files, no existing UI components or styles in the review file. Available Simple Design System Button/Input/Switch inspected. Its button is 40 points high and has no pressed/saving states; its remote token/property model differs from this application's preview. Build a small local set with the existing blue palette rather than detach or restyle the remote library. No library publication is needed.

Design: a little pixel room is the signature element. Blue controls (#315A75), mist background (#EEF3F7), white surfaces, ink text (#203444), muted text (#536674), pale green stage (#DCE9E9), and gold rewards (#F0BC69) follow the current preview palette. Use a restrained Space Grotesk display and Inter body proposal; the current preview retains its device fonts until review. Keep UI text crisp and readable rather than rendering it as pixel lettering.

The character is a simplified editable game sprite with brown skin, dark wavy hair, NBA shirt, shorts, and flip-flops. Detailed activity poses, outfit options, and production rigging remain subject to character review.

## Behavior

- All activities use the approved equal reward rules. Sample main flow moves from 80 to 110 total XP after 25 minutes, reaching level 2 and unlocking a clothing palette.
- Pause time earns nothing. Finish commits one session and its award together. Interrupted sessions require review; discard earns no XP.
- Daily ceiling is 120 XP; at most two rewarded completions per category. A cap or session shorter than five minutes still permits saving history.
- History edits/deletes preserve earned XP; reset removes everything. Corrections cannot award the same session twice.
- No account or network is required. Local export/import uses files. Import shows a review before replacement and preserves the current data on invalid input.
- Prefer still poses follows the OS reduced-motion preference or the user's override. Animation failure leaves readable activity/session controls available.
- English UI and Asia/Manila example timezone. Text should wrap and content scroll with larger system text; Figma's default-size mockups are not proof of native dynamic-type behavior.

## Current local revision
The local review now uses the vibrant game direction described in GAME_DESIGN.md. Figma and queued jobs reflect the previous quiet design and must be migrated before execution.

Latest sync retry after Codex usage resumed still returned the Figma Starter MCP tool limit. See DESIGN_HANDOFF.md for the current local handoff and migration status; no latest Figma revision is claimed.
