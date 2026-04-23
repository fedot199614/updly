// src/backend/services/extract/strategies/ecommerce.ts

import { type CheerioAPI } from "cheerio";
import { ContentUnit } from "@/backend/services/extract/exctract.types.js";
import {
  clean, selector, isNestedIn, makeUnit,
  extractPrice, extractOldPrice, firstImage, firstLink,
} from "@/backend/services/extract/helpers.js";

const PRODUCT_CONTAINERS = [
  "[class*='product']", "[data-product-id]", "[itemtype*='Product']",
  "[class*='card']:has([class*='price'])", "li:has([class*='price'])",
].join(",");

export const extractEcommerce = ($: CheerioAPI, baseUrl: string): ContentUnit[] => {
  const units: ContentUnit[] = [];
  const seen = new Set<string>();

  $(PRODUCT_CONTAINERS).each((_, el) => {
    const $el = $(el);
    const s = selector($, el);
    if (seen.has(s) || isNestedIn(seen, s)) return;
    seen.add(s);

    const title = clean($el.find(
      "h1,h2,h3,h4,h5,h6,[class*='title'],[class*='name'],[itemprop='name']"
    ).first().text()) || null;

    const price = extractPrice($, $el);
    const oldPrice = extractOldPrice($, $el);
    const rating = clean($el.find("[class*='rating'],[itemprop='ratingValue']").first().text()) || null;
    const image = firstImage($, $el, baseUrl);
    const link = firstLink($, $el, baseUrl);
    const availability = clean($el.find(
      "[class*='stock'],[class*='availability'],[itemprop='availability']"
    ).first().text()) || null;

    if (!title && !price) return;

    units.push(makeUnit(s, "product", { title, price, oldPrice, rating, image, link, availability }));
  });

  return units;
};