// src/backend/services/extract/strategies/directory.ts

import { type CheerioAPI } from "cheerio";
import { ContentUnit } from "@/backend/services/extract/exctract.types.js";
import { clean, selector, isNestedIn, makeUnit, firstImage, firstLink } from "@/backend/services/extract/helpers.js";

const LISTING_CONTAINERS = [
  "[class*='listing']", "[class*='result']",
  "[class*='card']:has(address)", "[class*='card']:has([class*='phone'])",
  "[class*='item']:has(address)", "[itemtype*='LocalBusiness']",
].join(",");

export const extractDirectory = ($: CheerioAPI, baseUrl: string): ContentUnit[] => {
  const units: ContentUnit[] = [];
  const seen = new Set<string>();

  $(LISTING_CONTAINERS).each((_, el) => {
    const $el = $(el);
    const s = selector($, el);
    if (seen.has(s) || isNestedIn(seen, s)) return;
    seen.add(s);

    const name = clean($el.find("h1,h2,h3,h4,[class*='name'],[itemprop='name']").first().text()) || null;
    const address = clean($el.find("address,[itemprop='address'],[class*='address']").first().text()) || null;
    const phone = clean($el.find("[itemprop='telephone'],[class*='phone'],a[href^='tel:']").first().text()) || null;
    const rating = clean($el.find("[class*='rating'],[itemprop='ratingValue']").first().text()) || null;
    const link = firstLink($, $el, baseUrl);
    const image = firstImage($, $el, baseUrl);

    if (!name) return;

    units.push(makeUnit(s, "listing", { name, address, phone, rating, link, image }));
  });

  return units;
};