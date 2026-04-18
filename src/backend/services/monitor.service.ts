import axios from "axios";
import { Page } from "@/backend/db/models/page.model.js";
import { Snapshot } from "@/backend/db/models/snapshot.model.js";
import { PAGE_STATUS } from "@/shared/constants/page-status.js";
import { Job } from "bullmq/dist/esm/classes/job";

export const processMonitorJob = async (job: Job<any, any, string>) => {

    const { pageId, url } = job.data;

    const page = await Page.findById(pageId);

    if (!page || page.status === PAGE_STATUS.PAUSED) {
        const msg = `Skipping job for page ${pageId} - Page not found or paused`;   
        job.log(msg);
        console.log(msg);
        return;
    }

    try {
        const response = await axios.get(url, {
            timeout: 10000,
        });

        await Snapshot.create({
            pageId,
            html: response.data,
            statusCode: response.status,
        });

        await Page.findByIdAndUpdate(pageId, {
            lastCheckedAt: new Date(),
            errorCount: 0,
            lastErrorAt: null,
        });

        job.log(`Successfully monitored page ${pageId} - Status: ${response.status}`);

    } catch (error) {

        const message = error instanceof Error ? error.message : String(error);
        const statusCode = axios.isAxiosError(error) ? error.response?.status : null;

        job.log(`Error monitoring page ${pageId} - ${message}`);

        await Snapshot.create({
            pageId,
            html: null,
            statusCode: null,
            error: message,
            errorStack: error instanceof Error ? error.stack : null
        });

        job.log(`Created snapshot for failed page ${pageId}`);

        const isSameError = page?.lastErrorType === String(statusCode);
        const newErrorCount = isSameError ? (page.errorCount + 1) : 1;

        const update: any = {
            lastCheckedAt: new Date(),
            errorCount: newErrorCount,
            lastErrorAt: new Date(),
            error: message,
            lastErrorType: String(statusCode),
        };

        if (newErrorCount >= 5) {
            update.status = "paused";
        }

        await Page.findByIdAndUpdate(pageId, update);

        throw error;
    }
};