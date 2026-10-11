"use client";

import { useCallback, useEffect, useState } from "react";
import { emptyState, SceneState, stateSchema, STORAGE_KEY } from "./events";

function readState(): SceneState {
  const value = window.localStorage.getItem(STORAGE_KEY);
  if (!value) return emptyState;
  const result = stateSchema.safeParse(JSON.parse(value));
  if (!result.success) throw new Error("Your saved demo data could not be loaded.");
  return result.data;
}

export function useSceneStore() {
  const [state, setState] = useState<SceneState>(emptyState);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");

  useEffect(() => {
    function load() {
      try {
        setState(readState());
        setStorageError("");
      } catch {
        setStorageError("Browser storage is unavailable or contains unreadable demo data. Saving and booking require working local storage.");
      }
    }
    load();
    setReady(true);
    function sync(event: StorageEvent) {
      if (event.key === STORAGE_KEY || event.key === null) load();
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const commit = useCallback((update: (current: SceneState) => SceneState) => {
    // Read immediately before mutation so another tab's bookings aren't overwritten.
    const next = stateSchema.parse(update(readState()));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setState(next);
    return next;
  }, []);

  return { state, ready, commit, storageError };
}
