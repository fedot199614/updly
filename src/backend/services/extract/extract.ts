// src/backend/services/extract/extract.ts

import { load } from "cheerio";
import { SiteType, Strategy, ExtractionResult } from "@/backend/services/extract/exctract.types.js";
import { stripNoise, extractMeta } from "@/backend/services/extract/helpers.js";
import { detectSiteType } from "@/backend/services/extract/detect.js";
import { extractEcommerce } from "@/backend/services/extract/strategies/ecommerce.js";
import { extractNews } from "@/backend/services/extract/strategies/news.js";
import { extractLanding } from "@/backend/services/extract/strategies/landing.js";
import { extractSocial } from "@/backend/services/extract/strategies/social.js";
import { extractDirectory } from "@/backend/services/extract/strategies/directory.js";
import { extractGeneric } from "@/backend/services/extract/strategies/generic.js";

const STRATEGY_MAP: Record<SiteType, Strategy> = {
  ecommerce: extractEcommerce,
  news: extractNews,
  landing: extractLanding,
  social: extractSocial,
  directory: extractDirectory,
  generic: extractGeneric,
};

export const extract = (
  html: string,
  baseUrl: string = "",
  forceType?: SiteType,
): ExtractionResult => {
  const $ = load(html);
  stripNoise($);

  const siteType = forceType || detectSiteType($);
  let units = STRATEGY_MAP[siteType]($, baseUrl);

  // Если типизированная стратегия нашла мало — fallback на generic
  if (units.length < 2 && siteType !== "generic") {
    const genericUnits = extractGeneric($, baseUrl);
    if (genericUnits.length > units.length) units = genericUnits;
  }

  const meta = extractMeta($);

  return { siteType, units, meta };
};