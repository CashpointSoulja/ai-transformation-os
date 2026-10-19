import { DESIGN_TEAMS, OUTCOME_BY_ID, ORG_HEADCOUNT, PM_TEAMS, TEAM_BY_ID, THEME_BY_ID, type Outcome, type TeamId, type Theme } from '../data/org';
import { UNMATCHED_WORKFLOW, WORKFLOWS, type Workflow } from '../data/workflows';
import { findPhrase, jaccard, normalize, NUMBER_PATTERN, parseNumber, quoteAround, tokens } from './text';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TriageInput {
  id: string;
  title?: string;
  text: string;
  team: TeamId;
}

/** What the agent knows about the function's existing assets, so it can propose reuse. */
export interface TriageContext {
  skills: { id: string; name: string; version: string; workflows: string[] }[];
  agents: { id: string; name: string; workflow: string; status: string }[];
}

export type Source = 'request' | 'catalog prior' | 'skills library' | 'agent fleet' | 'backlog' | 'org model';

export interface Evidence {
  label: string;
  detail: string;
  source: Source;
  quote?: string;
}

export interface Factor {
  score: number; // 1-5
  evidence: Evidence[];
}

export type Confidence = 'high' | 'medium' | 'low';
export type EffortLabel = 'S' | 'M' | 'L' | 'XL';
export type Tier = 'now' | 'next' | 'later' | 'park';

export interface Triage {
  id: string;
  team: TeamId;
  title: string;
  workflow: Workflow;
  runnerUp?: Workflow;
  matched: { phrase: string; weight: number; quote: string }[];
  matchScore: number;
  confidence: Confidence;
  confidenceReason: string;
  people: number;
  perMonth: number;
  frequencyLabel: string;
  hoursEach: number;
  volume: Factor;
  frequency: Factor;
  pain: Factor & { words: string[] };
  /** volume × frequency × pain, 1-125 */
  raw: number;
  /** raw normalised to 0-100: the "100x potential" score */
  potential: number;
  hoursPerMonth: number;
  hoursReturned: number;
  effort: { level: 1 | 2 | 3 | 4; label: EffortLabel; weeks: string; adjustments: { reason: string; delta: number; source: Source }[] };
  theme: Theme;
  outcome: Outcome;
  reuse: { skill?: TriageContext['skills'][number]; agent?: TriageContext['agents'][number] };
  systems: string[];
  tokens: Set<string>;
  /** Use cases go to the backlog. Bugs, access and platform problems go straight to the Enterprise AI Hub. */
  route: { to: 'backlog' | 'hub'; reason: string; quote?: string };
  /** The request asks the agent to act on its own. */
  autonomous: boolean;
}

export interface Ranked extends Triage {
  related: string[];
  demand: number;
  priority: number;
  rank: number;
  tier: Tier;
  rationale: string;
  trace: TraceStep[];
}

export interface TraceStep {
  key: 'read' | 'workflow' | 'size' | 'effort' | 'theme' | 'rank' | 'rationale';
  title: string;
  result: string;
  evidence: Evidence[];
}

// ─── Lexicons ───────────────────────────────────────────────────────────────

const FREQUENCIES: { re: RegExp; perMonth: number; label: string }[] = [
  { re: /\b(daily|every day|each day|every morning|multiple times a day|several times a day|every single day)\b/, perMonth: 20, label: 'daily' },
  { re: /\b(several times a week|few times a week|twice a week|multiple times a week|three times a week)\b/, perMonth: 10, label: 'several times a week' },
  { re: /\b(weekly|every week|each week|per week|a week|every monday|every friday)\b/, perMonth: 4, label: 'weekly' },
  { re: /\b(biweekly|bi-weekly|every two weeks|every other week|fortnightly|every sprint|each sprint)\b/, perMonth: 2, label: 'every two weeks' },
  { re: /\b(monthly|every month|each month|per month|a month|every release|each release|every milestone|each milestone|release day|monthly release)\b/, perMonth: 1, label: 'monthly' },
  { re: /\b(every (?:six|6) months|twice a year|semi-annually|semiannually)\b/, perMonth: 1 / 6, label: 'twice a year' },
  { re: /\b(quarterly|every quarter|each quarter|per quarter|a quarter)\b/, perMonth: 1 / 3, label: 'quarterly' },
  { re: /\b(yearly|annually|once a year|every year)\b/, perMonth: 1 / 12, label: 'yearly' },
];

const EVENT_FREQUENCY = /\b(every|each) (issue|mr|merge request|study|session|interview|ticket|design|feature|launch|critique|review)\b/;

const PERIOD_FOR_PRIOR: Record<number, { perMonth: number; label: string }> = {
  5: { perMonth: 20, label: 'daily' },
  4: { perMonth: 4, label: 'weekly' },
  3: { perMonth: 1, label: 'monthly' },
  2: { perMonth: 1 / 3, label: 'quarterly' },
  1: { perMonth: 1 / 12, label: 'yearly' },
};

const PAIN_WORDS = [
  'manual', 'manually', 'tedious', 'copy-paste', 'copy and paste', 'copying', 'repetitive', 'error-prone', 'mistakes', 'inconsistent',
  'falls through the cracks', 'fall through the cracks', 'blocked', 'late', 'nobody owns', 'painful', 'frustrating', 'burnout', 'drowning',
  'overwhelmed', 'lose track', 'missed', 'scramble', 'scrambling', 'rework', 'hunting', 'digging', 'chasing', 'slow', 'boring', 'stale', 'outdated', 'by hand',
];

const SYSTEMS: Record<string, string> = {
  figma: 'Figma', dovetail: 'Dovetail', zendesk: 'Zendesk', salesforce: 'Salesforce', gong: 'Gong', slack: 'Slack', 'google drive': 'Google Drive',
  'google docs': 'Google Docs', 'google sheets': 'Google Sheets', tableau: 'Tableau', snowflake: 'Snowflake', qualtrics: 'Qualtrics', calendly: 'Calendly',
  zoom: 'Zoom', highspot: 'Highspot',
};

const SENSITIVE = /\b(customer data|pii|personal data|recordings?|confidential|customer names|contracts?|pricing|salary|legal)\b/;
const AUTONOMOUS = /\b(automatically (post|publish|close|merge|label|update|send|reply)|auto-(close|publish|post|label|reply))\b/;
const GITLAB_NATIVE = /\b(issues?|merge requests?|mrs?|epics?|wiki|labels?|handbook|release post|milestones?|gitlab)\b/;

// Routing rule from the handbook's operating rhythm: use cases come to the ATO;
// bugs, security and platform feedback go straight to the Hub.
const HUB_ISSUE = /\b(is broken|keeps failing|not working|stopped working|error when|throws an error|can't log in|cannot log in|can't access|cannot access|need access|access request|license|licence|seat|sso|permission denied|security incident|data leak|leaked|outage|is down|rate limit)\b/;
const AI_PLATFORM = /\b(glean|duo|relevance|connector|plugin|mcp|ai platform|ai tool|seat|license|licence|sso)\b/;

const EFFORT: Record<1 | 2 | 3 | 4, { label: EffortLabel; weeks: string; weight: number }> = {
  1: { label: 'S', weeks: 'about 1 week', weight: 1 },
  2: { label: 'M', weeks: '2–3 weeks', weight: 1.45 },
  3: { label: 'L', weeks: '4–6 weeks', weight: 2.1 },
  4: { label: 'XL', weeks: '6+ weeks with the AI Engineer', weight: 3 },
};

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const roundHours = (h: number) => (h >= 20 ? Math.round(h / 5) * 5 : Math.max(1, Math.round(h)));

function peopleScore(people: number): number {
  if (people <= 2) return 1;
  if (people <= 7) return 2;
  if (people <= 20) return 3;
  if (people <= 50) return 4;
  return 5;
}

function frequencyScore(perMonth: number): number {
  if (perMonth >= 15) return 5;
  if (perMonth >= 4) return 4;
  if (perMonth >= 0.9) return 3;
  if (perMonth >= 0.3) return 2;
  return 1;
}

function painFromHours(h: number): number {
  if (h >= 8) return 5;
  if (h >= 4) return 4;
  if (h >= 2) return 3;
  if (h >= 1) return 2;
  return 1;
}

// ─── Step 1 · Extract workflow ─────────────────────────────────────────────

function extractWorkflow(norm: string, display: string, team: TeamId) {
  const scored = WORKFLOWS.map((wf) => {
    const matched: Triage['matched'] = [];
    let score = 0;
    for (const [phrase, weight] of Object.entries(wf.keywords)) {
      const idx = findPhrase(norm, phrase);
      if (idx >= 0) {
        score += weight;
        matched.push({ phrase, weight, quote: quoteAround(display, idx, phrase.length) });
      }
    }
    // Tie-breaker: requests usually describe work the submitter's own team does.
    if (score > 0 && wf.teams.includes(team)) score += 0.5;
    return { wf, score, matched };
  }).sort((a, b) => b.score - a.score);

  const top = scored[0];
  const second = scored[1];
  if (!top || top.score < 2) {
    return { workflow: UNMATCHED_WORKFLOW, runnerUp: undefined, matched: top?.matched ?? [], score: top?.score ?? 0, confidence: 'low' as Confidence, margin: 0 };
  }
  const margin = (top.score - (second?.score ?? 0)) / top.score;
  const confidence: Confidence = top.score >= 6 && margin >= 0.35 ? 'high' : top.score >= 3.5 && margin >= 0.15 ? 'medium' : 'low';
  return { workflow: top.wf, runnerUp: second && second.score >= 2 ? second.wf : undefined, matched: top.matched.sort((a, b) => b.weight - a.weight), score: top.score, confidence, margin };
}

// ─── Step 2 · Size the opportunity ──────────────────────────────────────────

// Lets "every PM in Sec" or "all designers in the Core studio" resolve to that sub-team.
const SCOPES: [RegExp, TeamId][] = [
  [/\bcore (devops )?studio\b/, 'studio-core'],
  [/\bsecurity studio\b/, 'studio-security'],
  [/\bai studio\b/, 'studio-ai'],
  [/\bplg (and platform )?studio\b/, 'studio-plg'],
  [/\b(in|across|for|to) (sec|security)( groups| section)?\b/, 'pm-sec'],
  [/\b(in|across|for|to) (dev|plan|create)( groups| section)?\b/, 'pm-dev'],
  [/\b(in|across|for|to) (ci\/cd|cicd|verify|package)( groups| section)?\b/, 'pm-cicd'],
  [/\b(in|across|for|to) the ai section\b/, 'pm-ai'],
  [/\bproduct ops\b/, 'product-ops'],
  [/\b(experience research|research team)\b/, 'exp-research'],
  [/\b(pajamas team|design expression)\b/, 'design-expression'],
];

function sizeVolume(norm: string, display: string, team: TeamId, wf: Workflow): { people: number; factor: Factor } {
  const t = TEAM_BY_ID[team];
  const scoped = SCOPES.find(([re]) => re.test(norm))?.[1];
  const explicit = new RegExp(
    `${NUMBER_PATTERN}\\+?\\s+(?:of us|other |more )?(people|designers|pms|product managers|researchers|writers|technical writers|engineers|team members|teammates|folks|reviewers|tws|product designers)\\b`,
  ).exec(norm);
  if (explicit) {
    const n = parseNumber(explicit[1]) ?? 1;
    const people = Math.max(1, Math.round(n));
    return { people, factor: { score: peopleScore(people), evidence: [{ label: `${people} people`, detail: 'Stated in the request', source: 'request', quote: quoteAround(display, explicit.index, explicit[0].length) }] } };
  }
  const groups: [RegExp, number, string][] = [
    [/\b(everyone in product(?! ops)|whole org|entire org|all of product|across product and design|every team)\b/, ORG_HEADCOUNT, 'the whole Product & Design org'],
    [/\b(every pm|each pm|all pms|every product manager|all product managers|all of the pms)\b/, PM_TEAMS.reduce((n, id) => n + TEAM_BY_ID[id].headcount, 0), 'every PM'],
    [/\b(every designer|each designer|all designers|every product designer|all product designers|every studio)\b/, DESIGN_TEAMS.reduce((n, id) => n + TEAM_BY_ID[id].headcount, 0), 'every product designer'],
    [/\b(every researcher|each researcher|all researchers)\b/, TEAM_BY_ID['exp-research'].headcount, 'every researcher'],
    [/\b(whole team|entire team|all of us|everyone on my team|everyone on the team|our team|the team|everyone)\b/, t.headcount, `the whole ${t.name} team`],
  ];
  for (const [re, all, who] of groups) {
    const m = re.exec(norm);
    const scopedTeam = scoped && who !== 'the whole Product & Design org' ? TEAM_BY_ID[scoped] : null;
    const people = scopedTeam ? scopedTeam.headcount : all;
    if (m && scopedTeam) return { people, factor: { score: peopleScore(people), evidence: [{ label: `${people} people`, detail: `Request says ${who}, scoped to ${scopedTeam.name} (${people} people in the org model)`, source: 'request', quote: quoteAround(display, m.index, m[0].length) }] } };
    if (m) return { people, factor: { score: peopleScore(people), evidence: [{ label: `${people} people`, detail: `Request says ${who} (${people} people in the org model)`, source: 'request', quote: quoteAround(display, m.index, m[0].length) }] } };
  }
  const teams = wf.teams.length ? Array.from(new Set([...wf.teams, team])) : [team];
  const pool = teams.reduce((n, id) => n + TEAM_BY_ID[id].headcount, 0);
  const prior = Math.max(2, Math.round(pool * wf.reach));
  // First-person singular with no "we/our/team": size it for the submitter's corner of the org until others corroborate.
  if (/\b(i|me|my|i'm|i've)\b/.test(norm) && !/\b(we|our|us|ours)\b/.test(norm)) {
    const people = Math.max(1, Math.round(prior * 0.25));
    return { people, factor: { score: peopleScore(people), evidence: [{ label: `~${people} people`, detail: `Written in the first person, so I sized it at a quarter of the usual reach (${prior}) until other requests corroborate it`, source: 'request' }] } };
  }
  const people = prior;
  return {
    people,
    factor: {
      score: peopleScore(people),
      evidence: [{ label: `~${people} people`, detail: `Not stated, so I estimated it: ${Math.round(wf.reach * 100)}% of ${pool} people on teams that do ${wf.name.toLowerCase()}`, source: 'catalog prior' }],
    },
  };
}

function sizeFrequency(norm: string, display: string, wf: Workflow): { perMonth: number; label: string; factor: Factor } {
  let best: { idx: number; perMonth: number; label: string; len: number } | null = null;
  for (const f of FREQUENCIES) {
    const m = f.re.exec(norm);
    if (m && (best === null || m.index < best.idx)) best = { idx: m.index, perMonth: f.perMonth, label: f.label, len: m[0].length };
  }
  if (best) {
    return { perMonth: best.perMonth, label: best.label, factor: { score: frequencyScore(best.perMonth), evidence: [{ label: best.label, detail: 'Stated in the request', source: 'request', quote: quoteAround(display, best.idx, best.len) }] } };
  }
  const prior = PERIOD_FOR_PRIOR[wf.baseFrequency];
  const ev = EVENT_FREQUENCY.exec(norm);
  if (ev) {
    const score = clamp(wf.baseFrequency + 1, 1, 4);
    const p = PERIOD_FOR_PRIOR[score];
    return { perMonth: p.perMonth, label: `per ${ev[2]}`, factor: { score, evidence: [{ label: `per ${ev[2]}`, detail: `Happens on every ${ev[2]}, so one step above the catalog's usual cadence (${prior.label}), capped at weekly`, source: 'request', quote: quoteAround(display, ev.index, ev[0].length) }] } };
  }
  return { perMonth: prior.perMonth, label: prior.label, factor: { score: wf.baseFrequency, evidence: [{ label: prior.label, detail: `Not stated, so I used the catalog's usual cadence for ${wf.name.toLowerCase()}`, source: 'catalog prior' }] } };
}

function sizePain(norm: string, display: string, wf: Workflow, perMonth: number): { hoursEach: number; factor: Factor & { words: string[] } } {
  const evidence: Evidence[] = [];
  let hoursEach: number | null = null;
  const hours = new RegExp(`${NUMBER_PATTERN}(?:\\s*(?:-|–|to)\\s*(\\d+(?:\\.\\d+)?))?\\s*(hours?|hrs?|h)\\b`).exec(norm);
  const days = new RegExp(`${NUMBER_PATTERN}\\s*(?:full\\s+)?(days?)\\b`).exec(norm);
  const mins = /(\d+)\s*(minutes|mins)\b/.exec(norm);
  if (hours) {
    const lo = parseNumber(hours[1]) ?? 1;
    const hi = hours[2] ? parseFloat(hours[2]) : lo;
    hoursEach = (lo + hi) / 2;
    evidence.push({ label: `${hoursEach}h each time`, detail: 'Time cost stated in the request', source: 'request', quote: quoteAround(display, hours.index, hours[0].length) });
  } else if (days) {
    hoursEach = (parseNumber(days[1]) ?? 1) * 6;
    evidence.push({ label: `${hoursEach}h each time`, detail: 'Stated in days; I count 6 focused hours per day', source: 'request', quote: quoteAround(display, days.index, days[0].length) });
  } else if (mins) {
    hoursEach = parseInt(mins[1], 10) / 60;
    evidence.push({ label: `${Math.round(hoursEach * 60)} min each time`, detail: 'Stated in the request', source: 'request', quote: quoteAround(display, mins.index, mins[0].length) });
  }

  const words: string[] = [];
  for (const w of PAIN_WORDS) {
    const idx = findPhrase(norm, w);
    if (idx >= 0 && !words.some((x) => x.includes(w) || w.includes(x))) {
      words.push(w);
      if (words.length <= 3) evidence.push({ label: `"${w}"`, detail: 'Pain signal in the wording', source: 'request', quote: quoteAround(display, idx, w.length) });
    }
  }

  let base: number;
  if (hoursEach !== null) {
    base = painFromHours(hoursEach);
    // Small but constant work hurts too: an hour a day is 20 hours a month per person.
    const monthly = hoursEach * perMonth;
    const burden = monthly >= 16 ? 4 : monthly >= 8 ? 3 : 0;
    if (burden > base) {
      evidence.push({ label: `≈${Math.round(monthly)}h/person/month`, detail: 'Small per occurrence but frequent, so I scored the monthly burden instead', source: 'request' });
      base = burden;
    }
  } else {
    base = wf.basePain;
    hoursEach = wf.hours;
    evidence.unshift({ label: `pain ${wf.basePain}/5`, detail: `No time cost stated, so I used the catalog prior (~${wf.hours}h each time)`, source: 'catalog prior' });
  }
  const bonus = Math.min(1.5, words.length * 0.5);
  const score = clamp(Math.round(base + bonus), 1, 5);
  if (bonus > 0) evidence.push({ label: `+${bonus}`, detail: `${words.length} pain signal${words.length > 1 ? 's' : ''} in the wording`, source: 'request' });
  return { hoursEach, factor: { score, evidence, words } };
}

// ─── Step 3 · Estimate effort ───────────────────────────────────────────────

function estimateEffort(norm: string, wf: Workflow, ctx: TriageContext) {
  const adjustments: Triage['effort']['adjustments'] = [];
  let level = wf === UNMATCHED_WORKFLOW ? 2 : wf.baseComplexity;
  adjustments.push({ reason: wf === UNMATCHED_WORKFLOW ? 'Starting point for an unclassified request' : `Baseline for ${wf.name.toLowerCase()} (${EFFORT[wf.baseComplexity as 1].label})`, delta: 0, source: 'catalog prior' });

  const skill = ctx.skills.find((s) => s.workflows.includes(wf.id));
  const agent = ctx.agents.find((a) => a.workflow === wf.id && a.status !== 'retired');
  if (skill) {
    level -= 1;
    adjustments.push({ reason: `Consume before build: reuses the ${skill.name} skill (v${skill.version}) from the library`, delta: -1, source: 'skills library' });
  }
  if (agent) {
    level -= 0.5;
    adjustments.push({ reason: `Consume before build: extends ${agent.name}, already in the fleet`, delta: -0.5, source: 'agent fleet' });
  }

  const systems = Object.entries(SYSTEMS)
    .filter(([k]) => findPhrase(norm, k) >= 0)
    .map(([, v]) => v);
  if (systems.length) {
    const d = Math.min(1.5, systems.length * 0.5);
    level += d;
    adjustments.push({ reason: `New integration${systems.length > 1 ? 's' : ''}: ${systems.join(', ')}`, delta: d, source: 'request' });
  } else if (GITLAB_NATIVE.test(norm)) {
    adjustments.push({ reason: 'Stays inside GitLab (issues, MRs, handbook), so no new integration', delta: 0, source: 'request' });
  }
  if (SENSITIVE.test(norm)) {
    level += 1;
    adjustments.push({ reason: 'Touches sensitive data, so it needs a data classification review first', delta: 1, source: 'request' });
  }
  if (AUTONOMOUS.test(norm)) {
    level += 1;
    adjustments.push({ reason: 'Asks for Run-level autonomy. Trust is earned Crawl → Walk → Run, so it needs a propose-and-wait phase and an eval first', delta: 1, source: 'request' });
  }
  if (wf === UNMATCHED_WORKFLOW) {
    level += 1;
    adjustments.push({ reason: 'No catalog match, so it needs a discovery conversation first', delta: 1, source: 'catalog prior' });
  }
  const final = clamp(Math.round(level), 1, 4) as 1 | 2 | 3 | 4;
  return { level: final, label: EFFORT[final].label, weeks: EFFORT[final].weeks, adjustments, skill, agent, systems };
}

/** A short title from the first clause, cut on a word boundary. */
export function autoTitle(display: string): string {
  const first = display.split(/(?<=[.!?])\s|[;:,]\s|\s[-–—]\s/)[0].replace(/[.!?]$/, '');
  if (first.length <= 64) return first;
  const cut = first.slice(0, 64);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,]+$/, '')}…`;
}

// ─── Public: triage one request ─────────────────────────────────────────────

export function triage(input: TriageInput, ctx: TriageContext): Triage {
  const display = input.text.replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
  const norm = normalize(input.text);
  const ex = extractWorkflow(norm, display, input.team);
  const wf = ex.workflow;
  const vol = sizeVolume(norm, display, input.team, wf);
  const freq = sizeFrequency(norm, display, wf);
  const pain = sizePain(norm, display, wf, freq.perMonth);
  const effort = estimateEffort(norm, wf, ctx);

  const raw = vol.factor.score * freq.factor.score * pain.factor.score;
  const potential = Math.round((raw / 125) * 100);
  const hoursPerMonth = vol.people * freq.perMonth * pain.hoursEach;

  // Downgrade confidence when nothing was sized from the request itself.
  const stated = [vol.factor, freq.factor, pain.factor].filter((f) => f.evidence.some((e) => e.source === 'request')).length;
  let confidence = ex.confidence;
  let confidenceReason =
    wf === UNMATCHED_WORKFLOW
      ? 'No workflow in the catalog matched strongly'
      : `${ex.matched.length} matching signal${ex.matched.length === 1 ? '' : 's'} for ${wf.name.toLowerCase()}${ex.runnerUp ? `, ahead of ${ex.runnerUp.name.toLowerCase()}` : ''}`;
  if (stated === 0 && confidence !== 'low') {
    confidence = confidence === 'high' ? 'medium' : 'low';
    confidenceReason += '; volume, frequency and pain all came from priors';
  } else {
    confidenceReason += `; ${stated} of 3 size factors stated in the request`;
  }

  const hub = HUB_ISSUE.exec(norm);
  const route: Triage['route'] =
    hub && AI_PLATFORM.test(norm)
      ? { to: 'hub', reason: 'Reads as a platform, access or reliability problem, not a new use case', quote: quoteAround(display, hub.index, hub[0].length) }
      : { to: 'backlog', reason: 'New use case for the function backlog' };

  const theme = THEME_BY_ID[wf.theme];
  const title = input.title?.trim() || autoTitle(display);

  return {
    id: input.id,
    team: input.team,
    title,
    workflow: wf,
    runnerUp: ex.runnerUp,
    matched: ex.matched,
    matchScore: ex.score,
    confidence,
    confidenceReason,
    people: vol.people,
    perMonth: freq.perMonth,
    frequencyLabel: freq.label,
    hoursEach: pain.hoursEach,
    volume: vol.factor,
    frequency: freq.factor,
    pain: pain.factor,
    raw,
    potential,
    hoursPerMonth,
    hoursReturned: hoursPerMonth * wf.automatable,
    effort: { level: effort.level, label: effort.label, weeks: effort.weeks, adjustments: effort.adjustments },
    theme,
    outcome: OUTCOME_BY_ID[theme.outcome],
    reuse: { skill: effort.skill, agent: effort.agent },
    systems: effort.systems,
    tokens: tokens(`${input.title ?? ''} ${input.text}`),
    route,
    autonomous: AUTONOMOUS.test(norm),
  };
}

// ─── Public: rank the backlog ───────────────────────────────────────────────

const CONFIDENCE_FACTOR: Record<Confidence, number> = { high: 1, medium: 0.85, low: 0.6 };
export const TIER_THRESHOLDS = { now: 33, next: 24, later: 13 };

export function priorityOf(t: Triage, relatedCount: number): { priority: number; demand: number } {
  const demand = 1 + 0.08 * Math.min(relatedCount, 3);
  const priority = (t.potential * t.outcome.weight * CONFIDENCE_FACTOR[t.confidence] * demand) / EFFORT[t.effort.level].weight;
  return { priority: Math.round(priority * 10) / 10, demand };
}

export function tierOf(priority: number): Tier {
  if (priority >= TIER_THRESHOLDS.now) return 'now';
  if (priority >= TIER_THRESHOLDS.next) return 'next';
  if (priority >= TIER_THRESHOLDS.later) return 'later';
  return 'park';
}

export function findRelated(item: Triage, others: Triage[]): string[] {
  return others
    .filter((o) => o.id !== item.id)
    .map((o) => {
      const sim = jaccard(item.tokens, o.tokens);
      const sameWf = o.workflow.id === item.workflow.id && item.workflow.id !== 'unmatched';
      return { id: o.id, s: sameWf ? sim + 0.12 : sim };
    })
    .filter((x) => x.s >= 0.2)
    .sort((a, b) => b.s - a.s)
    .slice(0, 4)
    .map((x) => x.id);
}

export function rankBacklog(items: Triage[], pool: Triage[] = items): Ranked[] {
  const scored = items.map((t) => {
    const related = findRelated(t, pool);
    const { priority, demand } = priorityOf(t, related.length);
    return { t, related, priority, demand };
  });
  scored.sort((a, b) => b.priority - a.priority || b.t.potential - a.t.potential || a.t.id.localeCompare(b.t.id));
  return scored.map(({ t, related, priority, demand }, i) => {
    const rank = i + 1;
    const tier = tierOf(priority);
    const rationale = writeRationale(t, rank, tier, related.length);
    return { ...t, related, priority, demand, rank, tier, rationale, trace: buildTrace(t, rank, tier, priority, demand, related, rationale) };
  });
}

// ─── Rationale: two sentences an executive can read ─────────────────────────

const CADENCE: Record<string, string> = {
  daily: 'every day', 'several times a week': 'several times a week', weekly: 'every week', 'every two weeks': 'every two weeks',
  monthly: 'every month', 'twice a year': 'twice a year', quarterly: 'every quarter', yearly: 'once a year',
};

const TEAM_NOUN = (t: Triage) => {
  const ws = t.workflow.teams;
  if (!ws.length) return TEAM_BY_ID[t.team].noun;
  if (ws.length === 1) return TEAM_BY_ID[ws[0]].noun;
  if (ws.every((id) => PM_TEAMS.includes(id))) return 'PMs';
  return 'people';
};

export function writeRationale(t: Triage, rank: number, tier: Tier, relatedCount: number): string {
  const hours = roundHours(t.hoursPerMonth);
  const back = roundHours(t.hoursReturned);
  const who = t.volume.evidence[0]?.source === 'request' ? `${t.people} people` : `about ${t.people} ${TEAM_NOUN(t)}`;
  const cadence = t.frequency.evidence[0]?.source === 'request' ? CADENCE[t.frequencyLabel] ?? t.frequencyLabel : '';
  const painWord = t.pain.words[0];
  const painClause = painWord ? `; the request calls it "${painWord}"` : '';
  const h = (n: number) => `${n} hour${n === 1 ? '' : 's'}`;
  const reuse = t.reuse.skill ? ` by reusing the ${t.reuse.skill.name} skill` : t.reuse.agent ? ` by extending ${t.reuse.agent.name}` : '';
  const effort = `${t.effort.label} effort${t.autonomous ? ', shipped as propose-and-wait before it acts on its own' : ''}`;

  const s1 =
    t.workflow.id === 'unmatched'
      ? `This doesn't match a known Product & Design workflow yet, so I sized it from priors at roughly ${h(hours)} a month across ${who}.`
      : cadence
        ? `${t.workflow.phrase} happens ${cadence} and costs ${who} roughly ${h(hours)} a month${painClause}.`
        : `${t.workflow.phrase} costs ${who} roughly ${h(hours)} a month${painClause}.`;

  let s2: string;
  switch (tier) {
    case 'now':
      s2 = `It ranks #${rank} and belongs in Now: an agent could return about ${back} of those hours and it ${t.outcome.verb}, at ${effort}${reuse}.`;
      break;
    case 'next':
      s2 = `It ranks #${rank} for Next: about ${h(back)} a month back and it ${t.outcome.verb}, but at ${effort}${reuse} it follows the Now items.`;
      break;
    case 'later':
      s2 = `It ranks #${rank} for Later: about ${h(back)} a month back doesn't yet justify ${effort}${reuse}, ${relatedCount >= 2 ? `though ${relatedCount} similar requests show demand building` : 'and requests from more teams would move it up'}.`;
      break;
    default:
      s2 = `I've parked it at #${rank}: about ${h(back)} a month back against ${effort} is one of the weakest trades in the backlog${t.confidence === 'low' ? ', so a 10-minute intake call to size it properly comes first' : ', so I’ll revisit it next quarter'}.`;
  }
  return `${s1} ${s2}`;
}

export function writeHubRationale(t: Triage): string {
  return `This is a platform problem, not a new use case: ${t.route.quote ? `"${t.route.quote.replace(/^…|…$/g, '').trim()}"` : 'it describes something broken or blocked'}. Under the routing rule it goes straight to the Enterprise AI Hub through Compass, and I track the ticket here so the submitter isn't left waiting.`;
}

// ─── Trace: the agent's reasoning, step by step ─────────────────────────────

function buildTrace(t: Triage, rank: number, tier: Tier, priority: number, demand: number, related: string[], rationale: string): TraceStep[] {
  const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
  return [
    {
      key: 'read',
      title: 'Read the request',
      result: `${t.tokens.size} meaningful terms; ${t.systems.length ? `mentions ${t.systems.join(', ')}` : 'no external systems mentioned'}.`,
      evidence: [],
    },
    {
      key: 'workflow',
      title: 'Extract the workflow it touches',
      result: `${t.workflow.name} · ${t.confidence} confidence`,
      evidence: [
        ...t.matched.slice(0, 5).map((m) => ({ label: m.phrase, detail: `keyword weight ${m.weight}`, source: 'request' as Source, quote: m.quote })),
        ...(t.runnerUp ? [{ label: `runner-up: ${t.runnerUp.name}`, detail: 'Considered and ranked lower', source: 'catalog prior' as Source }] : []),
        { label: 'confidence', detail: t.confidenceReason, source: 'catalog prior' as Source },
      ],
    },
    {
      key: 'size',
      title: 'Score the 100x potential',
      result: `volume ${t.volume.score} × frequency ${t.frequency.score} × pain ${t.pain.score} = ${t.raw} / 125 → ${t.potential}`,
      evidence: [
        ...t.volume.evidence.map((e) => ({ ...e, label: `volume ${t.volume.score}/5 · ${e.label}` })),
        ...t.frequency.evidence.map((e) => ({ ...e, label: `frequency ${t.frequency.score}/5 · ${e.label}` })),
        ...t.pain.evidence.map((e, i) => ({ ...e, label: i === 0 ? `pain ${t.pain.score}/5 · ${e.label}` : e.label })),
        { label: `≈ ${roundHours(t.hoursPerMonth)} h/month today`, detail: `${t.people} people × ${fmt(t.perMonth)}/month × ${fmt(t.hoursEach)}h; about ${Math.round(t.workflow.automatable * 100)}% is automatable with a human in the loop`, source: 'org model' },
      ],
    },
    {
      key: 'effort',
      title: 'Estimate effort',
      result: `${t.effort.label} · ${t.effort.weeks}`,
      evidence: t.effort.adjustments.map((a) => ({ label: a.delta === 0 ? '±0' : a.delta > 0 ? `+${a.delta}` : String(a.delta), detail: a.reason, source: a.source })),
    },
    {
      key: 'theme',
      title: 'Group into a theme',
      result: `${t.theme.name} → outcome: ${t.outcome.name}`,
      evidence: [
        { label: `outcome weight ×${t.outcome.weight}`, detail: `Set by the AI Transformation Owner for this half (${t.outcome.metric})`, source: 'org model' },
        ...(related.length ? [{ label: `${related.length} related request${related.length > 1 ? 's' : ''}`, detail: related.map((r) => `#${r}`).join(', '), source: 'backlog' as Source }] : [{ label: 'no close duplicates', detail: 'Nothing in the backlog overlaps strongly', source: 'backlog' as Source }]),
      ],
    },
    {
      key: 'rank',
      title: 'Prioritize against business outcomes',
      result: `#${rank} · tier ${tier} · priority ${priority}`,
      evidence: [
        {
          label: 'priority',
          detail: `potential ${t.potential} × outcome ${t.outcome.weight} × confidence ${CONFIDENCE_FACTOR[t.confidence]} × demand ${demand.toFixed(2)} ÷ effort ${EFFORT[t.effort.level].weight} = ${priority}`,
          source: 'org model',
        },
        { label: 'tier cut-offs', detail: `Now ≥ ${TIER_THRESHOLDS.now} · Next ≥ ${TIER_THRESHOLDS.next} · Later ≥ ${TIER_THRESHOLDS.later} · otherwise park`, source: 'org model' },
      ],
    },
    { key: 'rationale', title: 'Write the rationale', result: rationale, evidence: [] },
  ];
}
