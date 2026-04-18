import { Page } from "@/backend/db/models/page.model.js";
import { Project } from "@/backend/db/models/project.model.js";

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

    const project = await Project.findById(projectId);
    if (!project) {
        throw new Error("PROJECT_NOT_FOUND");
    }

    const existing = await Page.findOne({
        projectId,
        url: normalizedUrl,
    });

    if (existing) {
        throw new Error("PAGE_EXISTS");
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

export const getPageByIdService = async (id: string, projectId: string) => {
  return await Page.findOne({ _id: id, projectId });
};

export const getPageByProjectIdService = async (projectId: string) => {
    return await Page.find({ projectId }).sort({ createdAt: -1 });
};