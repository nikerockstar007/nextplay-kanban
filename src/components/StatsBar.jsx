function StatCard({ label, value, tone }) {
    return (
      <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
        <div className={`mb-3 h-1.5 w-12 rounded-full ${tone}`} />
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      </div>
    );
  }
  
  export default function StatsBar({ tasks }) {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;
    const overdue = tasks.filter(
      (t) =>
        t.due_date &&
        new Date(t.due_date) < new Date(new Date().toDateString()) &&
        t.status !== "done"
    ).length;
  
    return (
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Plays" value={total} tone="bg-slate-500" />
        <StatCard label="In Training" value={inProgress} tone="bg-blue-500" />
        <StatCard label="Match Ready" value={done} tone="bg-emerald-500" />
        <StatCard label="Needs Attention" value={overdue} tone="bg-red-500" />
      </div>
    );
  }