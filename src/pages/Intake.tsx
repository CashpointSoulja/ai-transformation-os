import { useEffect, useState } from 'react';
import { Icon } from '../icons';
import { AgentByline, Breadcrumb, EffortLabel, FactorGrid, PageHead, StatusPill, ThemeLabel, TierLabel, Trace, Avatar } from '../components';
import { ago, go, useStore } from '../store';
import { TEAMS, TEAM_BY_ID, type TeamId } from '../data/org';
import { CHAMPIONS } from '../data/champions';
import { daysSince } from '../data/submissions';

const EXAMPLES: { label: string; team: TeamId; text: string }[] = [
  {
    label: 'Usability synthesis',
    team: 'exp-research',
    text: 'Every sprint I spend about 6 hours turning usability session notes into insights on the study issue. Everyone on the research team does the same thing by hand, and it is tedious.',
  },
  {
    label: 'Roadmap comms',
    team: 'pm-dev',
    text: 'Every month I rebuild a roadmap update for the field from our direction pages and kickoff notes. It takes about 3 hours and every PM in Dev does the same.',
  },
  {
    label: 'Design critique',
    team: 'studio-ai',
    text: 'Our weekly design critiques in the AI studio end with feedback scattered across Figma comments and Slack. Pulling it into the design issue takes 2 hours and often gets skipped.',
  },
  {
    label: 'Broken tool',
    team: 'studio-security',
    text: 'Duo Chat keeps failing with an error when I ask about merge requests in our project. Two of us cannot use it at all this week.',
  },
  {
    label: 'Vague idea',
    team: 'design-strategy',
    text: 'Could AI help with planning our team offsite?',
  },
];

export default function Intake() {
  const { submit, byId, entries } = useStore();
  const [name, setName] = useState('');
  const [team, setTeam] = useState<TeamId>('studio-core');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const champion = CHAMPIONS.find((c) => c.team === team);
  const entry = submitted ? byId[submitted] : undefined;
  const recent = [...entries].sort((a, b) => daysSince(a.sub) - daysSince(b.sub)).slice(0, 6);

  useEffect(() => {
    if (submitted) document.getElementById('analysis')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [submitted]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 20) return;
    setDone(false);
    setSubmitted(submit({ title, text, team, submitter: name }));
  };

  const reset = () => {
    setSubmitted(null);
    setDone(false);
    setTitle('');
    setText('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Breadcrumb items={['Intake']} />
      <PageHead
        title="Raise an AI request"
        sub="Describe a pain point or an idea in plain language. No template, no jargon. The triage agent reads it straight away and puts it on the backlog with its reasoning."
      />

      <div className="intake-grid">
        <form onSubmit={onSubmit} aria-label="AI request" style={{ minWidth: 0 }}>
          <div className="grid-2" style={{ gap: 16 }}>
            <div className="field">
              <label htmlFor="name">Your name</label>
              <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sam Rivera" autoComplete="name" />
            </div>
            <div className="field">
              <label htmlFor="team">Sub-team</label>
              <select id="team" className="select" value={team} onChange={(e) => setTeam(e.target.value as TeamId)}>
                {TEAMS.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="field">
            <label htmlFor="desc">What's slowing you down, or what would you love AI to do?</label>
            <textarea
              id="desc"
              className="textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Say who does it, how often, and how long it takes if you know. For example: “Every release I spend 3 hours copying issue descriptions into release notes…”"
              required
              minLength={20}
            />
            <span className="help">Numbers help the agent size it: how many people, how often, how many hours. If you leave them out, it estimates and tells you so.</span>
          </div>
          <div className="examples" aria-label="Examples">
            <span className="subtle" style={{ fontSize: 12, alignSelf: 'center' }}>Try one:</span>
            {EXAMPLES.map((x) => (
              <button
                type="button"
                className="chip"
                key={x.label}
                onClick={() => {
                  setText(x.text);
                  setTeam(x.team);
                  setTitle('');
                }}
              >
                {x.label}
              </button>
            ))}
          </div>
          <div className="field">
            <label htmlFor="title">
              One-line summary <span className="subtle" style={{ fontWeight: 400 }}>(optional)</span>
            </label>
            <input id="title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="The agent writes one if you leave it blank" />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-confirm" type="submit" disabled={text.trim().length < 20}>
              <Icon name="paper-airplane" />
              Submit for triage
            </button>
            <span className="subtle" style={{ fontSize: 13 }}>
              {champion ? <>Your Champion, {champion.name}, gets a copy.</> : <>{TEAM_BY_ID[team].short} has no Champion yet, so it comes straight to me.</>}
            </span>
          </div>
        </form>

        <aside className="box" style={{ background: 'var(--bg-subtle)', border: 0 }}>
          <h3>How intake works</h3>
          <ol style={{ margin: '8px 0 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
            <li><b>Raise.</b> You describe it here, or your Champion brings it to the fortnightly sync. Either way it lands in one place.</li>
            <li><b>Triage.</b> The agent extracts the workflow, scores volume × frequency × pain, checks the skills library and fleet for something to reuse, and ranks it against this half's outcomes. I review its call.</li>
            <li><b>Scout → Deliver.</b> Now items go to the AI Engineer to prototype, then a small team ships them.</li>
            <li><b>Share.</b> What ships goes on the demo wall and into the skills library, so every team gets it.</li>
          </ol>
          <div className="route-note">
            <Icon name="information-o" />
            <span>Something broken, or need access to a tool? The agent spots platform problems and routes them straight to the Enterprise AI Hub through Compass, so they don't wait in the use-case queue.</span>
          </div>
        </aside>
      </div>

      {entry && (
        <section id="analysis" className="box" style={{ marginTop: 28, borderColor: 'var(--purple-200)' }} aria-label="Triage analysis">
          <div className="box-head" style={{ alignItems: 'flex-start' }}>
            <div>
              <AgentByline>
                <span className="subtle" style={{ fontWeight: 400 }}>· analyzing #{entry.sub.id}</span>
              </AgentByline>
              <div className="strong" style={{ fontWeight: 600, fontSize: 16, marginTop: 4 }}>{entry.triage.title}</div>
            </div>
            {done && <StatusPill status={entry.status} />}
          </div>

          {entry.ranked ? (
            <>
              <Trace steps={entry.ranked.trace} animate onDone={() => setDone(true)} />
              {done && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14, marginTop: 4 }}>
                  <FactorGrid r={entry.ranked} />
                  <div className="labels" style={{ margin: '12px 0' }}>
                    <TierLabel tier={entry.ranked.tier} />
                    <ThemeLabel theme={entry.ranked.theme.id} />
                    <EffortLabel e={entry.ranked.effort.label} />
                    <span className="badge badge-muted">#{entry.ranked.rank} of {Object.values(byId).filter((e) => e.ranked).length}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="btn btn-confirm" onClick={() => go(`/backlog?focus=${entry.sub.id}`)}>
                      See #{entry.sub.id} on the backlog
                    </button>
                    <button className="btn btn-default" onClick={reset}>Submit another</button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="alert alert-tier" style={{ marginTop: 12 }}>
              <Icon name="share" />
              <div className="alert-body">
                <div className="alert-title">Routed to the Enterprise AI Hub</div>
                {entry.rationale}
                <div className="alert-actions">
                  <button className="btn btn-default btn-sm" onClick={() => go('/backlog?tab=hub')}>See routed requests</button>
                  <button className="btn btn-tertiary btn-sm" onClick={reset}>Submit another</button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      <h2 className="section">Recently raised</h2>
      <div className="list">
        {recent.map((e) => (
          <div key={e.sub.id} className="list-row" style={{ gridTemplateColumns: '28px 1fr auto' }} onClick={() => go(`/backlog/${e.sub.id}`)}>
            <Avatar name={e.sub.submitter} />
            <div style={{ minWidth: 0 }}>
              <div className="row-title">{e.triage.title}</div>
              <div className="row-meta">
                #{e.sub.id} · {TEAM_BY_ID[e.sub.team].name} · {e.sub.submitter} · {ago(daysSince(e.sub))}
              </div>
            </div>
            <div className="row-side">
              <StatusPill status={e.status} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
