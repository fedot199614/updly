import { Page } from "@/backend/db/models/page.model.js";
import { Project } from "@/backend/db/models/project.model.js";
import { ERRORS } from "@/shared/errors/errors.js";
import { AppError } from "@/shared/errors/app-error.js";

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

    return await Page.create({
        projectId,
        url: normalizedUrl,
        name,
    });
};

export const getPagesService = async (projectId: string) => {
    return await Page.find({ projectId }).sort({ createdAt: -1 });
};

export const getPageByProjectIdService = async (projectId: string) => {
    return await Page.find({ projectId }).sort({ createdAt: -1 });
};

export const deletePageService = async (pageId: string) => {
  await Page.findByIdAndDelete(pageId);
};