import { describe, expect, it } from 'vitest';
import { AGENTS } from '../data/agents';
import { SKILLS } from '../data/skills';
import { SUBMISSIONS } from '../data/submissions';
import { autoTitle, rankBacklog, triage, type TriageContext } from './engine';

const ctx: TriageContext = {
  skills: SKILLS.map((s) => ({ id: s.id, name: s.name, version: s.version, workflows: s.workflows })),
  agents: AGENTS.map((a) => ({ id: a.id, name: a.name, workflow: a.workflow, status: a.status })),
};
const empty: TriageContext = { skills: [], agents: [] };
const t = (text: string, team: Parameters<typeof triage>[0]['team'] = 'studio-core', c = ctx) => triage({ id: 'T-1', text, team }, c);

describe('workflow extraction', () => {
  it.each([
    ['Synthesis of usability session transcripts into insights takes forever', 'research-synthesis'],
    ['Writing release notes for every monthly release is a scramble', 'release-notes'],
    ['We have 400 untriaged issues and triage eats an hour a day', 'issue-triage'],
    ['Design critique feedback gets lost after every design review', 'design-critique'],
    ['Our direction pages and roadmap updates for stakeholders are stale', 'roadmap-comms'],
    ['Coding open-ended survey verbatims from the NPS survey', 'survey-analysis'],
    ['UX Scorecard write-ups take a day each', 'ux-scorecards'],
  ])('%s → %s', (text, wf) => {
    expect(t(text).workflow.id).toBe(wf);
  });

  it('says so instead of guessing when nothing matches', () => {
    const r = t('Could AI help plan our team offsite?');
    expect(r.workflow.id).toBe('unmatched');
    expect(r.confidence).toBe('low');
  });

  it('keeps a quote for every matched keyword', () => {
    const r = t('Research synthesis of interview transcripts is manual');
    expect(r.matched.length).toBeGreaterThan(1);
    r.matched.forEach((m) => expect(m.quote.toLowerCase()).toContain(m.phrase));
  });
});

describe('100x potential (volume × frequency × pain)', () => {
  it('reads explicit people, cadence and hours from the request', () => {
    const r = t('12 designers spend 3 hours every week preparing critique notes', 'studio-core');
    expect(r.people).toBe(12);
    expect(r.volume.score).toBe(3);
    expect(r.frequencyLabel).toBe('weekly');
    expect(r.frequency.score).toBe(4);
    expect(r.hoursEach).toBe(3);
    expect(r.raw).toBe(r.volume.score * r.frequency.score * r.pain.score);
    expect(r.potential).toBe(Math.round((r.raw / 125) * 100));
  });

  it('scopes "every PM" to the section the request names', () => {
    const r = t('Every PM in Sec spends an hour daily on triage', 'pm-sec');
    expect(r.people).toBe(11);
  });

  it('sizes first-person requests conservatively until others corroborate', () => {
    const solo = t('I write a weekly status update from issues and it takes 90 minutes', 'studio-plg');
    const team = t('We write a weekly status update from issues and it takes 90 minutes', 'studio-plg');
    expect(solo.people).toBeLessThan(team.people);
    expect(solo.volume.evidence[0].detail).toMatch(/first person/);
  });

  it('falls back to labelled catalog priors when nothing is stated', () => {
    const r = t('Release notes are annoying');
    expect(r.volume.evidence[0].source).toBe('catalog prior');
    expect(r.frequency.evidence[0].source).toBe('catalog prior');
  });

  it('scores small but constant work by its monthly burden', () => {
    const r = t('Every PM in Dev spends about an hour daily triaging incoming issues', 'pm-dev');
    expect(r.hoursEach).toBe(1);
    expect(r.pain.score).toBeGreaterThanOrEqual(4);
  });

  it('turns pain words into evidence', () => {
    const r = t('Copying research notes into Dovetail is manual and tedious');
    expect(r.pain.words).toEqual(expect.arrayContaining(['manual', 'tedious']));
  });
});

describe('effort and consume-before-build', () => {
  it('is lower when a skill and an agent already exist', () => {
    const text = 'Synthesis of interview transcripts into insights takes each researcher 2 days per study';
    const withLib = t(text, 'exp-research', ctx);
    const without = t(text, 'exp-research', empty);
    expect(withLib.effort.level).toBeLessThan(without.effort.level);
    expect(withLib.reuse.skill?.id).toBe('research-synthesis');
    expect(withLib.reuse.agent?.id).toBe('research-synthesizer');
    expect(withLib.effort.adjustments.some((a) => a.reason.startsWith('Consume before build'))).toBe(true);
  });

  it('adds effort for new integrations and sensitive data', () => {
    const r = t('Pull customer feedback from Zendesk and Gong including customer names into a weekly digest', 'pm-ai');
    expect(r.systems).toEqual(expect.arrayContaining(['Zendesk', 'Gong']));
    expect(r.effort.label).toBe('XL');
  });

  it('adds effort for Run-level autonomy and says so in the rationale', () => {
    const r = t('Automatically close duplicate feature requests in the issue tracker daily', 'pm-cicd');
    expect(r.autonomous).toBe(true);
    const [ranked] = rankBacklog([r]);
    expect(ranked.rationale).toMatch(/propose-and-wait/);
  });
});

describe('routing', () => {
  it('sends platform problems to the Enterprise AI Hub', () => {
    expect(t('Duo Chat keeps failing with an error when I ask about MRs').route.to).toBe('hub');
    expect(t('I need access to Duo Agent Platform, requested a license seat').route.to).toBe('hub');
  });
  it('keeps use cases on the backlog even when they mention agents', () => {
    expect(t('There used to be an agent for competitor tracking but it stopped working and nobody owns it').route.to).toBe('backlog');
  });
});

describe('ranking and rationale', () => {
  const all = SUBMISSIONS.map((s) => triage({ id: s.id, title: s.title, text: s.text, team: s.team }, ctx));
  const open = all.filter((x, i) => x.route.to === 'backlog' && !['shared', 'wont-do'].includes(SUBMISSIONS[i].status));
  const ranked = rankBacklog(open, all);

  it('ranks every open seed request with consecutive ranks', () => {
    expect(ranked.length).toBeGreaterThanOrEqual(25);
    expect(ranked.map((r) => r.rank)).toEqual(ranked.map((_, i) => i + 1));
  });

  it('sorts by priority, descending', () => {
    for (let i = 1; i < ranked.length; i++) expect(ranked[i - 1].priority).toBeGreaterThanOrEqual(ranked[i].priority);
  });

  it('uses every tier on the seed backlog', () => {
    expect(new Set(ranked.map((r) => r.tier))).toEqual(new Set(['now', 'next', 'later', 'park']));
  });

  it('writes exactly two sentences, with the rank, for every item', () => {
    for (const r of ranked) {
      const sentences = r.rationale.split(/(?<=[.!?])\s+(?=[A-Z])/);
      expect(sentences, r.rationale).toHaveLength(2);
      expect(r.rationale).toContain(`#${r.rank}`);
    }
  });

  it('shows seven reasoning steps per item', () => {
    for (const r of ranked) expect(r.trace.map((s) => s.key)).toEqual(['read', 'workflow', 'size', 'effort', 'theme', 'rank', 'rationale']);
  });

  it('links related requests in both directions of the same workflow', () => {
    const triageItems = ranked.filter((r) => r.workflow.id === 'issue-triage');
    expect(triageItems.some((r) => r.related.length > 0)).toBe(true);
  });

  it('is deterministic', () => {
    const again = rankBacklog(open, all);
    expect(again.map((r) => [r.id, r.priority])).toEqual(ranked.map((r) => [r.id, r.priority]));
  });
});

describe('autoTitle', () => {
  it('cuts long first clauses on a word boundary', () => {
    const s = autoTitle('Every release I spend about three hours copying issue descriptions into release notes and cutting them down.');
    expect(s.length).toBeLessThanOrEqual(65);
    expect(s.endsWith('…')).toBe(true);
  });
  it('keeps short first sentences intact', () => {
    expect(autoTitle('Direction pages are stale. Nobody owns them.')).toBe('Direction pages are stale');
  });
});
