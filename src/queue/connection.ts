import { RedisOptions } from "ioredis";
import { getEnv } from "@/env.helper.js";

export const redisConfig: RedisOptions = {
  host: getEnv('REDIS_HOST', {default: '127.0.0.1'}),
  port: Number(getEnv('REDIS_PORT', {default: '6379'})),
};