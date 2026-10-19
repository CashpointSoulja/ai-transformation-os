import type { TeamId } from './org';

// One Champion per sub-team at 5–10% time, agreed with their manager, as the
// handbook's operating rhythm describes. Champions don't report to the ATO.
// Builder levels follow the handbook's builder spectrum.

export type BuilderLevel = 'Consumer' | 'Configurer' | 'Builder' | 'Contributor';
export const BUILDER_LEVELS: BuilderLevel[] = ['Consumer', 'Configurer', 'Builder', 'Contributor'];
export const BUILDER_HINT: Record<BuilderLevel, string> = {
  Consumer: 'Uses AI tools as provided',
  Configurer: 'Adapts existing AI solutions',
  Builder: 'Creates new AI workflows',
  Contributor: 'Shares solutions back to the org',
};

export interface Champion {
  name: string;
  team: TeamId;
  role: string;
  level: BuilderLevel;
  timePct: number;
  monthsActive: number;
  raised: number;
  shipped: number;
  lastSyncDays: number;
  backup?: string;
}

export const CHAMPIONS: Champion[] = [
  { name: 'Grace Adeyemi', team: 'pm-sec', role: 'Senior PM, Security Governance', level: 'Builder', timePct: 10, monthsActive: 5, raised: 6, shipped: 0, lastSyncDays: 3, backup: 'Viktor Hansen' },
  { name: 'Oliver Brennan', team: 'pm-dev', role: 'Senior PM, Plan', level: 'Contributor', timePct: 10, monthsActive: 7, raised: 9, shipped: 1, lastSyncDays: 3, backup: 'Hannah Kowalski' },
  { name: 'Ingrid Solberg', team: 'pm-cicd', role: 'PM, Package', level: 'Configurer', timePct: 5, monthsActive: 4, raised: 4, shipped: 1, lastSyncDays: 17, backup: 'Lucas Ferreira' },
  { name: 'Ravi Menon', team: 'pm-ai', role: 'Principal PM, Agent Foundations', level: 'Contributor', timePct: 10, monthsActive: 7, raised: 7, shipped: 1, lastSyncDays: 3 },
  { name: 'Isabel Moreau', team: 'studio-core', role: 'Staff Product Designer, Verify', level: 'Builder', timePct: 10, monthsActive: 6, raised: 5, shipped: 1, lastSyncDays: 3, backup: 'Ethan Clarke' },
  { name: 'Rafael Duarte', team: 'studio-security', role: 'Senior Product Designer', level: 'Builder', timePct: 10, monthsActive: 5, raised: 3, shipped: 1, lastSyncDays: 3, backup: 'Zara Hussain' },
  { name: 'Aarav Shah', team: 'studio-ai', role: 'Product Designer, Duo Chat', level: 'Configurer', timePct: 5, monthsActive: 2, raised: 2, shipped: 0, lastSyncDays: 3 },
  { name: 'Hana Okafor', team: 'exp-research', role: 'Senior UX Researcher', level: 'Contributor', timePct: 10, monthsActive: 7, raised: 6, shipped: 1, lastSyncDays: 3, backup: 'Samuel Osei' },
  { name: 'Noah Bergström', team: 'design-expression', role: 'Senior Frontend Engineer, Pajamas', level: 'Contributor', timePct: 10, monthsActive: 6, raised: 4, shipped: 1, lastSyncDays: 3 },
  { name: 'Amara Nwosu', team: 'design-strategy', role: 'DesignOps Manager', level: 'Builder', timePct: 5, monthsActive: 4, raised: 3, shipped: 1, lastSyncDays: 10 },
];

/** Sub-teams with no Champion yet. The ATO selects one, with the manager's sign-off. */
export const VACANT: { team: TeamId; nominee?: string; note: string }[] = [
  { team: 'studio-plg', nominee: 'Chloé Martin', note: 'Nominee raised AI-114. Waiting on manager sign-off for 5% time.' },
  { team: 'product-ops', note: 'No nominee yet. Tomás Herrera covers informally, but he owns 2 agents already.' },
];

/** Builder-spectrum headcount per sub-team, from the champion-led self-assessment (last run 3 weeks ago). */
export const ADOPTION: Record<TeamId, { weekly: number; spectrum: [number, number, number, number]; surveyed: number }> = {
  'exp-research': { weekly: 91, spectrum: [2, 4, 3, 2], surveyed: 11 },
  'pm-ai': { weekly: 83, spectrum: [3, 4, 3, 2], surveyed: 12 },
  'design-expression': { weekly: 78, spectrum: [2, 3, 2, 2], surveyed: 9 },
  'pm-dev': { weekly: 71, spectrum: [5, 5, 3, 1], surveyed: 14 },
  'studio-core': { weekly: 67, spectrum: [5, 4, 2, 1], surveyed: 12 },
  'studio-security': { weekly: 63, spectrum: [3, 3, 2, 0], surveyed: 8 },
  'design-strategy': { weekly: 50, spectrum: [3, 2, 1, 0], surveyed: 6 },
  'pm-sec': { weekly: 45, spectrum: [6, 3, 2, 0], surveyed: 11 },
  'studio-ai': { weekly: 44, spectrum: [5, 3, 1, 0], surveyed: 9 },
  'pm-cicd': { weekly: 36, spectrum: [7, 3, 1, 0], surveyed: 11 },
  'product-ops': { weekly: 33, spectrum: [4, 1, 1, 0], surveyed: 6 },
  'studio-plg': { weekly: 25, spectrum: [6, 2, 0, 0], surveyed: 8 },
};

export const ADOPTION_TARGET = 70;

export interface Ritual {
  name: string;
  cadence: string;
  length: string;
  who: string;
  purpose: string;
  /** For computing the next occurrence: weekday (0=Sun) and week interval, or monthly rules. */
  rule: { kind: 'weekly'; day: number; every: 1 | 2; offsetWeeks?: number } | { kind: 'last-weekday'; day: number } | { kind: 'quarterly' };
  time: string;
}

export const RITUALS: Ritual[] = [
  { name: 'Champion ↔ ATO sync', cadence: 'Every two weeks', length: '30 min', who: 'All Champions + you', purpose: 'In-function intake and coaching. Each Champion brings their sub-team\'s top request.', rule: { kind: 'weekly', day: 2, every: 2 }, time: '15:00 UTC' },
  { name: 'Function AI office hours', cadence: 'Every two weeks, alternating', length: '45 min', who: 'Open to all of Product & Design · AI Engineer present', purpose: 'No agenda. Recurring questions are unqualified use cases and go to intake.', rule: { kind: 'weekly', day: 2, every: 2, offsetWeeks: 1 }, time: '15:00 UTC' },
  { name: 'Champion demo', cadence: 'Monthly, last Thursday', length: '45 min', who: 'Whole function', purpose: 'What teams shipped. Recordings land on the demo wall.', rule: { kind: 'last-weekday', day: 4 }, time: '16:00 UTC' },
  { name: 'ATO Council', cadence: 'Weekly', length: '60 min', who: 'All ATOs + Enterprise AI', purpose: 'De-siloing forum: reuse patterns across functions before building.', rule: { kind: 'weekly', day: 3, every: 1 }, time: '16:00 UTC' },
  { name: 'Quarterly Business Review', cadence: 'Quarterly', length: '30 min', who: 'Exec sponsor + Director, Enterprise AI', purpose: 'Two or three slides: shipped and value, what\'s planned, asks.', rule: { kind: 'quarterly' }, time: 'FY27-Q4 kickoff' },
];

export interface Demo {
  id: string;
  title: string;
  team: TeamId;
  presenter: string;
  daysAgo: number;
  metric: string;
  metricLabel: string;
  summary: string;
  agent?: string;
  skill?: string;
  reactions: number;
}

export const DEMOS: Demo[] = [
  { id: 'd1', title: 'Synthesis in an afternoon', team: 'exp-research', presenter: 'Hana Okafor', daysAgo: 25, metric: '2 days → 3 h', metricLabel: 'per study, first-pass synthesis', summary: 'Research Synthesizer drafts insight cards with cited quotes. The DRI reviews and pushes them to Dovetail. 14 studies so far.', agent: 'research-synthesizer', skill: 'research-synthesis', reactions: 41 },
  { id: 'd2', title: 'Zero late release notes in 18.5', team: 'pm-ai', presenter: 'Ravi Menon', daysAgo: 25, metric: '94%', metricLabel: 'merged before the Friday deadline', summary: 'Mention the drafter on the Release Notes Item MR and get a 125-word draft with metadata. PMs edit, they don\'t start from blank.', agent: 'release-note-drafter', skill: 'release-note-drafter', reactions: 33 },
  { id: 'd3', title: 'Untriaged backlog: 410 → 38', team: 'pm-dev', presenter: 'Oliver Brennan', daysAgo: 53, metric: '−91%', metricLabel: 'untriaged issues in Dev groups', summary: 'Propose-and-wait triage comments with reasoning. 91% of suggested labels accepted. Sec is next (AI-125).', agent: 'issue-triage-assistant', skill: 'issue-triage-assistant', reactions: 57 },
  { id: 'd4', title: 'Critiques that start on time', team: 'studio-core', presenter: 'Isabel Moreau', daysAgo: 53, metric: '10 → 3 min', metricLabel: 'context time per critique', summary: 'A one-screen pre-read with the main job and a heuristic pass, posted with the 2-business-day review request.', agent: 'design-critique-prep', skill: 'design-critique-prep', reactions: 29 },
  { id: 'd5', title: 'Accessibility before handoff', team: 'studio-security', presenter: 'Rafael Duarte', daysAgo: 25, metric: '0.7', metricLabel: 'a11y bugs per milestone, down from 2.4', summary: 'Focus order, accessible names and contrast annotated on the design issue before engineers pick it up.', agent: 'a11y-annotator', reactions: 22 },
  { id: 'd6', title: 'UI text, consistently', team: 'design-expression', presenter: 'Noah Bergström', daysAgo: 81, metric: '67%', metricLabel: 'of suggestions accepted', summary: 'The UI Text Reviewer catches title case, vague verbs and terminology drift ("work item", not "ticket") on MRs.', agent: 'ui-text-reviewer', skill: 'ui-text-reviewer', reactions: 18 },
  { id: 'd7', title: 'Kickoffs nobody has to rewatch', team: 'design-strategy', presenter: 'Amara Nwosu', daysAgo: 81, metric: '95%', metricLabel: 'recaps posted within 24h', summary: 'Decisions tagged reversible or irreversible, each with a DRI, on the planning issue. "DRI needed" when nobody was named.', agent: 'kickoff-recapper', skill: 'kickoff-recap', reactions: 24 },
  { id: 'd8', title: 'Direction pages that move monthly', team: 'pm-cicd', presenter: 'Ingrid Solberg', daysAgo: 109, metric: '41% → 72%', metricLabel: 'pages fresh in the last 90 days', summary: 'Draft MRs on the 12th update what\'s next and what we\'re not doing, linked to issues. PMs keep the strategy prose.', agent: 'direction-page-refresher', skill: 'direction-page-refresh', reactions: 19 },
];
