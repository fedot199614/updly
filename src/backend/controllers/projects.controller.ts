import { Request, Response } from "express";
import { createProjectService, getProjectsService, getProjectByIdService, deleteProjectService } from "@/backend/services/projects.service.js";


export const createProject = async (req: Request, res: Response) => {
    const { name, type } = req.body;
    const project = await createProjectService({ name, type });
    return res.status(201).json(project);
};


export const getProjects = async (_req: Request, res: Response) => {
    const projects = await getProjectsService();
    return res.json(projects);
};

export const getProjectById = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const project = await getProjectByIdService(projectId);
    return res.json(project);
};

export const deleteProject = async (req: Request, res: Response) => {
  const project = (req as any).project;
  await deleteProjectService(project._id);
  return res.status(204).send();
}