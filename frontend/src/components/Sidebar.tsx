import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

const items = [
  { to: "/portal/dashboard", label: "Dashboard" },
  { to: "/portal/orders", label: "Orders & Quotes" },
  { to: "/portal/shop", label: "Shop" },
  { to: "/portal/cart", label: "Cart" },
  { to: "/portal/support", label: "Support" },
  { to: "/portal/rma", label: "RMA" },
  { to: "/portal/settings", label: "Settings" },
];

export default function Sidebar() {
  // initialize from sessionStorage synchronously so UI is correct on first render
  const initialSelected = sessionStorage.getItem("selectedAccount") || null;
  const initialDisplayName = sessionStorage.getItem("userDisplayName") || null;

  const [selectedAccount, setSelectedAccount] = useState<string | null>(initialSelected);
  const [displayName, setDisplayName] = useState<string | null>(initialDisplayName);

  useEffect(() => {
    // storage event handles cross-tab changes automatically
    const storageHandler = (ev: StorageEvent) => {
      if (ev.key === "selectedAccount") {
        setSelectedAccount(ev.newValue);
      }
      if (ev.key === "userDisplayName") {
        setDisplayName(ev.newValue);
      }
    };

    // same-tab updates: Dashboard dispatches dtg:account-changed with { selectedAccount, userDisplayName }
    const customHandler = (ev: Event) => {
      const detail = (ev as CustomEvent)?.detail;
      if (detail?.selectedAccount) {
        setSelectedAccount(detail.selectedAccount);
        // also mirror to sessionStorage just in case
        try { sessionStorage.setItem("selectedAccount", detail.selectedAccount); } catch {}
      } else {
        // fallback: read from sessionStorage if detail missing
        const fromStore = sessionStorage.getItem("selectedAccount");
        if (fromStore) setSelectedAccount(fromStore);
      }

      if (detail?.userDisplayName) {
        setDisplayName(detail.userDisplayName);
        try { sessionStorage.setItem("userDisplayName", detail.userDisplayName); } catch {}
      } else {
        const fromStore = sessionStorage.getItem("userDisplayName");
        if (fromStore) setDisplayName(fromStore);
      }
    };

    window.addEventListener("storage", storageHandler);
    window.addEventListener("dtg:account-changed", customHandler);

    return () => {
      window.removeEventListener("storage", storageHandler);
      window.removeEventListener("dtg:account-changed", customHandler);
    };
  }, []);

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r bg-gray-900 text-white">
      <div className="h-16 flex items-center px-4 text-lg font-semibold border-b border-white/10">
        DTG<span className="ml-1 text-emerald-400">⚡</span>
      </div>

      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {items.map((it) => (
            <li key={it.to}>
              <NavLink
                to={it.to}
                className={({ isActive }) =>
                  [
                    "mx-2 block rounded-lg px-3 py-2 text-sm",
                    isActive ? "bg-white text-gray-900 font-semibold" : "text-gray-200 hover:bg-white/10",
                  ].join(" ")
                }
              >
                {it.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-white/10 px-4 py-4 text-sm">
        <div className="font-medium">{displayName || "Rupak Dutta"}</div>
        <div className="text-gray-300">{selectedAccount || "Amazon ABQ5"}</div>
      </div>
    </aside>
  );
}
