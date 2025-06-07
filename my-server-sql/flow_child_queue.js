// queue.js
const { Queue } = require("bullmq");
const IORedis = require("ioredis");


require("dotenv").config();

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is not defined");
}

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});


const objectiveQueue = new Queue("objectives", { connection });

module.exports = objectiveQueue;
