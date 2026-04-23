// src/backend/services/extract/strategies/landing.ts

import { type CheerioAPI } from "cheerio";
import { ContentUnit } from "@/backend/services/extract/exctract.types.js";
import { clean, selector, makeUnit, extractPrice, firstParagraph, firstLink } from "@/backend/services/extract/helpers.js";

export const extractLanding = ($: CheerioAPI, baseUrl: string): ContentUnit[] => {
  const units: ContentUnit[] = [];

  // 1. Hero section
  const $hero = $("[class*='hero'],[class*='banner'],[class*='jumbotron']").first();
  if ($hero.length) {
    const title = clean($hero.find("h1,h2").first().text()) || null;
    const subtitle = firstParagraph($, $hero);
    const cta = clean($hero.find("a,button").first().text()) || null;
    const ctaLink = firstLink($, $hero, baseUrl);
    if (title) units.push(makeUnit(selector($, $hero.get(0)!), "hero", { title, subtitle, cta, ctaLink }));
  }

  // 2. Pricing tiers
  $("[class*='pricing'] [class*='plan'],[class*='pricing'] [class*='tier'],[class*='pricing'] [class*='card']")
    .each((_, el) => {
      const $el = $(el);
      const name = clean($el.find("h2,h3,h4,[class*='name'],[class*='title']").first().text()) || null;
      const price = extractPrice($, $el);
      const period = clean($el.find("[class*='period'],[class*='billing']").first().text()) || null;
      const cta = clean($el.find("a,button").first().text()) || null;
      const features = $el.find("li,[class*='feature']").toArray()
        .map((li) => clean($(li).text())).filter((t) => t.length > 2).join(" | ") || null;

      if (!name && !price) return;
      units.push(makeUnit(selector($, el), "pricing", { name, price, period, features, cta }));
    });

  // 3. Content sections
  $("section,[class*='section']").each((_, el) => {
    const $el = $(el);
    if ($el.is("[class*='hero'],[class*='pricing'],[class*='banner']")) return;
    if ($el.closest("[class*='hero'],[class*='pricing']").length > 0) return;

    const title = clean($el.find("h2,h3").first().text()) || null;
    const description = firstParagraph($, $el);
    const cta = clean($el.find("a.btn,a[class*='button'],button").first().text()) || null;
    const ctaLink = firstLink($, $el, baseUrl);

    if (!title || title.length < 5) return;
    units.push(makeUnit(selector($, el), "section", { title, description, cta, ctaLink }));
  });

  return units;
};