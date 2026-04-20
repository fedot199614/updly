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