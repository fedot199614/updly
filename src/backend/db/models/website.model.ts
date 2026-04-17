import mongoose from "mongoose";

const websiteSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["active", "paused"],
      default: "active",
    },

    lastCheckedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

websiteSchema.index({ url: 1 });

export const Website = mongoose.model("Website", websiteSchema);