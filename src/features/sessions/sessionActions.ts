import type { Activity, Command, Ledger } from "../../domain/activity.ts";
type Dependencies = {
  read: () => Ledger | null;
  execute: (command: Command, now?: number) => Promise<Ledger | null>;
  now: () => number;
  id: () => string;
  requestGps: () => Promise<void>;
  startGps: () => Promise<void>;
  stopGps: () => Promise<void>;
  onBusy: (busy: boolean) => void;
  onError: (message: string) => void;
};
// One operation owns permission, persistence and provider transitions together.
export function createSessionActions(d: Dependencies) {
  let locked = false;
  const run = async <T>(work: () => Promise<T>): Promise<T | null> => {
    if (locked) return null;
    locked = true;
    d.onBusy(true);
    try {
      return await work();
    } catch (e) {
      d.onError(
        e instanceof Error
          ? e.message
          : "The session could not change. Please retry.",
      );
      return null;
    } finally {
      locked = false;
      d.onBusy(false);
    }
  };
  const beginGps = async (state: Ledger) => {
    try {
      await d.startGps();
      return state;
    } catch (e) {
      const paused = await d.execute(
        { type: "pause", id: state.active!.id },
        d.now(),
      );
      if (!paused)
        throw new Error(
          "GPS could not start and the session could not pause. Retry Pause before continuing.",
        );
      try { await d.stopGps(); } catch {
        throw new Error('GPS could not start. Session paused, but tracking could not stop. Retry stopping GPS.');
      }
      throw e;
    }
  };
  const pause = async (state: Ledger) => {
    const active = state.active;
    if (!active) return null;
    const paused =
      active.status === "running"
        ? await d.execute({ type: "pause", id: active.id }, d.now())
        : state;
    if (paused && active.gps)
      try {
        await d.stopGps();
      } catch {
        d.onError(
          "Session paused, but GPS could not stop. Retry stopping GPS. Paused distance will not count.",
        );
      }
    return paused;
  };
  return {
    start: (activity: Activity) =>
      run(async () => {
        if (d.read()?.active)
          throw new Error(
            "Return to your current session before starting another.",
          );
        if (activity === "Running") await d.requestGps();
        const state = await d.execute(
          { type: "start", id: d.id(), activity },
          d.now(),
        );
        return state && activity === "Running" ? beginGps(state) : state;
      }),
    toggle: () =>
      run(async () => {
        const state = d.read(),
          active = state?.active;
        if (!state || !active) return null;
        if (active.status === "interrupted")
          throw new Error("Review the recovered session before saving.");
        if (active.status === "running") return pause(state);
        if (active.gps) await d.requestGps();
        const resumed = await d.execute(
          { type: "resume", id: active.id },
          d.now(),
        );
        return resumed && active.gps ? beginGps(resumed) : resumed;
      }),
    review: () =>
      run(async () => {
        const state = d.read();
        return state ? pause(state) : null;
      }),
    save: (confirmedMs?: number) =>
      run(async () => {
        const active = d.read()?.active;
        if (!active) return null;
        const state = await d.execute(
          {
            type: "finish",
            id: active.id,
            ...(confirmedMs !== undefined ? { confirmedMs } : {}),
          },
          d.now(),
        );
        if (state && active.gps)
          try {
            await d.stopGps();
          } catch {
            d.onError(
              "Session saved, but GPS could not stop. Retry stopping GPS. Saved distance will not change.",
            );
          }
        return state;
      }),
    retryGps: () =>
      run(async () => {
        if (d.read()?.active?.status !== "running") return;
        await d.requestGps();
        await d.stopGps();
        const state = d.read();
        if (state?.active?.gps && state.active.status === "running")
          await beginGps(state);
      }),
    stopGps: () => run(d.stopGps),
  };
}
