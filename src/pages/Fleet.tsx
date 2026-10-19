import { useState } from 'react';
import { Icon } from '../icons';
import { Avatar, Breadcrumb, Drawer, EvalBadge, HealthBadge, PageHead, Spark, Toast } from '../components';
import { go, hoursAgo, useRoute, useStore } from '../store';
import { TEAMS, TEAM_BY_ID } from '../data/org';
import { WORKFLOW_BY_ID } from '../data/workflows';
import { CHAMPIONS } from '../data/champions';
import type { Agent, Kpi } from '../data/agents';

type Filter = 'all' | 'attention' | 'unowned';

const needsAttention = (a: Agent) => !a.owner || a.health === 'failing' || a.health === 'degraded' || a.eval.status === 'failing' || a.eval.status === 'none' || a.eval.status === 'stale';

const AUTONOMY: Record<Agent['autonomy'], string> = { crawl: 'Crawl: suggests', walk: 'Walk: drafts, human triggers', run: 'Run: acts on its own' };

const unit = (u: string) => (u === '%' || u.startsWith('/') ? u : u ? ` ${u}` : '');

function kpiOk(k: Kpi) {
  return k.better === 'up' ? k.current >= k.target : k.current <= k.target;
}

function KpiLine({ k }: { k: Kpi }) {
  const ok = kpiOk(k);
  return (
    <div style={{ fontSize: 13, display: 'flex', gap: 6, alignItems: 'baseline' }}>
      <span style={{ color: ok ? 'var(--green-500)' : 'var(--orange-500)' }}>
        <Icon name={ok ? 'check-circle-filled' : 'warning'} size={12} />
      </span>
      <span>
        {k.name}: <b className="strong">{k.current}{unit(k.unit)}</b>
        <span className="subtle"> / {k.better === 'up' ? '≥' : '≤'}{k.target}{k.unit === '%' ? '%' : ''}</span>
      </span>
    </div>
  );
}

function OwnerPicker({ agent, onPick }: { agent: Agent; onPick: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const team = TEAM_BY_ID[agent.ownerTeam];
  const candidates = [
    ...CHAMPIONS.filter((c) => c.team === agent.ownerTeam).map((c) => ({ name: c.name, why: 'Champion for this sub-team' })),
    { name: team.lead, why: `Leads ${team.short}` },
    ...CHAMPIONS.filter((c) => c.team !== agent.ownerTeam && c.level === 'Contributor').map((c) => ({ name: c.name, why: `Contributor-level Champion, ${TEAM_BY_ID[c.team].short}` })),
  ];
  return (
    <span className="rel" onClick={(e) => e.stopPropagation()}>
      <button className="btn btn-default btn-sm" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}>
        <Icon name="assignee" size={12} />
        Assign owner
      </button>
      {open && (
        <div className="menu" role="menu">
          {candidates.map((c) => (
            <button key={c.name} role="menuitem" onClick={() => { onPick(c.name); setOpen(false); }}>
              <Avatar name={c.name} />
              <span>
                <span className="strong" style={{ display: 'block' }}>{c.name}</span>
                <span className="cell-sub">{c.why}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </span>
  );
}

function Detail({ a, onClose, onAssign }: { a: Agent; onClose: () => void; onAssign: (n: string) => void }) {
  const { entries } = useStore();
  const origin = a.createdFrom ? entries.find((e) => e.sub.id === a.createdFrom) : undefined;
  return (
    <Drawer open onClose={onClose} kicker={<span className="mono">{a.type} · {a.platform} · v{a.version}</span>} title={a.name}>
      {!a.owner && (
        <div className="alert alert-danger">
          <Icon name="warning" />
          <div className="alert-body">
            <div className="alert-title">No owner. You're accountable until someone is.</div>
            {a.orphanReason}
            <div className="alert-actions"><OwnerPicker agent={a} onPick={onAssign} /></div>
          </div>
        </div>
      )}
      <p style={{ marginTop: 0 }}>{a.description}</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <HealthBadge health={a.health} />
        <EvalBadge status={a.eval.status} score={a.eval.score} />
        <span className="badge badge-tier">{AUTONOMY[a.autonomy]}</span>
        <span className="badge badge-muted">{a.visibility}</span>
        <span className="badge badge-muted">{a.status}</span>
      </div>

      <h3>Accountability</h3>
      <dl className="kv" style={{ marginBottom: 18 }}>
        <dt>Owner</dt><dd>{a.owner ? <span className="person"><Avatar name={a.owner} />{a.owner}</span> : <span style={{ color: 'var(--red-700)', fontWeight: 600 }}>Unowned</span>}</dd>
        <dt>Sub-team</dt><dd>{TEAM_BY_ID[a.ownerTeam].name}</dd>
        <dt>Workflow</dt><dd>{WORKFLOW_BY_ID[a.workflow]?.name ?? a.workflow}</dd>
        <dt>Skill</dt><dd>{a.skill ? <a href={`#/skills/${a.skill.split('@')[0]}`} className="mono">{a.skill}</a> : <span className="subtle">None. Its instructions aren't in the library yet</span>}</dd>
        <dt>Trigger</dt><dd>{a.trigger}</dd>
        <dt>Permission</dt><dd>{a.permission}</dd>
        {origin && (<><dt>Came from</dt><dd><a href={`#/backlog/${origin.sub.id}`}>#{origin.sub.id} {origin.triage.title}</a></dd></>)}
      </dl>

      <h3>KPIs</h3>
      <div style={{ marginBottom: 18 }}>
        {a.kpis.map((k) => {
          const pct = Math.min(100, (k.better === 'up' ? k.current / k.target : k.target / Math.max(k.current, 0.01)) * 100);
          return (
            <div key={k.name} style={{ marginBottom: 10 }}>
              <KpiLine k={k} />
              <div className="meter lg" style={{ marginTop: 4 }}><span style={{ width: `${pct}%`, background: kpiOk(k) ? 'var(--green-500)' : 'var(--orange-500)' }} /></div>
            </div>
          );
        })}
      </div>

      <h3>Eval harness</h3>
      <p style={{ marginTop: 0 }}>
        {a.eval.status === 'none'
          ? 'No eval harness. Before it can move past Crawl, it needs a test set and a pass bar agreed with the AI Engineer.'
          : `${a.eval.cases} cases, scored ${a.eval.score}% on the last run ${a.eval.daysAgo} days ago.${a.eval.status === 'stale' ? ' Older than 30 days, so re-run it before trusting the score.' : ''}${a.eval.status === 'failing' ? ' Below the pass bar.' : ''}`}
      </p>

      <h3>Last 14 days</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 6 }}>
        <Spark data={a.history} label={`Successful runs per day for ${a.name}`} />
        <span className="subtle" style={{ fontSize: 13 }}>{a.runs7d} run{a.runs7d === 1 ? '' : 's'} in 7 days · {a.successRate}% success · last run {hoursAgo(a.lastRunHoursAgo)}</span>
      </div>
      {a.healthNote && <p className="subtle" style={{ fontSize: 13 }}>{a.healthNote}</p>}
    </Drawer>
  );
}

export default function Fleet() {
  const { agents, assignOwner } = useStore();
  const { path, query } = useRoute();
  const [filter, setFilter] = useState<Filter>((query.get('filter') as Filter) || 'all');
  const [toast, setToast] = useState<string | null>(null);
  const unowned = agents.filter((a) => !a.owner);
  const shown = agents.filter((a) => (filter === 'unowned' ? !a.owner : filter === 'attention' ? needsAttention(a) : true));
  const open = path[1] ? agents.find((a) => a.id === path[1]) : undefined;
  const assign = (a: Agent, name: string) => {
    assignOwner(a.id, name);
    setToast(`${name} now owns ${a.name}`);
  };

  return (
    <>
      <Breadcrumb items={['Agent fleet']} />
      <PageHead
        title="Agent fleet"
        sub="Every agent and flow working in Product & Design, with its owner, KPIs, eval and run health. If an agent has no owner, it's mine until it does."
      />

      {unowned.length > 0 && (
        <div className="alert alert-danger">
          <Icon name="warning" />
          <div className="alert-body">
            <div className="alert-title">{unowned.length} agent{unowned.length > 1 ? 's have' : ' has'} no owner. You're accountable for them.</div>
            {unowned.map((a) => a.name).join(', ')}. Assign an owner from the sub-team, or retire the agent.
            <div className="alert-actions">
              <button className="btn btn-default btn-sm" onClick={() => setFilter('unowned')}>Show unowned</button>
            </div>
          </div>
        </div>
      )}

      <div className="tiles">
        <div className="tile"><div className="label">In the fleet</div><div className="value">{agents.length}</div><div className="foot">{agents.filter((a) => a.status === 'production').length} production · {agents.filter((a) => a.status === 'pilot').length} pilot</div></div>
        <div className="tile"><div className="label">Healthy last run</div><div className="value">{agents.filter((a) => a.health === 'healthy').length}</div><div className="foot">{agents.filter((a) => a.health === 'failing').length} failing · {agents.filter((a) => a.health === 'degraded').length} degraded</div></div>
        <div className="tile"><div className="label">Evals passing</div><div className="value">{agents.filter((a) => a.eval.status === 'passing').length}</div><div className="foot">{agents.filter((a) => a.eval.status === 'none').length} with no eval harness</div></div>
        <div className="tile"><div className="label">Runs, last 7 days</div><div className="value">{agents.reduce((n, a) => n + a.runs7d, 0)}</div><div className="foot">across {TEAMS.filter((t) => agents.some((a) => a.ownerTeam === t.id)).length} sub-teams</div></div>
      </div>

      <div className="tabs" role="tablist" style={{ marginTop: 16 }}>
        <button className="tab" role="tab" aria-selected={filter === 'all'} onClick={() => setFilter('all')}>All <span className="count">{agents.length}</span></button>
        <button className="tab" role="tab" aria-selected={filter === 'attention'} onClick={() => setFilter('attention')}>Needs attention <span className="count">{agents.filter(needsAttention).length}</span></button>
        <button className="tab" role="tab" aria-selected={filter === 'unowned'} onClick={() => setFilter('unowned')}>Unowned <span className="count">{unowned.length}</span></button>
      </div>

      <div className="table-wrap">
        <table className="gl-table">
          <thead>
            <tr>
              <th>Agent</th>
              <th>Owner</th>
              <th className="hide-sm">KPIs</th>
              <th>Eval</th>
              <th>Last run</th>
              <th className="hide-sm">Autonomy</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((a) => (
              <tr key={a.id} className={!a.owner ? 'flagged' : ''} onClick={() => go(`/fleet/${a.id}`)}>
                <td>
                  <div className="cell-title" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <Icon name={a.type === 'flow' ? 'flow-ai' : 'tanuki-ai'} />
                    {a.name}
                  </div>
                  <div className="cell-sub mono">{a.type} · {a.platform} · v{a.version}</div>
                  <div className="cell-sub">{WORKFLOW_BY_ID[a.workflow]?.name}</div>
                </td>
                <td>
                  {a.owner ? (
                    <span className="person"><Avatar name={a.owner} /><span><span className="strong">{a.owner}</span><span className="cell-sub" style={{ display: 'block' }}>{TEAM_BY_ID[a.ownerTeam].short}</span></span></span>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
                      <span className="badge badge-danger"><Icon name="warning" size={12} />Unowned</span>
                      <OwnerPicker agent={a} onPick={(n) => assign(a, n)} />
                    </div>
                  )}
                </td>
                <td className="hide-sm" style={{ minWidth: 240 }}>{a.kpis.map((k) => <KpiLine key={k.name} k={k} />)}</td>
                <td><EvalBadge status={a.eval.status} score={a.eval.score} />{a.eval.daysAgo !== undefined && <div className="cell-sub">{a.eval.daysAgo}d ago</div>}</td>
                <td>
                  <HealthBadge health={a.health} />
                  <div style={{ marginTop: 6 }}><Spark data={a.history} label={`Runs per day for ${a.name}`} /></div>
                  <div className="cell-sub">{hoursAgo(a.lastRunHoursAgo)}</div>
                </td>
                <td className="hide-sm"><span className="cell-sub">{AUTONOMY[a.autonomy]}</span><div className="cell-sub">{a.permission}</div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="subtle" style={{ fontSize: 12, marginTop: 10 }}>
        Fields follow GitLab's AI Catalog model (type, version, visibility, trigger), plus what the owner is accountable for. Autonomy follows Crawl → Walk → Run. Agents earn the next level through eval results.
      </p>

      {open && <Detail a={open} onClose={() => go('/fleet')} onAssign={(n) => assign(open, n)} />}
      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  );
}
