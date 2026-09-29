export const STATUSES = ["Backlog", "Todo", "In Progress", "In Review", "Done"];
export const PRIORITIES = ["Urgent", "High", "Medium", "Low", "No Priority"];

export function dateKey(value) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function dateFromOffset(offset) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return dateKey(date);
}

export function formatDate(value, options = { month: "short", day: "numeric" }) {
  if (!value) return "No date";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "No date";
  return new Intl.DateTimeFormat("en", options).format(date);
}

export function formatMonth(date) {
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(date);
}

export function relativeTime(value) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return formatDate(dateKey(new Date(value)));
}

export function isOverdue(value) {
  return Boolean(value && value < dateKey(new Date()));
}

export function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

export function initials(name = "") {
  return name.trim().split(/\s+/).slice(0, 2).map((word) => word[0] || "").join("").toUpperCase();
}

export function matchesQuery(value, query) {
  return String(value || "").toLocaleLowerCase().includes(String(query || "").trim().toLocaleLowerCase());
}

export function toWeekday(date, style = "short") {
  return new Intl.DateTimeFormat("en", { weekday: style }).format(date);
}

export function mondayFirstIndex(sundayFirstDay) {
  return (sundayFirstDay + 6) % 7;
}

export function percent(part, whole) {
  return whole ? Math.round((part / whole) * 100) : 0;
}
