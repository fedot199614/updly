// src/backend/services/extract/helpers.ts

import { type CheerioAPI } from "cheerio";
import crypto from "crypto";
import { ContentUnit } from "@/backend/services/extract/exctract.types.js";

// ─── Text ────────────────────────────────────────────────────────────────────

export const clean = (text: string): string =>
  text.replace(/\s+/g, " ").trim();

export const md5 = (input: string): string =>
  crypto.createHash("md5").update(input).digest("hex");

export const trunc = (s: string, max: number): string =>
  s.length > max ? s.slice(0, max) + "..." : s;

// ─── URL ─────────────────────────────────────────────────────────────────────

export const resolve = (href: string | undefined, base: string): string | null => {
  if (!href) return null;
  try { return new URL(href, base).href; }
  catch { return href; }
};

// ─── Noise removal ───────────────────────────────────────────────────────────

export const stripNoise = ($: CheerioAPI): void => {
  $("script,style,noscript,template,iframe,svg,[hidden],[aria-hidden='true']").remove();
  $("[style*='display:none'],[style*='display: none']").remove();
};

// ─── Selector builder ────────────────────────────────────────────────────────
// Пропускает div/span для стабильности. Использует nth-of-type.
// Останавливается на стабильном id.

export const selector = ($: CheerioAPI, el: any): string => {
  const parts: string[] = [];
  let cur = $(el);

  while (cur.length) {
    const tag = (cur.prop("tagName") || "").toLowerCase();
    if (!tag || tag === "html" || tag === "[document]") break;

    if (tag !== "div" && tag !== "span") {
      const id = cur.attr("id");
      if (id && id.length < 30 && !/[0-9a-f]{8,}/i.test(id) && !id.includes("__")) {
        parts.unshift(`#${id}`);
        break;
      }
      const idx = cur.prevAll(tag).length + 1;
      parts.unshift(idx > 1 ? `${tag}:nth-of-type(${idx})` : tag);
    }
    cur = cur.parent();
  }

  return parts.join(" > ") || "body";
};

// ─── Nesting check ───────────────────────────────────────────────────────────

export const isNestedIn = (seen: Set<string>, s: string): boolean => {
  for (const parent of seen) {
    if (s.startsWith(parent + " > ")) return true;
  }
  return false;
};

// ─── Unit builder ────────────────────────────────────────────────────────────

export const makeUnit = (
  sel: string,
  category: string,
  fields: Record<string, string | null>,
): ContentUnit => {
  const idSource = (fields.title || fields.name || fields.content || fields.author || "")
    + "|" + (fields.link || fields.ctaLink || sel);
  const hashSource = Object.values(fields).join("|");

  return {
    id: md5(idSource),
    selector: sel,
    category,
    fields,
    hash: md5(hashSource),
  };
};

// ─── Price extraction ────────────────────────────────────────────────────────

export const PRICE_RE = /[\$€£₽¥₴]\s?\d[\d.,]*|\d[\d.,]*\s?[\$€£₽¥₴]/;

export const extractPrice = ($: CheerioAPI, $el: ReturnType<CheerioAPI>): string | null => {
  const itemprop = $el.find("[itemprop='price']").first().text();
  if (itemprop && PRICE_RE.test(itemprop)) return clean(itemprop);

  const priceEl = $el.find("[class*='price']:not([class*='old']):not([class*='was'])").first().text();
  if (priceEl && PRICE_RE.test(priceEl)) return clean(priceEl);

  let found: string | null = null;
  $el.find("*").each((_, c) => {
    if (found) return;
    const t = clean($(c).text());
    if (t.length < 20 && PRICE_RE.test(t)) found = t;
  });
  return found;
};

export const extractOldPrice = ($: CheerioAPI, $el: ReturnType<CheerioAPI>): string | null => {
  const old = $el.find("[class*='old-price'],[class*='was-price'],[class*='original'],s,del").first().text();
  return old && PRICE_RE.test(old) ? clean(old) : null;
};

// ─── Content extraction ──────────────────────────────────────────────────────

export const firstParagraph = ($: CheerioAPI, $el: ReturnType<CheerioAPI>): string | null => {
  let result: string | null = null;
  $el.find("p").each((_, p) => {
    if (result) return;
    const t = clean($(p).text());
    if (t.length > 20) result = t;
  });
  return result;
};

const NOISE_IMG = ["logo", "icon", "sprite", "avatar", "placeholder", "pixel", "spacer"];

export const firstImage = ($: CheerioAPI, $el: ReturnType<CheerioAPI>, base: string): string | null => {
  let result: string | null = null;
  $el.find("img").each((_, img) => {
    if (result) return;
    const src = $(img).attr("src") || $(img).attr("data-src") || "";
    if (src && !src.startsWith("data:") && !NOISE_IMG.some((p) => src.toLowerCase().includes(p))) {
      result = resolve(src, base);
    }
  });
  return result;
};

export const firstLink = ($: CheerioAPI, $el: ReturnType<CheerioAPI>, base: string): string | null => {
  const href = $el.is("a") ? $el.attr("href") : $el.find("a[href]").first().attr("href");
  if (href && !href.startsWith("#") && !href.startsWith("javascript:") && !href.startsWith("mailto:")) {
    return resolve(href, base);
  }
  return null;
};

// ─── Meta extraction ─────────────────────────────────────────────────────────

export const extractMeta = ($: CheerioAPI): Record<string, string | null> => ({
  title: clean($("title").text()) || null,
  description: $("meta[name='description']").attr("content") || null,
  "og:title": $("meta[property='og:title']").attr("content") || null,
  "og:description": $("meta[property='og:description']").attr("content") || null,
  "og:image": $("meta[property='og:image']").attr("content") || null,
});