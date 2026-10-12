# Bottom navigation and simpler Home

Home now contains the companion, one compact level meter, today's saved-count/XP row and Start/Resume. Detailed daily quests and the destination button stack move out of Home.

Five main destinations use a fixed bottom dock outside the ScrollView: Home, Quests, Inventory, Progress and Settings. The safe-area container protects the dock; scroll content cannot cover it. Inventory opens Wardrobe and Room. Progress opens weekly stats and activity history. Navigating resets the content scroll; an ongoing session continues when visiting another destination. Busy persistence disables navigation.

Wardrobe and Room keep explicit Save/Cancel controls and hide the dock during draft editing. Their back/cancel destination is Inventory. Finish review and the reward acknowledgment also keep their focused controls. History returns to Progress. No session, reward, storage or inventory rules changed.

BottomNav owns pixel icons and interaction motion. Hover or keyboard focus raises an icon 4 dp and scales it to 1.05 using a short spring. Press scales it to 0.96 on touch or mouse. Selection uses a gold badge and purple marker; names are always visible. The current screen is included in the accessible button name. Keyboard users use Tab/Shift+Tab and Enter/Space. Prefer still poses, OS reduced motion, background state and disabled controls suppress transform animation while preserving static selection/focus feedback.

Verification is recorded in PROGRESS.md. Pointer hover and physical touch feel still require device checks; keyboard focus exercises the same lift animation.

Verified: browser routes/cancellation, active session continuity, keyboard Enter navigation, focus lift, static still-pose transforms, 320/390-width layout, and Android startup/safe-area fit. TypeScript, 22 tests, web export and strict audit pass. Proof: artifacts/bottom-nav-home.png and artifacts/bottom-nav-android.png.
