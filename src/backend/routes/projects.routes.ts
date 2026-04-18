import { Router } from "express";
import { createProject, getProjectById, getProjects } from "@/backend/controllers/projects.controller.js";

const router = Router();

router.post("/", createProject);
router.get("/", getProjects);
router.get("/:id:", getProjectById);

export default router;