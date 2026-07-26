const DEMO_PREFIX = "demo-";
const DEMO_FOCUS_TODO_ID = "demo-flow-focus";

const addDays = (date, days, hour = 9) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  next.setHours(hour, 0, 0, 0);
  return next;
};

const atStartOfDay = (date, offset = 0) => {
  const next = addDays(date, offset, 0);
  next.setMinutes(0, 0, 0);
  return next;
};

const getDemoTodos = (today = new Date()) => [
  {
    id: "demo-flow-capture",
    title: "1. Capture inbox items for the product demo",
    description: "Start the flow by collecting every loose task into one reliable list.",
    completed: false,
    priority: "HIGH",
    important: true,
    status: "TODO",
    category: "Demo Flow",
    dueDate: addDays(today, 0, 10),
    reminderAt: addDays(today, 0, 9),
    recurrenceType: "NONE",
    repeatRule: null,
    estimatedMinutes: 25,
    attachments: [{type: "note", label: "Demo script", metadata: {step: "capture"}}],
    locationReminder: null,
    ownerId: "demo-host",
    assigneeId: "demo-host",
    sharedWith: [{userId: "demo-viewer", role: "viewer"}],
    version: 1,
    subtasks: [
      {title: "Open the Todo list", completed: true, sortOrder: 0},
      {title: "Add a new customer request", completed: false, sortOrder: 1}
    ],
    comments: [
      {
        id: "demo-comment-capture",
        authorId: "demo-host",
        body: "Use this first card to show the clean capture experience.",
        mentions: ["demo-viewer"]
      }
    ],
    activities: [
      {
        id: "demo-activity-capture",
        actorId: "demo-host",
        action: "demo_created",
        metadata: {step: "capture"}
      }
    ]
  },
  {
    id: "demo-flow-plan",
    title: "2. Split launch checklist with AI breakdown",
    description: "Use the AI card to turn a large launch task into smaller subtasks.",
    completed: false,
    priority: "URGENT",
    important: true,
    status: "BACKLOG",
    category: "Planning",
    dueDate: addDays(today, 1, 11),
    reminderAt: addDays(today, 1, 10),
    recurrenceType: "NONE",
    repeatRule: null,
    estimatedMinutes: 90,
    attachments: [
      {
        type: "link",
        label: "Launch brief",
        url: "https://example.com/demo-launch-brief",
        metadata: {step: "ai-breakdown"}
      }
    ],
    locationReminder: null,
    ownerId: "demo-host",
    assigneeId: "demo-editor",
    sharedWith: [{userId: "demo-viewer", role: "viewer"}],
    version: 1,
    subtasks: [
      {title: "Define success metric", completed: false, sortOrder: 0},
      {title: "Create release checklist", completed: false, sortOrder: 1},
      {title: "Schedule the review block", completed: false, sortOrder: 2}
    ],
    comments: [],
    activities: [
      {
        id: "demo-activity-plan",
        actorId: "demo-editor",
        action: "demo_planned",
        metadata: {step: "ai-breakdown"}
      }
    ]
  },
  {
    id: "demo-flow-prioritize",
    title: "3. Prioritize urgent customer follow-up",
    description: "Drag this through the Eisenhower Matrix and Kanban board.",
    completed: false,
    priority: "URGENT",
    important: true,
    status: "IN_PROGRESS",
    category: "Customer",
    dueDate: addDays(today, -1, 16),
    reminderAt: addDays(today, -1, 15),
    recurrenceType: "NONE",
    repeatRule: null,
    estimatedMinutes: 45,
    attachments: [],
    locationReminder: null,
    ownerId: "demo-host",
    assigneeId: "demo-editor",
    sharedWith: [{userId: "demo-viewer", role: "viewer"}],
    version: 1,
    subtasks: [
      {title: "Confirm blocker", completed: true, sortOrder: 0},
      {title: "Send next update", completed: false, sortOrder: 1}
    ],
    comments: [
      {
        id: "demo-comment-prioritize",
        authorId: "demo-editor",
        body: "This overdue urgent item makes the matrix and dashboard feel alive.",
        mentions: []
      }
    ],
    activities: []
  },
  {
    id: DEMO_FOCUS_TODO_ID,
    title: "4. Run a 25-minute focus session",
    description: "Select this card, start Pomodoro, then save a completed session.",
    completed: false,
    priority: "HIGH",
    important: true,
    status: "IN_PROGRESS",
    category: "Focus",
    dueDate: addDays(today, 0, 14),
    reminderAt: addDays(today, 0, 13),
    recurrenceType: "DAILY",
    repeatRule: {interval: 1, unit: "day"},
    estimatedMinutes: 25,
    attachments: [],
    locationReminder: null,
    ownerId: "demo-host",
    assigneeId: "demo-host",
    sharedWith: [],
    version: 1,
    subtasks: [
      {title: "Choose the task", completed: true, sortOrder: 0},
      {title: "Save the focus session", completed: false, sortOrder: 1}
    ],
    comments: [],
    activities: []
  },
  {
    id: "demo-flow-calendar",
    title: "5. Schedule content review on the calendar",
    description: "Drop tasks on the calendar strip to show date planning.",
    completed: false,
    priority: "MEDIUM",
    important: false,
    status: "TODO",
    category: "Calendar",
    dueDate: addDays(today, 3, 9),
    reminderAt: addDays(today, 3, 8),
    recurrenceType: "WEEKLY",
    repeatRule: {interval: 1, unit: "week"},
    estimatedMinutes: 60,
    attachments: [],
    locationReminder: null,
    ownerId: "demo-host",
    assigneeId: "demo-editor",
    sharedWith: [{userId: "demo-viewer", role: "editor"}],
    version: 1,
    subtasks: [
      {title: "Prepare review notes", completed: false, sortOrder: 0},
      {title: "Confirm reviewer", completed: false, sortOrder: 1}
    ],
    comments: [],
    activities: []
  },
  {
    id: "demo-flow-location",
    title: "6. Pick up print assets near the office",
    description: "Location reminder data is stored so the placeholder can be explained.",
    completed: false,
    priority: "LOW",
    important: false,
    status: "BACKLOG",
    category: "Ops",
    dueDate: addDays(today, 5, 15),
    reminderAt: addDays(today, 5, 14),
    recurrenceType: "NONE",
    repeatRule: null,
    estimatedMinutes: 30,
    attachments: [],
    locationReminder: {
      latitude: 10.7769,
      longitude: 106.7009,
      radius: 250,
      triggerType: "arrive"
    },
    ownerId: "demo-host",
    assigneeId: null,
    sharedWith: [],
    version: 1,
    subtasks: [],
    comments: [],
    activities: []
  },
  {
    id: "demo-flow-complete",
    title: "7. Celebrate the completed onboarding checklist",
    description: "Toggle completed tasks to show scoring, badges, and dashboard metrics.",
    completed: true,
    priority: "MEDIUM",
    important: true,
    status: "DONE",
    category: "Review",
    dueDate: addDays(today, -2, 17),
    reminderAt: addDays(today, -2, 16),
    recurrenceType: "NONE",
    repeatRule: null,
    estimatedMinutes: 35,
    attachments: [],
    locationReminder: null,
    ownerId: "demo-host",
    assigneeId: "demo-host",
    sharedWith: [],
    version: 1,
    subtasks: [
      {title: "Finish checklist", completed: true, sortOrder: 0},
      {title: "Show completion animation", completed: true, sortOrder: 1}
    ],
    comments: [],
    activities: [
      {
        id: "demo-activity-complete",
        actorId: "demo-host",
        action: "demo_completed",
        metadata: {step: "review"}
      }
    ]
  },
  {
    id: "demo-flow-review",
    title: "8. Review weekly productivity story",
    description: "Use this final card with insights, habits, and focus minutes to close the demo.",
    completed: false,
    priority: "HIGH",
    important: false,
    status: "TODO",
    category: "Review",
    dueDate: addDays(today, 6, 10),
    reminderAt: addDays(today, 6, 9),
    recurrenceType: "MONTHLY",
    repeatRule: {interval: 1, unit: "month"},
    estimatedMinutes: 50,
    attachments: [{type: "note", label: "Presenter cue", metadata: {step: "review"}}],
    locationReminder: null,
    ownerId: "demo-host",
    assigneeId: "demo-host",
    sharedWith: [{userId: "demo-viewer", role: "viewer"}],
    version: 1,
    subtasks: [
      {title: "Open productivity dashboard", completed: false, sortOrder: 0},
      {title: "Summarize next action", completed: false, sortOrder: 1}
    ],
    comments: [],
    activities: []
  }
];

const getDemoHabits = () => [
  {
    id: "demo-habit-focus",
    title: "Protect deep work",
    description: "One distraction-free focus block each day.",
    cadence: "daily",
    color: "#137f7a"
  },
  {
    id: "demo-habit-review",
    title: "Daily shutdown review",
    description: "Close the day with wins, blockers, and tomorrow's first action.",
    cadence: "daily",
    color: "#4f46e5"
  },
  {
    id: "demo-habit-move",
    title: "Reset with movement",
    description: "Take a quick walk after long work blocks.",
    cadence: "weekly",
    color: "#d95f59"
  }
];

const getDemoFocusSessions = (today = new Date()) => [
  {
    id: "demo-focus-session-1",
    todoId: DEMO_FOCUS_TODO_ID,
    mode: "FOCUS",
    durationMinutes: 25,
    startedAt: addDays(today, -2, 9),
    completedAt: addDays(today, -2, 10)
  },
  {
    id: "demo-focus-session-2",
    todoId: "demo-flow-plan",
    mode: "FOCUS",
    durationMinutes: 45,
    startedAt: addDays(today, -1, 13),
    completedAt: addDays(today, -1, 14)
  },
  {
    id: "demo-focus-session-3",
    todoId: "demo-flow-prioritize",
    mode: "SHORT_BREAK",
    durationMinutes: 5,
    startedAt: addDays(today, 0, 11),
    completedAt: addDays(today, 0, 11)
  }
];

const getDemoHabitCheckIns = (today = new Date()) => {
  const habitIds = ["demo-habit-focus", "demo-habit-review", "demo-habit-move"];
  return habitIds.flatMap((habitId, habitIndex) =>
    Array.from({length: habitId === "demo-habit-move" ? 3 : 6}, (_, index) => ({
      habitId,
      date: atStartOfDay(today, index - habitIndex - 5),
      completed: true
    }))
  );
};

const DEMO_FLOW_STEPS = [
  "Capture todos",
  "Generate an AI task breakdown",
  "Prioritize with matrix and Kanban",
  "Schedule with calendar",
  "Run a focus session",
  "Track habits and review productivity"
];

const buildDemoDataset = (today = new Date()) => ({
  todos: getDemoTodos(today),
  habits: getDemoHabits(),
  focusSessions: getDemoFocusSessions(today),
  habitCheckIns: getDemoHabitCheckIns(today),
  focusTodoId: DEMO_FOCUS_TODO_ID,
  flow: DEMO_FLOW_STEPS
});

module.exports = {
  DEMO_PREFIX,
  DEMO_FLOW_STEPS,
  buildDemoDataset,
  getDemoTodos,
  getDemoHabits,
  getDemoFocusSessions,
  getDemoHabitCheckIns
};
