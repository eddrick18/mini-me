# UI and session contract

2026-10-12 approved UI polish and regression pass: Home groups level and today's totals in one card. ActivitySessionScreen groups timer, Pause/Resume and Finish in one card before optional GPS detail statistics. Distance/signal stay visible; Show/Hide GPS details uses GameButton with an expanded accessibility state and resets per session. Platform GPS instructions stay visible and distinguish Expo Go foreground tracking from native background tracking. Paused non-GPS copy explicitly says it remains paused. Domain/session owners and reward rules are unchanged.

Windbreaker greeting packaging must leave transparent horizontal margin around every opaque character frame; no hand or sleeve may touch a crop boundary. scripts/package-windbreaker.py enforces the boundary check. Idle and wave share the same 160x240 logical frame, 189 dp rendering height and foot center; widening the transparent canvas never scales the body. Physical iPhone idle, outfit preservation and still-pose checks passed on 12 October; corrected wave clipping awaits phone confirmation.

Root first-flow owner: app/index.tsx. Shared controls: src/ui/GameButton.tsx. Scene: src/platform/animation/SpriteScene.tsx. Tokens: src/design/tokens.ts. Lifecycle/reduced motion: src/platform/lifecycle/useMotionPolicy.ts. Persistence and pending/error handling: src/features/sessions/useSessions.ts and src/data/sessionStore.native.ts. Domain authority: src/domain/activity.ts.

One active session per device. Pessimistic writes; pending actions disable repeated inputs. Save failure retains the session and input. Finish success atomically stores the session and earned XP before confirmation/celebration. Completed IDs are idempotent. Recovery requires review. No automatic destructive reset on corrupt or newer data. History is read-only. Reward-day timezone is Asia/Manila.

Character display cannot mutate progress. All frames are complete sprites with one baseline. Still poses, OS reduced motion and background state stop animation. Stage geometry remains stable through loading/failure; explicit image retry is available. All activity choices have visible names and descriptions. Controls use labels and accessibility roles, wrap text and remain reachable by scrolling.

Accounts and release packaging remain outside this first-flow milestone. Wardrobe and local backup were added afterward. Evidence and limitations: docs/FIRST_FLOW.md and docs/BACKUP.md.

Backup owner: src/features/backup/BackupSettings.tsx. Choosing a file only validates and previews; explicit replacement commits records and recovery atomically before success. Cancel does not write. Current sessions block restoration. One previous ledger is recoverable through the same review flow. Storage and validation errors preserve records and provide visible feedback. Platform file controls share the same domain validation; see BACKUP.md.

Wardrobe owner: src/features/wardrobe/Wardrobe.tsx. Preview does not persist; Wear this look commits then announces success, remaining in Wardrobe. Cancel returns Home without changing appearance. Locked colors may be previewed but cannot be persisted below level 2; the domain command enforces the same rule. Legacy ledgers receive additive starter defaults without resetting sessions. See WARDROBE.md.

Inventory refinement: All items / T-shirts / Running gear filters and local search are temporary view state. Clear search preserves category; Reset search and filters restores All items. Empty results retain the selected draft and equipped look. Tapping an icon selects its full outfit/palette combination and brings the character preview into view. Equip item commits through the existing owner; locked items remain previewable only. Item names and state labels accompany all icons.

Daily quests: QuestBoard owns presentation; domain/quests owns progress and receipt validation. applyCommand validates current Manila day and once-per-day eligibility; existing store and useSessions commit before success. Failed writes retain ready rewards. Home stays visible after claiming; live text confirms XP. Midnight refreshes the board without removing earned XP. Backups preserve receipts in format version 2 and accept legacy version 1. See QUESTS.md.

Room inventory: draft selection is local; Save room commits through applyCommand and the existing store before success. Locked items are preview-only, with ownership also enforced in the domain and import. Clearing changes the draft; cancellation discards it. Search/category empty states have reset. Home and wardrobe use saved decorations; each active session selects its activity environment. Navigation resets scroll to the top. WorldBackdrop owns image sizing and explicit failure/retry; ambient motion follows the shared policy. See ROOMS.md.

Zero-XP save success triggers a 2.4-second sad reaction, then idle. Still-pose mode uses a static frame. The activity remains saved and the confirmation explains the zero reward; no reward or level penalty is applied.

Feedback cues follow committed saves only, never failures or app reopening. Sound defaults off, haptics on; both settings persist and travel in backups. Background/muting stops sound. Weekly progress is a read-only seven-day Manila summary with activity and quest XP distinguished.

Main navigation is a fixed safe-area bottom dock. Home, Quests, Inventory, Progress and Settings use explicit named controls and current-screen announcements. Pending writes disable the dock. Session timing continues across destinations. Inventory previews hide the dock and keep explicit Save/Cancel, returning to Inventory; history returns to Progress. Motion follows the shared still/OS/foreground policy.


## Companion interactions
Companion interaction owners are interactions/engine for priority/timing, messages for selection, SpeechBubble for text, SpriteScene for visibility/placement and CompanionReaction for Rive/fallback. Sessions and XP remain owned by the existing domain/store; taps have no command authority. See CHARACTER_INTERACTIONS.md.


| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
| --- | --- | --- | --- | --- |
| Toast | SpeechBubble and interactions/engine for companion messages | CHARACTER_INTERACTIONS.md | tap / idle / committed event | companion-interactions.test.ts and isolated browser preview |

2026-10-11 greeting update: SpriteScene and WaveSprite own production whole-body greeting animation. CompanionReaction is a retained compatibility artifact and no longer rendered in the production scene. Tap targets have no gold pressed border; speech provides tap feedback. Reaction settings and motion policy still gate animation. Activity gear/cycles and committed reward animations take priority.

Achievements: domain/achievements derives eligibility and earned dates from unique saved sessions. AchievementCollection owns read-only badge progress in Progress; AchievementUnlock owns newly earned feedback on the committed-save reward page. Existing history/imports unlock silently; short/zero-XP saves count; active sessions do not. No claims or reward mutations. Rules and restoration behavior: ACHIEVEMENTS.md. Verification: tests/achievements.test.ts and isolated browser workflow.

Achievement detail owner: AchievementDetail, using achievementDetails for checklist/next activity. Tile selection opens a Progress subpage; Back returns to the collection. Start reuses the existing session-start owner, including GPS permissions/errors. An existing session offers Return rather than another start. Collected badges show earned dates with no earn CTA. See ACHIEVEMENTS.md; tests/achievements.test.ts covers missing-activity selection and unique saved counts.

Daily check-in owners: domain/checkins validates one mood per Manila day; applyCommand, useSessions and the existing store commit before the response. DailyCheckin uses labeled selected buttons, disposable explicit-save drafts and the existing global error banner. Back returns to Home or mood history. CheckinHistory belongs to Progress and loads 14 entries at a time. No XP, quests or session side effects; backup and migration are additive. SpeechBubble is reused for companion feedback. Business source: user-approved daily check-in proposal; detailed contract: CHECKINS.md.

2026-10-11 user-directed change: daily mood check-in screens and save command are removed. Home companion tap again uses the existing greeting engine. Progress no longer exposes mood history. Legacy mood records remain validated and preserved in local storage and backups to avoid erasing saved data. Next priority is app design/structure stability, pending scope selection.

2026-10-11 navigation/session stability: rendering moved into src/screens; navigation/routes owns page guards, selected dock and parent destinations (including Android Back). sessionActions owns the transition lock and GPS rollback/cleanup; reconcileSession and useSessions distinguish live foreground return from cold recovery and fence stale refreshes. Recovered GPS sessions require review rather than offering unsupported Resume. Existing appearance and domain rewards are preserved. Approved steps 1–2 only; steps 3–5 deferred. Contract and evidence: NAVIGATION-SESSION-STABILITY.md.

2026-10-11 character-loading step 3: RootLayout warms sprite assets without blocking startup; SpriteFrames onLoad remains the decode authority. spriteLoading and SpriteScene preserve a complete prior bank during same-scene pose changes, retain static loaded frames on failure, and use terminal generation-guarded retries for body and wave. Failure/retry is shown below the fixed 238 dp scene. Character geometry/art and saved data remain unchanged. UI polish and broader regression work (steps 4–5) remain deferred. See CHARACTER-LOADING.md.
