// src/backend/services/monitor.service.ts

import { Page } from "@/backend/db/models/page.model.js";
import { Snapshot } from "@/backend/db/models/snapshot.model.js";
import { PAGE_STATUS } from "@/shared/constants/page-status.js";
import { Job } from "bullmq/dist/esm/classes/job";
import { processPage } from "@/backend/services/pipline/process-page.pipeline.js";
import { diff, formatDiff } from "@/backend/services/extract/diff.js";
import { ExtractionResult } from "@/backend/services/extract/exctract.types.js";

export const processMonitorJob = async (job: Job<any, any, string>) => {
  const { pageId, url } = job.data;

  const page = await Page.findById(pageId);

  if (!page || page.status === PAGE_STATUS.PAUSED) {
    job.log(`Skipping page ${pageId} — not found or paused`);
    return;
  }

  try {
    // 1. Fetch + extract
    const { siteType, units, meta, hash } = await processPage(page);

    job.log(`[${siteType}] Extracted ${units.length} units from ${url}`);
    console.log(`[${siteType}] Extracted ${units.length} units from ${url}`);

    // 2. Load previous snapshot
    const lastSnapshot = await Snapshot.findOne({ pageId })
      .sort({ createdAt: -1 })
      .lean();

    // 3. Quick hash check
    if (lastSnapshot && lastSnapshot.hash === hash) {
      job.log("No changes detected (hash match)");
      console.log("No changes detected (hash match)");
      await Page.findByIdAndUpdate(pageId, { lastCheckedAt: new Date() });
      return;
    }

    // 4. Compute diff
    const prevResult: ExtractionResult = {
      siteType: (lastSnapshot as any)?.siteType || "generic",
      units: (lastSnapshot as any)?.units || [],
      meta: (lastSnapshot as any)?.meta || {},
    };

    const currResult: ExtractionResult = { siteType, units, meta };
    const changes = diff(prevResult, currResult);

    job.log(changes.formatted);
    console.log(changes.formatted);

    // 5. Save snapshot
    const snapshot = await Snapshot.create({
      pageId,
      siteType,
      units,
      meta,
      diff: {
        hasChanges: changes.hasChanges,
        changes: changes.changes,
        summary: {
          added: changes.changes.filter((c) => c.type === "added").length,
          removed: changes.changes.filter((c) => c.type === "removed").length,
          changed: changes.changes.filter((c) => c.type === "changed").length,
        },
      },
      hash,
    });

    // 6. Reset errors
    await Page.findByIdAndUpdate(pageId, {
      lastCheckedAt: new Date(),
      errorCount: 0,
      lastErrorAt: null,
      lastErrorType: null,
      error: null,
    });

    const s = changes.changes.length;
    job.log(`Snapshot ${snapshot.id} saved. ${s} change${s !== 1 ? "s" : ""} detected.`);
    console.log(`Snapshot ${snapshot.id} saved. ${s} change${s !== 1 ? "s" : ""} detected.`);

    // 7. TODO: if (changes.hasChanges) → send alert
    //   formatDiff(siteType, changes.changes) → LLM → classification → webhook/email

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    job.log(`Error monitoring page ${pageId} — ${message}`);
    console.log(`Error monitoring page ${pageId} — ${message}`);

    await Snapshot.create({
      pageId,
      error: message,
      errorStack: error instanceof Error ? error.stack : null,
    });

    const newErrorCount = page.errorCount + 1;
    const update: any = {
      lastCheckedAt: new Date(),
      errorCount: newErrorCount,
      lastErrorAt: new Date(),
      error: message,
    };
    if (newErrorCount >= 5) update.status = PAGE_STATUS.PAUSED;

    await Page.findByIdAndUpdate(pageId, update);
    throw error;
  }
};