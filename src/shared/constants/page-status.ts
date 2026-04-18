export const PAGE_STATUS = {
  ACTIVE: "active",
  PAUSED: "paused",
} as const;

export type PageStatus = (typeof PAGE_STATUS)[keyof typeof PAGE_STATUS];