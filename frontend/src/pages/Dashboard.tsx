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

type Product = {
  id: string;
  sku: string;
  title: string;
  price: number;
  short: string;
  img?: string;
  requiresPart?: string | null; // show warning row if present
};

export default function Dashboard() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [savingSite, setSavingSite] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("User");
  const [jobTitle, setJobTitle] = useState<string | undefined>("");

  const [sites, setSites] = useState<UserSite[] | null>(null);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [account, setAccount] = useState<string>(() => sessionStorage.getItem("selectedAccount") || "");

  const [dashboardData, setDashboardData] = useState<DashboardPayload | null>(null);
  const [openQuotes, setOpenQuotes] = useState<number>(0);
  const [openOrders, setOpenOrders] = useState<number>(0);

  const SITES_API_BASE = (import.meta.env.VITE_SITES_API || "").replace(/\/+$/, "");

  // -------------------------
  // Static product list (match screenshot)
  // -------------------------
  const products: Product[] = [
    {
      id: "p1",
      sku: "DTG-PS-001-16DTG",
      title: "CART.PS",
      price: 2183.0,
      short:
        'CART.PS - DTG Problem Solver Cart, 18" Adjustable Height Work Surface, Incl. DTG UPS X300 Controller, Large Bottom Shelf.',
      img: "https://cdn.prod.website-files.com/66311aaf0b687a3a2e1a0550/68960701dacfc3160c1d43df_DTG-IP-LP-1XB-C0%20-%20PS%20cart%20neal.png",
    },
    {
      id: "p2",
      sku: "DTG-PWMRTR",
      title: "Fuel Gauge",
      price: 225.0,
      short: "Battery Power Meter (Fuel) Gauge. Ethernet Cable Not Included.",
      img: "https://cdn.prod.website-files.com/66311aaf0b687a3a2e1a0550/6894fa537b9446c35cd24ac0_Adobe%20Express%20-%20file%20(2).png",
      requiresPart: "C6ASPAT6BK",
    },
    {
      id: "p3",
      sku: "DTG-P2-NA-XP-S0",
      title: "MPower X300 Battery",
      price: 735.0,
      short: "Definitive Battery (Gray) MPower X300 LFP Swappable Battery.",
      img: "https://cdn.prod.website-files.com/66311aaf0b687a3a2e1a0550/6894e0973c0f2f5ae078b70e_Adobe%20Express%20-%20file%20(2).png",
    },
    {
      id: "p4",
      sku: "DTG-PI-NA-3XP-S0",
      title: "Tri-Bay Charger",
      price: 995.0,
      short:
        "CART.PS.CHRG.LIFE – DTG MPower X300 Tri-Bay Charger - POGO Connector. Charges up to 3 DTG X250 & X300 Batteries within 2-hours.",
      img: "https://cdn.prod.website-files.com/66311aaf0b687a3a2e1a0550/68960dde1b90c0089a7959ec_Adobe%20Express%20-%20file%20(8).png",
    },
  ];

  // quantity state per product
  const [quantities, setQuantities] = useState<Record<string, number>>(
    () => Object.fromEntries(products.map((p) => [p.id, 1]))
  );

  const setQuantity = (id: string, value: number) => {
    setQuantities((s) => ({ ...s, [id]: Math.max(1, Math.floor(value || 1)) }));
  };

  const handleAddToQuote = (product: Product) => {
    const qty = quantities[product.id] ?? 1;
    // replace with real add-to-quote logic when ready
    showToast({ type: "success", text: `${product.title} (x${qty}) added to quote.` });
    console.log("Add to quote:", product, qty);
  };

  // -------------------------
  // Helpers (unchanged)
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

  const fetchUserSites = async (): Promise<UserSite[] | null> => {
    try {
      const { data } = await api.get<UserSite[]>("/auth/profile/sites");
      if (Array.isArray(data)) return data;
      return null;
    } catch (err) {
      console.warn("GET /profile/sites failed:", err);
      return null;
    }
  };

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
      const userSites = await fetchUserSites();

      if (!mounted) return;

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

      if (userSites && userSites.length > 0) {
        setSites(userSites);
        setAccounts([]);

        const defaultSite = userSites.find((s) => s.is_default) ?? userSites[0];
        const label = defaultSite.label || `Amazon ${defaultSite.site_slug}`;
        setAccount(label);
        sessionStorage.setItem("selectedAccount", label);

        await loadDashboardForSite(defaultSite.site_slug);
      } else {
        const fallbackLabel = (profile?.amazon_site || "").trim() || "Amazon ABQ5";
        setAccounts([fallbackLabel]);
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

    let siteCode = extractSiteCode(newAccount);

    if (sites && sites.length > 0) {
      const match = sites.find((s) => s.label === newAccount);
      if (match) siteCode = match.site_slug;
    }

    if (!siteCode) return;

    setSavingSite(true);
    try {
      await api.put("/auth/profile", { amazon_site: siteCode });

      const refreshed = await fetchUserSites();
      if (refreshed) {
        setSites(refreshed);
      }

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

        <section className="rounded-xl border bg-white max-w-sm p-4">
          <AccountSelector sites={sites} accounts={accounts} value={account} onChange={onAccountChange} />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">{displayAccountLabel} Open Quotes and Orders</h2>
          <p className="text-sm text-gray-600">📦Your pending quotes and orders that have yet to be shipped.</p>

          <div className="grid gap-4 md:grid-cols-2">
            <div
              onClick={() => (window.location.href = "/portal/orders?tab=quotes")}
              className="cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg rounded-xl"
            >
              <StatCard title="Open Quotes" value={openQuotes} icon={<span>🧾</span>} />
            </div>

            <div
              onClick={() => (window.location.href = "/portal/orders?tab=orders")}
              className="cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg rounded-xl"
            >
              <StatCard title="Open Orders" value={openOrders} icon={<span>📦</span>} />
            </div>
          </div>
        </section>

        {/* Shop Popular Items */}
        <section className="pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Shop Popular Items</h2>
            <button onClick={() => (window.location.href = "/portal/shop")} className="border rounded px-3 py-2 text-sm">
              Shop Parts Catalog
            </button>
          </div>

          <div className="mt-6 grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded shadow-sm hover:shadow-md transition transform hover:-translate-y-1 overflow-hidden"
              >
                <div className="relative bg-gray-50">
                  <img src={p.img} alt={p.title} className="w-full h-56 object-contain bg-white p-6" />
                  <div className="absolute left-3 top-3 rounded-md bg-gray-200 text-xs text-gray-800 px-2 py-1">
                    {p.sku}
                  </div>
                </div>

                <div className="p-4">
                  <div className="text-xl font-bold mb-1">${p.price.toFixed(2)}</div>
                  <div className="font-semibold mb-1">{p.title}</div>

                  <div className="text-sm text-gray-600 mb-3">{p.short}</div>

                  {p.requiresPart && (
                    <div className="flex items-center gap-2 text-sm text-amber-600 mb-3">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <path d="M12 8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="0" />
                      </svg>
                      <div className="text-gray-800">Requires Part: <span className="font-medium text-gray-900">{p.requiresPart}</span></div>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-4 inp-gap">
                    <input
                      type="number"
                      min={1}
                      value={quantities[p.id] ?? 1}
                      onChange={(e) => setQuantity(p.id, Number(e.target.value))}
                      className="w-20 rounded border border-gray-300 px-2 py-1 text-sm"
                    />

                    <button
                      onClick={() => handleAddToQuote(p)}
                      className="border border-black px-4 py-2 text-sm hover:bg-black hover:text-white transition"
                    >
                      Add to Quote
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button onClick={() => (window.location.href = "/portal/shop")} className="border rounded px-4 py-2 text-sm">
              Shop Parts Catalog
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
