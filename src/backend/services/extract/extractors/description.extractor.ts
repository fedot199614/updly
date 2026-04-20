import { cleanText } from "@/backend/services/extract/extract.utils.js";

export const extractDescription = (container: any): string => {
  const text = container.find("p").text();
  return cleanText(text).slice(0, 300);
};