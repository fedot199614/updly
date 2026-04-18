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
      default: null
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

    statusCode: {
      type: Number,
      default: null,
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