import { Schema, model, Types } from "mongoose";
import { SCRAPE_STATUS } from "@/shared/constants/scrape-status.js";

const scrapeRunSchema = new Schema(
  {
    pageId: {
      type: Types.ObjectId,
      ref: "Page",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: Object.values(SCRAPE_STATUS),
      default: SCRAPE_STATUS.PENDING,
      index: true,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    finishedAt: {
      type: Date,
      default: null,
    },

    error: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

scrapeRunSchema.index({ pageId: 1, createdAt: -1 });

export const ScrapeRun = model("ScrapeRun", scrapeRunSchema);