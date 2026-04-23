// src/backend/services/extract/strategies/social.ts

import { type CheerioAPI } from "cheerio";
import { ContentUnit } from "@/backend/services/extract/exctract.types.js";
import { clean, selector, isNestedIn, makeUnit, firstImage, firstLink, firstParagraph, resolve } from "@/backend/services/extract/helpers.js";

const SOCIAL_CONTAINERS = [
  "[data-testid*='tweet']", "[data-testid*='post']",
  "[class*='tweet']", "[class*='feed-item']",
  "[class*='timeline-item']", "[class*='stream-item']",
  "[class*='status-update']", "[class*='activity-item']",
  "[class*='wall-post']",
  "[class*='post']:has([class*='author'],[class*='avatar'],[class*='user'])",
  "[class*='update']:has([class*='author'],[class*='avatar'])",
  "article:has([class*='like'],[class*='share'],[class*='comment'])",
].join(",");

export const extractSocial = ($: CheerioAPI, baseUrl: string): ContentUnit[] => {
  const units: ContentUnit[] = [];
  const seen = new Set<string>();

  $(SOCIAL_CONTAINERS).each((_, el) => {
    const $el = $(el);
    const s = selector($, el);
    if (seen.has(s) || isNestedIn(seen, s)) return;
    seen.add(s);

    const author = clean($el.find(
      "[class*='author'],[class*='display-name'],[class*='user-name']," +
      "[class*='fullname'],[class*='profile-name'],[itemprop='author']"
    ).first().text()) || null;

    const handle = extractHandle($, $el);
    const content = extractPostContent($, $el);
    const date = $el.find("time").first().attr("datetime")
      || clean($el.find("time,[class*='date'],[class*='timestamp']").first().text()) || null;

    const likes = extractMetric($, $el, ["like", "reaction", "upvote", "heart", "favorite"]);
    const shares = extractMetric($, $el, ["share", "retweet", "repost", "reblog", "forward"]);
    const comments = extractMetric($, $el, ["comment", "reply", "response"]);
    const views = extractMetric($, $el, ["view", "impression", "read"]);

    const image = firstImage($, $el, baseUrl);
    const link = firstLink($, $el, baseUrl);
    const hashtags = extractHashtags($, $el);

    if (!content && !image) return;

    units.push(makeUnit(s, "post", {
      author, handle, content, date, likes, shares, comments, views, image, link, hashtags,
    }));
  });

  return units;
};

// ─── Social-specific helpers ─────────────────────────────────────────────────

const extractHandle = ($: CheerioAPI, $el: ReturnType<CheerioAPI>): string | null => {
  const handleEl = $el.find("[class*='handle'],[class*='screen-name'],[class*='username']").first().text();
  if (handleEl && handleEl.includes("@")) return clean(handleEl);

  let found: string | null = null;
  $el.find("a[href]").each((_, a) => {
    if (found) return;
    const href = $(a).attr("href") || "";
    const match = href.match(/(?:twitter\.com|x\.com|instagram\.com|linkedin\.com\/in)\/([\w.-]+)/);
    if (match) found = `@${match[1]}`;
  });
  if (found) return found;

  const atMatch = $el.text().match(/@[\w.-]{2,30}/);
  return atMatch ? atMatch[0] : null;
};

const extractPostContent = ($: CheerioAPI, $el: ReturnType<CheerioAPI>): string | null => {
  const contentEl = $el.find(
    "[class*='post-text'],[class*='tweet-text'],[class*='post-content']," +
    "[class*='status-text'],[class*='post-body'],[class*='entry-content']," +
    "[class*='message-text'],[class*='content-text'],[data-testid*='text']"
  ).first();

  if (contentEl.length) {
    const t = clean(contentEl.text());
    if (t.length > 5) return t;
  }

  const p = firstParagraph($, $el);
  if (p) return p;

  let longest: string | null = null;
  $el.children().each((_, child) => {
    const t = clean($(child).text());
    if (t.length > (longest?.length || 20)) {
      const cls = $(child).attr("class") || "";
      if (/author|avatar|like|share|comment|reaction|metric|action|button/i.test(cls)) return;
      longest = t;
    }
  });

  return longest;
};

const extractMetric = (
  $: CheerioAPI, $el: ReturnType<CheerioAPI>, keywords: string[],
): string | null => {
  const classSelector = keywords.map((k) => `[class*='${k}']`).join(",");
  const metricEl = $el.find(classSelector).first();
  if (!metricEl.length) return null;

  const text = clean(metricEl.text());
  if (!text) return null;

  const numMatch = text.match(/[\d.,]+[KkMm]?/);
  return numMatch ? numMatch[0] : text.length < 20 ? text : null;
};

const extractHashtags = ($: CheerioAPI, $el: ReturnType<CheerioAPI>): string | null => {
  const tags: string[] = [];

  $el.find("a[href*='hashtag'],a[href*='/tag/'],a[href*='query=']").each((_, a) => {
    const t = clean($(a).text());
    if (t.startsWith("#") && t.length > 2) tags.push(t);
  });

  if (tags.length === 0) {
    const matches = $el.text().match(/#[\wа-яА-ЯёЁ]{2,30}/g);
    if (matches) tags.push(...matches);
  }

  return tags.length > 0 ? [...new Set(tags)].join(" ") : null;
};