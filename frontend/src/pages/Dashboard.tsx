import StatCard from "../components/StatCard";
import { useEffect,useState } from "react";
import { api } from "../lib/api";

type Profile = {
  first_name?: string | null;
  last_name?: string | null;
  job_title?: string | null;
  amazon_site?: string | null;
  other_accounts?: string[] | string | null;
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [meLoading, setMeLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("User");
  const [jobTitle, setJobTitle] = useState<string | undefined>("");

  // list of accounts displayed in the select
  const [accounts, setAccounts] = useState<string[]>(["Amazon ABQ5"]);
  const [account, setAccount] = useState(accounts[0]);

  // fetch current user basic info (id/email/is_verified)
  const fetchMe = async () => {
    setMeLoading(true);
    try {
      const { data } = await api.get("/auth/me");
      // server's /auth/me returns id + email + is_verified in your code
      // We'll keep the id in a closure to use for fetching profile
      return data;
    } catch (err) {
      // Not fatal: the page can still show defaults
      console.warn("Could not fetch /auth/me:", err);
      return null;
    } finally {
      setMeLoading(false);
    }
  };

  // fetch user profile — try a couple of common endpoints
  const fetchProfile = async (userId?: number | string) => {
    // First try a general profile endpoint (recommended)
    try {
      const { data } = await api.get<Profile>("/auth/profile");
      return data;
    } catch (e) {
      // If that doesn't exist, try /users/:id/profile
      if (userId) {
        try {
          const { data } = await api.get<Profile>(`/auth/users/${userId}/profile`);
          return data;
        } catch (err2) {
          // fallthrough
        }
      }
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoading(true);
      setError(null);

      const me = await fetchMe();
      const userId = me?.id;

      const profile = await fetchProfile(userId);

      if (!mounted) return;

      if (profile) {
        // name
        const f = profile.first_name || "";
        const l = profile.last_name || "";
        const full = [f, l].filter(Boolean).join(" ").trim() || undefined;
        setName(full || (me?.email ? me.email.split("@")[0] : "User"));

        // job title
        setJobTitle(profile.job_title || undefined);

        // build accounts list
        const accountsFromProfile: string[] = [];

        // prefer other_accounts if an array or comma-separated string
        if (profile.other_accounts) {
          if (Array.isArray(profile.other_accounts)) {
            accountsFromProfile.push(...profile.other_accounts.filter(Boolean));
          } else if (typeof profile.other_accounts === "string") {
            try {
              // might be JSON stored as string (Postgres text[]) or comma separated
              if (profile.other_accounts.trim().startsWith("[")) {
                const parsed = JSON.parse(profile.other_accounts);
                if (Array.isArray(parsed)) accountsFromProfile.push(...parsed);
              } else {
                accountsFromProfile.push(
                  ...profile.other_accounts.split(",").map((s) => s.trim()).filter(Boolean)
                );
              }
            } catch {
              accountsFromProfile.push(...profile.other_accounts.split(",").map((s) => s.trim()).filter(Boolean));
            }
          }
        }

        // fallback to single amazon_site
        if (profile.amazon_site) accountsFromProfile.push(profile.amazon_site);

        // if still empty, keep default
        if (accountsFromProfile.length > 0) {
          setAccounts(accountsFromProfile);
          setAccount(accountsFromProfile[0]);
        }
      } else {
        // no profile — fallback to basic available info
        setName(me?.email ? me.email.split("@")[0] : "User");
        setJobTitle(undefined);
      }

      setLoading(false);
    };

    run();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading || meLoading) {
    return <div className="p-6">Loading…</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-semibold">Hello, {name}</h1>
        <p className="text-gray-600">{jobTitle ? `${jobTitle}, ${account}` : `DEV, ${account}`}</p>
      </section>

      <section className="rounded-xl border bg-white p-4">
        <div className="flex items-center gap-6">
          <label className="text-sm font-medium">Select an Account:</label>
          <select
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            {accounts.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Amazon {account} Open Quotes and Orders</h2>
        <p className="text-sm text-gray-600">Your pending quotes and orders that have yet to be shipped.</p>

        <div className="grid gap-4 md:grid-cols-2">
          <StatCard title="Open Quotes" value={0} href="/orders?tab=quotes" icon={<span>🧾</span>} />
          <StatCard title="Open Orders" value={1} href="/orders?tab=orders" icon={<span>📑</span>} />
        </div>
      </section>
    </div>
  );
}
