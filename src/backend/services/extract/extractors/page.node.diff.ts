import { PageNode, NodeRole } from "@/backend/services/extract/exctract.types.js";

// ─── Diff types ──────────────────────────────────────────────────────────────

export const CHANGE_TYPE = {
  ADDED: "added",
  REMOVED: "removed",
  CHANGED: "changed",
} as const;

export type ChangeType = (typeof CHANGE_TYPE)[keyof typeof CHANGE_TYPE];

export type NodeChange = {
  type: ChangeType;
  role: NodeRole;     // heading / price / link / ... — для фильтрации и приоритета
  selector: string;   // где на странице
  current?: string;   // новое значение (для added и changed)
  previous?: string;  // старое значение (для removed и changed)
  href?: string;      // ссылка, если есть
  src?: string;       // картинка, если есть
};

export type PageDiff = {
  hasChanges: boolean;
  changes: NodeChange[];
  summary: {
    added: number;
    removed: number;
    changed: number;
  };
};

// ─── Main diff ───────────────────────────────────────────────────────────────

// Сравнивает два массива PageNode[] и возвращает структурированный diff.
// Матчинг по selector — если селектор совпадает, сравниваем hash.
// Если хеш отличается — это changed. Если селектор новый — added.
// Если селектор исчез — removed.

export const diffNodes = (prev: PageNode[], current: PageNode[]): PageDiff => {
  const prevMap = new Map<string, PageNode>();
  const currentMap = new Map<string, PageNode>();

  for (const node of prev) prevMap.set(node.selector, node);
  for (const node of current) currentMap.set(node.selector, node);

  const changes: NodeChange[] = [];

  // Added: есть в current, нет в prev
  for (const [selector, node] of currentMap) {
    if (!prevMap.has(selector)) {
      changes.push({
        type: CHANGE_TYPE.ADDED,
        role: node.role,
        selector,
        current: node.text,
        ...(node.href && { href: node.href }),
        ...(node.src && { src: node.src }),
      });
    }
  }

  // Removed: есть в prev, нет в current
  for (const [selector, node] of prevMap) {
    if (!currentMap.has(selector)) {
      changes.push({
        type: CHANGE_TYPE.REMOVED,
        role: node.role,
        selector,
        previous: node.text,
        ...(node.href && { href: node.href }),
        ...(node.src && { src: node.src }),
      });
    }
  }

  // Changed: есть в обоих, но hash разный
  for (const [selector, currentNode] of currentMap) {
    const prevNode = prevMap.get(selector);
    if (!prevNode) continue;
    if (prevNode.hash === currentNode.hash) continue;

    changes.push({
      type: CHANGE_TYPE.CHANGED,
      role: currentNode.role,
      selector,
      previous: prevNode.text,
      current: currentNode.text,
      ...(currentNode.href && { href: currentNode.href }),
      ...(currentNode.src && { src: currentNode.src }),
    });
  }

  // Сортировка: важные роли сверху
  changes.sort((a, b) => rolePriority(a.role) - rolePriority(b.role));

  return {
    hasChanges: changes.length > 0,
    changes,
    summary: {
      added: changes.filter((c) => c.type === CHANGE_TYPE.ADDED).length,
      removed: changes.filter((c) => c.type === CHANGE_TYPE.REMOVED).length,
      changed: changes.filter((c) => c.type === CHANGE_TYPE.CHANGED).length,
    },
  };
};

// Приоритет ролей в отчёте — цены и заголовки сверху, мета снизу.
// Чем меньше число, тем выше в отчёте.
const ROLE_PRIORITY: Record<string, number> = {
  price: 1,
  heading: 2,
  cta: 3,
  link: 4,
  text: 5,
  image: 6,
  date: 7,
  list_item: 8,
  meta: 9,
};

const rolePriority = (role: NodeRole): number => ROLE_PRIORITY[role] ?? 99;

// ─── Утилиты для отображения ─────────────────────────────────────────────────

// Форматирует diff в читаемый текст — можно скормить LLM
// или показать клиенту как есть.
export const formatDiff = (diff: PageDiff): string => {
  if (!diff.hasChanges) return "No changes detected.";

  const lines: string[] = [];

  lines.push(`Changes: +${diff.summary.added} -${diff.summary.removed} ~${diff.summary.changed}`);
  lines.push("");

  for (const change of diff.changes) {
    switch (change.type) {
      case CHANGE_TYPE.ADDED:
        lines.push(`+ [${change.role}] ${change.current}`);
        if (change.href) lines.push(`  → ${change.href}`);
        break;

      case CHANGE_TYPE.REMOVED:
        lines.push(`- [${change.role}] ${change.previous}`);
        break;

      case CHANGE_TYPE.CHANGED:
        lines.push(`~ [${change.role}] "${change.previous}" → "${change.current}"`);
        if (change.href) lines.push(`  → ${change.href}`);
        break;
    }
  }

  return lines.join("\n");
};