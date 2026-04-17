// src/backend/controllers/websites.controller.ts

import { Request, Response } from "express";
import { createWebsiteService, getWebsiteByIdService, getWebsitesService,  } from "@/backend/services/websites.service.js";

export const createWebsite = async (req: Request, res: Response) => {
  try {
    const { url, name } = req.body;

    if (!url) {
      return res.status(400).json({ error: "url is required" });
    }

    const website = await createWebsiteService({ url, name });

    return res.status(201).json(website);

  } catch (error: any) {
    if (error.message === "WEBSITE_EXISTS") {
      return res.status(409).json({ error: "Website already exists" });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getWebsites = async (_req: Request, res: Response) => {
  try {
    const websites = await getWebsitesService();
    return res.json(websites);
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
};

import mongoose from "mongoose";

export const getWebsiteById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const website = await getWebsiteByIdService(id);

    if (!website) {
      return res.status(404).json({ error: "Website not found" });
    }

    return res.json(website);
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
};