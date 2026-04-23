// src/backend/services/fetch/fetch.service.ts

import axios from "axios";
import { fetchWithPlaywright } from "@/backend/services/fetch/playwright.service.js";
import { extract } from "@/backend/services/extract/extract.js";
import { PAGE_FETCH_MODE } from "@/shared/constants/page-fetch-mode.js";

type FetchResult = {
  html: string;
};

export const fetchSmart = async (page: any): Promise<FetchResult> => {
  const { url, mode } = page;

  if (mode === PAGE_FETCH_MODE.STATIC) {
    const html = await axios.get(url).then((r) => r.data);
    return { html };
  }

  if (mode === PAGE_FETCH_MODE.DYNAMIC) {
    const html = await fetchWithPlaywright(url);
    return { html };
  }

  // AUTO mode: пробуем axios, если контента мало — fallback на playwright
  let html = await axios.get(url).then((r) => r.data);

  const { units } = extract(html, url);

  const isSPA =
    html.includes("__nuxt") ||
    html.includes('id="__nuxt"') ||
    html.includes("__NEXT_DATA__") ||
    html.includes('id="root"') ||
    html.includes('id="app"');

  const shouldFallback = units.length < 2 || isSPA;

  if (shouldFallback && page.mode === PAGE_FETCH_MODE.AUTO) {
    console.log("Fallback to Playwright:", url);
    html = await fetchWithPlaywright(url);
  }

  return { html };
};