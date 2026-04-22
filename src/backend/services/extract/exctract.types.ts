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