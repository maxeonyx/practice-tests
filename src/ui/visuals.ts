import { question } from "../content/curriculum";

export function controlIcon(name: "home" | "info" | "close") {
  const shapes = {
    home: '<path d="m3 11 9-8 9 8M5 10v10h14V10M9 20v-7h6v7"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.5" r=".7" fill="currentColor" stroke="none"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${shapes[name]}</svg>`;
}

export function knowledgeShape(rootId: string, currentId: string) {
  const depths = new Map<string, number>();
  const edges: [string, string][] = [];
  function visit(id: string, depth: number) {
    if (depths.has(id) && depths.get(id)! >= depth) return;
    depths.set(id, depth);
    for (const child of question(id).prerequisiteQuestionIds) {
      if (!edges.some(([a, b]) => a === id && b === child))
        edges.push([id, child]);
      visit(child, depth + 1);
    }
  }
  visit(rootId, 0);
  if (edges.length === 0) return '<span class="knowledge-space"></span>';
  const maxDepth = Math.max(...depths.values());
  const positions = new Map<string, { x: number; y: number }>();
  for (let depth = 0; depth <= maxDepth; depth++) {
    const ids = [...depths.keys()].filter((id) => depths.get(id) === depth);
    ids.forEach((id, i) =>
      positions.set(id, {
        x: (120 * (i + 1)) / (ids.length + 1),
        y: 8 + (52 * depth) / maxDepth,
      }),
    );
  }
  return `<svg class="knowledge-shape ${rootId === currentId ? "resting" : "stepping"}" viewBox="0 0 120 68" role="img" aria-label="Supporting knowledge"><g fill="none" stroke="currentColor" stroke-width="1">${edges
    .map(([from, to]) => {
      const a = positions.get(from)!;
      const b = positions.get(to)!;
      return `<path d="M${a.x} ${a.y} C${a.x} ${(a.y + b.y) / 2},${b.x} ${(a.y + b.y) / 2},${b.x} ${b.y}"/>`;
    })
    .join(
      "",
    )}</g>${[...positions].map(([id, p]) => `<circle data-question-id="${id}" class="${id === currentId ? "active" : ""}" cx="${p.x}" cy="${p.y}" r="${id === currentId ? 3.5 : 2}"/>`).join("")}</svg>`;
}
