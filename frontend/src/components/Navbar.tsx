import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { clearToken, getToken } from "../lib/auth";

/**
 * Configure your menus here
 */
const NAV_ITEMS: Array<
  | { label: string; to: string; submenu?: undefined }
  | { label: string; to?: string; submenu: Array<{ label: string; to: string }> }
> = [
  {
    label: "Industries",
    submenu: [
      { label: "Warehouse Logistics", to: "/industries/warehouse-logistics" },
      { label: "Manufacturing", to: "/industries/manufacturing" },
      { label: "Biopharma", to: "/industries/biopharma" },
      { label: "Hospitality", to: "/industries/hospitality" },
      { label: "Healthcare", to: "/industries/healthcare" },      
    ],
  },
  {
    label: "Products",
    submenu: [
      { label: "Battery Systems", to: "/battery-systems" },
      { label: "Mobile Workstations", to: "/industries/warehouse-logistics" },
      { label: "Hospitality Carts", to: "/industries/hospitality" },
      { label: "Cleanroom Carts", to: "/industries/biopharma" },
      { label: "Workstation on Wheels", to: "/industries/healthcare" },
      { label: "OEM & Custom Solutions", to: "/oem-custom-solutions" },
    ],
  },
  {
    label: "Resources",
    submenu: [
      { label: "Resource Library", to: "/resources/resource-library" },
      { label: "Support", to: "/resources/support" },
      { label: "Blog", to: "/resources/blog" },
    ],
  },
  { label: "About Us", to: "/about-us" },
  { label: "Contact Us", to: "/contact-us" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null); // mobile submenu
  const nav = useNavigate();
  const authed = !!getToken();

  const handleLogout = () => {
    clearToken();
    nav("/login");
  };

  return (
    <header className="sticky top-0 z-40 bg-black text-white shadow">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <Link to="/dashboard" className="text-lg font-semibold tracking-tight">
          DTG Portal
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_ITEMS.map((item) =>
            item.submenu ? (
              <div key={item.label} className="group relative">
                <button
                  className="inline-flex items-center gap-1 text-base font-medium hover:text-gray-200 focus:outline-none"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  {item.label}
                  <svg
                    className="h-4 w-4 opacity-80 transition-transform group-hover:rotate-180"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.086l3.71-3.855a.75.75 0 011.08 1.04l-4.24 4.41a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z" />
                  </svg>
                </button>
                {/* Dropdown */}
                <div
                  className="invisible absolute left-0 mt-2 w-56 rounded-xl border border-white/10 bg-neutral-900 p-2 opacity-0 shadow-lg ring-1 ring-white/10 transition-all group-hover:visible group-hover:opacity-100"
                  role="menu"
                >
                  {item.submenu.map((sub) => (
                    <NavLink
                      key={sub.to}
                      to={sub.to}
                      className={({ isActive }) =>
                        [
                          "block rounded-lg px-3 py-2 text-sm",
                          "hover:bg-white/10 focus:bg-white/10 focus:outline-none",
                          isActive ? "text-amber-300" : "text-white/90",
                        ].join(" ")
                      }
                      role="menuitem"
                    >
                      {sub.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ) : (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "text-sm font-medium hover:text-gray-200",
                    isActive ? "text-amber-300" : "text-white",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            )
          )}

          {/* Account menu (only when authenticated) */}
          {/* 
          {authed && (
            <div className="relative group">
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-semibold hover:bg-white/20 focus:outline-none"
                aria-haspopup="true"
                aria-expanded="false"
                title="Account"
              >
              
                <span>◉</span>
              </button>
              <div className="invisible absolute right-0 mt-2 w-40 rounded-xl border border-white/10 bg-neutral-900 p-2 opacity-0 shadow-lg ring-1 ring-white/10 transition-all group-hover:visible group-hover:opacity-100">
                <Link
                  to="/dashboard"
                  className="block rounded-lg px-3 py-2 text-sm text-white/90 hover:bg-white/10"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-white/90 hover:bg-white/10"
                >
                  Logout
                </button>
              </div>
            </div>
          )} */}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/10 focus:outline-none md:hidden"
          aria-label="Open main menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
            {mobileOpen ? (
              <path
                fillRule="evenodd"
                d="M6.225 4.811a1 1 0 011.414 0L12 9.172l4.361-4.361a1 1 0 111.415 1.415L13.415 10.586l4.361 4.361a1 1 0 01-1.415 1.415L12 12l-4.361 4.362a1 1 0 01-1.414-1.415l4.361-4.361-4.361-4.361a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            ) : (
              <path
                fillRule="evenodd"
                d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"
                clipRule="evenodd"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile panel */}
      {mobileOpen && (
        <div className="border-t border-white/10 md:hidden">
          <div className="mx-auto max-w-6xl px-4 py-3">
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const hasSub = !!(item as any).submenu;
                return (
                  <li key={item.label} className="py-1">
                    {/* Top-level button/link */}
                    {hasSub ? (
                      <button
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-white/10"
                        onClick={() =>
                          setExpanded((v) => (v === item.label ? null : item.label))
                        }
                        aria-expanded={expanded === item.label}
                      >
                        <span>{item.label}</span>
                        <svg
                          className={`h-4 w-4 transition-transform ${
                            expanded === item.label ? "rotate-180" : ""
                          }`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.086l3.71-3.855a.75.75 0 011.08 1.04l-4.24 4.41a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z" />
                        </svg>
                      </button>
                    ) : (
                      <NavLink
                        to={(item as any).to}
                        className="block rounded-lg px-3 py-2 text-sm hover:bg-white/10"
                        onClick={() => setMobileOpen(false)}
                      >
                        {item.label}
                      </NavLink>
                    )}

                    {/* Mobile submenu */}
                    {hasSub && expanded === item.label && (
                      <ul className="mt-1 space-y-1 pl-3">
                        {(item as any).submenu.map((sub: any) => (
                          <li key={sub.to}>
                            <NavLink
                              to={sub.to}
                              className="block rounded-lg px-3 py-2 text-sm text-white/90 hover:bg-white/10"
                              onClick={() => setMobileOpen(false)}
                            >
                              {sub.label}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}

              {/* Account group (mobile) */}
              {authed && (
                <>
                  <li className="mt-2 border-t border-white/10 pt-2 text-xs uppercase tracking-wide text-white/60">
                    Account
                  </li>
                  <li>
                    <Link
                      to="/dashboard"
                      className="block rounded-lg px-3 py-2 text-sm hover:bg-white/10"
                      onClick={() => setMobileOpen(false)}
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        handleLogout();
                      }}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-white/10"
                    >
                      Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
