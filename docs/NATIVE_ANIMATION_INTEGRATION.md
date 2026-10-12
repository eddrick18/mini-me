# Native animation integration

Status: implemented first-flow adapter on 10 October 2026; release verification is incomplete. See FIRST_FLOW.md for exact evidence.

SpriteScene in src/platform/animation renders bundled whole-frame atlases using measured JSON rectangles and clipped offsets. It supports idle, all five activities and celebration. Running selects windbreaker, shoes and headphones automatically. The original Rive compatibility route remains available independently; this sprite implementation does not author or synchronize a Rive character.

One frame scheduler owns character playback. Effects stop on unmount, background, paused session or reduced motion. Cloud and leaf motion use native Animated loops and stop under the same motion policy. Celebration plays at most two cycles after the session transaction succeeds. Loading and image failure preserve stage bounds; a readable fallback includes Retry character. Animation never awards XP.

React Native park primitives use the shared muted palette. The stage has a common character baseline and remains behind all UI actions. Draft frame consistency, halos and sampling require further device polish.

Android startup and user-operated Running session flow passed. Browser motion/still/recovery and save behavior passed. Required release checks remain: all native poses and clock/lifecycle cases, forced image failure/retry, OS reduced motion, screen-reader and text scaling, iPhone 11, frame pacing, memory and battery. Screenshots and SQLite evidence are documented in FIRST_FLOW.md. No new paid plan is required for this adapter.
