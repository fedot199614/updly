import { Router } from "express";
import { createPage, getPageById, getPages } from "@/backend/controllers/pages.controller.js";

const router = Router();

router.post("/:projectId/pages", createPage);
router.get("/:projectId/pages", getPages);
router.get("/:projectId/pages/:id", getPageById);

export default router;