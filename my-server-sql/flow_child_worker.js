// flow_child_worker.js
const { Worker } = require("bullmq");
const IORedis = require("ioredis");

const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

//  const newObj = {name: description, queueName: "objectives", data:{ description: description, length: estimated_duration}, children: null};

module.exports = () => {
  const worker = new Worker(
    "objectives",
    async (job) => {
      try {
        console.log();

        const now = new Date().toLocaleString();
        console.log(`[${now}] Processing job:`, job.name, job.data);

        console.log();
        const ms = job.data.Length || 10000;
        await new Promise((resolve) => setTimeout(resolve, ms));

        console.log();

        const now2 = new Date().toLocaleString();
        console.log(`[${now2}] task finished`);
        console.log();
      } catch (err) {
        console.error("Job failed:", err);
      }
    },
    { connection, concurrency: 5 },
  );
};
