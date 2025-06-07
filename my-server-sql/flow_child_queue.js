// queue.js
const { Queue } = require("bullmq");
const IORedis = require("ioredis");

const connection = new IORedis(
  process.env.REDIS_URL || {
    host: "127.0.0.1",
    port: 6379,
    maxRetriesPerRequest: null,
  },
);

const objectiveQueue = new Queue("objectives", { connection });

module.exports = objectiveQueue;
