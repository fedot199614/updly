import { getEnv } from "@/env.helper";

export const dbConfig = {
  DATABASE_URL: getEnv("DATABASE_URL"),
};