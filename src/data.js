export const USERS = [
  { id: "u-alex", name: "Alex Morgan", role: "Product lead", initials: "AM", color: "#dce7ff", text: "#3559a8" },
  { id: "u-jamie", name: "Jamie Chen", role: "Product designer", initials: "JC", color: "#f8dfd4", text: "#a34d2a" },
  { id: "u-priya", name: "Priya Nair", role: "Frontend engineer", initials: "PN", color: "#e5ddfa", text: "#6845a0" },
  { id: "u-mateo", name: "Mateo Alvarez", role: "Backend engineer", initials: "MA", color: "#d7efe5", text: "#28704f" },
  { id: "u-sam", name: "Sam Okafor", role: "Data analyst", initials: "SO", color: "#f5e9c8", text: "#8a6813" },
  { id: "u-taylor", name: "Taylor Brooks", role: "Researcher", initials: "TB", color: "#dcecf0", text: "#286b79" }
];

const day = (offset) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
};
const ago = (minutes) => new Date(Date.now() - minutes * 60_000).toISOString();

export const PROJECTS = [
  { id: "p-atlas", name: "Atlas Design System", description: "A flexible foundation for consistent, accessible product experiences.", color: "#6e83d9", icon: "layers", status: "Active", leadId: "u-jamie", dueOffset: 12, members: ["u-alex", "u-jamie", "u-priya", "u-taylor"] },
  { id: "p-orbit", name: "Orbit Mobile App", description: "Bring the core workspace to teams wherever good work happens.", color: "#5a9c86", icon: "orbit", status: "Active", leadId: "u-priya", dueOffset: 26, members: ["u-alex", "u-priya", "u-mateo", "u-jamie"] },
  { id: "p-mercury", name: "Mercury Billing", description: "A clearer, faster billing experience for growing teams.", color: "#d28d56", icon: "receipt", status: "At risk", leadId: "u-mateo", dueOffset: 4, members: ["u-alex", "u-mateo", "u-priya", "u-sam"] },
  { id: "p-fieldnotes", name: "Fieldnotes Research", description: "Turn customer conversations into product decisions that stick.", color: "#9277bf", icon: "book", status: "Active", leadId: "u-taylor", dueOffset: 19, members: ["u-taylor", "u-jamie", "u-alex"] },
  { id: "p-signal", name: "Signal Analytics", description: "Make the most important product signals easy to understand.", color: "#4d91bd", icon: "chart", status: "Active", leadId: "u-sam", dueOffset: 33, members: ["u-sam", "u-alex", "u-mateo", "u-priya"] },
  { id: "p-relay", name: "Relay Automations", description: "Remove repetitive handoffs from everyday team workflows.", color: "#c16c83", icon: "zap", status: "Planned", leadId: "u-mateo", dueOffset: 45, members: ["u-mateo", "u-priya", "u-sam"] },
  { id: "p-evergreen", name: "Evergreen Brand Refresh", description: "A warmer brand system for the next chapter of Nexus.", color: "#7a9e63", icon: "sparkle", status: "Completed", leadId: "u-jamie", dueOffset: -9, members: ["u-jamie", "u-taylor", "u-alex"] },
  { id: "p-horizon", name: "Horizon Client Portal", description: "A shared space for customers to follow work and find answers.", color: "#6a83a8", icon: "compass", status: "Active", leadId: "u-alex", dueOffset: 58, members: ["u-alex", "u-priya", "u-taylor", "u-mateo"] }
].map((project) => ({ ...project, dueDate: day(project.dueOffset), updatedAt: ago(35 + Math.floor(Math.random() * 9000)) }));

const taskRows = [
  ["Map the new semantic color tokens", "p-atlas", "In Progress", "High", 1, "Foundations"],
  ["Document accessible focus states", "p-atlas", "In Review", "Medium", 2, "Accessibility"],
  ["Publish the typography scale", "p-atlas", "Done", "High", -1, "Typography"],
  ["Build the button interaction matrix", "p-atlas", "Todo", "Medium", 5, "Components"],
  ["Audit contrast in data visualizations", "p-atlas", "Backlog", "Low", 11, "Accessibility"],
  ["Prepare the component contribution guide", "p-atlas", "Todo", "No Priority", 8, "Documentation"],
  ["Prototype the offline capture flow", "p-orbit", "In Progress", "Urgent", 0, "Mobile"],
  ["Design the project switcher", "p-orbit", "In Review", "High", 3, "Navigation"],
  ["Implement deep-link routing", "p-orbit", "Todo", "High", 9, "Engineering"],
  ["Test sync recovery on poor networks", "p-orbit", "Backlog", "Medium", 18, "Quality"],
  ["Write the first-run workspace guide", "p-orbit", "Done", "Low", -2, "Content"],
  ["Review mobile notification settings", "p-orbit", "In Progress", "Medium", 7, "Settings"],
  ["Reconcile proration edge cases", "p-mercury", "In Progress", "Urgent", -1, "Billing"],
  ["Verify invoice PDF line wrapping", "p-mercury", "Todo", "High", 1, "Quality"],
  ["Add a clear failed-payment state", "p-mercury", "In Review", "High", 2, "Payments"],
  ["Confirm tax preview rounding", "p-mercury", "Backlog", "Medium", 3, "Billing"],
  ["Write the plan-change confirmation copy", "p-mercury", "Todo", "Low", 5, "Content"],
  ["Review the monthly usage summary", "p-mercury", "Done", "Medium", -3, "Usage"],
  ["Synthesize onboarding interview notes", "p-fieldnotes", "In Progress", "High", 2, "Research"],
  ["Tag themes across five customer calls", "p-fieldnotes", "Todo", "Medium", 7, "Synthesis"],
  ["Share the account setup findings", "p-fieldnotes", "Done", "High", -4, "Research"],
  ["Schedule follow-up sessions with admins", "p-fieldnotes", "Backlog", "Low", 12, "Planning"],
  ["Validate the new terminology with users", "p-fieldnotes", "In Review", "Medium", 4, "Validation"],
  ["Prepare a decision brief for leadership", "p-fieldnotes", "Todo", "No Priority", 10, "Strategy"],
  ["Define activation events for the new funnel", "p-signal", "In Progress", "High", 4, "Instrumentation"],
  ["Compare weekly retention cohorts", "p-signal", "Todo", "Medium", 8, "Analytics"],
  ["Add annotations to the conversion chart", "p-signal", "Done", "Low", -2, "Visualization"],
  ["Investigate the invite drop-off spike", "p-signal", "In Review", "Urgent", 1, "Investigation"],
  ["Document the metric ownership map", "p-signal", "Backlog", "Low", 15, "Governance"],
  ["Validate event names in production", "p-signal", "Todo", "High", 6, "Instrumentation"],
  ["List candidate triggers for handoff alerts", "p-relay", "Backlog", "Medium", 18, "Discovery"],
  ["Map approval steps for access requests", "p-relay", "Todo", "High", 22, "Workflow"],
  ["Estimate the first automation pilot", "p-relay", "Backlog", "No Priority", 28, "Planning"],
  ["Review webhook retry requirements", "p-relay", "Todo", "Medium", 25, "Engineering"],
  ["Draft a safe rollback checklist", "p-relay", "Backlog", "Low", 31, "Quality"],
  ["Interview operations about recurring handoffs", "p-relay", "In Progress", "Medium", 16, "Research"],
  ["Ship the updated brand color palette", "p-evergreen", "Done", "High", -12, "Brand"],
  ["Refresh the workspace illustration set", "p-evergreen", "Done", "Medium", -10, "Illustration"],
  ["Align product voice examples", "p-evergreen", "Done", "Low", -9, "Content"],
  ["Update the launch announcement kit", "p-evergreen", "Done", "Medium", -8, "Launch"],
  ["Archive superseded brand files", "p-evergreen", "Done", "Low", -7, "Operations"],
  ["Review the new identity with the team", "p-evergreen", "Done", "No Priority", -9, "Review"],
  ["Sketch the client workspace information map", "p-horizon", "In Progress", "High", 10, "Experience"],
  ["Define access roles for external guests", "p-horizon", "Todo", "Urgent", 13, "Permissions"],
  ["Prototype the shared update timeline", "p-horizon", "Backlog", "Medium", 24, "Prototype"],
  ["Write customer-facing empty states", "p-horizon", "Todo", "Low", 29, "Content"],
  ["Review portal loading performance", "p-horizon", "In Review", "High", 7, "Performance"],
  ["Plan the client pilot cohort", "p-horizon", "Backlog", "Medium", 38, "Launch"]
];

export const TASKS = taskRows.map((row, index) => ({
  id: `t-${String(index + 1).padStart(3, "0")}`,
  title: row[0], projectId: row[1], status: row[2], priority: row[3], dueDate: day(row[4]), tag: row[5],
  assigneeId: USERS[(index * 3 + Math.floor(index / 4)) % USERS.length].id,
  description: `Move ${row[0].toLowerCase()} forward with a clear owner, a reviewable outcome, and the smallest practical next step. Keep related decisions close to the work so the team can pick up context quickly.`,
  createdAt: ago(12_000 + index * 73), updatedAt: ago((index * 71) % 12000),
  completedAt: row[2] === "Done" ? ago(1800 + index * 31) : null,
  subtasks: index % 4 === 0 ? [
    { id: `s-${index}-1`, title: "Align scope with the project brief", done: index % 8 === 0 },
    { id: `s-${index}-2`, title: "Share a reviewable first pass", done: false }
  ] : [],
  comments: index % 7 === 0 ? [{ id: `c-${index}`, authorId: USERS[(index + 1) % USERS.length].id, text: "I added the latest context from our weekly review. Let me know if anything needs a second look.", createdAt: ago(160 + index * 12) }] : []
}));

export const WEEKLY_HISTORY = [
  { label: "Jul 13", completed: 18, created: 24 }, { label: "Jul 20", completed: 23, created: 27 },
  { label: "Jul 27", completed: 21, created: 22 }, { label: "Aug 03", completed: 29, created: 31 },
  { label: "Aug 10", completed: 26, created: 25 }, { label: "Aug 17", completed: 34, created: 30 },
  { label: "Aug 24", completed: 31, created: 28 }, { label: "Aug 31", completed: 38, created: 36 },
  { label: "Sep 07", completed: 33, created: 30 }, { label: "Sep 14", completed: 42, created: 37 },
  { label: "Sep 21", completed: 39, created: 34 }, { label: "Sep 28", completed: 46, created: 40 }
];

export const initialState = () => ({
  version: 1,
  tasks: structuredClone(TASKS),
  users: structuredClone(USERS),
  projects: structuredClone(PROJECTS).map((project, index) => ({
    ...project,
    files: index === 0 ? [
      { name: "Atlas component inventory.md", size: "24 KB", type: "doc", updated: "Updated Sep 24", content: "# Atlas component inventory\n\nButtons, inputs, navigation, and chart primitives in the first release." },
      { name: "Release checklist.md", size: "8 KB", type: "doc", updated: "Updated Sep 18", content: "# Atlas release checklist\n\n- Check keyboard navigation\n- Confirm focus contrast\n- Publish component guidance" }
    ] : []
  })),
  weeklyHistory: structuredClone(WEEKLY_HISTORY),
  activity: [
    { id: "a-1", actorId: "u-jamie", type: "completed", target: "Published the typography scale", projectId: "p-atlas", createdAt: ago(12) },
    { id: "a-2", actorId: "u-priya", type: "commented", target: "Prototype the offline capture flow", projectId: "p-orbit", createdAt: ago(46) },
    { id: "a-3", actorId: "u-mateo", type: "updated", target: "Reconcile proration edge cases", projectId: "p-mercury", createdAt: ago(121) },
    { id: "a-4", actorId: "u-taylor", type: "created", target: "Synthesize onboarding interview notes", projectId: "p-fieldnotes", createdAt: ago(230) },
    { id: "a-5", actorId: "u-sam", type: "completed", target: "Add annotations to the conversion chart", projectId: "p-signal", createdAt: ago(330) },
    { id: "a-6", actorId: "u-alex", type: "created-project", target: "Horizon Client Portal", projectId: "p-horizon", createdAt: ago(510) },
    { id: "a-7", actorId: "u-jamie", type: "commented", target: "Review the new identity with the team", projectId: "p-evergreen", createdAt: ago(1180) },
    { id: "a-8", actorId: "u-mateo", type: "assigned", target: "Review webhook retry requirements", projectId: "p-relay", createdAt: ago(1720) }
  ],
  notifications: [
    { id: "n-1", title: "Priya mentioned you", body: "Offline capture flow is ready for a first look.", createdAt: ago(18), read: false, projectId: "p-orbit" },
    { id: "n-2", title: "A task is due tomorrow", body: "Map the new semantic color tokens · Atlas Design System", createdAt: ago(90), read: false, projectId: "p-atlas" },
    { id: "n-3", title: "Project is at risk", body: "Mercury Billing has a milestone due in four days.", createdAt: ago(350), read: false, projectId: "p-mercury" },
    { id: "n-4", title: "Weekly digest is ready", body: "Your team completed 46 tasks this week, up 18%.", createdAt: ago(980), read: true, projectId: "p-signal" }
  ],
  preferences: { theme: "light", emailNotifications: true, weeklyDigest: true, compactMode: false },
  profile: { name: "Alex Morgan", role: "Product lead", email: "alex.morgan@nexus.team" }
});
