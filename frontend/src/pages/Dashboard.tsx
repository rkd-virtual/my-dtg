import { useEffect, useState } from "react";
import { api } from "../lib/api";
import StatCard from "../components/StatCard";
import { useToast } from "../components/ToastProvider";
import AccountSelector, { UserSite } from "../components/AccountSelector";

type Profile = {
  first_name?: string | null;
  last_name?: string | null;
  job_title?: string | null;
  amazon_site?: string | null;
  other_accounts?: string[] | string | null;
};

type DashboardPayload = {
  part1?: { order?: number; quotes?: number };
  part_2?: any;
  part_3?: any;
};

export default function Dashboard() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [savingSite, setSavingSite] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("User");
  const [jobTitle, setJobTitle] = useState<string | undefined>("");

  // Preferred source: user_sites rows
  const [sites, setSites] = useState<UserSite[] | null>(null);

  // Only used when user_sites endpoint is not available.
  // NOTE: we will not merge other_accounts here (per your request).
  const [accounts, setAccounts] = useState<string[]>([]);

  // selected account label (either site.label or "Amazon CTZ" style)
  const [account, setAccount] = useState<string>(() => sessionStorage.getItem("selectedAccount") || "");

  const [dashboardData, setDashboardData] = useState<DashboardPayload | null>(null);
  const [openQuotes, setOpenQuotes] = useState<number>(0);
  const [openOrders, setOpenOrders] = useState<number>(0);

  const SITES_API_BASE = (import.meta.env.VITE_SITES_API || "").replace(/\/+$/, "");

  // -------------------------
  // Helpers
  // -------------------------
  const extractSiteCode = (label?: string | null) => {
    if (!label) return "";
    const parts = label.trim().split(/\s+/);
    return parts.length > 1 ? parts[parts.length - 1] : label.trim();
  };

  const fetchMe = async () => {
    try {
      const { data } = await api.get("/auth/me");
      return data;
    } catch (err) {
      console.warn("Could not fetch /auth/me:", err);
      return null;
    }
  };

  const fetchProfile = async () => {
    try {
      const { data } = await api.get<Profile>("/auth/profile");
      return data;
    } catch (err) {
      console.warn("Could not fetch /auth/profile:", err);
      return null;
    }
  };

  // NEW: fetch user_sites rows from backend
  const fetchUserSites = async (): Promise<UserSite[] | null> => {
    try {
      const { data } = await api.get<UserSite[]>("/auth/profile/sites");
      if (Array.isArray(data)) return data;
      return null;
    } catch (err) {
      // endpoint might not exist yet — return null so we fall back gracefully
      console.warn("GET /profile/sites failed:", err);
      return null;
    }
  };

  // -------------------------
  // Load dashboard payload from third-party
  // -------------------------
  const loadDashboardForSite = async (siteCode: string) => {
    if (!siteCode) {
      console.warn("No siteCode provided to loadDashboardForSite");
      return null;
    }
    if (!SITES_API_BASE) {
      showToast({ type: "error", text: "Third-party API base URL is not configured." });
      return null;
    }

    const url = `${SITES_API_BASE}/api/dashboard?site_code=${encodeURIComponent(siteCode)}`;
    setSavingSite(true);
    try {
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) {
        let friendlyMsg = "Something went wrong while loading site data.";
        if (res.status === 500) friendlyMsg = "The site’s dashboard data is temporarily unavailable. Please try again later.";
        else if (res.status === 404) friendlyMsg = "The requested site data could not be found.";
        else if (res.status === 403) friendlyMsg = "You are not authorized to access this site’s data.";

        console.warn(`Dashboard API ${res.status} while loading site ${siteCode}`);
        showToast({ type: "error", text: friendlyMsg });
        setDashboardData(null);
        setOpenQuotes(0);
        setOpenOrders(0);
        return null;
      }

      const payload = await res.json();
      setDashboardData(payload);
      setOpenQuotes(payload?.part1?.quotes ?? 0);
      setOpenOrders(payload?.part1?.order ?? 0);
      console.log("Loaded dashboard data for", siteCode, payload);
      return payload;
    } catch (err: any) {
      console.error("Failed to load dashboard data:", err);
      showToast({
        type: "error",
        text: "Could not reach the dashboard service. Please check your network or try again.",
      });
      setDashboardData(null);
      setOpenQuotes(0);
      setOpenOrders(0);
      return null;
    } finally {
      setSavingSite(false);
    }
  };

  // -------------------------
  // Init: load profile, sites (if available), and dashboard
  // -------------------------
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setLoading(true);
      setError(null);

      const me = await fetchMe();
      const profile = await fetchProfile();
      const userSites = await fetchUserSites(); // preferred source for dropdown

      if (!mounted) return;

      // display name
      if (profile) {
        const f = profile.first_name || "";
        const l = profile.last_name || "";
        const full = [f, l].filter(Boolean).join(" ").trim();
        const displayName = full || (me?.email ? me.email.split("@")[0] : "User");
        setName(displayName);
        sessionStorage.setItem("userDisplayName", displayName);
        setJobTitle(profile.job_title || undefined);
      } else {
        const fallback = me?.email ? me.email.split("@")[0] : "User";
        setName(fallback);
        setJobTitle(undefined);
      }

      // If userSites present -> use them ONLY (do not merge with other_accounts)
      if (userSites && userSites.length > 0) {
        setSites(userSites);
        // clear any fallback accounts — they are irrelevant when user_sites exist
        setAccounts([]);

        const defaultSite = userSites.find((s) => s.is_default) ?? userSites[0];
        const label = defaultSite.label || `Amazon ${defaultSite.site_slug}`;
        setAccount(label);
        sessionStorage.setItem("selectedAccount", label);

        // load dashboard by slug (site_slug)
        await loadDashboardForSite(defaultSite.site_slug);
      } else {
        // FALLBACK: user_sites not available (endpoint missing or empty)
        // Use only profile.amazon_site (single value). Do NOT merge other_accounts into dropdown.
        const fallbackLabel = (profile?.amazon_site || "").trim() || "Amazon ABQ5";
        setAccounts([fallbackLabel]);
        // ensure sites is explicitly null so AccountSelector chooses accounts path
        setSites(null);

        const stored = sessionStorage.getItem("selectedAccount");
        const preferred = stored && stored === fallbackLabel ? stored : fallbackLabel;

        setAccount(preferred);
        sessionStorage.setItem("selectedAccount", preferred);

        const siteCodeToUse = extractSiteCode(preferred);
        if (siteCodeToUse) {
          await loadDashboardForSite(siteCodeToUse);
        }
      }

      setLoading(false);
    };

    init();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------
  // When user changes account/site
  // -------------------------
  const onAccountChange = async (newAccount: string) => {
    setAccount(newAccount);
    sessionStorage.setItem("selectedAccount", newAccount);
    window.dispatchEvent(new CustomEvent("dtg:account-changed", { detail: { selectedAccount: newAccount } }));

    // Determine site code to call backend+third-party
    let siteCode = extractSiteCode(newAccount);

    if (sites && sites.length > 0) {
      const match = sites.find((s) => s.label === newAccount);
      if (match) siteCode = match.site_slug;
      // if no match by label, fallback to extracted code above
    }

    if (!siteCode) return;

    setSavingSite(true);
    try {
      // Update server-side default site (PUT /auth/profile expects code like "CTZ")
      await api.put("/auth/profile", { amazon_site: siteCode });

      // If sites endpoint exists, refresh sites list (to reflect is_default change)
      const refreshed = await fetchUserSites();
      if (refreshed) {
        setSites(refreshed);
      }

      // Load third-party dashboard for the selected siteCode
      await loadDashboardForSite(siteCode);

      showToast({ type: "success", text: `Site switched to Amazon ${siteCode}` });
    } catch (err: any) {
      console.error("Failed to update site or fetch dashboard data:", err);
      showToast({ type: "error", text: err?.response?.data?.message || err?.message || "Could not change site. Try again." });
    } finally {
      setSavingSite(false);
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  const displayAccountLabel = account?.startsWith("Amazon") ? account : `Amazon ${account}`;

  return (
    <>
      {/* overlay loader while saving site */}
      {savingSite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-md bg-white px-6 py-5 shadow-lg flex items-center gap-4">
            <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
              <path d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="currentColor" className="opacity-90" />
            </svg>
            <div>
              <div className="text-sm text-gray-600">Updating your profile and loading site data</div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <section>
          <h1 className="text-3xl font-semibold">Hello, {name}</h1>
          <p className="text-gray-600">{jobTitle ? `${jobTitle}, ${displayAccountLabel}` : `DEV, ${displayAccountLabel}`}</p>
        </section>

        <section className="rounded-xl border bg-white p-4">
          <AccountSelector
            sites={sites}
            accounts={accounts}
            value={account}
            onChange={onAccountChange}
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            {displayAccountLabel} Open Quotes and Orders
          </h2>
          <p className="text-sm text-gray-600">
            Your pending quotes and orders that have yet to be shipped.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Open Quotes */}
            <div
              onClick={() => (window.location.href = "/portal/orders?tab=quotes")}
              className="cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg rounded-xl"
            >
              <StatCard
                title="Open Quotes"
                value={openQuotes}
                icon={<span>🧾</span>}
              />
            </div>

            {/* Open Orders */}
            <div
              onClick={() => (window.location.href = "/portal/orders?tab=orders")}
              className="cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg rounded-xl"
            >
              <StatCard
                title="Open Orders"
                value={openOrders}
                icon={<span>📑</span>}
              />
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
