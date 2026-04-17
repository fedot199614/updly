import { Website } from "@/backend/db/models/website.model.js";

export const createWebsiteService = async ({
  url,
  name,
}: {
  url: string;
  name?: string;
}) => {
  const normalizedUrl = url.trim().toLowerCase();

  const existing = await Website.findOne({ url: normalizedUrl });

  if (existing) {
    throw new Error("WEBSITE_EXISTS");
  }

  const website = await Website.create({
    url: normalizedUrl,
    name,
  });

  return website;
};