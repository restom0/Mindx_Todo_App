const {prisma} = require("../config/prisma");
const {DEMO_PREFIX} = require("../data/demoFlowData");

const todoInclude = {
  subtasks: {
    orderBy: {sortOrder: "asc"}
  },
  comments: {
    orderBy: {createdAt: "desc"},
    take: 10
  },
  focusSessions: {
    orderBy: {startedAt: "desc"},
    take: 10
  }
};

const omitUndefined = (value) => {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined));
};

const getWhereClause = ({filter, search, demo}) => {
  const where = {};

  if (demo) {
    where.id = {startsWith: DEMO_PREFIX};
  } else {
    where.NOT = {id: {startsWith: DEMO_PREFIX}};
  }

  if (filter === "active") {
    where.completed = false;
  }

  if (filter === "completed") {
    where.completed = true;
  }

  if (search) {
    where.OR = [
      {title: {contains: search, mode: "insensitive"}},
      {description: {contains: search, mode: "insensitive"}}
    ];
  }

  return where;
};

const todoRepository = {
  async findMany(query) {
    const where = getWhereClause(query);
    const skip = (query.page - 1) * query.limit;

    const [items, total] = await prisma.$transaction([
      prisma.todo.findMany({
        where,
        include: todoInclude,
        orderBy: {[query.sort]: query.order},
        skip,
        take: query.limit
      }),
      prisma.todo.count({where})
    ]);

    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.max(1, Math.ceil(total / query.limit))
    };
  },

  findById(id) {
    return prisma.todo.findUnique({where: {id}, include: todoInclude});
  },

  create(data) {
    const {subtasks = [], collaboration = {}, ...todoData} = data;

    return prisma.todo.create({
      data: {
        ...omitUndefined(todoData),
        ...omitUndefined({
          ownerId: collaboration.ownerId,
          assigneeId: collaboration.assigneeId,
          sharedWith: collaboration.sharedWith || []
        }),
        subtasks: {
          create: subtasks.map((subtask, index) => ({
            title: subtask.title,
            completed: subtask.completed,
            sortOrder: subtask.sortOrder ?? index
          }))
        },
        activities: {
          create: {
            action: "created",
            metadata: {source: "api"}
          }
        }
      },
      include: todoInclude
    });
  },

  async update(id, data) {
    const {subtasks, collaboration, ...todoData} = data;
    const updateData = {
      ...omitUndefined(todoData),
      version: {increment: 1},
      activities: {
        create: {
          action: "updated",
          metadata: {changedFields: Object.keys(data)}
        }
      }
    };

    if (collaboration) {
      Object.assign(
        updateData,
        omitUndefined({
          ownerId: collaboration.ownerId,
          assigneeId: collaboration.assigneeId,
          sharedWith: collaboration.sharedWith || []
        })
      );
    }

    if (subtasks) {
      updateData.subtasks = {
        deleteMany: {},
        create: subtasks.map((subtask, index) => ({
          title: subtask.title,
          completed: subtask.completed,
          sortOrder: subtask.sortOrder ?? index
        }))
      };
    }

    return prisma.todo.update({
      where: {id},
      data: updateData,
      include: todoInclude
    });
  },

  delete(id) {
    return prisma.todo.delete({where: {id}});
  },

  deleteMany() {
    return prisma.todo.deleteMany();
  },

  createFocusSession(data) {
    return prisma.focusSession.create({data: omitUndefined(data)});
  },

  async listHabits() {
    return prisma.habit.findMany({
      include: {
        checkIns: {
          orderBy: {date: "desc"},
          take: 60
        }
      },
      orderBy: {createdAt: "asc"}
    });
  },

  createHabit(data) {
    return prisma.habit.create({
      data,
      include: {checkIns: true}
    });
  },

  checkInHabit(habitId, date) {
    return prisma.habitCheckIn.upsert({
      where: {
        habitId_date: {
          habitId,
          date
        }
      },
      update: {completed: true},
      create: {
        habitId,
        date,
        completed: true
      }
    });
  }
};

module.exports = {todoRepository};
