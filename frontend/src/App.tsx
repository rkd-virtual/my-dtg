import { Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "./components/PublicLayout";
import PortalLayout from "./components/PortalLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmailSent from "./pages/VerifyEmailSent";
import SetupProfile from "./pages/SetupProfile";
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
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/orders" element={<div>Orders & Quotes</div>} />
        <Route path="/shop" element={<div>Shop</div>} />
        <Route path="/cart" element={<div>Cart</div>} />
        <Route path="/support" element={<div>Support</div>} />
        <Route path="/rma" element={<div>RMA</div>} />
        <Route path="/settings" element={<div>Settings</div>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
