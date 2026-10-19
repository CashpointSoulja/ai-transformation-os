import { Icon } from '../icons';
import { Avatar, Breadcrumb, PageHead } from '../components';
import { ago, useStore } from '../store';
import { TEAMS, TEAM_BY_ID, ORG_HEADCOUNT, type Group } from '../data/org';
import { ADOPTION, ADOPTION_TARGET, BUILDER_HINT, BUILDER_LEVELS, CHAMPIONS, DEMOS, RITUALS, VACANT, type Ritual } from '../data/champions';

const ANCHOR = Date.UTC(2026, 9, 6); // a Tuesday: the first Champion sync of the fortnightly cycle
const DAY = 86_400_000;

function nextOccurrence(r: Ritual, now = new Date()): Date {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  if (r.rule.kind === 'weekly') {
    const { day, every, offsetWeeks = 0 } = r.rule;
    for (let d = 0; d < 21; d++) {
      const t = today + d * DAY;
      const dt = new Date(t);
      if (dt.getUTCDay() !== day) continue;
      const weeks = Math.round((t - ANCHOR) / (7 * DAY));
      if ((weeks - offsetWeeks) % every === 0) return dt;
    }
  }
  if (r.rule.kind === 'last-weekday') {
    const { day } = r.rule;
    for (let m = 0; m < 2; m++) {
      const last = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + m + 1, 0));
      while (last.getUTCDay() !== day) last.setUTCDate(last.getUTCDate() - 1);
      if (last.getTime() >= today) return last;
    }
  }
  // FY27-Q4 starts 2026-11-01; the QBR sits in the kickoff week.
  return new Date(Date.UTC(2026, 10, 3));
}

const fmtDate = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
const GROUPS: Group[] = ['Product Management', 'Upstream Studios', 'Product Operations'];

export default function Champions() {
  const { toggleReaction, reactions, agents } = useStore();
  const weekly = Math.round(TEAMS.reduce((n, t) => n + ADOPTION[t.id].weekly * t.headcount, 0) / ORG_HEADCOUNT);
  const below = TEAMS.filter((t) => ADOPTION[t.id].weekly < ADOPTION_TARGET);
  const spectrumTotal = BUILDER_LEVELS.map((_, i) => TEAMS.reduce((n, t) => n + ADOPTION[t.id].spectrum[i], 0));
  const sorted = [...TEAMS].sort((a, b) => ADOPTION[b.id].weekly - ADOPTION[a.id].weekly);

  return (
    <>
      <Breadcrumb items={['Champions']} />
      <PageHead
        title="Champion hub"
        sub="One Champion per sub-team, at 5–10% of their time agreed with their manager. They qualify use cases, pilot agents and coach teammates. They don't report to me. This page is where the adoption gap shows up, and where it closes."
      />

      <div className="tiles">
        <div className="tile"><div className="label"><Icon name="group" />Coverage</div><div className="value">{CHAMPIONS.length}/{TEAMS.length}</div><div className="foot">{VACANT.length} sub-teams without a Champion</div></div>
        <div className="tile"><div className="label"><Icon name="chart" />Weekly AI use</div><div className="value">{weekly}%</div><div className="foot">{below.length} sub-teams below the {ADOPTION_TARGET}% target</div></div>
        <div className="tile"><div className="label"><Icon name="bulb" />Raised by Champions</div><div className="value">{CHAMPIONS.reduce((n, c) => n + c.raised, 0)}</div><div className="foot">use cases this half</div></div>
        <div className="tile"><div className="label"><Icon name="rocket" />Shipped via Champions</div><div className="value">{CHAMPIONS.reduce((n, c) => n + c.shipped, 0)}</div><div className="foot">now in the fleet</div></div>
      </div>

      <h2 className="section">Sync cadence</h2>
      <div className="cadence">
        {RITUALS.map((r) => (
          <div className="ritual" key={r.name}>
            <div className="when">{r.cadence} · {r.length}</div>
            <div className="name">{r.name}</div>
            <div style={{ fontSize: 13 }}>{r.purpose}</div>
            <div className="cell-sub" style={{ marginTop: 4 }}>{r.who}</div>
            <div className="next">Next: {fmtDate(nextOccurrence(r))} · {r.time}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginTop: 28 }}>
        <div className="box">
          <div className="box-head">
            <h3>Builder spectrum by sub-team</h3>
            <span className="subtle" style={{ fontSize: 12 }}>self-assessed · 3 weeks ago</span>
          </div>
          <div className="legend">
            {BUILDER_LEVELS.map((l, i) => (
              <span key={l} title={BUILDER_HINT[l]}><i className={`l${i + 1}`} />{l} ({spectrumTotal[i]})</span>
            ))}
          </div>
          {sorted.map((t) => {
            const a = ADOPTION[t.id];
            const total = a.spectrum.reduce((x, y) => x + y, 0);
            return (
              <div key={t.id} className="hbar" style={{ gridTemplateColumns: '150px 1fr 44px' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.short}</span>
                <span className="stack" role="img" aria-label={`${t.name}: ${BUILDER_LEVELS.map((l, i) => `${a.spectrum[i]} ${l}`).join(', ')}`}>
                  {a.spectrum.map((n, i) =>
                    n ? <span key={i} className={`l${i + 1}`} style={{ width: `${(n / total) * 100}%` }} title={`${BUILDER_LEVELS[i]}: ${n} of ${total}`} /> : null,
                  )}
                </span>
                <span className="val" title="Weekly AI use">{a.weekly}%</span>
              </div>
            );
          })}
          <p className="subtle" style={{ fontSize: 12, margin: '10px 0 0' }}>
            Consumer → Configurer → Builder → Contributor. The right-hand number is weekly AI use. The bottom rows are where Champions and office hours go first.
          </p>
        </div>
        <div className="box">
          <div className="box-head">
            <h3>Where I'm spending coaching time</h3>
          </div>
          {sorted.slice(-4).reverse().map((t) => {
            const champ = CHAMPIONS.find((c) => c.team === t.id);
            const vac = VACANT.find((v) => v.team === t.id);
            const req = t.id === 'studio-plg' ? 'AI-114 asks for a starter prompt library. It sits in Now on the backlog.' : t.id === 'pm-cicd' ? 'Next step: pair the Champion with the PM AI Champion for a release-note drafter rollout.' : t.id === 'product-ops' ? 'Product Ops owns 2 agents and has no Champion, which is an accountability risk.' : 'Next step: a design review pre-read pilot for conversational flows (AI-123).';
            return (
              <div key={t.id} style={{ borderTop: '1px solid var(--border-subtle)', padding: '10px 0', display: 'flex', gap: 10 }}>
                {champ ? <Avatar name={champ.name} /> : <Avatar name={null} />}
                <div style={{ fontSize: 13 }}>
                  <div className="strong" style={{ fontWeight: 600 }}>{t.name} · {ADOPTION[t.id].weekly}% weekly</div>
                  <div className="subtle">{champ ? `Champion: ${champ.name} (${champ.level})` : `No Champion${vac?.nominee ? `. Nominee: ${vac.nominee}` : ''}`}</div>
                  <div style={{ marginTop: 2 }}>{req}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <h2 className="section">Roster</h2>
      {GROUPS.map((g) => {
        const teams = TEAMS.filter((t) => t.group === g);
        return (
          <div key={g} style={{ marginBottom: 18 }}>
            <div className="subtle" style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{g}</div>
            <div className="roster">
              {teams.map((t) => {
                const c = CHAMPIONS.find((x) => x.team === t.id);
                const v = VACANT.find((x) => x.team === t.id);
                if (!c)
                  return (
                    <div className="champ vacant" key={t.id}>
                      <div className="champ-top">
                        <Avatar name={null} size="lg" />
                        <div>
                          <div className="champ-name" style={{ color: 'var(--red-700)' }}>No Champion</div>
                          <div className="champ-team">{t.name} · {t.headcount} people</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 13 }}>{v?.note}</div>
                      {v?.nominee && <div className="cell-sub">Nominee: <b className="strong">{v.nominee}</b>, waiting on manager sign-off</div>}
                    </div>
                  );
                const owns = agents.filter((a) => a.owner === c.name).length;
                return (
                  <div className="champ" key={t.id}>
                    <div className="champ-top">
                      <Avatar name={c.name} size="lg" />
                      <div style={{ minWidth: 0 }}>
                        <div className="champ-name">{c.name}</div>
                        <div className="champ-team">{c.role}</div>
                        <div className="champ-team">{t.name}</div>
                      </div>
                    </div>
                    <div className="labels">
                      <span className="badge badge-tier" title={BUILDER_HINT[c.level]}>{c.level}</span>
                      <span className="badge badge-muted">{c.timePct}% time</span>
                      {c.lastSyncDays > 14 ? <span className="badge badge-warning">missed last sync</span> : <span className="badge badge-success">synced {ago(c.lastSyncDays)}</span>}
                    </div>
                    <div className="champ-stats">
                      <span><b>{c.raised}</b> raised</span>
                      <span><b>{c.shipped}</b> shipped</span>
                      <span><b>{owns}</b> agents owned</span>
                      <span><b>{c.monthsActive}</b> mo</span>
                    </div>
                    {c.backup && <div className="cell-sub">Backup: {c.backup}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <h2 className="section">Demo wall <span className="subtle" style={{ fontSize: 13, fontWeight: 400 }}>· what teams shipped, from the monthly Champion demo</span></h2>
      <div className="wall">
        {DEMOS.map((d) => {
          const on = !!reactions[d.id];
          return (
            <article className="demo" key={d.id}>
              <div className="demo-thumb">
                <span className="play" aria-hidden><Icon name="play" /></span>
                <span className="cell-sub" style={{ color: '#D1D0D3' }}>{TEAM_BY_ID[d.team].short}</span>
                <div>
                  <div className="metric">{d.metric}</div>
                  <div className="metric-l">{d.metricLabel}</div>
                </div>
              </div>
              <div className="demo-body">
                <div className="t">{d.title}</div>
                <div className="d">{d.summary}</div>
                <div className="labels">
                  {d.agent && <a className="badge badge-tier" href={`#/fleet/${d.agent}`}><Icon name="tanuki-ai" size={12} />{agents.find((a) => a.id === d.agent)?.name}</a>}
                  {d.skill && <a className="badge badge-muted" href={`#/skills/${d.skill}`}><Icon name="book" size={12} />{d.skill}</a>}
                </div>
              </div>
              <div className="demo-foot">
                <span className="person"><Avatar name={d.presenter} />{d.presenter} · {ago(d.daysAgo)}</span>
                <button className="react" aria-pressed={on} onClick={() => toggleReaction(d.id)} aria-label={`Thumbs up ${d.title}`}>
                  <Icon name="thumb-up" size={12} /> {d.reactions + (on ? 1 : 0)}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
