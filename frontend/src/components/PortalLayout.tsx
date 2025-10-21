import { Outlet } from "react-router-dom";
import TopBanner from "./TopBanner";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";

export default function PortalLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopBanner />
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Topbar />
          <main className="mx-auto max-w-7xl px-4 py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
