export const PAGE_FETCH_MODE = {
    AUTO: "auto",
    STATIC: "static",
    DYNAMIC: "dynamic",
    API: "api",
} as const;

export type PageStatus = (typeof PAGE_FETCH_MODE)[keyof typeof PAGE_FETCH_MODE];