# Local backup and recovery

Settings exports a versioned Mini Me JSON file containing activities, XP, equipped appearance and still-pose preference. Native uses the system share sheet; web requests a browser download. These messages do not prove the user saved the file externally. Files are unencrypted and contain personal history; the user chooses their destination. No account or automatic cloud backup is involved.

Import accepts files up to 5 MB and 20,000 completed records. Format/version, reward-rule version, Asia/Manila day keys, IDs, durations, reward caps, summary totals and unlocked appearance are validated before preview. Validation does not establish authenticity: users can edit their own offline JSON. Unknown ledger fields are removed. Unsupported or corrupt files leave current records intact.

Preview shows current and incoming activity counts, XP, level and outfit. Cancel performs no write. Explicit replacement imports all records and preferences together; it does not merge them. Finish any current session before restoring. Exporting a running session snapshots it as interrupted with duration review required, without changing the running source or awarding XP.

SQLite stores replacement and the previous ledger in one exclusive transaction. Browser storage uses one atomic localStorage envelope, accepting legacy ledgers without reset. One recovery copy is kept until the next replacement; reviewing it is read-only and restoring it also requires confirmation. Uninstalling or clearing local storage can remove records and recovery; retain an exported file elsewhere.

Verification: TypeScript and 13 tests pass, including format/reward validation, running snapshots, replacement failure, active-session guards and browser atomic recovery. Web export succeeds; the actual downloaded six-record/120-XP snapshot was previewed, restored and recovered without changing its contents. Invalid-file UI rejection and persistence after reload pass. Android APK builds and installs successfully after disposable cache trimming; the user confirmed native export through the share sheet and file selection/import preview with cancellation. Native replacement/recovery transactions still need device verification. Physical iPhone file handling remains unverified.


Quest extension: new exports use format version 2 and preserve quest receipts in the ledger and total-XP summary. Version 1 files remain supported. See QUESTS.md.

Room extension: exports now use format version 3, preserving room slots and quest receipts. Versions 1 and 2 remain supported and gain empty rooms. Import preview names incoming decorations. See ROOMS.md.

Daily mood check-ins are an additive version 4 ledger field. Legacy files default to no check-ins. Canonical validation rejects duplicates, invalid moods and mismatched Manila dates. Export/import/recovery preserve check-ins; previews count them and identify unencrypted mood history.
