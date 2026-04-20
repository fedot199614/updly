import mongoose, { Types } from "mongoose";

const snapshotSchema = new mongoose.Schema(
  {
    pageId: {
      type: Types.ObjectId,
      ref: "Page",
      required: true,
      index: true,
    },

    items: {
      type: Array,
      default: [],
    },

    normalizedItems: {
      type: Array,
      default: [],
    },

    hash: {
      type: String,
      default: null,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    error: {
      type: String,
      default: null,
    },

    errorStack: {
      type: String,
      default: null,
    }

  },
  {
    timestamps: false,
  }
);

export const Snapshot = mongoose.model("Snapshot", snapshotSchema);