# Data and consistency proposal

Recommended v1 owner is a local profile UUID; no cloud identity. SQLite is authoritative. UTC timestamps use integer epoch milliseconds locally; cloud uses timestamptz. Use IANA timezone strings and retain reward-day keys. Foreign keys enabled; versioned migrations and parameterized queries required.

| Entity | Key and important fields | Constraints/indexes |
|---|---|---|
| profiles | id, display_name, created_at | One selected local profile in v1 |
| settings | profile_id, timezone, reduced_motion, schema_version | FK; validated timezone |
| character_preferences | profile_id, skin/hair/outfit/accessory IDs, version | FK; owned/allowed choices only |
| activity_sessions | UUID, owner, activity, source, status, start/end UTC, active duration, activity timezone/date, revision | Enum checks; duration ≥0; owner+start index; one active/paused per owner |
| session_pauses | UUID, session_id, start/end | End ≥ start; no overlapping intervals |
| xp_awards | UUID, owner, session_id, xp, rule_version, reward_day, awarded_activity, award_time | Unique owner+session; positive XP; owner+reward_day index |
| progression_state | owner, cumulative_xp, level, ledger_version | Rebuildable cache from receipts; never a free-form write |
| unlocks | owner, unlock_id, awarded_at, cause_receipt | Unique owner+unlock; FK |
| schema_migrations | version, applied_at | Unique ordered version |

No goals or pending sync table in recommended v1. A deleted activity leaves only a pseudonymous session UUID and minimal award metadata (XP/day/category/rule); sensitive details are removed. Receipt does not require a surviving session FK: either reference a minimal session identity table or use a validated historical identifier, chosen during schema implementation. Full reset removes all receipts and earned progress by explicit confirmation.

Completion uses one transaction: verify state/version → compute active duration → inspect day budget → insert unique award → update cache/unlocks → finish session. Serialize writers; rollback all on failure. Zero-XP completions remain in history. Retry returns existing completion/receipt. Import validates version, size, IDs, constraints, and ledger totals before atomic replacement; export includes a schema/rule manifest. Recommend replace-only import in v1, with a pre-import backup and clear confirmation, rather than ambiguous merges.

Cloud alternative: owner FK to auth.users; RLS indexes on every owner field. PostgreSQL transactions lock an owner progression/budget row before award calculations. Client cannot write receipts/progression/unlocks directly. RLS plus grants cover direct REST/RPC paths. See SECURITY for execution context. Dual-store adds the outbox and tombstones described in ARCHITECTURE; no automatic synchronization promised.

Migrations: additive first, transactional where supported, preserve a verified backup before risky changes. Test old fixture → new schema and failure rollback. Never silently wipe the database to resolve an error.
