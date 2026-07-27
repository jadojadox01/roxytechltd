"use client";

import { useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";

const IDLE_MS = 2 * 60 * 1000; // 2 minutes

const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "click",
  "wheel",
];

/**
 * Signs the user out immediately after 2 minutes with no interaction.
 */
export default function IdleLogout() {
  const { status } = useSession();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const signingOutRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated") return;

    const clearTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const logout = () => {
      if (signingOutRef.current) return;
      signingOutRef.current = true;
      clearTimer();
      void signOut({ callbackUrl: "/signin?reason=idle" });
    };

    const resetTimer = () => {
      if (signingOutRef.current) return;
      clearTimer();
      timerRef.current = setTimeout(logout, IDLE_MS);
    };

    resetTimer();

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, resetTimer, { passive: true });
    }
    document.addEventListener("visibilitychange", resetTimer);

    return () => {
      clearTimer();
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, resetTimer);
      }
      document.removeEventListener("visibilitychange", resetTimer);
    };
  }, [status]);

  return null;
}
