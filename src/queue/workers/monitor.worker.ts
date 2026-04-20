import { Worker } from "bullmq";
import { redisConfig } from "@/queue/connection.js";
import { processMonitorJob } from "@/backend/services/monitor.service.js";

export const initMonitorWorker = () => {
  const worker = new Worker(
    "monitor",
    async (job) => {
      console.log("Processing job:", job.name, job.data); 
      await processMonitorJob(job);
    },
    {
      connection: redisConfig
    }
  );

  worker.on("completed", (job) => {
    console.log(`Job completed: ${job.id}, pageId: ${job.data.pageId}`);
  });

  worker.on("failed", (job, err) => {
    console.error(`Job failed: ${job?.id}, pageId: ${job?.data?.pageId}`, err.message);
  });

  return worker;
};