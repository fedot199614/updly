export const env = new Proxy(process.env, {
  get(target, prop: string) {
    const value = target[prop];
    if (!value) throw new Error(`${prop} is not defined`);
    return value;
  },
}) as Record<string, string>;