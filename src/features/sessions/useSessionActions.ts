import { useRef, useState } from "react";
import { createSessionActions } from "./sessionActions";
import type { Command, Ledger } from "../../domain/activity";
import {
  requestGpsAccess,
  startGps,
  stopGps,
} from "../../platform/location/background";
export function useSessionActions(
  ledger: Ledger | null,
  execute: (command: Command, now?: number) => Promise<Ledger | null>,
  now: () => number,
) {
  const latest = useRef({ ledger, execute, now });
  latest.current = { ledger, execute, now };
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const actions = useRef<ReturnType<typeof createSessionActions> | null>(null);
  if (!actions.current)
    actions.current = createSessionActions({
      read: () => latest.current.ledger,
      execute: async (command, at) => {
        const state = await latest.current.execute(command, at);
        if (state) latest.current.ledger = state;
        return state;
      },
      now: () => latest.current.now(),
      id: () =>
        "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = Math.floor(Math.random() * 16);
          return (c === "x" ? r : (r & 3) | 8).toString(16);
        }),
      requestGps: requestGpsAccess,
      startGps,
      stopGps,
      onBusy: (value) => {
        if (value) setError("");
        setBusy(value);
      },
      onError: setError,
    });
  return {
    actions: actions.current,
    busy,
    error,
    clearError: () => setError(""),
  };
}
