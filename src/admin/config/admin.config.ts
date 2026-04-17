import { env } from "@/env.helper";

export const adminConfig = {

  COOKIE_SECRET: env.COOKIE_SECRET,
  COOKIE_NAME: "adminjs",
  DEFAULT_ADMIN: {
    email: 'admin@example.com',
    password: 'password',
  }

};