import type { Command, Ledger } from "../../domain/activity.ts";
export async function reconcileSession(
  state: Ledger,
  coldStart: boolean,
  gpsRunning: () => Promise<boolean>,
  execute: (command: Command) => Promise<Ledger>,
  reload: () => Promise<Ledger> = async () => state,
): Promise<Ledger> {
  const active = state.active;
  if (active?.status !== "running") return state;
  // Ordinary timed sessions continue while this runtime is alive. A fresh runtime requires review.
  if (active.gps) {
    if (await gpsRunning()) return state;
    const latest = await reload();
    if (latest.active?.id !== active.id || latest.active.status !== "running")
      return latest;
    return execute({ type: "interrupt", id: active.id });
  }
  return coldStart ? execute({ type: "interrupt", id: active.id }) : state;
}
