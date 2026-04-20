import { Element } from "domhandler";
import { isValidImage } from "@/backend/services/extract/extract.utils.js";

export const extractImages = (
  $: any,
  linkEl: any,
  container: any,
  baseUrl: string
): string[] => {
  const images: string[] = [];

  collect($, linkEl);
  collect($, container);
  collect($, container.parent());

  function collect($: any, scope: any) {
    scope.find("img, source").each((_: any, el: Element) => {
      const $el = $(el);

      const candidates = [
        $el.attr("src"),
        $el.attr("data-src"),
        $el.attr("srcset"),
        $el.attr("data-srcset"),
      ];

      for (const c of candidates) {
        if (!c) continue;

        const parsed = parseSrcset(c);
        if (!parsed) continue;

        try {
          const url = new URL(parsed, baseUrl).href;

          if (isValidImage(url)) {
            images.push(url);
          }
        } catch {}
      }
    });
  }

  return [...new Set(images)].slice(0, 3);
};

const parseSrcset = (value: string) => {
  if (!value.includes(",")) return value;

  const parts = value.split(",");
  return parts[parts.length - 1].split(" ")[0];
};