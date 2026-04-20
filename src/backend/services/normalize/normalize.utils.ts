import crypto from "crypto";

export const normalizeText = (text?: string): string => {
  if (!text) return "";

  return text
    .replace(/\s+/g, " ")
    .replace(/\n/g, " ")
    .trim()
    .toLowerCase();
};

export const normalizeUrl = (url?: string): string | null => {
  if (!url) return null;

  try {
    const u = new URL(url);

    u.hash = "";
    u.search = "";

    return u.toString();
  } catch {
    return null;
  }
};

export const generateId = (title: string, url: string): string => {
  return crypto
    .createHash("md5")
    .update(title + url)
    .digest("hex");
};