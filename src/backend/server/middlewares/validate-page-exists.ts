import { Request, Response, NextFunction } from "express";
import { Page } from "@/backend/db/models/page.model.js";
import { ERRORS } from "@/shared/errors/errors.js";

export const validatePageExists = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { pageId, projectId } = req.params;

    const page = await Page.findOne({ _id: pageId, projectId });

    if (!page) {
        return res.status(404).json({ error: ERRORS.PAGE_NOT_FOUND });
    }

    (req as any).page = page;

    next();
};