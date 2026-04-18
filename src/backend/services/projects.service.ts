import { Project } from "@/backend/db/models/project.model.js";
import { ERRORS } from "@/shared/errors/errors.js";
import { AppError } from "@/shared/errors/app-error.js";

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