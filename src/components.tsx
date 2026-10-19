import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from './icons';
import { STATUS_LABEL, type Status } from './data/submissions';
import { THEME_BY_ID, type ThemeId } from './data/org';
import type { Evidence, Ranked, Tier, TraceStep } from './triage/engine';
import type { Health, EvalStatus } from './data/agents';
import tanuki from './assets/tanuki.svg';

export { tanuki };

// ─── Labels ────────────────────────────────────────────────────────────────

function textOn(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 160 ? '#18171d' : '#fff';
}

export function ScopedLabel({ k, v, color, title }: { k: string; v?: string; color: string; title?: string }) {
  return (
    <span className={`gl-label${v ? '' : ' plain'}`} style={{ ['--label-color' as string]: color, ['--label-text' as string]: textOn(color) }} title={title}>
      <span className="k">{k}</span>
      {v && <span className="v">{v}</span>}
    </span>
  );
}

export const TIER_COLOR: Record<Tier, string> = { now: '#E24329', next: '#FC6D26', later: '#7759C2', park: '#74717A' };
export const TIER_NAME: Record<Tier, string> = { now: 'Now', next: 'Next', later: 'Later', park: 'Park' };
export const EFFORT_COLOR = '#330066';

export const TierLabel = ({ tier }: { tier: Tier }) => <ScopedLabel k="tier" v={tier} color={TIER_COLOR[tier]} />;
export const ThemeLabel = ({ theme }: { theme: ThemeId }) => <ScopedLabel k="theme" v={theme} color={THEME_BY_ID[theme].color} title={THEME_BY_ID[theme].name} />;
export const EffortLabel = ({ e }: { e: string }) => <ScopedLabel k="effort" v={e} color={EFFORT_COLOR} />;

export function StatusPill({ status }: { status: Status | 'hub' }) {
  return (
    <span className={`status s-${status}`}>
      <span className="dot" aria-hidden />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function HealthBadge({ health }: { health: Health }) {
  const map: Record<Health, [string, string, string]> = {
    healthy: ['badge-success', 'status-success', 'Healthy'],
    degraded: ['badge-warning', 'warning', 'Degraded'],
    failing: ['badge-danger', 'status-failed', 'Failing'],
    paused: ['badge-neutral', 'status-paused', 'Paused'],
  };
  const [c, i, l] = map[health];
  return (
    <span className={`badge ${c}`}>
      <Icon name={i} size={12} />
      {l}
    </span>
  );
}

export function EvalBadge({ status, score }: { status: EvalStatus; score?: number }) {
  const map: Record<EvalStatus, [string, string]> = {
    passing: ['badge-success', `Passing${score ? ` · ${score}%` : ''}`],
    failing: ['badge-danger', `Failing${score ? ` · ${score}%` : ''}`],
    stale: ['badge-warning', `Stale${score ? ` · ${score}%` : ''}`],
    none: ['badge-danger', 'No eval'],
  };
  const [c, l] = map[status];
  return <span className={`badge ${c}`}>{l}</span>;
}

// ─── Avatar ────────────────────────────────────────────────────────────────

const AVATAR_BG = ['#7759C2', '#2F7DB0', '#B04E2F', '#3F8768', '#9E5B9E', '#5B6FB0', '#A06A1F', '#4D7B8C'];

export function Avatar({ name, size }: { name: string | null; size?: 'lg' }) {
  if (!name) return <span className={`avatar empty ${size ?? ''}`} title="No owner">?</span>;
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const initials = name.split(/\s+/).map((p) => p[0]).slice(0, 2).join('');
  return (
    <span className={`avatar ${size ?? ''}`} style={{ background: AVATAR_BG[h % AVATAR_BG.length] }} aria-hidden>
      {initials}
    </span>
  );
}

export const Person = ({ name, sub }: { name: string; sub?: string }) => (
  <span className="person">
    <Avatar name={name} />
    <span>
      <span className="strong">{name}</span>
      {sub && <span className="cell-sub" style={{ display: 'block' }}>{sub}</span>}
    </span>
  </span>
);

// ─── Score ─────────────────────────────────────────────────────────────────

export function Score({ value, label = '100x potential' }: { value: number; label?: string }) {
  return (
    <span className="score" title={`${label}: ${value} / 100`}>
      <span className="meter" aria-hidden>
        <span style={{ width: `${value}%` }} />
      </span>
      <span className="num">{value}</span>
    </span>
  );
}

export function Spark({ data, label }: { data: number[]; label: string }) {
  const max = Math.max(1, ...data);
  return (
    <span className="spark" role="img" aria-label={label} title={label}>
      {data.map((d, i) => (
        <span key={i} className={d === 0 ? 'zero' : ''} style={{ height: `${Math.max(8, (d / max) * 100)}%` }} />
      ))}
    </span>
  );
}

// ─── Page chrome ───────────────────────────────────────────────────────────

export function Breadcrumb({ items }: { items: string[] }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <img src={tanuki} alt="" />
      <a href="#/">Product &amp; Design</a>
      <span className="sep">/</span>
      <a href="#/">AI Transformation</a>
      {items.map((it, i) => (
        <span key={it} style={{ display: 'contents' }}>
          <span className="sep">/</span>
          <span className={i === items.length - 1 ? 'here' : ''}>{it}</span>
        </span>
      ))}
    </nav>
  );
}

export function PageHead({ title, sub, actions }: { title: string; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {actions && <div className="actions">{actions}</div>}
    </div>
  );
}

export function Drawer({ open, onClose, title, kicker, children, actions }: { open: boolean; onClose: () => void; title: ReactNode; kicker?: ReactNode; children: ReactNode; actions?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    ref.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : 'Details'} tabIndex={-1} ref={ref}>
        <div className="drawer-head">
          <div style={{ minWidth: 0 }}>
            {kicker && <div className="subtle" style={{ fontSize: 12 }}>{kicker}</div>}
            <h2>{title}</h2>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {actions}
            <button className="btn btn-tertiary btn-icon" onClick={onClose} aria-label="Close">
              <Icon name="close" />
            </button>
          </div>
        </div>
        <div className="drawer-body">{children}</div>
      </aside>
    </>
  );
}

export function Toast({ message, onDone }: { message: string | null; onDone: () => void }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [message, onDone]);
  return message ? <div className="toast" role="status">{message}</div> : null;
}

// ─── Triage reasoning ──────────────────────────────────────────────────────

const SOURCE_LABEL: Record<Evidence['source'], string> = {
  request: 'from the request',
  'catalog prior': 'catalog prior',
  'skills library': 'skills library',
  'agent fleet': 'agent fleet',
  backlog: 'backlog',
  'org model': 'org model',
};

function EvidenceList({ items }: { items: Evidence[] }) {
  if (!items.length) return null;
  return (
    <div className="evidence">
      {items.map((e, i) => (
        <div className="ev" key={i}>
          <span className="ev-label">{e.label}</span>
          <span className="ev-detail">
            {e.detail}
            <span className="ev-source">· {SOURCE_LABEL[e.source]}</span>
          </span>
          {e.quote && <span className="ev-quote">“{e.quote}”</span>}
        </div>
      ))}
    </div>
  );
}

/**
 * The triage agent's visible reasoning. With `animate`, steps reveal one at a
 * time so a viewer can follow the thinking. Reduced-motion users see them all at once.
 */
export function Trace({ steps, animate = false, onDone }: { steps: TraceStep[]; animate?: boolean; onDone?: () => void }) {
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [shown, setShown] = useState(animate && !reduce ? 0 : steps.length);
  const list = useRef<HTMLOListElement>(null);
  useEffect(() => {
    if (!animate || reduce || shown === 0) return;
    const el = list.current?.querySelector<HTMLElement>(`[data-index="${Math.min(shown, steps.length - 1)}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [shown, animate, reduce, steps.length]);
  useEffect(() => {
    if (!animate || reduce) {
      onDone?.();
      return;
    }
    setShown(0);
    let i = 0;
    const tick = () => {
      i += 1;
      setShown(i);
      if (i < steps.length) timer = window.setTimeout(tick, i === 1 ? 500 : 750);
      else onDone?.();
    };
    let timer = window.setTimeout(tick, 400);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate, steps]);

  return (
    <ol className="trace" aria-live="polite" ref={list}>
      {steps.map((s, i) => {
        const state = i < shown ? 'done' : i === shown ? 'active' : 'pending';
        return (
          <li key={s.key} className={`trace-step ${state}`} data-step={s.key} data-index={i}>
            <span className="marker">{state === 'done' ? <Icon name="check" size={12} /> : i + 1}</span>
            <div className="trace-title">{s.title}</div>
            {state === 'done' && (
              <>
                {s.key === 'rationale' ? (
                  <div className="rationale-box">{s.result}</div>
                ) : (
                  <div className={`trace-result${s.key === 'size' || s.key === 'rank' ? ' formula' : ''}`}>{s.result}</div>
                )}
                <EvidenceList items={s.evidence} />
              </>
            )}
            {state === 'active' && <div className="trace-result subtle">Working…</div>}
          </li>
        );
      })}
    </ol>
  );
}

export function FactorGrid({ r }: { r: Ranked }) {
  return (
    <div className="factor-grid">
      <div className="factor"><div className="n">{r.volume.score}</div><div className="l">Volume · {r.people} people</div></div>
      <div className="factor"><div className="n">{r.frequency.score}</div><div className="l">Frequency · {r.frequencyLabel}</div></div>
      <div className="factor"><div className="n">{r.pain.score}</div><div className="l">Pain · ~{Math.round(r.hoursEach * 10) / 10}h each</div></div>
      <div className="factor total"><div className="n">{r.potential}</div><div className="l">100x potential</div></div>
    </div>
  );
}

export const AgentByline = ({ children }: { children?: ReactNode }) => (
  <div className="agent-head">
    <span className="agent-avatar"><Icon name="tanuki-ai" size={14} /></span>
    Triage agent
    {children}
  </div>
);
