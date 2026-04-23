export const NODE_ROLE = {
  HEADING: "heading",       // h1-h6
  TEXT: "text",             // p, blockquote, figcaption, dd
  LINK: "link",             // a[href] с текстом
  IMAGE: "image",           // img, picture > source
  PRICE: "price",           // элементы с ценой ($, €, £, ₽)
  DATE: "date",             // time[datetime], элементы с датой
  CTA: "cta",               // button, input[submit], a.btn
  LIST_ITEM: "list_item",   // li с контентом
  META: "meta",             // title, meta description, og:tags
} as const;

export type NodeRole = (typeof NODE_ROLE)[keyof typeof NODE_ROLE];

export type PageNode = {
  id: string;            // md5(selector + text) — стабильный идентификатор
  selector: string;      // CSS-путь от body: "main > section:nth-child(2) > h2"
  tag: string;           // оригинальный тег
  role: NodeRole;        // семантическая роль
  text: string;          // видимый текст (trimmed)
  href?: string;         // для ссылок и CTA
  src?: string;          // для картинок
  hash: string;          // md5(text + href + src) — для быстрого сравнения контента
};


// src/backend/services/extract/types.ts

export const SITE_TYPE = {
  ECOMMERCE: "ecommerce",
  NEWS: "news",
  LANDING: "landing",
  SOCIAL: "social",
  DIRECTORY: "directory",
  GENERIC: "generic",
} as const;

export type SiteType = (typeof SITE_TYPE)[keyof typeof SITE_TYPE];

export type ContentUnit = {
  id: string;
  selector: string;
  category: string;         // "product" | "article" | "post" | "pricing" | "hero" | "section" | "listing" | "block"
  fields: Record<string, string | null>;
  hash: string;
};

export type FieldChange = {
  field: string;
  from: string | null;
  to: string | null;
};

export type UnitChange = {
  type: "added" | "removed" | "changed";
  category: string;
  title: string | null;
  fields?: FieldChange[];
  link?: string | null;
};

export type ExtractionResult = {
  siteType: SiteType;
  units: ContentUnit[];
  meta: Record<string, string | null>;
};

export type DiffResult = {
  siteType: SiteType;
  hasChanges: boolean;
  changes: UnitChange[];
  formatted: string;
};

export type Strategy = (
  $: import("cheerio").CheerioAPI,
  baseUrl: string,
) => ContentUnit[];