// queue.js
const { Queue } = require("bullmq");
const IORedis = require("ioredis");



const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});


const missionQueue = new Queue("missions", { connection });

module.exports = missionQueue;
