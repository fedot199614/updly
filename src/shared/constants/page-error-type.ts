export const PAGE_ERROR_TYPE = {
    HTTP: "http",
    TIMEOUT: "timeout",
    RUNTIME: "runtime",
    PARSING: "parsing",
    UNKNOWN: "unknown",
} as const;

export type PageErrorType = (typeof PAGE_ERROR_TYPE)[keyof typeof PAGE_ERROR_TYPE];