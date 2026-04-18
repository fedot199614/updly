import { Router } from "express";
import { check } from "express-validator";
import { createProject, getProjectById, getProjects, deleteProject } from "@/backend/controllers/projects.controller.js";
import { handleValidation } from "@/backend/server/middlewares/handle-validation.js";
import { asyncHandler } from "@/backend/server/middlewares/async-handler.js";
import pagesRoutes from "@/backend/routes/pages.routes.js";
import { validateProjectExists } from "@/backend/server/middlewares/validate-project-exists.js";
import { validateObjectId } from "@/backend/server/middlewares/validate-object-id.js";

const router = Router();

router.post("/", [check("name").not().isEmpty(), handleValidation], asyncHandler(createProject));

router.get("/", asyncHandler(getProjects));
router.get("/:projectId", [validateObjectId("projectId"), validateProjectExists], asyncHandler(getProjectById));
router.delete("/:projectId", validateObjectId("projectId"), validateProjectExists, asyncHandler(deleteProject));

router.use("/:projectId/pages", [validateObjectId("projectId"), validateProjectExists], pagesRoutes);

export default router;