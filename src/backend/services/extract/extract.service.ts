import { load } from "cheerio";
import { extractLinks } from "@/backend/services/extract/extractors/link.extractor.js";
import { extractImages } from "@/backend/services/extract/extractors/image.extractor.js";
import { findContainer } from "@/backend/services/extract/extractors/container.extractor.js";
import { extractDescription } from "@/backend/services/extract/extractors/description.extractor.js";

export const extractItems = (html: string, baseUrl: string) => {
  const $ = load(html);

  const items: any[] = [];
  const seen = new Set<string>();

  const links = extractLinks($, baseUrl);

  for (const link of links) {
    if (seen.has(link.url)) continue;
    seen.add(link.url);

    const container = findContainer(link.$el);

    const images = extractImages($, link.$el, container, baseUrl);
    const description = extractDescription(container);

    items.push({
      id: link.url,
      title: link.title,
      url: link.url,
      images,
      description,
    });
  }

  return items;
};