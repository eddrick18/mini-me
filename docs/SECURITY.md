# Scoped security and rate-limit plan

## Recommended local version

Threats: lost/shared phone, sensitive activity exports, invalid import, accidental duplicate awards, corrupt/migrated storage, misleading clock changes. OS app sandbox protects ordinary local access; SQLite is not assumed encrypted or tamper-proof. No claim that offline self-reports are verified. Avoid sensitive notes by default, analytics, credentials, and activity payloads in logs. Validate all inputs and imports, parameterize SQL, use constraints and atomic awards. Export only on explicit action; warn that exported files contain personal history. Delete-all confirmation explains irreversibility. Device backup behavior must be documented and tested before release; do not promise OS backups or secure deletion from existing external backups.

No network endpoint limits are needed for local screens, timers, previews, or local records. Package downloads, Figma and Rive are development services, not application endpoints. Respect their errors and cooldowns; no polling storms.

## If accounts/cloud are approved

Supabase Auth handles identity; PostgreSQL stores user-owned records. No Storage until user-uploaded assets or server export files require it. Bundle character assets. Prefer transactional PostgreSQL reward functions over separate Edge reward logic. Edge Functions are justified for administrative deletion/export orchestration requiring secret credentials.

Store refresh credentials using an appropriate Expo SecureStore adapter; verify storage limits and platform behavior. Start/stop Auth refresh with app lifecycle, handle revoked/expired sessions, clear credentials on sign-out, stop pending uploads, and isolate cached account data. Use verified deep-link allowlists and recovery flow; no anonymous accounts by default.

RLS binds ownership to validated auth identity, never submitted owner IDs. Default-deny grants; authenticated users may read their own receipts but cannot insert/update XP/unlocks. Sensitive writes go through narrowly granted authenticated wrappers. Prefer SECURITY INVOKER; if definer privileges are necessary, keep implementation in a private non-exposed schema, pin empty search_path, qualify names, revoke PUBLIC execution, grant only required wrapper access, and check auth.uid() explicitly. Limited interfaces must be the only write path: revoke direct table mutations that bypass limits. Test with anon, two users, and direct REST/RPC attempts.

Edge endpoints verify JWT validity and authorization explicitly, derive owner from identity, and constrain every service-role query by owner. Never assume a gateway setting alone establishes authorization. Secrets remain server-side; EXPO_PUBLIC and publishable keys are public configuration. TLS required. Separate development/production projects and credentials. Sanitized logs retain operation IDs/status, not tokens or personal payloads. Server checks enforce reward rules but cannot prove exercise/study occurred.

## Proposed application control matrix (cloud only)

All thresholds below are proposals; not provider defaults. Mutating RPCs use a durable PostgreSQL fixed-window budget table keyed by owner+operation+window, atomic upsert/row locks, and a server clock. Parallel requests consume one serialized budget. Idempotent replay returns its previous result without another award; it still counts against a generous request budget. Test boundary/parallel traffic and bypass attempts.

| Operation | Proposed threshold/window and scope | Enforcement and response |
|---|---|---|
| Login/signup/recovery | Provider-managed IP/user/project limits; recovery UI cooldown 60s | Supabase Auth; honor actual 429; client cooldown is UX only |
| Session completion/submission | 30/min and 300/day per user | Restricted DB wrapper; atomic limit + award; structured RATE_LIMITED/retry_after_seconds |
| Session update/delete | 60/min per user | Restricted DB wrapper; version and owner check, same error |
| XP award request | No independent endpoint; included in completion | Unique receipt + trusted calculation; award cap is separate |
| Cloud history reads | 120/min per user, pages ≤100 | Restricted paginated RPC if custom enforcement selected; revoke equivalent unlimited API reads |
| Settings/customization writes | 30/min per user | Restricted wrapper; validate unlocked IDs |
| Export | 3/hour per user, one running job/user | Edge + durable DB admission; payload/row ceiling; 429 + Retry-After |
| Account deletion | 1 accepted pending request/user; 3 attempts/hour | Recent reauthentication; idempotent Edge workflow and durable state |
| Expensive operations | None otherwise; require budget before introduction | Backend admission and concurrency cap |
| Future external APIs | Not included | Per-provider quota/cost analysis before feature approval |

For HTTP use 429 and Retry-After where controlled. RPC errors include a stable code and wait seconds; UI shows a friendly next-try time. Retry transient network/5xx with bounded exponential backoff and jitter; do not retry validation/ownership failures. Queue bursts are paced, not submitted all at once. Export/deletion holds a durable job lock, not a process-local variable. Anonymous attack traffic needs gateway/provider IP protections; any forwarded-IP scheme must trust only the controlled proxy.

Verified provider reference on 2026-10-10: built-in email provider has a project-wide 2-email/hour limit; recovery resend cooldown defaults to 60 seconds. [Supabase Auth limits](https://supabase.com/docs/guides/auth/rate-limits). These are not our reward limits. Inspect actual project settings before cloud testing; custom SMTP and public onboarding may require separate setup/cost review. [RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security).

Retention proposal: local records until user deletes; cloud history until user deletes/account deletion; minimal reward receipts until reset/account deletion. Export jobs expire within 24 hours if added. Hosted backup retention and deletion lag must be checked for the chosen plan and disclosed; do not promise immediate removal from backups.

## Prototype dependency audit, 2026-10-10

SDK57 audit reports28 aggregate packages (18 high,10 moderate), including dependents of four underlying advisories: braces stack exhaustion (GHSA-vfj7-8cjw-p6xm), decode-uri-component malformed URI DoS (GHSA-vcc3-ghjq-m6fr), node-forge RSA verification (GHSA-86w9-cpqp-85rv), and uuid buffer bounds (GHSA-w5hq-g745-h8pq). Saved report: artifacts/npm-audit.json. Aggregate count is not28 distinct flaws.

No forced audit fix was applied: npm proposes incompatible Expo/RN downgrades for parts of the dependency tree. The prototype uses no personal records and serves locally. This does not establish that every advisory is unreachable. Resolve or document reachability and verified compatible updates before public distribution; production is gated on that review.

GPS: only distance totals are stored in the ledger and backups. A transient single-coordinate checkpoint remains local during an active segment, and is deleted on pause/finish/interruption. Location permission is requested on Start/Resume; no coordinates are logged or sent to a server. See GPS.md.

## Proposed route-processing privacy controls (awaiting approval)

See [RUNNING_DISTANCE.md](RUNNING_DISTANCE.md). Raw routes are sensitive; engine approval is not permission to save or upload routes. Recommend local totals plus bounded transient raw/processed windows and a minimal atomic coordinate checkpoint cleared at session boundaries. Optional full-route diagnostics need explicit opt-in, ceilings and deletion enforcement. No coordinates in routine logs. Future cloud routes require token-derived ownership, default-deny RLS, restricted write paths, decompressed byte/sample ceilings, durable upload admission, idempotency, bounded retries and deletion of associated objects/jobs. Client routes cannot prove exercise. These controls are a design proposal; no cloud endpoint or expanded retention is implemented.

Running engine v2 uses a bounded accepted motion-window checkpoint plus segment endpoints, replacing the earlier single-coordinate checkpoint. Raw diagnostics are RAM-only; no full route retention or upload. Boundary/process-change cleanup clears transient coordinates. History/backups carry numeric summaries only.
