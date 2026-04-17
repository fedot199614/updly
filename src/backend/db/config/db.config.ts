import { getEnv } from "@/env.helper.js";

export const dbConfig = {
  DATABASE_URL: getEnv("DATABASE_URL"),
};