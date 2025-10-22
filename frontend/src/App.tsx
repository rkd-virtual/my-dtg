import { Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "./components/PublicLayout";
import PortalLayout from "./components/PortalLayout";

/* import Home from "./pages/Home"; */
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmailSent from "./pages/VerifyEmailSent";
import SetupProfile from "./pages/SetupProfile";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";

import { getToken } from "./lib/auth";

function RequireAuth({ children }: { children: JSX.Element }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public site (keeps your black navbar with dropdowns) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email-sent" element={<VerifyEmailSent />} />
        <Route path="/setup-profile" element={<SetupProfile />} />
      </Route>

      {/* Portal (protected) — different chrome (sidebar + topbar) */}
      <Route
        element={
          <RequireAuth>
            <PortalLayout />
          </RequireAuth>
        }
      >
        <Route path="/portal/dashboard" element={<Dashboard />} />
        <Route path="/portal/orders" element={<div>Orders & Quotes</div>} />
        <Route path="/portal/shop" element={<div>Shop</div>} />
        <Route path="/portal/cart" element={<div>Cart</div>} />
        <Route path="/portal/support" element={<div>Support</div>} />
        <Route path="/portal/rma" element={<div>RMA</div>} />
        <Route path="/portal/settings" element={<div>Settings</div>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
