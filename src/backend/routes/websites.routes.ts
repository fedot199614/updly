import { Router } from "express";
import { createWebsite, getWebsiteById, getWebsites } from "@/backend/controllers/websites.controller.js";

const router = Router();

router.post("/", createWebsite);
router.get("/", getWebsites);
router.get("/:id", getWebsiteById);

export default router;