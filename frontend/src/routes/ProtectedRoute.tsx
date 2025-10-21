import { Outlet, Navigate } from "react-router-dom";
import { getToken } from "../lib/auth";

export default function ProtectedRoute() {
  const token = getToken();
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}
