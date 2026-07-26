const dotenv = require("dotenv");

dotenv.config({quiet: true});

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return ["1", "true", "yes"].includes(String(value).toLowerCase());
};

const toOriginList = (value) =>
  String(value || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin && origin !== "*");

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: toNumber(process.env.PORT, 3000),
  apiPrefix: process.env.API_PREFIX || "/api",
  corsOrigins: toOriginList(process.env.CORS_ORIGIN),
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL || "",
  cacheTtlSeconds: toNumber(process.env.CACHE_TTL_SECONDS, 60),
  rateLimitWindowMs: toNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  rateLimitMax: toNumber(process.env.RATE_LIMIT_MAX, 300),
  healthRateLimitWindowMs: toNumber(process.env.HEALTH_RATE_LIMIT_WINDOW_MS, 60 * 1000),
  healthRateLimitMax: toNumber(process.env.HEALTH_RATE_LIMIT_MAX, 60),
  trustProxy: toBoolean(process.env.TRUST_PROXY),
  demoModeEnabled: toBoolean(process.env.DEMO_MODE_ENABLED, process.env.NODE_ENV !== "production")
};

module.exports = {env};
