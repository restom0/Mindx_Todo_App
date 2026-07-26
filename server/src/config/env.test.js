const originalEnv = {...process.env};

const loadEnv = (env = {}) => {
  jest.resetModules();
  process.env = {...originalEnv, ...env};
  return require("./env").env;
};

afterEach(() => {
  process.env = {...originalEnv};
});

describe("env config", () => {
  test("normalizes numeric, boolean, and origin settings", () => {
    const env = loadEnv({
      PORT: "4000",
      API_PREFIX: "/v1",
      CORS_ORIGIN: "https://app.example.com,*, https://admin.example.com ",
      CACHE_TTL_SECONDS: "120",
      RATE_LIMIT_WINDOW_MS: "10",
      RATE_LIMIT_MAX: "5",
      HEALTH_RATE_LIMIT_WINDOW_MS: "20",
      HEALTH_RATE_LIMIT_MAX: "2",
      TRUST_PROXY: "yes",
      DEMO_MODE_ENABLED: "true"
    });

    expect(env).toEqual(
      expect.objectContaining({
        port: 4000,
        apiPrefix: "/v1",
        corsOrigins: ["https://app.example.com", "https://admin.example.com"],
        cacheTtlSeconds: 120,
        rateLimitWindowMs: 10,
        rateLimitMax: 5,
        healthRateLimitWindowMs: 20,
        healthRateLimitMax: 2,
        trustProxy: true,
        demoModeEnabled: true
      })
    );
  });

  test("uses safe fallbacks for invalid optional settings", () => {
    const env = loadEnv({
      NODE_ENV: "production",
      PORT: "nope",
      API_PREFIX: "",
      CORS_ORIGIN: "",
      CACHE_TTL_SECONDS: "NaN",
      TRUST_PROXY: ""
    });

    expect(env).toEqual(
      expect.objectContaining({
        nodeEnv: "production",
        port: 3000,
        apiPrefix: "/api",
        corsOrigins: [],
        redisUrl: "",
        cacheTtlSeconds: 60,
        rateLimitWindowMs: 900000,
        rateLimitMax: 300,
        healthRateLimitWindowMs: 60000,
        healthRateLimitMax: 60,
        trustProxy: false,
        demoModeEnabled: false
      })
    );
  });
});
