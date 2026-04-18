import { Request, Response } from "express";
import { createPageService, getPagesService, getPageByProjectIdService, deletePageService } from "@/backend/services/pages.service.js";

export const createPage = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { url, name } = req.body;

    const page = await createPageService({
        projectId,
        url,
        name,
    });

    return res.status(201).json(page);
};

export const getPages = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const pages = await getPagesService(projectId);
    return res.json(pages);
};

export const getPageById = async (req: Request, res: Response) => {
    const page = (req as any).page;
    return res.json(page);
};

export const getPageByProjectId = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const pages = await getPageByProjectIdService(projectId);
    return res.json(pages);
};

export const deletePage = async (req: Request, res: Response) => {
  const page = (req as any).page;
  await deletePageService(page._id);
  return res.status(204).send();
};