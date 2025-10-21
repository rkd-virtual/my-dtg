type Props = {
  title: string;
  value: string | number;
  href?: string;
  icon?: React.ReactNode;
};

export default function StatCard({ title, value, href = "#", icon }: Props) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon ?? <span>📦</span>}
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        </div>
        <a className="text-sm text-blue-600 hover:underline" href={href}>View →</a>
      </div>
      <div className="mt-4 text-3xl font-bold">{value}</div>
    </div>
  );
}
