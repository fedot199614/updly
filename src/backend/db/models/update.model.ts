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
    website: {
      type: Types.ObjectId,
      ref: 'Website',
      required: true,
      index: true,
    },

    snapshotBefore: {
      type: Types.ObjectId,
      ref: 'Snapshot',
      required: true,
    },

    snapshotAfter: {
      type: Types.ObjectId,
      ref: 'Snapshot',
      required: true,
    },

    changes: {
      type: [diffSchema],
      required: true,
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

export const UpdateModel = model('Update', updateSchema);