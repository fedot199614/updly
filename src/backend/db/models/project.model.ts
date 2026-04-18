import { Schema, model } from "mongoose";
import { PROJECT_TYPE } from "@/shared/constants/project-type.js";

const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    type: {
      type: String,
      enum: Object.values(PROJECT_TYPE),
      default: PROJECT_TYPE.CUSTOM,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Project = model("Project", projectSchema);