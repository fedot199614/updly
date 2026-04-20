import axios from "axios";
import { fetchWithPlaywright } from "@/backend/services/fetch/playwright.service.js";
import { extractItems } from "@/backend/services/extract/extract.service.js";
import { Page } from "@/backend/db/models/page.model.js";
import { PAGE_FETCH_MODE } from "@/shared/constants/page-fetch-mode.js";

type FetchResult = {
    html: string;
};

export const fetchSmart = async (page: any): Promise<FetchResult> => {
    const { url, mode, _id } = page;

    let html: string = "";

    if (mode === PAGE_FETCH_MODE.STATIC) {
        html = await axios.get(url).then(r => r.data);
        return { html };
    }

    if (mode === PAGE_FETCH_MODE.DYNAMIC) {
        html = await fetchWithPlaywright(url);
        return { html };
    }


    html = await axios.get(url).then(r => r.data);

    const items = extractItems(html, url);

    const isSPA =
        html.includes("__nuxt") ||
        html.includes("id=\"__nuxt\"") ||
        html.includes("__NEXT_DATA__") ||
        html.includes("id=\"root\"") ||
        html.includes("id=\"app\"");

    const shouldFallback =
        items.length === 0 || isSPA;

    console.log(shouldFallback ? "Fallback criteria met" : "No fallback needed")

    if (shouldFallback && page.mode === PAGE_FETCH_MODE.AUTO) {
        console.log("⚠️ Fallback → Playwright:", url);
        html = await fetchWithPlaywright(url);

        // await Page.findByIdAndUpdate(_id, {
        //   mode: PAGE_FETCH_MODE.DYNAMIC,
        // });
    }

    return { html };
};