export const MIN_SCORE = 3;
export const MIN_TEXT_LENGTH = 50;
export const MAX_LINKS = 5;

export const CANDIDATE_SELECTOR = [
  "article",
  "section",
  "main > div",
  "li",
  "[class*='card']",
  "[class*='item']",
  "[class*='post']",
  "[class*='news']",
  "[class*='product']",
  "[class*='entry']",
].join(", ");
 

export const NESTING_SELECTOR = [
  "article",
  "section",
  "[class*='card']",
  "[class*='item']",
  "[class*='post']",
  "[class*='product']",
  "[class*='entry']",
].join(", ");

// Теги, которые вырезаются целиком — они не несут контента
export const NOISE_TAGS = [
  "script", "style", "noscript", "template",
  "iframe", "svg", "canvas", "video", "audio",
  "object", "embed",
];

// Теги-обёртки — мы не извлекаем их как ноды, а проходим сквозь к потомкам
export const WRAPPER_TAGS = new Set([
  "div", "span", "main", "header", "footer",
  "section", "article", "aside", "figure",
  "form", "fieldset", "details", "summary",
  "nav", "ul", "ol", "dl", "table", "tbody",
  "thead", "tr", "td", "th",
]);

// Теги, которые сами по себе являются контентными нодами
export const CONTENT_TAGS = new Set([
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "blockquote", "figcaption", "dd", "dt",
  "a", "img", "source",
  "button", "li",
  "time", "address",
  "label", "caption",
]);

// Классы, сигнализирующие о шуме (реклама, трекинг, скрытые элементы)
export const NOISE_CLASS_PATTERNS = [
  "tracking", "pixel", "analytics", "adsense",
  "adsbygoogle", "cookie-banner", "gdpr",
  "sr-only", "visually-hidden", "screen-reader",
];