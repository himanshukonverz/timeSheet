export const AnalyticsCard = ({ title, value, icon, trend, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colors[color] || colors.blue}`}>
          <span className="text-xl">{icon}</span>
        </div>
        {trend && (
          <span className="text-[10px] font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full">
            {trend}
          </span>
        )}
        <h2 className="text-3xl font-bold text-slate-800 mt-1">{value}</h2>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
      </div>
    </div>
  );
};