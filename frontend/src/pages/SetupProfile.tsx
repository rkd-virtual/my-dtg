import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import FormInput from "../components/FormInput";
import { api } from "../lib/api";
import Autocomplete from "../components/Autocomplete";
import { useToast } from "../components/ToastProvider";

export default function SetupProfile() {
  const { showToast } = useToast();
  const [params] = useSearchParams();
  const nav = useNavigate();

  // Normalize token from URL so "+" and encoding survive email clients
  const tokenFromUrl = useMemo(() => {
    const raw = params.get("member") || "";
    return decodeURIComponent(raw).replace(/ /g, "+").trim();
  }, [params]);

  const [setupToken, setSetupToken] = useState("");
  // Note: we intentionally do NOT prefill `email` from server; user must type it
  const [email, setEmail] = useState("");
  // optional server-provided suggestion
  const [initialEmailHint, setInitialEmailHint] = useState(""); 

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    job_title: "",
    amazon_site: "",
    other_accounts: "",
  });

  // states for check-member
  const [checking, setChecking] = useState(false);
  const [memberOk, setMemberOk] = useState<boolean | null>(null); // null = not checked / unknown
  const [memberMsg, setMemberMsg] = useState<string>("");

  // debounce ref
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        if (!tokenFromUrl) throw new Error("missing token");
        const { data } = await api.post("/auth/verify-email", { token: tokenFromUrl });

        // Prefer server-provided setup_token; fallback to URL token
        const tokenForSetup = data?.setup_token || tokenFromUrl;
        setSetupToken(tokenForSetup);

        //setEmail(data?.email || "");
        setInitialEmailHint(data?.email || "");        
      } catch (e: any) {
        setErr(e?.response?.data?.message || "Invalid or expired link");        
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [tokenFromUrl]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    // Email field change handler (user types)
  const onEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = (e.target.value || "").trim();
    setEmail(v);
    setMemberOk(null);
    setMemberMsg("");
    // debounce check
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      checkMember(v);
    }, 600); // 600ms debounce
  };

  // API call to check-member
  const checkMember = async (candidateEmail: string) => {
    if (!candidateEmail) {
      setMemberOk(false);
      setMemberMsg("Please enter your email.");
      return;
    }

    setChecking(true);
    setMemberOk(null);
    setMemberMsg("");

    try {
      const payload: any = { email: candidateEmail };
      if (setupToken) payload.token = setupToken;

      const { data } = await api.post("/auth/check-member", payload);

      // expected shape: { exists: bool, allowed: bool, message: str }
      if (!data) {
        setMemberOk(false);
        setMemberMsg("Unexpected server response.");
        return;
      }

      if (!data.exists) {
        setMemberOk(false);
        setMemberMsg(data.message || "This email isn’t registered. Please sign up first.");
        return;
      }

      if (data.allowed) {
        setMemberOk(true);
        setMemberMsg("Email verified — you can complete your profile now.");
      } else {
        setMemberOk(false);
        setMemberMsg(data.message || "This email is not allowed to complete profile.");
      }
    } catch (e: any) {
      setMemberOk(false);
      setMemberMsg(e?.response?.data?.message || "Could not check email. Try again.");
    } finally {
      setChecking(false);
    }
  };


  // Submit handler - only allowed when memberOk === true
  const [saving, setSaving] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberOk) {
      setErr("Please confirm your email before submitting.");
      return;
    }

    try {
      setSaving(true);
      await api.put("/auth/setup-profile", {
        token: setupToken,
        ...form,
        other_accounts: form.other_accounts
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      sessionStorage.removeItem("pendingEmail");
      //alert("Profile saved. Please log in to continue.");
      showToast({ type: "success", text: "Profile saved. Please log in to continue.", position: "bottom-center" });
      nav("/login", { replace: true });
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Could not save profile");
      showToast({ type: "error", text: "ERROR : Could not save profile.", position: "bottom-center" });
    } finally {
      setSaving(false);
    }
  };

  // UI states for disabled inputs:
  const inputsDisabled = memberOk !== true; // enabled only when memberOk === true

  if (loading) {
    return (
      <Layout>
        <div className="mx-auto max-w-md rounded-2xl bg-white p-8 text-center shadow">
          Validating link…
        </div>
      </Layout>
    );
  }

  if (err) {
    return (
      <Layout>
        <div className="mx-auto max-w-md rounded-2xl bg-white p-8 text-center shadow text-red-600">
          {err}
        </div>
      </Layout>
    );
  }

  if (!setupToken) {
    return (
      <Layout>
        <div className="mx-auto max-w-md rounded-2xl bg-white p-8 text-center shadow text-red-600">
          Invalid or missing verification token.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto w-full max-w-lg rounded-2xl bg-white p-8 shadow">
        <h1 className="mb-6 text-center text-2xl font-semibold">Let's Setup Your Account</h1>

        {/* Optional hint: show which email the server expects (if you want) */}
        {initialEmailHint ? (
          <p className="mb-4 text-sm text-gray-600">
            We sent a verification link to <span className="font-medium">{initialEmailHint}</span>.
            Please type the same email below to continue.
          </p>
        ) : null}

        <form onSubmit={submit} className="space-y-4">
          <FormInput name="email" label="Email*" value={email} onChange={onEmailChange} placeholder="you@amazon.com"/>
          <div className="text-xs">
            {checking ? (
              <span className="text-gray-500">Checking email…</span>
            ) : memberOk === true ? (
              <span className="text-emerald-600">✔ {memberMsg}</span>
            ) : memberOk === false ? (
              <span className="text-rose-600">✖ {memberMsg}</span>
            ) : (
              <span className="text-gray-500">Type your email to validate and enable the form.</span>
            )}
          </div>
          <FormInput name="first_name" label="First Name*" value={form.first_name} onChange={onChange} disabled={inputsDisabled}/>
          <FormInput name="last_name" label="Last Name*" value={form.last_name} onChange={onChange} disabled={inputsDisabled}/>
          <FormInput name="job_title" label="Job Title*" value={form.job_title} onChange={onChange} disabled={inputsDisabled}/>
          
          {/*<FormInput name="amazon_site" label="Amazon Site*" value={form.amazon_site} onChange={onChange} placeholder="Amazon AB05" disabled={inputsDisabled}/>*/}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amazon Site*</label>
            <Autocomplete
              name="amazon_site"
              value={form.amazon_site}
              onChange={(e) => {
                // our Autocomplete can call onChange with a fake event or string
                if (typeof e === "string") {
                  setForm((f) => ({ ...f, amazon_site: e }));
                } else {
                  setForm((f) => ({ ...f, [ (e.target as any).name || "amazon_site" ]: (e.target as any).value }));
                }
              }}
              placeholder="Select Amazon Site..."
              suggestionsBaseUrl={import.meta.env.VITE_SITES_AUTOCOMPLETE_API || "https://dtg-backend.onrender.com/sites"}
              disabled={inputsDisabled}
              minChars={1}
            />
          </div>

          <FormInput name="other_accounts" label="Other Accounts" value={form.other_accounts} onChange={onChange} placeholder="Amazon XY21, Amazon XY22" disabled={inputsDisabled}/>
          <button
            disabled={saving || inputsDisabled}
            className="w-full rounded-lg bg-amber-500 py-2.5 text-black hover:bg-amber-400 disabled:opacity-60" type="submit">
            {saving ? "Saving…" : "Save"}
          </button>
          {/* Helpful CTA when member not allowed */}
          {memberOk === false && (
            <div className="pt-2 text-xs text-gray-600">
              {memberMsg}
              {memberMsg && memberMsg.toLowerCase().includes("expired") && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={async () => {
                      // attempt to resend (optional)
                      try {
                        await api.post("/auth/resend-verification", { email });
                        setMemberMsg("A new verification link was sent if the email exists.");
                      } catch {
                        setMemberMsg("Could not resend verification link.");
                      }
                    }}
                    className="underline text-indigo-600"
                  >
                    Resend verification email
                  </button>
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </Layout>
  );
}
