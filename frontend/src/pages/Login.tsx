import { useState } from "react";
import { z } from "zod";
import { api } from "../lib/api";
import { setToken } from "../lib/auth";
import { useNavigate, Link } from "react-router-dom";
import Layout from "../components/Layout";
import FormInput from "../components/FormInput";
import type { AuthResponse } from "../types/auth";
import logo from "../assets/DTG_Logo_login.svg";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const map: Record<string, string> = {};
      parsed.error.issues.forEach(i => map[i.path[0]?.toString() || "form"] = i.message);
      setErrors(map);
      return;
    }
    setErrors({});
    try {
      setLoading(true);
      const { data } = await api.post<AuthResponse>("/auth/login", form);
      setToken(data.token);
      nav("/portal/dashboard");
    } catch (err: any) {
      setServerError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <img src={logo} alt="Login Logo" className="login_logo"/>
        <h1 className="mb-6 text-center text-2xl font-semibold">Log in to DTG’s Amazon Portal</h1>
        {serverError && <p className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-700">{serverError}</p>}
        <form onSubmit={submit} className="space-y-4">
          <FormInput name="email" label="Email Address" type="email" placeholder="e.g. yourname@amazon.com"
            value={form.email} onChange={onChange} error={errors.email} />
          <FormInput name="password" label="Password" type="password"
            value={form.password} onChange={onChange} error={errors.password} />
          <button
            disabled={loading}
            className="w-full rounded-lg bg-amber-500 hover:bg-amber-600 py-2.5 text-black disabled:opacity-50"
          >
            {loading ? "Please wait .." : "Log In"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          Don’t have an account? <Link to="/signup" className="text-indigo-600">Sign Up</Link>
        </p>
        <p className="mt-4 text-center text-sm">
          <Link to="/forgot-password" className="text-indigo-600">Forgot password?</Link>
        </p>
      </div>
    </Layout>
  );
}
