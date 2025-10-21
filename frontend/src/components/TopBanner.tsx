export default function TopBanner() {
  return (
    <div className="w-full bg-amber-500 text-black text-center text-sm font-medium">
      <div className="mx-auto max-w-7xl px-4 py-2 relative">
        This is a test site that will be launching soon, for all quotes please contact sales@dtgpower.com
        <button
          onClick={(e) => (e.currentTarget.parentElement!.parentElement!.style.display = "none")}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-black/10"
          aria-label="Dismiss"
          title="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
