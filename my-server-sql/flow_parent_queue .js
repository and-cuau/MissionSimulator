// queue.js
const { Queue } = require("bullmq");
const IORedis = require("ioredis");



const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  family: 0, // This enables IPv6 (and IPv4 fallback) to work with Railway
});


const missionQueue = new Queue("missions", { connection });

module.exports = missionQueue;
