import { getEnv } from "@/env.helper";

export const appConfig = {
  PORT: getEnv("PORT", { default: "3000" }),
};