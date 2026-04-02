import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

function priorityStyle(priority) {
  if (priority === "high") return "bg-red-100 text-red-700";
  if (priority === "low") return "bg-emerald-100 text-emerald-700";
  return "bg-amber-100 text-amber-700";
}

function priorityLabel(priority) {
  if (priority === "high") return "High";
  if (priority === "low") return "Low";
  return "Normal";
}

function getDueStatus(date, taskStatus) {
  if (!date || taskStatus === "done") return "none";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(date);
  due.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "overdue";
  if (diffDays <= 2) return "soon";
  return "normal";
}

function dueBadgeClass(status) {
  if (status === "overdue") return "bg-red-100 font-medium text-red-700";
  if (status === "soon") return "bg-yellow-100 font-medium text-yellow-700";
  return "bg-slate-100 text-slate-500";
}

function dueBadgeLabel(status, date) {
  if (status === "overdue") return `Overdue · ${date}`;
  if (status === "soon") return `Due Soon · ${date}`;
  return `Target · ${date}`;
}

export default function TaskCard({ task, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const assignee = task.team_members;
  const dueStatus = getDueStatus(task.due_date, task.status);

  function handleCardClick(e) {
    e.stopPropagation();
    if (onEdit) onEdit(task);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onDoubleClick={handleCardClick}
      className={`group cursor-grab rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(15,23,42,0.12)] ${
        isDragging ? "scale-[1.03] rotate-[0.5deg] opacity-75 shadow-xl" : ""
      }`}
      title="Double-click to edit"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">{task.title}</p>
          {task.description && (
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {task.description}
            </p>
          )}
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${priorityStyle(
            task.priority
          )}`}
        >
          {priorityLabel(task.priority)}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-500">
          {task.status === "todo"
            ? "Game Plan"
            : task.status === "in_progress"
            ? "In Training"
            : task.status === "in_review"
            ? "Coach Review"
            : "Match Ready"}
        </span>

        {task.due_date && (
          <span className={`rounded-full px-2 py-1 ${dueBadgeClass(dueStatus)}`}>
            {dueBadgeLabel(dueStatus, task.due_date)}
          </span>
        )}

        {assignee && (
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2 py-1 text-slate-600">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: assignee.color || "#64748b" }}
            />
            {assignee.name}
          </span>
        )}
      </div>

      {assignee && (
        <div className="mt-3 flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: assignee.color || "#64748b" }}
          >
            {assignee.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <p className="text-xs text-slate-500">Assigned to {assignee.name}</p>
        </div>
      )}

      <button
        type="button"
        onClick={handleCardClick}
        className="mt-4 text-xs font-medium text-blue-600 transition hover:text-blue-700"
      >
        Edit task
      </button>
    </div>
  );
}