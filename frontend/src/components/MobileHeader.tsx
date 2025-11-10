import { useState } from "react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/portal/dashboard", label: "Dashboard" },
  { to: "/portal/orders", label: "Orders & Quotes" },
  { to: "/portal/shop", label: "Shop" },
  { to: "/portal/cart", label: "Cart" },
  { to: "/portal/support", label: "Support" },
  { to: "/portal/rma", label: "RMA" },
  { to: "/portal/settings", label: "Settings" },
];

export default function MobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* visible only on small screens */}
      <header className="md:hidden w-full bg-white border-b">
        <div className="flex items-center justify-between px-3 py-2">
          <button
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <div className="text-sm">Support</div>
            <div className="w-8 h-8 rounded-full bg-yellow-500 text-white flex items-center justify-center font-medium">R</div>
          </div>
        </div>
      </header>

      {/* Overlay + drawer */}
      <div
        className={`fixed inset-0 z-40 transition-opacity ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        aria-hidden={!open}
      >
        {/* overlay */}
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setOpen(false)}
        />

        {/* drawer panel */}
        <nav
          className={`absolute left-0 top-0 h-full w-72 bg-gray-900 text-white transform transition-transform duration-300
            ${open ? "translate-x-0" : "-translate-x-full"}`}
          aria-label="Mobile menu"
        >
          <div className="h-16 flex items-center px-4 text-lg font-semibold border-b border-white/10">
            <img
              src="https://cdn.prod.website-files.com/662ff5c6f25ded2dafa4403b/68599b5c2c568a6ebbb2c0ee_DTG-logo-white-large.svg"
              alt="DTG"
              className="sidebar1_logo"
            />
          </div>

          <ul className="py-4 space-y-1 px-2">
            {items.map((it) => (
              <li key={it.to} className={it.label === "Settings" ? "pt-0 md:pt-[95px]" : ""}>
                <NavLink
                  to={it.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    [
                      "block rounded-lg px-3 py-2 left-menu-font-size",
                      isActive ? "bg-white text-gray-900 font-semibold" : "text-gray-200 hover:bg-white/10",
                    ].join(" ")
                  }
                >
                  {it.label}
                </NavLink>

                {/* divider visible only on md+ (keeps drawer clean on mobile if you want) */}
                {it.label === "RMA" && <div className="hidden md:block my-3 border-t border-white/10 mx-2"></div>}
              </li>
            ))}
          </ul>

          <div className="border-t border-white/10 px-4 py-4 text-sm mt-auto">
            <div className="font-medium">Rupak Dutta</div>
            <div className="text-gray-300">Amazon ABQ5</div>
          </div>
        </nav>
      </div>
    </>
  );
}
