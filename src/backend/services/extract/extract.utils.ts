import { load } from "cheerio";
import crypto from "crypto";
import { NESTING_SELECTOR } from "@/backend/services/extract/extract.const.js";

export const cleanText = (text: string): string => {
  if (!text) return "";

  return text
    .replace(/\s+/g, " ")
    .replace(/\n/g, " ")
    .trim();
};

export const isTrashUrl = (url: string): boolean => {
  if (!url) return true;

  return (
    url.startsWith("javascript:") ||
    url.startsWith("mailto:") ||
    url.includes("#") ||
    url.includes("tel:")
  );
};

export const isValidImage = (url: string): boolean => {
  if (!url) return false;

  return (
    !url.includes("logo") &&
    !url.includes("icon") &&
    !url.includes("sprite") &&
    !url.startsWith("data:") &&
    !url.includes("avatar") &&
    !url.includes("placeholder")
  );
};

export const isDeepNested = ($el: ReturnType<ReturnType<typeof load>>): boolean => $el.parents(NESTING_SELECTOR).length > 1;
export const generateId = (text: string): string => crypto.createHash("md5").update(text).digest("hex");

export const scoreBlock = ($el: ReturnType<ReturnType<typeof load>>): number => {
  let score = 0;

  const textLength = $el.text().length;
  if (textLength > 100) score += 2;
  if (textLength > 300) score += 2;

  if ($el.find("img").length > 0) score += 2;
  if ($el.find("a").length > 0) score += 1;
  if ($el.find("h1, h2, h3, h4").length > 0) score += 3;

  if (/\$|€|£|price|Price/.test($el.html() ?? "")) score += 2;

  return score;
};