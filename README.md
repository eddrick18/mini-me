# Mini Me activity companion

Native first activity flow implemented and Android-tested, 10 October 2026.

A personal mobile companion where studying, working, gym, running, and music contribute to a growing animated character. Earned levels persist through breaks.

## Recommended first version

Expo, React Native, TypeScript, Expo Router, Rive native development build, and Expo SQLite. Personal, offline-only, one device at a time, with explicit export/import backup. The user approved this scope. The approved taller pixel companion and running outfit are integrated; additional customization remains pending.

Offline-only is simpler than accounts plus a cloud backend. Online-only avoids synchronization but adds authentication, network failures, backend security, and ongoing service setup. Offline plus cloud is the most complex option because it requires explicit synchronization.

## Review path

1. [Product and progression](docs/PRODUCT.md)
2. [Architecture and alternatives](docs/ARCHITECTURE.md)
3. [Milestones and acceptance](docs/ROADMAP.md)
4. [Verified environment and proposed startup](docs/DEVELOPMENT.md)
5. [Open decisions](docs/DECISIONS.md)

Supporting documents: [design](docs/DESIGN.md), [character](docs/CHARACTER.md), [data model](docs/DATA_MODEL.md), [security and limits](docs/SECURITY.md), [testing](docs/TESTING.md), [progress](docs/PROGRESS.md), and [release planning](docs/RELEASE.md).

The root app now records activities and XP offline with SQLite, animated whole-frame sprites, timer controls, history and still poses. Run npm start for Metro and npm run android for the development build/install. The earlier Rive compatibility proof remains at /compatibility. See docs/FIRST_FLOW.md for verified behavior and remaining iPhone/release work; backup, skin/hair customization and accessories remain pending. Wardrobe starter outfits and level-2 clothing colors are implemented; see docs/WARDROBE.md.





Local backup/import is now implemented in Settings, superseding the earlier pending status. See [backup and recovery](docs/BACKUP.md).

Home now includes daily quests with up to 30 bonus XP/day. See [quest rules and verification](docs/QUESTS.md).

Home now has a customizable room, and each activity has its own pixel environment. See [rooms and verification](docs/ROOMS.md) and [art prompts](docs/WORLD-ART.md).

Game sounds, separate vibration preferences and Weekly progress are implemented. Sound starts muted. See [feedback and weekly progress](docs/FEEDBACK-PROGRESS.md).

Home is now simpler, with a bottom navigation dock for Home, Quests, Inventory, Progress and Settings. See [navigation](docs/NAVIGATION.md).

Walking / Running background GPS setup, XP rules and device verification: [docs/GPS.md](docs/GPS.md). Background mode requires a native development build; Expo Go supports foreground GPS. Safari cannot record distance.

Free iPhone testing with Expo Go: run npm run start:go, open exp://10.0.0.39:8082 on the same Wi-Fi. Walking / Running records only with Mini Me visible and the screen unlocked; it pauses when backgrounded. No Apple Developer membership is needed for this Expo Go mode.

