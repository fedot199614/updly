import { Schema, model, Types } from "mongoose";
import { PAGE_STATUS } from "@/shared/constants/page-status.js";
import { PAGE_FETCH_MODE } from "@/shared/constants/page-fetch-mode.js";

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
        },
        errorCount: {
            type: Number,
            default: 0,
        },
        lastErrorAt: {
            type: Date,
            default: null,
        },
        lastErrorType: {
            type: String,
            default: null,
        },
        error: {
            type: String,
            default: null,
        },
        mode: {
            type: String,
            enum: Object.values(PAGE_FETCH_MODE),
            default: PAGE_FETCH_MODE.AUTO,
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

pageSchema.index({ projectId: 1, url: 1 }, { unique: true });

export const Page = model("Page", pageSchema);