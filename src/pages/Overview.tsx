import { Icon } from '../icons';
import { Avatar, Score, ThemeLabel, TierLabel } from '../components';
import { useStore } from '../store';
import { ORG_HEADCOUNT, OUTCOMES, TEAMS, TEAM_BY_ID } from '../data/org';
import { ADOPTION, ADOPTION_TARGET, CHAMPIONS, VACANT } from '../data/champions';

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(Math.round(n)));

function Statement() {
  return (
    <section className="statement" aria-labelledby="statement-title">
      <span className="eyebrow">AI Transformation Owner · Product &amp; Design</span>
      <h1 id="statement-title">The intake, triage, fleet and adoption system, built for the job.</h1>
      <div className="statement-parts">
        <div className="statement-part">
          <div className="n">01 · the problem</div>
          <p>
            I read the AI Transformation Owner job description. Your issue is <em>uneven AI adoption</em>: scattered requests with no intake route, agents without owners, priorities
            churning. Your own playbook says some teams find value fast and others never find an entry point.
          </p>
        </div>
        <div className="statement-part">
          <div className="n">02 · the proof</div>
          <p>
            I've solved this before: at Corgi I ran product ops and built the internal systems the team worked from; before that I founded my own company and built its whole operating
            system with AI agents.
          </p>
        </div>
        <div className="statement-part">
          <div className="n">03 · the build</div>
          <p>
            This is what I built for you: the intake, triage, fleet and adoption system the AI Transformation Owner runs, <em>working, today</em>.
          </p>
        </div>
      </div>
      <div className="statement-foot">
        <a className="btn btn-light" href="#/intake">
          <Icon name="paper-airplane" />
          Submit a request and watch it triaged
        </a>
        <a className="btn btn-ghost" href="#/backlog">
          Open the backlog
        </a>
        <span className="live">Live in your browser · no sign-in</span>
      </div>
    </section>
  );
}

export default function Overview() {
  const { entries, backlog, agents } = useStore();
  const count = (s: string) => entries.filter((e) => e.status === s).length;
  const now = backlog.filter((r) => r.tier === 'now');
  const hoursNow = now.reduce((n, r) => n + r.hoursReturned, 0);
  const unowned = agents.filter((a) => !a.owner);
  const evalOk = agents.filter((a) => a.eval.status === 'passing').length;
  const weekly = Math.round(TEAMS.reduce((n, t) => n + ADOPTION[t.id].weekly * t.headcount, 0) / ORG_HEADCOUNT);
  const sorted = [...TEAMS].sort((a, b) => ADOPTION[b.id].weekly - ADOPTION[a.id].weekly);

  const attention: { icon: string; tone: string; text: React.ReactNode; href: string }[] = [
    ...unowned.map((a) => ({ icon: 'warning', tone: 'var(--red-500)', text: <><b>{a.name}</b> has no owner. {a.orphanReason}</>, href: `#/fleet/${a.id}` })),
    ...agents
      .filter((a) => a.owner && (a.health === 'failing' || a.eval.status === 'failing'))
      .map((a) => ({ icon: 'status-failed', tone: 'var(--red-500)', text: <><b>{a.name}</b>: eval failing ({a.eval.score}%). {a.healthNote}</>, href: `#/fleet/${a.id}` })),
    ...agents
      .filter((a) => a.owner && a.eval.status === 'stale')
      .map((a) => ({ icon: 'clock', tone: 'var(--orange-500)', text: <><b>{a.name}</b>: eval last run {a.eval.daysAgo} days ago. Re-run before the next release.</>, href: `#/fleet/${a.id}` })),
    ...VACANT.map((v) => ({ icon: 'users', tone: 'var(--orange-500)', text: <><b>{TEAM_BY_ID[v.team].name}</b> has no Champion. {v.note}</>, href: '#/champions' })),
  ];

  return (
    <>
      <Statement />
      <p className="sample-line">Sample data: a {ORG_HEADCOUNT}-person Product &amp; Design org, seeded for the end of FY27-Q3.</p>

      <h2 className="section">Where every request is</h2>
      <div className="pipeline" aria-label="Raise, triage, scout, deliver, share">
        <a className="pipe-step" href="#/intake"><div className="k">Raise</div><div className="v">{entries.length}</div><div className="d">requests via Champions and intake</div></a>
        <a className="pipe-step" href="#/backlog"><div className="k">Triage</div><div className="v">{backlog.length}</div><div className="d">ranked against outcomes</div></a>
        <a className="pipe-step" href="#/backlog?status=scouting"><div className="k">Scout</div><div className="v">{count('scouting')}</div><div className="d">AI Engineer prototyping</div></a>
        <a className="pipe-step" href="#/backlog?status=delivering"><div className="k">Deliver</div><div className="v">{count('delivering')}</div><div className="d">being built</div></a>
        <a className="pipe-step" href="#/champions"><div className="k">Share</div><div className="v">{count('shared')}</div><div className="d">shipped, on the demo wall</div></a>
      </div>
      <p className="subtle" style={{ fontSize: 12, margin: '0 0 16px' }}>
        {count('hub')} platform problems routed straight to the Enterprise AI Hub · {count('wont-do')} declined with a reason
      </p>

      <div className="tiles">
        <a className="tile" href="#/backlog">
          <div className="label"><Icon name="hourglass" />Hours a month on the table</div>
          <div className="value">{fmt(hoursNow)}</div>
          <div className="foot">if the {now.length} Now items ship</div>
        </a>
        <a className="tile danger" href="#/fleet?filter=unowned">
          <div className="label"><Icon name="warning" />Agents with no owner</div>
          <div className="value">{unowned.length}</div>
          <div className="foot">of {agents.length} in the fleet. You're accountable</div>
        </a>
        <a className="tile" href="#/fleet">
          <div className="label"><Icon name="check-circle-filled" />Evals passing</div>
          <div className="value">{evalOk}/{agents.length}</div>
          <div className="foot">{agents.filter((a) => a.eval.status === 'none').length} agents have no eval harness</div>
        </a>
        <a className="tile" href="#/champions">
          <div className="label"><Icon name="users" />Weekly AI use</div>
          <div className="value">{weekly}%</div>
          <div className="foot">target {ADOPTION_TARGET}% · range {ADOPTION[sorted[sorted.length - 1].id].weekly}–{ADOPTION[sorted[0].id].weekly}%</div>
        </a>
        <a className="tile" href="#/champions">
          <div className="label"><Icon name="group" />Champion coverage</div>
          <div className="value">{CHAMPIONS.length}/{TEAMS.length}</div>
          <div className="foot">sub-teams with a Champion</div>
        </a>
      </div>

      <div className="grid-2" style={{ marginTop: 24 }}>
        <div className="box">
          <div className="box-head">
            <h3>Top of the backlog</h3>
            <a href="#/backlog" style={{ fontSize: 13 }}>All {backlog.length} →</a>
          </div>
          {backlog.slice(0, 5).map((r) => (
            <a key={r.id} href={`#/backlog/${r.id}`} style={{ display: 'grid', gridTemplateColumns: '28px 1fr auto', gap: 10, padding: '10px 0', borderTop: '1px solid var(--border-subtle)', color: 'inherit', textDecoration: 'none' }}>
              <span className="rank">#{r.rank}</span>
              <span style={{ minWidth: 0 }}>
                <span className="strong" style={{ fontWeight: 600, display: 'block' }}>{r.title}</span>
                <span className="labels" style={{ marginTop: 4 }}>
                  <TierLabel tier={r.tier} />
                  <ThemeLabel theme={r.theme.id} />
                </span>
              </span>
              <Score value={r.potential} />
            </a>
          ))}
        </div>
        <div className="box">
          <div className="box-head">
            <h3>Needs your attention</h3>
            <span className="badge badge-danger">{attention.length}</span>
          </div>
          {attention.slice(0, 7).map((a, i) => (
            <a key={i} href={a.href} style={{ display: 'flex', gap: 10, padding: '9px 0', borderTop: '1px solid var(--border-subtle)', color: 'var(--text)', textDecoration: 'none', fontSize: 13 }}>
              <span style={{ color: a.tone }}><Icon name={a.icon} /></span>
              <span>{a.text}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 24 }}>
        <div className="box">
          <div className="box-head">
            <h3>Uneven adoption, by sub-team</h3>
            <span className="subtle" style={{ fontSize: 12 }}>% with a weekly AI workflow · line = {ADOPTION_TARGET}% target</span>
          </div>
          {sorted.map((t) => {
            const v = ADOPTION[t.id].weekly;
            const champ = CHAMPIONS.find((c) => c.team === t.id);
            return (
              <div className="hbar" key={t.id} title={`${t.name}: ${v}% weekly AI use${champ ? ` · Champion ${champ.name}` : ' · no Champion'}`}>
                <span style={{ display: 'flex', gap: 6, alignItems: 'center', minWidth: 0 }}>
                  {champ ? <Avatar name={champ.name} /> : <Avatar name={null} />}
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.short}</span>
                </span>
                <span className="track">
                  <span className="fill" style={{ width: `${v}%`, background: v >= ADOPTION_TARGET ? 'var(--purple-600)' : 'var(--purple-400)' }} />
                  <span className="target" style={{ left: `${ADOPTION_TARGET}%` }} />
                </span>
                <span className="val">{v}%</span>
              </div>
            );
          })}
        </div>
        <div className="box">
          <div className="box-head">
            <h3>Outcomes this half</h3>
            <span className="subtle" style={{ fontSize: 12 }}>weights the triage agent applies</span>
          </div>
          <div className="table-wrap" style={{ border: 0 }}>
            <table className="gl-table">
              <thead>
                <tr><th>Outcome</th><th>Weight</th><th>Open</th><th className="hide-sm">Measured by</th></tr>
              </thead>
              <tbody>
                {OUTCOMES.map((o) => (
                  <tr key={o.id} style={{ cursor: 'default' }}>
                    <td className="cell-title">{o.name}</td>
                    <td className="mono">×{o.weight}</td>
                    <td>{backlog.filter((r) => r.outcome.id === o.id).length}</td>
                    <td className="cell-sub hide-sm">{o.metric}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
