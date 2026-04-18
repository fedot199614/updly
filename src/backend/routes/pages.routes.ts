import { Router } from "express";
import { check } from "express-validator";
import { createPage, getPageById, getPages } from "@/backend/controllers/pages.controller.js";
import { handleValidation } from "@/backend/server/middlewares/handle-validation.middleware.js";

const router = Router();

router.post("/:projectId/pages", [check("projectId").isMongoId(), check("url").not().isEmpty()], handleValidation, createPage);
router.get("/:projectId/pages", [check("projectId").isMongoId()], handleValidation, getPages);
router.get("/:projectId/pages/:id", [check("id").isMongoId(), check("projectId").isMongoId()], handleValidation, getPageById);

export default router;