// src/pages/ResetPassword.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import FormInput from "../components/FormInput";
import logo from "../assets/DTG_Logo_login.svg";
import { useToast } from "../components/ToastProvider";
import { z } from "zod";
import { api } from "../lib/api";

const schema = z.object({
  code: z.string().min(6, "Please enter the 6-digit code").max(10),
  password: z.string().min(8, "Password must be 8 characters or longer"),
  confirm: z.string().min(8),
}).refine((val) => val.password === val.confirm, {
  path: ["confirm"],
  message: "Passwords do not match",
});

export default function ResetPassword() {
  const { showToast } = useToast();
  const nav = useNavigate();

  const initialEmail = sessionStorage.getItem("pendingEmail") || "";
  const [email] = useState<string>(initialEmail);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // if no pending email, allow user to type one (optional)
    if (!email) {
      // Do nothing — you could prefill from route state if you prefer
    }
  }, [email]);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setErrors({});

    const parsed = schema.safeParse({ code, password, confirm });
    if (!parsed.success) {
      const map: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        map[i.path[0]?.toString() || "form"] = i.message;
      });
      setErrors(map);
      return;
    }

    if (!email) {
      showToast({ type: "error", text: "Email is missing. Start from Forgot Password again." });
      return;
    }

    setLoading(true);
    try {
      // CALL BACKEND: adjust endpoint path to whatever your API expects
      await api.post("/auth/reset-password", {
        email,
        code,
        new_password: password,
      });

      // Clear pending email after success
      sessionStorage.removeItem("pendingEmail");

      showToast({ type: "success", text: "Password reset successful. Please log in." });
      nav("/login", { replace: true });
    } catch (err: any) {
      // Show server-provided message or friendly fallback
      const msg = err?.response?.data?.message || "Could not reset password. Check code and try again.";
      showToast({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <img src={logo} alt="DTG Logo" className="login_logo mb-4" />
        <h1 className="mb-4 text-center text-2xl font-semibold">Check your email for a 6-digit code</h1>
        <p className="mb-6 text-sm text-gray-600 text-center">
          Please enter your 6-digit code, then choose a new password.
        </p>

        <form onSubmit={submit} className="space-y-4">
          <FormInput name="email" label="Email" value={email} readOnly />
          <FormInput
            name="code"
            label="6-digit Code"
            value={code}
            onChange={(e) => setCode((e.target as HTMLInputElement).value)}
            placeholder="123456"
            error={errors.code}
          />
          <FormInput
            name="password"
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
            error={errors.password}
            placeholder="At least 8 characters"
          />
          <FormInput
            name="confirm"
            label="Confirm Password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm((e.target as HTMLInputElement).value)}
            error={errors.confirm}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-green-500 py-2.5 text-black font-semibold hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? "Resetting…" : "Reset Password"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
