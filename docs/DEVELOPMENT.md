# Windows and device development

## Actual discovery, 2026-10-10

Repository has no commits and initially only .git; no applicable AGENTS.md found in workspace or inspected ancestor directories. No package manifest or existing app. This table preserves initial discovery; the implementation update below records subsequent changes.

| Tool | Observed result |
|---|---|
| Node/npm | 24.18.1 / 11.16.0 |
| Java | JDK 17.0.12 |
| VS Code | CLI returned 1.141.0 and extension inventory, with sandbox EPERM warnings; full health not established |
| Editor extensions | React Native Tools present; Expo Tools not in returned inventory |
| Android SDK | ANDROID_HOME points to existing LocalAppData Android/Sdk |
| SDK platforms | 31 and 35 present; required proposed Platform 36 missing |
| Build tools | 31.0.0, 35.0.0, 35.0.1, 36.0.0 |
| adb | 35.0.2; not on current PATH, works by absolute path |
| Emulator | 35.5.10; Pixel_4 listed; not launched |
| AVD | Targets android-36, x86_64; actual image boot viability unverified |
| CMake/NDK | 3.22.1 / 27.1.12297006; may not match resolved native build |
| Rive CLI | 1.5.1; not logged in |
| Figma | Authenticated; View seat; intended file permissions unverified |

## Native proof after approval

Use npm; retain current Node/JDK initially. Verify Android Studio installation, hardware virtualization, SDK licenses, system image, free disk space, Platform 36, and resolved Gradle/CMake/NDK requirements before downloading anything. Platform 36 is required by Expo SDK 56; an AVD configuration is not evidence the image is installed. Android Studio SDK Manager is the preferred user setup path.

Current workspace is a long OneDrive path. Rive docs identify Windows CMake long-path failures and suggest newer CMake. First evaluate path/build behavior; a short local checkout such as C:\dev\mini-me may help, but it lies outside current write permissions and must not be created without the appropriate authorization. Do not move/delete the existing repository. OneDrive may also contend with generated files.

Proposed commands once scaffold/dependencies/configuration exist (not run in discovery):

```powershell
npm ci
npx expo install --check
npx expo-doctor
& "$env:ANDROID_HOME\emulator\emulator.exe" -avd Pixel_4
npx expo run:android
npx expo start --dev-client
```

First native build uses run:android; later JS/TS changes use Metro/Fast Refresh. Native dependency, plugin, asset packaging, or native configuration changes require another native build. Open folder in VS Code, use integrated terminal, and view the actual app in Android Emulator. React Native Tools is optional; no further extension required for first preview. Web layout preview is optional and uses a `.web.tsx` static character fallback, isolated from `.native.tsx` Rive imports. It cannot verify native timers/lifecycle/rendering. Radon is not recommended or relied on; support was not evaluated.

Troubleshooting: missing adb → use verified SDK path/PATH; emulator absent → check image/AVD/virtualization; native module missing → rebuild development client; Metro connection failure → confirm emulator network/firewall before using tunnels; CMake path failure → consult Rive Windows guidance and short-path option; cache reset only after identifying stale-cache evidence. Never fix build errors by deleting personal data.

## iPhone

User has an iPhone. Windows has no local Xcode/iOS Simulator. EAS cloud development build can produce a signed device build; it requires an Expo account, Apple signing setup, registered device, and normally Apple Developer Program membership. Mac/Xcode is the alternative for local iOS builds/simulator. User reports iPhone 11 / iOS 26.6 with no known paid developer membership. Physical iPhone verification and signing remain pending.

Apple lists enrollment at US$99/year (regional variation); EAS has limited free usage and paid tiers. Check current account quota and regional terms before a build or purchase; no paid action authorized. An Android emulator demo can proceed while iPhone signing is unresolved, but real-device Rive acceptance remains open.

Sources: [Expo environment](https://docs.expo.dev/get-started/set-up-your-environment/), [development builds](https://docs.expo.dev/develop/development-builds/introduction/), [SDK matrix](https://docs.expo.dev/versions/v56.0.0/), [Rive Windows troubleshooting](https://rive.app/docs/runtimes/react-native/react-native), [Apple membership](https://developer.apple.com/help/account/basics/about-your-developer-account), [EAS pricing](https://expo.dev/pricing).

## Implementation update, 2026-10-10

Expo 57.0.27 / React Native 0.86.3 installed, aligned by Expo CLI; Doctor passes 21/21 checks. Pixel_4 API 36 x86_64 emulator booted successfully. SDK Platform 36 and NDK 27.0.12077973 were installed during Gradle preparation; SDK57 resolves NDK27.1.12297006. Rive0.5.4 and Nitro0.36.5 are pinned.

Run npm start, then npm run android. The build script invokes the Gradle wrapper JAR directly through JDK17 with UTF-8 to avoid gradlew.bat Unicode-path corruption. It requests CMake3.31.6 for Windows. The original path failed first in the batch wrapper, then in Ninja Unicode handling. Temporary drive substitution failed because autolinking canonicalized paths to different drives. The final script builds a copy under TEMP/mini-me-native-build, leaving workspace files here. CMake3.31.6 is downloaded from the official Kitware release and verified against its published SHA256; its location is scoped to the temporary build. The APK built successfully; repeated cached build passed in11seconds. Upstream deprecation/path warnings remain, so verify future toolchain changes. No path-check override is needed in the successful copy.

The browser preview at http://localhost:8081 uses static poses. Native Rive requires a development APK. This is a compatibility screen, not the session/SQLite implementation.



Startup evidence: the first Android launch was blocked by the emulator lock screen; user unlocked it. Metro initially bound to ::1, while ADB reverse uses127.0.0.1. scripts/start.ps1 sets IPv4-first DNS for Metro without changing system settings. Cold start then loaded the Android bundle and rendered the native character; the user confirmed three pose/still controls work. The prototype APK is saved under artifacts/mini-me-preview.apk. This debug APK requires Metro and is not the offline release build.
