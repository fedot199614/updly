import mongoose from "mongoose";

const websiteSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      unique: true,
      index: true
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

export const Website = mongoose.model("Website", websiteSchema);