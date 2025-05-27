// queue.js
// const { Queue } = require("bullmq");
// const IORedis = require("ioredis");

// const connection = new IORedis({
//   host: "127.0.0.1",
//   port: 6379,
//   maxRetriesPerRequest: null,
// });
// const myQueue = new Queue("my-queue", { connection });

// const missionQueue = new Queue("missions", { connection });
// const objectiveQueue = new Queue("objectives", { connection });

// // const flow = new FlowProducer();

// function addMissionJob(mission_title, start_date, end_date, mission_id) {
//   const now = new Date();
//   const start_date_obj = new Date(start_date);
//   const end_date_obj = new Date(end_date);

//   const length = end_date_obj - start_date_obj;
//   const delay_ms = start_date_obj - now;

//   console.log("\ntask delay in sec: ", delay_ms / 1000);
//   console.log("task length in sec: ", length / 1000, "\n");

//   myQueue.add(
//     mission_title,
//     { jobId: mission_id, MissionId: mission_id, Length: length },
//     { delay: delay_ms, attempts: 1 },
//   );
// }

// module.exports = { myQueue, addMissionJob };

const { Queue } = require("bullmq");
const IORedis = require("ioredis");

const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});


const myQueue = new Queue("my-queue", { connection });

module.exports = (start_date, end_date, mission_id) => {
  const now = new Date();
  const start_date_obj = new Date(start_date);
  const end_date_obj = new Date(end_date);

  const length = end_date_obj - start_date_obj;

  const delay_ms = start_date_obj - now;

  console.log();
  console.log("task delay in sec: ");
  console.log(delay_ms / 1000);

  console.log();
  console.log("task length in sec: ");
  console.log(length / 1000);
  console.log();

  myQueue.add(
    "some_mission_title",
    { jobId: mission_id, MissionId: mission_id, Length: length },
    { delay: delay_ms, attempts: 1 },
  );
};
