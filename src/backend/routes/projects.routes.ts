import { Router } from "express";
import { check } from "express-validator";
import { createProject, getProjectById, getProjects } from "@/backend/controllers/projects.controller.js";
import { handleValidation } from "@/backend/server/middlewares/handle-validation.middleware.js";
import { asyncHandler } from "@/backend/server/middlewares/async-handler.middleware.js";

const router = Router();

router.post("/", 
    [check("name").not().isEmpty()], 
    handleValidation, 
    asyncHandler(createProject)
);

router.get("/", asyncHandler(getProjects));
router.get("/:id", [check("id").isMongoId()], handleValidation, asyncHandler(getProjectById));

export default router;