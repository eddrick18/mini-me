# Wardrobe milestone — 10 October 2026

2026-10-11 idle motion follow-up: standing running gear now gently sways around its foot anchor (0.6 degrees each way) through a native-driver animation. No scaling or running frames are used. Prefer still poses disables the sway; pose change, failed/loading assets and unmount stop and reset it. This supersedes the static-only standing behavior below. This is whole-sprite idle motion, not a newly drawn blinking or waving frame cycle.

2026-10-11 follow-up: the frozen jogging stance was insufficient. Home and inventory now use a dedicated standing running-gear sprite (individual/running-idle.png), with feet planted and arms down. This supersedes the static running-frame workaround below. Its clothing overlay geometry is derived by scripts/read-standing-clothing.py; the original generated PNG is preserved. Running activity frames remain separate. Standing gear is static and uses the existing speech response without switching into the casual wave artwork.

Asset provenance: built-in imagegen, using idle-0.png as the pose reference and running-0.png as the clothing reference. Prompt: preserve the standing character's proportions, Filipino skin tone and wavy hair; replace the casual clothing with the reference teal/navy windbreaker, gray shorts, teal running shoes and headphones; feet planted, arms down, transparent background, one full-body pixel character. Saved asset: assets/character/taller-pixel/individual/running-idle.png.

2026-10-11 outfit/motion correction: choosing running gear changes artwork without starting locomotion. Home, Wardrobe and Room previews use a static running-gear frame; an active Walking / Running activity still animates. The current running-gear assets have a jogging stance, so this is a still pose rather than new standing artwork. Background motion remains controlled independently by the motion preference.

Home now opens Wardrobe. Casual Pinoy and running gear are starter choices. Original clothing colors are available at level 1; Sunset coral, Ube purple and Forest green unlock at level 2 (100 cumulative XP). Locked looks can be previewed; wearing is checked by domain authority inside the same persistence transaction.

Preview is temporary until Wear this look succeeds. Cancel preserves the saved appearance. Choosing a look scrolls its preview into view. Pending saves disable actions; errors preserve the preview and allow retry. Home uses the selected outfit. Activity poses retain their activity gear and use the selected clothing palette. Running equipment is a starter here; no new prop-earning rule is introduced.

Appearance is an additive version-1 ledger field. Existing records without it load with casual/original defaults; sessions, XP, preferences and an active timer are retained. Invalid/locked persisted appearance data is rejected without wiping records. Selection is stored by the existing SQLite/native and localStorage/browser adapters.

Rendering keeps the original PNG atlases intact. scripts/build-clothing-paths.py reads them to derive compound vector paths; react-native-svg overlays three clothing shade bands at the exact frame coordinates. Skin, hair and props retain the original raster. This avoids regenerating anatomy or replacing whole-frame playback with independent limbs. Palette ownership is src/domain/appearance.ts. Re-run the geometry script if source atlases change.

Verification: TypeScript and nine tests passed, including legacy-save upgrade, lock enforcement and persistence without new XP. Browser checks passed: locked preview, starter wear/save/reload, cancel preview, reaching level 2 through session saves and unlocking colors; Ube purple worn and retained after reload at level 2. Android x86_64 Gradle build succeeded in 4m25s, APK installed and launched; startup logs had no crash. Native wardrobe interactions and SVG rendering are awaiting the user device check. Viewport override did not take effect in the in-app browser (actual width remained 1280), so no phone-width browser claim is made. Safari on the user's iPhone remains the physical layout check.

This milestone does not add skin/hair choices, accessories, backup/import, additional background art or smoother frame cycles. Those remain subsequent work. Figma/Rive synchronization remains independent and pending.



## Visual inventory update

Wardrobe now uses eight visual slots: four basketball tees and four windbreakers. Pixel SVG garment icons, item names, selected check marks, equipped badges and level-lock labels replace the previous text-card choices. All items / T-shirts / Running gear filters and local word search narrow the same catalog; clear and empty-result reset controls restore it. Search/category state is temporary and never changes saved appearance. Each item selects an existing outfit-plus-palette combination, with the same domain unlock rules and persistence. Gear is still bundled with its outfit, not independently selectable shoes or headphones.

Owners: catalog.ts (inventory mapping/search), GarmentIcon.tsx (code-native thumbnails), Wardrobe.tsx (selection/filter UI). Visible action copy is now Equip item. The preview/equip/cancel contract is unchanged. TypeScript and web export passed. Browser checks passed for categories (four items each), search (one Ube tee), empty results and clear, icon preview and equip success. Physical Safari and native touch/layout checks remain pending; no new native dependency or rebuild is required for this UI-only update.
