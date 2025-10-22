import React from 'react'

function Landing() {
  return (
    <div className="bg-gray-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-black to-gray-900">
        <div className="relative mx-auto max-w-7xl px-4 py-24 text-white">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              Powering Amazon Operations with Reliable Infrastructure
            </h1>
            <p className="mt-4 text-gray-300">
              Quote management, order tracking, and service support—centralized in one secure portal.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#features"
                className="rounded-lg bg-amber-500 px-5 py-3 text-sm font-semibold text-black hover:bg-amber-400"
              >
                Explore Features
              </a>
              <a
                href="#contact"
                className="rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Talk to Sales
              </a>
            </div>
          </div>
        </div>
        <svg className="absolute inset-x-0 bottom-0 h-16 w-full text-gray-50" viewBox="0 0 1440 64" fill="currentColor">
          <path d="M0,64L1440,0L1440,64L0,64Z"></path>
        </svg>
      </section>

      {/* Features */}
      <section id="features" className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold">Everything you need to run smoothly</h2>
            <p className="mt-2 text-gray-600">Fast access to quotes, orders, RMA, and support.</p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { k: "Q", t: "Quotes & Pricing", d: "Request, approve, and track quotes with real-time status." },
              { k: "O", t: "Orders & Shipments", d: "Monitor open orders and shipment timelines at a glance." },
              { k: "S", t: "Support & RMA", d: "Open tickets and RMAs, then track updates from one place." },
              { k: "A", t: "Account Controls", d: "Manage sites, roles, and permissions for your team." },
              { k: "I", t: "Integrations", d: "Salesforce and internal APIs connected through your portal." },
              { k: "S2", t: "Security", d: "Auth tokens or HttpOnly sessions with role-based access." },
            ].map((f) => (
              <div key={f.t} className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="mb-3 grid h-10 w-10 place-content-center rounded-lg bg-gray-100 text-gray-700">
                  {f.k}
                </div>
                <h3 className="text-lg font-semibold">{f.t}</h3>
                <p className="mt-2 text-sm text-gray-600">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl items-center gap-8 px-4 py-16 md:grid md:grid-cols-2">
          <div>
            <h3 className="text-2xl font-bold">Ready to streamline your Amazon operations?</h3>
            <p className="mt-2 text-gray-600">
              Get a personalized walkthrough and see how DTG can fit your workflow.
            </p>
          </div>
          <div className="mt-6 md:mt-0">
            <form className="rounded-2xl border bg-gray-50 p-4 sm:flex sm:gap-3">
              <input
                type="email"
                required
                placeholder="yourname@company.com"
                className="mb-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm sm:mb-0"
              />
              <button className="w-full rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 sm:w-auto">
                Request demo
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Landing