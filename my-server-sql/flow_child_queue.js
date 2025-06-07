// queue.js
const { Queue } = require("bullmq");
const IORedis = require("ioredis");



const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});


const objectiveQueue = new Queue("objectives", { connection });

module.exports = objectiveQueue;
