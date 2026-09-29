import { icon } from "./icons.js";
import { escapeHtml, formatDate, isOverdue, percent } from "./utils.js";

export function avatar(user, size = "md", extra = "") {
  if (!user) return `<span class="avatar avatar-${size} avatar-empty ${extra}" aria-label="Unassigned">?</span>`;
  const name = escapeHtml(user.name);
  return `<span class="avatar avatar-${size} ${extra}" style="--avatar-bg:${user.color};--avatar-fg:${user.text}" aria-label="${name}" title="${name}">${escapeHtml(user.initials)}</span>`;
}

export function avatarStack(users, limit = 4) {
  const shown = users.slice(0, limit);
  const rest = users.length - shown.length;
  return `<span class="avatar-stack">${shown.map((user) => avatar(user, "sm")).join("")}${rest > 0 ? `<span class="avatar avatar-sm avatar-more">+${rest}</span>` : ""}</span>`;
}

export function projectMark(project, size = "md") {
  return `<span class="project-mark project-mark-${size}" style="--project-color:${project.color}">${icon(project.icon || "layers", size === "sm" ? 15 : 18)}</span>`;
}

export function statusBadge(status) {
  const cls = status.toLowerCase().replaceAll(" ", "-");
  return `<span class="status-badge status-${cls}"><span class="status-dot"></span>${escapeHtml(status)}</span>`;
}

export function priorityLabel(priority, compact = false) {
  const cls = priority.toLowerCase().replaceAll(" ", "-");
  const glyph = priority === "Urgent" ? "!!" : priority === "High" ? "↑" : priority === "Medium" ? "=" : priority === "Low" ? "↓" : "—";
  return `<span class="priority priority-${cls}" title="${escapeHtml(priority)}"><span class="priority-glyph" aria-hidden="true">${glyph}</span>${compact ? "" : `<span>${escapeHtml(priority)}</span>`}</span>`;
}

export function progressBar(value, options = {}) {
  const clamped = Math.max(0, Math.min(100, value));
  return `<div class="progress-line ${options.thin ? "progress-thin" : ""}" role="progressbar" aria-valuenow="${clamped}" aria-valuemin="0" aria-valuemax="100" aria-label="${clamped}% complete"><span style="width:${clamped}%;${options.color ? `background:${options.color}` : ""}"></span></div>`;
}

export function taskRow(task, project, user, options = {}) {
  const due = task.dueDate ? formatDate(task.dueDate) : "No date";
  const overdue = isOverdue(task.dueDate) && task.status !== "Done";
  return `<button class="task-row ${options.compact ? "task-row-compact" : ""}" data-action="open-task" data-id="${escapeHtml(task.id)}" aria-label="Open task ${escapeHtml(task.title)}">
    <span class="task-status-icon task-status-${task.status.toLowerCase().replaceAll(" ", "-")}" aria-hidden="true">${task.status === "Done" ? icon("check", 13) : icon("circle", 15)}</span>
    <span class="task-row-main"><span class="task-row-title">${escapeHtml(task.title)}</span><span class="task-row-sub">${project ? `<span class="mini-project"><i style="--project-color:${project.color}"></i>${escapeHtml(project.name)}</span>` : ""}${task.tag ? `<span class="task-tag">${escapeHtml(task.tag)}</span>` : ""}</span></span>
    <span class="task-row-priority">${priorityLabel(task.priority, true)}</span>
    <span class="task-row-due ${overdue ? "is-overdue" : ""}">${icon("calendar", 14)} ${due}</span>
    <span class="task-row-assignee">${avatar(user, "sm")}</span>
  </button>`;
}

export function emptyState({ iconName = "inbox", title, body, action = "" }) {
  return `<div class="empty-state"><span class="empty-state-icon">${icon(iconName, 24)}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p>${action}</div>`;
}

export function metric({ label, value, change, detail, iconName, trend = "up", accent = "blue" }) {
  const sign = trend === "down" ? "down" : "up";
  return `<article class="metric-card"><div class="metric-top"><span>${escapeHtml(label)}</span><span class="metric-icon metric-icon-${accent}">${icon(iconName, 17)}</span></div><div class="metric-value">${escapeHtml(value)}</div><div class="metric-foot"><span class="metric-change metric-change-${sign}">${icon(sign === "up" ? "arrowUpRight" : "chevronDown", 13)} ${escapeHtml(change)}</span><span>${escapeHtml(detail)}</span></div></article>`;
}

export function ring(value, color = "var(--accent)", size = 48) {
  const clamped = Math.max(0, Math.min(100, value));
  return `<span class="progress-ring" style="--progress:${clamped};--ring-color:${color};--ring-size:${size}px" role="progressbar" aria-valuenow="${clamped}" aria-valuemin="0" aria-valuemax="100" aria-label="${clamped}% complete"><span>${percent(clamped, 100)}%</span></span>`;
}
