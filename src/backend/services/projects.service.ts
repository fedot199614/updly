import { Project } from "@/backend/db/models/project.model.js";

export const createProjectService = async ({
  name,
  type,
}: {
  name: string;
  type?: string;
}) => {
  return await Project.create({
    name: name.trim(),
    type,
  });
};

export const getProjectsService = async () => {
  return await Project.find().sort({ createdAt: -1 });
};

export const getProjectByIdService = async (id: string) => {
  return await Project.findById(id);
};