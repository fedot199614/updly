import { Page } from "@/backend/db/models/page.model.js";
import { ERRORS } from "@/shared/errors/errors.js";
import { AppError } from "@/shared/errors/app-error.js";
import { safeAddJob } from "@/queue/queues/utils/add-job.js";
import { removeMonitorJob } from "@/queue/queues/utils/remove-monitor-job.js";

export const createPageService = async ({
    projectId,
    url,
    name,
}: {
    projectId: string;
    url: string;
    name?: string;
}) => {
    const normalizedUrl = url.trim().toLowerCase();

    const existing = await Page.findOne({
        projectId,
        url: normalizedUrl,
    });

    if (existing) {
        throw new AppError(ERRORS.PAGE_EXISTS, 409);
    }

    const page = await Page.create({
        projectId,
        url: normalizedUrl,
        name,
    });

    console.log("Adding job to queue...");

    await safeAddJob(
        "monitor-page",
        {
            pageId: page._id.toString(),
            url: page.url,
        },
        {
            jobId: `monitor:${page._id}`,
            repeat: {
                every: 60 * 1000,
            },
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 5000,
            },
        }
    );

    return page;
};

export const getPagesService = async (projectId: string) => {
    return await Page.find({ projectId }).sort({ createdAt: -1 });
};

export const getPageByProjectIdService = async (projectId: string) => {
    return await Page.find({ projectId }).sort({ createdAt: -1 });
};

export const deletePageService = async (pageId: string) => {
    await removeMonitorJob(pageId);
    await Page.findByIdAndDelete(pageId);
};