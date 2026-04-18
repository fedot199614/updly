import { JobsOptions } from "bullmq";
import { monitorQueue } from "@/queue/queues/monitor.queue.js";

export const safeAddJob = async (
  name: string,
  data: any,
  options?: JobsOptions
) => {
  try {
    
    return await monitorQueue.add(name, data, options);

  } catch (error) {

    console.error("Failed to add job:", {
      queue: monitorQueue.name,
      name,
      data,
      error: error instanceof Error ? error.message : error,
    });

  }
};