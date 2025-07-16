const { QueueEvents } = require("bullmq");

const IORedis = require("ioredis");

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

// Create Redis connection with custom options
const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});

const queueEvents = new QueueEvents("objectives", { connection });

queueEvents.on("progress", ({ jobId, data }) => {
  // Emit progress to frontend
  console.log("objective progress event");
  io.emit(`job-progress-${jobId}`, data); // or socket.to(userRoom).emit(...)
});
