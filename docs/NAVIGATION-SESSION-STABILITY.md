# Navigation and session stability

Approved scope: steps 1 and 2 of the stability plan on 2026-10-11. Character preloading/retry improvements, UI polish and a broader regression-check program (steps 3–5) remain deferred. Existing character rendering, geometry, tokens and visual appearance are preserved.

## Structure and ownership

app/index.tsx owns the application shell, committed reward presentation and coordination. src/screens contains Home, activity picker, current session, finish review, reward, activity history and Settings rendering. Existing quest, wardrobe, room, inventory and achievement components remain their feature owners. appStyles preserves the existing styles; formatting is shared through sessions/format. Screens receive only the fields and callbacks they use.

navigation/routes owns valid page names, fallback guards, tab selection, dock visibility and parent destinations. Missing session/reward data falls back to Home rather than leaving an empty screen; trying to open the activity picker with an existing session returns to that session. Android hardware Back matches explicit parent destinations and is consumed while an action is pending. Back from Finish returns to the paused session; wardrobe/room returns to Inventory, and badge/history returns to Progress. Changing pages does not pause ordinary sessions or change saved data. Inventory draft cancellation remains as previously documented.

## Session actions and lifecycle

sessionActions owns one lock across start, permission, GPS startup, pause/resume, review and save. Failed persistence preserves current records. Failed GPS startup pauses the committed session and attempts provider cleanup before allowing retry. A failed cleanup leaves a visible stop/retry message; distance cannot accrue to a paused/saved session. Finishing always commits before reward feedback and never saves a duplicate ID. No new XP or distance rules are introduced.

useSessions retains the existing store/write owner. reconcileSession distinguishes a fresh runtime from a live foreground return: ordinary timed sessions continue across live background/foreground transitions; a cold restart requires duration review. Healthy native background GPS remains running. When GPS has stopped, current persisted state is reread after provider shutdown; an Expo Go pause is preserved, while a still-running abandoned session becomes interrupted and requires review. Interrupted sessions expose Finish/review rather than a Resume action that domain rules reject.

Foreground return refreshes local state. GPS polling runs only while foreground and no session action is pending, avoids overlapping polls, and cleans up on lifecycle changes. Refresh reads use request tickets and mutation revisions so older reads/errors cannot overwrite a later committed change. Refresh interruption failures remain visible and can be retried. The existing wall/monotonic clock, paused-time exclusion, duration review and SQLite GPS transactions remain authoritative.

## Validation

Focused tests in session-lifecycle.test.ts cover page guards/parents, overlapping starts, failed GPS startup, failed writes/provider cleanup, pause exclusion, once-only save, recovered-session review, live/cold lifecycle behavior and an already-committed Expo Go pause. These checks are necessary verification of steps 1–2; the broader step 5 work is not implemented.

Physical iPhone GPS foreground return and Android hardware Back require device confirmation. Browser checks cannot establish native GPS background behavior or measured-route accuracy.

Completed validation: TypeScript and all 64 tests passed; web export passed; strict scoped UI audit returned no findings. DESIGN.md lint has no errors and five existing token schema warnings. Expo iOS bundle returned HTTP 200. Browser checks passed for active-session navigation, paused time preservation through Inventory/Wardrobe Back, resume/review, review Back remaining paused, single-entry save/history, cold restart and reviewed recovery save at 390 × 844. No browser errors captured. Recovery screenshot: artifacts/session-recovery-preview.png. Native provider behavior is tested with injected fakes; physical iPhone GPS return and Android Back remain pending.

2026-10-11 physical iPhone verification (user reported, Expo Go): Studying timer includes time after switching apps; paused time stays fixed across Home/Progress navigation; saving creates exactly one history entry; Walking / Running pauses after locking the phone and Resume restarts the timer. All four requested checks passed. This confirms the reported session lifecycle flow, not measured-route accuracy, native background-build behavior, or Android hardware Back. Steps 3–5 remain deferred.
