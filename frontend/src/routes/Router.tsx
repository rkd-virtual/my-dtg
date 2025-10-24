import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import VerifyEmailSent from "../pages/VerifyEmailSent";
import SetupProfile from "../pages/SetupProfile";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

export default function Router() {
  return (
    <Routes>
      
      {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}
      {/* <Route path="/" element={<Home />} /> */}

      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-email-sent" element={<VerifyEmailSent />} />
      <Route path="/setup-profile" element={<SetupProfile />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected (authenticated) routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/portal/dashboard" element={<Dashboard />} />
      </Route>

      {/* Catch-all: redirect any unknown path to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
