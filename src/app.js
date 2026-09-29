import { icon } from "./icons.js";
import { addComment, addProject, addProjectFile, addSubtask, deleteTask, getProject, getState, markAllNotificationsRead, markNotificationRead, removeProjectFile, resetWorkspace, subscribe, todayKey, toggleSubtask, updatePreferences, updateProfile, updateProject, updateTask } from "./store.js";
import { renderDialogs, renderPage, renderSidebar, renderTopbar } from "./views.js";
import { formatDate } from "./utils.js";

const app = document.querySelector("#app");
const ui = {
  search: { projects: "", tasks: "", activity: "" },
  projectView: "grid",
  projectStatus: "All projects",
  projectSort: "Recently updated",
  taskStatus: "All statuses",
  taskPriority: "All priorities",
  taskProject: "All projects",
  taskSort: "Due date",
  boardProject: "All projects",
  activityFilter: "All activity",
  settingsTab: "Profile",
  projectTab: "Overview",
  calendarCursor: new Date(),
  selectedCalendarDate: todayKey(),
  mobileNavOpen: false,
  sidebarCollapsed: false,
  searchOpen: false,
  globalSearch: "",
  modal: null,
  taskDetailId: null,
  popover: null
};

function currentRoute() {
  const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  if (parts[0] === "project" && parts[1]) return { page: "project", projectId: parts[1] };
  const allowed = new Set(["overview", "projects", "tasks", "board", "calendar", "analytics", "activity", "settings"]);
  return { page: allowed.has(parts[0]) ? parts[0] : "overview", projectId: null };
}

function applyTheme() {
  const theme = getState().preferences?.theme || "light";
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia?.("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
  document.documentElement.dataset.themePreference = theme;
}

function focusSnapshot() {
  const active = document.activeElement;
  if (!active?.dataset?.focusKey) return null;
  return { key: active.dataset.focusKey, start: active.selectionStart, end: active.selectionEnd };
}

function restoreFocus(snapshot) {
  if (!snapshot) return;
  const target = [...document.querySelectorAll("[data-focus-key]")].find((item) => item.dataset.focusKey === snapshot.key);
  if (!target) return;
  target.focus({ preventScroll: true });
  if (typeof snapshot.start === "number" && typeof target.setSelectionRange === "function") {
    try { target.setSelectionRange(snapshot.start, snapshot.end); } catch { /* Inputs such as date selectors do not expose a selection range. */ }
  }
}

function showActiveDialog() {
  const id = ui.taskDetailId ? "task-detail-dialog"
    : ui.searchOpen ? "global-search-dialog"
      : ui.modal === "create-task" ? "create-task-dialog"
        : ["create-project", "edit-project"].includes(ui.modal) ? "project-dialog"
          : ui.modal === "help" ? "help-dialog" : null;
  if (!id) return;
  const dialog = document.getElementById(id);
  if (dialog && !dialog.open) dialog.showModal();
}

function render() {
  const focus = focusSnapshot();
  applyTheme();
  const state = getState();
  const route = currentRoute();
  app.innerHTML = `${renderSidebar(state, route, ui)}<div class="main-shell">${renderTopbar(state, route, ui)}<main id="main-content" class="main-content">${renderPage(state, route, ui)}</main></div>${ui.mobileNavOpen ? `<button class="mobile-scrim" aria-label="Close navigation" data-action="close-mobile-nav"></button>` : ""}${renderDialogs(state, ui)}`;
  app.classList.toggle("sidebar-collapsed", ui.sidebarCollapsed);
  app.classList.toggle("compact-mode", Boolean(state.preferences.compactMode));
  showActiveDialog();
  restoreFocus(focus);
}

function closePanels() {
  ui.modal = null;
  ui.taskDetailId = null;
  ui.searchOpen = false;
  ui.popover = null;
}

function closeActiveDialog() {
  closePanels();
  render();
}

const toastRegion = document.querySelector("#toast-region");
function toast(message, type = "success") {
  const node = document.createElement("div");
  node.className = `toast toast-${type}`;
  node.innerHTML = `<span class="toast-icon">${icon(type === "error" ? "flag" : "checkCircle", 17)}</span><span>${message}</span><button class="icon-button icon-button-xs" aria-label="Dismiss notification">${icon("close", 14)}</button>`;
  node.querySelector("button").addEventListener("click", () => node.remove());
  toastRegion.append(node);
  window.setTimeout(() => node.remove(), 3800);
}

function navigate(page) {
  ui.mobileNavOpen = false;
  ui.popover = null;
  location.hash = `#/${page}`;
}

function bytesToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunk) {
    binary += String.fromCharCode(...bytes.subarray(offset, Math.min(bytes.length, offset + chunk)));
  }
  return btoa(binary);
}

function downloadFile(file) {
  let blob;
  if (file.data) {
    const binary = atob(file.data);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    blob = new Blob([bytes], { type: file.mime || "application/octet-stream" });
  } else {
    blob = new Blob([file.content || ""], { type: file.mime || "text/markdown;charset=utf-8" });
  }
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.name;
  anchor.click();
  URL.revokeObjectURL(url);
}

function exportAnalytics() {
  const state = getState();
  const rows = [["Project", "Status", "Progress", "Tasks", "Completed"]];
  for (const project of state.projects) {
    const tasks = state.tasks.filter((task) => task.projectId === project.id);
    const done = tasks.filter((task) => task.status === "Done").length;
    rows.push([project.name, project.status, `${tasks.length ? Math.round(done / tasks.length * 100) : 0}%`, tasks.length, done]);
  }
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `nexus-project-summary-${todayKey()}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
  toast("Analytics summary downloaded.");
}

function handleAction(button) {
  const action = button.dataset.action;
  const id = button.dataset.id;
  if (action === "navigate") navigate(button.dataset.page);
  else if (action === "view-all-projects") navigate("projects");
  else if (action === "open-project") {
    ui.searchOpen = false;
    ui.globalSearch = "";
    ui.popover = null;
    ui.projectTab = "Overview";
    ui.mobileNavOpen = false;
    location.hash = `#/project/${id}`;
  } else if (action === "open-task") {
    ui.searchOpen = false;
    ui.globalSearch = "";
    ui.taskDetailId = id;
    ui.popover = null;
    render();
  } else if (action === "create-task" || action === "create-task-in-status" || action === "create-task-for-project" || action === "create-task-on-date") {
    ui.searchOpen = false;
    ui.modal = "create-task";
    ui.createTaskStatus = action === "create-task-in-status" ? button.dataset.status : "Todo";
    ui.createTaskProject = action === "create-task-for-project" ? id : null;
    ui.createTaskDate = action === "create-task-on-date" ? button.dataset.day : "";
    render();
  } else if (action === "create-project") {
    ui.modal = "create-project";
    render();
  } else if (action === "edit-project") {
    ui.editingProjectId = id;
    ui.modal = "edit-project";
    render();
  } else if (action === "set-project-tab") {
    ui.projectTab = button.dataset.tab;
    render();
  } else if (action === "set-project-view") {
    ui.projectView = button.dataset.view;
    render();
  } else if (action === "clear-project-filters") {
    ui.search.projects = "";
    ui.projectStatus = "All projects";
    render();
  } else if (action === "clear-task-filters") {
    ui.search.tasks = "";
    ui.taskStatus = "All statuses";
    ui.taskPriority = "All priorities";
    ui.taskProject = "All projects";
    render();
  } else if (action === "set-activity-filter") {
    ui.activityFilter = button.dataset.filter;
    render();
  } else if (action === "set-settings-tab") {
    ui.settingsTab = button.dataset.tab;
    render();
  } else if (action === "set-theme") {
    updatePreferences({ theme: button.dataset.theme });
    toast(`${button.dataset.theme[0].toUpperCase()}${button.dataset.theme.slice(1)} appearance applied.`);
  } else if (action === "calendar-prev" || action === "calendar-next") {
    const cursor = ui.calendarCursor instanceof Date ? ui.calendarCursor : new Date();
    ui.calendarCursor = new Date(cursor.getFullYear(), cursor.getMonth() + (action === "calendar-next" ? 1 : -1), 1);
    render();
  } else if (action === "calendar-today") {
    ui.calendarCursor = new Date();
    ui.selectedCalendarDate = todayKey();
    render();
  } else if (action === "select-calendar-day") {
    ui.selectedCalendarDate = button.dataset.day;
    render();
  } else if (action === "toggle-notifications") {
    ui.popover = ui.popover === "notifications" ? null : "notifications";
    render();
  } else if (action === "mark-all-read") {
    markAllNotificationsRead();
    toast("All notifications marked as read.");
  } else if (action === "open-notification") {
    const notification = getState().notifications.find((item) => item.id === id);
    ui.popover = null;
    if (notification) markNotificationRead(id);
    if (notification?.projectId) {
      ui.projectTab = "Overview";
      location.hash = `#/project/${notification.projectId}`;
    }
  } else if (action === "open-search") {
    ui.searchOpen = true;
    ui.globalSearch = "";
    ui.popover = null;
    render();
  } else if (action === "search-example") {
    ui.globalSearch = button.dataset.query;
    render();
  } else if (action === "close-dialog") closeActiveDialog();
  else if (action === "delete-task") {
    if (window.confirm("Delete this task? This action cannot be undone from the workspace.")) {
      deleteTask(id);
      ui.taskDetailId = null;
      toast("Task deleted.");
    }
  } else if (action === "complete-task") {
    const task = getState().tasks.find((item) => item.id === id);
    if (task && task.status !== "Done") {
      updateTask(id, { status: "Done" });
      toast("Task marked complete.");
    }
  } else if (action === "toggle-subtask-form") {
    const form = document.querySelector(".subtask-add-form");
    form?.classList.toggle("hidden");
    form?.querySelector("input")?.focus();
  } else if (action === "comment-help") {
    toast("Keep comments focused on decisions, context, and useful questions.");
  } else if (action === "activity-target") {
    if (id) {
      ui.projectTab = "Overview";
      location.hash = `#/project/${id}`;
    }
  } else if (action === "reset-workspace") {
    if (window.confirm("Reset Nexus to its original sample data? Your local changes will be removed.")) {
      resetWorkspace();
      ui.settingsTab = "Profile";
      toast("Workspace data reset to the starter set.");
    }
  } else if (action === "export-analytics") exportAnalytics();
  else if (action === "toggle-mobile-nav") {
    ui.mobileNavOpen = !ui.mobileNavOpen;
    render();
  } else if (action === "close-mobile-nav") {
    ui.mobileNavOpen = false;
    render();
  } else if (action === "toggle-sidebar") {
    ui.sidebarCollapsed = !ui.sidebarCollapsed;
    render();
  } else if (action === "workspace-menu") {
    toast("Northstar Studio is your current workspace.");
  } else if (action === "profile-settings") {
    ui.settingsTab = "Profile";
    navigate("settings");
  } else if (action === "help") {
    ui.modal = "help";
    render();
  } else if (action === "download-project-file") {
    const project = getProject(id), file = project?.files?.[Number(button.dataset.index)];
    if (file) downloadFile(file);
  } else if (action === "remove-project-file") {
    if (window.confirm("Remove this file from the project?")) {
      removeProjectFile(id, Number(button.dataset.index));
      toast("File removed from the project.");
    }
  } else if (action === "board-filter") {
    const select = document.querySelector("[data-filter='boardProject']");
    select?.focus();
  }
}

document.addEventListener("click", (event) => {
  const routeLink = event.target.closest("a[href^='#/']");
  if (routeLink && ui.mobileNavOpen) {
    event.preventDefault();
    ui.mobileNavOpen = false;
    if (location.hash !== routeLink.hash) location.hash = routeLink.hash;
    else render();
    return;
  }
  const button = event.target.closest("[data-action]");
  if (button?.matches("input[type='checkbox'][data-action='toggle-subtask']")) return;
  if (button) {
    event.preventDefault();
    handleAction(button);
    return;
  }
  if (ui.popover && !event.target.closest(".popover-anchor")) {
    ui.popover = null;
    render();
  }
  const dialog = event.target.closest("dialog");
  if (dialog && event.target === dialog) closeActiveDialog();
});

document.addEventListener("input", (event) => {
  const field = event.target;
  if (field.matches("[data-search='projects']")) ui.search.projects = field.value;
  else if (field.matches("[data-search='tasks']")) ui.search.tasks = field.value;
  else if (field.matches("[data-search='activity']")) ui.search.activity = field.value;
  else if (field.matches("[data-search='global']")) ui.globalSearch = field.value;
  else return;
  render();
});

document.addEventListener("change", async (event) => {
  const field = event.target;
  if (field.matches("[data-filter='projectStatus']")) ui.projectStatus = field.value;
  else if (field.matches("[data-filter='projectSort']")) ui.projectSort = field.value;
  else if (field.matches("[data-filter='taskStatus']")) ui.taskStatus = field.value;
  else if (field.matches("[data-filter='taskPriority']")) ui.taskPriority = field.value;
  else if (field.matches("[data-filter='taskProject']")) ui.taskProject = field.value;
  else if (field.matches("[data-filter='taskSort']")) ui.taskSort = field.value;
  else if (field.matches("[data-filter='boardProject']")) ui.boardProject = field.value;
  else if (field.matches("[data-task-field]")) {
    const task = getState().tasks.find((item) => item.id === ui.taskDetailId);
    const key = field.dataset.taskField;
    if (!task) return;
    if (key === "title" && !field.value.trim()) {
      field.value = task.title;
      toast("A task needs a title.", "error");
      return;
    }
    updateTask(task.id, { [key]: key === "title" ? field.value.trim() : field.value });
    toast("Task updated.");
    return;
  } else if (field.matches("[data-setting]")) {
    updatePreferences({ [field.dataset.setting]: field.checked });
    toast("Preference saved.");
    return;
  } else if (field.matches("[data-action='toggle-subtask']")) {
    toggleSubtask(field.dataset.taskId, field.dataset.id);
    return;
  } else if (field.matches("[data-upload-project]")) {
    const file = field.files?.[0];
    if (!file) return;
    if (file.size > 300 * 1024) {
      field.value = "";
      toast("Files must be 300 KB or smaller to fit in this local workspace.", "error");
      return;
    }
    try {
      const bytes = await file.arrayBuffer();
      addProjectFile(field.dataset.uploadProject, {
        name: file.name,
        size: file.size < 1024 * 1024 ? `${Math.max(1, Math.round(file.size / 1024))} KB` : `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        type: "file", mime: file.type || "application/octet-stream", data: bytesToBase64(bytes)
      });
      toast("File added to the project.");
    } catch {
      toast("That file could not be read. Try another file.", "error");
    }
    return;
  } else return;
  render();
});

document.addEventListener("submit", (event) => {
  const form = event.target.closest("form[data-form]");
  if (!form) return;
  event.preventDefault();
  const values = Object.fromEntries(new FormData(form).entries());
  const kind = form.dataset.form;
  if (kind === "create-task") {
    if (!values.title?.trim()) { toast("Add a task name before saving.", "error"); return; }
    ui.modal = null;
    const task = addTask({ ...values, title: values.title.trim() });
    toast("Task created.");
    if (currentRoute().page === "board") ui.boardProject = "All projects";
    if (ui.taskDetailId) ui.taskDetailId = task.id;
  } else if (kind === "create-project") {
    if (!values.name?.trim()) { toast("Add a project name before saving.", "error"); return; }
    ui.modal = null;
    const project = addProject({ ...values, name: values.name.trim() });
    ui.projectTab = "Overview";
    toast("Project created.");
    location.hash = `#/project/${project.id}`;
  } else if (kind === "edit-project") {
    const projectId = form.dataset.projectId;
    if (!values.name?.trim()) { toast("Add a project name before saving.", "error"); return; }
    ui.modal = null;
    updateProject(projectId, { ...values, name: values.name.trim(), members: [...new Set([...(getProject(projectId)?.members || []), values.leadId])] });
    toast("Project updated.");
  } else if (kind === "comment") {
    if (addComment(form.dataset.taskId, values.comment || "")) toast("Comment added.");
    return;
  } else if (kind === "subtask") {
    addSubtask(form.dataset.taskId, values.title || "");
    return;
  } else if (kind === "profile") {
    updateProfile({ name: values.name.trim(), role: values.role.trim(), email: values.email });
    toast("Profile saved.");
    return;
  }
  render();
});

document.addEventListener("keydown", (event) => {
  const editing = event.target.matches("input, textarea, select, [contenteditable='true']");
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    ui.searchOpen = true;
    ui.modal = null;
    ui.taskDetailId = null;
    ui.globalSearch = "";
    render();
  } else if (!editing && event.key.toLowerCase() === "c") {
    event.preventDefault();
    handleAction({ dataset: { action: "create-task" } });
  } else if (!editing && event.key === "?") {
    event.preventDefault();
    ui.modal = "help";
    render();
  } else if (event.key === "Escape" && ui.mobileNavOpen) {
    ui.mobileNavOpen = false;
    render();
  }
});

document.addEventListener("dragstart", (event) => {
  const card = event.target.closest("[data-drag-task]");
  if (!card || !event.dataTransfer) return;
  event.dataTransfer.setData("text/plain", card.dataset.dragTask);
  event.dataTransfer.effectAllowed = "move";
  card.classList.add("is-dragging");
});

document.addEventListener("dragend", (event) => event.target.closest("[data-drag-task]")?.classList.remove("is-dragging"));
document.addEventListener("dragover", (event) => {
  const zone = event.target.closest("[data-drop-status]");
  if (zone) {
    event.preventDefault();
    zone.classList.add("is-drop-target");
  }
});
document.addEventListener("dragleave", (event) => event.target.closest("[data-drop-status]")?.classList.remove("is-drop-target"));
document.addEventListener("drop", (event) => {
  const zone = event.target.closest("[data-drop-status]");
  if (!zone) return;
  event.preventDefault();
  const taskId = event.dataTransfer?.getData("text/plain");
  const task = getState().tasks.find((item) => item.id === taskId);
  if (task && task.status !== zone.dataset.dropStatus) {
    updateTask(task.id, { status: zone.dataset.dropStatus });
    toast(`Moved to ${zone.dataset.dropStatus}.`);
  }
  zone.classList.remove("is-drop-target");
});

document.addEventListener("close", (event) => {
  const id = event.target.id;
  if (!id?.endsWith("-dialog")) return;
  if (id === "task-detail-dialog") ui.taskDetailId = null;
  if (id === "global-search-dialog") ui.searchOpen = false;
  if (["create-task-dialog", "project-dialog", "help-dialog"].includes(id)) ui.modal = null;
  render();
}, true);

window.addEventListener("hashchange", render);
window.matchMedia?.("(prefers-color-scheme: dark)").addEventListener("change", () => {
  if (getState().preferences.theme === "system") applyTheme();
});
subscribe(render);
if (!location.hash) location.hash = "#/overview";
render();
