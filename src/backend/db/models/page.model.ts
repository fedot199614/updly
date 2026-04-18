import { Schema, model, Types } from "mongoose";
import { PAGE_STATUS } from "@/shared/constants/page-status.js";

const pageSchema = new Schema(
    {
        projectId: {
            type: Types.ObjectId,
            ref: "Project",
            required: true,
            index: true,
        },

        url: {
            type: String,
            required: true,
            trim: true
        },

        name: {
            type: String,
            unique: true,
            default: null,
        },

        status: {
            type: String,
            enum: Object.values(PAGE_STATUS),
            default: PAGE_STATUS.ACTIVE,
        },

        lastCheckedAt: {
            type: Date,
            default: null,
        },

        checkInterval: {
            type: Number,
            default: 300,
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

pageSchema.index({ projectId: 1, url: 1 }, { unique: true });

export const Page = model("Page", pageSchema);