import { reconcileSession } from "./reconcileSession";
import { useCallback, useEffect, useRef, useState } from "react";
import { openSessionStore, type SessionStore } from "../../data/sessionStore";
import { type Command, type Ledger } from "../../domain/activity";
import { gpsIsRunning, stopGps } from "../../platform/location/background";
export function useSessions() {
  const [ledger, setLedger] = useState<Ledger | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<string | null>(null);
  const store = useRef<SessionStore | null>(null),
    locked = useRef(false),
    alive = useRef(true),
    revision = useRef(0),
    refreshTicket = useRef(0);
  const load = useCallback(async () => {
    if (locked.current) return;
    locked.current = true;
    revision.current++;
    setBusy(true);
    setError(null);
    try {
      store.current = await openSessionStore();
      let state = await store.current.load();
      state = await reconcileSession(
        state,
        true,
        gpsIsRunning,
        (command) => store.current!.execute(command),
        () => store.current!.load(),
      );
      if (!(state.active?.gps && state.active.status === "running"))
        try {
          await stopGps();
        } catch {
          if (alive.current)
            setError(
              "Records loaded, but GPS could not stop. Reopen the app and retry stopping tracking.",
            );
        }
      if (alive.current) setLedger(state);
    } catch (e) {
      if (alive.current)
        setError(
          e instanceof Error ? e.message : "Could not open local records.",
        );
    } finally {
      locked.current = false;
      if (alive.current) setBusy(false);
    }
  }, []);
  useEffect(() => {
    alive.current = true;
    void load();
    return () => {
      alive.current = false;
    };
  }, [load]);
  const execute = useCallback(async (command: Command, now?: number) => {
    if (locked.current || !store.current) return null;
    locked.current = true;
    revision.current++;
    setBusy(true);
    setError(null);
    try {
      const state = await store.current.execute(command, now);
      if (alive.current) setLedger(state);
      return state;
    } catch (e) {
      if (alive.current)
        setError(
          e instanceof Error
            ? e.message
            : "Your change was not saved. Please retry.",
        );
      return null;
    } finally {
      locked.current = false;
      if (alive.current) setBusy(false);
    }
  }, []);
  const replace = useCallback(async (candidate: Ledger) => {
    if (locked.current || !store.current) return null;
    locked.current = true;
    revision.current++;
    setBusy(true);
    setError(null);
    try {
      const state = await store.current.replace(candidate);
      if (alive.current) setLedger(state);
      return state;
    } catch (e) {
      if (alive.current)
        setError(
          e instanceof Error
            ? e.message
            : "The backup could not be restored. Your previous records are kept.",
        );
      return null;
    } finally {
      locked.current = false;
      if (alive.current) setBusy(false);
    }
  }, []);
  const recovery = useCallback(async () => {
    if (locked.current || !store.current) return null;
    locked.current = true;
    revision.current++;
    setBusy(true);
    setError(null);
    try {
      return await store.current.recovery();
    } catch (e) {
      if (alive.current)
        setError(
          e instanceof Error ? e.message : "Could not open the recovery copy.",
        );
      throw e;
    } finally {
      locked.current = false;
      if (alive.current) setBusy(false);
    }
  }, []);
  const refresh = useCallback(async () => {
    if (locked.current || !store.current) return;
    const token = revision.current,
      ticket = ++refreshTicket.current;
    let acceptedRevision = token;
    const current = () =>
      alive.current &&
      !locked.current &&
      token === revision.current &&
      ticket === refreshTicket.current;
    try {
      let state = await store.current.load();
      if (!current()) return;
      state = await reconcileSession(
        state,
        false,
        gpsIsRunning,
        async (command) => {
          if (!current()) return store.current!.load();
          locked.current = true;
          revision.current++;
          acceptedRevision = revision.current;
          setBusy(true);
          try {
            return await store.current!.execute(command);
          } finally {
            locked.current = false;
            if (alive.current) setBusy(false);
          }
        },
        () => store.current!.load(),
      );
      if (
        alive.current &&
        !locked.current &&
        ticket === refreshTicket.current &&
        revision.current === acceptedRevision
      )
        setLedger(state);
    } catch (e) {
      if (
        alive.current &&
        ticket === refreshTicket.current &&
        acceptedRevision === revision.current
      )
        setError(
          e instanceof Error ? e.message : "Local records could not refresh.",
        );
    }
  }, []);
  return {
    ledger,
    busy,
    error,
    execute,
    replace,
    recovery,
    refresh,
    retry: load,
    clearError: () => setError(null),
  };
}
