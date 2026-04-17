import { Router } from "express";
import { createWebsite, getWebsites } from "@/backend/controllers/websites.controller.js";

const router = Router();

router.post("/", createWebsite);
router.get("/", getWebsites);

export default router;