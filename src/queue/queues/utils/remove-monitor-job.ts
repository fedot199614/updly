import { monitorQueue } from "@/queue/queues/monitor.queue.js";

export const removeMonitorJob = async (pageId: string) => {
    try {
        
        const jobId = `monitor:${pageId}`;

        const repeatableJobs = await monitorQueue.getRepeatableJobs();

        const job = repeatableJobs.find((j) => j.id === jobId);

        if (!job) return;

        await monitorQueue.removeRepeatableByKey(job.key);

    } catch (error) {
        console.error("Failed to remove monitor job:", {
            pageId,
            error: error instanceof Error ? error.message : error,
        });
    }
};