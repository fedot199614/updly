import { load, type CheerioAPI, type Cheerio } from "cheerio";
import crypto from "crypto";
import {NOISE_TAGS, WRAPPER_TAGS, CONTENT_TAGS, NOISE_CLASS_PATTERNS} from "@/backend/services/extract/extract.const.js";
import { PageNode, NodeRole, NODE_ROLE } from "@/backend/services/extract/exctract.types.js";

// ─── Main export ─────────────────────────────────────────────────────────────

export const extractPageNodes = (html: string, baseUrl: string): PageNode[] => {
  const $ = load(html);

  // 1. Вырезаем шум ДО обхода — так потомки шумных тегов тоже исчезают
  stripNoise($);

  // 2. Собираем ноды по каждой роли
  const nodes: PageNode[] = [];
  const seen = new Set<string>(); // по selector — не дублируем один элемент дважды

  extractHeadings($, nodes, seen);
  extractTexts($, nodes, seen);
  extractLinks($, baseUrl, nodes, seen);
  extractImages($, baseUrl, nodes, seen);
  extractDates($, nodes, seen);
  extractCtas($, nodes, seen);
  extractListItems($, nodes, seen);
  extractPrices($, nodes, seen);
  extractMeta($, nodes, seen);

  return nodes;
};

// ─── Noise removal ───────────────────────────────────────────────────────────

const stripNoise = ($: CheerioAPI) => {
  // Удаляем целые теги со всем содержимым
  $(NOISE_TAGS.join(", ")).remove();

  // Удаляем элементы со скрытым display или атрибутом hidden
  $("[hidden], [aria-hidden='true']").remove();
  $("[style*='display:none'], [style*='display: none']").remove();
  $("[style*='visibility:hidden'], [style*='visibility: hidden']").remove();

  // Удаляем элементы с шумовыми классами (реклама, трекинг, GDPR)
  $("[class]").each((_, el) => {
    const cls = $(el).attr("class")?.toLowerCase() ?? "";
    if (NOISE_CLASS_PATTERNS.some((p) => cls.includes(p))) {
      $(el).remove();
    }
  });
};

// ─── Extraction passes ──────────────────────────────────────────────────────

const extractHeadings = ($: CheerioAPI, nodes: PageNode[], seen: Set<string>) => {
  $("h1, h2, h3, h4, h5, h6").each((_, el) => {
    const text = cleanText($(el).text());
    if (text.length < 3) return;
    pushNode($, el, NODE_ROLE.HEADING, text, nodes, seen);
  });
};

const extractTexts = ($: CheerioAPI, nodes: PageNode[], seen: Set<string>) => {
  $("p, blockquote, figcaption, dd").each((_, el) => {
    const text = cleanText($(el).text());
    if (text.length < 20) return; // короткие параграфы — обычно мусор
    pushNode($, el, NODE_ROLE.TEXT, text, nodes, seen);
  });
};

const extractLinks = ($: CheerioAPI, baseUrl: string, nodes: PageNode[], seen: Set<string>) => {
  $("a[href]").each((_, el) => {
    const text = cleanText($(el).text());
    if (text.length < 3) return;

    const href = resolveUrl($(el).attr("href"), baseUrl);
    if (!href || isTrashHref(href)) return;

    // Если ссылка внутри уже извлечённого заголовка — пропускаем
    const selector = buildSelector($, el);
    if (seen.has(selector)) return;

    pushNode($, el, NODE_ROLE.LINK, text, nodes, seen, { href });
  });
};

const extractImages = ($: CheerioAPI, baseUrl: string, nodes: PageNode[], seen: Set<string>) => {
  $("img").each((_, el) => {
    const rawSrc = $(el).attr("src") || $(el).attr("data-src") || $(el).attr("data-lazy-src");
    if (!rawSrc) return;

    const src = resolveUrl(rawSrc, baseUrl);
    if (!src || src.startsWith("data:")) return;
    if (isNoiseImage(src)) return;

    const alt = $(el).attr("alt") || "";
    pushNode($, el, NODE_ROLE.IMAGE, alt, nodes, seen, { src });
  });
};

const extractDates = ($: CheerioAPI, nodes: PageNode[], seen: Set<string>) => {
  $("time").each((_, el) => {
    const datetime = $(el).attr("datetime") || "";
    const text = cleanText($(el).text()) || datetime;
    if (!text) return;
    pushNode($, el, NODE_ROLE.DATE, text, nodes, seen);
  });
};

const extractCtas = ($: CheerioAPI, nodes: PageNode[], seen: Set<string>) => {
  $("button, input[type='submit'], [role='button']").each((_, el) => {
    const text = cleanText(
      $(el).val()?.toString() || $(el).text()
    );
    if (text.length < 2) return;
    pushNode($, el, NODE_ROLE.CTA, text, nodes, seen);
  });
};

const extractListItems = ($: CheerioAPI, nodes: PageNode[], seen: Set<string>) => {
  $("li").each((_, el) => {
    const text = cleanText($(el).text());
    if (text.length < 10) return;
    // Пропускаем li внутри nav — это навигация, а не контент
    if ($(el).closest("nav").length > 0) return;
    pushNode($, el, NODE_ROLE.LIST_ITEM, text, nodes, seen);
  });
};

// Цена может быть в любом теге — ищем по паттерну в тексте.
// Проходим только "листовые" элементы (нет потомков с ценой),
// чтобы не дублировать цену из потомка и родителя.
const PRICE_PATTERN = /[\$€£₽¥₴]\s?\d[\d.,]*|\d[\d.,]*\s?[\$€£₽¥₴]/;

const extractPrices = ($: CheerioAPI, nodes: PageNode[], seen: Set<string>) => {
  $("*").each((_, el) => {
    const $el = $(el);
    const text = cleanText($el.text());

    // Только короткие фрагменты — длинный текст с $ внутри это не цена
    if (text.length > 60 || text.length < 2) return;
    if (!PRICE_PATTERN.test(text)) return;

    // Пропускаем, если есть потомок, который тоже матчит цену —
    // берём самый вложенный элемент
    const hasChildPrice = $el.find("*").toArray().some((child) => {
      const childText = cleanText($(child).text());
      return childText.length > 0 && PRICE_PATTERN.test(childText);
    });
    if (hasChildPrice) return;

    pushNode($, el, NODE_ROLE.PRICE, text, nodes, seen);
  });
};

const extractMeta = ($: CheerioAPI, nodes: PageNode[], seen: Set<string>) => {
  // <title>
  const title = cleanText($("title").text());
  if (title) {
    nodes.push({
      id: hash("meta:title:" + title),
      selector: "head > title",
      tag: "title",
      role: NODE_ROLE.META,
      text: title,
      hash: hash(title),
    });
  }

  // og:* и description
  $("meta[property^='og:'], meta[name='description']").each((_, el) => {
    const name = $(el).attr("property") || $(el).attr("name") || "";
    const content = $(el).attr("content") || "";
    if (!content) return;

    const selector = `meta[${$(el).attr("property") ? "property" : "name"}='${name}']`;
    nodes.push({
      id: hash("meta:" + name + ":" + content),
      selector,
      tag: "meta",
      role: NODE_ROLE.META,
      text: content,
      hash: hash(content),
    });
  });
};

// ─── Node builder ────────────────────────────────────────────────────────────

const pushNode = (
  $: CheerioAPI,
  el: any,
  role: NodeRole,
  text: string,
  nodes: PageNode[],
  seen: Set<string>,
  extra?: { href?: string; src?: string }
) => {
  const selector = buildSelector($, el);
  if (seen.has(selector)) return;
  seen.add(selector);

  const contentForHash = [text, extra?.href, extra?.src].filter(Boolean).join("|");

  nodes.push({
    id: hash(selector + ":" + contentForHash),
    selector,
    tag: ($(el).prop("tagName") || "").toLowerCase(),
    role,
    text,
    ...(extra?.href && { href: extra.href }),
    ...(extra?.src && { src: extra.src }),
    hash: hash(contentForHash),
  });
};

// ─── Selector builder ─────────────────────────────────────────────────────────

// Строит стабильный CSS-путь.
// Пропускает div/span — так мелкие изменения вёрстки не ломают селектор.
// Использует nth-of-type, а не nth-child — устойчивее к вставке новых элементов.

const buildSelector = ($: CheerioAPI, el: any): string => {
  const parts: string[] = [];
  let current = $(el);

  while (current.length > 0) {
    const tag = (current.prop("tagName") || "").toLowerCase();
    if (!tag || tag === "html" || tag === "[document]") break;

    // Пропускаем div/span — они обёрточные и часто меняются
    if (tag !== "div" && tag !== "span") {
      // Если есть стабильный id (не автосгенерированный), используем его
      const id = current.attr("id");
      if (id && isStableId(id)) {
        parts.unshift(`#${id}`);
        break; // id уникален — дальше подниматься не надо
      }

      // Позиция среди одноимённых сиблингов
      const index = current.prevAll(tag).length + 1;
      parts.unshift(index > 1 ? `${tag}:nth-of-type(${index})` : tag);
    }

    current = current.parent();
  }

  return parts.join(" > ") || "body";
};

// Автосгенерированные id (react, vue, angular) — не стабильны
const isStableId = (id: string): boolean => {
  if (id.length > 40) return false;           // хеши
  if (/^[a-f0-9]{8,}$/i.test(id)) return false;  // hex-хеши
  if (/^[:_]/.test(id)) return false;           // vue :id
  if (/\d{5,}/.test(id)) return false;          // длинные числа
  if (id.includes("__")) return false;          // BEM-автогенерация
  return true;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const cleanText = (text: string): string =>
  text.replace(/\s+/g, " ").trim();

const hash = (input: string): string =>
  crypto.createHash("md5").update(input).digest("hex");

const resolveUrl = (href: string | undefined, base: string): string | null => {
  if (!href) return null;
  try { return new URL(href, base).href; }
  catch { return null; }
};

const isTrashHref = (url: string): boolean =>
  url.startsWith("javascript:") ||
  url.startsWith("mailto:") ||
  url.startsWith("tel:") ||
  url.includes("#");

const NOISE_IMAGE_PATTERNS = ["logo", "icon", "sprite", "avatar", "placeholder", "pixel", "spacer", "blank"];
const isNoiseImage = (url: string): boolean => {
  const lower = url.toLowerCase();
  return NOISE_IMAGE_PATTERNS.some((p) => lower.includes(p));
};