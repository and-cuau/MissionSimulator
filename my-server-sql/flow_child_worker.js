// flow_child_worker.js
const { Worker } = require("bullmq");
const IORedis = require("ioredis");

const connection = new IORedis(
  process.env.REDIS_URL || {
    host: "127.0.0.1",
    port: 6379,
    maxRetriesPerRequest: null,
  },
);

//  const newObj = {name: description, queueName: "objectives", data:{ description: description, length: estimated_duration}, children: null};
count = 0;

// function runInterval(ms, num_intervals) {
//   return new Promise((resolve) => {
//     const intervalId = setInterval(() => {
//       console.log(`Count: ${count}`);
//       count += ms / num_intervals;
//       if (count >= ms) {
//         clearInterval(intervalId); // Stops the interval
//         console.log("Interval cleared.");
//         count = 0;
//       }
//     }, ms / num_intervals);
//   });
// }

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runInterval(interval_len, ms, num_intervals, job) {
  for (let i = 0; i < num_intervals; i++) {
    const percentage = (interval_len / ms) * 100 * (i + 1);
    console.log(percentage);
    console.log(`Iteration ${i} ${job.id}`);
    await delay(interval_len); // wait for 1 second
    await job.updateProgress({ percent: percentage, message: "Test" });
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

// module.exports = () => {
//   const worker = new Worker(
//     "objectives",
//     async (job) => {
//       try {
//         console.log();

//         const now = new Date().toLocaleString();
//         console.log(`[${now}] Processing job:`, job.name, job.data);

//         console.log();
//         const ms = job.data.Length || 10000; // await job.updateProgress({ percent: 50, message: 'Halfway done' });
//         await new Promise((resolve) => setTimeout(resolve, ms));

//         console.log();

//         const now2 = new Date().toLocaleString();
//         console.log(`[${now2}] task finished`);
//         console.log();
//       } catch (err) {
//         console.error("Job failed:", err);
//       }
//     },
//     { connection, concurrency: 5 },
//   );
// };
