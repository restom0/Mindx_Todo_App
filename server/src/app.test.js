const request = require("supertest");
const express = require("express");

const originalEnv = {...process.env};

const createDemoPrismaMock = () => {
  const tx = {
    activityLog: {
      createMany: jest.fn().mockResolvedValue({count: 3}),
      deleteMany: jest.fn().mockResolvedValue({count: 0})
    },
    focusSession: {
      createMany: jest.fn().mockResolvedValue({count: 3}),
      deleteMany: jest.fn().mockResolvedValue({count: 0})
    },
    habit: {
      deleteMany: jest.fn().mockResolvedValue({count: 0}),
      upsert: jest.fn().mockResolvedValue({})
    },
    habitCheckIn: {
      createMany: jest.fn().mockResolvedValue({count: 15}),
      deleteMany: jest.fn().mockResolvedValue({count: 0})
    },
    subtask: {
      createMany: jest.fn().mockResolvedValue({count: 14}),
      deleteMany: jest.fn().mockResolvedValue({count: 0})
    },
    taskComment: {
      createMany: jest.fn().mockResolvedValue({count: 2}),
      deleteMany: jest.fn().mockResolvedValue({count: 0})
    },
    todo: {
      deleteMany: jest.fn().mockResolvedValue({count: 0}),
      upsert: jest.fn().mockResolvedValue({})
    }
  };

  return {
    prisma: {
      $transaction: jest.fn((callback) => callback(tx))
    },
    tx
  };
};

const loadApp = (env = {}, query = jest.fn().mockResolvedValue({rows: [{ok: 1}]}), prisma = {}) => {
  jest.resetModules();
  process.env = {
    ...originalEnv,
    NODE_ENV: "test",
    API_PREFIX: "/api",
    CORS_ORIGIN: "http://allowed.test",
    RATE_LIMIT_WINDOW_MS: "60000",
    RATE_LIMIT_MAX: "20",
    HEALTH_RATE_LIMIT_WINDOW_MS: "60000",
    HEALTH_RATE_LIMIT_MAX: "20",
    REDIS_URL: "",
    TRUST_PROXY: "false",
    ...env
  };

  jest.doMock("./config/prisma", () => ({
    pool: {query},
    prisma
  }));

  return {app: require("./app").app, query};
};

afterEach(() => {
  jest.dontMock("./config/prisma");
  process.env = {...originalEnv};
});

describe("Express app integration", () => {
  test("returns a localized health response", async () => {
    const {app, query} = loadApp();

    const response = await request(app).get("/api/health").set("Accept-Language", "en");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Server is healthy.",
      data: {status: "ok"}
    });
    expect(query).toHaveBeenCalledWith("SELECT 1");
  });

  test("allows configured CORS origins and rejects unlisted origins", async () => {
    const {app} = loadApp();

    const allowed = await request(app).get("/api/health").set("Origin", "http://allowed.test");
    const blocked = await request(app).get("/api/health").set("Origin", "http://blocked.test");

    expect(allowed.headers["access-control-allow-origin"]).toBe("http://allowed.test");
    expect(blocked.headers["access-control-allow-origin"]).toBeUndefined();
  });

  test("rate limits health checks", async () => {
    const {app} = loadApp({HEALTH_RATE_LIMIT_MAX: "1"});

    await request(app).get("/api/health").expect(200);
    const limited = await request(app).get("/api/health");

    expect(limited.status).toBe(429);
    expect(limited.body).toEqual({
      message: "Too many requests. Please wait a moment before trying again."
    });
  });

  test("trusts one proxy hop when configured", () => {
    const {app} = loadApp({TRUST_PROXY: "true"});

    expect(app.get("trust proxy")).toBe(1);
  });

  test("uses production request logging mode when configured", async () => {
    const {app} = loadApp({NODE_ENV: "production"});

    await request(app).get("/api/missing").expect(404);
  });

  test("handles missing routes", async () => {
    const {app} = loadApp();

    const response = await request(app).get("/api/missing");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "Route not found.",
      details: {path: "/api/missing"}
    });
  });

  test("blocks demo seeding unless demo mode is enabled", async () => {
    const {app} = loadApp({DEMO_MODE_ENABLED: "false"});

    const response = await request(app).post("/api/demo/seed").send({reset: true});

    expect(response.status).toBe(403);
    expect(response.body).toEqual({message: "Demo mode is disabled."});
  });

  test("loads deterministic demo data when demo mode is enabled", async () => {
    const {prisma, tx} = createDemoPrismaMock();
    const {app} = loadApp({DEMO_MODE_ENABLED: "true"}, undefined, prisma);

    const response = await request(app).post("/api/demo/seed").send({reset: true});

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "Demo data loaded.",
        data: expect.objectContaining({
          focusTodoId: "demo-flow-focus",
          totals: {
            focusSessions: 3,
            habitCheckIns: 15,
            habits: 3,
            todos: 8
          }
        })
      })
    );
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.todo.deleteMany).toHaveBeenCalledWith({where: {id: {startsWith: "demo-"}}});
    expect(tx.todo.upsert).toHaveBeenCalledTimes(8);
    expect(tx.habit.upsert).toHaveBeenCalledTimes(3);
  });

  test("health route falls back to the translation key without i18n middleware", async () => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      NODE_ENV: "test",
      HEALTH_RATE_LIMIT_WINDOW_MS: "60000",
      HEALTH_RATE_LIMIT_MAX: "20",
      REDIS_URL: ""
    };
    const query = jest.fn().mockResolvedValue({rows: [{ok: 1}]});
    jest.doMock("./config/prisma", () => ({
      pool: {query},
      prisma: {}
    }));
    const {healthRouter} = require("./routes/health.routes");
    const app = express().use("/health", healthRouter);

    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "health.ok",
      data: {status: "ok"}
    });
  });
});
