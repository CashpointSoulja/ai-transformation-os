import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AGENTS, type Agent } from './data/agents';
import type { TeamId } from './data/org';
import { SKILLS } from './data/skills';
import { SUBMISSIONS, type Status, type Submission } from './data/submissions';
import { rankBacklog, triage, writeHubRationale, type Ranked, type Triage, type TriageContext } from './triage/engine';

const KEY = 'aitos:v1';

interface Persisted {
  added: Submission[];
  owners: Record<string, string>;
  reactions: Record<string, boolean>;
}

const EMPTY: Persisted = { added: [], owners: {}, reactions: {} };

function load(): Persisted {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const p = JSON.parse(raw) as Partial<Persisted>;
    return { added: p.added ?? [], owners: p.owners ?? {}, reactions: p.reactions ?? {} };
  } catch {
    return EMPTY;
  }
}

export interface Entry {
  sub: Submission;
  triage: Triage;
  ranked?: Ranked;
  /** Effective status, including routing to the Hub. */
  status: Status | 'hub';
  rationale: string;
}

interface Store {
  entries: Entry[];
  byId: Record<string, Entry>;
  backlog: Ranked[];
  agents: Agent[];
  ctx: TriageContext;
  reactions: Record<string, boolean>;
  submit: (s: { title?: string; text: string; team: TeamId; submitter: string }) => string;
  assignOwner: (agentId: string, owner: string) => void;
  toggleReaction: (demoId: string) => void;
  reset: () => void;
  addedCount: number;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* private mode: keep working in memory */
    }
  }, [state]);

  const agents = useMemo(() => AGENTS.map((a) => (state.owners[a.id] ? { ...a, owner: state.owners[a.id] } : a)), [state.owners]);

  const ctx = useMemo<TriageContext>(
    () => ({
      skills: SKILLS.filter((s) => s.status !== 'deprecated').map((s) => ({ id: s.id, name: s.name, version: s.version, workflows: s.workflows })),
      agents: agents.map((a) => ({ id: a.id, name: a.name, workflow: a.workflow, status: a.status })),
    }),
    [agents],
  );

  const derived = useMemo(() => {
    const subs = [...state.added, ...SUBMISSIONS];
    const triaged = subs.map((sub) => ({ sub, t: triage({ id: sub.id, title: sub.title, text: sub.text, team: sub.team }, ctx) }));
    const open = triaged.filter(({ sub, t }) => t.route.to === 'backlog' && sub.status !== 'shared' && sub.status !== 'wont-do');
    const backlog = rankBacklog(
      open.map((x) => x.t),
      triaged.map((x) => x.t),
    );
    const rankedById = Object.fromEntries(backlog.map((r) => [r.id, r]));
    const entries: Entry[] = triaged.map(({ sub, t }) => {
      const ranked = rankedById[sub.id];
      const hub = t.route.to === 'hub';
      return {
        sub,
        triage: t,
        ranked,
        status: hub ? 'hub' : sub.status,
        rationale: ranked?.rationale ?? (hub ? writeHubRationale(t) : sub.note ?? ''),
      };
    });
    return { entries, backlog, byId: Object.fromEntries(entries.map((e) => [e.sub.id, e])) };
  }, [state.added, ctx]);

  const submit = useCallback<Store['submit']>(
    (s) => {
      const max = Math.max(128, ...state.added.map((a) => parseInt(a.id.slice(3), 10)));
      const id = `AI-${max + 1}`;
      const sub: Submission = { id, title: s.title?.trim() ?? '', text: s.text.trim(), team: s.team, submitter: s.submitter.trim() || 'You', daysAgo: 0, at: Date.now(), status: 'triaged' };
      setState((prev) => ({ ...prev, added: [sub, ...prev.added] }));
      return id;
    },
    [state.added],
  );

  const value: Store = {
    ...derived,
    agents,
    ctx,
    reactions: state.reactions,
    addedCount: state.added.length,
    submit,
    assignOwner: (agentId, owner) => setState((p) => ({ ...p, owners: { ...p.owners, [agentId]: owner } })),
    toggleReaction: (id) => setState((p) => ({ ...p, reactions: { ...p.reactions, [id]: !p.reactions[id] } })),
    reset: () => setState(EMPTY),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore outside provider');
  return s;
}

/** Predicts the next id without committing, so the intake page can show it while the agent runs. */
export function nextId(entries: Entry[]): string {
  const max = Math.max(128, ...entries.map((e) => parseInt(e.sub.id.slice(3), 10)));
  return `AI-${max + 1}`;
}

// ─── Router ────────────────────────────────────────────────────────────────

export function useRoute(): { path: string[]; query: URLSearchParams } {
  const parse = () => {
    const h = window.location.hash.replace(/^#\/?/, '');
    const [p, q] = h.split('?');
    return { path: p ? p.split('/').filter(Boolean) : [], query: new URLSearchParams(q ?? '') };
  };
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const on = () => setRoute(parse());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export const go = (path: string) => {
  window.location.hash = path.startsWith('#') ? path : `#${path}`;
};

// ─── Time ──────────────────────────────────────────────────────────────────

export function ago(days: number): string {
  if (days < 1 / 24) return 'just now';
  if (days < 1) {
    const h = Math.max(1, Math.round(days * 24));
    return `${h} hour${h === 1 ? '' : 's'} ago`;
  }
  const d = Math.round(days);
  if (d === 1) return 'yesterday';
  if (d < 30) return `${d} days ago`;
  const m = Math.round(d / 30);
  return `${m} month${m === 1 ? '' : 's'} ago`;
}

export function hoursAgo(h: number): string {
  return ago(h / 24);
}
