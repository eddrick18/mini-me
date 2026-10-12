import test from "node:test";
import assert from "node:assert/strict";
import {
  initialSpriteLoad,
  spriteLoadReducer,
} from "../src/platform/animation/spriteLoading.ts";
import { createAssetWarmup } from "../src/platform/animation/assetWarmup.ts";
test("pose changes retain a complete bank and ignore stale callbacks", () => {
  let state = initialSpriteLoad({ pose: "idle", key: "idle-0" });
  state = spriteLoadReducer(state, { type: "ready", key: "idle-0" });
  state = spriteLoadReducer(state, {
    type: "request",
    bank: { pose: "studying", key: "studying-0" },
  });
  assert.equal(state.display?.pose, "idle");
  assert.equal(state.status, "loading");
  assert.equal(
    spriteLoadReducer(state, { type: "failed", key: "idle-0" }),
    state,
  );
  state = spriteLoadReducer(state, { type: "ready", key: "studying-0" });
  assert.equal(state.display?.pose, "studying");
});
test("partial loads stay static, failures are terminal and explicit retry has a fresh generation", () => {
  let state = initialSpriteLoad({ pose: "running", key: "running-0" });
  state = spriteLoadReducer(state, { type: "first", key: "running-0" });
  assert.equal(state.firstReady, true);
  assert.equal(state.status, "loading");
  state = spriteLoadReducer(state, { type: "failed", key: "running-0" });
  assert.equal(
    spriteLoadReducer(state, { type: "ready", key: "running-0" }),
    state,
  );
  state = spriteLoadReducer(state, {
    type: "request",
    bank: { pose: "running", key: "running-1" },
  });
  assert.equal(state.firstReady, false);
  assert.equal(state.status, "loading");
  assert.equal(
    spriteLoadReducer(state, { type: "ready", key: "running-0" }),
    state,
  );
  assert.equal(
    spriteLoadReducer(state, { type: "ready", key: "running-1" }).status,
    "ready",
  );
});
test("warmup deduplicates requests, limits parallel work and retries failed hints", async () => {
  let calls = 0,
    active = 0,
    peak = 0,
    fail = true;
  const warm = createAssetWarmup(async (uri) => {
    calls++;
    active++;
    peak = Math.max(peak, active);
    await Promise.resolve();
    active--;
    if (uri === "bad" && fail) throw new Error("offline");
    return true;
  }, 2);
  await Promise.all([warm.warm(["a", "b", "c", "bad"]), warm.warm(["a", "b"])]);
  assert.equal(calls, 4);
  assert.ok(peak <= 2);
  fail = false;
  await warm.warm(["a", "bad"]);
  assert.equal(calls, 5);
  await warm.warm(["bad"]);
  assert.equal(calls, 5);
});
test("a hanging preload cannot block later warmup or retry", async () => {
  let calls = 0;
  const warm = createAssetWarmup(
    async () => {
      calls++;
      if (calls === 1) return new Promise(() => {});
      return true;
    },
    1,
    10,
  );
  await warm.warm(["slow", "next"]);
  assert.equal(calls, 2);
  await warm.warm(["slow"]);
  assert.equal(calls, 3);
});
