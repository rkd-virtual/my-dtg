import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import VerifyEmailSent from "../pages/VerifyEmailSent";
import SetupProfile from "../pages/SetupProfile";

export default function Router() {
  return (
    <Routes>
      {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-email-sent" element={<VerifyEmailSent />} />
      <Route path="/setup-profile" element={<SetupProfile />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
      {/* <Route path="*" element={<Navigate to="/login" replace />} /> */}
    </Routes>
  );
}
