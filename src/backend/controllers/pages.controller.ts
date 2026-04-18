import { Request, Response } from "express";
import mongoose from "mongoose";
import { createPageService, getPagesService, getPageByIdService, getPageByProjectIdService } from "@/backend/services/pages.service.js";

export const createPage = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const { url, name } = req.body;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ error: "Invalid projectId" });
        }

        if (!url) {
            return res.status(400).json({ error: "url is required" });
        }

        const page = await createPageService({
            projectId,
            url,
            name,
        });

        return res.status(201).json(page);

    } catch (error: any) {

        if (error.message === "PROJECT_NOT_FOUND") {
            return res.status(404).json({ error: "Project not found" });
        }

        if (error.message === "PAGE_EXISTS") {
            return res.status(409).json({ error: "Page already exists" });
        }

        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getPages = async (req: Request, res: Response) => {
    try {

        const { projectId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ error: "Invalid projectId" });
        }

        const pages = await getPagesService(projectId);
        return res.json(pages);
    } catch {
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getPageById = async (req: Request, res: Response) => {
    try {
        const { id, projectId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid id" });
        }

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ error: "Invalid projectId" });
        }

        const page = await getPageByIdService(id, projectId);

        if (!page) {
            return res.status(404).json({ error: "Page not found" });
        }

        return res.json(page);
    } catch {
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getPageByProjectId = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ error: "Invalid projectId" });
        }

        const pages = await getPageByProjectIdService(projectId);

        return res.json(pages);
    } catch {
        return res.status(500).json({ error: "Internal server error" });
    }
};