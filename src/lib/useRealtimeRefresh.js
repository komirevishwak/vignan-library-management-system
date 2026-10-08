"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Calls `onChange` whenever any of the given public tables change
 * (Supabase Realtime), when the tab regains focus, and on a slow poll as a
 * safety net (e.g. if Realtime is not enabled on the project yet).
 * Calls are debounced so bursts of changes cause a single refetch.
 */
export function useRealtimeRefresh(tables, onChange, { pollMs = 30000 } = {}) {
  const cbRef = useRef(onChange);
  cbRef.current = onChange;
  const key = tables.join(",");

  useEffect(() => {
    const supabase = createClient();
    let timer = null;
    const trigger = () => {
      clearTimeout(timer);
      timer = setTimeout(() => cbRef.current(), 300);
    };

    const channel = supabase.channel(`rt-${key}-${Math.random().toString(36).slice(2)}`);
    key.split(",").forEach((table) => {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, trigger);
    });
    channel.subscribe();

    const poll = setInterval(trigger, pollMs);
    const onVisible = () => {
      if (document.visibilityState === "visible") trigger();
    };
    window.addEventListener("focus", trigger);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearTimeout(timer);
      clearInterval(poll);
      window.removeEventListener("focus", trigger);
      document.removeEventListener("visibilitychange", onVisible);
      supabase.removeChannel(channel);
    };
  }, [key, pollMs]);
}
