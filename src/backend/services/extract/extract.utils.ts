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