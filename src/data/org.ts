// The Product & Design org this workspace models. Headcounts drive the triage
// agent's volume estimate, so they are part of the scoring model, not decoration.

export type TeamId =
  | 'pm-dev'
  | 'pm-cicd'
  | 'pm-sec'
  | 'pm-ai'
  | 'studio-core'
  | 'studio-security'
  | 'studio-ai'
  | 'studio-plg'
  | 'exp-research'
  | 'design-expression'
  | 'design-strategy'
  | 'product-ops';

export type Group = 'Product Management' | 'Upstream Studios' | 'Product Operations';

export interface Team {
  id: TeamId;
  name: string;
  short: string;
  group: Group;
  /** What people on this team are called in a sentence ("designers"). */
  noun: string;
  headcount: number;
  lead: string;
}

// Sub-teams mirror the handbook: PM by section, Upstream Studios by function and Product Studio.
export const TEAMS: Team[] = [
  { id: 'pm-dev', name: 'PM · Dev (Plan, Create)', short: 'PM Dev', group: 'Product Management', noun: 'PMs', headcount: 14, lead: 'Daniela Ortiz' },
  { id: 'pm-cicd', name: 'PM · CI/CD (Verify, Package, Deploy)', short: 'PM CI/CD', group: 'Product Management', noun: 'PMs', headcount: 11, lead: 'Marcus Lindqvist' },
  { id: 'pm-sec', name: 'PM · Sec', short: 'PM Sec', group: 'Product Management', noun: 'PMs', headcount: 11, lead: 'Aisha Bello' },
  { id: 'pm-ai', name: 'PM · AI (Agent Foundations, AI Coding)', short: 'PM AI', group: 'Product Management', noun: 'PMs', headcount: 12, lead: 'Kenji Watanabe' },
  { id: 'studio-core', name: 'Product Design · Core DevOps + Data studio', short: 'Core studio', group: 'Upstream Studios', noun: 'designers', headcount: 12, lead: 'Sofia Marchetti' },
  { id: 'studio-security', name: 'Product Design · Security studio', short: 'Security studio', group: 'Upstream Studios', noun: 'designers', headcount: 8, lead: 'Rafael Duarte' },
  { id: 'studio-ai', name: 'Product Design · AI studio', short: 'AI studio', group: 'Upstream Studios', noun: 'designers', headcount: 9, lead: 'Mei Lin Tan' },
  { id: 'studio-plg', name: 'Product Design · PLG & Platform studio', short: 'PLG studio', group: 'Upstream Studios', noun: 'designers', headcount: 8, lead: 'Jonah Whitfield' },
  { id: 'exp-research', name: 'Experience Research', short: 'Research', group: 'Upstream Studios', noun: 'researchers', headcount: 11, lead: 'Priya Raman' },
  { id: 'design-expression', name: 'Design Expression (Pajamas & accessibility)', short: 'Pajamas', group: 'Upstream Studios', noun: 'design system folks', headcount: 9, lead: 'Lena Fischer' },
  { id: 'design-strategy', name: 'Design Strategy & DesignOps', short: 'DesignOps', group: 'Upstream Studios', noun: 'design strategists', headcount: 6, lead: 'Amara Nwosu' },
  { id: 'product-ops', name: 'Product Operations', short: 'Product Ops', group: 'Product Operations', noun: 'product ops partners', headcount: 6, lead: 'Tomás Herrera' },
];

export const TEAM_BY_ID = Object.fromEntries(TEAMS.map((t) => [t.id, t])) as Record<TeamId, Team>;
export const ORG_HEADCOUNT = TEAMS.reduce((n, t) => n + t.headcount, 0);
export const PM_TEAMS: TeamId[] = ['pm-dev', 'pm-cicd', 'pm-sec', 'pm-ai'];
export const DESIGN_TEAMS: TeamId[] = ['studio-core', 'studio-security', 'studio-ai', 'studio-plg'];

export type ThemeId =
  | 'research-ops'
  | 'design-quality'
  | 'release-comms'
  | 'triage-planning'
  | 'stakeholder-comms'
  | 'docs-content'
  | 'data-insight'
  | 'enablement';

export type OutcomeId = 'faster-insight' | 'ux-quality' | 'clear-comms' | 'planning-focus' | 'fluency';

export interface Outcome {
  id: OutcomeId;
  name: string;
  /** Sentence fragment used in rationales: "because it {verb}". */
  verb: string;
  /** Multiplier applied in prioritization. Set by the AI Transformation Owner each half. */
  weight: number;
  metric: string;
}

export const OUTCOMES: Outcome[] = [
  { id: 'faster-insight', name: 'Cut insight-to-issue time', verb: 'shortens the path from customer signal to a prioritized issue', weight: 1.2, metric: 'Median days from research session to linked issue' },
  { id: 'planning-focus', name: 'Give PMs their week back', verb: 'moves PM time from admin to decisions', weight: 1.15, metric: 'PM hours per week on triage and status reporting' },
  { id: 'ux-quality', name: 'Raise the UX quality bar', verb: 'raises design quality before code is written', weight: 1.1, metric: 'UX debt issues opened per milestone' },
  { id: 'clear-comms', name: 'Communicate direction clearly', verb: 'makes what we ship and why easier to understand', weight: 1.0, metric: 'Release post and direction page freshness' },
  { id: 'fluency', name: 'Close the AI fluency gap', verb: 'gives a lagging team a real entry point into AI', weight: 1.3, metric: 'Share of team members with a weekly AI workflow' },
];

export const OUTCOME_BY_ID = Object.fromEntries(OUTCOMES.map((o) => [o.id, o])) as Record<OutcomeId, Outcome>;

export interface Theme {
  id: ThemeId;
  name: string;
  outcome: OutcomeId;
  color: string;
}

export const THEMES: Theme[] = [
  { id: 'research-ops', name: 'Research ops', outcome: 'faster-insight', color: '#6699CC' },
  { id: 'data-insight', name: 'Data and customer insight', outcome: 'faster-insight', color: '#5843AD' },
  { id: 'triage-planning', name: 'Triage and planning', outcome: 'planning-focus', color: '#1F78D1' },
  { id: 'design-quality', name: 'Design quality', outcome: 'ux-quality', color: '#AD4363' },
  { id: 'release-comms', name: 'Release comms', outcome: 'clear-comms', color: '#CC338B' },
  { id: 'stakeholder-comms', name: 'Stakeholder comms', outcome: 'clear-comms', color: '#8E5BB5' },
  { id: 'docs-content', name: 'Docs and content', outcome: 'clear-comms', color: '#00B140' },
  { id: 'enablement', name: 'AI enablement', outcome: 'fluency', color: '#D99530' },
];

export const THEME_BY_ID = Object.fromEntries(THEMES.map((t) => [t.id, t])) as Record<ThemeId, Theme>;

/** The person running this workspace. */
export const OWNER = { name: 'AI Transformation Owner', short: 'You', handle: '@ai-transformation-owner' };
