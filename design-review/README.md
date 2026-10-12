# Mini Me design review

Open `index.html` directly, or run `node scripts/serve-design-review.mjs` from the project root and visit http://127.0.0.1:4173. Rebuild with `node scripts/build-design-review.mjs`. The standalone HTML has no external dependencies or requests.

This is a clickable design artifact with sample data, not the React Native app. Timers, saving, XP, backup, and reset are demonstrations. Skin and shirt colors preview interactively; alternate hair artwork and activity poses still require review. Browser font fallbacks differ from the specified Figma typefaces. Some state specimens intentionally use independent data fixtures.

## Figma and resume

File: https://www.figma.com/design/1rcTOHudvyrmdTRhuxo1xG

Seven main-flow screens, variables/styles, controls, and an editable pixel room were saved. The Starter MCP call limit blocked the remaining 39 screens, prototype links, and screenshot checks. `figma-jobs/` contains seven sequential remaining-screen payloads plus the main-link payload; none has been executed.

Resume by reading the Figma skills and saved ledgers, inspecting the canvas, running only missing batches sequentially, and persisting every returned ID. Combine all returned screens/links for prototype navigation, then visually inspect. Reuse existing foundations/components. Confirm individual primitive-variable IDs from the recorded collection when access returns; the foundation response recorded semantic IDs and primitive count, not primitive IDs.

## Verification

Browser checks passed for choose/study/pause/resume/finish/reward, duration validation, preserved entries after save failure, shirt color selection, and typed RESET confirmation. All 46 screens had no detected horizontal overflow, labeled inputs, and phone buttons at least 48px. Narrow 390px layout with larger text was checked. Native keyboard and iPhone dynamic-type behavior remain unverified.

All 46 captures and eight contact sheets were visually inspected. Evidence: `artifacts/design-screens/`, `artifacts/design-sheet-*.png`, and `artifacts/design-review-audit.json`. No real records, XP, paid plan, or cloud publication were changed.

Current visual direction: vibrant pixel game, documented in ../docs/GAME_DESIGN.md. Figma and queued Figma jobs still reflect the previous style and require migration. Latest screenshots: ../artifacts/game-sheet-01.png and game-screens/.

Live scene controls: select an activity session to see its pose and prop, finish for a brief celebration, or use Pause animations in the toolbar. Settings > Prefer still poses stops the character and ambient backgrounds across navigation. Timers and saves remain sample data. Motion source: motion.js and motion.css.
