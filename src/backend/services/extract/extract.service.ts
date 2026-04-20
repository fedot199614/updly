import { load } from "cheerio";
import { extractImages } from "@/backend/services/extract/extractors/image.extractor.js";
import { cleanText, isTrashUrl } from "@/backend/services/extract/extract.utils.js";
import { CANDIDATE_SELECTOR, MIN_SCORE, MIN_TEXT_LENGTH } from "@/backend/services/extract/extract.const.js";
import { isDeepNested, generateId, scoreBlock } from "@/backend/services/extract/extract.utils.js";
import { extractLinks } from "@/backend/services/extract/extractors/link.extractor.js";


export type Block = {
  id: string;
  text: string;
  images: string[];
  links: string[];
};

export const extractItems = (html: string, baseUrl: string) => {
  const $ = load(html);
    const blocks: Block[] = [];
    const seenIds = new Set<string>();
  
    $(CANDIDATE_SELECTOR).each((_, el) => {
      const $el = $(el);
  
      if (isDeepNested($el)) return;
  
      const score = scoreBlock($el);
      if (score < MIN_SCORE) return;
  
      const text = cleanText($el.text());
      if (text.length < MIN_TEXT_LENGTH) return;
  
      const id = generateId(text);
      if (seenIds.has(id)) return;
      seenIds.add(id);
  
      blocks.push({
        id,
        text,
        images: extractImages($, $el, $el, baseUrl),
        links: extractLinks($, $el, baseUrl),
      });
    });
  
    return blocks;
};