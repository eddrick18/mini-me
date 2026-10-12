# Saved-session reactions

After persistence succeeds, a session earning 0 XP displays a gentle four-frame sad/sigh reaction for 2.4 seconds, then returns to idle. Positive XP retains celebration. This does not change rewards, saved time, levels or quest eligibility. The confirmation still explains why XP is zero and confirms that the activity was saved.

Prefer still poses displays a static sad frame for the same brief interval. Frame animation uses the existing foreground/motion policy. The selected casual palette is preserved with derived SVG clothing paths. Every frame is a connected full-body sprite, rendered at 189 dp with an aligned foot baseline.

## Asset provenance

Asset: assets/character/taller-pixel/sad.png. Four transparent horizontal cells, generated with the built-in imagegen tool using atlas.png as the identity reference. Geometry is extracted by scripts/build-sad-frames.py; no raster pixels are edited by that script. Clothing masks are derived by scripts/build-clothing-paths.py.

Prompt: Production game sprite asset. Use the supplied atlas ONLY as a character identity/style reference. Create a new sprite sheet with exactly FOUR full-body frames in a SINGLE HORIZONTAL ROW, evenly spaced identical size cells, transparent background. Same Filipino male pixel companion, warm tan skin, dark wavy hair, navy NBA tee, gray shorts, black flip flops, tall proportions exactly like the first idle row reference. Crisp pixel art, not smooth illustration. All four sprites completely connected whole bodies, head naturally attached to torso, identical height/proportions and feet baseline across frames, no changing clothing or identity. A gentle sad/disappointed sigh animation: frame1 eyes looking slightly down with small downturned mouth, arms resting at sides; frame2 shoulders slouch very slightly and eyelids lower; frame3 eyes briefly closed and small sigh; frame4 returns to frame1 downcast expression. No crying, tears, hearts, symbols, text captions, extra props, ground or shadows. Feet stay in the SAME position, no bouncing. Four equal cells, no borders or labels; sprites have generous transparent space around them. Keep shirt three navy blue shades distinct from skin, hair and gray shorts for recoloring. All four full figures unobstructed, no overlapping frames. Match the reference character, not a new character.

## Verification

TypeScript and 20 existing regression tests pass; web export succeeds. Browser checks at 390×844 confirmed a saved zero-XP session, sad reaction, selected green shirt, automatic return to idle and unchanged 150 total XP. Still-pose mode displays the static sad state and returns to idle. Native device reaction interaction has not yet been verified. These are app sprite assets; no Figma or Rive authoring update is claimed.
