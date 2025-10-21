import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import FormInput from "../components/FormInput";
import { api } from "../lib/api";

export default function SetupProfile() {
  const [params] = useSearchParams();
  const nav = useNavigate();

  // Normalize token from URL so "+" and encoding survive email clients
  const tokenFromUrl = useMemo(() => {
    const raw = params.get("member") || "";
    return decodeURIComponent(raw).replace(/ /g, "+").trim();
  }, [params]);

  const [setupToken, setSetupToken] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    job_title: "",
    amazon_site: "",
    other_accounts: "",
  });

  useEffect(() => {
    const run = async () => {
      try {
        if (!tokenFromUrl) throw new Error("missing token");
        const { data } = await api.post("/auth/verify-email", { token: tokenFromUrl });

        // Prefer server-provided setup_token; fallback to URL token
        const tokenForSetup = data?.setup_token || tokenFromUrl;
        setSetupToken(tokenForSetup);
        setEmail(data?.email || "");
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

  const [saving, setSaving] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      alert("Profile saved. Please log in to continue.");
      nav("/login", { replace: true });
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

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
        <form onSubmit={submit} className="space-y-4">
          <FormInput name="email" label="Email" value={email} readOnly />
          <FormInput name="first_name" label="First Name" value={form.first_name} onChange={onChange} />
          <FormInput name="last_name" label="Last Name" value={form.last_name} onChange={onChange} />
          <FormInput name="job_title" label="Job Title" value={form.job_title} onChange={onChange} />
          <FormInput name="amazon_site" label="Amazon Site" value={form.amazon_site} onChange={onChange} placeholder="Amazon AB05" />
          <FormInput name="other_accounts" label="Other Accounts" value={form.other_accounts} onChange={onChange} placeholder="Amazon XY21, Amazon XY22" />
          <button
            disabled={saving}
            className="w-full rounded-lg bg-amber-500 py-2.5 text-black hover:bg-amber-400 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save & Go to Login"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
