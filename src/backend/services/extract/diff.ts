// src/backend/services/extract/diff.ts

import { ExtractionResult, DiffResult, UnitChange, FieldChange, ContentUnit } from "@/backend/services/extract/exctract.types.js";
import { trunc } from "@/backend/services/extract/helpers.js";

export const diff = (prev: ExtractionResult, curr: ExtractionResult): DiffResult => {
  const prevById = new Map(prev.units.map((u) => [u.id, u]));
  const currById = new Map(curr.units.map((u) => [u.id, u]));
  const prevBySel = new Map(prev.units.map((u) => [u.selector, u]));

  const changes: UnitChange[] = [];
  const matchedPrev = new Set<string>();

  // Added & Changed
  for (const unit of curr.units) {
    const prevUnit = prevById.get(unit.id) || prevBySel.get(unit.selector);

    if (!prevUnit) {
      changes.push({
        type: "added",
        category: unit.category,
        title: unitTitle(unit),
        link: unit.fields.link || unit.fields.ctaLink || null,
      });
      continue;
    }

    matchedPrev.add(prevUnit.id);
    if (prevUnit.hash === unit.hash) continue;

    const fieldChanges: FieldChange[] = [];
    for (const key of Object.keys(unit.fields)) {
      if (prevUnit.fields[key] !== unit.fields[key]) {
        fieldChanges.push({ field: key, from: prevUnit.fields[key], to: unit.fields[key] });
      }
    }

    if (fieldChanges.length > 0) {
      changes.push({
        type: "changed",
        category: unit.category,
        title: unitTitle(unit) || unitTitle(prevUnit),
        fields: fieldChanges,
        link: unit.fields.link || null,
      });
    }
  }

  // Removed
  for (const unit of prev.units) {
    if (!matchedPrev.has(unit.id) && !currById.has(unit.id)) {
      changes.push({
        type: "removed",
        category: unit.category,
        title: unitTitle(unit),
        link: unit.fields.link || null,
      });
    }
  }

  // Meta changes
  for (const key of Object.keys(curr.meta)) {
    if (prev.meta[key] !== curr.meta[key] && (prev.meta[key] || curr.meta[key])) {
      changes.push({
        type: prev.meta[key] ? "changed" : "added",
        category: "meta",
        title: key,
        fields: [{ field: key, from: prev.meta[key], to: curr.meta[key] }],
      });
    }
  }

  // Сортировка: price changes first, then added, changed, removed
  changes.sort((a, b) => changePriority(a) - changePriority(b));

  return {
    siteType: curr.siteType,
    hasChanges: changes.length > 0,
    changes,
    formatted: formatDiff(curr.siteType, changes),
  };
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const unitTitle = (u: ContentUnit): string | null =>
  u.fields.title || u.fields.name || u.fields.author || u.fields.content?.slice(0, 60) || null;

const changePriority = (c: UnitChange): number => {
  if (c.type === "changed" && c.fields?.some((f: FieldChange) => f.field === "price")) return 0;
  if (c.type === "added") return 1;
  if (c.type === "changed") return 2;
  return 3;
};

export const formatDiff = (siteType: string, changes: UnitChange[]): string => {
  if (changes.length === 0) return `[${siteType}] No changes.`;

  const lines: string[] = [];
  const a = changes.filter((c) => c.type === "added").length;
  const r = changes.filter((c) => c.type === "removed").length;
  const ch = changes.filter((c) => c.type === "changed").length;
  lines.push(`[${siteType}] +${a} -${r} ~${ch}`);

  for (const c of changes) {
    const label = c.title || "(untitled)";

    if (c.type === "added") {
      lines.push(`  + [${c.category}] ${label}`);
      if (c.link) lines.push(`    → ${c.link}`);
    } else if (c.type === "removed") {
      lines.push(`  - [${c.category}] ${label}`);
    } else {
      lines.push(`  ~ [${c.category}] ${label}`);
      for (const f of c.fields || []) {
        if (f.from && f.to) lines.push(`    ${f.field}: "${trunc(f.from, 50)}" → "${trunc(f.to, 50)}"`);
        else if (f.to) lines.push(`    ${f.field}: + "${trunc(f.to, 50)}"`);
        else lines.push(`    ${f.field}: removed`);
      }
    }
  }

  return lines.join("\n");
};