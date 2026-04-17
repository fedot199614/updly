import { Schema, model, Types } from "mongoose";

const scrapeRunSchema = new Schema(
  {
    websiteId: {
      type: Types.ObjectId,
      ref: "Website",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["pending", "running", "success", "failed"],
      default: "pending",
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

scrapeRunSchema.index({ websiteId: 1, createdAt: -1 });

export const ScrapeRun = model("ScrapeRun", scrapeRunSchema);