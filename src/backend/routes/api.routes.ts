import { Router } from "express";
import healthRoutes from "@/backend/routes/health.routes.js";
import websitesRoutes from "@/backend/routes/websites.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/websites", websitesRoutes);

export default router;