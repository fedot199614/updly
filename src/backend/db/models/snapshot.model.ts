import mongoose, { Types } from "mongoose";

const snapshotSchema = new mongoose.Schema(
  {
    pageId: {
      type: Types.ObjectId,
      ref: "Page",
      required: true,
      index: true,
    },

    html: {
      type: String,
      required: true,
    },

    text: {
      type: String,
      default: null,
    },

    metadata: {
      type: Object,
      default: {},
    },

    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

export const Snapshot = mongoose.model("Snapshot", snapshotSchema);