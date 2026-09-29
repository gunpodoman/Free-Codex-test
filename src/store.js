import { initialState } from "./data.js";
import { dateKey } from "./utils.js";

const STORAGE_KEY = "nexus.workspace.v1";
const listeners = new Set();
let state = loadState();

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.version === 1 && Array.isArray(parsed.projects) && Array.isArray(parsed.tasks) && Array.isArray(parsed.users)) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn("Nexus saved data could not be read; using a fresh workspace.", error);
  }
  return initialState();
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Nexus could not save this change.", error);
  }
}

function emit() {
  persist();
  for (const listener of listeners) listener(state);
}

function createId(prefix) {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`}`;
}

function addActivity(type, target, projectId, actorId = state.users[0]?.id) {
  state.activity.unshift({ id: createId("a"), type, target, projectId, actorId, createdAt: new Date().toISOString() });
  state.activity = state.activity.slice(0, 100);
}

export const getState = () => state;
export const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export const getProject = (id) => state.projects.find((project) => project.id === id);
export const getTask = (id) => state.tasks.find((task) => task.id === id);
export const getUser = (id) => state.users.find((user) => user.id === id);

export function projectProgress(projectId) {
  const tasks = state.tasks.filter((task) => task.projectId === projectId);
  if (!tasks.length) return 0;
  return Math.round((tasks.filter((task) => task.status === "Done").length / tasks.length) * 100);
}

export function updateTask(id, patch) {
  const task = getTask(id);
  if (!task) return false;
  const oldStatus = task.status;
  Object.assign(task, patch, { updatedAt: new Date().toISOString() });
  if (patch.status && patch.status !== oldStatus) {
    task.completedAt = patch.status === "Done" ? new Date().toISOString() : null;
    addActivity(patch.status === "Done" ? "completed" : "updated", task.title, task.projectId);
  } else if (patch.assigneeId) {
    const assignee = getUser(patch.assigneeId);
    if (assignee) addActivity("assigned", `${task.title} to ${assignee.name}`, task.projectId);
  } else if (patch.title) {
    addActivity("updated", task.title, task.projectId);
  }
  emit();
  return true;
}

export function addTask(values) {
  const now = new Date().toISOString();
  const task = {
    id: createId("t"), title: values.title.trim(), description: values.description || "", projectId: values.projectId,
    status: values.status || "Todo", priority: values.priority || "Medium", assigneeId: values.assigneeId || state.users[0].id,
    dueDate: values.dueDate || "", tag: values.tag || "General", createdAt: now,
    updatedAt: now, completedAt: values.status === "Done" ? now : null, subtasks: [], comments: []
  };
  state.tasks.unshift(task);
  addActivity("created", task.title, task.projectId);
  emit();
  return task;
}

export function deleteTask(id) {
  const task = getTask(id);
  if (!task) return false;
  state.tasks = state.tasks.filter((item) => item.id !== id);
  addActivity("deleted", task.title, task.projectId);
  emit();
  return true;
}

export function addProject(values) {
  const project = {
    id: createId("p"), name: values.name.trim(), description: values.description || "", color: values.color || "#6e83d9",
    icon: "layers", status: values.status || "Active", leadId: values.leadId || state.users[0].id,
    dueDate: values.dueDate || "", members: [values.leadId || state.users[0].id], updatedAt: new Date().toISOString()
  };
  state.projects.unshift(project);
  addActivity("created-project", project.name, project.id);
  emit();
  return project;
}

export function updateProject(id, patch) {
  const project = getProject(id);
  if (!project) return false;
  Object.assign(project, patch, { updatedAt: new Date().toISOString() });
  if (patch.leadId && !project.members.includes(patch.leadId)) project.members = [...project.members, patch.leadId];
  addActivity("updated", project.name, project.id);
  emit();
  return true;
}

export function addProjectFile(id, file) {
  const project = getProject(id);
  if (!project || !file?.name) return false;
  project.files ||= [];
  project.files.unshift({
    id: createId("f"), name: file.name, size: file.size, type: file.type || "file",
    updated: "Just now", content: file.content || "", data: file.data || "", mime: file.mime || "text/plain"
  });
  addActivity("updated", `Added ${file.name}`, project.id);
  emit();
  return true;
}

export function removeProjectFile(id, index) {
  const project = getProject(id);
  if (!project?.files?.[index]) return false;
  const [file] = project.files.splice(index, 1);
  addActivity("updated", `Removed ${file.name}`, project.id);
  emit();
  return true;
}

export function addComment(taskId, text) {
  const task = getTask(taskId);
  const value = text.trim();
  if (!task || !value) return false;
  task.comments ||= [];
  task.comments.push({ id: createId("c"), authorId: state.users[0].id, text: value, createdAt: new Date().toISOString() });
  task.updatedAt = new Date().toISOString();
  addActivity("commented", task.title, task.projectId);
  emit();
  return true;
}

export function addSubtask(taskId, title) {
  const task = getTask(taskId);
  const value = title.trim();
  if (!task || !value) return false;
  task.subtasks ||= [];
  task.subtasks.push({ id: createId("s"), title: value, done: false });
  task.updatedAt = new Date().toISOString();
  emit();
  return true;
}

export function toggleSubtask(taskId, subtaskId) {
  const task = getTask(taskId);
  const subtask = task?.subtasks?.find((item) => item.id === subtaskId);
  if (!subtask) return false;
  subtask.done = !subtask.done;
  task.updatedAt = new Date().toISOString();
  emit();
  return true;
}

export function markAllNotificationsRead() {
  state.notifications.forEach((notification) => { notification.read = true; });
  emit();
}

export function markNotificationRead(id) {
  const notification = state.notifications.find((item) => item.id === id);
  if (!notification) return false;
  notification.read = true;
  emit();
  return true;
}

export function updatePreferences(patch) {
  state.preferences = { ...state.preferences, ...patch };
  emit();
}

export function updateProfile(patch) {
  state.profile = { ...state.profile, ...patch };
  const me = state.users[0];
  if (patch.name && me) {
    me.name = patch.name;
    me.initials = patch.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  }
  if (patch.role && me) me.role = patch.role;
  emit();
}

export function resetWorkspace() {
  state = initialState();
  emit();
}

window.addEventListener("storage", (event) => {
  if (event.key !== STORAGE_KEY || !event.newValue) return;
  try {
    const next = JSON.parse(event.newValue);
    if (next.version === 1) {
      state = next;
      for (const listener of listeners) listener(state);
    }
  } catch (error) {
    console.warn("Nexus ignored invalid data from another tab.", error);
  }
});

export const todayKey = () => dateKey(new Date());
