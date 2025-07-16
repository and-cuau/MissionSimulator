// flow_child_worker.js
const { Worker } = require("bullmq");
const IORedis = require("ioredis");

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  family: 0, // This enables IPv6 (and IPv4 fallback) to work with Railway
});

//  const newObj = {name: description, queueName: "objectives", data:{ description: description, length: estimated_duration}, children: null};
count = 0;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runInterval(interval_len, ms, num_intervals, job) {
  for (let i = 0; i < num_intervals; i++) {
    const percentage = (interval_len / ms) * 100 * (i + 1);
    console.log(percentage);
    console.log(`Iteration ${i} ${job.id}`);
    await delay(interval_len); // wait for 1 second
    console.log(job.data.description);
    await job.updateProgress({
      percent: percentage,
      message: job.data.description,
    });
  }
  console.log("Done");
}

module.exports = () => {
  console.log("test intitate child worker");
  const worker = new Worker(
    "objectives",
    async (job) => {
      try {
        // res.send(job.id);
        console.log();

        const now = new Date().toLocaleString();
        console.log(`[${now}] Processing job:`, job.name, job.data);

        console.log();
        const ms = job.data.Length || 10000; // await job.updateProgress({ percent: 50, message: 'Halfway done' });

        const interval_len = 1000;
        const num_intervals = ms / interval_len;

        await runInterval(interval_len, ms, num_intervals, job);

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
