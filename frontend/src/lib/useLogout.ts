// src/lib/useLogout.ts
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./api";
import { clearToken } from "./auth";

/**
 * useLogout - performs server logout (best-effort), clears client token & session storage,
 * and navigates to /login.
 *
 * Returns: { logout: () => Promise<void>, loading: boolean }
 */
export default function useLogout() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      // best-effort server logout (clears cookies if used)
      await api.post("/auth/session/logout");
    } catch (err) {
      // swallow network errors - we still want to clear local state
      console.warn("logout request failed:", err);
    } finally {
      try {
        // Clear client auth and pending email
        clearToken();
        sessionStorage.removeItem("pendingEmail");
      } catch (e) {
        console.warn("failed to clear local auth state:", e);
      }
      setLoading(false);
      // Send user back to login
      nav("/login", { replace: true });
    }
  }, [nav]);

  return { logout, loading };
}
