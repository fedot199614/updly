import { Request, Response, NextFunction } from "express";
import { Project } from "@/backend/db/models/project.model.js";
import { ERRORS } from "@/shared/errors/errors.js";
import mongoose from "mongoose";

export const validateProjectExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    return res.status(404).json({ error: ERRORS.PROJECT_NOT_FOUND });
  }

  (req as any).project = project;

  next();
};