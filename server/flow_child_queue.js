// queue.js
const { Queue } = require("bullmq");
const IORedis = require("ioredis");

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  family: 0, // This enables IPv6 (and IPv4 fallback) to work with Railway
});

const objectiveQueue = new Queue("objectives", { connection });

module.exports = objectiveQueue;
