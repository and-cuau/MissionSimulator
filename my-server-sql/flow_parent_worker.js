// flow_parent_worker.js
const { Worker } = require("bullmq");
const IORedis = require("ioredis");

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  family: 0, // This enables IPv6 (and IPv4 fallback) to work with Railway
});

module.exports = () => {
  const worker = new Worker(
    "missions",
    async (job) => {
      try {
        console.log();

        const now = new Date().toISOString();
        console.log(`[${now}] Processing job:`, job.name, job.data);

        console.log();
        const ms = job.data.Length || 10000;
        await new Promise((resolve) => setTimeout(resolve, ms));

        console.log();

        const now2 = new Date().toISOString();
        console.log(`[${now2}] task finished`);
        console.log();
      } catch (err) {
        console.error("Job failed:", err);
      }
    },
    { connection, concurrency: 5 },
  );
};
