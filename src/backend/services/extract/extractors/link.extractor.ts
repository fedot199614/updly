import { cleanText, isTrashUrl } from "@/backend/services/extract/extract.utils.js";

export const extractLinks = ($: any, baseUrl: string) => {
  const links: any[] = [];

  $("a").each((_: any, el: Element) => {
    const $el = $(el);

    const href = $el.attr("href");
    const title = cleanText($el.text());

    if (!href || title.length < 30) return;

    try {
      const url = new URL(href, baseUrl).href;

      if (isTrashUrl(url)) return;

      links.push({
        $el,
        url,
        title,
      });
    } catch {}
  });

  return links;
};