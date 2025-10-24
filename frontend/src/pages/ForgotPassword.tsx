// ForgotPassword.tsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import { api } from "../lib/api";
import { useState, useEffect, useRef } from "react";
import Layout from "../components/Layout";
import FormInput from "../components/FormInput";
import logo from "../assets/DTG_Logo_login.svg";
import { useToast } from "../components/ToastProvider";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

export default function ForgotPassword() {
  const { showToast } = useToast();
  const nav = useNavigate();
  const loc = useLocation();

  const [loading, setLoading] = useState(false); // for sending forgot-password
  const [email, setEmail] = useState(() => {
    // try prefill from sessionStorage if available
    return sessionStorage.getItem("pendingEmail") || "";
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // states for check-member
  const [checking, setChecking] = useState(false);
  const [exists, setExists] = useState<boolean | null>(null);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [checkMessage, setCheckMessage] = useState("");

  // debounce ref
  const debounceRef = useRef<number | null>(null);

  // optional token from querystring (if user opens setup link and lands here)
  const tokenFromUrl = new URLSearchParams(loc.search).get("member") || "";

  // When email changes, debounce a POST to /auth/check-member
  useEffect(() => {
    // reset check state when email is cleared
    if (!email) {
      setExists(null);
      setAllowed(null);
      setCheckMessage("");
      setChecking(false);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      return;
    }

    // clear previous timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // debounce the request
    debounceRef.current = window.setTimeout(async () => {
      setChecking(true);
      setCheckMessage("");
      try {
        const body: any = { email };
        if (tokenFromUrl) body.token = tokenFromUrl;
        const { data } = await api.post("/auth/check-member", body);
        // data expected: { exists, allowed, message }
        setExists(Boolean(data.exists));
        setAllowed(Boolean(data.allowed));
        setCheckMessage(data.message || "");
      } catch (err: any) {
        // network or server error; keep UI friendly
        setExists(false);
        setAllowed(false);
        setCheckMessage(err?.response?.data?.message || "Could not validate email right now");
      } finally {
        setChecking(false);
        debounceRef.current = null;
      }
    }, 400);

    // cleanup
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [email, tokenFromUrl]);

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setErrors({});

    // validate email locally first
    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      const map: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (map[i.path[0]?.toString() || "email"] = i.message));
      setErrors(map);
      return;
    }

    // ensure the email is allowed by check-member
    if (!exists || !allowed) {
      // provide a helpful client message if the server didn't permit reset
      setCheckMessage(checkMessage || "This email cannot request a reset. Please sign up or contact support.");
      return;
    }

    try {
      setLoading(true);
      // call backend - it returns generic success even if email doesn't exist
      await api.post("/auth/forgot-password", { email });

      // keep a pending email for the reset page (cleared later)
      sessionStorage.setItem("pendingEmail", email);

      showToast({ type: "success", text: "If the email exists, a reset code was sent.", position: "bottom-center" });

      // go to reset page where user can enter the 6-digit code
      nav("/reset-password");
    } catch (err: any) {
      showToast({ type: "error", text: err?.response?.data?.message || "Could not send reset link. Try again later." });
    } finally {
      setLoading(false);
    }
  };

  const submitDisabled = loading || checking || !(exists && allowed);

  return (
    <Layout>
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <img src={logo} alt="Login Logo" className="login_logo mb-4" />
        <h1 className="mb-6 text-center text-2xl font-semibold">Enter your email to reset your password</h1>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <FormInput
            name="email"
            label="Amazon Email Address"
            value={email}
            onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
            placeholder="you@amazon.com"
            error={errors.email}
            disabled={loading}
          />

          {/* Inline status */}
          <div aria-live="polite" className="min-h-[1.2rem]">
            {checking && <p className="text-sm text-gray-500">Checking email…</p>}
            {!checking && checkMessage && checkMessage!='OK' && <p className="text-sm text-red-600">{checkMessage}</p>}
            {/*{!checking && exists && allowed && <p className="text-sm text-green-600">Email OK — you can request a reset.</p>}*/}
          </div>

          <button
            type="submit"
            disabled={submitDisabled}
            className={`mt-2 gap-3 w-full rounded-lg px-5 py-2.5 font-bold ${
              submitDisabled ? "bg-amber-300 text-black/70 cursor-not-allowed" : "bg-amber-500 text-black hover:bg-amber-400"
            }`}
          >
            {loading ? (
              <span className="inline-flex items-center gap-3">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/10">
                  <svg className="h-4 w-4 animate-spin text-black" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                    <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                </span>
                <span>Sending, please wait…</span>
              </span>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link to="/signup" className="text-indigo-600">
            Create an account
          </Link>
        </p>
      </div>
    </Layout>
  );
}
