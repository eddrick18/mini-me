# Game feedback and weekly progress

Sound effects are off by default; vibration is on. Separate persisted Settings toggles and test buttons control both. Legacy saves/backups get these defaults. Version-3 backups retain the optional feedback preferences; corrupt values are rejected. Existing XP rules and records are unchanged.

Original offline WAV cues are synthesized by scripts/build-feedback-audio.py (no licensed samples): ascending XP/quest/level chimes and a soft descending sigh. Cues only fire after a successful save/claim. A level-up cue takes priority over the ordinary reward cue. Equipping clothing and room saves use light haptics. Failed writes, reopening, and idle frames do not replay rewards. Foreground-only playback stops on backgrounding or muting; native silent mode is respected and playback mixes with music. Requests are throttled and unsupported vibration/playback failures do not block saving. Native playback uses Expo Audio and Expo Haptics; web uses HTML audio and supported browser vibration. No microphone/recording/background-playback capability is enabled. iPhone Safari does not provide vibration; browser autoplay policies may require Test sound.

Weekly progress shows the latest seven Manila calendar days ending today, with previous/next seven-day navigation while older records exist. Totals include saved active time (even for 0-XP sessions), activity XP and quest bonus XP separately. Ongoing sessions and paused time are excluded. Each chart column has an accessible date/time/activity/XP label. Empty weeks offer a start action and no rest-day penalty. This screen is read-only.

## Verification

TypeScript and 22 regression tests pass, including Manila midnight, zero-XP time, previous-week aggregation, preference migration, malformed preference rejection and backup round trip. Web export succeeds. Browser 390×844 checks confirm populated/empty weekly screens, totals, navigation/start action, Settings toggles, disabled test controls and persistence after reload. The sound test control was exercised without runtime errors; audible playback and physical vibration require device confirmation. Native build verification is recorded in PROGRESS.md.

Android native build completed and installed successfully. Startup was visually verified with existing records retained. Native audio/haptic interaction and physical iPhone sound confirmation remain pending. See artifacts/feedback-android.png.
