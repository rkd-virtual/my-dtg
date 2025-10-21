import StatCard from "../components/StatCard";
import { useState } from "react";

const accounts = ["Amazon ABQ5", "Amazon XY21", "Amazon XY22"];

export default function Dashboard() {
  const [account, setAccount] = useState(accounts[0]);

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-semibold">Hello, Rupak</h1>
        <p className="text-gray-600">DEV, {account}</p>
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
        <h2 className="text-lg font-semibold">Amazon ABQ5 Open Quotes and Orders</h2>
        <p className="text-sm text-gray-600">Your pending quotes and orders that have yet to be shipped.</p>

        <div className="grid gap-4 md:grid-cols-2">
          <StatCard title="Open Quotes" value={0} href="/orders?tab=quotes" icon={<span>🧾</span>} />
          <StatCard title="Open Orders" value={1} href="/orders?tab=orders" icon={<span>📑</span>} />
        </div>
      </section>
    </div>
  );
}
