import { Router } from "express";
import { check } from "express-validator";
import { createPage, getPageById, getPages } from "@/backend/controllers/pages.controller.js";
import { handleValidation } from "@/backend/server/middlewares/handle-validation.middleware.js";
import { asyncHandler } from "@/backend/server/middlewares/async-handler.middleware.js";

const router = Router();

router.post(
  "/:projectId/pages",
  [check("projectId").isMongoId(), check("url").not().isEmpty()],
  handleValidation,
  asyncHandler(createPage)
);
router.get(
  "/:projectId/pages",
  [check("projectId").isMongoId()],
  handleValidation,
  asyncHandler(getPages)
);
router.get(
  "/:projectId/pages/:id",
  [check("id").isMongoId(), check("projectId").isMongoId()],
  handleValidation,
  asyncHandler(getPageById)
);

export default router;