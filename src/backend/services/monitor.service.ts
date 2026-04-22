import { Page } from "@/backend/db/models/page.model.js";
import { Snapshot } from "@/backend/db/models/snapshot.model.js";
import { PAGE_STATUS } from "@/shared/constants/page-status.js";
import { Job } from "bullmq/dist/esm/classes/job";
import { processPage } from "@/backend/services/pipline/process-page.pipeline.js";
import { diffNodes, formatDiff } from "@/backend/services/extract/extractors/page.node.diff.js";
import { PageNode } from "@/backend/services/extract/exctract.types.js";

export const processMonitorJob = async (job: Job<any, any, string>) => {
  const { pageId, url } = job.data;

  const page = await Page.findById(pageId);

  if (!page || page.status === PAGE_STATUS.PAUSED) {
    job.log(`Skipping page ${pageId} — not found or paused`);
    return;
  }

  try {
    // 1. Fetch + extract
    const { nodes, hash } = await processPage(page);

    job.log(`Extracted ${nodes.length} nodes from ${url}`);

    // 2. Load previous snapshot for comparison
    const lastSnapshot = await Snapshot.findOne({ pageId })
      .sort({ createdAt: -1 })
      .lean();

    // 3. Quick hash check — если хеш совпал, ничего не изменилось
    if (lastSnapshot && lastSnapshot.hash === hash) {
      job.log("No changes detected (hash match)");

      await Page.findByIdAndUpdate(pageId, {
        lastCheckedAt: new Date(),
      });

      return;
    }

    // 4. Compute structured diff
    const prevNodes = (lastSnapshot?.nodes ?? []) as PageNode[];
    const diff = diffNodes(prevNodes, nodes);

    job.log(formatDiff(diff));
    console.log(formatDiff(diff));

    // 5. Save snapshot with nodes + diff
    const snapshot = await Snapshot.create({
      pageId,
      nodes,
      diff,
      hash,
    });

    // 6. Reset error state
    await Page.findByIdAndUpdate(pageId, {
      lastCheckedAt: new Date(),
      errorCount: 0,
      lastErrorAt: null,
      lastErrorType: null,
      error: null,
    });

    job.log(`Snapshot ${snapshot.id} saved. Changes: +${diff.summary.added} -${diff.summary.removed} ~${diff.summary.changed}`);
    console.log(`Snapshot ${snapshot.id} saved. Changes: +${diff.summary.added} -${diff.summary.removed} ~${diff.summary.changed}`);

    // 7. TODO: if (diff.hasChanges) → send alert / notification
    // Здесь будет интеграция с уведомлениями:
    //   - formatDiff(diff) → промпт для LLM → классификация
    //   - или напрямую отправка diff клиенту через webhook/email

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    job.log(`Error monitoring page ${pageId} — ${message}`);

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

    if (newErrorCount >= 5) {
      update.status = PAGE_STATUS.PAUSED;
    }

    await Page.findByIdAndUpdate(pageId, update);

    throw error;
  }
};