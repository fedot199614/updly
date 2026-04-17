// src/backend/controllers/websites.controller.ts

import { Request, Response } from "express";
import { createWebsiteService, getWebsitesService,  } from "@/backend/services/websites.service.js";

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