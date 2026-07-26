const {z} = require("zod");

const nonEmptyText = (max) => z.string().trim().min(1).max(max);
const optionalText = (max) => z.string().trim().max(max).optional();
const isoDateTime = z.iso.datetime();
const isoDate = z.iso.date();
const optionalDate = z
  .union([isoDateTime, isoDate, z.literal(""), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined) {
      return undefined;
    }
    if (value === null || value === "") {
      return null;
    }
    return new Date(value);
  });

const prioritySchema = z
  .enum(["low", "medium", "high", "urgent", "LOW", "MEDIUM", "HIGH", "URGENT"])
  .optional()
  .transform((value) => (value ? value.toUpperCase() : undefined));

const statusSchema = z
  .enum(["backlog", "todo", "in_progress", "done", "BACKLOG", "TODO", "IN_PROGRESS", "DONE"])
  .optional()
  .transform((value) => (value ? value.toUpperCase() : undefined));

const recurrenceSchema = z
  .enum([
    "none",
    "daily",
    "weekly",
    "monthly",
    "custom",
    "NONE",
    "DAILY",
    "WEEKLY",
    "MONTHLY",
    "CUSTOM"
  ])
  .optional()
  .transform((value) => (value ? value.toUpperCase() : undefined));

const subtaskSchema = z.object({
  id: z.string().optional(),
  title: nonEmptyText(160),
  completed: z.boolean().optional().default(false),
  sortOrder: z.number().int().min(0).optional().default(0)
});

const attachmentSchema = z.object({
  type: z.enum(["note", "link", "image", "file"]).default("note"),
  label: nonEmptyText(120),
  url: z.string().trim().max(500).optional().default(""),
  metadata: z.record(z.string(), z.unknown()).optional().default({})
});

const locationReminderSchema = z
  .object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    radius: z.number().min(10).max(100000),
    triggerType: z.enum(["arrive", "leave"]).default("arrive")
  })
  .nullable()
  .optional();

const collaborationSchema = z.object({
  ownerId: z.string().trim().max(120).optional().nullable(),
  assigneeId: z.string().trim().max(120).optional().nullable(),
  sharedWith: z
    .array(
      z.object({
        userId: z.string().trim().max(120),
        role: z.enum(["owner", "editor", "viewer"]).default("viewer")
      })
    )
    .optional()
});

const repeatRuleSchema = z
  .object({
    interval: z.number().int().min(1).max(365).optional().default(1),
    unit: z.enum(["day", "week", "month"]).optional().default("day"),
    until: z.union([isoDateTime, isoDate, z.literal(""), z.null()]).optional()
  })
  .nullable()
  .optional();

const queryBooleanSchema = z
  .union([z.boolean(), z.string()])
  .optional()
  .default(false)
  .transform((value) => ["1", "true", "yes", "on"].includes(String(value).toLowerCase()));

const todoIdParamsSchema = z.object({
  id: nonEmptyText(120)
});

const todoQuerySchema = z.object({
  filter: z.enum(["all", "active", "completed"]).default("all"),
  search: z.string().trim().max(160).optional().default(""),
  sort: z.enum(["createdAt", "updatedAt", "title"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  demo: queryBooleanSchema,
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(100)
});

const createTodoSchema = z.object({
  title: nonEmptyText(160),
  description: optionalText(1000).default(""),
  completed: z.boolean().optional().default(false),
  priority: prioritySchema.default("MEDIUM"),
  important: z.boolean().optional().default(false),
  status: statusSchema.default("TODO"),
  category: optionalText(120).default("General"),
  dueDate: optionalDate,
  reminderAt: optionalDate,
  recurrenceType: recurrenceSchema.default("NONE"),
  repeatRule: repeatRuleSchema,
  estimatedMinutes: z.number().int().min(1).max(10080).optional().nullable(),
  subtasks: z.array(subtaskSchema).max(50).optional().default([]),
  attachments: z.array(attachmentSchema).max(20).optional().default([]),
  locationReminder: locationReminderSchema,
  collaboration: collaborationSchema.optional()
});

const updateTodoSchema = z
  .object({
    title: nonEmptyText(160).optional(),
    description: optionalText(1000),
    completed: z.boolean().optional(),
    priority: prioritySchema,
    important: z.boolean().optional(),
    status: statusSchema,
    category: optionalText(120),
    dueDate: optionalDate,
    reminderAt: optionalDate,
    recurrenceType: recurrenceSchema,
    repeatRule: repeatRuleSchema,
    estimatedMinutes: z.number().int().min(1).max(10080).optional().nullable(),
    subtasks: z.array(subtaskSchema).max(50).optional(),
    attachments: z.array(attachmentSchema).max(20).optional(),
    locationReminder: locationReminderSchema,
    collaboration: collaborationSchema.optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "empty_update"
  });

const focusSessionSchema = z.object({
  todoId: z.string().trim().max(120).optional().nullable(),
  mode: z
    .enum(["focus", "short_break", "FOCUS", "SHORT_BREAK"])
    .optional()
    .transform((value) => (value ? value.toUpperCase() : "FOCUS")),
  durationMinutes: z.number().int().min(1).max(240),
  startedAt: optionalDate,
  completedAt: optionalDate
});

const createHabitSchema = z.object({
  title: nonEmptyText(120),
  description: optionalText(500).default(""),
  cadence: z.enum(["daily", "weekly", "monthly"]).optional().default("daily"),
  color: z.string().trim().max(24).optional().default("#137f7a")
});

const habitIdParamsSchema = z.object({
  habitId: nonEmptyText(120)
});

const habitCheckInSchema = z.object({
  date: z
    .union([isoDateTime, isoDate])
    .optional()
    .transform((value) => (value ? new Date(value) : new Date()))
});

const aiBreakdownSchema = z.object({
  title: nonEmptyText(200),
  description: optionalText(1000).default("")
});

module.exports = {
  aiBreakdownSchema,
  createTodoSchema,
  createHabitSchema,
  focusSessionSchema,
  habitCheckInSchema,
  habitIdParamsSchema,
  todoIdParamsSchema,
  todoQuerySchema,
  updateTodoSchema
};
