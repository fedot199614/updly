export const SCRAPE_STATUS = {
  PENDING: "pending",
  RUNNING: "running",
  SUCCESS: "success",
  FAILED: "failed",
} as const;

export type ScrapeStatus = (typeof SCRAPE_STATUS)[keyof typeof SCRAPE_STATUS];