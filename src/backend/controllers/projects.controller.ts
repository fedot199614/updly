import mongoose from "mongoose";
import { Request, Response } from "express";
import { createProjectService, getProjectsService, getProjectByIdService } from "@/backend/services/projects.service.js";


export const createProject = async (req: Request, res: Response) => {
    try {
        const { name, type } = req.body;

        if (!name) {
            return res.status(400).json({ error: "name is required" });
        }

        const project = await createProjectService({ name, type });

        return res.status(201).json(project);
    } catch {
        return res.status(500).json({ error: "Internal server error" });
    }
};


export const getProjects = async (_req: Request, res: Response) => {
    try {
        const projects = await getProjectsService();
        return res.json(projects);
    } catch {
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getProjectById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid id" });
        }

        const project = await getProjectByIdService(id);

        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        return res.json(project);
    } catch {
        return res.status(500).json({ error: "Internal server error" });
    }
};