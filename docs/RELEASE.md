# Release planning boundary

No release configuration exists. Development preview uses an Expo native development client and Metro. Release-mode testing uses a signed/distributable native binary without Metro. Production publishing adds store metadata, policy/signing checks, and explicit publication authorization.

Use separate development/production identities/configuration if cloud is added; public configuration is never secret storage. Record lockfile, SDK/native toolchain, asset/contract hashes, schema/rules versions, signing requirements, and build IDs. Native runtime changes require rebuilt binaries; do not deliver incompatible assets or schema expectations through an update.

Before release: complete TESTING acceptance, prove backup restore and migration recovery, confirm asset licenses, verify current store rules and account costs, and review privacy/deletion/retention. Local data can disappear on uninstall; explain backup responsibility. Keep last known working binary and pre-migration backup; a binary rollback does not undo an incompatible schema. Prefer additive migrations and recover from tested exports rather than silently resetting user data.

Current authorization covers planning only. No store publication, hosted deployment, paid action, Rive account upload, or destructive operation authorized.
