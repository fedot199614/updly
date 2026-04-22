import { normalizeText, normalizeUrl } from "@/backend/services/normalize/normalize.utils.js";
import { Block } from "@/backend/services/extract/extract.service.js";

export const normalizeBlocks = (blocks: Block[]): Block[] => {
  return blocks
    .map((block) => {
      const text = normalizeText(block.text);
      const images = block.images
        .map(normalizeUrl)
        .filter((url): url is string => url !== null);

      const links = block.links
        .map(normalizeUrl)
        .filter((url): url is string => url !== null);

      return {
        id: block.id,
        text,
        images,
        links,
      };
    })
    .filter((block) => block.text.length > 0)
    .sort((a, b) => a.id.localeCompare(b.id));
};