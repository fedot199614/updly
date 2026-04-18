import { Project } from "@/backend/db/models/project.model.js";
import { ERRORS } from "@/shared/errors/errors.js";
import { AppError } from "@/shared/errors/app-error.js";
import { Page } from "@/backend/db/models/page.model.js";
import { removeMonitorJob } from "@/queue/queues/utils/remove-monitor-job.js";

export const createProjectService = async ({
    name,
    type,
}: {
    name: string;
    type?: string;
}) => {

    const existing = await Project.findOne({
        name: name.trim(),
    });

    if (existing) {
        throw new AppError(ERRORS.PROJECT_EXISTS, 409);
    }

    return await Project.create({
        name: name.trim(),
        type,
    });
};

export const getProjectsService = async () => {
    return await Project.find().sort({ createdAt: -1 });
};

export const getProjectByIdService = async (id: string) => {
    const project = await Project.findById(id);
    if (!project) {
        throw new AppError(ERRORS.PROJECT_NOT_FOUND, 404);
    }
    return project;
};

export const deleteProjectService = async (projectId: string) => {
  const pages = await Page.find({ projectId }); 
    await Promise.all(
    pages.map((page) =>
      removeMonitorJob(page._id.toString())
    )
  ); 
  await Page.deleteMany({ projectId });
  await Project.findByIdAndDelete(projectId);
};