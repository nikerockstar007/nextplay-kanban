import { useEffect, useState } from "react";

function formatDateTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString();
}

export default function EditTaskModal({
  task,
  teamMembers,
  comments,
  activityLogs,
  commentText,
  setCommentText,
  onAddComment,
  addingComment,
  onClose,
  onSave,
  onDelete,
  saving,
  deleting,
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "normal",
    due_date: "",
    status: "todo",
    assignee_id: "",
  });

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "normal",
        due_date: task.due_date || "",
        status: task.status || "todo",
        assignee_id: task.assignee_id || "",
      });
    }
  }, [task]);

  if (!task) return null;

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      ...task,
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Edit Play</h2>
            <p className="mt-1 text-sm text-slate-500">
              Update play details, assignee, comments, and activity.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <form onSubmit={handleSubmit} className="space-y-4 xl:col-span-1">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                rows="4"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Intensity
                </label>
                <select
                  value={form.priority}
                  onChange={(e) => updateField("priority", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                >
                  <option value="low">Low intensity</option>
                  <option value="normal">Normal intensity</option>
                  <option value="high">High intensity</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Lane
                </label>
                <select
                  value={form.status}
                  onChange={(e) => updateField("status", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                >
                  <option value="todo">Game Plan</option>
                  <option value="in_progress">In Training</option>
                  <option value="in_review">Coach Review</option>
                  <option value="done">Match Ready</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Assign To
                </label>
                <select
                  value={form.assignee_id}
                  onChange={(e) => updateField("assignee_id", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Target Date
                </label>
                <input
                  type="date"
                  value={form.due_date || ""}
                  onChange={(e) => updateField("due_date", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                type="button"
                onClick={() => onDelete(task)}
                disabled={deleting}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete Play"}
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 xl:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Task Comments</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Capture updates and collaboration notes.
                </p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                {comments.length} comment{comments.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <textarea
                rows="3"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment or status update..."
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-500"
              />

              <button
                type="button"
                onClick={onAddComment}
                disabled={addingComment}
                className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {addingComment ? "Adding comment..." : "Add Comment"}
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {comments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-center">
                  <p className="text-sm font-medium text-slate-500">No comments yet</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Add the first update for this play.
                  </p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <p className="text-sm leading-6 text-slate-700">{comment.content}</p>
                    <p className="mt-2 text-xs text-slate-400">
                      {formatDateTime(comment.created_at)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 xl:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Activity Log</h3>
                <p className="mt-1 text-sm text-slate-500">
                  View all important changes made to this play.
                </p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                {activityLogs.length} event{activityLogs.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {activityLogs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-center">
                  <p className="text-sm font-medium text-slate-500">No activity yet</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Activity will appear when this play changes.
                  </p>
                </div>
              ) : (
                activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <p className="text-sm leading-6 text-slate-700">{log.message}</p>
                    <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">
                      {log.action_type}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatDateTime(log.created_at)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}