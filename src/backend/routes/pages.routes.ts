import { Router } from "express";
import { check } from "express-validator";
import { createPage, getPageById, getPages, deletePage } from "@/backend/controllers/pages.controller.js";
import { handleValidation } from "@/backend/server/middlewares/handle-validation.js";
import { asyncHandler } from "@/backend/server/middlewares/async-handler.js";
import { validatePageExists } from "@/backend/server/middlewares/validate-page-exists.js";
import { validateObjectId } from "@/backend/server/middlewares/validate-object-id.js";

const router = Router({ mergeParams: true });

router.post(
  "/",
  [check("url").not().isEmpty()],
  handleValidation,
  asyncHandler(createPage)
);
router.get(
  "/",
  asyncHandler(getPages)
);
router.get(
  "/:pageId",
  validateObjectId("pageId"),
  validatePageExists,
  asyncHandler(getPageById)
);

router.delete(
  "/:pageId",
  validateObjectId("pageId"),
  validatePageExists,
  asyncHandler(deletePage)
);

export default router;