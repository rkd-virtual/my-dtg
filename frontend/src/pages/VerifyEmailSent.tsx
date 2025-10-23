import Layout from "../components/Layout";
import { api } from "../lib/api";
import { useState,useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocation } from "react-router-dom";
import { useToast } from "../components/ToastProvider";


export default function VerifyEmailSent() {
  const { showToast } = useToast();
  const loc = useLocation();
  const initialEmail = (loc.state as any)?.email || sessionStorage.getItem("pendingEmail") || "";
  const [email] = useState<string>((initialEmail || "").trim());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (email) sessionStorage.setItem("pendingEmail", email);
  }, [email]);

  const resend = async () => {
    if (!email) {
      showToast({ type: "error", text: "Email not found. Please sign up first." });
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/resend-verification", { email });
      showToast({ type: "success", text: "Verification email sent.", position: "bottom-center" });
    } catch (err) {
      showToast({ type: "error", text: "Could not resend verification email." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-10 text-center shadow">
        <div className="mx-auto mb-4 grid h-12 w-12 place-content-center rounded-full bg-gray-100">
          <FontAwesomeIcon icon={["fas", "envelope"]} className="text-gray-700 text-xl" />
        </div>
        <h1 className="text-2xl font-semibold">Verify your email to activate your account</h1>
        <p className="mt-3 text-sm text-gray-600">We sent an email to {" "}</p>
        <p className="mt-3 text-sm text-gray-600"><span className="font-medium">{email || "your email"}</span>.</p>
        <p className="mt-3 text-sm text-gray-600">Just click on the link in that email to complete your signup. If your</p>
        <p className="mt-3 text-sm text-gray-600 pb-10">don't see it, you may need to <span className="font-bold">check your spam</span> folder.</p>
        <button disabled={loading} onClick={resend}
          className="mt-2 inline-flex items-center gap-3 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-60">
          {loading ? (
            <>
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/10">
                <svg className="h-4 w-4 animate-spin text-black" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                  <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
              </span>
              <span>Sending, please wait…</span>
            </>
          ) : "Resend Verification Email"}
        </button>
      </div>
    </Layout>
  );
}
