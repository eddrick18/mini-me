# Design planning

User selected pixel art on 2026-10-10 after reviewing [the comparison study](assets/character-style-comparison.png). This approves the style direction, not the final character appearance or screens. The study depicts a generic example, not a verified likeness. Pixel art uses a fixed pixel grid and crisp scaling. Rive source must use deliberately aligned rectangular geometry and test scaling at device pixel ratios; the raster study is not an editable Rive asset. The compatibility preview currently uses a temporary rounded character, clearly labeled.

Figma creation, reading, and editing succeeded on 2026-10-10. The [Mini Me review file](https://www.figma.com/design/1rcTOHudvyrmdTRhuxo1xG) contains an editable pixel character draft and main-flow outline. File and node IDs are recorded in `figma-state.json`. The draft is a simplified game sprite adaptation of the requested brown skin, wavy hair, NBA shirt, shorts, and flip-flops; final proportions and screens still need review. The existing board is not yet the complete screen design or clickable prototype.

User selected a generic customizable companion instead of a personal likeness. [First pixel companion concept](assets/pixel-companion-concept.png) shows the same base character with everyday, study, and fitness outfits. Built-in ImageGen concept artwork, awaiting review; it is not an animation-ready sprite sheet or an editable Rive source. The exact pixel grid, palette, and scaling must be rebuilt and verified in the eventual production asset.

The first concept was rejected. User requested a more Filipino look with slightly brown skin and wavy hair. [Revised concept v2](assets/pixel-companion-concept-v2.png) applies that request; approval is pending. Keep the generic customizable approach and pixel-art direction.

User then requested a casual Pinoy outfit for the left variant: shorts, NBA shirt, and flip-flops. [Current concept v3](assets/pixel-companion-concept-v3.png) changes that outfit while retaining the study and fitness variants. This is the current review candidate; it has not yet been approved for production character work.

Review sequence: visual directions → main flow → tokens/components → screen states → clickable prototype where supported → user review. The local `design-review/index.html` covers 46 screen/state proposals with checked navigation, form validation, color previews, and recovery examples. Seven main-flow screens and shared assets are saved in Figma. Its Starter MCP limit blocked further writes and screenshot checks. Remaining jobs are in `design-review/figma-jobs/`. No visual approval has been recorded yet.

Flow: Home → activity picker → running/paused session → completion/reward → Home; alternate picker → completed-log form → reward. History detail supports correction/delete; character screen previews/equips owned unlocks; settings provides privacy/backup.

Reserve a stable character area; XP and activity labels remain readable without animation. Proposed foundations: comfortable 48dp actions, semantic color tokens, readable contrast (4.5:1 normal text), scalable text, safe-area margins, visible focus/selection, no color-only status. Keyboard must not cover form actions. Test large text without fixed-height truncation.

Design components: activity tile, primary/secondary button, session controls, progress meter with text alternative, reward card, history row, appearance picker, empty/error/pending feedback. Include initial loading, no-history, validation failure, asset failure, disabled submission, saving, interrupted session, and reward-cap reached. Cloud alternatives additionally need offline, pending sync, conflict, expired login, and rate-limit cooldown. Avoid exposing database or RPC terminology.
