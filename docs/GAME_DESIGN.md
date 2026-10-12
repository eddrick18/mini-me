# Vibrant game proposal — 10 October 2026

The current clickable review uses a purple, cyan, lime, and gold game direction, replacing the earlier quiet blue screen proposal. Source: design-review/game.css and game.js, assembled into index.html by scripts/build-design-review.mjs.

The signature is the companion's pixel outdoor world: cyan sky, stepped green hills, sunshine, a bench, and the selected Pinoy casual outfit. Raised outlined controls, activity icons and distinct activity colors improve scanning. Gold XP and unlock cards make earned progress prominent. No streak penalties, extra currencies, or multiplayer features were introduced.

Palette: primary #6941D9; pressed #5030AF; background #F3EFFF; surface #FFFDF7; text #282348; muted #615B78; border #BFB1DD; stage #93DDF1; accent #FFD35A; success #276849; error #A52F4A. Buttons retain text labels and at least 48px target heights. Body content scrolls above fixed actions. Reduced motion disables decorative control movement.

Verification: all 46 screen fixtures checked for horizontal phone/body overflow and undersized buttons; none found. The start, study, pause, resume, finish, save, and reward flow was exercised. Larger text checked on home, activity selection, and manual entry. Eight representative screenshots captured; main six visually inspected as a contact sheet. Evidence: artifacts/game-review-audit.json and artifacts/game-screens/. These are sample-data design fixtures, not saved app records or a running native timer.

This is the current local proposal for review. Native app compatibility preview remains unchanged. Figma retains the earlier quiet design; its current Starter tool limit prevents syncing this revision. Previously queued Figma jobs are stale for this visual direction and require migration before execution. Character poses and alternative hair artwork remain pending.

## Animated scene prototype — 10 October 2026

The local clickable review now uses design-review/motion.js as its shared scene controller and motion.css as its animation library. It rigs the existing SVG pixel runs into head, torso, arm, and leg groups; skin/shirt recoloring remains owned by review.js. No extra dependencies or external assets are loaded.

States: idle (breathing and blinking), studying (book and nod), working (laptop and typing), gym (weights), running (alternating limbs), music (headphones and nod), paused (still activity pose), celebrating (three hops then idle), fallback (still sprite). Background clouds drift and leaves sway independently. State selection follows the selected activity/session review screen. Props are illustrative draft artwork and are not yet tied to persisted unlock ownership.

The review toolbar offers Pause animations. Prefer still poses is preserved across review navigation, but not persisted after reload. OS prefers-reduced-motion disables loops. Page visibility and scene intersection pause CSS animations; the observer disconnects on every screen change. Animation events only change the visual state and never award XP. The session timer remains sample data.

Verified in the in-app browser: visibly animated studying scene; changing cloud/head transforms; activity-specific states; pause control; paused session; settings still poses enabled and disabled across navigation; no browser errors. Screenshots: artifacts/animated-companion-preview.png. Native Rive assets/screens and Figma have not been updated by this browser prototype. Native integration, device performance, and iPhone validation remain future work.

Rig correction: split SVG runs crossing torso/limb boundaries, anchored the collar to the torso, added overlapping shoulder/hip joins, and moved head/limb pivots to the joints. Reduced head/limb rotation avoids visible seams. Running and raised-arm poses inspected in browser; evidence artifacts/connected-sprite-rig.png.

## Taller whole-frame sprite revision
The current review replaces the short SVG rig with the image-generated taller companion in assets/character/taller-pixel/atlas.png. Playback belongs to design-review/taller-sprite.js; frame geometry belongs to frames.json. Twenty-eight complete frames cover seven states; CSS background display preserves full connected bodies, common scale, and feet baseline. Still poses, visibility pause, offscreen pause, and finite celebration returning to idle remain supported. One fixed appearance exists; choices and appearance save are disabled with an explanation until new variants exist. Browser verified all five activity states, frame advancement, pause returning to frame zero, absence of visible SVG rigs, and representative idle/study/celebration artwork. Native Rive app and Figma are unchanged. Built-in tool prompt and asset details are saved in assets/character/taller-pixel/README.md.

Running outfit now uses a separate transparent whole-frame strip: teal windbreaker, running sneakers, and charcoal headphones. Other activity artwork retains its existing outfit. Browser playback and pause checked; latest evidence artifacts/running-outfit-preview.png.

Background balance revision: shared world.css replaces saturated flat hills with softer stepped distant hills, layered greenery, a shaded path, detailed park bench/tree, ground marks and a contact shadow. Foreground character retains stronger contrast; cloud/leaf motion and reward-scene tint remain supported. Browser running scene visually inspected. Applies to all character stages in the local review; native/Figma unchanged.
