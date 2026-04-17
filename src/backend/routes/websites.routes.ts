import { Router } from "express";
import { createWebsite } from "@/backend/controllers/websites.controller.js";

const router = Router();

router.post("/", createWebsite);

export default router;