import { Queue, Worker } from "bullmq";
import { sendMessage } from "../utils/sendMessage";
import IORedis from "ioredis";

const connection = new IORedis({ maxRetriesPerRequest: null });

export const notificationQueue = new Queue("notification-pool", {
  connection,
});

notificationQueue.on("waiting", ({ jobId }) => {
  console.log(`A job with ID ${jobId} is waiting`);
});

notificationQueue.on("active", ({ jobId, prev }) => {
  console.log(`Job ${jobId} is now active; previous status was ${prev}`);
});

notificationQueue.on("completed", ({ jobId, returnvalue }) => {
  console.log(`${jobId} has completed and returned ${returnvalue}`);
});

notificationQueue.on("failed", ({ jobId, failedReason }) => {
  console.log(`${jobId} has failed with reason ${failedReason}`);
});

// ? uncomment this if you want to track progress
// notificationQueue.on("progress", ({ jobId, data }, timestamp) => {
//   console.log(`${jobId} reported progress ${data} at ${timestamp}`);
// });

export const notificationWorker = new Worker(
  "notification-pool",
  async (job) => {
    if (job.name === "send-notification") {
      await sendMessage({
        deviceFCMToken: job.data.deviceFCMToken,
        title: job.data.title,
        body: job.data.body,
      });
    }
  },
  { connection }
);

notificationWorker.on("completed", (job) => {
  console.log(`${job.id} executed successfully!`);
});

notificationWorker.on("failed", (job, err) => {
  console.log(`${job.id} has failed with ${err.message}`);
  // ? call delete FCM endpoint in main app
});
