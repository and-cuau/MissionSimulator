const { QueueEvents } = require("bullmq");

const IORedis = require("ioredis");

const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

const queueEvents = new QueueEvents("objectives", { connection });

queueEvents.on("progress", ({ jobId, data }) => {
  // Emit progress to frontend
  console.log("objective progress event");
  io.emit(`job-progress-${jobId}`, data); // or socket.to(userRoom).emit(...)
});
