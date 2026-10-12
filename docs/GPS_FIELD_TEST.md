# iPhone GPS field test

Status: user confirmed foreground tracking on iPhone 11 in Expo Go on 2026-10-10. Screenshot shows 0.07 km route distance, 2:11 active time, 1:52 estimated moving time, 5 m displacement, two route breaks and five seconds excluded as uncertain. Saving/history persistence has not been confirmed for this session. This establishes acquisition and session timing, not distance accuracy.

## First measured trial

Use a route with an independently known length. A marked 400 m athletics track is convenient: follow the marked measurement path in lane 1 for one full lap. Do not assume an arbitrary park loop is 400 m or use another GPS app as ground truth. If no measured route is available, report the route you can use before treating its length as a reference.

1. Reload Mini Me in Expo Go. Keep the app visible and screen unlocked throughout this test.
2. Start a fresh Walking / Running session at the marked start. Wait stationary until the status indicates GPS ready/tracking. Record the displayed distance before walking.
3. Walk one full measured lap at a normal pace, staying on the same path. Do not pause, lock the phone or switch apps.
4. At the starting mark, immediately tap Finish. Record route distance, active time, moving time, displacement, route breaks and uncertain time. The final displacement should be near the start, while route distance should reflect the full lap.
5. Save, open activity history and check the distance matches the finish screen. Reopen the app and check the entry remains. A 400 m session earns zero XP under the current rule.
6. Send the finish screenshot and confirm the reference route length and whether history retained the result.

One trial is diagnostic. Repeat three times on the same measured path before summarizing bias or consistency. Do not silently discard poor-GPS trials: record their quality status and breaks separately. Avoid changing filters between repeats.

## Results

| Trial | Reference metres | Distance at walking start | Finished distance | Active time | Moving time | Breaks / uncertain time | Saved and retained |
| --- | --- | --- | --- | --- | --- | --- | --- |
| First phone smoke check | Unknown | Unknown | 0.07 km displayed | 2:11 | 1:52 | 2 / 0:05 | Pending |
| Measured lap 1 | Pending | Pending | Pending | Pending | Pending | Pending | Pending |
| Measured lap 2 | Pending | Pending | Pending | Pending | Pending | Pending | Pending |
| Measured lap 3 | Pending | Pending | Pending | Pending | Pending | Pending | Pending |

For route distance D and independently measured length L: signed error = D − L; relative error = 100 × (D − L) / L. If only the rounded kilometre display is available, label results approximate; do not invent metre precision. Starting stationary drift is recorded separately from the walking interval. These exploratory trials do not establish a product-wide accuracy guarantee.

## Follow-up checks

After the uninterrupted lap, separately test a stationary two-minute session, a deliberately paused walk, and background/return with explicit Resume in Expo Go. Keep those results separate from the uninterrupted accuracy trials. Native screen-locked tracking requires a native development build and is not part of this Expo Go test.
