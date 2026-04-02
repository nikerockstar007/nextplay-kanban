import { useDroppable } from "@dnd-kit/core";
import TaskCard from "./TaskCard";

export default function Column({
  id,
  title,
  tasks,
  accent,
  hint,
  onEditTask,
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur transition-all duration-200 ${
        isOver ? "scale-[1.01] ring-2 ring-slate-300 shadow-md" : ""
      }`}
    >
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`h-3 w-3 rounded-full ${accent}`} />
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {tasks.length}
          </span>
        </div>

        {hint && <p className="mt-2 text-xs text-slate-400">{hint}</p>}
      </div>

      <div className="min-h-[360px] space-y-3 rounded-2xl bg-slate-50 p-3">
        {tasks.length === 0 ? (
          <div className="flex h-28 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-center">
            <p className="text-sm font-medium text-slate-500">No items here</p>
            <p className="mt-1 text-xs text-slate-400">
              Drop a card here to update its stage
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEditTask} />
          ))
        )}
      </div>
    </div>
  );
}