import { initMonitorWorker } from "@/queue/workers/monitor.worker.js";
import initializeDb from "@/backend/db/init-db.js";

console.log("Starting worker...");
await initializeDb();
initMonitorWorker();