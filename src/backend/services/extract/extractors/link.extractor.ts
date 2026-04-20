import { load } from "cheerio";
import { isTrashUrl } from "@/backend/services/extract/extract.utils.js";
import { MAX_LINKS } from "@/backend/services/extract/extract.const.js";

export const extractLinks = (
  $: ReturnType<typeof load>,
  $el: ReturnType<ReturnType<typeof load>>,
  baseUrl: string
): string[] => {
  const links: string[] = [];

  $el.find("a[href]").each((_, a) => {
    const href = $(a).attr("href");
    if (!href) return;

    try {
      const url = new URL(href, baseUrl).href;
      if (!isTrashUrl(url)) links.push(url);
    } catch {}
  });

  return [...new Set(links)].slice(0, MAX_LINKS);
};