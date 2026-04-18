export const PROJECT_TYPE = {
  CUSTOM: "custom",
  INSTA: "instagram",
} as const;

export type ProjectType = (typeof PROJECT_TYPE)[keyof typeof PROJECT_TYPE];