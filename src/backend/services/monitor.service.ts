import axios from "axios";
import { Page } from "@/backend/db/models/page.model.js";
import { Snapshot } from "@/backend/db/models/snapshot.model.js";
import { PAGE_STATUS } from "@/shared/constants/page-status.js";
import { Job } from "bullmq/dist/esm/classes/job";
import { processPage } from "@/backend/services/pipline/process-page.pipeline.js";

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

        const { html, blocks, normalizedItems, hash } = await processPage(page);

        console.log("Extracted items count:", blocks.length);
        console.log("Normalized items count:", normalizedItems.length);
        console.log("First normalized items:", normalizedItems.slice(0, 3));
        job.log("Extracted items count: " + blocks.length);
        job.log("Normalized items count: " + normalizedItems.length);
        job.log("First normalized items: " + JSON.stringify(normalizedItems.slice(0, 3), null, 2));


        const lastSnapshot = await Snapshot.findOne({ pageId })
        .sort({ createdAt: -1 })
        .lean();

        // ⚡ если ничего не изменилось — выходим
        if (lastSnapshot && lastSnapshot.hash === hash) {
        job.log("No changes detected");
        
        await Page.findByIdAndUpdate(pageId, {
            lastCheckedAt: new Date(),
        });

        return;
        }


        const snapshot = await Snapshot.create({
            pageId,
            items: blocks,
            normalizedItems,
            hash
        });

        await Page.findByIdAndUpdate(pageId, {
            lastCheckedAt: new Date(),
            errorCount: 0,
            lastErrorAt: null,
            lastErrorType: null,
            error: null
        });

        job.log(`Successfully monitored page ${pageId}, page url: ${url}, snapshot id: ${snapshot.id}`);
        console.log(`Successfully monitored page ${pageId}, page url: ${url}, snapshot id: ${snapshot.id}`);

    } catch (error) {

        const message = error instanceof Error ? error.message : String(error);

        job.log(`Error monitoring page ${pageId} - ${message}`);

        await Snapshot.create({
            pageId,
            error: message,
            errorStack: error instanceof Error ? error.stack : null
        });

        job.log(`Created snapshot for failed page ${pageId}`);

        const newErrorCount = page.errorCount + 1;

        const update: any = {
            lastCheckedAt: new Date(),
            errorCount: newErrorCount,
            lastErrorAt: new Date(),
            error: message
        };

        if (newErrorCount >= 5) {
            update.status = "paused";
        }

        await Page.findByIdAndUpdate(pageId, update);

        throw error;
    }
};