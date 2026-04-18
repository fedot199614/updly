import { Queue } from "bullmq";
import { redisConfig } from "../connection.js";

export const monitorQueue = new Queue("monitor", {
  connection: redisConfig,
});

monitorQueue.on("error", (err) => {
  console.error("Queue error:", err);
});