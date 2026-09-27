import { useEffect, useRef } from "react";

/**
 * Polls `fn` every `intervalMs` while `enabled` is true. Used for the
 * order tracker (Phase 7 spec calls for polling rather than
 * WebSockets, "unless there is a strong reason to use WebSockets" —
 * there isn't one here). Cleans up its interval on unmount or when
 * `enabled` flips false, so a delivered order stops polling forever.
 */
export function usePolling(fn: () => void, intervalMs: number, enabled: boolean) {
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => fnRef.current(), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled]);
}
