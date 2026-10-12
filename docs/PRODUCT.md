# Product proposal

Status: offline-only scope and progression rules approved on 2026-10-10. Visual direction and final reward artwork await review.

## Experience and scope

Home shows character, overall level, XP to next level, and today's summary. Choose studying, working, gym, running, or music; start/pause/resume/finish a session or log a completed activity. Completion displays awarded XP and any visible unlock. History supports viewing, correcting, and deleting records. Character customization offers a small initial set of skin tones, hair, clothing colors, and earned accessories. Settings include timezone, reduced motion, export/import, and delete-all-data.

No account required in recommended v1. GPS walking/running is now included; no health/music integrations, social features, payments, AI, public profiles, notifications, goals, or multiplayer. Music is self-reported enjoyment; rest is welcome, with no streak penalties or lost levels.

## Proposed progression, version 1

All five activities use equal reward rules. A completed activity with at least 5 active minutes earns 20 XP; at least 20 active minutes earns 30 XP total. Shorter sessions remain valid history with no XP. Manual logging follows the same rules. These thresholds are proposals to review, not claims about the value of an activity.

Reward at most the first two qualifying completions per activity per reward day, with a global 120 XP/day ceiling. A single category can earn up to 60 XP/day and reach every overall level eventually. Duration above 20 minutes does not increase XP. Continuing after the cap still records activity and plays its animation. No bonus for completing every category. Caps discourage minute farming; they do not limit API traffic.

Level starts at 1. Cumulative XP required for level L is 50 × (L−1) × L: levels 2/3/4/5 need 100/300/600/1000 XP. Level 2 unlocks a clothing palette, 3 a room decoration, 4 an accessory slot, 5 a celebration variant. Final designs need character review. Every five rewarded sessions in one activity unlocks that category's first prop: book, work desk detail, gym band, running shoes, or headphones. Activity props never gate overall leveling.

Edits and deletions preserve already-earned XP, levels, and unlocks. An awarded session's ID can never receive a second award; changing category does not transfer its earned identity credit. A previously unawarded session corrected to qualify can receive one award against today's cap. Deletion removes personal activity details but leaves a minimal reward receipt; settings explain this and offer a full reset that removes everything. Recreating a deleted report remains possible in a self-report personal app: do not introduce surveillance to prevent it.

Paused sessions earn nothing until finished; abandoned sessions earn nothing. Interrupted sessions require review before completion. At most one active/paused session. Completion and award commit together before celebration, and repeated taps reuse the same session ID.

## Time and daily boundaries

Store instants in UTC; record an IANA timezone (initial suggestion Asia/Manila), local activity date, and immutable reward-day key. History can be grouped in the chosen display timezone; reward receipts retain their original day. Reward day is the completion/award day, including backdated manual reports. A session spanning midnight receives one award on completion. Timezone changes apply to the next reward day; never recalculate past awards. Cloud rules, if selected, use trusted server time and an explicit timezone-change policy. Local clock tampering cannot be reliably prevented in offline-only mode.

## Decisions required

Approve offline-only versus cloud, reward thresholds/caps, edit policy, appearance scope, and visual direction. User has an iPhone; no physical Android device has been confirmed.

## Approved daily quests extension
The user approved daily quests on 10 October 2026, superseding the previous no-goals scope. Three fixed quests grant 10 XP each after claiming; these bonuses are separate from the existing 120 activity XP/day cap. See QUESTS.md for exact thresholds, expiry and persistence.

