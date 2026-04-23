// src/backend/services/extract/detect.ts

import { type CheerioAPI } from "cheerio";
import { SiteType } from "@/backend/services/extract/exctract.types.js";

export const detectSiteType = ($: CheerioAPI): SiteType => {
  const html = $.html() || "";
  const scores: Record<SiteType, number> = {
    ecommerce: 0, news: 0, landing: 0, social: 0, directory: 0, generic: 0,
  };

  // ─── E-commerce ────────────────────────────────────────────────────
  const priceCount = (html.match(/[\$€£₽¥₴]\s?\d/g) || []).length;
  if (priceCount >= 3) scores.ecommerce += 4;
  else if (priceCount >= 1) scores.ecommerce += 2;

  if ($("[class*='cart'],[class*='basket'],[data-product]").length > 0) scores.ecommerce += 3;
  if ($("button,[role='button']").toArray().some((el) =>
    /add to cart|buy|купить|в корзин/i.test($(el).text())
  )) scores.ecommerce += 3;
  if ($("[itemprop='price'],[itemprop='offers'],[class*='product']").length > 0) scores.ecommerce += 3;
  if ($("[class*='rating'],[class*='stars']").length >= 2) scores.ecommerce += 2;

  // ─── News ──────────────────────────────────────────────────────────
  const articleCount = $("article").length;
  if (articleCount >= 3) scores.news += 4;
  else if (articleCount >= 1) scores.news += 2;

  if ($("time[datetime]").length >= 2) scores.news += 3;
  if ($("[class*='author'],[class*='byline'],[rel='author']").length > 0) scores.news += 2;
  if ($("[class*='news'],[class*='post'],[class*='story'],[class*='entry']").length >= 2) scores.news += 2;
  if ($("[itemprop='headline'],[itemprop='datePublished']").length > 0) scores.news += 3;

  // ─── Landing ───────────────────────────────────────────────────────
  const sections = $("section,[class*='section']").length;
  if (sections >= 3 && articleCount < 2) scores.landing += 3;

  if ($("[class*='hero'],[class*='banner'],[class*='jumbotron']").length > 0) scores.landing += 3;
  if ($("[class*='pricing'],[class*='plan'],[class*='tier']").length > 0) scores.landing += 4;
  if ($("[class*='feature'],[class*='benefit']").length >= 3) scores.landing += 2;
  if ($("[class*='cta'],[class*='signup']").length > 0) scores.landing += 2;
  if (sections > 3 && articleCount === 0 && priceCount < 3) scores.landing += 2;

  // ─── Social ────────────────────────────────────────────────────────
  const socialContainers = $(
    "[class*='tweet'],[class*='post'],[class*='feed-item']," +
    "[class*='status'],[class*='timeline-item'],[class*='update']," +
    "[data-testid*='tweet'],[data-testid*='post']," +
    "[class*='activity'],[class*='stream-item']"
  ).length;
  if (socialContainers >= 3) scores.social += 4;
  else if (socialContainers >= 1) scores.social += 2;

  const engagementEls = $(
    "[class*='like'],[class*='reaction'],[class*='share']," +
    "[class*='retweet'],[class*='comment-count'],[class*='reply']," +
    "[class*='views'],[class*='impression'],[class*='engagement']," +
    "[class*='upvote'],[class*='karma'],[class*='vote']"
  ).length;
  if (engagementEls >= 4) scores.social += 3;
  else if (engagementEls >= 2) scores.social += 2;

  if ($("[class*='avatar'],[class*='profile-pic'],[class*='user-image']").length >= 2) scores.social += 2;
  if (/@[\w]+/.test(html)) scores.social += 2;
  if ($("a[href*='hashtag'],a[href*='/tag/']").length >= 2) scores.social += 1;
  if (/#[\wа-яА-Я]+/.test($.text())) scores.social += 1;
  if ($("meta[property='og:site_name']").toArray().some((el) =>
    /twitter|x\.com|facebook|instagram|linkedin|reddit|tiktok|vk|telegram/i.test($(el).attr("content") || "")
  )) scores.social += 3;

  // ─── Directory ─────────────────────────────────────────────────────
  if ($("[class*='listing'],[class*='directory'],[class*='catalog']").length >= 2) scores.directory += 4;
  if ($("address,[itemprop='address'],[class*='address']").length >= 2) scores.directory += 3;
  if ($("[itemprop='telephone'],[class*='phone'],a[href^='tel:']").length >= 2) scores.directory += 3;

  // ─── Winner ────────────────────────────────────────────────────────
  let best: SiteType = "generic";
  let bestScore = 3; // минимальный порог
  for (const [type, score] of Object.entries(scores)) {
    if (score > bestScore) { bestScore = score; best = type as SiteType; }
  }

  return best;
};