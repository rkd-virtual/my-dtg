import Layout from "../components/Layout";
import { api } from "../lib/api";
import { useState } from "react";

export default function VerifyEmailSent() {
  const [email, setEmail] = useState(""); // optionally pass via router state
  const [note, setNote] = useState("");

  const resend = async () => {
    try {
      await api.post("/auth/resend-verification", { email });
      setNote("If the email exists, we’ve sent a new link.");
    } catch {
      setNote("Could not resend right now.");
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-10 text-center shadow">
        <div className="mx-auto mb-4 grid h-12 w-12 place-content-center rounded-full bg-gray-100">✉️</div>
        <h1 className="text-2xl font-semibold">Verify your email to activate your account</h1>
        <p className="mt-3 text-sm text-gray-600">
          We sent an email to <span className="font-medium">{email || "your email"}</span>.
          Click the link to complete your signup.
        </p>
        <button onClick={resend} className="mt-6 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-400">
          Resend Verification Email
        </button>
        {note && <p className="mt-3 text-xs text-gray-600">{note}</p>}
      </div>
    </Layout>
  );
}
