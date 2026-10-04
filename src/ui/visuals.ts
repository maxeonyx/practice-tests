const shapes = {
  tablet:
    '<path d="M17 9a11 11 0 0 1 16 16L23 35A11 11 0 0 1 7 19Z"/><path d="m12 14 16 16"/>',
  gut: '<path d="M15 4v9c0 6 7 3 7 8s-11 3-11 8 16 7 17 0-10-4-8-8 13-1 13-8-5-11-9-7"/><path d="M16 36v5"/>',
  blood:
    '<path d="M22 4S8 19 8 28a14 14 0 0 0 28 0C36 19 22 4 22 4Z"/><path d="M14 28c0 5 3 8 7 8"/>',
  liver:
    '<path d="M6 14c9-8 24-10 32-3 4 4 2 12-6 13-5 1-5 8-11 9-7 1-12-2-16-7-3-4-2-8 1-12Z"/><path d="m24 9-4 14-12 1"/>',
  kidney:
    '<path d="M14 7C4 8 1 21 7 32c4 8 11 6 12 1s-6-5-6-10 6-5 6-10-2-6-5-6Z"/><path d="M30 7c10 1 13 14 7 25-4 8-11 6-12 1s6-5 6-10-6-5-6-10 2-6 5-6Z"/><path d="M15 25c7 6 5 12 5 16m9-16c-7 6-5 12-5 16"/>',
  brain:
    '<path d="M21 8c-5-8-14-2-14 5-7 1-7 12-2 15-2 9 8 14 15 8m3-28c5-8 14-2 14 5 7 1 7 12 2 15 2 9-8 14-15 8M22 8v30"/><path d="M9 15c8-4 12 7 5 10m21-10c-8-4-12 7-5 10M8 30l7 2m21-2-7 2"/>',
  lung: '<path d="M22 4v14m-4-11v13c-5-2-11 3-12 11-2 9 10 10 13 5V18m7-11v13c5-2 11 3 12 11 2 9-10 10-13 5V18"/>',
  heart:
    '<path d="M22 37S3 25 3 14 17 2 22 11C27 2 41 3 41 14S22 37 22 37Z"/><path d="M4 22h9l4-8 6 15 4-7h13"/>',
  person:
    '<circle cx="22" cy="11" r="7"/><path d="M8 39v-8c0-15 28-15 28 0v8m-21 0V28m14 11V28"/>',
  family:
    '<circle cx="12" cy="10" r="5"/><circle cx="32" cy="10" r="5"/><circle cx="22" cy="25" r="4"/><path d="M3 31v-8c0-10 17-10 17-1m21 9v-8c0-10-17-10-17-1M15 41v-6c0-8 14-8 14 0v6"/>',
  home: '<path d="m3 20 19-16 19 16M8 16v24h28V16M17 40V27h10v13"/>',
  shield:
    '<path d="M22 4 6 10v15c0 9 16 16 16 16s16-7 16-16V10Z"/><path d="m13 22 6 6 12-13"/>',
  receptor:
    '<path d="M3 32h13V20h12v12h13M16 4h12v10H16Z"/><path d="m22 15 0 4m-3-3 3 3 3-3"/>',
  clock: '<circle cx="22" cy="22" r="18"/><path d="M22 8v14l9 7"/>',
};
type Shape = keyof typeof shapes;
export function icon(shape: Shape): string {
  return `<svg class="learning-icon" viewBox="0 0 44 44" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${shapes[shape]}</svg>`;
}
export function conceptIcon(id: string): string {
  const exact: Record<string, Shape> = {
    "adme-absorption": "gut",
    "adme-distribution": "blood",
    "adme-metabolism": "liver",
    "adme-excretion": "kidney",
    "first-pass-portal": "liver",
    "first-pass-route": "tablet",
    "half-life-meaning": "clock",
    "half-life-calculation": "clock",
  };
  let shape = exact[id];
  if (shape === undefined) {
    if (/insulin|glucagon|diabetes/.test(id)) shape = "blood";
    else if (
      /antidepressant|parkinsons|antiepilep|epilepsy|benzodiazepine|antipsychotic/.test(
        id,
      )
    )
      shape = "brain";
    else if (/digoxin|beta-blocker|raas|clotting|lipids/.test(id))
      shape = "heart";
    else if (/inhal|salbutamol/.test(id)) shape = "lung";
    else if (/immun|vaccine/.test(id)) shape = "shield";
    else if (/home/.test(id)) shape = "home";
    else if (/whanau|whānau|child|postnatal|infant/.test(id)) shape = "family";
    else if (/agonist|antagonist|receptor/.test(id)) shape = "receptor";
    else return "";
  }
  return icon(shape);
}
