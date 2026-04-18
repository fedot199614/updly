import { Schema, model, Types } from 'mongoose';

const diffSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['price_changed', 'field_changed', 'added', 'removed'],
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    before: {
      type: Schema.Types.Mixed,
    },
    after: {
      type: Schema.Types.Mixed,
    },
  },
  { _id: false }
);

const updateSchema = new Schema(
  {
    pageId: {
      type: Types.ObjectId,
      ref: "Page",
      required: true,
      index: true,
    },

    snapshotBeforeId: {
      type: Types.ObjectId,
      ref: 'Snapshot',
      required: true,
    },

    snapshotAfterId: {
      type: Types.ObjectId,
      ref: 'Snapshot',
      required: true,
    },

    changes: {
      type: [diffSchema],
      required: false,
      default: [],
    },

    hasChanges: {
      type: Boolean,
      required: true,
      index: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    versionKey: false,
  }
);

updateSchema.index({ pageId: 1, createdAt: -1 });

export const UpdateModel = model('Update', updateSchema);