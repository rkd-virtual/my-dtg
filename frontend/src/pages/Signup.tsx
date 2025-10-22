import { useState } from "react";
import { z } from "zod";
import { api } from "../lib/api";
import { useNavigate, Link } from "react-router-dom";
import Layout from "../components/Layout";
import FormInput from "../components/FormInput";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Must be longer than 8 characters."),
});

export default function Signup() {
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
      parsed.error.issues.forEach(
        (i) => (map[i.path[0]?.toString() || "form"] = i.message)
      );
      setErrors(map);
      return;
    }
    setErrors({});

    try {
      setLoading(true);
      await api.post("/auth/signup", form); // backend sends verification email
      // Go to the "verify email" screen and show the address
      nav("/verify-email-sent", { state: { email: form.email }, replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        (err?.response?.status === 409
          ? "Email already registered"
          : "Signup failed");
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <h1 className="mb-2 text-center text-2xl font-semibold">Create an account</h1>
        <p className="mb-6 text-center text-sm text-gray-600">
          Use your Amazon email to sign up.
        </p>

        {serverError && (
          <p className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {serverError}
          </p>
        )}

        <form onSubmit={submit} className="space-y-4">
          <FormInput
            name="email"
            label="Amazon Email Address"
            type="email"
            placeholder="e.g. yourname@amazon.com"
            value={form.email}
            onChange={onChange}
            error={errors.email}
          />
          <FormInput
            name="password"
            label="Create Password"
            type="password"
            value={form.password}
            onChange={onChange}
            error={errors.password}
          />
          <button
            disabled={loading}
            className="w-full rounded-lg bg-amber-500 py-2.5 text-black font-bold hover:bg-amber-600 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create An Account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600">
            Log In
          </Link>
        </p>
      </div>
    </Layout>
  );
}
