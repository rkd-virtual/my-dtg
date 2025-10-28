import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { api } from "../lib/api";

/**
 * ProtectedRoute supports two usage styles:
 *  - Nested routes (in Router.tsx): <Route element={<ProtectedRoute/>}><Route .../></Route>
 *    -> it will render an <Outlet/> for the nested child routes when authorized.
 *  - Direct wrap: <ProtectedRoute><MyPage/></ProtectedRoute>
 *    -> it will render the provided children when authorized.
 *
 * While verifying, it shows a small "Checking session..." placeholder.
 */
export default function ProtectedRoute({ children }: { children?: React.ReactElement }) {
  const [status, setStatus] = useState<"loading" | "ok" | "no">("loading");

  useEffect(() => {
    let mounted = true;
    // call server to validate token/session
    api.get("/auth/me")
      .then(() => { if (mounted) setStatus("ok"); })
      .catch(() => { if (mounted) setStatus("no"); });

    return () => { mounted = false; };
  }, []);

  if (status === "loading") {
    return (
      <div className="py-20 text-center">
        Checking session…
      </div>
    );
  }

  if (status === "no") {
    return <Navigate to="/login" replace />;
  }

  // Authorized: render whatever mode is used:
  // if children provided, render them; otherwise render the nested <Outlet/>
  return children ? children : <Outlet />;
}
