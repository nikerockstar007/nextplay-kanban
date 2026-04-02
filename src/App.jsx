import { useEffect, useMemo, useState } from "react";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { supabase } from "./lib/supabase";
import { enhanceTaskAI } from "./lib/aiHelper";
import Column from "./components/Column";
import Header from "./components/Header";
import StatsBar from "./components/StatsBar";
import SearchFilters from "./components/SearchFilters";
import SplashScreen from "./components/SplashScreen";
import EditTaskModal from "./components/EditTaskModal";

function laneLabel(status) {
  if (status === "todo") return "Game Plan";
  if (status === "in_progress") return "In Training";
  if (status === "in_review") return "Coach Review";
  if (status === "done") return "Match Ready";
  return "Game Plan";
}

const starterTeam = [
  { name: "Alex", color: "#2563eb" },
  { name: "Jordan", color: "#16a34a" },
  { name: "Taylor", color: "#f59e0b" },
  { name: "Casey", color: "#dc2626" },
];

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [comments, setComments] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("todo");
  const [assigneeId, setAssigneeId] = useState("");

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [isEnhancing, setIsEnhancing] = useState(false);
  const [aiPreview, setAiPreview] = useState(null);

  const [selectedTask, setSelectedTask] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingTask, setDeletingTask] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [addingComment, setAddingComment] = useState(false);

  useEffect(() => {
    initializeUser();
  }, []);

  useEffect(() => {
    if (selectedTask?.id) {
      fetchComments(selectedTask.id);
      fetchActivityLogs(selectedTask.id);
    } else {
      setComments([]);
      setActivityLogs([]);
      setCommentText("");
    }
  }, [selectedTask]);

  const sensors = useSensors(useSensor(PointerSensor));

  async function initializeUser() {
    setLoading(true);
    setError("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      setUser(session.user);
      await ensureUserSetup(session.user.id);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setUser(data.user);
    await ensureUserSetup(data.user.id);
    setLoading(false);
  }

  async function ensureUserSetup(userId) {
    await fetchTeamMembers(userId, true);
    await fetchTasks(userId);
  }

  async function fetchTasks(userId) {
    const { data, error } = await supabase
      .from("tasks")
      .select(`
        *,
        team_members (
          id,
          name,
          color
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      return;
    }

    setTasks(data || []);
  }

  async function fetchTeamMembers(userId, autoSeed = false) {
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .eq("user_id", userId)
      .order("name", { ascending: true });

    if (error) {
      setError(error.message);
      return;
    }

    if (autoSeed && (!data || data.length === 0)) {
      const rows = starterTeam.map((member) => ({
        ...member,
        user_id: userId,
      }));

      const { error: insertError } = await supabase
        .from("team_members")
        .insert(rows);

      if (insertError) {
        setError(insertError.message);
        return;
      }

      const { data: seededData, error: seededFetchError } = await supabase
        .from("team_members")
        .select("*")
        .eq("user_id", userId)
        .order("name", { ascending: true });

      if (seededFetchError) {
        setError(seededFetchError.message);
        return;
      }

      setTeamMembers(seededData || []);
      return;
    }

    setTeamMembers(data || []);
  }

  async function fetchComments(taskId) {
    const { data, error } = await supabase
      .from("task_comments")
      .select("*")
      .eq("task_id", taskId)
      .order("created_at", { ascending: true });

    if (error) {
      setError(error.message);
      return;
    }

    setComments(data || []);
  }

  async function fetchActivityLogs(taskId) {
    const { data, error } = await supabase
      .from("task_activity_log")
      .select("*")
      .eq("task_id", taskId)
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      return;
    }

    setActivityLogs(data || []);
  }

  async function addActivity(taskId, actionType, message) {
    const { error } = await supabase.from("task_activity_log").insert([
      {
        task_id: taskId,
        action_type: actionType,
        message,
      },
    ]);

    if (!error && selectedTask?.id === taskId) {
      await fetchActivityLogs(taskId);
    }
  }

  async function addComment() {
    if (!selectedTask?.id || !commentText.trim()) return;

    setAddingComment(true);
    setError("");

    const content = commentText.trim();

    const { error } = await supabase.from("task_comments").insert([
      {
        task_id: selectedTask.id,
        content,
      },
    ]);

    if (error) {
      setError(error.message);
      setAddingComment(false);
      return;
    }

    await addActivity(selectedTask.id, "comment", `Comment added: "${content}"`);
    await fetchComments(selectedTask.id);
    setCommentText("");
    setAddingComment(false);
  }

  async function handleEnhanceAI() {
    if (!title.trim()) {
      setError("Enter a title first so AI can enhance it.");
      return;
    }

    setError("");
    setIsEnhancing(true);
    setAiPreview(null);

    const result = await enhanceTaskAI(title, description);

    if (!result) {
      setError("AI enhancement failed. Check backend server and API key.");
      setIsEnhancing(false);
      return;
    }

    setAiPreview({
      title: result.improved_title || title,
      description: result.improved_description || description,
      priority: result.suggested_priority || "normal",
      due_date: result.suggested_due_date || "",
      recommended_status: result.recommended_status || "todo",
      recommendation: result.coaching_recommendation || "",
    });

    setIsEnhancing(false);
  }

  function applyAiSuggestion() {
    if (!aiPreview) return;

    setTitle(aiPreview.title || "");
    setDescription(aiPreview.description || "");
    setPriority(aiPreview.priority || "");
    setDueDate(aiPreview.due_date || "");
    setStatus(aiPreview.recommended_status || "todo");
  }

  async function createTask(e) {
    e.preventDefault();

    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }

    if (!user) {
      setError("No guest session found.");
      return;
    }

    setError("");

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      priority: priority || "normal",
      due_date: dueDate || null,
      status: status || "todo",
      assignee_id: assigneeId || null,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from("tasks")
      .insert([payload])
      .select()
      .single();

    if (error) {
      setError(error.message);
      return;
    }

    await addActivity(data.id, "created", `Task created in ${laneLabel(data.status)}.`);
    await fetchTasks(user.id);

    setTitle("");
    setDescription("");
    setPriority("");
    setDueDate("");
    setStatus("todo");
    setAssigneeId("");
    setAiPreview(null);
  }

  async function updateTaskStatus(taskId, newStatus) {
    const oldTask = tasks.find((t) => t.id === taskId);
    if (!oldTask || oldTask.status === newStatus) return;

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );

    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", taskId);

    if (error) {
      setError(error.message);
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, status: oldTask.status } : task
        )
      );
      return;
    }

    await addActivity(
      taskId,
      "status_change",
      `Moved from ${laneLabel(oldTask.status)} to ${laneLabel(newStatus)}.`
    );

    if (user?.id) {
      await fetchTasks(user.id);
    }
  }

  async function saveEditedTask(updatedTask) {
    if (!updatedTask.title?.trim()) {
      setError("Task title cannot be empty.");
      return;
    }

    setSavingEdit(true);
    setError("");

    const existingTask = tasks.find((task) => task.id === updatedTask.id);

    const payload = {
      title: updatedTask.title.trim(),
      description: updatedTask.description?.trim() || null,
      priority: updatedTask.priority || "normal",
      due_date: updatedTask.due_date || null,
      status: updatedTask.status || "todo",
      assignee_id: updatedTask.assignee_id || null,
    };

    const { error } = await supabase
      .from("tasks")
      .update(payload)
      .eq("id", updatedTask.id);

    if (error) {
      setError(error.message);
      setSavingEdit(false);
      return;
    }

    if (existingTask) {
      if (existingTask.title !== payload.title) {
        await addActivity(updatedTask.id, "edit", `Title changed to "${payload.title}".`);
      }
      if ((existingTask.description || "") !== (payload.description || "")) {
        await addActivity(updatedTask.id, "edit", "Description updated.");
      }
      if (existingTask.priority !== payload.priority) {
        await addActivity(
          updatedTask.id,
          "priority_change",
          `Priority changed from ${existingTask.priority} to ${payload.priority}.`
        );
      }
      if (existingTask.status !== payload.status) {
        await addActivity(
          updatedTask.id,
          "status_change",
          `Moved from ${laneLabel(existingTask.status)} to ${laneLabel(payload.status)}.`
        );
      }
      if ((existingTask.due_date || "") !== (payload.due_date || "")) {
        await addActivity(
          updatedTask.id,
          "due_date_change",
          `Target date updated to ${payload.due_date || "none"}.`
        );
      }
      if ((existingTask.assignee_id || "") !== (payload.assignee_id || "")) {
        const oldName = existingTask.team_members?.name || "Unassigned";
        const newMember = teamMembers.find((m) => m.id === payload.assignee_id);
        const newName = newMember?.name || "Unassigned";
        await addActivity(
          updatedTask.id,
          "assignee_change",
          `Assignee changed from ${oldName} to ${newName}.`
        );
      }
    }

    if (user?.id) {
      await fetchTasks(user.id);
    }

    await fetchActivityLogs(updatedTask.id);

    setSelectedTask(null);
    setSavingEdit(false);
  }

  async function deleteTask(taskToDelete) {
    setDeletingTask(true);
    setError("");

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskToDelete.id);

    if (error) {
      setError(error.message);
      setDeletingTask(false);
      return;
    }

    setTasks((prev) => prev.filter((task) => task.id !== taskToDelete.id));
    setSelectedTask(null);
    setDeletingTask(false);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id;

    if (taskId && newStatus) {
      updateTaskStatus(taskId, newStatus);
    }
  }

  const filteredTasks = useMemo(() => {
    const query = search.toLowerCase().trim();

    return tasks.filter((task) => {
      const matchesSearch =
        !query ||
        task.title?.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.team_members?.name?.toLowerCase().includes(query);

      const matchesPriority =
        priorityFilter === "all" ? true : task.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  }, [tasks, search, priorityFilter]);

  const todoTasks = filteredTasks.filter((task) => task.status === "todo");
  const inProgressTasks = filteredTasks.filter((task) => task.status === "in_progress");
  const inReviewTasks = filteredTasks.filter((task) => task.status === "in_review");
  const doneTasks = filteredTasks.filter((task) => task.status === "done");

  const totalTasks = tasks.length;
  const highPriorityCount = tasks.filter((task) => task.priority === "high").length;
  const overdueCount = tasks.filter((task) => {
    if (!task.due_date || task.status === "done") return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.due_date);
    due.setHours(0, 0, 0, 0);
    return due < today;
  }).length;
  const inProgressCount = tasks.filter((task) => task.status === "in_progress").length;
  const doneCount = tasks.filter((task) => task.status === "done").length;
  const assignedCount = tasks.filter((task) => task.assignee_id).length;

  function getCoachInsight() {
    if (aiPreview?.recommendation) return aiPreview.recommendation;
    if (overdueCount > 0) {
      return `${overdueCount} play(s) are overdue. Clear blockers before adding new work.`;
    }
    if (highPriorityCount >= 5) {
      return "High pressure zone. Prioritize execution and reduce context switching.";
    }
    if (inProgressCount > todoTasks.length && inProgressCount > 0) {
      return "Strong momentum. Team is actively executing more plays than planning.";
    }
    if (doneCount > 0 && totalTasks > 0 && doneCount >= Math.ceil(totalTasks / 2)) {
      return "Excellent delivery pace. More than half the board is already match-ready.";
    }
    if (assignedCount > 0) {
      return `${assignedCount} play(s) already have owners. Team momentum is building.`;
    }
    return "Board looks healthy. Use AI to refine the next play before saving.";
  }

  if (showSplash) {
    return <SplashScreen onEnter={() => setShowSplash(false)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-100 to-slate-50">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
          <p className="text-lg font-semibold text-slate-900">
            Loading your workspace...
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Creating guest session and syncing tasks
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <Header />
          <StatsBar tasks={tasks} />

          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Coach AI Insight</p>
                <p className="mt-1 text-sm text-slate-600">{getCoachInsight()}</p>
                <p className="mt-1 text-xs text-slate-400">
                  Live team signal powered by AI and workflow analytics.
                </p>
              </div>

              {aiPreview?.recommended_status && (
                <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                  Suggested Lane: {laneLabel(aiPreview.recommended_status)}
                </div>
              )}
            </div>
          </div>

          <SearchFilters
            search={search}
            setSearch={setSearch}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
          />

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Create New Play</h2>
              <p className="mt-2 text-sm text-slate-500">
                Add a new work item and assign ownership for execution.
              </p>

              <form onSubmit={createTask} className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter play or task title"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="4"
                    placeholder="Add notes, execution details, or coaching context"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Assign To
                  </label>
                  <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
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
                    Intensity
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                  >
                    <option value="">Let AI decide intensity</option>
                    <option value="low">Low intensity</option>
                    <option value="normal">Normal intensity</option>
                    <option value="high">High intensity</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Suggested Lane
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                  >
                    <option value="todo">Game Plan</option>
                    <option value="in_progress">In Training</option>
                    <option value="in_review">Coach Review</option>
                    <option value="done">Match Ready</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleEnhanceAI}
                    disabled={isEnhancing}
                    className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 font-medium text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isEnhancing ? "Thinking..." : "Enhance with AI"}
                  </button>

                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-slate-900 px-4 py-3 font-medium text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
                  >
                    Save Play
                  </button>
                </div>

                <p className="text-xs text-slate-400">
                  AI can refine wording, suggest intensity, target date, and best workflow lane.
                </p>
              </form>

              {aiPreview && (
                <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Coach AI Suggestion
                    </h3>
                    <span className="rounded-full bg-white px-2 py-1 text-[11px] font-medium text-blue-700">
                      Real AI
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-slate-700">Title: </span>
                      <span className="text-slate-600">{aiPreview.title}</span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Description: </span>
                      <span className="text-slate-600">{aiPreview.description}</span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Intensity: </span>
                      <span className="text-slate-600">{aiPreview.priority}</span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Target Date: </span>
                      <span className="text-slate-600">{aiPreview.due_date}</span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Best Lane: </span>
                      <span className="text-slate-600">
                        {laneLabel(aiPreview.recommended_status)}
                      </span>
                    </div>
                    {aiPreview.recommendation && (
                      <div>
                        <span className="font-medium text-slate-700">Coach Note: </span>
                        <span className="text-slate-600">{aiPreview.recommendation}</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={applyAiSuggestion}
                    className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700"
                  >
                    Apply Full AI Suggestion
                  </button>
                </div>
              )}
            </div>

            <div className="lg:col-span-3">
              <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
                  <Column
                    id="todo"
                    title="Game Plan"
                    hint="Ideas, upcoming work, and next plays"
                    tasks={todoTasks}
                    accent="bg-slate-500"
                    onEditTask={setSelectedTask}
                  />
                  <Column
                    id="in_progress"
                    title="In Training"
                    hint="Items currently being executed"
                    tasks={inProgressTasks}
                    accent="bg-blue-500"
                    onEditTask={setSelectedTask}
                  />
                  <Column
                    id="in_review"
                    title="Coach Review"
                    hint="Work under evaluation and refinement"
                    tasks={inReviewTasks}
                    accent="bg-amber-500"
                    onEditTask={setSelectedTask}
                  />
                  <Column
                    id="done"
                    title="Match Ready"
                    hint="Completed and ready for delivery"
                    tasks={doneTasks}
                    accent="bg-emerald-500"
                    onEditTask={setSelectedTask}
                  />
                </div>
              </DndContext>
            </div>
          </div>
        </div>
      </div>

      <EditTaskModal
        task={selectedTask}
        teamMembers={teamMembers}
        comments={comments}
        activityLogs={activityLogs}
        commentText={commentText}
        setCommentText={setCommentText}
        onAddComment={addComment}
        addingComment={addingComment}
        onClose={() => setSelectedTask(null)}
        onSave={saveEditedTask}
        onDelete={deleteTask}
        saving={savingEdit}
        deleting={deletingTask}
      />
    </>
  );
}