import mongoose, { Types } from "mongoose";

// Snapshot теперь хранит:
//   nodes: PageNode[] — все извлечённые элементы страницы
//   diff:  PageDiff   — структурированные изменения (null для первого snapshot)
//   hash:  string     — хеш всех нод для быстрого сравнения
//
// Старые поля items / normalizedItems убраны.

const nodeChangeSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["added", "removed", "changed"],
      required: true,
    },
    role: {
      type: String,
      enum: ["heading", "text", "link", "image", "price", "date", "cta", "list_item", "meta"],
      required: true,
    },
    selector: { type: String, required: true },
    current:  { type: String, default: null },
    previous: { type: String, default: null },
    href:     { type: String, default: null },
    src:      { type: String, default: null },
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

    // Полный список контентных элементов страницы
    nodes: {
      type: Array,
      default: [],
    },

    // Структурированный diff с предыдущим snapshot
    diff: {
      hasChanges: { type: Boolean, default: false },
      changes:    { type: [nodeChangeSchema], default: [] },
      summary: {
        added:   { type: Number, default: 0 },
        removed: { type: Number, default: 0 },
        changed: { type: Number, default: 0 },
      },
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

    // Ошибки сохраняются в том же snapshot
    error: {
      type: String,
      default: null,
    },

    errorStack: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: false,
  }
);

snapshotSchema.index({ pageId: 1, createdAt: -1 });

export const Snapshot = mongoose.model("Snapshot", snapshotSchema);