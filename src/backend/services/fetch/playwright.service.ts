import { chromium } from "playwright";

type ChromiumOptions = {
  headless?: boolean;
  args?: string[];
};

export const fetchWithPlaywright = async (url: string, chromiumOptions: ChromiumOptions = { headless: true, args: ["--no-sandbox"] }): Promise<string> => {
  const browser = await chromium.launch(chromiumOptions);

  const page = await browser.newPage();

  try {
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    await page.waitForTimeout(2000);

    const html = await page.content();

    return html;
  } finally {
    await browser.close();
  }
};