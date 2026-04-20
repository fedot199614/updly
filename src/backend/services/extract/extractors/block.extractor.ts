import { load } from "cheerio";
import crypto from "crypto";

type Block = {
  id: string;
  text: string;
  images: string[];
  links: string[];
};

export const extractBlocks = (html: string, baseUrl: string): Block[] => {
  const $ = load(html);

  const blocks: Block[] = [];
  const seen = new Set<string>();

  const candidates = $(
    "article, section, main > div, li, [class*='card'], [class*='item'], [class*='post']"
  );

  candidates.each((_, el) => {
    const $el = $(el);

    if (isNested($el)) return;

    const score = scoreBlock($el);
    if (score < 3) return;

    const text = cleanText($el.text());
    if (text.length < 50) return;

    const images = extractImages($, $el, baseUrl);
    const links = extractLinks($, $el, baseUrl);

    const id = generateId(text);

    if (seen.has(id)) return;
    seen.add(id);

    blocks.push({
      id,
      text,
      images,
      links,
    });
  });

  return blocks;
};

//
// helpers
//

const scoreBlock = ($el: any) => {
  let score = 0;

  const textLength = $el.text().length;
  const images = $el.find("img").length;
  const links = $el.find("a").length;

  if (textLength > 100) score += 2;
  if (textLength > 300) score += 2;

  if (images > 0) score += 2;
  if (links > 0) score += 1;

  if ($el.find("h1, h2, h3").length > 0) score += 3;

  return score;
};

const isNested = ($el: any) => {
  return $el.parents(
    "article, section, [class*='card'], [class*='item']"
  ).length > 1;
};

const extractImages = ($: any, $el: any, baseUrl: string): string[] => {
  const images: string[] = [];

  $el.find("img").each((_: any, img: any) => {
    const src =
      $(img).attr("src") ||
      $(img).attr("data-src") ||
      $(img).attr("srcset");

    if (!src) return;

    const parsed = parseSrcset(src);

    try {
      const url = new URL(parsed, baseUrl).href;

      if (isValidImage(url)) {
        images.push(url);
      }
    } catch {}
  });

  return unique(images).slice(0, 3);
};

const extractLinks = ($: any, $el: any, baseUrl: string): string[] => {
  const links: string[] = [];

  $el.find("a").each((_: any, a: any) => {
    const href = $(a).attr("href");
    if (!href) return;

    try {
      const url = new URL(href, baseUrl).href;

      if (!isTrashUrl(url)) {
        links.push(url);
      }
    } catch {}
  });

  return unique(links).slice(0, 5);
};

const cleanText = (text: string) =>
  text.replace(/\s+/g, " ").trim();

const generateId = (text: string) =>
  crypto.createHash("md5").update(text).digest("hex");

const parseSrcset = (value: string) => {
  if (!value.includes(",")) return value;
  const parts = value.split(",");
  return parts[parts.length - 1].split(" ")[0];
};

const isValidImage = (url: string) => {
  return (
    !url.includes("logo") &&
    !url.includes("icon") &&
    !url.includes("avatar") &&
    !url.startsWith("data:")
  );
};

const isTrashUrl = (url: string) => {
  return (
    url.startsWith("javascript:") ||
    url.startsWith("mailto:") ||
    url.includes("#")
  );
};

const unique = (arr: string[]) => [...new Set(arr)];