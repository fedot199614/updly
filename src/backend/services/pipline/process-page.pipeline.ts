import crypto from "crypto";
import { fetchSmart } from "@/backend/services/fetch/fetch.service.js";
import { extractPageNodes } from "@/backend/services/extract/extractors/page.node.extractor.js";
import { PageNode } from "@/backend/services/extract/exctract.types.js";

// Pipeline упростился: extractPageNodes уже выдаёт чистые ноды
// с нормализованными URL и текстом. Отдельный normalize шаг больше не нужен.

export const processPage = async (page: any) => {
  const { html } = await fetchSmart(page);

  const nodes = extractPageNodes(html, page.url);

  // Хеш считаем по отсортированным нодам — порядок стабилен
  const hash = generateHash(nodes);

  return { html, nodes, hash };
};

const generateHash = (nodes: PageNode[]): string =>
  crypto
    .createHash("md5")
    .update(nodes.map((n) => n.hash).join("|"))
    .digest("hex");