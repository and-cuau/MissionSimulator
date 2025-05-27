// queue.js
const { Queue } = require("bullmq");
const IORedis = require("ioredis");

const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

const missionQueue = new Queue("missions", { connection });

module.exports = missionQueue;

// function addMissionJob(mission_title, start_date, end_date, mission_id) {

//   console.log("\ntask delay in sec: ", delay_ms / 1000);
//   console.log("task length in sec: ", length / 1000, "\n");

//   // parentQueue.add(
//   //   mission_title,
//   //   { jobId: mission_id, MissionId: mission_id, Length: length },
//   //   { delay: delay_ms, attempts: 1 },
//   // );
// }