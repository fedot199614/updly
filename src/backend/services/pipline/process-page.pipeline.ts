import crypto from "crypto";

import { fetchSmart } from "@/backend/services/fetch/fetch.service.js";
import { extractItems } from "@/backend/services/extract/extract.service.js";
import { normalizeItems } from "@/backend/services/normalize/normalize.service.js";

export const processPage = async (page: any) => {

  const { html } = await fetchSmart(page);

  const blocks = extractItems(html, page.url);

  const normalizedItems = normalizeItems(blocks);

  const hash = generateHash(normalizedItems);

  return {
    html,
    blocks,
    normalizedItems,
    hash,
  };
};

const generateHash = (data: any) => {
  return crypto
    .createHash("md5")
    .update(JSON.stringify(data))
    .digest("hex");
};