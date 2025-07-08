const { Queue, Worker } = require("bullmq");
const sendMessage = require("../utils/sendMessage");
const Redis = require("ioredis");

const connection = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  maxRetriesPerRequest: null,
});

const notificationQueue = new Queue("notification-pool", {
  connection,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: true,
    attempts: 1,
  },
});

notificationQueue.on("waiting", (job) => {
  console.log(`A job with ID ${job.id} is waiting`);
});

const notificationWorker = new Worker(
  "notification-pool",
  async (job) => {
    if (job.name === "send-notification") {
      await sendMessage({
        deviceFCMToken: job.data.FCMToken,
        title: job.data.title,
        body: job.data.body,
      });
      await notificationQueue.clean(0, 1000, "failed");
      await notificationQueue.clean(0, 1000, "completed");
    }
  },
  {
    connection,
  }
);

notificationWorker.on("completed", (job) => {
  console.log(`${job.id} executed successfully!, ${JSON.stringify(job)}`);
});

notificationWorker.on("failed", (job, err) => {
  console.log(`${job.id} has failed with ${err.message}`);
  // ? call delete FCM endpoint in main app using job.body.FCMToken
});

module.exports = {
  notificationQueue,
  notificationWorker,
};
