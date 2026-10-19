import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../icons';
import { AgentByline, Avatar, Breadcrumb, Drawer, EffortLabel, FactorGrid, PageHead, Score, StatusPill, ThemeLabel, TierLabel, Trace, TIER_COLOR, TIER_NAME, ScopedLabel } from '../components';
import { ago, go, useRoute, useStore, type Entry } from '../store';
import { TEAMS, TEAM_BY_ID, THEMES, type TeamId, type ThemeId } from '../data/org';
import { daysSince } from '../data/submissions';
import type { Tier } from '../triage/engine';

type Tab = 'list' | 'board' | 'themes' | 'hub' | 'closed';
const TIERS: Tier[] = ['now', 'next', 'later', 'park'];
const TIER_SUB: Record<Tier, string> = {
  now: 'Scouting or delivering this milestone',
  next: 'Queued for the AI Engineer after Now',
  later: 'Worth doing; waiting on demand or capacity',
  park: 'Revisit next quarter or size properly first',
};

function Row({ e, highlight }: { e: Entry; highlight?: boolean }) {
  const r = e.ranked!;
  return (
    <div className={`list-row${highlight ? ' highlight' : ''}`} id={`row-${r.id}`} onClick={() => go(`/backlog/${r.id}`)} role="link" tabIndex={0} onKeyDown={(ev) => ev.key === 'Enter' && go(`/backlog/${r.id}`)}>
      <span className="rank">#{r.rank}</span>
      <div style={{ minWidth: 0 }}>
        <div className="row-title">
          <Icon name="work-item-issue" />
          <span>{r.title}</span>
        </div>
        <div className="row-meta">
          <span className="mono">#{r.id}</span>·<span>{TEAM_BY_ID[e.sub.team].name}</span>·<span>{e.sub.submitter}</span>·<span>{ago(daysSince(e.sub))}</span>
          {r.confidence === 'low' && <span className="badge badge-warning">needs an intake call</span>}
          {r.related.length > 0 && (
            <span title={r.related.map((x) => `#${x}`).join(', ')}>
              · <Icon name="git-merge" size={12} /> {r.related.length} related
            </span>
          )}
        </div>
        <p className="row-rationale">{r.rationale}</p>
        <div className="labels">
          <TierLabel tier={r.tier} />
          <ThemeLabel theme={r.theme.id} />
          <EffortLabel e={r.effort.label} />
          <ScopedLabel k="team" v={e.sub.team} color="#F0AD4E" />
          {r.reuse.skill && <ScopedLabel k="reuse" v={r.reuse.skill.name} color="#0B645A" />}
        </div>
      </div>
      <div className="row-side">
        <Score value={r.potential} />
        <StatusPill status={e.status} />
        <span className="updated">priority {r.priority}</span>
      </div>
    </div>
  );
}

function Detail({ e, onClose }: { e: Entry; onClose: () => void }) {
  const { byId } = useStore();
  const r = e.ranked;
  return (
    <Drawer
      open
      onClose={onClose}
      kicker={<span className="mono">#{e.sub.id} · {TEAM_BY_ID[e.sub.team].name}</span>}
      title={e.triage.title}
    >
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
        <StatusPill status={e.status} />
        {r && (
          <>
            <TierLabel tier={r.tier} />
            <ThemeLabel theme={r.theme.id} />
            <EffortLabel e={r.effort.label} />
            <span className="badge badge-muted">rank #{r.rank}</span>
          </>
        )}
      </div>

      <h3>The request</h3>
      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        <Avatar name={e.sub.submitter} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12 }} className="subtle">
            <b className="strong">{e.sub.submitter}</b> · {ago(daysSince(e.sub))}
          </div>
          <p style={{ margin: '4px 0 0', whiteSpace: 'pre-wrap' }}>{e.sub.text}</p>
        </div>
      </div>

      {r ? (
        <>
          <h3>Executive rationale</h3>
          <div className="rationale-box">{r.rationale}</div>
          <div style={{ margin: '14px 0 18px' }}>
            <FactorGrid r={r} />
          </div>
          <AgentByline>
            <span className="subtle" style={{ fontWeight: 400 }}>· how it got here</span>
          </AgentByline>
          <Trace steps={r.trace} />
          {r.related.length > 0 && (
            <>
              <h3 style={{ marginTop: 8 }}>Related requests</h3>
              {r.related.map((id) => (
                <a key={id} href={`#/backlog/${id}`} style={{ display: 'flex', gap: 8, padding: '6px 0', alignItems: 'center' }}>
                  <span className="mono subtle">#{id}</span>
                  <span>{byId[id]?.triage.title}</span>
                  {byId[id] && <StatusPill status={byId[id].status} />}
                </a>
              ))}
            </>
          )}
          <p className="provenance">
            Written by the triage agent from the workflow catalog, the org model, the skills library and the fleet. Every number above traces to the request or a named prior. I review the call before it's committed.
          </p>
        </>
      ) : (
        <>
          <h3>{e.status === 'hub' ? 'Routing' : e.status === 'shared' ? 'Outcome' : 'Decision'}</h3>
          <div className={`alert ${e.status === 'hub' ? 'alert-tier' : e.status === 'shared' ? 'alert-info' : 'alert-warning'}`}>
            <Icon name={e.status === 'hub' ? 'share' : e.status === 'shared' ? 'rocket' : 'information-o'} />
            <div className="alert-body">
              {e.status === 'shared' ? (
                <>
                  Shipped. It's live as an agent in the fleet:{' '}
                  <a href={`#/fleet/${e.sub.agent}`}>{e.sub.agent}</a>. It's on the demo wall and in the skills library for every team to reuse.
                </>
              ) : (
                e.rationale
              )}
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <AgentByline>
              <span className="subtle" style={{ fontWeight: 400 }}>· first-pass read</span>
            </AgentByline>
            <dl className="kv" style={{ marginTop: 8 }}>
              <dt>Workflow</dt><dd>{e.triage.workflow.name}</dd>
              <dt>Theme</dt><dd>{e.triage.theme.name}</dd>
              <dt>100x potential</dt><dd>{e.triage.potential}</dd>
            </dl>
          </div>
        </>
      )}
    </Drawer>
  );
}

export default function Backlog() {
  const { entries, byId, backlog } = useStore();
  const { path, query } = useRoute();
  const [tab, setTab] = useState<Tab>((query.get('tab') as Tab) || 'list');
  const [q, setQ] = useState('');
  const [team, setTeam] = useState<TeamId | ''>('');
  const [theme, setTheme] = useState<ThemeId | ''>('');
  const [tier, setTier] = useState<Tier | ''>('');
  const status = query.get('status');
  const focus = query.get('focus');
  const openId = path[1];

  useEffect(() => {
    const t = query.get('tab') as Tab | null;
    if (t) setTab(t);
  }, [query]);

  useEffect(() => {
    if (focus) setTimeout(() => document.getElementById(`row-${focus}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120);
  }, [focus]);

  const ranked = useMemo(
    () =>
      backlog
        .map((r) => byId[r.id])
        .filter((e) => {
          const r = e.ranked!;
          if (team && e.sub.team !== team) return false;
          if (theme && r.theme.id !== theme) return false;
          if (tier && r.tier !== tier) return false;
          if (status && e.status !== status) return false;
          if (q && !`${r.id} ${r.title} ${e.sub.text} ${e.sub.submitter}`.toLowerCase().includes(q.toLowerCase())) return false;
          return true;
        }),
    [backlog, byId, team, theme, tier, q, status],
  );
  const hub = entries.filter((e) => e.status === 'hub');
  const closed = entries.filter((e) => e.status === 'shared' || e.status === 'wont-do');

  const setTabUrl = (t: Tab) => {
    setTab(t);
    go(t === 'list' ? '/backlog' : `/backlog?tab=${t}`);
  };

  return (
    <>
      <Breadcrumb items={['Triage backlog']} />
      <PageHead
        title="Triage backlog"
        sub="Every open request, ranked by the triage agent: 100x potential (volume × frequency × pain), weighted by this half's outcomes, discounted by effort and confidence."
        actions={
          <>
            <a className="btn btn-default" href="https://handbook.gitlab.com/handbook/eta/ai/strategy/hub-and-spoke/" target="_blank" rel="noreferrer">
              Routing rules <Icon name="external-link" size={12} />
            </a>
            <a className="btn btn-confirm" href="#/intake">
              <Icon name="plus" />
              New request
            </a>
          </>
        }
      />

      <div className="tabs" role="tablist">
        <button className="tab" role="tab" aria-selected={tab === 'list'} onClick={() => setTabUrl('list')}>
          <Icon name="list-bulleted" />Prioritized <span className="count">{backlog.length}</span>
        </button>
        <button className="tab" role="tab" aria-selected={tab === 'board'} onClick={() => setTabUrl('board')}>
          <Icon name="labels" />Board by tier
        </button>
        <button className="tab" role="tab" aria-selected={tab === 'themes'} onClick={() => setTabUrl('themes')}>
          <Icon name="file-tree" />Themes <span className="count">{new Set(backlog.map((r) => r.theme.id)).size}</span>
        </button>
        <button className="tab" role="tab" aria-selected={tab === 'hub'} onClick={() => setTabUrl('hub')}>
          <Icon name="share" />Routed to Hub <span className="count">{hub.length}</span>
        </button>
        <button className="tab" role="tab" aria-selected={tab === 'closed'} onClick={() => setTabUrl('closed')}>
          <Icon name="check-circle-filled" />Shipped and declined <span className="count">{closed.length}</span>
        </button>
      </div>

      {(tab === 'list' || tab === 'board') && (
        <div className="filterbar">
          <div className="search">
            <Icon name="filter" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter requests" aria-label="Filter requests" />
          </div>
          <select className="select" value={team} onChange={(e) => setTeam(e.target.value as TeamId | '')} aria-label="Sub-team">
            <option value="">All sub-teams</option>
            {TEAMS.map((t) => <option key={t.id} value={t.id}>{t.short}</option>)}
          </select>
          <select className="select" value={theme} onChange={(e) => setTheme(e.target.value as ThemeId | '')} aria-label="Theme">
            <option value="">All themes</option>
            {THEMES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          {tab === 'list' && (
            <select className="select" value={tier} onChange={(e) => setTier(e.target.value as Tier | '')} aria-label="Tier">
              <option value="">All tiers</option>
              {TIERS.map((t) => <option key={t} value={t}>{TIER_NAME[t]}</option>)}
            </select>
          )}
          {status && (
            <button className="btn btn-default btn-sm" onClick={() => go('/backlog')}>
              Status: {status} <Icon name="close" size={12} />
            </button>
          )}
        </div>
      )}

      {tab === 'list' && (
        <>
          <div className="count-line">{ranked.length} requests · sorted by priority</div>
          <div className="list">
            {ranked.map((e) => <Row key={e.sub.id} e={e} highlight={focus === e.sub.id} />)}
            {!ranked.length && <div className="empty">No requests match these filters.</div>}
          </div>
        </>
      )}

      {tab === 'board' && (
        <div className="board">
          {TIERS.map((t) => {
            const items = ranked.filter((e) => e.ranked!.tier === t);
            return (
              <div className="board-col" key={t} style={{ ['--col-color' as string]: TIER_COLOR[t] }}>
                <div className="board-col-head">
                  <TierLabel tier={t} />
                  <span className="meta"><span><Icon name="work-item-issue" size={12} /> {items.length}</span><span>{Math.round(items.reduce((n, e) => n + e.ranked!.hoursReturned, 0))}h/mo</span></span>
                </div>
                <div className="board-col-sub">{TIER_SUB[t]}</div>
                <div className="board-cards">
                  {items.map((e) => (
                    <button className="card" key={e.sub.id} onClick={() => go(`/backlog/${e.sub.id}`)}>
                      <div className="t">{e.ranked!.title}</div>
                      <div className="labels">
                        <ThemeLabel theme={e.ranked!.theme.id} />
                        <EffortLabel e={e.ranked!.effort.label} />
                      </div>
                      <div className="m">
                        <span className="mono">#{e.sub.id} · rank {e.ranked!.rank}</span>
                        <Score value={e.ranked!.potential} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'themes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {THEMES.map((th) => {
            const items = backlog.filter((r) => r.theme.id === th.id);
            if (!items.length) return null;
            const hours = items.reduce((n, r) => n + r.hoursReturned, 0);
            return (
              <div className="box" key={th.id}>
                <div className="box-head">
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <ThemeLabel theme={th.id} />
                    <span className="strong" style={{ fontWeight: 600 }}>{th.name}</span>
                    <span className="subtle" style={{ fontSize: 13 }}>→ {items[0].outcome.name}</span>
                  </div>
                  <span className="subtle" style={{ fontSize: 13 }}>{items.length} requests · ~{Math.round(hours)} h/month back</span>
                </div>
                {items.map((r) => (
                  <a key={r.id} href={`#/backlog/${r.id}`} style={{ display: 'grid', gridTemplateColumns: '44px 1fr auto auto', gap: 10, padding: '8px 0', borderTop: '1px solid var(--border-subtle)', color: 'inherit', textDecoration: 'none', alignItems: 'center' }}>
                    <span className="rank">#{r.rank}</span>
                    <span>{r.title} <span className="subtle mono" style={{ fontSize: 12 }}>· {r.workflow.name}</span></span>
                    <TierLabel tier={r.tier} />
                    <Score value={r.potential} />
                  </a>
                ))}
              </div>
            );
          })}
          <p className="subtle" style={{ fontSize: 13 }}>Themes come from the workflow catalog. Each theme rolls up to one outcome, which is how a request gets weighed against business goals.</p>
        </div>
      )}

      {tab === 'hub' && (
        <>
          <div className="alert alert-tier">
            <Icon name="share" />
            <div className="alert-body">
              <div className="alert-title">Platform problems skip the use-case queue</div>
              Use cases come to the ATO. Bugs, access requests and security or platform feedback go straight to the Enterprise AI Hub through Compass. The triage agent spots them on intake, and I keep them visible here until the Hub closes the loop.
            </div>
          </div>
          <div className="list">
            {hub.map((e) => (
              <div className="list-row" key={e.sub.id} onClick={() => go(`/backlog/${e.sub.id}`)}>
                <span className="rank"><Icon name="share" /></span>
                <div>
                  <div className="row-title">{e.triage.title}</div>
                  <div className="row-meta"><span className="mono">#{e.sub.id}</span>· {TEAM_BY_ID[e.sub.team].name} · {e.sub.submitter} · {ago(daysSince(e.sub))}</div>
                  <p className="row-rationale">{e.rationale}</p>
                </div>
                <div className="row-side"><StatusPill status="hub" /></div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'closed' && (
        <div className="list">
          {closed.map((e) => (
            <div className="list-row" key={e.sub.id} onClick={() => go(`/backlog/${e.sub.id}`)}>
              <span className="rank"><Icon name={e.status === 'shared' ? 'rocket' : 'close'} /></span>
              <div>
                <div className="row-title">{e.triage.title}</div>
                <div className="row-meta"><span className="mono">#{e.sub.id}</span>· {TEAM_BY_ID[e.sub.team].name} · {e.sub.submitter} · {ago(daysSince(e.sub))}</div>
                {e.status === 'wont-do' ? <p className="row-rationale">{e.sub.note}</p> : <p className="row-rationale">Live in the fleet as <a href={`#/fleet/${e.sub.agent}`} onClick={(ev) => ev.stopPropagation()}>{e.sub.agent}</a>.</p>}
              </div>
              <div className="row-side"><StatusPill status={e.status} /></div>
            </div>
          ))}
        </div>
      )}

      {openId && byId[openId] && <Detail e={byId[openId]} onClose={() => go(tab === 'list' ? '/backlog' : `/backlog?tab=${tab}`)} />}
    </>
  );
}
