const {cache} = require("../config/cache");
const {prisma} = require("../config/prisma");
const {buildDemoDataset, DEMO_PREFIX, getDemoTodos} = require("../data/demoFlowData");
const {TODO_CACHE_PREFIX} = require("./todo.service");

const toTodoData = (todo) =>
  Object.fromEntries(
    Object.entries(todo).filter(([key]) => !["subtasks", "comments", "activities"].includes(key))
  );

const toUpdateData = (data) =>
  Object.fromEntries(Object.entries(data).filter(([key]) => key !== "id"));

const seedDemoData = async ({reset = true} = {}) => {
  const {todos, habits, focusSessions, habitCheckIns, focusTodoId, flow} = buildDemoDataset();
  const todoIds = todos.map((todo) => todo.id);
  const habitIds = habits.map((habit) => habit.id);

  await prisma.$transaction(async (tx) => {
    await tx.focusSession.deleteMany({
      where: {OR: [{id: {startsWith: DEMO_PREFIX}}, {todoId: {in: todoIds}}]}
    });
    await tx.activityLog.deleteMany({
      where: {OR: [{id: {startsWith: DEMO_PREFIX}}, {todoId: {in: todoIds}}]}
    });
    await tx.taskComment.deleteMany({
      where: {OR: [{id: {startsWith: DEMO_PREFIX}}, {todoId: {in: todoIds}}]}
    });
    await tx.subtask.deleteMany({where: {todoId: {in: todoIds}}});

    if (reset) {
      await tx.todo.deleteMany({where: {id: {startsWith: DEMO_PREFIX}}});
      await tx.habit.deleteMany({where: {id: {startsWith: DEMO_PREFIX}}});
    }

    for (const todo of todos) {
      const todoData = toTodoData(todo);
      await tx.todo.upsert({
        where: {id: todo.id},
        update: toUpdateData(todoData),
        create: todoData
      });

      if (todo.subtasks.length > 0) {
        await tx.subtask.createMany({
          data: todo.subtasks.map((subtask, index) => ({
            id: `${todo.id}-subtask-${index + 1}`,
            todoId: todo.id,
            ...subtask
          }))
        });
      }

      if (todo.comments.length > 0) {
        await tx.taskComment.createMany({
          data: todo.comments.map((comment) => ({
            todoId: todo.id,
            ...comment
          }))
        });
      }

      if (todo.activities.length > 0) {
        await tx.activityLog.createMany({
          data: todo.activities.map((activity) => ({
            todoId: todo.id,
            ...activity
          }))
        });
      }
    }

    for (const habit of habits) {
      await tx.habit.upsert({
        where: {id: habit.id},
        update: toUpdateData(habit),
        create: habit
      });
    }

    await tx.habitCheckIn.deleteMany({where: {habitId: {in: habitIds}}});
    await tx.habitCheckIn.createMany({data: habitCheckIns});
    await tx.focusSession.createMany({data: focusSessions});
  });

  await cache.purgeByPrefix(TODO_CACHE_PREFIX);

  return {
    reset,
    totals: {
      todos: todos.length,
      habits: habits.length,
      habitCheckIns: habitCheckIns.length,
      focusSessions: focusSessions.length
    },
    focusTodoId,
    flow
  };
};

module.exports = {DEMO_PREFIX, getDemoTodos, seedDemoData};
