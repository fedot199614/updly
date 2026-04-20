import { normalizeText, normalizeUrl, generateId } from "@/backend/services/normalize/normalize.utils.js";


export const normalizeItems = (items: any[]) => {
  return items
    .map(item => {
      const title = normalizeText(item.title);
      const description = normalizeText(item.description);
      const url = normalizeUrl(item.url) ? normalizeUrl(item.url) : item.url;

      const images = (item.images || [])
        .map(normalizeUrl)
        .filter(Boolean)
        .slice(0, 3);

      const id = generateId(title, url);

      return {
        id,
        title,
        description,
        url,
        images,
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
};