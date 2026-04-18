import { Router } from "express";
import healthRoutes from "@/backend/routes/health.routes.js";
import pagesRoutes from "@/backend/routes/pages.routes.js";
import projectRoutes from "@/backend/routes/projects.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/projects", pagesRoutes);
router.use("/projects", projectRoutes);

export default router;