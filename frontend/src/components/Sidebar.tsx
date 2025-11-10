import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

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
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [placement, setPlacement] = useState<"bottom" | "top">("bottom");

  const initialSelected = sessionStorage.getItem("selectedAccount") || null;
  const initialDisplayName = sessionStorage.getItem("userDisplayName") || null;
  const [selectedAccount, setSelectedAccount] = useState<string | null>(initialSelected);
  const [displayName, setDisplayName] = useState<string | null>(initialDisplayName);

  useEffect(() => {
    const storageHandler = (ev: StorageEvent) => {
      if (ev.key === "selectedAccount") setSelectedAccount(ev.newValue);
      if (ev.key === "userDisplayName") setDisplayName(ev.newValue);
    };

    const customHandler = (ev: Event) => {
      const detail = (ev as CustomEvent)?.detail;
      if (detail?.selectedAccount) {
        setSelectedAccount(detail.selectedAccount);
        try { sessionStorage.setItem("selectedAccount", detail.selectedAccount); } catch {}
      } else {
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

  // click-away + Esc
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!(e.target instanceof Node)) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  // toggle and choose placement based on available space
  const toggleMenu = () => {
    if (!triggerRef.current) {
      setMenuOpen((s) => !s);
      return;
    }

    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    // threshold approximates menu height; adjust if you change menu content
    const threshold = 220;

    if (spaceBelow < threshold && spaceAbove > spaceBelow) {
      setPlacement("top");
    } else {
      setPlacement("bottom");
    }

    setMenuOpen((s) => !s);
  };

  return (
    <aside className="hidden md:flex md:sticky md:top-0 md:h-screen w-60 shrink-0 flex-col border-r bg-gray-900 text-white overflow-auto pr-2">
      <div className="h-16 flex items-center px-4 text-lg font-semibold border-b border-white/10">
        <img
          src="https://cdn.prod.website-files.com/662ff5c6f25ded2dafa4403b/68599b5c2c568a6ebbb2c0ee_DTG-logo-white-large.svg"
          alt="Login Logo"
          className="sidebar1_logo"
        />
      </div>

      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {items.map((it) => (
            // <li key={it.to} className={it.label === "Settings" ? "pt-0 md:pt-[95px]" : ""}>
            <li key={it.to}>
              <NavLink
                to={it.to}
                className={({ isActive }) =>
                  [
                    "mx-2 block rounded-lg px-3 py-2 left-menu-font-size",
                    isActive ? "bg-white text-gray-900 font-semibold" : "text-gray-200 hover:bg-white/10",
                  ].join(" ")
                }
              >
                {it.label}
              </NavLink>

              {/* {it.label === "RMA" && <div className="my-3 mx-2 border-t border-white/10"></div>} */}
            </li>
          ))}
        </ul>
      </nav>

      {/* user + dropdown */}
      <div className="border-t border-white/10 px-4 py-4 text-sm relative" ref={menuRef}>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">{displayName || "John Doe"}</div>
            <div className="text-gray-300">{selectedAccount || "Amazon ABQ5"}</div>
          </div>

          <button
            ref={triggerRef}
            aria-haspopup="true"
            aria-expanded={menuOpen}
            onClick={toggleMenu}
            className="ml-3 w-8 h-8 rounded-full bg-yellow-500 text-white flex items-center justify-center font-medium focus:outline-none"
          >
            {displayName ? displayName.charAt(0).toUpperCase() : "J"}
          </button>
        </div>

        {menuOpen && (
          <div
            className={[
              "absolute left-4 right-4 bg-gray-800 rounded-lg shadow-lg border border-white/5 p-2 z-50",
              placement === "top" ? "bottom-full mb-3" : "top-full mt-3",
            ].join(" ")}
            role="menu"
          >
            <div className="px-3 py-2 text-xs text-gray-400">Signed in as</div>
            <div className="px-3 py-2 font-medium text-white">{displayName || "John Doe"}</div>
            <div className="border-t border-white/5 mt-2" />
            <button
              onClick={() => { setMenuOpen(false); navigate("/portal/settings"); }}
              className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-white/5 rounded"
            >
              Settings
            </button>
            <button
              onClick={() => { setMenuOpen(false); navigate("/logout"); }}
              className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-white/5 rounded"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
