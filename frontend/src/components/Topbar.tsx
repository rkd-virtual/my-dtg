import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { api } from "../lib/api";

export default function Topbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await api.post("/auth/session/logout");
    } catch {
      // ignore errors
    } finally {
      localStorage.removeItem("token");
      nav("/login", { replace: true });
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="relative z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4">
      <div className="flex items-center gap-3">
        <span className="text-lg font-semibold text-gray-800">DTG Portal</span>
      </div>

      <div className="flex items-center gap-4">
        <Link to="/support" className="text-sm text-gray-600 hover:text-amber-600">
          Support
        </Link>

        {/* Profile dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-white font-semibold hover:bg-amber-600 focus:outline-none"
          >
            R
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-lg border border-gray-200 bg-[#111827] shadow-lg">
              <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
                Signed in as <br />
                <span className="text-white font-medium">Rupak Dutta</span>
              </div>
              <Link
                to="/settings"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-sm text-gray-300 hover:bg-amber-500 hover:text-black transition"
              >
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-amber-500 hover:text-black transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
