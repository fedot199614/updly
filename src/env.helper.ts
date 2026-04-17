import dotenv from "dotenv";

dotenv.config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
  override: true,
});


type EnvOptions = {
  default?: string;
};

export const getEnv = (name: string, options?: EnvOptions): string => {
  const value = process.env[name];

  if (value) return value;

  if (options?.default !== undefined) return options.default;

  throw new Error(`${name} is not defined`);
};