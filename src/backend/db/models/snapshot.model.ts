// src/backend/db/models/snapshot.model.ts

import mongoose, { Types } from "mongoose";

const fieldChangeSchema = new mongoose.Schema(
  {
    field: { type: String, required: true },
    from: { type: String, default: null },
    to: { type: String, default: null },
  },
  { _id: false }
);

const unitChangeSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["added", "removed", "changed"],
      required: true,
    },
    category: { type: String, required: true },
    title: { type: String, default: null },
    fields: { type: [fieldChangeSchema], default: [] },
    link: { type: String, default: null },
  },
  { _id: false }
);

const snapshotSchema = new mongoose.Schema(
  {
    pageId: {
      type: Types.ObjectId,
      ref: "Page",
      required: true,
      index: true,
    },

    // Detected site type: ecommerce | news | landing | social | directory | generic
    siteType: {
      type: String,
      default: "generic",
    },

    // Extracted content units (ContentUnit[])
    units: {
      type: Array,
      default: [],
    },

    // Page meta: title, description, og:*
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Structured diff with previous snapshot
    diff: {
      hasChanges: { type: Boolean, default: false },
      changes: { type: [unitChangeSchema], default: [] },
      summary: {
        added: { type: Number, default: 0 },
        removed: { type: Number, default: 0 },
        changed: { type: Number, default: 0 },
      },
    },

    // Content hash for quick comparison
    hash: {
      type: String,
      default: null,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // Error snapshots
    error: { type: String, default: null },
    errorStack: { type: String, default: null },
  },
  { timestamps: false }
);

snapshotSchema.index({ pageId: 1, createdAt: -1 });

export const Snapshot = mongoose.model("Snapshot", snapshotSchema);