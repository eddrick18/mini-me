import test from "node:test";
import assert from "node:assert/strict";
import {
  applyCommand,
  emptyLedger,
  elapsed,
  type Command,
  type Ledger,
} from "../src/domain/activity.ts";
import { createSessionActions } from "../src/features/sessions/sessionActions.ts";
import { reconcileSession } from "../src/features/sessions/reconcileSession.ts";
import {
  resolvePage,
  parentPage,
  selectedTab,
  showsDock,
} from "../src/navigation/routes.ts";
function harness() {
  let state = emptyLedger(),
    now = 1000,
    sequence = 0,
    failWrite = false,
    failGps = false,
    failStop = false;
  const errors: string[] = [],
    events: string[] = [];
  const execute = async (
    command: Command,
    at = now,
  ): Promise<Ledger | null> => {
    events.push(command.type);
    if (failWrite) return null;
    state = applyCommand(state, command, at);
    return state;
  };
  const actions = createSessionActions({
    read: () => state,
    execute,
    now: () => now,
    id: () => String(++sequence),
    requestGps: async () => {
      events.push("permission");
    },
    startGps: async () => {
      events.push("gps-start");
      if (failGps) throw new Error("GPS provider failed");
    },
    stopGps: async () => {
      events.push("gps-stop");
      if (failStop) throw new Error("stop failed");
    },
    onBusy: (value) => events.push(value ? "busy" : "idle"),
    onError: (message) => errors.push(message),
  });
  return {
    actions,
    errors,
    events,
    read: () => state,
    setTime: (value: number) => (now = value),
    setWriteFailure: (value: boolean) => (failWrite = value),
    setGpsFailure: (value: boolean) => (failGps = value),
    setStopFailure: (value: boolean) => (failStop = value),
  };
}
test("navigation guards stale session screens and maps Back to the owning destination", () => {
  assert.equal(resolvePage("finish", false, false), "home");
  assert.equal(resolvePage("session", false, false), "home");
  assert.equal(resolvePage("picker", true, false), "session");
  assert.equal(resolvePage("reward", false, false), "home");
  assert.equal(parentPage("finish"), "session");
  assert.equal(parentPage("achievement"), "weekly");
  assert.equal(parentPage("wardrobe"), "inventory");
  assert.equal(selectedTab("history"), "weekly");
  assert.equal(showsDock("finish"), false);
});
test("GPS start failure preserves a paused session and restores the action lock", async () => {
  const h = harness();
  h.setGpsFailure(true);
  assert.equal(await h.actions.start("Running"), null);
  assert.equal(h.read().active?.status, "paused");
  assert.match(h.errors[0]!, /GPS provider failed/);
  h.setGpsFailure(false);
  h.setTime(5000);
  await h.actions.toggle();
  assert.equal(h.read().active?.status, "running");
  assert.equal(h.read().active?.segmentAt, 5000);
  assert.equal(h.events.at(-1), "idle");
});
test("overlapping permission/start actions cannot create another session", async () => {
  let state = emptyLedger(),
    release!: () => void,
    starts = 0;
  const permission = new Promise<void>((resolve) => (release = resolve));
  const actions = createSessionActions({
    read: () => state,
    execute: async (c) => {
      state = applyCommand(state, c, 1000);
      return state;
    },
    now: () => 1000,
    id: () => String(++starts),
    requestGps: () => permission,
    startGps: async () => {},
    stopGps: async () => {},
    onBusy: () => {},
    onError: () => {},
  });
  const pending = actions.start("Running");
  assert.equal(await actions.start("Studying"), null);
  assert.equal(state.active, null);
  release();
  const committed = await pending;
  assert.equal(starts, 1);
  assert.equal(committed?.active?.activity, "Running");
});
test("failed pause leaves provider alone; failed provider stop preserves committed pause and totals", async () => {
  const h = harness();
  await h.actions.start("Running");
  h.setTime(11000);
  h.setWriteFailure(true);
  assert.equal(await h.actions.toggle(), null);
  assert.equal(h.read().active?.status, "running");
  assert.ok(!h.events.includes("gps-stop"));
  h.setWriteFailure(false);
  h.setStopFailure(true);
  await h.actions.review();
  assert.equal(h.read().active?.status, "paused");
  assert.equal(h.read().active?.activeMs, 10000);
  assert.match(h.errors.at(-1)!, /Session paused/);
});
test("ordinary sessions preserve timing across navigation, exclude pauses and save once", async () => {
  const h = harness();
  await h.actions.start("Studying");
  h.setTime(301000);
  await h.actions.review();
  h.setTime(901000);
  assert.equal(elapsed(h.read().active!, 901000), 300000);
  await h.actions.toggle();
  h.setTime(1801000);
  await h.actions.review();
  await h.actions.save();
  await h.actions.save();
  assert.equal(h.read().sessions.length, 1);
  assert.equal(h.read().sessions[0]!.activeMs, 1200000);
  assert.equal(h.read().sessions[0]!.xp, 30);
});
test("failed save retains paused session for retry, and interrupted sessions cannot resume", async () => {
  const h = harness();
  await h.actions.start("Music");
  await h.actions.review();
  h.setWriteFailure(true);
  assert.equal(await h.actions.save(), null);
  assert.equal(h.read().sessions.length, 0);
  assert.equal(h.read().active?.status, "paused");
  h.setWriteFailure(false);
  await h.actions.save();
  assert.equal(h.read().sessions.length, 1);
  let recovered = applyCommand(
    emptyLedger(),
    { type: "start", id: "recovered", activity: "Running" },
    1000,
  );
  recovered = applyCommand(
    recovered,
    { type: "interrupt", id: "recovered" },
    2000,
  );
  let writes = 0;
  const a = createSessionActions({
    read: () => recovered,
    execute: async () => {
      writes++;
      return recovered;
    },
    now: () => 3000,
    id: () => "",
    requestGps: async () => {},
    startGps: async () => {},
    stopGps: async () => {},
    onBusy: () => {},
    onError: () => {},
  });
  assert.equal(await a.toggle(), null);
  assert.equal(writes, 0);
});
test("cold restart requires review, live non-GPS return continues, healthy background GPS stays running", async () => {
  const running = applyCommand(
    emptyLedger(),
    { type: "start", id: "one", activity: "Studying" },
    1000,
  );
  const execute = async (c: Command) => applyCommand(running, c, 6000);
  assert.equal(
    (await reconcileSession(running, false, async () => false, execute)).active
      ?.status,
    "running",
  );
  assert.equal(
    (await reconcileSession(running, true, async () => false, execute)).active
      ?.status,
    "interrupted",
  );
  const gps = applyCommand(
    emptyLedger(),
    { type: "start", id: "gps", activity: "Running" },
    1000,
  );
  assert.equal(
    (
      await reconcileSession(
        gps,
        true,
        async () => true,
        async (c) => applyCommand(gps, c, 6000),
      )
    ).active?.status,
    "running",
  );
  assert.equal(
    (
      await reconcileSession(
        gps,
        false,
        async () => false,
        async (c) => applyCommand(gps, c, 6000),
      )
    ).active?.status,
    "interrupted",
  );
});
test("foreground return waits for provider shutdown and preserves an already committed Expo Go pause", async () => {
  const gps = applyCommand(
      emptyLedger(),
      { type: "start", id: "gps", activity: "Running" },
      1000,
    ),
    paused = applyCommand(gps, { type: "pause", id: "gps" }, 6000);
  let writes = 0;
  const result = await reconcileSession(
    gps,
    false,
    async () => false,
    async () => {
      writes++;
      return paused;
    },
    async () => paused,
  );
  assert.equal(writes, 0);
  assert.equal(result.active?.status, "paused");
  assert.equal(result.active?.activeMs, 5000);
});
