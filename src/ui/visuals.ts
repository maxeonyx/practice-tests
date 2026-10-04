import { question } from "../content/curriculum";

export function controlIcon(name: "home" | "info" | "close") {
  const shapes = {
    home: '<path d="m3 11 9-8 9 8M5 10v10h14V10M9 20v-7h6v7"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.5" r=".7" fill="currentColor" stroke="none"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${shapes[name]}</svg>`;
}

export function knowledgeShape(
  rootId: string,
  currentId: string,
  previousId?: string,
  prerequisites = (id: string) => question(id).prerequisiteQuestionIds,
) {
  const depths = new Map<string, number>();
  const edges: [string, string][] = [];
  function visit(id: string, depth: number) {
    if (depths.has(id) && depths.get(id)! >= depth) return;
    depths.set(id, depth);
    for (const child of prerequisites(id)) {
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
  const previous =
    previousId === undefined ? undefined : positions.get(previousId);
  const current = positions.get(currentId)!;
  const animate =
    previous !== undefined &&
    previousId !== currentId &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let motion = "";
  if (animate) {
    const routes: string[][] = [[previousId!]];
    const visited = new Set<string>([previousId!]);
    let route: string[] = [];
    while (routes.length > 0) {
      const path = routes.shift()!;
      const end = path.at(-1)!;
      if (end === currentId) {
        route = path;
        break;
      }
      for (const [a, b] of edges) {
        const neighbour = a === end ? b : b === end ? a : undefined;
        if (neighbour !== undefined && !visited.has(neighbour)) {
          visited.add(neighbour);
          routes.push([...path, neighbour]);
        }
      }
    }
    motion = `M${previous!.x - current.x} ${previous!.y - current.y}`;
    for (let i = 1; i < route.length; i++) {
      const a = positions.get(route[i - 1])!;
      const b = positions.get(route[i])!;
      const mid = (a.y + b.y) / 2 - current.y;
      motion += ` C${a.x - current.x} ${mid},${b.x - current.x} ${mid},${b.x - current.x} ${b.y - current.y}`;
    }
  }
  return `<svg class="knowledge-shape ${rootId === currentId ? "resting" : "stepping"}" viewBox="0 0 120 68" role="img" aria-label="Supporting knowledge"><g fill="none" stroke="currentColor" stroke-width="1">${edges
    .map(([from, to]) => {
      const a = positions.get(from)!;
      const b = positions.get(to)!;
      return `<path d="M${a.x} ${a.y} C${a.x} ${(a.y + b.y) / 2},${b.x} ${(a.y + b.y) / 2},${b.x} ${b.y}"/>`;
    })
    .join(
      "",
    )}</g>${[...positions].map(([id, p]) => `<circle data-question-id="${id}" cx="${p.x}" cy="${p.y}" r="2"/>`).join("")}<circle class="active" cx="${current.x}" cy="${current.y}" r="3.5">${animate ? `<animateMotion path="${motion}" dur=".45s" calcMode="paced"/>` : ""}</circle></svg>`;
}
