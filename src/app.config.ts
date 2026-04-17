import { getEnv } from "@/env.helper.js";

export const appConfig = {
  PORT: getEnv("PORT", { default: "3000" }),
};