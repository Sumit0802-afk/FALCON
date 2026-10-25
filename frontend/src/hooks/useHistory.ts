import { useCallback, useRef, useState } from "react";
import { HISTORY_LIMIT } from "@/utils/constants";

interface UseHistoryResult<T> {
  state: T;
  set: (next: T, opts?: { commit?: boolean }) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * Generic snapshot-based undo/redo stack. Pass `commit: false` while a drag
 * or resize is in progress to avoid flooding history, then a final
 * `commit: true` call (or the default) records the entry.
 */
export function useHistory<T>(initial: T): UseHistoryResult<T> {
  const [state, setState] = useState<T>(initial);
  const past = useRef<T[]>([]);
  const future = useRef<T[]>([]);
  // The state a drag or resize began from, so the whole gesture undoes in one step
  const gestureBase = useRef<{ value: T } | null>(null);

  const set = useCallback(
    (next: T, opts?: { commit?: boolean }) => {
      const commit = opts?.commit ?? true;
      if (commit) {
        const before = gestureBase.current ? gestureBase.current.value : state;
        gestureBase.current = null;
        past.current = [...past.current, before].slice(-HISTORY_LIMIT);
        future.current = [];
      } else if (!gestureBase.current) {
        gestureBase.current = { value: state };
      }
      setState(next);
    },
    [state]
  );

  const undo = useCallback(() => {
    if (past.current.length === 0) return;
    gestureBase.current = null;
    const previous = past.current[past.current.length - 1];
    past.current = past.current.slice(0, -1);
    future.current = [state, ...future.current];
    setState(previous);
  }, [state]);

  const redo = useCallback(() => {
    if (future.current.length === 0) return;
    gestureBase.current = null;
    const next = future.current[0];
    future.current = future.current.slice(1);
    past.current = [...past.current, state];
    setState(next);
  }, [state]);

  return {
    state,
    set,
    undo,
    redo,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
  };
}
