export default function SearchFilters({
    search,
    setSearch,
    priorityFilter,
    setPriorityFilter,
  }) {
    return (
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plays, reviews, or work items..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
          />
  
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
          >
            <option value="all">All intensity levels</option>
            <option value="high">High intensity</option>
            <option value="normal">Normal intensity</option>
            <option value="low">Low intensity</option>
          </select>
        </div>
      </div>
    );
  }