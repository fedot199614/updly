// src/backend/services/extract/strategies/news.ts

import { type CheerioAPI } from "cheerio";
import { ContentUnit } from "@/backend/services/extract/exctract.types.js";
import { clean, selector, isNestedIn, makeUnit, firstParagraph, firstImage, firstLink } from "@/backend/services/extract/helpers.js";

const ARTICLE_CONTAINERS = [
  "article", "[class*='post']", "[class*='story']", "[class*='entry']",
  "[class*='news-item']", "[class*='card']:has(time)", "[class*='card']:has(h2)",
  "[class*='card']:has(h3)", "[itemtype*='Article']", "[itemtype*='BlogPosting']",
].join(",");

export const extractNews = ($: CheerioAPI, baseUrl: string): ContentUnit[] => {
  const units: ContentUnit[] = [];
  const seen = new Set<string>();

  $(ARTICLE_CONTAINERS).each((_, el) => {
    const $el = $(el);
    const s = selector($, el);

    // if (seen.has(s) || isNestedIn(seen, s)) return;
    // seen.add(s);

    const title = clean($el.find("h1,h2,h3,h4,[class*='title'],[itemprop='headline']").first().text()) || null;
    const description = firstParagraph($, $el);
    const date = $el.find("time").first().attr("datetime")
      || clean($el.find("time,[class*='date'],[itemprop='datePublished']").first().text()) || null;
    const author = clean($el.find("[class*='author'],[rel='author'],[itemprop='author']").first().text()) || null;
    const image = firstImage($, $el, baseUrl);
    const link = firstLink($, $el, baseUrl);
    const tag = clean($el.find("[class*='tag'],[class*='category'],[class*='label']").first().text()) || null;

    if (!title) return;

    units.push(makeUnit(s, "article", { title, description, date, author, image, link, tag }));
  });

  return units;
};