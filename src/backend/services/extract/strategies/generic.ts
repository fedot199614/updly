// src/backend/services/extract/strategies/generic.ts

import { type CheerioAPI } from "cheerio";
import { ContentUnit } from "@/backend/services/extract/exctract.types.js";
import {
  clean, selector, isNestedIn, makeUnit, resolve,
  firstParagraph, firstImage, firstLink, extractPrice,
} from "@/backend/services/extract/helpers.js";

const GENERIC_CONTAINERS = [
  "article", "section", "main > div",
  "[class*='card']", "[class*='item']",
  "[class*='post']", "[class*='entry']",
].join(",");

export const extractGeneric = ($: CheerioAPI, baseUrl: string): ContentUnit[] => {
  const units: ContentUnit[] = [];
  const seen = new Set<string>();

  // Container-based extraction
  $(GENERIC_CONTAINERS).each((_, el) => {
    const $el = $(el);
    const s = selector($, el);
    if (seen.has(s) || isNestedIn(seen, s)) return;

    const title = clean($el.find("h1,h2,h3,h4,h5,h6").first().text()) || null;
    const description = firstParagraph($, $el);
    const link = firstLink($, $el, baseUrl);
    const image = firstImage($, $el, baseUrl);
    const date = clean($el.find("time,[class*='date']").first().text()) || null;
    const price = extractPrice($, $el);

    const textLen = (title?.length || 0) + (description?.length || 0);
    if (textLen < 20) return;

    seen.add(s);
    units.push(makeUnit(s, "block", { title, description, date, link, image, price }));
  });

  // Heading-anchor fallback: если контейнеров нет
  if (units.length === 0) {
    $("h1,h2,h3").each((_, el) => {
      const $h = $(el);
      const title = clean($h.text());
      if (title.length < 5) return;

      let description: string | null = null;
      let link: string | null = null;
      let $next = $h.next();

      while ($next.length > 0 && !/^h[1-3]$/i.test($next.prop("tagName") || "")) {
        if (!description) {
          const t = clean($next.text());
          if (t.length > 15) description = t;
        }
        if (!link) {
          const href = $next.find("a[href]").first().attr("href");
          if (href) link = resolve(href, baseUrl);
        }
        $next = $next.next();
      }

      units.push(makeUnit(selector($, el), "block", { title, description, link }));
    });
  }

  return units;
};