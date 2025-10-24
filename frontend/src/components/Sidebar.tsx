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

export default function Sidebar() {
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
        <div className="font-medium">Rupak Dutta</div>
        <div className="text-gray-300">Amazon ABQ5</div>
      </div>
    </aside>
  );
}
